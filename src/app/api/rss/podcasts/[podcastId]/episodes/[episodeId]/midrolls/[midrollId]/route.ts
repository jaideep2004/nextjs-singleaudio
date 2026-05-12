import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { userCanAccessPodcast } from '@/lib/rssAccess';
import { rssApi, RssApiError } from '@/lib/rssApi';

type Params = {
  params: Promise<{ podcastId: string; episodeId: string; midrollId: string }>;
};

const parseStartTimeMs = (value: unknown) => {
  const startTimeMs = Number(value);
  return Number.isFinite(startTimeMs) && startTimeMs >= 0 ? Math.round(startTimeMs) : null;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId, episodeId, midrollId } = await params;

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

    const midroll = await rssApi.updateEpisodeMidroll(podcastId, episodeId, midrollId, {
      start_time_ms: startTimeMs,
    });
    return NextResponse.json({ success: true, data: midroll });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update RSS midroll' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId, episodeId, midrollId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    await rssApi.deleteEpisodeMidroll(podcastId, episodeId, midrollId);
    return NextResponse.json({ success: true, data: { id: Number(midrollId) } });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete RSS midroll' },
      { status: 500 }
    );
  }
}
