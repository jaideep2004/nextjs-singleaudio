"use client";
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';

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
                        <span>Tracks: {release.tracks?.length || 0} | DSPs: {release.stores?.join(', ') || 'None'}</span>
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
