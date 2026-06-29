'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
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
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SyncIcon from '@mui/icons-material/Sync';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
  config?: {
    baseUrl?: string;
    accountId?: string | number;
    createdCountryId?: string;
  };
  configuredCredentialKeys?: string[];
  missingCredentialKeys?: string[];
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
  externalId?: string;
  lockedBy?: string;
  lockExpiresAt?: string;
  attempts?: Array<{
    attemptNo: number;
    status: string;
    responseCode?: string;
    responseBody?: unknown;
    errorMessage?: string;
    retryable: boolean;
    createdAt: string;
  }>;
  events?: Array<{
    state: string;
    message: string;
    source: string;
    createdAt: string;
  }>;
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

type BromaConfigForm = {
  baseUrl: string;
  accountId: string;
  createdCountryId: string;
  email: string;
  password: string;
  integrationMode: 'sandbox' | 'live';
};

const DEFAULT_BROMA_BASE_URL = 'https://api-rod.broma16.com/api';
const DEFAULT_BROMA_COUNTRY_ID = 'IN';

const formatAttemptResponse = (value: unknown) => {
  if (!value) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return text.length > 900 ? `${text.slice(0, 900)}...` : text;
};

export default function AdminDspDeliveriesPage() {
  const { isAdmin } = useAdminAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState('broma');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingDue, setProcessingDue] = useState(false);
  const [syncingOutlets, setSyncingOutlets] = useState(false);
  const [savingBroma, setSavingBroma] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [bromaForm, setBromaForm] = useState<BromaConfigForm>({
    baseUrl: DEFAULT_BROMA_BASE_URL,
    accountId: '',
    createdCountryId: DEFAULT_BROMA_COUNTRY_ID,
    email: '',
    password: '',
    integrationMode: 'sandbox',
  });
  const notifiedJobErrorsRef = useRef<Set<string>>(new Set());

  const providerMap = useMemo(() => new Map(providers.map((p) => [p.key, p.displayName])), [providers]);
  const bromaProvider = useMemo(() => providers.find((provider) => provider.key === 'broma'), [providers]);
  const bromaCredentialKeys = bromaProvider?.configuredCredentialKeys || [];
  const hasBromaEmail = bromaCredentialKeys.includes('email');
  const hasBromaPassword = bromaCredentialKeys.includes('password');
  const getLatestJobError = (job: DeliveryJob) => {
    if (job.errorMessage) return job.errorMessage;
    const failedAttempt = [...(job.attempts || [])].reverse().find((attempt) => attempt.status === 'failed');
    if (!failedAttempt) return '';
    return failedAttempt.errorMessage || formatAttemptResponse(failedAttempt.responseBody);
  };

  const notifyBromaJobErrors = (nextJobs: DeliveryJob[]) => {
    nextJobs
      .filter((job) => job.providerKey === 'broma' && ['failed', 'needs_attention'].includes(job.state))
      .slice(0, 3)
      .forEach((job) => {
        const message = getLatestJobError(job);
        if (!message) return;
        const key = `${job._id}:${job.retryCount}:${job.state}:${message}`;
        if (notifiedJobErrorsRef.current.has(key)) return;
        notifiedJobErrorsRef.current.add(key);
        toast.error(`Broma delivery issue: ${message.slice(0, 220)}`);
      });
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

      const nextJobs = jobsRes?.data?.data || [];
      setProviders(providerRes?.data || []);
      setJobs(nextJobs);
      notifyBromaJobErrors(nextJobs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load DSP data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, providerFilter, statusFilter]);

  useEffect(() => {
    if (!bromaProvider) return;
    setBromaForm((current) => ({
      ...current,
      baseUrl: String(bromaProvider.config?.baseUrl || current.baseUrl || DEFAULT_BROMA_BASE_URL),
      accountId: bromaProvider.config?.accountId ? String(bromaProvider.config.accountId) : current.accountId,
      createdCountryId: String(bromaProvider.config?.createdCountryId || current.createdCountryId || DEFAULT_BROMA_COUNTRY_ID),
      integrationMode: bromaProvider.integrationMode === 'live' ? 'live' : 'sandbox',
      password: '',
    }));
  }, [bromaProvider]);

  const handleSaveBromaConfig = async () => {
    const baseUrl = bromaForm.baseUrl.trim();
    const accountId = bromaForm.accountId.trim();
    const createdCountryId = bromaForm.createdCountryId.trim() || DEFAULT_BROMA_COUNTRY_ID;
    const email = bromaForm.email.trim();
    const password = bromaForm.password.trim();
    const hasStoredCredentials = hasBromaEmail && hasBromaPassword;
    const credentialsChanged = Boolean(email || password);

    if (!/^https:\/\/|^http:\/\//i.test(baseUrl)) {
      toast.error('Broma base URL must start with http:// or https://');
      return;
    }
    if (!accountId) {
      toast.error('Broma account ID required');
      return;
    }
    if (!hasStoredCredentials && (!email || !password)) {
      toast.error('Broma email and password required for first setup');
      return;
    }
    if (credentialsChanged && (!email || !password)) {
      toast.error('Enter both email and password to update Broma credentials');
      return;
    }

    try {
      setSavingBroma(true);
      const payload: Parameters<typeof adminAPI.registerDspProvider>[0] = {
        key: 'broma',
        displayName: 'Broma',
        enabled: true,
        integrationMode: bromaForm.integrationMode,
        config: {
          baseUrl,
          accountId,
          createdCountryId,
        },
      };
      if (credentialsChanged) {
        payload.credentials = { email, password };
      }

      await adminAPI.registerDspProvider(payload);
      setBromaForm((current) => ({ ...current, password: '' }));
      toast.success('Broma provider saved');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Broma provider save failed');
    } finally {
      setSavingBroma(false);
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

  const handleProcessDue = async () => {
    try {
      setProcessingDue(true);
      const response = await adminAPI.processDueDspDeliveries({ maxJobs: 10 });
      const processedItems = response?.data?.processed || [];
      const processed = processedItems.length || 0;
      const issue = processedItems.find((item: any) => ['failed', 'needs_attention'].includes(item.state) && item.error);
      if (issue?.error) toast.error(`Broma delivery issue: ${String(issue.error).slice(0, 220)}`);
      else toast.success(`Processed ${processed} delivery job${processed === 1 ? '' : 's'}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Worker run failed');
    } finally {
      setProcessingDue(false);
    }
  };

  const handleSyncBromaOutlets = async () => {
    try {
      setSyncingOutlets(true);
      const response = await adminAPI.syncBromaOutlets();
      toast.success(`Synced ${response?.data?.synced || 0} Broma outlet${response?.data?.synced === 1 ? '' : 's'}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Broma outlet sync failed');
    } finally {
      setSyncingOutlets(false);
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
        eyebrow="Broma Delivery Ops"
        title="Mediator Delivery"
        description="Queue release deliveries through Broma, sync outlets, monitor moderation, and retry failed attempts."
        action={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<SyncIcon />} variant="outlined" onClick={handleSyncBromaOutlets} disabled={syncingOutlets}>
              {syncingOutlets ? 'Syncing...' : 'Sync Outlets'}
            </Button>
            <Button startIcon={<PlayArrowIcon />} variant="contained" onClick={handleProcessDue} disabled={processingDue}>
              {processingDue ? 'Processing...' : 'Run Worker'}
            </Button>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
              Refresh
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={800}>
                Configure Broma
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Credentials are encrypted on the backend and never returned to this screen.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={bromaProvider?.enabled ? 'enabled' : 'not enabled'} color={bromaProvider?.enabled ? 'success' : 'default'} />
              <Chip size="small" label={hasBromaEmail ? 'email saved' : 'email missing'} color={hasBromaEmail ? 'success' : 'warning'} variant="outlined" />
              <Chip size="small" label={hasBromaPassword ? 'password saved' : 'password missing'} color={hasBromaPassword ? 'success' : 'warning'} variant="outlined" />
            </Stack>
          </Stack>

          <Alert severity="info">
            Leave password blank to keep existing encrypted credentials. Enter email and password together to replace them.
          </Alert>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <TextField
              label="Base URL"
              value={bromaForm.baseUrl}
              onChange={(e) => setBromaForm((current) => ({ ...current, baseUrl: e.target.value }))}
              fullWidth
              name="bromaBaseUrl"
              autoComplete="off"
              inputProps={{ 'aria-label': 'Broma API base URL' }}
            />
            <TextField
              label="Account ID"
              value={bromaForm.accountId}
              onChange={(e) => setBromaForm((current) => ({ ...current, accountId: e.target.value }))}
              fullWidth
              name="bromaAccountId"
              autoComplete="off"
              inputProps={{ 'aria-label': 'Broma account ID' }}
            />
            <TextField
              label="Created Country ID"
              value={bromaForm.createdCountryId}
              onChange={(e) => setBromaForm((current) => ({ ...current, createdCountryId: e.target.value }))}
              fullWidth
              name="bromaCreatedCountryId"
              autoComplete="off"
              helperText="Default IN. Use Broma dictionary value if your account requires a numeric country id."
              inputProps={{ 'aria-label': 'Broma created country ID' }}
            />
            <FormControl fullWidth>
              <InputLabel id="broma-mode-select">Mode</InputLabel>
              <Select
                labelId="broma-mode-select"
                label="Mode"
                value={bromaForm.integrationMode}
                onChange={(e) =>
                  setBromaForm((current) => ({ ...current, integrationMode: e.target.value as BromaConfigForm['integrationMode'] }))
                }
              >
                <MenuItem value="sandbox">Sandbox</MenuItem>
                <MenuItem value="live">Live</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Broma Email"
              value={bromaForm.email}
              onChange={(e) => setBromaForm((current) => ({ ...current, email: e.target.value }))}
              fullWidth
              type="email"
              name="bromaEmail"
              autoComplete="off"
              placeholder={hasBromaEmail ? 'Saved. Enter only to replace.' : ''}
              inputProps={{ 'aria-label': 'Broma email' }}
            />
            <TextField
              label="Broma Password"
              value={bromaForm.password}
              onChange={(e) => setBromaForm((current) => ({ ...current, password: e.target.value }))}
              fullWidth
              type="password"
              name="bromaPassword"
              autoComplete="new-password"
              placeholder={hasBromaPassword ? 'Saved. Leave blank to keep.' : ''}
              inputProps={{ 'aria-label': 'Broma password' }}
            />
            <Button
              variant="contained"
              onClick={handleSaveBromaConfig}
              disabled={savingBroma}
              sx={{ minWidth: { md: 180 } }}
            >
              {savingBroma ? 'Saving...' : 'Save Broma'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>
              Delivery Jobs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Broma release delivery jobs are shown by default. Legacy per-DSP track jobs stay hidden unless selected.
            </Typography>
          </Box>
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
                <TableCell width={44} />
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
                <Fragment key={job._id}>
                  <TableRow>
                    <TableCell>
                      <Tooltip title={expandedJobId === job._id ? 'Collapse job details' : 'Expand job details'}>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                          aria-label={`${expandedJobId === job._id ? 'Collapse' : 'Expand'} delivery job ${job._id}`}
                        >
                          {expandedJobId === job._id ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
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
                  <TableRow>
                    <TableCell colSpan={9} sx={{ p: 0, borderBottom: expandedJobId === job._id ? undefined : 0 }}>
                      <Collapse in={expandedJobId === job._id} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover' }}>
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
                            <Box>
                              <Typography variant="overline" color="text.secondary">External ID</Typography>
                              <Typography variant="body2">{job.externalId || '-'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="overline" color="text.secondary">Worker</Typography>
                              <Typography variant="body2">{job.lockedBy || '-'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="overline" color="text.secondary">Lock Expires</Typography>
                              <Typography variant="body2">{job.lockExpiresAt ? new Date(job.lockExpiresAt).toLocaleString() : '-'}</Typography>
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="overline" color="text.secondary">Payload Hash</Typography>
                              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{job.metadata?.payloadHash || '-'}</Typography>
                            </Box>
                          </Stack>
                          <Divider sx={{ mb: 2 }} />
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            <Box flex={1} minWidth={0}>
                              <Typography variant="subtitle2" fontWeight={800} mb={1}>Attempts</Typography>
                              <Stack spacing={1}>
                                {(job.attempts || []).slice(-4).map((attempt) => {
                                  const responseBody = formatAttemptResponse(attempt.responseBody);
                                  return (
                                    <Stack key={`${job._id}-attempt-${attempt.attemptNo}`} spacing={0.75}>
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Chip size="small" label={`#${attempt.attemptNo}`} variant="outlined" />
                                        <Chip size="small" label={attempt.status} color={attempt.status === 'success' ? 'success' : 'error'} />
                                        <Typography variant="caption" color="text.secondary">
                                          {attempt.responseCode || attempt.errorMessage || '-'}
                                        </Typography>
                                      </Stack>
                                      {responseBody && (
                                        <Typography
                                          component="pre"
                                          variant="caption"
                                          sx={{
                                            m: 0,
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: 'grey.100',
                                            color: 'text.secondary',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                          }}
                                        >
                                          {responseBody}
                                        </Typography>
                                      )}
                                    </Stack>
                                  );
                                })}
                                {(!job.attempts || job.attempts.length === 0) && (
                                  <Typography variant="caption" color="text.secondary">No attempts yet.</Typography>
                                )}
                              </Stack>
                            </Box>
                            <Box flex={1.4} minWidth={0}>
                              <Typography variant="subtitle2" fontWeight={800} mb={1}>Events</Typography>
                              <Stack spacing={1}>
                                {(job.events || []).slice(-5).map((event, index) => (
                                  <Box key={`${job._id}-event-${index}`}>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(event.createdAt).toLocaleString()} | {event.source} | {event.state}
                                    </Typography>
                                    <Typography variant="body2">{event.message}</Typography>
                                  </Box>
                                ))}
                                {(!job.events || job.events.length === 0) && (
                                  <Typography variant="caption" color="text.secondary">No events yet.</Typography>
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
