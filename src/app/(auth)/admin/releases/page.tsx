'use client';
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
  Divider,
  Button,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Link as LinkIcon,
  CheckCircle,
  Pending,
  Cancel,
  MusicNote,
  Store,
  TrendingUp,
} from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faApple, 
  faSpotify, 
  faYoutube, 
  faAmazon, 
  faSoundcloud, 
  faDeezer,
  faTidal,
  faTiktok,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { releaseAPI } from '@/services/api';
import { useColorMode } from '@/context/ColorModeContext';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import { useRouter } from 'next/navigation';

// DSP mapping for better visualization with Font Awesome icons
const DSP_MAPPING: Record<string, { icon: any; color: string; name: string }> = {
  'Apple Music': { icon: faApple, color: '#fa233b', name: 'Apple Music' },
  'Spotify': { icon: faSpotify, color: '#1db954', name: 'Spotify' },
  'YouTube Music': { icon: faYoutube, color: '#ff0000', name: 'YouTube Music' },
  'Amazon Music': { icon: faAmazon, color: '#ff9900', name: 'Amazon Music' },
  'Tidal': { icon: faTidal, color: '#000000', name: 'Tidal' },
  'Deezer': { icon: faDeezer, color: '#feaa2e', name: 'Deezer' },
  'SoundCloud': { icon: faSoundcloud, color: '#ff7700', name: 'SoundCloud' },
  'TikTok': { icon: faTiktok, color: '#69c9d0', name: 'TikTok' },
  'Facebook': { icon: faFacebook, color: '#1877f2', name: 'Facebook' },
  'Instagram': { icon: faInstagram, color: '#e1306c', name: 'Instagram' },
  'default': { icon: Store, color: '#4a6cf7', name: 'Other' },
};

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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
    } else if (statusFilter === 'approved') {
      setTabValue(2);
    } else if (statusFilter === 'rejected') {
      setTabValue(3);
    } else {
      setTabValue(0);
    }
  }, [statusFilter]);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const response = await releaseAPI.getReleases();
        if (response && response.success) {
          let data = Array.isArray(response.data) ? response.data : [];
          setReleases(data);
        } else {
          setError('Failed to load releases');
          setReleases([]);
        }
      } catch (err) {
        setError('An error occurred while fetching releases');
        setReleases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const nextStatus = ['', 'pending', 'approved', 'rejected'][newValue];
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

  // Filter releases based on tab
  const getFilteredReleases = () => {
    switch (tabValue) {
      case 1: // Pending
        return releases.filter(r => r.status === 'pending');
      case 2: // Approved
        return releases.filter(r => r.status === 'approved');
      case 3: // Rejected
        return releases.filter(r => r.status === 'rejected');
      default: // All
        return releases;
    }
  };

  const filteredReleases = getFilteredReleases();
  const pendingCount = releases.filter(r => r.status === 'pending').length;
  const approvedCount = releases.filter(r => r.status === 'approved').length;
  const rejectedCount = releases.filter(r => r.status === 'rejected').length;
  const totalTracks = releases.reduce((sum, release) => sum + (Array.isArray(release.tracks) ? release.tracks.length : 0), 0);
  const approvalRate = releases.length ? Math.round((approvedCount / releases.length) * 100) : 0;
  const maxStatusCount = Math.max(pendingCount, approvedCount, rejectedCount, 1);

  // Get status chip with proper styling
  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning', icon: <Pending /> },
      approved: { label: 'Approved', color: 'success', icon: <CheckCircle /> },
      rejected: { label: 'Rejected', color: 'error', icon: <Cancel /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
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
      return <Typography variant="body2" color="text.secondary">N/A</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {stores.slice(0, 3).map((store, index) => {
          // Try to match store name with our mapping
          let dspKey = store;
          if (!DSP_MAPPING[store]) {
            // Try to find a partial match
            const matchedKey = Object.keys(DSP_MAPPING).find(key => 
              store.toLowerCase().includes(key.toLowerCase()) || 
              key.toLowerCase().includes(store.toLowerCase())
            );
            dspKey = matchedKey || 'default';
          }
          
          const dsp = DSP_MAPPING[dspKey] || DSP_MAPPING.default;
          
          // Check if it's a Font Awesome icon or MUI icon
          const isFAIcon = typeof dsp.icon === 'object' && dsp.icon.hasOwnProperty('iconName');
          
          return (
            <Tooltip key={index} title={dsp.name}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: dsp.color,
                  color: '#fff',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isFAIcon ? (
                  <FontAwesomeIcon 
                    icon={dsp.icon} 
                    style={{ 
                      fontSize: '0.75rem',
                      color: '#fff'
                    }} 
                  />
                ) : (
                  <Store sx={{ fontSize: '0.75rem', color: '#fff' }} />
                )}
              </Avatar>
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
    <Container maxWidth={false} sx={{ py: 1, px: 0 }}>
      <PremiumHeader
        eyebrow="Admin Review"
        title="Release Management"
        description="Review, approve, reject, and inspect delivery-ready releases across all DSPs."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: 'Pipeline Load', value: `${pendingCount} Pending`, accent: '#f5a524', bars: [pendingCount, approvedCount, rejectedCount] },
          { label: 'Approval Rate', value: `${approvalRate}%`, accent: '#21c58b', bars: [approvedCount, Math.max(releases.length - approvedCount, 0)] },
          { label: 'Track Volume', value: `${totalTracks} Tracks`, accent: '#5b5ff7', bars: releases.slice(0, 8).map((release) => Array.isArray(release.tracks) ? release.tracks.length : 0) },
        ].map((metric) => (
          <Paper
            key={metric.label}
            elevation={0}
            sx={{
              ...premiumSurfaceSx(theme),
              p: 2.25,
              borderRadius: '24px',
              minHeight: 126,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={850}>
                  {metric.label}
                </Typography>
                <Typography variant="h5" fontWeight={950} sx={{ mt: 0.5 }}>
                  {metric.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '14px',
                  display: 'grid',
                  placeItems: 'center',
                  color: metric.accent,
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(15,23,42,0.045)',
                }}
              >
                <TrendingUp fontSize="small" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.75, height: 34, mt: 2 }}>
              {(metric.bars.length ? metric.bars : [0]).map((value, index) => (
                <Box
                  key={`${metric.label}-${index}`}
                  sx={{
                    flex: 1,
                    height: `${Math.max(18, Math.round((Number(value) / maxStatusCount) * 34))}px`,
                    borderRadius: '6px 6px 2px 2px',
                    bgcolor: metric.accent,
                    opacity: 0.26 + index * 0.09,
                  }}
                />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          ...premiumSurfaceSx(theme),
          mb: 4
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="releases tabs"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            px: 1,
            pt: 1,
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 54,
              borderRadius: 2,
              mx: 0.5,
              color: mode === 'dark' ? 'rgba(255,255,255,0.74)' : 'rgba(15,23,42,0.72)',
              '&.Mui-selected': {
                color: mode === 'dark' ? '#b7c5ff' : '#2841c6',
                backgroundColor: mode === 'dark' ? 'rgba(120,141,255,0.14)' : 'rgba(74,108,247,0.10)',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 999,
              backgroundColor: mode === 'dark' ? '#9bafff' : '#4a6cf7',
            },
          }}
        >
          <Tab label={`All (${releases.length})`} {...a11yProps(0)} />
          <Tab label={`Pending (${releases.filter(r => r.status === 'pending').length})`} {...a11yProps(1)} />
          <Tab label={`Approved (${releases.filter(r => r.status === 'approved').length})`} {...a11yProps(2)} />
          <Tab label={`Rejected (${releases.filter(r => r.status === 'rejected').length})`} {...a11yProps(3)} />
        </Tabs>

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
      </Paper>
    </Container>
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
              ? 'There are no pending releases at the moment.'
              : tabValue === 2
              ? 'No releases have been approved yet.'
              : tabValue === 3
              ? 'No releases have been rejected.'
              : 'No releases match your current filters.'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        {/* Stats Summary */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700}>
                  {filteredReleases.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Releases
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                backgroundColor: mode === 'dark' ? 'rgba(255, 183, 0, 0.1)' : 'rgba(255, 183, 0, 0.1)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {filteredReleases.filter(r => r.status === 'pending').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                backgroundColor: mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {filteredReleases.filter(r => r.status === 'approved').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                backgroundColor: mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {filteredReleases.filter(r => r.status === 'rejected').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

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
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Release</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Artist</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DSPs</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tracks</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReleases.map((release) => (
                <TableRow
                  key={release._id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
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
                      {Array.isArray(release.tracks) ? release.tracks.length : 0}
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
                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
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
      </Box>
    );
  }
}
