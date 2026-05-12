import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { assignIsrcsToTracks, markIsrcsAssigned } from '@/lib/isrcAllocator';
import { generateUpcA } from '@/lib/upc';
import { createReleaseDeliveryShellJobs } from '@/lib/dspDeliveryShell';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentBackendUser();
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    if (user.role !== 'admin' && !(user.role === 'subadmin' && permissions.includes('review'))) {
      return NextResponse.json({ success: false, error: 'Review permission is required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, reason } = body as { status?: string; reason?: string };

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const update: any = { status, updatedAt: new Date() };
    if (status === 'rejected') update.rejectReason = reason || '';
    if (status !== 'rejected') update.rejectReason = undefined;

    const existing = await db.collection('releases').findOne({ _id });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Release not found' }, { status: 404 });
    }

    if (status === 'approved') {
      const releaseUpc = existing.upc || generateUpcA();
      const tracks = Array.isArray(existing.tracks) ? existing.tracks : [];
      const tracksWithUpc = tracks.map((track: any) => ({
        ...track,
        upc: track?.upc || releaseUpc,
      }));

      const assignedTracks = await assignIsrcsToTracks(db, tracksWithUpc, {
        releaseTitle: existing.releaseTitle,
        source: 'release',
        releaseId: id,
      });

      update.upc = releaseUpc;
      update.tracks = assignedTracks;
      update.codesAssignedAt = existing.codesAssignedAt || new Date();
      await markIsrcsAssigned(
        db,
        assignedTracks.map((track: any) => track.isrc).filter(Boolean),
        id
      );
    }

    const res = await db.collection('releases').findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!res.value) {
      return NextResponse.json({ success: false, error: 'Release not found' }, { status: 404 });
    }

    let deliveryShell = null;
    if (status === 'approved') {
      deliveryShell = await createReleaseDeliveryShellJobs(db, res.value as any, String(user._id));
    }

    return NextResponse.json({ success: true, release: res.value, deliveryShell });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update status' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
