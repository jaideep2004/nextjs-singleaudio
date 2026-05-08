'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  PlayCircle,
  People,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import AuthGuard from '@/components/AuthGuard';
import { PremiumHeader } from '@/components/premium/PremiumSurface';

// Mock data for analytics
const mockStreamData = {
  '7d': [120, 190, 300, 250, 400, 380, 420],
  '30d': [800, 1200, 950, 1400, 1600, 1300, 1800, 2100, 1900, 2300, 2000, 2400, 2200, 2600, 2500, 2800, 2700, 3000, 2900, 3200, 3100, 3400, 3300, 3600, 3500, 3800, 3700, 4000, 3900, 4200],
  '90d': Array.from({ length: 90 }, (_, i) => Math.floor(800 + Math.random() * 2000 + i * 20)),
};

const mockTopTracks = [
  { title: 'Summer Vibes', streams: 12400, change: 12.5 },
  { title: 'Midnight Run', streams: 8900, change: -3.2 },
  { title: 'Golden Hour', streams: 7200, change: 8.1 },
  { title: 'Neon Dreams', streams: 5600, change: 22.4 },
  { title: 'Ocean Waves', streams: 4100, change: 5.7 },
];

const mockTopCountries = [
  { country: 'India', streams: 18500, pct: 38 },
  { country: 'United States', streams: 9200, pct: 19 },
  { country: 'United Kingdom', streams: 5800, pct: 12 },
  { country: 'Germany', streams: 3400, pct: 7 },
  { country: 'Canada', streams: 2900, pct: 6 },
  { country: 'Others', streams: 8700, pct: 18 },
];

const mockDSPs = [
  { name: 'Spotify', streams: 22000, pct: 45, color: '#1DB954' },
  { name: 'Apple Music', streams: 9800, pct: 20, color: '#FC3C44' },
  { name: 'YouTube Music', streams: 7400, pct: 15, color: '#FF0000' },
  { name: 'Amazon Music', streams: 4900, pct: 10, color: '#25D1DA' },
  { name: 'Others', streams: 4900, pct: 10, color: '#94a3b8' },
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
  const isDark = theme.palette.mode === 'dark';
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const totalStreams = 48900;
  const totalListeners = 12400;
  const avgDaily = Math.floor(totalStreams / 30);

  const kpis = [
    {
      label: 'Total Streams',
      value: totalStreams.toLocaleString(),
      change: '+14.2%',
      positive: true,
      icon: <PlayCircle />,
      color: '#4a6cf7',
    },
    {
      label: 'Unique Listeners',
      value: totalListeners.toLocaleString(),
      change: '+8.7%',
      positive: true,
      icon: <People />,
      color: '#10b981',
    },
    {
      label: 'Avg. Daily Streams',
      value: avgDaily.toLocaleString(),
      change: '+5.1%',
      positive: true,
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
    {
      label: 'Profile Views',
      value: '3,240',
      change: '-2.3%',
      positive: false,
      icon: <Visibility />,
      color: '#8b5cf6',
    },
  ];

  // Simple bar chart using CSS
  const currentData = mockStreamData[period];
  const maxVal = Math.max(...currentData);

  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      <PremiumHeader
        eyebrow="Performance"
        title="Analytics"
        description="Track streams, audience motion, top catalog movement, and platform-level performance."
        action={<Chip
          label="Mock Data"
          size="small"
          sx={{
            bgcolor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
            color: '#f59e0b',
            fontWeight: 600,
            fontSize: '0.72rem',
            border: '1px solid',
            borderColor: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)',
          }}
        />}
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {kpis.map((kpi) => (
          <Box
            key={kpi.label}
            sx={{
              p: 2.5,
              borderRadius: '14px',
              bgcolor: isDark ? '#111827' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  display: 'grid', placeItems: 'center',
                  bgcolor: `${kpi.color}14`,
                  color: kpi.color,
                  '& .MuiSvgIcon-root': { fontSize: 18 },
                }}
              >
                {kpi.icon}
              </Box>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.25,
                  fontSize: '0.72rem', fontWeight: 700,
                  color: kpi.positive ? '#10b981' : '#ef4444',
                }}
              >
                {kpi.positive ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />}
                {kpi.change}
              </Box>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, color: isDark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.02em' }}>
              {kpi.value}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 500, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.45)' }}>
              {kpi.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Streams Chart */}
      <Box
        sx={{
          borderRadius: '14px',
          bgcolor: isDark ? '#111827' : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
          p: 2.5,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Stream Activity
          </Typography>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, val) => val && setPeriod(val)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.5, py: 0.35,
                fontSize: '0.72rem', fontWeight: 600,
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(74,108,247,0.12)' : 'rgba(74,108,247,0.08)',
                  color: '#4a6cf7',
                  borderColor: isDark ? 'rgba(74,108,247,0.3)' : 'rgba(74,108,247,0.2)',
                },
              },
            }}
          >
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* CSS Bar Chart */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: period === '90d' ? '1px' : period === '30d' ? '3px' : '6px',
            height: 180,
            px: 0.5,
          }}
        >
          {currentData.map((val, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                height: `${(val / maxVal) * 100}%`,
                minWidth: 2,
                borderRadius: '3px 3px 0 0',
                bgcolor: isDark ? 'rgba(74, 108, 247, 0.5)' : 'rgba(74, 108, 247, 0.4)',
                transition: 'height 300ms ease, background 150ms ease',
                '&:hover': {
                  bgcolor: '#4a6cf7',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Two-column: Top Tracks + Platforms */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Top Tracks */}
        <Box
          sx={{
            borderRadius: '14px',
            bgcolor: isDark ? '#111827' : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Top Tracks
            </Typography>
          </Box>
          {mockTopTracks.map((track, idx) => (
            <Box
              key={track.title}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.5,
                borderTop: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              }}
            >
              <Typography sx={{ width: 20, fontSize: '0.8rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)', textAlign: 'center' }}>
                {idx + 1}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {track.title}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)' }}>
                  {track.streams.toLocaleString()} streams
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.25,
                  fontSize: '0.72rem', fontWeight: 600,
                  color: track.change >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                {track.change >= 0 ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />}
                {Math.abs(track.change)}%
              </Box>
            </Box>
          ))}
        </Box>

        {/* Platforms / DSPs */}
        <Box
          sx={{
            borderRadius: '14px',
            bgcolor: isDark ? '#111827' : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Streams by Platform
            </Typography>
          </Box>
          {mockDSPs.map((dsp) => (
            <Box
              key={dsp.name}
              sx={{
                px: 2.5, py: 1.5,
                borderTop: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dsp.color }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {dsp.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)' }}>
                  {dsp.streams.toLocaleString()} ({dsp.pct}%)
                </Typography>
              </Box>
              <Box sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${dsp.pct}%`, bgcolor: dsp.color, borderRadius: 2, transition: 'width 500ms ease' }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Top Countries */}
      <Box
        sx={{
          borderRadius: '14px',
          bgcolor: isDark ? '#111827' : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Top Countries
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}>
          {mockTopCountries.map((c, idx) => (
            <Box
              key={c.country}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2.5, py: 1.75,
                borderBottom: '1px solid',
                borderRight: { xs: 'none', sm: idx % 2 === 0 ? '1px solid' : 'none', md: idx % 3 !== 2 ? '1px solid' : 'none' },
                borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {c.country}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.45)' }}>
                  {c.streams.toLocaleString()}
                </Typography>
                <Box
                  sx={{
                    px: 1, py: 0.2, borderRadius: '4px',
                    bgcolor: isDark ? 'rgba(74,108,247,0.1)' : 'rgba(74,108,247,0.06)',
                    color: '#4a6cf7',
                    fontSize: '0.68rem', fontWeight: 700,
                  }}
                >
                  {c.pct}%
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
