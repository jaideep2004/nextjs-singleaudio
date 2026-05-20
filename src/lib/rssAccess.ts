export type RssPodcastAccessMode = 'shared' | 'owned';

function normalizeRssEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Comma- or semicolon-separated emails that own the podcast API key / workspace.
 * Those users bypass per-tenant ownership: list all podcasts, open any podcast’s episodes/uploads.
 * Example: RSS_WORKSPACE_SUPERVISOR_EMAILS=admin@singleaudio.com
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

/** Default `owned`: legacy per-user assignment mode. The app now lists the shared podcast workspace to all approved users. */
export function getRssPodcastAccessMode(): RssPodcastAccessMode {
  return process.env.RSS_PODCAST_ACCESS_MODE === 'shared' ? 'shared' : 'owned';
}

/**
 * Any authenticated, KYC-approved podcast user may upload episodes into any workspace podcast.
 * Admin assignment now only scopes subadmin operations, not artist/label episode uploads.
 */
export async function userCanAccessPodcast(
  user: { _id: string; email: string },
  podcastId: number
): Promise<boolean> {
  return Number.isInteger(podcastId) && podcastId > 0 && Boolean(user._id || user.email);
}
