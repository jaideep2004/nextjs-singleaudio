'use client';

import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { Podcasts, ArrowForward } from '@mui/icons-material';
import { PremiumHeader, PremiumPanel } from '@/components/premium/PremiumSurface';

export default function AdminPodcastsPage() {
  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      <PremiumHeader
        eyebrow="Supervisor"
        title="Podcast Operations"
        description="Manage supervised podcast workspaces and episode delivery with focused access."
        action={
          <Button component={Link} href="/dashboard/podcasts" variant="contained" endIcon={<ArrowForward />}>
            Open Podcast Manager
          </Button>
        }
      />
      <PremiumPanel sx={{ p: { xs: 3, md: 4 }, minHeight: 320, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <Box>
          <Podcasts sx={{ fontSize: 58, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Supervisor podcast workspace
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 620 }}>
            Podcast supervisors can use the existing podcast manager while admin-level navigation and permissions stay separate.
          </Typography>
        </Box>
      </PremiumPanel>
    </Box>
  );
}
