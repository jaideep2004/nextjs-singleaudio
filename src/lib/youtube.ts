export const YOUTUBE_VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export const YOUTUBE_CMS_STATUSES = ['not_started', 'processing', 'connected'] as const;

export type YoutubeVerificationStatus = (typeof YOUTUBE_VERIFICATION_STATUSES)[number];
export type YoutubeCmsStatus = (typeof YOUTUBE_CMS_STATUSES)[number];

export type YoutubeWorkflowStatus =
  | 'verification_pending'
  | 'under_review'
  | 'processing'
  | 'connected'
  | 'rejected';

export interface YoutubeChannelCandidate {
  channelId: string;
  channelTitle: string;
  thumbnail: string;
  subscribers: number;
  views: number;
  videos: number;
}

export interface YoutubeChannelView extends YoutubeChannelCandidate {
  id: string;
  googleAccountEmail: string;
  verificationStatus: YoutubeVerificationStatus;
  cmsStatus: YoutubeCmsStatus;
  workflowStatus: YoutubeWorkflowStatus;
  workflowLabel: string;
  connectedAt: string;
  lastSyncedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    artistName?: string;
  };
}

export type YoutubeAdminAction =
  | 'approve'
  | 'reject'
  | 'mark_processing'
  | 'mark_connected';

export function isYoutubeVerificationStatus(value: unknown): value is YoutubeVerificationStatus {
  return typeof value === 'string' && YOUTUBE_VERIFICATION_STATUSES.includes(value as YoutubeVerificationStatus);
}

export function isYoutubeCmsStatus(value: unknown): value is YoutubeCmsStatus {
  return typeof value === 'string' && YOUTUBE_CMS_STATUSES.includes(value as YoutubeCmsStatus);
}

export function getYoutubeWorkflowStatus(
  verificationStatus: YoutubeVerificationStatus,
  cmsStatus: YoutubeCmsStatus
): YoutubeWorkflowStatus {
  if (verificationStatus === 'rejected') return 'rejected';
  if (verificationStatus === 'pending') return 'verification_pending';
  if (cmsStatus === 'connected') return 'connected';
  if (cmsStatus === 'processing') return 'processing';
  return 'under_review';
}

export function getYoutubeWorkflowLabel(
  verificationStatus: YoutubeVerificationStatus,
  cmsStatus: YoutubeCmsStatus
) {
  const status = getYoutubeWorkflowStatus(verificationStatus, cmsStatus);
  const labels: Record<YoutubeWorkflowStatus, string> = {
    verification_pending: 'Verification Pending',
    under_review: 'Under Review',
    processing: 'Processing',
    connected: 'Connected',
    rejected: 'Rejected',
  };
  return labels[status];
}

export function formatYoutubeMetric(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}
