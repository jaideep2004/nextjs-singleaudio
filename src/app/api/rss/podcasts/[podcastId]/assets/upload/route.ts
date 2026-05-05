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

    const formData = await request.formData();
    const assetTypeValue = formData.get('assetType');
    const fileValue = formData.get('file');

    if (assetTypeValue !== 'audio' && assetTypeValue !== 'image') {
      return NextResponse.json(
        { success: false, message: 'assetType must be "audio" or "image"' },
        { status: 400 }
      );
    }

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'A file is required for RSS asset upload' },
        { status: 400 }
      );
    }

    const presignedUpload = await rssApi.createPresignedUpload(podcastId, {
      asset_type: assetTypeValue,
      expected_mime: fileValue.type,
      filename: fileValue.name,
    });

    const fileBuffer = Buffer.from(await fileValue.arrayBuffer());
    const uploadResponse = await fetch(presignedUpload.url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileValue.type || presignedUpload.expected_mime,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `RSS storage upload failed with status ${uploadResponse.status}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: presignedUpload }, { status: 201 });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to upload RSS asset' },
      { status: 500 }
    );
  }
}
