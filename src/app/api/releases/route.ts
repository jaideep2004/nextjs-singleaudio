import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { enforceMongoRateLimit, RateLimitError } from '@/lib/mongoRateLimit';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { appUrl, sendUserAndAdminEmail } from '@/lib/emailNotifications';

function getClientKey(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getReleaseOwnerQuery(user: { _id: string; name?: string; artistName?: string; email?: string }) {
  const userId = String(user._id);
  const legacyNames = [user.artistName, user.name]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());

  return {
    $or: [
      { userId },
      { artistId: userId },
      { ownerId: userId },
      { createdBy: userId },
      ...legacyNames.flatMap((name) => [
        { primaryArtist: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } },
        { artist: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } },
        { label: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } },
      ]),
    ],
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST: Save a new release
export async function POST(req: NextRequest) { 
  try {
    const user = await getCurrentBackendUser();
    if ((user.role === 'artist' || user.role === 'label') && user.verification?.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'KYC approval is required before submitting releases' },
        { status: 403 }
      );
    }
    const { db } = await connectToDatabase();
    await enforceMongoRateLimit(db, {
      key: `POST:/api/releases:${getClientKey(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });

    const body = await req.json();

    // Insert the release into the 'releases' collection
    const result = await db.collection('releases').insertOne({
      ...body,
      userId: String(user._id),
      artistId: String(user._id),
      ownerEmail: user.email,
      ownerName: user.name,
      ownerArtistName: user.artistName || user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
    });

    void sendUserAndAdminEmail(
      db,
      { name: user.name, email: user.email },
      {
        subject: 'New Release Submitted',
        title: 'Release Submitted',
        intro: `${user.name} submitted a new release for review.`,
        details: {
          Release: body.releaseTitle || body.title || 'Untitled release',
          User: user.name,
          Email: user.email,
          Status: 'pending',
        },
        actionLabel: 'Review Releases',
        actionUrl: appUrl('/admin/releases?status=pending'),
      }
    ).catch((error) => console.warn('Release submission email skipped:', error));

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save release';
    const status = error instanceof RateLimitError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// GET: Fetch all releases (admin/user dashboard)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentBackendUser();
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const summary = searchParams.get('summary') === '1';
    const isAdminLike = user.role === 'admin' || user.role === 'subadmin';
    const query = isAdminLike
      ? requestedUserId
        ? getReleaseOwnerQuery({ _id: requestedUserId })
        : {}
      : getReleaseOwnerQuery(user);
    const releases = summary
      ? await db.collection('releases').aggregate([
          { $match: query },
          { $sort: { createdAt: -1 } },
          {
            $project: {
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
              artist: 1,
              artworkUrl: 1,
              stores: 1,
              updatedAt: 1,
              createdAt: 1,
              trackCount: { $size: { $ifNull: ['$tracks', []] } },
            },
          },
        ]).toArray()
      : await db.collection('releases').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, releases });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch releases';
    const status = message === 'Authentication required' ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const dynamic = 'force-dynamic';
