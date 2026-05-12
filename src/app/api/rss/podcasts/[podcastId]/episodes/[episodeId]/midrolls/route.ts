import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { userCanAccessPodcast } from '@/lib/rssAccess';
import { rssApi, RssApiError } from '@/lib/rssApi';

type Params = {
  params: Promise<{ podcastId: string; episodeId: string }>;
};

const parseStartTimeMs = (value: unknown) => {
  const startTimeMs = Number(value);
  return Number.isFinite(startTimeMs) && startTimeMs >= 0 ? Math.round(startTimeMs) : null;
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId, episodeId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    const midrolls = await rssApi.getEpisodeMidrolls(podcastId, episodeId);
    return NextResponse.json({ success: true, data: midrolls });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load RSS midrolls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId, episodeId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    const payload = (await request.json()) as { start_time_ms?: unknown };
    const startTimeMs = parseStartTimeMs(payload.start_time_ms);
    if (startTimeMs === null) {
      return NextResponse.json(
        { success: false, message: 'Enter a valid ad marker time.' },
        { status: 400 }
      );
    }

    const midroll = await rssApi.createEpisodeMidroll(podcastId, episodeId, { start_time_ms: startTimeMs });
    return NextResponse.json({ success: true, data: midroll }, { status: 201 });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create RSS midroll' },
      { status: 500 }
    );
  }
}
