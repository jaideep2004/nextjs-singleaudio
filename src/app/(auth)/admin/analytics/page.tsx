'use client';
import { useEffect, useState } from 'react';
import { Typography, Box, Paper, CircularProgress } from '@mui/material';
import { releaseAPI, trackAPI, adminAPI } from '@/services/api';
import dynamic from 'next/dynamic';
import { registerChartElements } from './registerChartElements';
import { useColorMode } from '@/context/ColorModeContext';
import { PremiumHeader } from '@/components/premium/PremiumSurface';

// Dynamically import react-chartjs-2 components for client-side rendering
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [releaseData, setReleaseData] = useState<any[]>([]);
  const [trackData, setTrackData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const { mode } = useColorMode();
  // Register Chart.js elements only once and mark charts as ready
  useEffect(() => {
    registerChartElements();
    setChartReady(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [releasesRes, tracksRes, usersRes] = await Promise.all([
          releaseAPI.getReleases({ summary: '1' }),
          trackAPI.getTracks(),
          adminAPI.getUsers(),
        ]);
        setReleaseData(releasesRes.data || []);
        setTrackData(tracksRes.data || []);
        setUserData((usersRes.data && (usersRes.data.users || usersRes.data)) || []);
      } catch (e) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare chart data
  const releaseStatusCounts = releaseData.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userRoleCounts = userData.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const releasesPerMonth = (() => {
    const months: Record<string, number> = {};
    releaseData.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months[key] = (months[key] || 0) + 1;
    });
    return months;
  })();

  const tracksPerRelease = releaseData.map(r =>
    Number(r.trackCount ?? (Array.isArray(r.tracks) ? r.tracks.length : 0))
  );

  const chartColors = [
    '#42a5f5',
    '#66bb6a',
    '#ffa726',
    '#ef5350',
    '#ab47bc',
    '#26c6da',
    '#d4e157',
    '#ff7043',
  ];

  const CARD_SIZE = { xs: 320, sm: 380, md: 440 } as const;

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <PremiumHeader
        eyebrow="Intelligence"
        title="Analytics Dashboard"
        description="Premium operating charts for release status, users, monthly volume, and catalog depth."
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !chartReady ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading charts…</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 4,
            justifyItems: 'center',
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 6,
                background: 'linear-gradient(135deg, #42a5f5 0%, #478ed1 100%)',
                width: CARD_SIZE,
                height: CARD_SIZE,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" color="white" gutterBottom sx={{ px: 1 }}>
                Releases by Status
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Pie
                  data={{
                    labels: Object.keys(releaseStatusCounts),
                    datasets: [
                      {
                        data: Object.values(releaseStatusCounts),
                        backgroundColor: chartColors,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: 'white', font: { size: 16 } } },
                      tooltip: { enabled: true },
                    },
                    animation: { animateRotate: true, animateScale: true },
                  }}
                />
              </Box>
            </Paper>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 6,
                background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                width: CARD_SIZE,
                height: CARD_SIZE,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" color="white" gutterBottom sx={{ px: 1 }}>
                User Roles Distribution
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Bar
                  data={{
                    labels: Object.keys(userRoleCounts),
                    datasets: [
                      {
                        label: 'Users',
                        data: Object.values(userRoleCounts),
                        backgroundColor: chartColors,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                    },
                    animation: { duration: 1200, easing: 'easeInOutQuart' },
                    scales: {
                      x: { ticks: { color: 'white' } },
                      y: { ticks: { color: 'white' }, beginAtZero: true },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 6,
                background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                width: CARD_SIZE,
                height: CARD_SIZE,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" color="white" gutterBottom sx={{ px: 1 }}>
                Releases Per Month
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Line
                  data={{
                    labels: Object.keys(releasesPerMonth),
                    datasets: [
                      {
                        label: 'Releases',
                        data: Object.values(releasesPerMonth),
                        fill: true,
                        borderColor: '#fff',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: 'white' } },
                      tooltip: { enabled: true },
                    },
                    animation: { duration: 1200, easing: 'easeInOutQuart' },
                    scales: {
                      x: { ticks: { color: 'white' } },
                      y: { ticks: { color: 'white' }, beginAtZero: true },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 6,
                background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
                width: CARD_SIZE,
                height: CARD_SIZE,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" color="white" gutterBottom sx={{ px: 1 }}>
                Tracks Per Release
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Bar
                  data={{
                    labels: releaseData.map((r, i) => r.releaseTitle || `Release ${i + 1}`),
                    datasets: [
                      {
                        label: 'Tracks',
                        data: tracksPerRelease,
                        backgroundColor: chartColors,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                    },
                    animation: { duration: 1200, easing: 'easeInOutQuart' },
                    scales: {
                      x: { ticks: { color: 'white' } },
                      y: { ticks: { color: 'white' }, beginAtZero: true },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
}
