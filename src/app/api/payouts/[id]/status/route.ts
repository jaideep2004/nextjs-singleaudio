import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: 'Payout status updated',
    data: {
      id,
      status: body.status || 'pending',
      reason: body.reason,
      updatedAt: new Date().toISOString(),
    },
  });
}
