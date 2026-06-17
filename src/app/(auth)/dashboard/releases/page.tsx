"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  Chip,
  Skeleton,
  useTheme,
  Button,
} from '@mui/material';
import {
  Album as AlbumIcon,
  CloudUpload,
  ArrowForward,
  EditNote,
} from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import { DspLogo } from '@/components/dsp/DspLogo';
import RouteTabs from '@/components/navigation/RouteTabs';
import { getDspDisplayName } from '@/lib/platforms';
import { useAuth } from '@/context/AppContext';

const RELEASE_DRAFT_PREFIX = 'singleaudio.releaseDraft.v1.';
const RELEASE_DRAFT_BACKUP_KEY = `${RELEASE_DRAFT_PREFIX}latest`;

const getNormalizedReleaseStatus = (status?: string) => {
  if (status === 'pending_review') return 'pending';
  return status || 'pending';
};

const getDraftArtist = (draft: any) => {
  const firstTrack = Array.isArray(draft?.trackInfos) ? draft.trackInfos[0] : null;
  const contributor = Array.isArray(firstTrack?.contributors)
    ? firstTrack.contributors.find((item: any) => item?.role === 'artist' && item?.name)
    : null;
  return contributor?.name || firstTrack?.artist || draft?.primaryArtist || 'Draft artist';
};

const hasDraftContent = (draft: any) =>
  Boolean(
    draft?.releaseTitle ||
      draft?.label ||
      draft?.artworkUploadedUrl ||
      (Array.isArray(draft?.trackInfos) && draft.trackInfos.length > 0) ||
      (Array.isArray(draft?.audioUploadedUrls) && draft.audioUploadedUrls.some(Boolean))
  );

export default function ReleasesPage() {
  return (
    <AuthGuard>
      <ReleasesContent />
    </AuthGuard>
  );
}

function ReleasesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [releases, setReleases] = useState<any[]>([]);
  const [draftReleases, setDraftReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentStatus = searchParams.get('status') || '';

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('/api/releases?summary=1');
        const data = await res.json();
        if (data.success) {
          setReleases(data.releases || data.data || []);
        } else {
          setError(data.error || 'Failed to fetch releases');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) return;
    let cancelled = false;

    const buildDraftRow = (draft: any, key: string) => {
        if (draft?.status !== 'draft' || !hasDraftContent(draft)) return [];
        return [{
          ...draft,
          _id: key,
          status: 'draft',
          isLocalDraft: true,
          primaryArtist: getDraftArtist(draft),
          artworkUrl: draft.artworkUploadedUrl,
          releaseDate: draft.releaseDate || draft.updatedAt,
          stores: draft.selectedDSPs || [],
          trackCount: Math.max(
            Array.isArray(draft.trackInfos) ? draft.trackInfos.length : 0,
            Array.isArray(draft.audioUploadedUrls) ? draft.audioUploadedUrls.length : 0
          ),
        }];
    };

    const loadDrafts = async () => {
      const seenDrafts = new Set<string>();
      const nextDrafts: any[] = [];

      try {
        const response = await fetch('/api/releases/draft', { cache: 'no-store' });
        const payload = await response.json().catch(() => null);
        if (response.ok && payload?.success && payload?.draft) {
          nextDrafts.push(...buildDraftRow(payload.draft, 'server-release-draft'));
          if (!cancelled) setDraftReleases(nextDrafts);
          return;
        }
      } catch {}

      const keys = [`${RELEASE_DRAFT_PREFIX}${user.id}`, RELEASE_DRAFT_BACKUP_KEY, `${RELEASE_DRAFT_PREFIX}anonymous`];
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw || seenDrafts.has(raw)) continue;
        try {
          const draft = JSON.parse(raw);
          seenDrafts.add(raw);
          nextDrafts.push(...buildDraftRow(draft, key));
          if (nextDrafts.length) break;
        } catch {}
      }

      if (!cancelled) setDraftReleases(nextDrafts);
    };

    void loadDrafts();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const catalogReleases = useMemo(
    () => [...draftReleases, ...releases],
    [draftReleases, releases]
  );

  const filteredReleases = currentStatus
    ? catalogReleases.filter(r => getNormalizedReleaseStatus(r.status) === currentStatus)
    : catalogReleases;
  const getTrackCount = (release: any) =>
    Number(release.trackCount ?? (Array.isArray(release.tracks) ? release.tracks.length : 0));

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string; label: string }> = {
      draft: { color: '#94a3b8', bg: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.10)', label: 'Draft' },
      approved: { color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)', label: 'Approved' },
      pending: { color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)', label: 'Pending' },
      rejected: { color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)', label: 'Rejected' },
    };
    const s = map[getNormalizedReleaseStatus(status)] || map.pending;
    return (
      <Box
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.5,
          px: 1.25, py: 0.35, borderRadius: '6px',
          bgcolor: s.bg, color: s.color,
          fontSize: '0.72rem', fontWeight: 600,
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.color }} />
        {s.label}
      </Box>
    );
  };

  const renderDSPIcons = (stores: string[]) => {
    if (!Array.isArray(stores) || stores.length === 0) return null;
    const maxShow = 5;
    const shown = stores.slice(0, maxShow);
    const remaining = stores.length - maxShow;

    return (
      <Box sx={{ display: 'flex', gap: 0.35, alignItems: 'center' }}>
        {shown.map((store, i) => {
          const dspName = getDspDisplayName(store);

          return (
            <Tooltip key={`${store}-${i}`} title={dspName}>
              <Box component="span">
                <DspLogo value={store} alt={dspName} size={22} padding={0.25} />
              </Box>
            </Tooltip>
          );
        })}
        {remaining > 0 && (
          <Typography sx={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)', ml: 0.25 }}>
            +{remaining}
          </Typography>
        )}
      </Box>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const tabCounts = {
    '': catalogReleases.length,
    pending: catalogReleases.filter(r => getNormalizedReleaseStatus(r.status) === 'pending').length,
    approved: catalogReleases.filter(r => getNormalizedReleaseStatus(r.status) === 'approved').length,
    rejected: catalogReleases.filter(r => getNormalizedReleaseStatus(r.status) === 'rejected').length,
    draft: catalogReleases.filter(r => getNormalizedReleaseStatus(r.status) === 'draft').length,
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <PremiumHeader
        eyebrow="Distribution"
        title="Releases"
        description="Manage your release pipeline across drafts, review, approval, delivery, and takedown states."
      />

      <RouteTabs
        ariaLabel="release catalog sections"
        action={
          <Button
            component={Link}
            href="/dashboard/upload"
            variant="contained"
            size="small"
            startIcon={<CloudUpload />}
            sx={{ borderRadius: '12px', fontWeight: 900, minHeight: 40 }}
          >
            New Release
          </Button>
        }
        items={[
          { label: `All (${tabCounts['']})`, href: '/dashboard/releases' },
          { label: `Pending (${tabCounts.pending})`, href: '/dashboard/releases?status=pending' },
          { label: `Approved (${tabCounts.approved})`, href: '/dashboard/releases?status=approved' },
          { label: `Rejected (${tabCounts.rejected})`, href: '/dashboard/releases?status=rejected' },
          { label: `Drafts (${tabCounts.draft})`, href: '/dashboard/releases?status=draft' },
          { label: 'Tracks', href: '/dashboard/tracks' },
        ]}
      />

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '12px' }} />
          ))}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : filteredReleases.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center', py: 6,
            borderRadius: '14px',
            bgcolor: isDark ? '#111827' : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
          }}
        >
          <AlbumIcon sx={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b', mb: 0.5 }}>
            No {currentStatus || ''} releases found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {currentStatus === 'pending' ? 'No releases awaiting review' :
             currentStatus === 'rejected' ? 'No rejected releases' :
             currentStatus === 'draft' ? 'No saved draft releases' :
             'Upload your first release to get started'}
          </Typography>
          <Button
            component={Link}
            href="/dashboard/upload"
            variant="contained"
            size="small"
            startIcon={<CloudUpload />}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4a6cf7 0%, #7b93f9 100%)',
            }}
          >
            Create New Release
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            ...premiumSurfaceSx(theme),
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: '2fr 1fr 0.7fr 1fr 0.8fr',
              gap: 2,
              px: 2.5,
              py: 1.5,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
              borderBottom: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            }}
          >
            {['Release', 'Type / Date', 'Tracks', 'Stores', 'Status'].map(h => (
              <Typography
                key={h}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)',
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>

          {/* Rows */}
          {filteredReleases.map((release, idx) => (
            <Box
              key={release._id || idx}
              component={Link}
              href={release.isLocalDraft ? '/dashboard/upload?draft=1' : `/dashboard/releases/${release._id}`}
              sx={{
                display: { xs: 'flex', md: 'grid' },
                gridTemplateColumns: { md: '2fr 1fr 0.7fr 1fr 0.8fr' },
                flexDirection: { xs: 'column' },
                gap: { xs: 1, md: 2 },
                px: 2.5,
                py: 2,
                alignItems: { md: 'center' },
                textDecoration: 'none',
                color: 'inherit',
                borderTop: idx > 0 ? '1px solid' : 'none',
                borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                transition: 'background 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.015)',
                },
              }}
            >
              {/* Release Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar
                  variant="rounded"
                  src={release.artworkUrl}
                  sx={{
                    width: 44, height: 44,
                    borderRadius: '8px',
                    bgcolor: isDark ? '#1e293b' : '#e2e8f0',
                    flexShrink: 0,
                  }}
                >
                  {release.isLocalDraft ? <EditNote sx={{ fontSize: 20 }} /> : <AlbumIcon sx={{ fontSize: 20 }} />}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 600, fontSize: '0.88rem',
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {release.releaseTitle || 'Untitled Release'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)' }}>
                    {release.primaryArtist || 'Unknown Artist'}
                  </Typography>
                </Box>
              </Box>

              {/* Type / Date */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ fontSize: '0.82rem', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500 }}>
                  {release.releaseType || 'Single'}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)' }}>
                  {formatDate(release.releaseDate)}
                </Typography>
              </Box>

              {/* Tracks */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {getTrackCount(release)}
                </Typography>
              </Box>

              {/* Stores */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {renderDSPIcons(release.stores || [])}
              </Box>

              {/* Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-start' }, gap: 1 }}>
                {getStatusChip(release.status)}
                <ArrowForward sx={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)', display: { xs: 'none', md: 'block' } }} />
              </Box>

              {/* Mobile: extra info */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 2, alignItems: 'center', mt: 0.5 }}>
                <Typography sx={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.45)' }}>
                  {release.releaseType} · {getTrackCount(release)} tracks · {formatDate(release.releaseDate)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
