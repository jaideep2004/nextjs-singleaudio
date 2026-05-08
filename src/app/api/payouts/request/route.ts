import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: 'Payout request queued',
    data: {
      id: `demo-${Date.now()}`,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  });
}
