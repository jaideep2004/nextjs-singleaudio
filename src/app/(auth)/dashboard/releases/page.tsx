"use client";
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
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
import { PlaylistAddCheck, Store } from '@mui/icons-material';

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

const getAcrCloudState = (acrCloud?: any) => acrCloud?.scanState || acrCloud?.state;

const getAcrCloudLabel = (acrCloud?: any) => {
  switch (getAcrCloudState(acrCloud)) {
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

const getAcrCloudColor = (acrCloud?: any) => {
  switch (getAcrCloudState(acrCloud)) {
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

export default function ReleasesPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('/api/releases');
        const data = await res.json();
        if (data.success) {
          setReleases(data.releases);
        } else {
          setError(data.error || 'Failed to fetch releases');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  // Render DSP chips with icons
  const renderDSPChips = (stores: string[]) => {
    if (!Array.isArray(stores) || stores.length === 0) {
      return 'None';
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
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
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: dsp.color,
                  color: '#fff',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isFAIcon ? (
                  <FontAwesomeIcon 
                    icon={dsp.icon} 
                    style={{ 
                      fontSize: '0.7rem',
                      color: '#fff'
                    }} 
                  />
                ) : (
                  <Store sx={{ fontSize: '0.7rem', color: '#fff' }} />
                )}
              </Avatar>
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">All Releases</Typography>
        <Typography variant="body1" color="text.secondary">
          Review release status, stores, dates, and track counts from one workspace.
        </Typography>
      </Paper>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : releases.length === 0 ? (
        <Alert severity="info">No releases found.</Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <List>
            {releases.map((release, idx) => (
              <div key={release._id || idx}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={<b>{release.releaseTitle || 'Untitled Release'}</b>}
                    secondary={
                      <>
                        <span>Artist: {release.primaryArtist || 'N/A'} | Type: {release.releaseType} | Date: {release.releaseDate?.slice(0,10) || 'N/A'}</span><br/>
                        <span>Tracks: {release.tracks?.length || 0} | DSPs: {renderDSPChips(release.stores || [])}</span>
                        {Array.isArray(release.tracks) && release.tracks.some((track: any) => track?.acrCloud) && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                            {release.tracks.map((track: any, trackIdx: number) => track?.acrCloud ? (
                              <Tooltip key={trackIdx} title={track.acrCloud.lastError || `${track.title || `Track ${trackIdx + 1}`} ACRCloud verification`}>
                                <Chip
                                  size="small"
                                  icon={getAcrCloudState(track.acrCloud) === 'pending' ? <CircularProgress size={12} /> : <PlaylistAddCheck fontSize="small" />}
                                  label={`${track.title || `Track ${trackIdx + 1}`}: ${getAcrCloudLabel(track.acrCloud)}`}
                                  color={getAcrCloudColor(track.acrCloud) as any}
                                  variant="outlined"
                                />
                              </Tooltip>
                            ) : null)}
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {idx < releases.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
