'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Avatar,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  alpha,
  useTheme,
  Divider,
  Badge,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  MusicNote,
  CheckCircle,
  Pending,
  Cancel,
  PlayArrow,
  Pause,
  FilterList,
  Add,
  Visibility,
  Download,
  MoreVert,
} from '@mui/icons-material';
import { trackAPI } from '@/services/api';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useColorMode } from '@/context/ColorModeContext';

interface Track {
  _id: string;
  title: string;
  artistName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  duration?: number;
  artwork?: string;
  audioFile?: string;
  genre?: string;
  releaseDate?: string;
  stores?: string[];
}

export default function AdminTracksPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdmin } = useAdminAuth();
  const { mode } = useColorMode();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalTracks, setTotalTracks] = useState(0);
  const [genreFilter, setGenreFilter] = useState('all');
  const [uniqueGenres, setUniqueGenres] = useState<string[]>([]);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchTracks();
    }
  }, [isAdmin, page, rowsPerPage, searchTerm, statusFilter, genreFilter]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (genreFilter !== 'all') {
        params.genre = genreFilter;
      }
      
      const response = await trackAPI.getTracks(params);
      
      if (response.success && response.data) {
        const data = response.data;
        const trackData = Array.isArray(data.data) ? data.data : [];
        setTracks(trackData);
        setTotalTracks(data.pagination?.total || 0);
        
        // Extract unique genres for filter
        const genres = Array.from(new Set(trackData.map((track: Track) => track.genre).filter(Boolean))) as string[];
        setUniqueGenres(genres);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleGenreFilterChange = (event: SelectChangeEvent) => {
    setGenreFilter(event.target.value);
    setPage(0);
  };

  const handleEditTrack = (trackId: string) => {
    router.push(`/admin/tracks/${trackId}`);
  };

  const handleViewTrack = (trackId: string) => {
    router.push(`/track/${trackId}`);
  };

  const togglePlayTrack = (trackId: string) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'rejected':
        return <Cancel />;
      default:
        return <MusicNote />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStoreCount = (stores?: string[]) => {
    return stores ? stores.length : 0;
  };

  if (isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin === false) {
    router.push('/login');
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Track Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all music tracks and releases
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<Add />}
          onClick={() => router.push('/admin/tracks/new')}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            }
          }}
        >
          Add New Track
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}
      >
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`,
            color: 'white',
            height: '100%',
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Tracks
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {totalTracks}
                </Typography>
              </Box>
              <MusicNote sx={{ fontSize: 40, opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.main, 0.7)})`,
            color: 'white',
            height: '100%',
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {tracks.filter(t => t.status === 'pending').length}
                </Typography>
              </Box>
              <Pending sx={{ fontSize: 40, opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.7)})`,
            color: 'white',
            height: '100%',
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Approved
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {tracks.filter(t => t.status === 'approved').length}
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 40, opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.7)})`,
            color: 'white',
            height: '100%',
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Rejected
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {tracks.filter(t => t.status === 'rejected').length}
                </Typography>
              </Box>
              <Cancel sx={{ fontSize: 40, opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 1' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search tracks..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="genre-filter-label">Genre</InputLabel>
              <Select
                labelId="genre-filter-label"
                value={genreFilter}
                label="Genre"
                onChange={handleGenreFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Genres</MenuItem>
                {uniqueGenres.map(genre => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setGenreFilter('all');
              }}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                borderColor: mode === 'dark' ? 'grey.700' : 'grey.300',
                color: mode === 'dark' ? 'grey.300' : 'grey.700',
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tracks Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ 
              backgroundColor: mode === 'dark' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.1),
            }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Track</TableCell>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Artist</TableCell>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Genre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Stores</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: mode === 'dark' ? 'grey.300' : 'grey.700' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      <CircularProgress size={24} />
                      <Typography>Loading tracks...</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : tracks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <MusicNote sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No tracks found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your search or filter criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tracks.map((track) => (
                  <TableRow 
                    key={track._id} 
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: mode === 'dark' ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02) 
                      },
                      borderBottom: `1px solid ${mode === 'dark' ? alpha(theme.palette.grey[700], 0.3) : alpha(theme.palette.grey[300], 0.5)}`
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {track.artwork ? (
                          <Avatar 
                            variant="rounded" 
                            src={track.artwork} 
                            sx={{ width: 56, height: 56, borderRadius: 1.5 }}
                          />
                        ) : (
                          <Avatar 
                            variant="rounded" 
                            sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: 'primary.main' }}
                          >
                            <MusicNote />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {track.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => togglePlayTrack(track._id)}
                              sx={{ 
                                bgcolor: playingTrack === track._id ? 'primary.main' : mode === 'dark' ? 'grey.700' : 'grey.200',
                                '&:hover': { bgcolor: playingTrack === track._id ? 'primary.dark' : mode === 'dark' ? 'grey.600' : 'grey.300' }
                              }}
                            >
                              {playingTrack === track._id ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                            </IconButton>
                            <Typography variant="caption" color="text.secondary">
                              {track.releaseDate ? formatDate(track.releaseDate) : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {track.artistName || 'Unknown Artist'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(track.status)}
                        label={track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                        color={getStatusColor(track.status)}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 1,
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            fontSize: '16px'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {track.genre || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(track.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(track.duration)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        badgeContent={getStoreCount(track.stores)} 
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.65rem',
                            height: 18,
                            minWidth: 18,
                            borderRadius: '10px'
                          }
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Stores
                        </Typography>
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Track">
                        <IconButton 
                          onClick={() => handleViewTrack(track._id)}
                          size="small"
                          sx={{ 
                            color: mode === 'dark' ? 'grey.400' : 'grey.600',
                            '&:hover': { 
                              bgcolor: mode === 'dark' ? 'grey.700' : 'grey.100' 
                            }
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Track">
                        <IconButton 
                          onClick={() => handleEditTrack(track._id)}
                          size="small"
                          sx={{ 
                            color: mode === 'dark' ? 'grey.400' : 'grey.600',
                            '&:hover': { 
                              bgcolor: mode === 'dark' ? 'grey.700' : 'grey.100' 
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: mode === 'dark' ? 'grey.400' : 'grey.600',
                            '&:hover': { 
                              bgcolor: mode === 'dark' ? 'grey.700' : 'grey.100' 
                            }
                          }}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: mode === 'dark' ? 'grey.400' : 'grey.600',
                            '&:hover': { 
                              bgcolor: mode === 'dark' ? 'grey.700' : 'grey.100' 
                            }
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ borderColor: mode === 'dark' ? 'grey.700' : 'grey.300' }} />
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalTracks}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            backgroundColor: mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : alpha(theme.palette.grey[50], 0.5),
            '& .MuiTablePagination-select': {
              borderRadius: 1,
            },
            '& .MuiTablePagination-actions': {
              '& button': {
                borderRadius: 1,
              }
            }
          }}
        />
      </Paper>
    </Box>
  );
}