import { NextResponse } from 'next/server';
import { rssApi, RssApiError } from '@/lib/rssApi';

export async function GET() {
  try {
    const categories = await rssApi.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to load RSS podcast categories' },
      { status: 500 }
    );
  }
}
