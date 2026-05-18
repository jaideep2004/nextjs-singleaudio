import { NextRequest, NextResponse } from 'next/server';
import { getRssPodcastAccessMode, isRssWorkspaceSupervisor } from '@/lib/rssAccess';
import { getCurrentBackendUser } from '@/lib/currentUser';
import { rssApi, RssApiError } from '@/lib/rssApi';
import {
  deleteUserPodcastOwnership,
  deleteUserPodcastOwnershipForPodcast,
  getUserPodcastOwnership,
  getUserPodcastOwnerships,
  upsertUserPodcastOwnership,
} from '@/lib/rssOwnership';
import { CreateRssPodcastPayload } from '@/types/rss';
import { connectToDatabase } from '@/utils/mongodb';
import { appUrl, sendUserAndAdminEmail } from '@/lib/emailNotifications';

export async function GET() {
  try {
    const user = await getCurrentBackendUser();
    if ((user.role === 'artist' || user.role === 'label') && user.verification?.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'KYC approval is required before creating podcasts' },
        { status: 403 }
      );
    }
    const accessMode = getRssPodcastAccessMode();
    const workspaceSupervisor = isRssWorkspaceSupervisor(user.email);

    if (accessMode === 'shared' || workspaceSupervisor) {
      const podcasts = await rssApi.getPodcasts();
      return NextResponse.json({
        success: true,
        data: podcasts,
        meta: { accessMode, workspaceSupervisor },
      });
    }

    const ownerships = await getUserPodcastOwnerships(user._id);

    if (ownerships.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { accessMode, workspaceSupervisor: false },
      });
    }

    const podcasts = [];
    for (const ownership of ownerships) {
      try {
        podcasts.push(await rssApi.getPodcast(ownership.rssPodcastId));
      } catch (error) {
        if (error instanceof RssApiError && error.status === 404) {
          // Podcast was deleted on RSS.com side; clear stale local assignment.
          await deleteUserPodcastOwnershipForPodcast(user._id, ownership.rssPodcastId);
          continue;
        }
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      data: podcasts,
      meta: { accessMode, workspaceSupervisor: false },
    });
  } catch (error) {
    if (error instanceof RssApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load RSS podcasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentBackendUser();
    const accessMode = getRssPodcastAccessMode();
    const workspaceSupervisor = isRssWorkspaceSupervisor(user.email);

    if (accessMode === 'owned' && !workspaceSupervisor) {
      const existingOwnership = await getUserPodcastOwnership(user._id);

      if (existingOwnership) {
        // Defensive: allow creation if RSS.com podcast was deleted but our ownership record is stale.
        try {
          await rssApi.getPodcast(existingOwnership.rssPodcastId);
        } catch (error) {
          if (error instanceof RssApiError && error.status === 404) {
            await deleteUserPodcastOwnership(user._id);
          } else {
            throw error;
          }
        }
      }

      const refreshedOwnership = await getUserPodcastOwnership(user._id);
      if (refreshedOwnership) {
        return NextResponse.json(
          {
            success: false,
            message: 'This user already has a podcast. Only one podcast is allowed per account.',
          },
          { status: 409 }
        );
      }
    }

    const payload = (await request.json()) as CreateRssPodcastPayload;

    // Validate required fields before forwarding to RSS.com
    const validationErrors: string[] = [];
    if (!payload.title?.trim()) validationErrors.push('Title is required.');
    if (!payload.description?.trim()) validationErrors.push('Description is required.');
    if (!payload.language) validationErrors.push('Language is required.');
    if (!Array.isArray(payload.itunes_categories_ids) || payload.itunes_categories_ids.length === 0) {
      validationErrors.push('At least one category must be selected.');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: validationErrors.join(' ') },
        { status: 400 }
      );
    }

    const podcast = await rssApi.createPodcast(payload);

    if (accessMode === 'owned' && !workspaceSupervisor) {
      await upsertUserPodcastOwnership(user._id, podcast.id);
    }

    void connectToDatabase()
      .then(({ db }) => sendUserAndAdminEmail(
        db,
        { name: user.name, email: user.email },
        {
          subject: 'Podcast Created',
          title: 'Podcast Created',
          intro: `${user.name} created a podcast workspace.`,
          details: {
            Podcast: payload.title,
            User: user.name,
            Email: user.email,
            CreatedBy: user.role,
          },
          actionLabel: 'Open Podcasts',
          actionUrl: appUrl(user.role === 'admin' || user.role === 'subadmin' ? '/admin/podcasts' : '/dashboard/podcasts'),
        }
      ))
      .catch((error) => console.warn('Podcast creation email skipped:', error));

    return NextResponse.json(
      { success: true, data: podcast, meta: { accessMode, workspaceSupervisor } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RssApiError) {
      // Log the full RSS.com error details server-side for debugging
      console.error('[RSS Podcast POST] RSS API error:', {
        status: error.status,
        message: error.message,
        details: error.details,
      });
      return NextResponse.json(
        { success: false, message: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }

    console.error('[RSS Podcast POST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create RSS podcast' },
      { status: 500 }
    );
  }
}
