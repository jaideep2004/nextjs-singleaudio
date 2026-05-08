"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Tab,
  Tabs,
  Button,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faApple,
  faSpotify,
  faYoutube,
  faAmazon,
  faSoundcloud,
  faDeezer,
  faTidal,
  faTiktok,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import {
  Store,
  Album as AlbumIcon,
  CloudUpload,
  ArrowForward,
} from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';

// DSP mapping
const DSP_MAPPING: Record<string, { icon: any; color: string; name: string }> = {
  'Apple Music': { icon: faApple, color: '#fa233b', name: 'Apple Music' },
  'Spotify': { icon: faSpotify, color: '#1db954', name: 'Spotify' },
  'YouTube Music': { icon: faYoutube, color: '#ff0000', name: 'YouTube Music' },
  'Amazon Music': { icon: faAmazon, color: '#ff9900', name: 'Amazon Music' },
  'Tidal': { icon: faTidal, color: '#000000', name: 'Tidal' },
  'Deezer': { icon: faDeezer, color: '#feaa2e', name: 'Deezer' },
  'SoundCloud': { icon: faSoundcloud, color: '#ff7700', name: 'SoundCloud' },
  'TikTok': { icon: faTiktok, color: '#69c9d0', name: 'TikTok' },
  'Facebook': { icon: faFacebook, color: '#1877f2', name: 'Facebook' },
  'Instagram': { icon: faInstagram, color: '#e1306c', name: 'Instagram' },
  'default': { icon: Store, color: '#4a6cf7', name: 'Other' },
};

const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function ReleasesPage() {
  return (
    <AuthGuard>
      <ReleasesContent />
    </AuthGuard>
  );
}

function ReleasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentStatus = searchParams.get('status') || '';

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('/api/releases');
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

  const filteredReleases = currentStatus
    ? releases.filter(r => r.status === currentStatus)
    : releases;

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string; label: string }> = {
      approved: { color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)', label: 'Approved' },
      pending: { color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)', label: 'Pending' },
      rejected: { color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)', label: 'Rejected' },
    };
    const s = map[status] || map.pending;
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
          let dspKey = store;
          if (!DSP_MAPPING[store]) {
            const matchedKey = Object.keys(DSP_MAPPING).find(key =>
              store.toLowerCase().includes(key.toLowerCase()) ||
              key.toLowerCase().includes(store.toLowerCase())
            );
            dspKey = matchedKey || 'default';
          }
          const dsp = DSP_MAPPING[dspKey] || DSP_MAPPING.default;
          const isFAIcon = typeof dsp.icon === 'object' && dsp.icon.hasOwnProperty('iconName');

          return (
            <Tooltip key={i} title={dsp.name}>
              <Avatar
                sx={{
                  width: 22, height: 22,
                  bgcolor: dsp.color, color: '#fff',
                  fontSize: '0.6rem',
                }}
              >
                {isFAIcon ? (
                  <FontAwesomeIcon icon={dsp.icon} style={{ fontSize: '0.6rem', color: '#fff' }} />
                ) : (
                  <Store sx={{ fontSize: '0.6rem', color: '#fff' }} />
                )}
              </Avatar>
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === '') {
      router.push('/dashboard/releases');
    } else {
      router.push(`/dashboard/releases?status=${newValue}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const tabCounts = {
    '': releases.length,
    pending: releases.filter(r => r.status === 'pending').length,
    approved: releases.filter(r => r.status === 'approved').length,
    rejected: releases.filter(r => r.status === 'rejected').length,
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      <PremiumHeader
        eyebrow="Distribution"
        title="Releases"
        description="Manage your release pipeline across drafts, review, approval, delivery, and takedown states."
        action={<Button
          component={Link}
          href="/dashboard/upload"
          variant="contained"
          size="small"
          startIcon={<CloudUpload />}
        >
          New Release
        </Button>}
      />

      {/* Status Tabs */}
      <Box
        sx={{
          mb: 3,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
        }}
      >
        <Tabs
          value={currentStatus}
          onChange={handleTabChange}
          sx={{
            minHeight: 42,
            '& .MuiTab-root': {
              minHeight: 42,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
              '&.Mui-selected': { color: '#4a6cf7' },
            },
            '& .MuiTabs-indicator': {
              height: 2,
              borderRadius: '1px 1px 0 0',
              bgcolor: '#4a6cf7',
            },
          }}
        >
          {statusTabs.map(tab => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {tab.label}
                  <Box
                    sx={{
                      px: 0.75, py: 0.15,
                      borderRadius: '4px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {tabCounts[tab.value as keyof typeof tabCounts]}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

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
            Upload Release
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
              href={`/dashboard/releases/${release._id}`}
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
                  <AlbumIcon sx={{ fontSize: 20 }} />
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
                  {release.tracks?.length || 0}
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
                  {release.releaseType} · {release.tracks?.length || 0} tracks · {formatDate(release.releaseDate)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
