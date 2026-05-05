import { NextRequest, NextResponse } from 'next/server';
import { userCanAccessPodcast } from '@/lib/rssAccess';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { rssApi, RssApiError } from '@/lib/rssApi';

type Params = {
  params: Promise<{ podcastId: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      asset_type: 'audio' | 'image';
      expected_mime: string;
      filename: string;
    };

    const upload = await rssApi.createPresignedUpload(podcastId, body);
    return NextResponse.json({ success: true, data: upload }, { status: 201 });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create RSS upload session' },
      { status: 500 }
    );
  }
}
