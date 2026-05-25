'use client';

import { Suspense } from 'react';
import { LinearProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { YoutubeAnalyticsPanel } from '@/components/youtube/YoutubeAnalyticsPanel';

function AdminYoutubeNetworkAnalyticsContent() {
  const searchParams = useSearchParams();
  return (
    <YoutubeAnalyticsPanel
      apiPath="/api/admin/youtube/analytics"
      initialChannelId={searchParams.get('channelId') || undefined}
      admin
      showHeader
    />
  );
}

export default function AdminYoutubeNetworkAnalyticsPage() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <AdminYoutubeNetworkAnalyticsContent />
    </Suspense>
  );
}
