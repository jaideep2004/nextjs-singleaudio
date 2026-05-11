'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { ArrowBack, Album, Lock, Person, RequestQuote } from '@mui/icons-material';
import { adminAPI } from '@/services/api';
import { PremiumHeader, PremiumPanel } from '@/components/premium/PremiumSurface';

export default function UserPreviewPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminAPI.getUserById(params.id);
        if (!response.success) throw new Error(response.message || 'Failed to load user');
        setUser(response.data);
        void fetch(`/api/admin/users/${params.id}/preview-audit`, { method: 'POST' });
        const releaseResponse = await fetch(`/api/releases?userId=${encodeURIComponent(params.id)}`, { cache: 'no-store' });
        const releasePayload = await releaseResponse.json().catch(() => null);
        let allReleases = Array.isArray(releasePayload?.releases) ? releasePayload.releases : [];
        if (allReleases.length === 0) {
          const fallbackResponse = await fetch('/api/releases', { cache: 'no-store' });
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
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      <Alert severity="info" icon={<Lock />} sx={{ mb: 2, borderRadius: 2 }}>
        Read-only admin preview. Create, edit, delete, and payout actions are disabled.
      </Alert>
      <PremiumHeader
        eyebrow="View As User"
        title={user?.artistName || user?.name || 'User Preview'}
        description={`Inspecting ${user?.email || 'user'} profile, catalog, payouts, and account state.`}
        action={<Button component={Link} href={`/admin/users/${params.id}`} variant="outlined" startIcon={<ArrowBack />}>Back</Button>}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        {[
          { icon: <Person />, title: 'Profile', text: `${user?.role || 'artist'} account · ${user?.verification?.status || 'pending'} KYC · ${user?.accountType || 'artist'}` },
          { icon: <Album />, title: 'Releases', text: `${releases.length} matched release${releases.length === 1 ? '' : 's'} by artist/profile name.` },
          { icon: <RequestQuote />, title: 'Payouts', text: user?.payoutMethod?.method ? `Saved method: ${user.payoutMethod.method.replace('_', ' ')}` : 'No saved payout method yet.' },
        ].map((item) => (
          <PremiumPanel key={item.title} sx={{ p: 3, minHeight: 180 }}>
            <Stack spacing={1.5}>
              <Chip icon={item.icon} label={item.title} sx={{ alignSelf: 'flex-start', fontWeight: 800 }} />
              <Typography sx={{ color: 'text.secondary' }}>{item.text}</Typography>
            </Stack>
          </PremiumPanel>
        ))}
      </Box>

      <PremiumPanel sx={{ mt: 2.5, p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Profile Snapshot</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              ['Name', user?.name || '-'],
              ['Email', user?.email || '-'],
              ['Artist / Label', user?.artistName || user?.onboarding?.labelName || '-'],
              ['KYC', user?.verification?.status || 'pending'],
              ['Mobile', user?.verification?.phoneNumber || '-'],
              ['Joined', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'],
            ].map(([label, value]) => (
              <Box key={label} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{label}</Typography>
                <Typography sx={{ fontWeight: 800, wordBreak: 'break-word' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </PremiumPanel>

      <PremiumPanel sx={{ mt: 2.5, p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Release Preview</Typography>
          {releases.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>No releases matched this user profile yet.</Typography>
          ) : (
            releases.slice(0, 8).map((release) => (
              <Box key={release._id} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={release.artworkUrl || undefined} variant="rounded" sx={{ width: 54, height: 54, borderRadius: 2 }}>
                      <Album />
                    </Avatar>
                    <Box>
                    <Typography sx={{ fontWeight: 900 }}>{release.releaseTitle || 'Untitled Release'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {release.primaryArtist || 'Unknown artist'} · {Array.isArray(release.tracks) ? release.tracks.length : 0} tracks
                    </Typography>
                  </Box>
                  </Stack>
                  <Chip label={release.status || 'pending'} size="small" />
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </PremiumPanel>
    </Box>
  );
}
