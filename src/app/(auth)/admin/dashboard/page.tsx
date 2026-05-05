'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useColorMode } from '@/context/ColorModeContext';
import useAdminAuth from '@/hooks/useAdminAuth';
import { adminAPI, releaseAPI } from '@/services/api';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
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
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import {
  MusicNote,
  Group,
  MonetizationOn,
  Album,
  BarChart,
  PendingActions,
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
  mb: 4,
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(4, minmax(0, 1fr))',
  },
} as const;

const panelGridStyles = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: {
    xs: '1fr',
    md: 'repeat(2, minmax(0, 1fr))',
  },
} as const;

const quickActionGridStyles = {
  display: 'grid',
  gap: 2,
  mb: 4,
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(4, minmax(0, 1fr))',
  },
} as const;

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode } = useColorMode();
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
            ...statsResponse.data
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
          setPendingReleases(releases.filter((release) => release.status === 'pending'));
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
    { label: 'Pending Approvals', value: stats.pendingReleases, icon: PendingActions, avatarColor: 'warning' },
    { label: 'Pending Payouts', value: stats.pendingPayouts, icon: MonetizationOn, avatarColor: 'error' },
  ];
  
  // Render auth loading state
  if (isAuthLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Verifying admin access...</Typography>
      </Box>
    );
  }

  // Render auth error state
  if (authError) {
    return (
      <Container maxWidth="lg">
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          fontWeight={700}
          sx={{ mb: 1 }}
          style={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)' }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back! Here's what's happening today.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={statGridStyles}>
        {statCards.map(({ label, value, icon: Icon, avatarColor }) => (
          <Card 
            key={label}
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: mode === 'dark' 
                  ? '0 12px 20px rgba(0, 0, 0, 0.3)' 
                  : '0 12px 20px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 2, pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: mode === 'dark' ? `${avatarColor}.dark` : `${avatarColor}.light`,
                    mr: 1.5
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {value}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      
      {/* Quick Actions */}
      <Box sx={quickActionGridStyles}>
        {[
          { title: 'Manage Users', icon: <Group />, href: '/admin/users', color: 'primary' },
          { title: 'Pending Releases', icon: <MusicNote />, href: '/admin/releases?status=pending', color: 'warning' },
          { title: 'Payout Requests', icon: <MonetizationOn />, href: '/admin/payouts', color: 'error' },
          { title: 'View Analytics', icon: <BarChart />, href: '/admin/analytics', color: 'success' },
        ].map((item, index) => (
          <Box key={index}>
            <Button
              component={Link}
              href={item.href}
              variant="outlined"
              color={item.color as any}
              startIcon={item.icon}
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
                borderWidth: 2,
                textTransform: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                justifyContent: 'flex-start',
                borderColor: mode === 'dark' 
                  ? `rgba(255, 255, 255, 0.23)` 
                  : `rgba(0, 0, 0, 0.23)`,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: mode === 'dark' 
                    ? `rgba(255, 255, 255, 0.08)` 
                    : `rgba(0, 0, 0, 0.04)`,
                }
              }}
              fullWidth
            >
              {item.title}
            </Button>
          </Box>
        ))}
      </Box>
      
      {/* Dashboard Content */}
      <Box sx={panelGridStyles}>
        {/* Recent Users */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Recent Users
            </Typography>
            <Button
              component={Link}
              href="/admin/users"
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                borderColor: mode === 'dark' 
                  ? `rgba(255, 255, 255, 0.23)` 
                  : `rgba(0, 0, 0, 0.23)`,
              }}
            >
              View All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List sx={{ px: 0 }}>
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{
                    px: 0,
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography 
                          component="span" 
                          variant="caption" 
                          color="text.secondary"
                        >
                          {user.email}
                        </Typography>
                        <br />
                        <Typography 
                          component="span" 
                          variant="caption" 
                          color="text.secondary"
                        >
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
                      height: 20, 
                      fontSize: '0.65rem',
                      minWidth: 60
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
            p: 3,
            borderRadius: 3,
            height: '100%',
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Pending Releases
              </Typography>
              <Button
                component={Link}
                href="/admin/releases?status=pending"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: mode === 'dark' 
                    ? `rgba(255, 255, 255, 0.23)` 
                    : `rgba(0, 0, 0, 0.23)`,
                }}
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {pendingReleases.length > 0 ? (
              <List sx={{ px: 0 }}>
                {pendingReleases.slice(0, 5).map((release) => (
                  <ListItem
                    key={release._id}
                    sx={{
                      px: 0,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36,
                          bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light'
                        }}
                      >
                        <MusicNote sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {release.releaseTitle || 'Untitled Release'}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          component="span" 
                          variant="caption" 
                          color="text.secondary"
                        >
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
                        borderColor: mode === 'dark' 
                          ? `rgba(255, 255, 255, 0.23)` 
                          : `rgba(0, 0, 0, 0.23)`,
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5
                      }}
                    >
                      Review
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No pending releases
              </Typography>
            )}
        </Paper>

        {/* All Releases Table */}
        <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                All Releases
              </Typography>
              <Button
                component={Link}
                href="/admin/releases"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: mode === 'dark' 
                    ? `rgba(255, 255, 255, 0.23)` 
                    : `rgba(0, 0, 0, 0.23)`,
                }}
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {allReleases.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Artist</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Tracks</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allReleases.slice(0, 5).map((release) => (
                      <TableRow 
                        key={release._id}
                        sx={{
                          '&:last-child td': {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell sx={{ maxWidth: 120 }}>
                          <Typography variant="body2" noWrap>
                            {release.releaseTitle || 'Untitled'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {release.primaryArtist || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                            color={release.status === 'approved' ? 'success' : release.status === 'pending' ? 'warning' : 'error'}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.65rem',
                              minWidth: 70
                            }}
                          />
                        </TableCell>
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
