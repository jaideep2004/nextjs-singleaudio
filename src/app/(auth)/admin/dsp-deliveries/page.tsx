'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ConstructionIcon from '@mui/icons-material/Construction';
import { DspLogo } from '@/components/dsp/DspLogo';
import { getDspDisplayName } from '@/lib/platforms';
import { adminAPI } from '@/services/api';
import useAdminAuth from '@/hooks/useAdminAuth';
import { PremiumHeader } from '@/components/premium/PremiumSurface';
import { toast } from 'sonner';

type Provider = {
  key: string;
  displayName: string;
  enabled?: boolean;
  maintenanceMode?: boolean;
  integrationMode?: 'shell' | 'sandbox' | 'live';
  readiness?: string;
  readinessReport?: {
    state: string;
    missing: string[];
    warnings: string[];
    canDispatch: boolean;
  };
  requirement?: {
    docsStatus: string;
    docsUrl?: string;
    payloadStandard: string;
    readinessChecks: string[];
  };
};

type DeliveryJob = {
  _id: string;
  targetType?: 'track' | 'release';
  releaseId?: string;
  providerKey: string;
  state: string;
  operation: string;
  retryCount: number;
  deadLettered: boolean;
  errorMessage?: string;
  createdAt: string;
  metadata?: {
    releaseTitle?: string;
    payloadHash?: string;
    deliverySnapshot?: {
      upc?: string;
      trackCount?: number;
    };
  };
  trackId?: { title?: string; artistName?: string; isrc?: string };
};

export default function AdminDspDeliveriesPage() {
  const { isAdmin } = useAdminAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackId, setTrackId] = useState('');
  const [providerKey, setProviderKey] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const providerMap = useMemo(() => new Map(providers.map((p) => [p.key, p.displayName])), [providers]);
  const readyProviders = useMemo(
    () => providers.filter((provider) => provider.readinessReport?.canDispatch).length,
    [providers]
  );
  const readinessColor = (state?: string) => {
    if (state === 'live_ready' || state === 'sandbox_ready') return 'success';
    if (state === 'missing_credentials' || state === 'missing_contract') return 'warning';
    if (state === 'paused') return 'default';
    return 'info';
  };

  const load = async () => {
    try {
      setLoading(true);
      const [providerRes, jobsRes] = await Promise.all([
        adminAPI.listDspProviders(),
        adminAPI.listDspDeliveries({
          providerKey: providerFilter !== 'all' ? providerFilter : '',
          state: statusFilter !== 'all' ? statusFilter : '',
          limit: 50,
          page: 1,
        }),
      ]);

      setProviders(providerRes?.data || []);
      setJobs(jobsRes?.data?.data || []);
      if (!providerKey && providerRes?.data?.[0]?.key) {
        setProviderKey(providerRes.data[0].key);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load DSP data');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapPhase1 = async () => {
    try {
      setBootstrapping(true);
      await adminAPI.bootstrapPhase1DspProviders();
      toast.success('Phase-1 providers created');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bootstrap failed');
    } finally {
      setBootstrapping(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, providerFilter, statusFilter]);

  const handleDispatch = async () => {
    if (!trackId.trim() || !providerKey) {
      toast.error('Track ID and provider required');
      return;
    }

    try {
      setDispatching(true);
      await adminAPI.dispatchDspDelivery({
        trackId: trackId.trim(),
        providerKey,
        operation: 'deliver',
      });
      toast.success('Delivery job queued');
      setTrackId('');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await adminAPI.retryDspDelivery(jobId);
      toast.success('Retry queued');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Retry failed');
    }
  };

  if (isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={420}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin === false) {
    return <Alert severity="error">Admin access required</Alert>;
  }

  return (
    <Box>
      <PremiumHeader
        eyebrow="DSP Delivery Ops"
        title="Delivery Matrix"
        description="Queue delivery jobs, monitor status by DSP, and retry failed attempts."
        action={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ConstructionIcon />} variant="outlined" onClick={handleBootstrapPhase1} disabled={bootstrapping}>
              {bootstrapping ? 'Bootstrapping…' : 'Bootstrap Phase 1'}
            </Button>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
              Refresh
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Provider Readiness
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {readyProviders}/{providers.length} dispatch-ready
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['shell_ready', 'missing_contract', 'missing_credentials', 'sandbox_ready', 'live_ready', 'paused'].map((state) => (
              <Chip
                key={state}
                size="small"
                label={`${state}: ${providers.filter((provider) => provider.readiness === state).length}`}
                color={readinessColor(state) as any}
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, overflow: 'hidden' }}>
        <Typography variant="subtitle2" fontWeight={800} mb={1}>
          Provider Shells
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Readiness</TableCell>
              <TableCell>Payload</TableCell>
              <TableCell>Docs</TableCell>
              <TableCell>Missing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.key}>
                <TableCell>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <DspLogo value={provider.key} alt={provider.displayName} size={34} padding={0.35} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {provider.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {provider.key}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={provider.integrationMode || 'shell'} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={provider.readiness || provider.readinessReport?.state || 'unknown'}
                    color={readinessColor(provider.readiness || provider.readinessReport?.state) as any}
                  />
                </TableCell>
                <TableCell>{provider.requirement?.payloadStandard || '-'}</TableCell>
                <TableCell>
                  {provider.requirement?.docsUrl ? (
                    <Link href={provider.requirement.docsUrl} target="_blank" rel="noreferrer" underline="hover">
                      {provider.requirement.docsStatus}
                    </Link>
                  ) : (
                    provider.requirement?.docsStatus || '-'
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <Typography variant="caption" color="text.secondary">
                    {provider.readinessReport?.missing?.length ? provider.readinessReport.missing.join(', ') : '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {providers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No providers bootstrapped.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Track ID"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            fullWidth
            placeholder="Mongo track id…"
            name="trackId"
            autoComplete="off"
            inputProps={{ 'aria-label': 'Track ID' }}
          />
          <FormControl fullWidth>
            <InputLabel id="provider-select">Provider</InputLabel>
            <Select
              labelId="provider-select"
              label="Provider"
              value={providerKey}
              onChange={(e) => setProviderKey(e.target.value)}
            >
              {providers.map((provider) => (
                <MenuItem key={provider.key} value={provider.key}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DspLogo value={provider.key} alt={provider.displayName} size={24} padding={0.25} />
                    <span>{provider.displayName}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleDispatch}
            startIcon={<RocketLaunchIcon />}
            disabled={dispatching}
          >
            Queue Delivery
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="provider-filter">Provider Filter</InputLabel>
            <Select
              labelId="provider-filter"
              label="Provider Filter"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
            >
              <MenuItem value="all">All providers</MenuItem>
              {providers.map((provider) => (
                <MenuItem key={provider.key} value={provider.key}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DspLogo value={provider.key} alt={provider.displayName} size={24} padding={0.25} />
                    <span>{provider.displayName}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-filter">Status Filter</InputLabel>
            <Select
              labelId="status-filter"
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All states</MenuItem>
              <MenuItem value="queued">Queued</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="needs_attention">Needs Attention</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Track</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Retries</TableCell>
                <TableCell>Error</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {job.targetType === 'release'
                        ? job.metadata?.releaseTitle || 'Release delivery'
                        : job.trackId?.title || 'Unknown track'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.targetType === 'release'
                        ? `${job.metadata?.deliverySnapshot?.trackCount || 0} tracks${job.metadata?.deliverySnapshot?.upc ? ` | UPC ${job.metadata.deliverySnapshot.upc}` : ''}`
                        : `${job.trackId?.artistName || 'Unknown artist'} ${job.trackId?.isrc ? `| ${job.trackId.isrc}` : ''}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DspLogo
                        value={job.providerKey}
                        alt={providerMap.get(job.providerKey) || getDspDisplayName(job.providerKey)}
                        size={26}
                        padding={0.25}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {providerMap.get(job.providerKey) || getDspDisplayName(job.providerKey)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{job.operation}</TableCell>
                  <TableCell>
                    <Chip label={job.state} color={job.state === 'delivered' ? 'success' : job.state === 'failed' ? 'error' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>{job.retryCount}</TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="caption" color={job.errorMessage ? 'error.main' : 'text.secondary'}>
                      {job.errorMessage || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!['failed', 'needs_attention'].includes(job.state)}
                      onClick={() => handleRetry(job._id)}
                      startIcon={<ReplayIcon />}
                      aria-label={`Retry delivery job ${job._id}`}
                    >
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No delivery jobs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
