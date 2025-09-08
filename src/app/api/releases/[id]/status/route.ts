import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
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

    const res = await db.collection('releases').findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!res.value) {
      return NextResponse.json({ success: false, error: 'Release not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, release: res.value });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update status' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
