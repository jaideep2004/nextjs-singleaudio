import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { assignIsrcsToTracks, markIsrcsAssigned } from '@/lib/isrcAllocator';
import { enforceMongoRateLimit, RateLimitError } from '@/lib/mongoRateLimit';
import { getCurrentBackendUser } from '@/lib/currentUser';

function randomDigits(count: number) {
  let out = '';
  for (let i = 0; i < count; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

// UPC-A: 12 digits, last is check digit.
function generateUpcA(): string {
  const base11 = randomDigits(11);
  const digits = base11.split('').map((d) => Number(d));
  const oddSum = digits.filter((_, idx) => idx % 2 === 0).reduce((a, b) => a + b, 0); // positions 1,3,5...
  const evenSum = digits.filter((_, idx) => idx % 2 === 1).reduce((a, b) => a + b, 0);
  const total = oddSum * 3 + evenSum;
  const check = (10 - (total % 10)) % 10;
  return `${base11}${check}`;
}

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
    const { db } = await connectToDatabase();
    await enforceMongoRateLimit(db, {
      key: `POST:/api/releases:${getClientKey(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });

    const body = await req.json();
    const autoGenerateCodes = body?.autoGenerateCodes === true;

    if (autoGenerateCodes) {
      if (!body.upc || String(body.upc).trim() === '') {
        body.upc = generateUpcA();
      }
    }

    if (Array.isArray(body.tracks)) {
      const tracksWithUpc = body.tracks.map((track: any) => {
        const next = { ...track };
        if (autoGenerateCodes && (!next.upc || String(next.upc).trim() === '')) next.upc = body.upc;
        return next;
      });

      body.tracks = await assignIsrcsToTracks(db, tracksWithUpc, {
        releaseTitle: body.releaseTitle,
        source: 'release',
      });
    }

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
    await markIsrcsAssigned(
      db,
      Array.isArray(body.tracks) ? body.tracks.map((track: any) => track.isrc).filter(Boolean) : [],
      result.insertedId.toString()
    );

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
    const isAdminLike = user.role === 'admin' || user.role === 'subadmin';
    const query = isAdminLike
      ? requestedUserId
        ? getReleaseOwnerQuery({ _id: requestedUserId })
        : {}
      : getReleaseOwnerQuery(user);
    const releases = await db.collection('releases').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, releases });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch releases';
    const status = message === 'Authentication required' ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const dynamic = 'force-dynamic';
