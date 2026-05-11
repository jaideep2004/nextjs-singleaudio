'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useColorMode } from '@/context/ColorModeContext';
import useAdminAuth from '@/hooks/useAdminAuth';
import { adminAPI, releaseAPI } from '@/services/api';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  useTheme,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import {
  MusicNote,
  Group,
  MonetizationOn,
  Album,
  BarChart,
  PendingActions,
  CheckCircle,
  Cancel,
  ArrowForward,
  type SvgIconComponent,
} from '@mui/icons-material';

interface DashboardStats {
  totalUsers: number;
  totalTracks: number;
  pendingTracks: number;
  pendingPayouts: number;
  totalRevenue: number;
  totalReleases: number;
  pendingReleases: number;
}

interface DashboardUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'artist' | string;
  createdAt: string;
}

interface DashboardRelease {
  _id: string;
  releaseTitle?: string;
  primaryArtist?: string;
  status: 'approved' | 'pending' | 'rejected' | string;
  tracks?: unknown[];
  updatedAt: string;
}

interface DashboardUsersResponse {
  users?: DashboardUser[];
}

interface StatCardConfig {
  label: string;
  value: number;
  icon: SvgIconComponent;
  avatarColor: 'primary' | 'secondary' | 'warning' | 'error';
}

const statGridStyles = {
  display: 'grid',
  gap: 2,
  mb: 3,
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(4, minmax(0, 1fr))',
  },
} as const;

const panelGridStyles = {
  display: 'grid',
  gap: 2.5,
  gridTemplateColumns: {
    xs: '1fr',
    md: 'repeat(2, minmax(0, 1fr))',
  },
} as const;

export default function AdminDashboard() {
  const theme = useTheme();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const { isAdmin, isLoading: isAuthLoading, error: authError } = useAdminAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTracks: 0,
    pendingTracks: 0,
    pendingPayouts: 0,
    totalRevenue: 0,
    totalReleases: 0,
    pendingReleases: 0,
  });
  const [recentUsers, setRecentUsers] = useState<DashboardUser[]>([]);
  const [pendingReleases, setPendingReleases] = useState<DashboardRelease[]>([]);
  const [allReleases, setAllReleases] = useState<DashboardRelease[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    // Only fetch data if admin authentication passed
    if (isAdmin === true) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const defaultStats: DashboardStats = {
        totalUsers: 0,
        totalTracks: 0,
        pendingTracks: 0,
        pendingPayouts: 0,
        totalRevenue: 0,
        totalReleases: 0,
        pendingReleases: 0,
      };

      try {
        const statsResponse = await adminAPI.getDashboardStats();

        if (statsResponse.success && statsResponse.data) {
          setStats({
            ...defaultStats,
            ...statsResponse.data,
          });
        } else {
          setStats(defaultStats);
        }
      } catch (statsError) {
        console.error('Error fetching dashboard stats:', statsError);
        setStats(defaultStats);
      }

      try {
        const usersResponse = await adminAPI.getUsers({ limit: 5, sort: '-createdAt' });

        if (usersResponse.success && usersResponse.data) {
          const users = (usersResponse.data as DashboardUsersResponse).users || [];

          if (Array.isArray(users) && users.length > 0) {
            setRecentUsers(users);
          } else {
            setRecentUsers([]);
          }
        } else {
          setRecentUsers([]);
        }
      } catch (usersError) {
        console.error('Error fetching users:', usersError);
        setRecentUsers([]);
      }

      try {
        const releasesResponse = await releaseAPI.getReleases();
        if (releasesResponse.success && Array.isArray(releasesResponse.data)) {
          const releases = releasesResponse.data as DashboardRelease[];
          setAllReleases(releases);
          setPendingReleases(releases.filter(release => release.status === 'pending'));
        } else {
          setAllReleases([]);
          setPendingReleases([]);
        }
      } catch (releasesError) {
        console.error('Error fetching releases:', releasesError);
        setAllReleases([]);
        setPendingReleases([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      console.error('Error fetching dashboard data:', error);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statCards: StatCardConfig[] = [
    { label: 'Total Users', value: stats.totalUsers, icon: Group, avatarColor: 'primary' },
    { label: 'Total Releases', value: allReleases.length, icon: Album, avatarColor: 'secondary' },
    {
      label: 'Pending Approvals',
      value: stats.pendingReleases,
      icon: PendingActions,
      avatarColor: 'warning',
    },
    {
      label: 'Pending Payouts',
      value: stats.pendingPayouts,
      icon: MonetizationOn,
      avatarColor: 'error',
    },
  ];

  const approvedReleases = allReleases.filter(release => release.status === 'approved').length;
  const rejectedReleases = allReleases.filter(release => release.status === 'rejected').length;
  const reviewLoad =
    allReleases.length > 0 ? Math.round((pendingReleases.length / allReleases.length) * 100) : 0;
  const surfaceSx = {
    ...premiumSurfaceSx(theme),
    borderRadius: '14px',
    bgcolor: isDark ? '#111827' : '#ffffff',
    backgroundImage: 'none',
    boxShadow: isDark ? '0 18px 44px rgba(0,0,0,0.18)' : '0 18px 44px rgba(15,23,42,0.06)',
  };
  const headingText = isDark ? '#f1f5f9' : '#0f172a';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.52)';
  const featureHeadingSx = {
    fontWeight: 900,
    color: headingText,
    letterSpacing: 0,
  };
  const sectionHeadingSx = {
    fontWeight: 700,
    fontSize: '1rem',
    color: headingText,
    letterSpacing: 0,
  };
  const statAccent: Record<StatCardConfig['avatarColor'], { color: string; bg: string }> = {
    primary: { color: '#5b5ff7', bg: isDark ? 'rgba(91,95,247,0.16)' : 'rgba(91,95,247,0.10)' },
    secondary: { color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.10)' },
    warning: { color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.10)' },
    error: { color: '#fb7185', bg: isDark ? 'rgba(251,113,133,0.14)' : 'rgba(251,113,133,0.10)' },
  };

  // Render auth loading state
  if (isAuthLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Verifying admin access...</Typography>
      </Box>
    );
  }

  // Render auth error state
  if (authError) {
    return (
      <Container maxWidth={false}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {authError}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" component={Link} href="/login">
            Back to Login
          </Button>
        </Box>
      </Container>
    );
  }

  // If not admin, don't render anything (redirection happens in hook)
  if (isAdmin === false) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={20} />
        </Box>

        <Box sx={statGridStyles}>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="rounded" height={120} />
          ))}
        </Box>

        <Box sx={panelGridStyles}>
          <Skeleton variant="rounded" height={300} />
          <Skeleton variant="rounded" height={300} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rounded" height={400} />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth={false}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ py: { xs: 0.5, sm: 1 }, pl: { xs: 0, lg: 0 }, pr: 0 }}
    >
      <PremiumHeader
        eyebrow="Admin Command Center"
        title="Admin Dashboard"
        description="Review queues, payout risk, delivery status, and user activity in one focused control room."
        action={
          <Button
            component={Link}
            href="/admin/users/new"
            variant="contained"
            startIcon={<Group />}
            sx={{ borderRadius: '12px', px: 2.5, py: 1.05, fontWeight: 900 }}
          >
            Add User/Subadmin
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.45fr 0.75fr' },
          gap: 2.5,
          mb: 3,
        }}
      >
        <Paper elevation={0} sx={{ ...surfaceSx, p: { xs: 2.5, md: 3.25 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h5" sx={featureHeadingSx}>
                Review Command Center
              </Typography>
              <Typography sx={{ color: mutedText, mt: 0.5, fontSize: '0.98rem' }}>
                Prioritize pending releases before broad catalog browsing.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/admin/releases?status=pending"
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{ borderRadius: '12px', px: 2.5, fontWeight: 900 }}
            >
              Open Queue
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 2.5,
            }}
          >
            {[
              {
                label: 'Pending',
                value: pendingReleases.length,
                icon: <PendingActions />,
                color: '#f59e0b',
              },
              {
                label: 'Approved',
                value: approvedReleases,
                icon: <CheckCircle />,
                color: '#10b981',
              },
              { label: 'Rejected', value: rejectedReleases, icon: <Cancel />, color: '#ef4444' },
            ].map(item => (
              <Box
                key={item.label}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                  p: 2.25,
                  bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(248,250,252,0.72)',
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, color: item.color, mb: 1 }}
                >
                  {item.icon}
                  <Typography sx={{ fontWeight: 900 }}>{item.label}</Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: headingText,
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '2rem',
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 900, color: headingText }}>
                Queue Load
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: reviewLoad > 40 ? 'warning.main' : 'success.main' }}
              >
                {reviewLoad}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={reviewLoad}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: reviewLoad > 40 ? '#f59e0b' : '#10b981',
                },
              }}
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{ ...surfaceSx, p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column' }}
        >
          <Typography sx={{ ...sectionHeadingSx, mb: 2 }}>Fast Actions</Typography>
          <Stack spacing={1.25}>
            {[
              { title: 'Manage Users', icon: <Group />, href: '/admin/users' },
              { title: 'Payout Requests', icon: <MonetizationOn />, href: '/admin/payouts' },
              { title: 'DSP Deliveries', icon: <MusicNote />, href: '/admin/dsp-deliveries' },
              { title: 'Analytics', icon: <BarChart />, href: '/admin/analytics' },
            ].map(item => (
              <Button
                key={item.title}
                component={Link}
                href={item.href}
                variant="outlined"
                startIcon={item.icon}
                endIcon={<ArrowForward />}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: '999px',
                  py: 1.15,
                  px: 2,
                  fontWeight: 900,
                  borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
                  color: '#5b5ff7',
                  '& .MuiButton-endIcon': { ml: 'auto' },
                  '&:hover': {
                    borderColor: '#5b5ff7',
                    bgcolor: isDark ? 'rgba(91,95,247,0.08)' : 'rgba(91,95,247,0.06)',
                  },
                }}
                fullWidth
              >
                {item.title}
              </Button>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Stats Overview */}
      <Box sx={statGridStyles}>
        {statCards.map(({ label, value, icon: Icon, avatarColor }) => {
          const accent = statAccent[avatarColor];
          return (
            <Box
              key={label}
              sx={{
                ...surfaceSx,
                p: { xs: 2.25, md: 2.5 },
                minHeight: 176,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: accent.bg,
                  color: accent.color,
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    mt: 1.75,
                    fontWeight: 900,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    lineHeight: 1,
                    color: headingText,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {value}
                </Typography>
                <Typography
                  sx={{ mt: 0.75, fontSize: '0.85rem', fontWeight: 700, color: mutedText }}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Dashboard Content */}
      <Box sx={panelGridStyles}>
        {/* Recent Users */}
        <Paper
          elevation={0}
          sx={{
            ...surfaceSx,
            p: { xs: 2.5, md: 3 },
            height: '100%',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography sx={sectionHeadingSx}>Recent Users</Typography>
            <Button
              component={Link}
              href="/admin/users"
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                borderRadius: '999px',
                px: 1.75,
                fontWeight: 900,
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
              }}
            >
              View All
            </Button>
          </Box>

          <Divider
            sx={{ mb: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}
          />

          <List sx={{ px: 0, display: 'grid', gap: 1.25 }}>
            {recentUsers.length > 0 ? (
              recentUsers.map(user => (
                <ListItem
                  key={user._id}
                  sx={{
                    px: 1.5,
                    py: 1.35,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)',
                    bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(248,250,252,0.72)',
                    transition: 'background-color 160ms ease, border-color 160ms ease',
                    '&:hover': {
                      borderColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(15,23,42,0.13)',
                      bgcolor: isDark ? 'rgba(255,255,255,0.045)' : '#ffffff',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: statAccent.primary.bg,
                        color: statAccent.primary.color,
                        fontWeight: 900,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 900, color: headingText }}>
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="caption" color="text.secondary">
                          <Box component="span" sx={{ color: mutedText }}>
                            {user.email}
                          </Box>
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" sx={{ color: mutedText }}>
                          Joined {formatDate(user.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === 'admin' ? 'secondary' : 'primary'}
                    sx={{
                      height: 24,
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      minWidth: 60,
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent users
              </Typography>
            )}
          </List>
        </Paper>

        {/* Pending Releases */}
        <Paper
          elevation={0}
          sx={{
            ...surfaceSx,
            p: { xs: 2.5, md: 3 },
            height: '100%',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography sx={sectionHeadingSx}>Pending Releases</Typography>
            <Button
              component={Link}
              href="/admin/releases?status=pending"
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                borderRadius: '999px',
                px: 1.75,
                fontWeight: 900,
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
              }}
            >
              View All
            </Button>
          </Box>

          <Divider
            sx={{ mb: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}
          />

          {pendingReleases.length > 0 ? (
            <List sx={{ px: 0, display: 'grid', gap: 1.25 }}>
              {pendingReleases.slice(0, 5).map(release => (
                <ListItem
                  key={release._id}
                  sx={{
                    px: 1.5,
                    py: 1.35,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)',
                    bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(248,250,252,0.72)',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: statAccent.warning.bg,
                        color: statAccent.warning.color,
                      }}
                    >
                      <MusicNote sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 900, color: headingText }}
                        noWrap
                      >
                        {release.releaseTitle || 'Untitled Release'}
                      </Typography>
                    }
                    secondary={
                      <Typography component="span" variant="caption" sx={{ color: mutedText }}>
                        by {release.primaryArtist || 'Unknown Artist'}
                      </Typography>
                    }
                  />
                  <Button
                    component={Link}
                    href={`/admin/releases/${release._id}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: '999px',
                      fontWeight: 900,
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    Review
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                minHeight: 220,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '12px',
                border: '1px dashed',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
                bgcolor: isDark ? 'rgba(255,255,255,0.018)' : 'rgba(248,250,252,0.6)',
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <CheckCircle sx={{ color: '#10b981' }} />
                <Typography variant="body2" sx={{ color: mutedText, fontWeight: 800 }}>
                  No pending releases
                </Typography>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* All Releases Table */}
        <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
          <Paper
            elevation={0}
            sx={{
              ...surfaceSx,
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography sx={sectionHeadingSx}>All Releases</Typography>
              <Button
                component={Link}
                href="/admin/releases"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  borderRadius: '999px',
                  px: 1.75,
                  fontWeight: 900,
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
                }}
              >
                View All
              </Button>
            </Box>

            <Divider
              sx={{ mb: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}
            />

            {allReleases.length > 0 ? (
              <TableContainer
                sx={{
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                  overflow: 'hidden',
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Title', 'Artist', 'Status', 'Tracks', 'Updated'].map(header => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            color: mutedText,
                            bgcolor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(248,250,252,0.95)',
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allReleases.slice(0, 5).map(release => (
                      <TableRow
                        key={release._id}
                        sx={{
                          '& td': {
                            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
                            py: 1.55,
                          },
                          '&:hover td': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(248,250,252,0.72)',
                          },
                          '&:last-child td': {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell sx={{ maxWidth: 120 }}>
                          <Typography
                            variant="body2"
                            sx={{ color: headingText, fontWeight: 900 }}
                            noWrap
                          >
                            {release.releaseTitle || 'Untitled'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: mutedText, fontWeight: 700 }}>
                            {release.primaryArtist || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                            color={
                              release.status === 'approved'
                                ? 'success'
                                : release.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                            }
                            size="small"
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              minWidth: 70,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: headingText,
                              fontWeight: 800,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {Array.isArray(release.tracks) ? release.tracks.length : 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: mutedText, fontWeight: 700 }}>
                            {formatDate(release.updatedAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No releases found
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
