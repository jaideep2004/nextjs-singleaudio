'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
  Button,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
  InputAdornment,
  MenuItem,
  Stack,
  TablePagination,
  TextField,
  alpha,
} from '@mui/material';
import {
  Album,
  Link as LinkIcon,
  CheckCircle,
  Pending,
  Cancel,
  MusicNote,
  Search,
  Sync,
  UploadFile,
} from '@mui/icons-material';
import Link from 'next/link';
import { releaseAPI } from '@/services/api';
import { useColorMode } from '@/context/ColorModeContext';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import { useRouter } from 'next/navigation';
import { DspLogo } from '@/components/dsp/DspLogo';
import { getDspDisplayName } from '@/lib/platforms';
import { getNormalizedReleaseStatus, getReleaseStatusLabel } from '@/lib/releaseStatus';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`releases-tabpanel-${index}`}
      aria-labelledby={`releases-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2.5 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `releases-tab-${index}`,
    'aria-controls': `releases-tabpanel-${index}`,
  };
}

export default function AdminReleasesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingExporting, setPendingExporting] = useState(false);
  const [pendingExportMessage, setPendingExportMessage] = useState('');
  const { mode } = useColorMode();

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Set initial tab based on status filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStatusFilter(new URLSearchParams(window.location.search).get('status'));
    }
  }, []);

  useEffect(() => {
    if (statusFilter === 'pending') {
      setTabValue(1);
    } else if (statusFilter === 'in_process') {
      setTabValue(2);
    } else if (statusFilter === 'approved') {
      setTabValue(3);
    } else if (statusFilter === 'rejected') {
      setTabValue(4);
    } else {
      setTabValue(0);
    }
  }, [statusFilter]);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const response = await releaseAPI.getReleases({ summary: '1' });
        if (response && response.success) {
          const data = Array.isArray(response.data) ? response.data : [];
          setReleases(data);
        } else {
          setError('Failed to load releases');
          setReleases([]);
        }
      } catch {
        setError('An error occurred while fetching releases');
        setReleases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 5) {
      router.push('/admin/export');
      return;
    }
    setTabValue(newValue);
    setPage(0);
    const nextStatus = ['', 'pending', 'in_process', 'approved', 'rejected'][newValue];
    setStatusFilter(nextStatus || null);
    router.push(nextStatus ? `/admin/releases?status=${nextStatus}` : '/admin/releases');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTrackCount = (release: any) =>
    Number(release.trackCount ?? (Array.isArray(release.tracks) ? release.tracks.length : 0));
  const getReleaseArtwork = (release: any) =>
    release.artworkUrl || release.artwork || release.coverArt || release.artworkFile || '';
  const pendingCount = releases.filter(r => getNormalizedReleaseStatus(r.status) === 'pending').length;
  const inProcessCount = releases.filter(r => getNormalizedReleaseStatus(r.status) === 'in_process').length;
  const approvedCount = releases.filter(r => getNormalizedReleaseStatus(r.status) === 'approved').length;
  const rejectedCount = releases.filter(r => getNormalizedReleaseStatus(r.status) === 'rejected').length;

  const statusFilteredReleases = useMemo(() => {
    switch (tabValue) {
      case 1: // Pending
        return releases.filter(r => getNormalizedReleaseStatus(r.status) === 'pending');
      case 2: // In Process
        return releases.filter(r => getNormalizedReleaseStatus(r.status) === 'in_process');
      case 3: // Approved
        return releases.filter(r => getNormalizedReleaseStatus(r.status) === 'approved');
      case 4: // Rejected
        return releases.filter(r => getNormalizedReleaseStatus(r.status) === 'rejected');
      default: // All
        return releases;
    }
  }, [releases, tabValue]);

  const releaseTypeOptions = useMemo(() => {
    const values = new Set<string>(['single', 'ep', 'album']);
    releases.forEach((release) => {
      if (release.releaseType || release.type) values.add(String(release.releaseType || release.type).toLowerCase());
    });
    return Array.from(values).sort();
  }, [releases]);

  const filteredReleases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return statusFilteredReleases.filter((release) => {
      const haystack = [
        release.releaseTitle,
        release.title,
        release.primaryArtist,
        release.artist,
        release.label,
        release.upc,
        release.ownerName,
        release.ownerArtistName,
        release.ownerEmail,
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesType = typeFilter === 'all' || String(release.releaseType || release.type || '').toLowerCase() === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, statusFilteredReleases, typeFilter]);

  const paginatedReleases = useMemo(
    () => filteredReleases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredReleases, page, rowsPerPage]
  );

  const resetPage = () => setPage(0);
  const handlePendingExport = async () => {
    try {
      setPendingExporting(true);
      setPendingExportMessage('');
      const response = await fetch('/api/admin/export/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'status',
          statuses: ['pending', 'pending_review'],
          zipGrouping: 'per_release',
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Failed to start pending export');
      }
      setPendingExportMessage('Pending catalog export started. Downloads will appear in Export.');
    } catch (err) {
      setPendingExportMessage(err instanceof Error ? err.message : 'Failed to start pending export');
    } finally {
      setPendingExporting(false);
    }
  };

  const tabItems = [
    { label: 'All', count: releases.length, icon: <Album fontSize="small" />, color: '#5b5ff7' },
    { label: 'Pending', count: pendingCount, icon: <Pending fontSize="small" />, color: '#f59e0b' },
    { label: 'In Process', count: inProcessCount, icon: <Sync fontSize="small" />, color: '#0ea5e9' },
    { label: 'Approved', count: approvedCount, icon: <CheckCircle fontSize="small" />, color: '#10b981' },
    { label: 'Rejected', count: rejectedCount, icon: <Cancel fontSize="small" />, color: '#ef4444' },
    { label: 'Export Catalog', count: null, icon: <UploadFile fontSize="small" />, color: '#0ea5e9' },
  ];

  // Get status chip with proper styling
  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning', icon: <Pending /> },
      in_process: { label: 'In Process', color: 'info', icon: <Sync /> },
      approved: { label: 'Approved', color: 'success', icon: <CheckCircle /> },
      rejected: { label: 'Rejected', color: 'error', icon: <Cancel /> },
    };

    const displayStatus = getNormalizedReleaseStatus(status);
    const config = statusConfig[displayStatus as keyof typeof statusConfig] || {
      label: getReleaseStatusLabel(status),
      color: 'default',
      icon: null,
    };

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color as any}
        size="small"
        sx={{
          minWidth: 90,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    );
  };

  // Render DSP chips with icons
  const renderDSPChips = (stores: string[]) => {
    if (!Array.isArray(stores) || stores.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          N/A
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {stores.slice(0, 3).map((store, index) => {
          const dspName = getDspDisplayName(store);

          return (
            <Tooltip key={`${store}-${index}`} title={dspName}>
              <Box component="span">
                <DspLogo value={store} alt={dspName} size={24} padding={0.25} />
              </Box>
            </Tooltip>
          );
        })}
        {stores.length > 3 && (
          <Chip
            label={`+${stores.length - 3}`}
            size="small"
            sx={{ height: 24, fontSize: '0.7rem' }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <PremiumHeader
        eyebrow="Admin Review"
        title="Release Management"
        description="Review, approve, reject, and inspect delivery-ready releases across all DSPs."
      />

      <Paper
        elevation={0}
        sx={{
          ...premiumSurfaceSx(theme),
          mb: 4,
          padding:"10px"
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="releases tabs"
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{
            px: 1,
            pt: 1,
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 850,
              minHeight: 54,
              borderRadius: 2,
              mx: 0.5,
              color: mode === 'dark' ? 'rgba(255,255,255,0.74)' : 'white',
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
              icon={item.icon}
              iconPosition="start"
              label={item.count === null ? item.label : `${item.label} (${item.count})`}
              {...a11yProps(index)}
              sx={{
                minHeight: 46,
                mx: 0.5,
                mb: 0.75,
                borderRadius: '14px',
                bgcolor: item.color,
                color: '#fff',
                opacity: tabValue === index ? 1 : 0.88,
                boxShadow: tabValue === index ? `0 14px 28px ${alpha(item.color, 0.34)}` : 'none',
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

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ p: 1.5, alignItems: { md: 'center' } }}
        >
          <TextField
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetPage();
            }}
            placeholder="Filter by release, artist, label, UPC..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Type"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              resetPage();
            }}
            size="small"
            sx={{ minWidth: { xs: '100%', md: 170 } }}
          >
            <MenuItem value="all">All types</MenuItem>
            {releaseTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          {tabValue === 1 ? (
            <Button
              variant="contained"
              startIcon={pendingExporting ? <CircularProgress size={16} color="inherit" /> : <UploadFile />}
              onClick={handlePendingExport}
              disabled={pendingExporting}
              sx={{
                minHeight: 40,
                whiteSpace: 'nowrap',
                px: 2,
                bgcolor: '#0ea5e9',
                '&:hover': { bgcolor: '#0284c7' },
              }}
              style={{padding:"10px 20px"}}
            >
              {pendingExporting ? 'Starting' : 'Export Pending'}
            </Button>
          ) : null}
        </Stack>

        {pendingExportMessage ? (
          <Alert
            severity={pendingExportMessage.toLowerCase().includes('started') ? 'success' : 'error'}
            sx={{ mx: 1.5, mb: 1.5 }}
            onClose={() => setPendingExportMessage('')}
          >
            {pendingExportMessage}
          </Alert>
        ) : null}

        <TabPanel value={tabValue} index={0}>
          {renderReleasesTable()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderReleasesTable()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderReleasesTable()}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderReleasesTable()}
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          {renderReleasesTable()}
        </TabPanel>
      </Paper>
    </Box>
  );

  function renderReleasesTable() {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (filteredReleases.length === 0) {
      return (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <MusicNote sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No releases found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {tabValue === 1
              ? 'There are no pending release at the moment.'
              : tabValue === 2
                ? 'No releases are in process at the moment.'
                : tabValue === 3
                  ? 'No releases have been approved yet.'
                  : tabValue === 4
                    ? 'No releases have been rejected.'
                    : 'No releases match your current filters.'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ px: 0 }}>
        {/* Releases Table */}
        <TableContainer
          sx={{
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            borderRadius: '22px',
            overflowX: 'auto',
            bgcolor: mode === 'dark' ? 'rgba(11,16,32,0.32)' : 'rgba(255,255,255,0.72)',
          }}
        >
          <Table size="small" sx={{ minWidth: 1060 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Release</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Artist</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DSPs</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tracks</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReleases.map(release => (
                <TableRow
                  key={release._id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      backgroundColor:
                        mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={getReleaseArtwork(release) || undefined}
                        alt={release.releaseTitle || release.title || 'Release artwork'}
                        variant="rounded"
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 1.5,
                          bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                        }}
                      >
                        <MusicNote sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {release.releaseTitle || release.title || 'Untitled Release'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {release.upc || 'No UPC'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {release.ownerName || release.ownerArtistName || 'Unknown user'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {release.ownerEmail || 'No email'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {release.primaryArtist || 'Unknown Artist'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {release.label || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(release.status)}</TableCell>
                  <TableCell>{renderDSPChips(release.stores || [])}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTrackCount(release)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(release.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      href={`/admin/releases/${release._id}`}
                      size="small"
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      sx={{
                        borderColor:
                          mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                      }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredReleases.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
        />
      </Box>
    );
  }
}
