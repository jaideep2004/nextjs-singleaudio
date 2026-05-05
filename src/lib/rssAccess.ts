import { getUserPodcastOwnership } from '@/lib/rssOwnership';

export type RssPodcastAccessMode = 'shared' | 'owned';

function normalizeRssEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Comma- or semicolon-separated emails that own the RSS.com API key / workspace.
 * Those users bypass per-tenant ownership: list all podcasts, open any podcast’s episodes/uploads.
 * Example: RSS_WORKSPACE_SUPERVISOR_EMAILS=shekhtabrej@karharimedia.com
 */
export function getRssWorkspaceSupervisorEmails(): Set<string> {
  const raw = process.env.RSS_WORKSPACE_SUPERVISOR_EMAILS ?? '';
  return new Set(
    raw
      .split(/[,;]/)
      .map((entry) => normalizeRssEmail(entry))
      .filter(Boolean)
  );
}

export function isRssWorkspaceSupervisor(email: string): boolean {
  return getRssWorkspaceSupervisorEmails().has(normalizeRssEmail(email));
}

/** Default `owned`: one podcast per user, list/API filtered by Mongo `rssPodcastOwnership`. Set `RSS_PODCAST_ACCESS_MODE=shared` for a single RSS.com workspace shared by all app users (legacy). */
export function getRssPodcastAccessMode(): RssPodcastAccessMode {
  return process.env.RSS_PODCAST_ACCESS_MODE === 'shared' ? 'shared' : 'owned';
}

/**
 * - `shared` mode: any authenticated user may use any podcast id (single shared workspace).
 * - `owned` mode: user must have `rssPodcastOwnership` for that id, unless they are in `RSS_WORKSPACE_SUPERVISOR_EMAILS`.
 */
export async function userCanAccessPodcast(
  user: { _id: string; email: string },
  podcastId: number
): Promise<boolean> {
  if (getRssPodcastAccessMode() === 'shared') {
    return true;
  }

  if (isRssWorkspaceSupervisor(user.email)) {
    return true;
  }

  const ownership = await getUserPodcastOwnership(user._id);
  return Boolean(ownership && ownership.rssPodcastId === podcastId);
}
