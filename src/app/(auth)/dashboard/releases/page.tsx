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
  Tooltip
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
import { Store } from '@mui/icons-material';

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
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">All Releases</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : releases.length === 0 ? (
        <Alert severity="info">No releases found.</Alert>
      ) : (
        <Paper sx={{ p: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
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