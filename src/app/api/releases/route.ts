import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { enforceMongoRateLimit, RateLimitError } from '@/lib/mongoRateLimit';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { appUrl, sendUserAndAdminEmail } from '@/lib/emailNotifications';
import {
  createRelease,
  getReleaseOwnerQuery,
  listReleasesWithTracks,
} from '@/lib/repositories/releases';

function getClientKey(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
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

    const result = await createRelease(db, body, user);

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
    const releases = await listReleasesWithTracks(db, query, { summary });
    return NextResponse.json({ success: true, releases });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch releases';
    const status = message === 'Authentication required' ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const dynamic = 'force-dynamic';
