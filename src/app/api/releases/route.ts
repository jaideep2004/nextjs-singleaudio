import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '@/utils/mongodb';

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

// ISRC: CC + XXX + YY + NNNNN (2 letters, 3 alnum, 2 digits year, 5 digits).
function generateIsrc(prefixCountry = 'IN', registrant = 'GDS'): string {
  const yy = String(new Date().getFullYear()).slice(-2);
  const serial = randomDigits(5);
  const reg = registrant.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(3, '0').slice(0, 3);
  const cc = prefixCountry.toUpperCase().replace(/[^A-Z]/g, '').padEnd(2, 'X').slice(0, 2);
  return `${cc}${reg}${yy}${serial}`;
}

// POST: Save a new release
export async function POST(req: NextRequest) { 
  try {
    const body = await req.json();
    const autoGenerateCodes = body?.autoGenerateCodes === true;

    if (autoGenerateCodes) {
      if (!body.upc || String(body.upc).trim() === '') {
        body.upc = generateUpcA();
      }

      if (Array.isArray(body.tracks)) {
        body.tracks = body.tracks.map((track: any) => {
          const next = { ...track };
          if (!next.upc || String(next.upc).trim() === '') next.upc = body.upc;
          if (!next.isrc || String(next.isrc).trim() === '') next.isrc = generateIsrc();
          return next;
        });
      }
    }

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
