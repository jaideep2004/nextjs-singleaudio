import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { db } = await connectToDatabase();
    const _id = new ObjectId(id);
    const release = await db.collection('releases').findOne({ _id });
    if (!release) {
      return NextResponse.json({ success: false, error: 'Release not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, release });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to fetch release' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
