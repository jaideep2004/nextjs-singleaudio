// List of music distribution stores
export const STORES = [
  'Spotify',
  'Apple Music',
  'Amazon Music',
  'YouTube Music',
  'Deezer',
  'Tidal',
  'Pandora',
  'SoundCloud',
  'TikTok',
  'Facebook',
  'Instagram',
  'Triller',
  'Boomplay',
  'Joox',
  'Anghami',
  'NetEase Cloud Music',
  'QQ Music',
];

// Release statuses
export enum ReleaseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Payout statuses
export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Notification types
export enum NotificationType {
  RELEASE_APPROVED = 'release_approved',
  RELEASE_REJECTED = 'release_rejected',
  PAYOUT_APPROVED = 'payout_approved',
  PAYOUT_REJECTED = 'payout_rejected',
  SYSTEM = 'system'
} 