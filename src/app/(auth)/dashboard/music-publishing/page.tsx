'use client';

import { useEffect, useState, type ReactElement, type SyntheticEvent } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle, LibraryMusic, PendingActions } from '@mui/icons-material';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';

type UserPublishingTab = 'pending' | 'approved';
type TrackMetadataRow = Record<string, string>;

const publishingTabs: Array<{ value: UserPublishingTab; label: string; icon: ReactElement }> = [
  { value: 'pending', label: 'Pending', icon: <PendingActions fontSize="small" /> },
  { value: 'approved', label: 'Approved', icon: <CheckCircle fontSize="small" /> },
];

const visibleColumns: Array<{ key: string; label: string }> = [
  { key: 'releaseTitle', label: 'Release Title' },
  { key: 'title', label: 'Track Title' },
  { key: 'artist', label: 'Primary Artist' },
  { key: 'isrc', label: 'ISRC' },
  { key: 'releaseDate', label: 'Release Date' },
  { key: 'label', label: 'Label' },
  { key: 'trackNumber', label: 'Track Number' },
];

export default function MusicPublishingPage() {
  const theme = useTheme();
  const [rows, setRows] = useState<TrackMetadataRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<UserPublishingTab>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadTracks() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `/api/music-publishing/tracks?tab=${activeTab}&page=${page + 1}&limit=${rowsPerPage}`,
          { signal: controller.signal }
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Failed to load publishing tracks');
        }
        setRows(Array.isArray(payload.data?.tracks) ? payload.data.tracks : []);
        setTotal(Number(payload.data?.total || 0));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setRows([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Failed to load publishing tracks');
      } finally {
        setLoading(false);
      }
    }

    loadTracks();
    return () => controller.abort();
  }, [activeTab, page, rowsPerPage]);

  const handleTabChange = (_event: SyntheticEvent, value: UserPublishingTab) => {
    setActiveTab(value);
    setPage(0);
  };

  return (
    <Box sx={{ px: { xs: 0, md: 1 }, py: 1, maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <PremiumHeader
        eyebrow="Publishing"
        title="Music Publishing"
        description="Track publishing registrations moving through admin review."
      />

      <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), p: { xs: 2, md: 2.5 }, mb: 2 }}>
        <Stack spacing={2}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
            aria-label="Music publishing status tabs"
            sx={{
              minHeight: 44,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 850,
              },
            }}
          >
            {publishingTabs.map(item => (
              <Tab
                key={item.value}
                value={item.value}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
              />
            ))}
          </Tabs>

          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Chip icon={<LibraryMusic />} label={`${total} Tracks`} variant="outlined" />
            <Chip
              color={activeTab === 'approved' ? 'success' : 'warning'}
              label={activeTab === 'approved' ? 'Admin Approved' : 'Awaiting Approval'}
            />
          </Stack>
        </Stack>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Paper elevation={0} sx={{ ...premiumSurfaceSx(theme), maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer
              sx={{
                maxHeight: 'calc(100vh - 340px)',
                overflowX: 'auto',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99,102,241,0.55) transparent',
                '&::-webkit-scrollbar': { height: 8, width: 8 },
                '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(99,102,241,0.48)',
                  borderRadius: 999,
                },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(99,102,241,0.75)' },
              }}
            >
              <Table stickyHeader size="small" aria-label="music publishing tracks table">
                <TableHead>
                  <TableRow>
                    {visibleColumns.map(column => (
                      <TableCell key={column.key} sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length}>
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                          <Typography fontWeight={800}>No publishing tracks found</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activeTab === 'approved'
                              ? 'Tracks approved by admin appear here.'
                              : 'Tracks waiting for admin publishing approval appear here.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map(row => (
                      <TableRow key={row.id} hover>
                        {visibleColumns.map(column => (
                          <TableCell key={column.key} sx={{ maxWidth: 240 }}>
                            <Typography
                              variant="body2"
                              title={row[column.key] || ''}
                              style={{ wordBreak: 'break-word' }}
                            >
                              {row[column.key] || '-'}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                px: 2,
                py: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <FormControl size="small" sx={{ minWidth: 130, display: { xs: 'none', sm: 'flex' } }}>
                <InputLabel id="user-publishing-page-size-label">Page Size</InputLabel>
                <Select
                  labelId="user-publishing-page-size-label"
                  label="Page Size"
                  value={rowsPerPage}
                  onChange={event => {
                    setRowsPerPage(Number(event.target.value));
                    setPage(0);
                  }}
                >
                  {[25, 50, 100, 250].map(value => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[25, 50, 100, 250]}
                onRowsPerPageChange={event => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
