'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useColorMode } from '@/context/ColorModeContext';
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
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
  CardActions
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  MusicNote as MusicNoteIcon,
  LibraryMusic as LibraryMusicIcon,
  Album as AlbumIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PendingActions as PendingActionsIcon,
  CloudUpload as CloudUploadIcon,
  QueryStats as QueryStatsIcon,
  Cancel as CancelIcon,
  ShowChart as ShowChartIcon,
  Logout as LogoutIcon,
  Podcasts as PodcastsIcon,
  Group,
  MonetizationOn,
  TrendingUp,
  Storage,
  AccountBalance,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import { trackAPI, releaseAPI } from '@/services/api';

// Define types
interface Track {
  _id: string;
  title: string;   
  genre: string;
  releaseDate: string;
  audioUrl: string;
  artworkUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  acrCloud?: {
    fileId?: string;
    state?: 'not_configured' | 'pending' | 'ready' | 'no_results' | 'error';
    scanState?: 'not_configured' | 'pending' | 'ready' | 'no_results' | 'error';
    lastError?: string;
    checkedAt?: string;
  };
  createdAt: string;
}

import AuthGuard from '@/components/AuthGuard';

const getAcrCloudState = (track: Track) => track.acrCloud?.scanState || track.acrCloud?.state;

const getAcrCloudLabel = (track: Track) => {
  switch (getAcrCloudState(track)) {
    case 'pending':
      return 'ACR testing';
    case 'ready':
      return 'ACR passed';
    case 'no_results':
      return 'ACR no match';
    case 'error':
      return 'ACR error';
    case 'not_configured':
      return 'ACR off';
    default:
      return 'ACR queued';
  }
};

const getAcrCloudColor = (track: Track) => {
  switch (getAcrCloudState(track)) {
    case 'ready':
    case 'no_results':
      return 'success';
    case 'pending':
      return 'warning';
    case 'error':
      return 'error';
    case 'not_configured':
      return 'default';
    default:
      return 'info';
  }
};

export default function ArtistDashboard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}

function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  // FIX: Always call hooks at the top level (never conditionally)
  const auth = useAuth();
  const { user, logout } = auth || { user: null, logout: () => {} };
  
  // State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        const response = await trackAPI.getTracks();
        if (response && response.success) {
          // Ensure tracks is always an array
          const tracksData = Array.isArray(response.data) ? response.data : [];
          setTracks(tracksData);
        } else {
          setError('Failed to load tracks');
          setTracks([]); // Ensure tracks is always an array even on error
        }
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError('An error occurred while fetching your tracks');
        setTracks([]); // Ensure tracks is always an array on error
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchReleases = async () => {
      try {
        setReleaseLoading(true);
        const response = await releaseAPI.getReleases();
        if (response && response.success) {
          setReleases(Array.isArray(response.data) ? response.data : []);
        } else {
          setReleaseError('Failed to load releases');
          setReleases([]);
        }
      } catch (err) {
        console.error('Error fetching releases:', err);
        setReleaseError('An error occurred while fetching your releases');
        setReleases([]);
      } finally {
        setReleaseLoading(false);
      }
    };

    fetchTracks();
    fetchReleases();
  }, []);
  
  // Handle audio playback
  useEffect(() => {
    return () => {
      // Cleanup audio when component unmounts
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);
  
  const handlePlayPause = (trackId: string, audioUrl: string) => {
    if (currentlyPlaying === trackId) {
      // Pause currently playing track
      if (audioElement) {
        audioElement.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop current audio if any
      if (audioElement) {
        audioElement.pause();
      }
      
      // Play new track
      const audio = new Audio(audioUrl);
      audio.play();
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      
      setAudioElement(audio);
      setCurrentlyPlaying(trackId);
    }
  };
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
        return 'success';
      case 'pending': 
        return 'warning';
      case 'rejected': 
        return 'error';
      default: 
        return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': 
        return <CheckCircleIcon fontSize="small" />;
      case 'pending': 
        return <PendingActionsIcon fontSize="small" />;
      case 'rejected': 
        return <ErrorIcon fontSize="small" />;
      default: 
        return null;
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
  
  // Ensure tracks is an array before filtering
  const safeTracks = Array.isArray(tracks) ? tracks : [];
  const safeReleases = Array.isArray(releases) ? releases : [];
  
  // Count tracks by status
  const approvedTracks = safeTracks.filter(track => track?.status === 'approved').length;
  const pendingTracks = safeTracks.filter(track => track?.status === 'pending').length;
  const rejectedTracks = safeTracks.filter(track => track?.status === 'rejected').length;

  // Count releases by status
  const approvedReleases = safeReleases.filter(release => release?.status === 'approved').length;
  const pendingReleases = safeReleases.filter(release => release?.status === 'pending').length;
  const rejectedReleases = safeReleases.filter(release => release?.status === 'rejected').length;
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  const panelSx = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    bgcolor: 'background.paper',
    color: 'text.primary',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 18px 44px rgba(0, 0, 0, 0.22)'
      : '0 18px 44px rgba(15, 23, 42, 0.06)',
  } as const;

  const metricCardSx = {
    height: '100%',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 14px 30px rgba(0, 0, 0, 0.28)'
        : '0 14px 30px rgba(15, 23, 42, 0.10)',
    },
  } as const;

  // Render dashboard
  return (
    <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              fontWeight={700}
              color="text.primary"
              sx={{ letterSpacing: 0 }}
            >
              Welcome, {user?.artistName || user?.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your releases and track your music performance
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: mode === 'dark' 
                ? `rgba(255, 255, 255, 0.23)` 
                : `rgba(0, 0, 0, 0.23)`,
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={3}>
          <Card 
            elevation={0}
            sx={metricCardSx}
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
                  <LibraryMusicIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {tracks.length}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Total Tracks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3}>
          <Card 
            elevation={0}
            sx={metricCardSx}
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
                  <AlbumIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {releases.length}
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
        
        <Grid item xs={6} sm={4} md={3}>
          <Card 
            elevation={0}
            sx={metricCardSx}
          >
            <CardContent sx={{ p: 2, pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: mode === 'dark' ? 'success.dark' : 'success.light',
                    mr: 1.5
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {approvedReleases}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Approved Releases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3}>
          <Card 
            elevation={0}
            sx={metricCardSx}
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
                  <PendingActionsIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {pendingTracks}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Pending Review
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={Link}
            href="/dashboard/upload"
            variant="outlined"
            color="primary"
            startIcon={<CloudUploadIcon />}
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
            Upload New Release
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={Link}
            href="/dashboard/royalties"
            variant="outlined"
            color="success"
            startIcon={<MonetizationOn />}
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
            View Royalties
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={Link}
            href="/dashboard/releases"
            variant="outlined"
            color="secondary"
            startIcon={<AlbumIcon />}
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
            Manage Releases
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={Link}
            href="/dashboard/podcasts"
            variant="outlined"
            color="info"
            startIcon={<PodcastsIcon />}
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
            Manage Podcasts
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={Link}
            href="/dashboard/settings"
            variant="outlined"
            color="warning"
            startIcon={<SettingsIcon />}
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
            Account Settings
          </Button>
        </Grid>
      </Grid>
      
      {/* Track status summary */}
      <Paper
        elevation={0}
        sx={{
          ...panelSx,
          p: { xs: 2.5, md: 3 },
          mb: 4,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Release Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${tracks.filter(t => t.status === 'approved').length} Approved`}
                color="success"
                variant="outlined"
                sx={{ width: '100%', height: 36 }}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<PendingActionsIcon />}
                label={`${tracks.filter(t => t.status === 'pending').length} Pending`}
                color="warning"
                variant="outlined"
                sx={{ width: '100%', height: 36 }}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<ErrorIcon />}
                label={`${tracks.filter(t => t.status === 'rejected').length} Rejected`}
                color="error"
                variant="outlined"
                sx={{ width: '100%', height: 36 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent tracks */}
      <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
        Your Tracks
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : tracks.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 2,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <MusicNoteIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No tracks yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Upload your first track to get started
          </Typography>
          <Button
            component={Link}
            href="/dashboard/upload"
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
          >
            Upload Track
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {tracks.map((track) => (
            <Grid item xs={12} sm={6} md={4} key={track._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    height="200"
                    src={track.artworkUrl || '/placeholder-artwork.jpg'}
                    alt={track.title}
                    sx={{ width: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Chip
                      icon={getStatusIcon(track.status) || undefined}
                      label={track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                      color={getStatusColor(track.status) as any}
                      size="small"
                    />
                  </Box>
                  <IconButton
                    onClick={() => handlePlayPause(track._id, track.audioUrl)}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'white',
                      },
                    }}
                    aria-label={currentlyPlaying === track._id ? 'pause' : 'play'}
                  >
                    {currentlyPlaying === track._id ? (
                      <PauseIcon fontSize="large" />
                    ) : (
                      <PlayArrowIcon fontSize="large" />
                    )}
                  </IconButton>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {track.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Genre: {track.genre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Release Date: {formatDate(track.releaseDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {formatDate(track.createdAt)}
                  </Typography>
                  {track.acrCloud && (
                    <Chip
                      icon={getAcrCloudState(track) === 'pending' ? <CircularProgress size={12} /> : <QueryStatsIcon fontSize="small" />}
                      label={getAcrCloudLabel(track)}
                      color={getAcrCloudColor(track) as any}
                      size="small"
                      variant="outlined"
                      title={track.acrCloud.lastError || 'ACRCloud verification status'}
                      sx={{ mt: 1.25 }}
                    />
                  )}
                  
                  {track.status === 'rejected' && track.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }}>
                      {track.rejectionReason}
                    </Alert>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    href={`/dashboard/tracks/${track._id}`}
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: mode === 'dark' 
                        ? `rgba(255, 255, 255, 0.23)` 
                        : `rgba(0, 0, 0, 0.23)`,
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* View all button (if there are many tracks) */}
      {tracks.length > 6 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component={Link}
            href="/dashboard/tracks"
            variant="outlined"
            color="primary"
            sx={{
              borderColor: mode === 'dark' 
                ? `rgba(255, 255, 255, 0.23)` 
                : `rgba(0, 0, 0, 0.23)`,
            }}
          >
            View All Releases
          </Button>
        </Box>
      )}
    </Container>
  );
}
