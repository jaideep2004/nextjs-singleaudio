import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { enforceMongoRateLimit, RateLimitError } from '@/lib/mongoRateLimit';

const MAX_LIMIT = 250;

type ReleaseTrack = Record<string, any>;

function getClientKey(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function asString(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.map(asString).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function normalizeTrack(release: Record<string, any>, track: ReleaseTrack, index: number) {
  const releaseId = asString(release._id);
  const trackKey = asString(track._id || track.id || track.isrc || `${releaseId}-${index}`);
  const contributors = Array.isArray(track.contributors)
    ? track.contributors
        .map((contributor: any) => `${contributor.role || 'contributor'}:${contributor.name || ''}`)
        .filter(Boolean)
        .join(', ')
    : '';
  const lyricists = Array.isArray(track.contributors)
    ? track.contributors
        .filter((contributor: any) => contributor.role === 'lyricist' && contributor.name)
        .map((contributor: any) => contributor.name)
        .join(', ')
    : '';

  return {
    id: `${releaseId}:${trackKey}`,
    releaseId,
    releaseTitle: asString(release.releaseTitle || release.title),
    releaseType: asString(release.releaseType),
    releaseStatus: asString(release.status),
    releaseDate: asString(release.releaseDate),
    originalReleaseDate: asString(track.originalReleaseDate || release.originalReleaseDate),
    label: asString(release.label),
    releaseUpc: asString(release.upc),
    ownerName: asString(release.ownerName || release.ownerArtistName || release.primaryArtist),
    ownerEmail: asString(release.ownerEmail),
    territories: asString(release.territories),
    stores: asString(release.stores),
    trackNumber: asString(track.trackNumber || index + 1),
    discNumber: asString(track.discNumber || 1),
    title: asString(track.title),
    version: asString(track.version),
    artist: asString(track.artist || release.primaryArtist),
    featuring: asString(track.featuring),
    remixer: asString(track.remixer),
    isrc: asString(track.isrc),
    trackUpc: asString(track.upc),
    duration: asString(track.duration),
    genre: asString(track.genre),
    subgenre: asString(track.subgenre),
    metadataLanguage: asString(track.metadataLanguage),
    audioLanguage: asString(track.audioLanguage || track.language),
    explicit: track.explicit ? 'Yes' : 'No',
    parentalAdvisory: asString(track.parentalAdvisory),
    instrumental: track.instrumental ? 'Yes' : 'No',
    composers: asString(track.composers),
    lyricists: asString(lyricists),
    publishers: asString(track.publishers),
    producers: asString(track.producers),
    copyrightC: asString(track.copyrightC),
    copyrightCYear: asString(track.copyrightCYear),
    copyrightP: asString(track.copyrightP),
    copyrightPYear: asString(track.copyrightPYear),
    recordingYear: asString(track.recordingYear),
    contributors,
    audioFile: asString(track.audioFile),
    audioUrl: asString(track.audioUrl),
    acrState: asString(track.acrCloud?.scanState || track.acrCloud?.state),
    acrSummary: asString(track.acrCloud?.fingerprintMatches?.[0]?.title),
    updatedAt: asString(release.updatedAt),
    createdAt: asString(release.createdAt),
  };
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

    const releases = await db.collection('releases')
      .find({}, {
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

    const rows = releases.flatMap((release) =>
      Array.isArray(release.tracks)
        ? release.tracks.map((track: ReleaseTrack, index: number) => normalizeTrack(release, track, index))
        : []
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

export const dynamic = 'force-dynamic';
