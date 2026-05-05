import { NextRequest, NextResponse } from 'next/server';
import { userCanAccessPodcast } from '@/lib/rssAccess';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { rssApi, RssApiError } from '@/lib/rssApi';

type Params = {
  params: Promise<{ podcastId: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const podcast = await rssApi.updatePodcast(podcastId, payload);
    return NextResponse.json({ success: true, data: podcast });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update RSS podcast' },
      { status: 500 }
    );
  }
}
