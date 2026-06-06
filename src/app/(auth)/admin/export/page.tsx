'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Archive,
  Album,
  Cancel,
  CheckCircle,
  CloudDownload,
  ErrorOutline,
  Inventory2,
  Pending,
  PlayArrow,
  Refresh,
  UploadFile,
} from '@mui/icons-material';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import Link from 'next/link';

type ExportState = 'queued' | 'running' | 'completed' | 'completed_with_warnings' | 'failed';

type ExportPart = {
  name: string;
  type: 'metadata' | 'tracks';
  size: number;
  trackCount: number;
  createdAt: string;
};

type ExportJob = {
  _id: string;
  state: ExportState;
  scope: 'approved';
  counts: {
    releases: number;
    tracks: number;
    files: number;
    missing: number;
    parts: number;
  };
  parts: ExportPart[];
  errors: string[];
  warnings: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
};

const stateColor: Record<ExportState, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  queued: 'default',
  running: 'primary',
  completed: 'success',
  completed_with_warnings: 'warning',
  failed: 'error',
};

const stateLabel: Record<ExportState, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  completed_with_warnings: 'Warnings',
  failed: 'Failed',
};

const numberFormatter = new Intl.NumberFormat();
const byteFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

function formatNumber(value: number | undefined) {
  return numberFormatter.format(Number(value || 0));
}

function formatBytes(value: number | undefined) {
  const bytes = Number(value || 0);
  if (bytes >= 1024 * 1024 * 1024) return `${byteFormatter.format(bytes / (1024 * 1024 * 1024))} GB`;
  if (bytes >= 1024 * 1024) return `${byteFormatter.format(bytes / (1024 * 1024))} MB`;
  if (bytes >= 1024) return `${byteFormatter.format(bytes / 1024)} KB`;
  return `${numberFormatter.format(bytes)} B`;
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function isActiveJob(job?: ExportJob) {
  return !!job && ['queued', 'running'].includes(job.state);
}

export default function AdminExportPage() {
  const theme = useTheme();
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const latestJob = jobs[0];
  const active = isActiveJob(latestJob);

  const loadJobs = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/export/catalog', { cache: 'no-store' });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Failed to load export jobs');
      }

      setJobs(Array.isArray(payload.data?.jobs) ? payload.data.jobs : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load export jobs');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      void loadJobs(true);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [active, loadJobs]);

  const handleCreateExport = async () => {
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/admin/export/catalog', { method: 'POST' });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Failed to start export');
      }
      await loadJobs(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start export');
    } finally {
      setCreating(false);
    }
  };

  const metrics = useMemo(
    () => [
      { label: 'Releases', value: latestJob?.counts.releases || 0, accent: '#5b5ff7' },
      { label: 'Tracks', value: latestJob?.counts.tracks || 0, accent: '#21a67a' },
      { label: 'Files', value: latestJob?.counts.files || 0, accent: '#f5a524' },
      { label: 'Missing', value: latestJob?.counts.missing || 0, accent: '#ef4444' },
    ],
    [latestJob]
  );

  const downloadable = latestJob?.parts?.length ? latestJob.parts : [];
  const tabItems = [
    { label: 'All', href: '/admin/releases', icon: <Album fontSize="small" />, color: '#5b5ff7' },
    { label: 'Pending', href: '/admin/releases?status=pending', icon: <Pending fontSize="small" />, color: '#f59e0b' },
    { label: 'Approved', href: '/admin/releases?status=approved', icon: <CheckCircle fontSize="small" />, color: '#10b981' },
    { label: 'Rejected', href: '/admin/releases?status=rejected', icon: <Cancel fontSize="small" />, color: '#ef4444' },
    { label: 'Export Catalog', href: '/admin/export', icon: <UploadFile fontSize="small" />, color: '#0ea5e9' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
      <PremiumHeader
        eyebrow="Catalog Ops"
        title="Export"
        description="Approved releases, track audio, and metadata."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => loadJobs()}
              disabled={loading || creating}
              sx={{ minHeight: 44 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={creating ? <CircularProgress size={18} color="inherit" /> : <PlayArrow />}
              onClick={handleCreateExport}
              disabled={creating || active}
              sx={{ minHeight: 44 }}
            >
              {creating ? 'Starting…' : active ? 'Export Running…' : 'Create Export'}
            </Button>
          </Stack>
        }
      />

      <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), mb: 4, p: '10px' }}>
        <Tabs
          value={4}
          aria-label="admin release sections"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            pt: 1,
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 850,
              minHeight: 54,
              borderRadius: 2,
              mx: 0.5,
              color: '#fff',
              '&.Mui-selected': {
                color: '#fff',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 999,
              backgroundColor: '#fff',
            },
          }}
        >
          {tabItems.map((item, index) => (
            <Tab
              key={item.label}
              component={Link}
              href={item.href}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              id={`admin-export-tab-${index}`}
              aria-controls={`admin-export-tabpanel-${index}`}
              sx={{
                minHeight: 46,
                mx: 0.5,
                mb: 0.75,
                borderRadius: '14px',
                bgcolor: item.color,
                color: '#fff',
                opacity: index === 4 ? 1 : 0.88,
                boxShadow: index === 4 ? `0 14px 28px ${alpha(item.color, 0.34)}` : 'none',
                transition: 'transform 160ms ease, opacity 160ms ease, box-shadow 160ms ease',
                '&.Mui-selected': {
                  bgcolor: item.color,
                  color: '#fff',
                  opacity: 1,
                },
                '&:hover': {
                  opacity: 1,
                  transform: 'translateY(-1px)',
                },
                '& .MuiTab-iconWrapper': { mr: 0.75 },
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorOutline />}>
          {error}
        </Alert>
      ) : null}

      <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), p: { xs: 2, md: 2.5 }, mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
            <CircularProgress />
          </Box>
        ) : latestJob ? (
          <Stack spacing={2.25}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Chip
                  icon={<Inventory2 />}
                  color={stateColor[latestJob.state]}
                  label={stateLabel[latestJob.state]}
                  sx={{ fontWeight: 800 }}
                />
                <Chip variant="outlined" label={`Scope: ${latestJob.scope}`} />
                <Chip variant="outlined" label={`Expires: ${formatDate(latestJob.expiresAt)}`} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Started {formatDate(latestJob.startedAt || latestJob.createdAt)}
              </Typography>
            </Stack>

            {active ? <LinearProgress aria-label="Catalog export running" /> : null}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                gap: 1.25,
              }}
            >
              {metrics.map((metric) => (
                <Paper
                  key={metric.label}
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.025)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: metric.accent,
                    },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={850}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={950} sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                    {formatNumber(metric.value)}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {latestJob.errors?.length ? (
              <Alert severity="error">
                {latestJob.errors[0]}
              </Alert>
            ) : null}

            {latestJob.counts.missing > 0 ? (
              <Alert severity="warning">
                {formatNumber(latestJob.counts.missing)} files were recorded in the missing-file report.
              </Alert>
            ) : null}
          </Stack>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Archive sx={{ fontSize: 42, color: 'text.secondary', mb: 1 }} />
            <Typography fontWeight={900}>No exports yet</Typography>
            <Typography color="text.secondary" variant="body2">
              Create the first approved catalog export.
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), overflow: 'hidden' }}>
        <Box sx={{ px: 2.25, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={950}>
            ZIP Parts
          </Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="catalog export zip parts" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 850 }}>File</TableCell>
                <TableCell sx={{ fontWeight: 850 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 850 }}>Tracks</TableCell>
                <TableCell sx={{ fontWeight: 850 }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 850 }}>Created</TableCell>
                <TableCell align="right" sx={{ fontWeight: 850 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {downloadable.length ? (
                downloadable.map((part) => (
                  <TableRow key={part.name} hover>
                    <TableCell>
                      <Tooltip title={part.name}>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {part.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={part.type === 'metadata' ? 'Metadata' : 'Tracks'} />
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumber(part.trackCount)}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatBytes(part.size)}
                    </TableCell>
                    <TableCell>{formatDate(part.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        component="a"
                        href={`/api/admin/export/catalog/${latestJob?._id}/files/${encodeURIComponent(part.name)}`}
                        variant="outlined"
                        size="small"
                        startIcon={<CloudDownload />}
                        download
                        sx={{ minHeight: 40 }}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Typography fontWeight={850}>No ZIP parts ready</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Running jobs add files here when each part closes.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
