import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '@/utils/mongodb';

// POST: Save a new release
export async function POST(req: NextRequest) { 
  try {
    const body = await req.json();
    const { db } = await connectToDatabase();
    // Insert the release into the 'releases' collection
    const result = await db.collection('releases').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
    });
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Fetch all releases (admin/user dashboard)
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const releases = await db.collection('releases').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, releases });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
