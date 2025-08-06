'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Box, Typography, Paper, Card, CardContent, Button, Chip, CircularProgress, Alert, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';
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
} from '@mui/icons-material';
import { adminAPI, trackAPI, payoutAPI, releaseAPI } from '@/services/api';
import { ReleaseStatus, PayoutStatus } from '@/utils/constants';
import useAdminAuth from '@/hooks/useAdminAuth';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
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
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage users, releases, and payouts
        </Typography>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  mr: 2,
                }}
              >
                <Group color="success" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  mr: 2,
                }}
              >
                <Album color="primary" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {allReleases.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Releases
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  mr: 2,
                }}
              >
                <PendingActions color="warning" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {stats.pendingReleases}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approvals
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  mr: 2,
                }}
              >
                <MonetizationOn color="error" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {stats.pendingPayouts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Payouts
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick links */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          { title: 'Manage Users', icon: <Group />, href: '/admin/users', color: 'primary' },
          { title: 'Pending Releases', icon: <MusicNote />, href: '/admin/releases?status=pending', color: 'warning' },
          { title: 'Payout Requests', icon: <MonetizationOn />, href: '/admin/payouts', color: 'error' },
          { title: 'View Analytics', icon: <BarChart />, href: '/admin/analytics', color: 'success' },
        ].map((item, index) => (
          <Grid item xs={6} sm={3} key={index}>
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
                fontSize: '0.9rem',
                fontWeight: 600,
                justifyContent: 'flex-start',
              }}
              fullWidth
            >
              {item.title}
            </Button>
          </Grid>
        ))}
      </Grid>
      
      {/* Dashboard content */}
      <Grid container spacing={4}>
        {/* New users */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              height: '100%',
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
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <>
                          {user.email}
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            Joined {formatDate(user.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'secondary' : 'primary'}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No recent users
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* All releases table */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              All Releases
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {allReleases.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Artist</TableCell>
                      <TableCell>Label</TableCell>
                      <TableCell>UPC</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>DSPs</TableCell>
                      <TableCell>Tracks</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allReleases.map((release) => (
                      <TableRow key={release._id}>
                        <TableCell sx={{ maxWidth: 120 }}>
                          <Typography variant="body2" noWrap>
                            {release.releaseTitle || 'Untitled'}
                          </Typography>
                        </TableCell>
                        <TableCell>{release.primaryArtist || 'N/A'}</TableCell>
                        <TableCell>{release.label || 'N/A'}</TableCell>
                        <TableCell>{release.upc || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                            color={release.status === 'approved' ? 'success' : release.status === 'pending' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{Array.isArray(release.stores) ? release.stores.join(', ') : 'N/A'}</TableCell>
                        <TableCell>{Array.isArray(release.tracks) ? release.tracks.length : 0}</TableCell>
                        <TableCell>{formatDate(release.createdAt)}</TableCell>
                        <TableCell>{formatDate(release.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No releases found
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Pending payouts */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Pending Payouts
              </Typography>
              <Button
                component={Link}
                href="/admin/payouts"
                size="small"
                color="primary"
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {pendingPayouts.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingPayouts.map((payout) => (
                      <TableRow key={payout._id}>
                        <TableCell>{payout.userName}</TableCell>
                        <TableCell>{formatCurrency(payout.amount)}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {payout.paymentMethod}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            href={`/admin/payouts/${payout._id}`}
                            size="small"
                            variant="outlined"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No pending payouts
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}