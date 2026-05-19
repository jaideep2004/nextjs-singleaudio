import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/mongodb';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { enforceMongoRateLimit, RateLimitError } from '@/lib/mongoRateLimit';
import {
  PublishingStage,
  asMusicPublishingStage,
  getMusicPublishingTrackKey,
  normalizeMusicPublishingTracks,
} from '@/lib/musicPublishing';

const MAX_LIMIT = 250;

function getClientKey(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getNextStage(action: unknown): PublishingStage | null {
  if (action === 'mark_approved') return 'approved';
  if (action === 'mark_completed') return 'completed';
  return null;
}

function splitTrackId(id: string) {
  const index = id.indexOf(':');
  if (index <= 0 || index === id.length - 1) return null;
  return {
    releaseId: unquoteIdSegment(id.slice(0, index)),
    trackKey: unquoteIdSegment(id.slice(index + 1)),
  };
}

function unquoteIdSegment(value: string) {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : value;
  } catch {
    return value;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentBackendUser();
    if (user.role !== 'admin' && user.role !== 'subadmin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    await enforceMongoRateLimit(db, {
      key: `GET:/api/admin/music-publishing/tracks:${user._id || getClientKey(req)}`,
      limit: 120,
      windowMs: 60 * 1000,
    });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(MAX_LIMIT, Math.max(10, Number(searchParams.get('limit') || 50)));
    const skip = (page - 1) * limit;
    const stage = asMusicPublishingStage(searchParams.get('stage') || 'pending');

    const releases = await db.collection('releases')
      .find({ status: 'approved' }, {
        projection: {
          releaseTitle: 1,
          title: 1,
          releaseType: 1,
          status: 1,
          releaseDate: 1,
          originalReleaseDate: 1,
          label: 1,
          upc: 1,
          ownerName: 1,
          ownerArtistName: 1,
          ownerEmail: 1,
          primaryArtist: 1,
          territories: 1,
          stores: 1,
          tracks: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    const rows = normalizeMusicPublishingTracks(releases).filter(
      (row) => row.publishingStatus === stage
    );

    return NextResponse.json({
      success: true,
      data: {
        tracks: rows.slice(skip, skip + limit),
        page,
        limit,
        total: rows.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load track metadata';
    const status = error instanceof RateLimitError ? error.statusCode : message === 'Authentication required' ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentBackendUser();
    if (user.role !== 'admin' && user.role !== 'subadmin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    await enforceMongoRateLimit(db, {
      key: `PATCH:/api/admin/music-publishing/tracks:${user._id || getClientKey(req)}`,
      limit: 60,
      windowMs: 60 * 1000,
    });

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === 'string')
      : [];
    const nextStage = getNextStage(body?.action);

    if (!ids.length) {
      return NextResponse.json({ success: false, error: 'No tracks selected' }, { status: 400 });
    }
    if (!nextStage) {
      return NextResponse.json({ success: false, error: 'Invalid publishing action' }, { status: 400 });
    }

    const grouped = new Map<string, Set<string>>();
    ids.forEach((id: string) => {
      const parsed = splitTrackId(id);
      if (!parsed) return;
      const keys = grouped.get(parsed.releaseId) || new Set<string>();
      keys.add(parsed.trackKey);
      grouped.set(parsed.releaseId, keys);
    });

    const now = new Date();
    const updatedIds: string[] = [];

    for (const [releaseId, trackKeys] of grouped.entries()) {
      let _id: ObjectId;
      try {
        _id = new ObjectId(releaseId);
      } catch {
        continue;
      }

      const release = await db.collection('releases').findOne(
        { _id },
        { projection: { tracks: 1 } }
      );
      const tracks = Array.isArray(release?.tracks) ? release.tracks : [];
      const changedIds: string[] = [];
      const nextTracks = tracks.map((track: Record<string, any>, index: number) => {
        const trackKey = getMusicPublishingTrackKey(releaseId, track, index);
        if (!trackKeys.has(trackKey)) return track;

        const trackId = `${releaseId}:${trackKey}`;
        changedIds.push(trackId);
        return {
          ...track,
          publishingStatus: nextStage,
          publishingUpdatedAt: now,
          publishingUpdatedBy: String(user._id),
          ...(nextStage === 'approved' ? { publishingExportedAt: now } : {}),
          ...(nextStage === 'completed' ? { publishingCompletedAt: now } : {}),
        };
      });

      if (!changedIds.length) continue;
      updatedIds.push(...changedIds);

      await db.collection('releases').updateOne(
        { _id },
        {
          $set: {
            tracks: nextTracks,
            updatedAt: now,
          },
          $push: {
            adminActions: {
              action: `music_publishing_${nextStage}`,
              at: now,
              adminId: user._id,
              adminEmail: user.email,
              trackIds: changedIds,
            },
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedIds,
        skippedIds: ids.filter((id: string) => !updatedIds.includes(id)),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update publishing tracks';
    const status = error instanceof RateLimitError ? error.statusCode : message === 'Authentication required' ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const dynamic = 'force-dynamic';
