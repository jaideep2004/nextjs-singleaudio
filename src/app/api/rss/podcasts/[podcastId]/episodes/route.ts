import { NextRequest, NextResponse } from 'next/server';
import { userCanAccessPodcast } from '@/lib/rssAccess';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { rssApi, RssApiError } from '@/lib/rssApi';
import {
  listUserEpisodeOwnerships,
  upsertUserEpisodeOwnership,
} from '@/lib/rssOwnership';
import { CreateRssEpisodePayload } from '@/types/rss';

type Params = {
  params: Promise<{ podcastId: string }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentBackendUser();
    const { podcastId } = await params;

    if (!(await userCanAccessPodcast(user, Number(podcastId)))) {
      return NextResponse.json(
        { success: false, message: 'You do not have access to this podcast.' },
        { status: 403 }
      );
    }

    const numericPodcastId = Number(podcastId);
    const episodes = await rssApi.getEpisodes(podcastId);

    if (user.role === 'admin' || user.role === 'subadmin') {
      return NextResponse.json({ success: true, data: episodes });
    }

    const ownerships = await listUserEpisodeOwnerships(user._id, numericPodcastId);
    const ownedEpisodeIds = new Set(ownerships.map((ownership) => ownership.rssEpisodeId));
    const userEpisodes = episodes.filter((episode) => ownedEpisodeIds.has(episode.id));

    return NextResponse.json({ success: true, data: userEpisodes });
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
        message: error instanceof Error ? error.message : 'Failed to load RSS podcast episodes',
      },
      { status: 500 }
    );
  }
}

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

    const numericPodcastId = Number(podcastId);
    const payload = (await request.json()) as CreateRssEpisodePayload;
    const episode = await rssApi.createEpisode(podcastId, payload);

    await upsertUserEpisodeOwnership(user._id, numericPodcastId, episode.id);

    return NextResponse.json({ success: true, data: episode }, { status: 201 });
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
        message: error instanceof Error ? error.message : 'Failed to create RSS podcast episode',
      },
      { status: 500 }
    );
  }
}
