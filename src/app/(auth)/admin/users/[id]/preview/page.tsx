'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Divider, Stack, Typography, useTheme } from '@mui/material';
import { ArrowBack, Album, CheckCircle, Lock, Person, RequestQuote } from '@mui/icons-material';
import { adminAPI } from '@/services/api';
import { PremiumHeader, PremiumPanel, premiumSurfaceSx } from '@/components/premium/PremiumSurface';

export default function UserPreviewPage() {
  const params = useParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [user, setUser] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const surfaceSx = {
    ...premiumSurfaceSx(theme),
    borderRadius: '16px',
    bgcolor: isDark ? '#111827' : '#ffffff',
    backgroundImage: 'none',
    boxShadow: isDark ? '0 18px 44px rgba(0,0,0,0.18)' : '0 18px 44px rgba(15,23,42,0.06)',
  };
  const headingText = isDark ? '#f1f5f9' : '#0f172a';
  const mutedText = isDark ? 'rgba(255,255,255,0.54)' : 'rgba(15,23,42,0.54)';

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getUserById(params.id);
        if (!response.success) throw new Error(response.message || 'Failed to load user');
        setUser(response.data);
        void fetch(`/api/admin/users/${params.id}/preview-audit`, { method: 'POST' });
        const releaseResponse = await fetch(`/api/releases?userId=${encodeURIComponent(params.id)}&summary=1`, { cache: 'no-store' });
        const releasePayload = await releaseResponse.json().catch(() => null);
        let allReleases = Array.isArray(releasePayload?.releases) ? releasePayload.releases : [];
        if (allReleases.length === 0) {
          const fallbackResponse = await fetch('/api/releases?summary=1', { cache: 'no-store' });
          const fallbackPayload = await fallbackResponse.json().catch(() => null);
          allReleases = Array.isArray(fallbackPayload?.releases) ? fallbackPayload.releases : [];
        }
        const userNames = [response.data?.artistName, response.data?.name].filter(Boolean).map((item: string) => item.toLowerCase());
        setReleases(
          allReleases.filter((release: any) =>
            [release.userId, release.artistId, release.ownerId, release.createdBy].some((value) => String(value || '') === String(params.id)) ||
            userNames.some((name: string) => String(release.primaryArtist || release.artist || release.label || '').toLowerCase() === name)
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  if (loading) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 420 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Alert
        severity="info"
        icon={<Lock />}
        sx={{
          mb: 2.5,
          borderRadius: '999px',
          bgcolor: isDark ? 'rgba(14,165,233,0.10)' : 'rgba(236,253,255,0.92)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(125,211,252,0.16)' : 'rgba(14,165,233,0.14)',
          color: isDark ? '#dff6ff' : '#164e63',
          '& .MuiAlert-icon': { color: '#38bdf8' },
        }}
      >
        Read-only admin preview. Create, edit, delete, and payout actions are disabled.
      </Alert>
      <PremiumHeader
        eyebrow="View As User"
        title={user?.artistName || user?.name || 'User Preview'}
        description={`Inspecting ${user?.email || 'user'} profile, catalog, payouts, and account state.`}
        action={
          <Button component={Link} href={`/admin/users/${params.id}`} variant="outlined" startIcon={<ArrowBack />} sx={{ borderRadius: '12px', fontWeight: 900 }}>
            Back
          </Button>
        }
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
        {[
          { icon: <Person />, title: 'Profile', text: `${user?.role || 'artist'} account`, meta: `${user?.verification?.status || 'pending'} KYC · ${user?.accountType || 'artist'}`, color: '#5b5ff7' },
          { icon: <Album />, title: 'Releases', text: `${releases.length} matched`, meta: `release${releases.length === 1 ? '' : 's'} by artist/profile name`, color: '#f59e0b' },
          { icon: <RequestQuote />, title: 'Payouts', text: user?.payoutMethod?.method ? 'Method Saved' : 'No Method', meta: user?.payoutMethod?.method ? user.payoutMethod.method.replace('_', ' ') : 'No saved payout method yet', color: '#10b981' },
        ].map((item) => (
          <Box key={item.title} sx={{ ...surfaceSx, p: 3, minHeight: 170 }}>
            <Stack spacing={1.75}>
              <Avatar sx={{ width: 46, height: 46, borderRadius: '12px', bgcolor: `${item.color}18`, color: item.color }}>
                {item.icon}
              </Avatar>
              <Box>
                <Typography sx={{ color: mutedText, fontSize: '0.78rem', fontWeight: 900 }}>{item.title}</Typography>
                <Typography variant="h5" sx={{ color: headingText, fontWeight: 900, mt: 0.25 }}>{item.text}</Typography>
                <Typography sx={{ color: mutedText, mt: 0.35 }}>{item.meta}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      <PremiumPanel sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: '16px' }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: headingText }}>Profile Snapshot</Typography>
            <Typography sx={{ color: mutedText, mt: 0.5 }}>Core user identity and verification state.</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              ['Name', user?.name || '-'],
              ['Email', user?.email || '-'],
              ['Artist / Label', user?.artistName || user?.onboarding?.labelName || '-'],
              ['KYC', user?.verification?.status || 'pending'],
              ['Mobile', user?.verification?.phoneNumber || '-'],
              ['Joined', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  p: 2.25,
                  borderRadius: '14px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(248,250,252,0.86)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)',
                }}
              >
                <Typography variant="caption" sx={{ color: mutedText, fontWeight: 900 }}>{label}</Typography>
                <Typography sx={{ fontWeight: 900, color: headingText, wordBreak: 'break-word', mt: 0.35 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </PremiumPanel>

      <PremiumPanel sx={{ mt: 2.5, p: { xs: 3, md: 4 }, borderRadius: '16px' }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: headingText }}>Release Preview</Typography>
            <Typography sx={{ color: mutedText, mt: 0.5 }}>Matched catalog entries visible to this account.</Typography>
          </Box>
          <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }} />
          {releases.length === 0 ? (
            <Box sx={{ minHeight: 180, display: 'grid', placeItems: 'center', borderRadius: '14px', border: '1px dashed', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)' }}>
              <Stack alignItems="center" spacing={1}>
                <CheckCircle sx={{ color: '#10b981' }} />
                <Typography sx={{ color: mutedText, fontWeight: 800 }}>No releases matched this user profile yet.</Typography>
              </Stack>
            </Box>
          ) : (
            releases.slice(0, 8).map((release) => (
              <Box
                key={release._id}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                  bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(248,250,252,0.72)',
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={release.artworkUrl || undefined} variant="rounded" sx={{ width: 54, height: 54, borderRadius: 2 }}>
                      <Album />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: headingText }}>{release.releaseTitle || 'Untitled Release'}</Typography>
                      <Typography variant="body2" sx={{ color: mutedText }}>
                        {release.primaryArtist || 'Unknown artist'} · {Array.isArray(release.tracks) ? release.tracks.length : 0} tracks
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip label={release.status || 'pending'} size="small" sx={{ borderRadius: '999px', fontWeight: 900 }} color={release.status === 'approved' ? 'success' : release.status === 'rejected' ? 'error' : 'warning'} />
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </PremiumPanel>
    </Box>
  );
}
