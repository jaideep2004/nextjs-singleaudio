import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { findReleaseByIdWithTracks } from '@/lib/repositories/releases';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function canReadRelease(release: any, user: any) {
  if (user.role === 'admin' || user.role === 'subadmin') return true;
  const userId = String(user._id);
  if ([release.userId, release.artistId, release.ownerId, release.createdBy].some((value) => String(value || '') === userId)) return true;
  const names = [user.artistName, user.name].filter(Boolean).map((value: string) => value.trim());
  return names.some((name) => {
    const pattern = new RegExp(`^${escapeRegex(name)}$`, 'i');
    return pattern.test(String(release.primaryArtist || '')) || pattern.test(String(release.artist || '')) || pattern.test(String(release.label || ''));
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentBackendUser();
    const { db } = await connectToDatabase();
    const release = await findReleaseByIdWithTracks(db, id);
    if (!release) {
      return NextResponse.json({ success: false, error: 'Release not found' }, { status: 404 });
    }
    if (!canReadRelease(release, user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: true, release });
  } catch (e: any) {
    const message = e?.message || 'Failed to fetch release';
    return NextResponse.json({ success: false, error: message }, { status: message === 'Authentication required' ? 401 : 500 });
  }
}

export const dynamic = 'force-dynamic';
