export type ReleaseDisplayStatus = 'pending' | 'in_process' | 'approved' | 'rejected' | 'other';

const IN_PROCESS_RELEASE_STATUSES = new Set([
  'uploading_to_broma',
  'broma_moderation',
  'dsp_processing',
]);

function rawReleaseStatus(status: unknown) {
  return String(status ?? '').trim().toLowerCase();
}

export function getNormalizedReleaseStatus(status: unknown): ReleaseDisplayStatus {
  const value = rawReleaseStatus(status);

  if (!value || value === 'pending' || value === 'pending_review') return 'pending';
  if (IN_PROCESS_RELEASE_STATUSES.has(value)) return 'in_process';
  if (value === 'approved') return 'approved';
  if (value === 'rejected') return 'rejected';

  return 'other';
}

export function getReleaseStatusLabel(status: unknown) {
  const normalized = getNormalizedReleaseStatus(status);

  if (normalized === 'pending') return 'Pending';
  if (normalized === 'in_process') return 'In Process';
  if (normalized === 'approved') return 'Approved';
  if (normalized === 'rejected') return 'Rejected';

  const value = rawReleaseStatus(status);
  return value
    ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Unknown';
}
