'use client';

import { useState } from 'react';
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { PlayCircle, Public, TrendingUp, Visibility } from '@mui/icons-material';
import AuthGuard from '@/components/AuthGuard';
import { PremiumHeader, PremiumMetric, PremiumPanel } from '@/components/premium/PremiumSurface';

const streamData = {
  '7d': [120, 190, 300, 250, 400, 380, 420],
  '30d': [800, 1200, 950, 1400, 1600, 1300, 1800, 2100, 1900, 2300, 2000, 2400, 2200, 2600, 2500, 2800, 2700, 3000, 2900, 3200, 3100, 3400, 3300, 3600, 3500, 3800, 3700, 4000, 3900, 4200],
  '90d': Array.from({ length: 90 }, (_, index) => Math.floor(800 + (index % 9) * 170 + index * 18)),
};

const platforms = [
  { name: 'Spotify', value: 22000, pct: 45, color: '#1DB954' },
  { name: 'Apple Music', value: 9800, pct: 20, color: '#FC3C44' },
  { name: 'YouTube Music', value: 7400, pct: 15, color: '#FF0000' },
  { name: 'Amazon Music', value: 4900, pct: 10, color: '#25D1DA' },
  { name: 'Others', value: 4900, pct: 10, color: '#94a3b8' },
];

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}

function AnalyticsContent() {
  const theme = useTheme();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const isDark = theme.palette.mode === 'dark';
  const currentData = streamData[period];
  const maxValue = Math.max(...currentData);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <PremiumHeader
        eyebrow="DSP Analytics"
        title="Analytics"
        description="Streaming, listener, country, and platform performance across DSP distribution."
        action={
          <ToggleButtonGroup value={period} exclusive size="small" onChange={(_, value) => value && setPeriod(value)}>
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <PremiumMetric label="Total Streams" value="48.9K" hint="Across DSPs" accent="#4a6cf7" />
        <PremiumMetric label="Unique Listeners" value="12.4K" hint="Estimated audience" accent="#10b981" />
        <PremiumMetric label="Avg. Daily Streams" value="1.6K" hint="Current window" accent="#f59e0b" />
        <PremiumMetric label="Profile Views" value="3.2K" hint="DSP profile visits" accent="#8b5cf6" />
      </Box>

      <PremiumPanel sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TrendingUp sx={{ color: '#4a6cf7' }} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Stream Activity</Typography>
          <Chip size="small" label="DSP data" />
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: period === '90d' ? 0.25 : 0.75, height: 210 }}>
          {currentData.map((value, index) => (
            <Box key={index} sx={{ flex: 1, height: `${Math.max(4, (value / maxValue) * 100)}%`, bgcolor: '#4a6cf7', opacity: 0.7, borderRadius: '6px 6px 2px 2px' }} />
          ))}
        </Box>
      </PremiumPanel>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        <PremiumPanel>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <PlayCircle sx={{ color: '#10b981' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Streams by Platform</Typography>
          </Stack>
          <Stack spacing={1.5}>
            {platforms.map((platform) => (
              <Box key={platform.name}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 800 }}>{platform.name}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{platform.value.toLocaleString()} ({platform.pct}%)</Typography>
                </Stack>
                <Box sx={{ mt: 0.7, height: 6, borderRadius: 1, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', overflow: 'hidden' }}>
                  <Box sx={{ width: `${platform.pct}%`, height: 1, bgcolor: platform.color }} />
                </Box>
              </Box>
            ))}
          </Stack>
        </PremiumPanel>
        <PremiumPanel>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Public sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Audience Notes</Typography>
          </Stack>
          <Stack spacing={1.25} sx={{ color: 'text.secondary' }}>
            <Typography><Visibility fontSize="small" /> Top markets and DSP-level breakdowns remain separate from YouTube Network analytics.</Typography>
            <Typography>YouTube creator analytics live under YouTube Network only.</Typography>
          </Stack>
        </PremiumPanel>
      </Box>
    </Box>
  );
}
