'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Container,
  Alert,
  Grid,
} from '@mui/material';

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
  createdAt: string;
}

import AuthGuard from '@/components/AuthGuard';

export default function ArtistDashboard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}

function DashboardPage(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  
  // Render dashboard
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
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
        >
          Logout
        </Button>
      </Box>
      
      {/* Dashboard stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              height: '100%',
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
                <LibraryMusicIcon color="success" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {tracks.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tracks
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              height: '100%',
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
                <AlbumIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {releases.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Releases
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              height: '100%',
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
                <CheckCircleIcon color="success" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {approvedReleases}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved Releases
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              height: '100%',
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
                <PendingActionsIcon color="warning" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {pendingTracks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} component="div">
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Button
              component={Link}
              href="/upload"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CloudUploadIcon />}
              sx={{ py: 1.5 }}
            >
              Upload New Track
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Track status summary */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Release Status
        </Typography>
        <Grid container spacing={2} component="div">
          <Grid item xs={4} component="div">
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
          <Grid item xs={4} component="div">
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
          <Grid item xs={4} component="div">
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
      
      {/* Recent releases */}
      <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
        Your Releases
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
            href="/upload"
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
            <Grid item xs={12} sm={6} md={4} key={track._id} component="div">
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={track.artworkUrl || '/placeholder-artwork.jpg'}
                    alt={track.title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Chip
                      icon={getStatusIcon(track.status)}
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
          >
            View All Releases
          </Button>
        </Box>
      )}
    </Box>
  );
}