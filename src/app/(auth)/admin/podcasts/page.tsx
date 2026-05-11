'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { PremiumHeader } from '@/components/premium/PremiumSurface';
import { PodcastsContent } from '@/app/(auth)/dashboard/podcasts/page';

export default function AdminPodcastsPage() {
  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      <PremiumHeader
        eyebrow="Supervisor"
        title="Podcast Operations"
        description="Manage supervised podcast workspaces, publish episodes, and inspect podcast analytics directly."
      />
      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
        <PodcastsContent />
      </Suspense>
    </Box>
  );
}
