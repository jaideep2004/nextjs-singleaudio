import { NextResponse } from 'next/server';
import { fetchBackend } from '@/app/api/_lib/backend';

export async function GET() {
  try {
    const result = await fetchBackend('/api/settings/uploadLimit', {}, { requireAuth: false });
    const data = result.data as {
      success?: boolean;
      data?: { value?: number };
    } | null;

    if (result.ok && data?.success && data.data) {
      const value = Number(data.data.value || 100);
      return NextResponse.json({
        success: true,
        maxUploadSize: Math.min(200, Math.max(1, Number.isFinite(value) ? value : 100)),
      });
    }

    return NextResponse.json({ success: false, maxUploadSize: 100 }, { status: result.status });
  } catch {
    return NextResponse.json({ success: false, maxUploadSize: 100 });
  }
}
