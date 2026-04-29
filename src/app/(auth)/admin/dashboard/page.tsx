'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Grid,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import {
  MusicNote,
  Group,
  MonetizationOn,
  Notifications,
  Album,
  PersonAdd,
  BarChart,
  CheckCircle,
  PendingActions,
  Error as ErrorIcon,
  PlayArrow,
  TrendingUp,
  Storage,
  AccountBalance
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

// DSP mapping for better visualization with Font Awesome icons
const DSP_MAPPING: Record<string, { icon: any; color: string; name: string }> = {
  'Apple Music': { icon: faApple, color: '#fa233b', name: 'Apple Music' },
  'Spotify': { icon: faSpotify, color: '#1db954', name: 'Spotify' },
  'YouTube Music': { icon: faYoutube, color: '#ff0000', name: 'YouTube Music' },
  'Amazon Music': { icon: faAmazon, color: '#ff9900', name: 'Amazon Music' },
  'Tidal': { icon: faTidal, color: '#000000', name: 'Tidal' },
  'Deezer': { icon: faDeezer, color: '#feaa2e', name: 'Deezer' },
  'SoundCloud': { icon: faSoundcloud, color: '#ff7700', name: 'SoundCloud' },
  'default': { icon: 'store', color: '#4a6cf7', name: 'Other' }
};

interface DashboardStats {
  totalUsers: number;
  totalTracks: number;
  pendingTracks: number;
  pendingPayouts: number;
  totalRevenue: number;
  totalReleases: number;
  pendingReleases: number;
}

export default function AdminDashboard() {
  const router = useRouter();
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
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingReleases, setPendingReleases] = useState<any[]>([]);
  const [allReleases, setAllReleases] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  
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
      console.log('Fetching admin dashboard data...');
      
      // Initialize default stats with all required properties
      const defaultStats: DashboardStats = {
        totalUsers: 0,
        totalTracks: 0,
        pendingTracks: 0,
        pendingPayouts: 0,
        totalRevenue: 0,
        totalReleases: 0,
        pendingReleases: 0,
      };
      
      // Try to fetch dashboard stats
      try {
        console.log('Fetching dashboard stats...');
        const statsResponse = await adminAPI.getDashboardStats();
        console.log('Stats response:', statsResponse);
        
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
      
      // Fetch recent users
      try {
        console.log('Fetching users...');
        const usersResponse = await adminAPI.getUsers({ limit: 5, sort: '-createdAt' });
        console.log('Users response:', usersResponse);
        
        if (usersResponse.success && usersResponse.data) {
          // The backend returns users in data.users with pagination info
          const users = usersResponse.data.users || [];
          console.log('Processed users:', users);
          
          if (Array.isArray(users) && users.length > 0) {
          setRecentUsers(users);
          } else {
            console.log('No users found or invalid users array');
            setRecentUsers([]);
          }
        } else {
          console.log('Invalid users response:', usersResponse);
          setRecentUsers([]);
        }
      } catch (usersError) {
        console.error('Error fetching users:', usersError);
        setRecentUsers([]);
      }
      
      // Fetch all releases and pending releases
      try {
        console.log('Fetching all releases...');
        const releasesResponse = await releaseAPI.getReleases();
        if (releasesResponse.success && Array.isArray(releasesResponse.data)) {
          setAllReleases(releasesResponse.data);
          // Pending releases are those with status 'pending'
          setPendingReleases(releasesResponse.data.filter(r => r.status === 'pending'));
        } else {
          setAllReleases([]);
          setPendingReleases([]);
        }
      } catch (releasesError) {
        console.error('Error fetching releases:', releasesError);
        setAllReleases([]);
        setPendingReleases([]);
      }
      
      // Fetch pending payouts
      try {
        console.log('Fetching payouts...');
        const payoutsResponse = await adminAPI.getPayouts({ 
          status: 'pending',
          limit: 5
        });
        console.log('Payouts response:', payoutsResponse);
        
        if (payoutsResponse.success && payoutsResponse.data) {
          const payouts = Array.isArray(payoutsResponse.data) 
            ? payoutsResponse.data 
            : [];
          setPendingPayouts(payouts);
        }
      } catch (payoutsError) {
        console.error('Error fetching payouts:', payoutsError);
        setPendingPayouts([]);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
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
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={3} sx={{ flex: '1' }}>
          <Card 
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
                    bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                    mr: 1.5
                  }}
                >
                  <Group sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {stats.totalUsers}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} sx={{ flex: '1' }}>
          <Card 
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
                    bgcolor: mode === 'dark' ? 'secondary.dark' : 'secondary.light',
                    mr: 1.5
                  }}
                >
                  <Album sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {allReleases.length}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Total Releases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} sx={{ flex: '1' }}>
          <Card 
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
                    bgcolor: mode === 'dark' ? 'warning.dark' : 'warning.light',
                    mr: 1.5
                  }}
                >
                  <PendingActions sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {stats.pendingReleases}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Pending Approvals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} sx={{ flex: '1' }}>
          <Card 
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
                    bgcolor: mode === 'dark' ? 'error.dark' : 'error.light',
                    mr: 1.5
                  }}
                >
                  <MonetizationOn sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {stats.pendingPayouts}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Pending Payouts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }} component="div">
        {[
          { title: 'Manage Users', icon: <Group />, href: '/admin/users', color: 'primary' },
          { title: 'Pending Releases', icon: <MusicNote />, href: '/admin/releases?status=pending', color: 'warning' },
          { title: 'Payout Requests', icon: <MonetizationOn />, href: '/admin/payouts', color: 'error' },
          { title: 'View Analytics', icon: <BarChart />, href: '/admin/analytics', color: 'success' },
        ].map((item, index) => (
          <Grid item xs={6} sm={3} key={index} sx={{ flex: '1' }}>
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
          </Grid>
        ))}
      </Grid>
      
      {/* Dashboard Content */}
      <Grid container spacing={3} style={{flexWrap: 'nowrap'}}>
        {/* Recent Users */}
        <Grid item xs={12} md={6} component="div">
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
        </Grid>

        {/* Pending Releases */}
        <Grid item xs={12} md={6} component="div">
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
        </Grid>

        {/* All Releases Table */}
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </Container>
  );
}