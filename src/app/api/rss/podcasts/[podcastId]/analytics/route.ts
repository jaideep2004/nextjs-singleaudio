import { NextRequest, NextResponse } from 'next/server';
import { userCanAccessPodcast } from '@/lib/rssAccess';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { rssApi, RssApiError } from '@/lib/rssApi';

type Params = {
  params: Promise<{ podcastId: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) query[key] = value;

    const analytics = await rssApi.getPodcastAnalytics(podcastId, query);
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load RSS podcast analytics',
      },
      { status: 500 }
    );
  }
}

