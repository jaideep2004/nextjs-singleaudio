import { NextResponse } from 'next/server';

export async function GET() {
  // Return empty array for now since we don't have a real notifications API
  return NextResponse.json({
    success: true,
    data: []
  });
}
