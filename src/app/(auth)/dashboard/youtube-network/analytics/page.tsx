'use client';

import { Suspense } from 'react';
import { LinearProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { YoutubeAnalyticsPanel } from '@/components/youtube/YoutubeAnalyticsPanel';

function YoutubeNetworkAnalyticsContent() {
  const searchParams = useSearchParams();
  return (
    <YoutubeAnalyticsPanel
      apiPath="/api/youtube/analytics"
      initialChannelId={searchParams.get('channelId') || undefined}
      showHeader
    />
  );
}

export default function YoutubeNetworkAnalyticsPage() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <YoutubeNetworkAnalyticsContent />
    </Suspense>
  );
}
