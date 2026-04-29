"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Album,
  CheckCircle,
  Pending,
  Cancel,
  ArrowBack,
  ThumbUp,
  ThumbDown,
  Info,
  MusicNote,
  Store,
  Link as LinkIcon,
  PlayArrow,
  Pause,
} from "@mui/icons-material";
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
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { releaseAPI } from "@/services/api";
import { useColorMode } from '@/context/ColorModeContext';

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

export default function AdminReleaseDetailPage() {
  const router = useRouter();   
  const theme = useTheme();
  const { mode } = useColorMode();
  const params = useParams<{ id: string }>();
  const releaseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [release, setRelease] = useState<any | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const statusColor = useMemo(() => {
    if (!release?.status) return "default" as const;
    return release.status === "approved"
      ? ("success" as const)
      : release.status === "pending"
      ? ("warning" as const)
      : ("error" as const);
  }, [release?.status]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const resp = await releaseAPI.getReleaseById(releaseId);
        if (mounted) {
          if (resp?.success) {
            setRelease(resp.data || null);
            setError(null);
          } else {
            setError(typeof resp?.error === "string" ? resp.error : "Failed to load release");
            setRelease(null);
          }
        }
      } catch (e) {
        if (mounted) {
          setError("An error occurred while loading the release.");
          setRelease(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (releaseId) load();
    return () => {
      mounted = false;
      // Clean up audio element
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    };
  }, [releaseId]);

  const handleApprove = async () => {
    try {
      setSaving(true);
      const resp = await releaseAPI.updateReleaseStatus(releaseId, "approved");
      if (resp?.success) {
        setRelease((r: any) => (r ? { ...r, status: "approved" } : r));
      } else {
        setError(resp?.message || resp?.error || "Failed to approve release");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to approve release");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    try {
      setSaving(true);
      const resp = await releaseAPI.updateReleaseStatus(releaseId, "rejected", rejectReason || undefined);
      if (resp?.success) {
        setRelease((r: any) => (r ? { ...r, status: "rejected", rejectReason } : r));
        setRejectOpen(false);
        setRejectReason("");
      } else {
        setError(resp?.message || resp?.error || "Failed to reject release");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to reject release");
    } finally {
      setSaving(false);
    }
  };

  const handlePlayTrack = (audioUrl: string, trackId: string) => {
    if (!audioUrl) return;
    
    if (currentlyPlaying === trackId) {
      // Pause if same track
      if (audioElement) {
        audioElement.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Stop current audio if playing
      if (audioElement) {
        audioElement.pause();
      }
      
      // Create new audio element
      const audio = new Audio(audioUrl);
      audio.play();
      setAudioElement(audio);
      setCurrentlyPlaying(trackId);
      
      // Handle audio end
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 500 }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: "break-word", fontWeight: 500 }}>
        {value ?? "—"}
      </Typography>
    </Stack>
  );

  // Render DSP chips with icons
  const renderDSPChips = (stores: string[]) => {
    if (!Array.isArray(stores) || stores.length === 0) {
      return <Typography variant="body2" color="text.secondary">None specified</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {stores.map((store, index) => {
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
              <Chip
                icon={
                  isFAIcon ? (
                    <FontAwesomeIcon 
                      icon={dsp.icon} 
                      style={{ 
                        color: dsp.color,
                        fontSize: '1rem'
                      }} 
                    />
                  ) : (
                    <Store sx={{ color: dsp.color }} />
                  )
                }
                label={dsp.name}
                size="small"
                sx={{
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  // Render tracks table
  const renderTracks = () => {
    // Check different possible track structures
    let tracks = [];
    if (Array.isArray(release?.tracks)) {
      tracks = release.tracks;
    } else if (release?.tracks?.data && Array.isArray(release.tracks.data)) {
      tracks = release.tracks.data;
    }
    
    if (tracks.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No tracks found for this release
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Tracks ({tracks.length})
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          }}
        >
          <Stack spacing={1} sx={{ p: 2 }}>
            {tracks.map((track: any, index: number) => {
              // Try different possible field names for audio URL
              const audioUrl = track.audioUrl || track.audioFile || track.audio || null;
              const trackId = track._id || track.id || index.toString();
              const title = track.title || track.name || `Track ${index + 1}`;
              const isrc = track.isrc || track.ISRC || 'No ISRC';
              const duration = track.duration || track.length || 0;
              
              return (
                <Box 
                  key={trackId} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 1,
                    borderBottom: index < tracks.length - 1 ? 
                      `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}` : 
                      'none'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 2,
                      bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                    }}
                  >
                    <MusicNote />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isrc}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    {duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                  </Typography>
                  {audioUrl && (
                    <IconButton 
                      size="small"
                      onClick={() => handlePlayTrack(audioUrl, trackId)}
                      sx={{
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      {currentlyPlaying === trackId ? <Pause /> : <PlayArrow />}
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" sx={{ mb: 2 }}>
            Error Loading Release
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => router.back()}
            startIcon={<ArrowBack />}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!release) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Release Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            The requested release could not be found.
          </Typography>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/admin/releases"
            startIcon={<ArrowBack />}
          >
            Back to Releases
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          variant="outlined"
          sx={{
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
          }}
        >
          Back to Releases
        </Button>
        
        <Chip
          icon={
            release.status === "approved" ? <CheckCircle /> :
            release.status === "pending" ? <Pending /> :
            <Cancel />
          }
          label={release.status?.charAt(0).toUpperCase() + release.status?.slice(1)}
          color={statusColor}
          size="medium"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Release Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Cover Image */}
          <Box
            component="img"
            src={release.artworkUrl || release.artwork || '/placeholder-artwork.jpg'}
            alt={`${release.releaseTitle || 'Release'} Cover`}
            sx={{
              width: { xs: '100%', md: 200 },
              height: { xs: 200, md: 200 },
              borderRadius: 2,
              objectFit: 'cover',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-artwork.jpg';
            }}
          />
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {release.releaseTitle || 'Untitled Release'}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              by {release.primaryArtist || 'Unknown Artist'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                label={`Label: ${release.label || 'N/A'}`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`UPC: ${release.upc || 'N/A'}`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`${Array.isArray(release.tracks) ? release.tracks.length : 0} Tracks`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
            
            {release.status === "rejected" && release.rejectReason && (
              <Card 
                elevation={0} 
                sx={{ 
                  mb: 2,
                  border: `1px solid ${mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                  backgroundColor: mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Info sx={{ mr: 1 }} /> Rejection Reason
                  </Typography>
                  <Typography variant="body2">
                    {release.rejectReason}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {release.status === "pending" && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ThumbUp />}
                  onClick={handleApprove}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  {saving ? <CircularProgress size={20} /> : 'Approve'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ThumbDown />}
                  onClick={() => setRejectOpen(true)}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Release Information */}
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Release Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <InfoRow label="Release Title" value={release.releaseTitle} />
                <InfoRow label="Primary Artist" value={release.primaryArtist} />
                <InfoRow label="Featuring" value={release.featuring} />
                <InfoRow label="Label" value={release.label} />
                <InfoRow label="UPC" value={release.upc} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InfoRow label="Release Date" value={release.releaseDate} />
                <InfoRow label="Pre-order Date" value={release.preorderDate} />
                <InfoRow label="Genre" value={release.genre} />
                <InfoRow label="Sub-genre" value={release.subGenre} />
                <InfoRow label="Copyright" value={release.copyright} />
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {release.description || 'No description provided'}
              </Typography>
            </Box>
          </Paper>
          
          {/* Tracks */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            {renderTracks()}
          </Paper>
        </Box>
        
        {/* Distribution Info */}
        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Distribution
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                DSPs
              </Typography>
              {renderDSPChips(release.stores || [])}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Territories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Array.isArray(release.territories) && release.territories.length > 0
                  ? release.territories.join(', ')
                  : 'Worldwide'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Links
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  sx={{ 
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <LinkIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <LinkIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <LinkIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          
          {/* Metadata */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Metadata
            </Typography>
            
            <InfoRow label="Created" value={new Date(release.createdAt).toLocaleString()} />
            <InfoRow label="Updated" value={new Date(release.updatedAt).toLocaleString()} />
            {release.approvedAt && (
              <InfoRow label="Approved" value={new Date(release.approvedAt).toLocaleString()} />
            )}
            {release.rejectedAt && (
              <InfoRow label="Rejected" value={new Date(release.rejectedAt).toLocaleString()} />
            )}
          </Paper>
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <DialogTitle>Reject Release</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting this release. This will be sent to the artist.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={saving || !rejectReason.trim()}
          >
            {saving ? <CircularProgress size={20} /> : 'Reject Release'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}