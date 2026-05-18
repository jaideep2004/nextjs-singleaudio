'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Download, LibraryMusic, PlaylistAddCheck, SelectAll } from '@mui/icons-material';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';

type TrackMetadataRow = Record<string, string>;

const columns: Array<{ key: string; label: string }> = [
  { key: 'releaseTitle', label: 'Release Title' },
  { key: 'releaseType', label: 'Release Type' },
  { key: 'releaseStatus', label: 'Release Status' },
  { key: 'releaseDate', label: 'Release Date' },
  { key: 'label', label: 'Label' },
  { key: 'releaseUpc', label: 'Release UPC' },
  { key: 'ownerName', label: 'Owner Name' },
  { key: 'ownerEmail', label: 'Owner Email' },
  { key: 'trackNumber', label: 'Track Number' },
  { key: 'discNumber', label: 'Disc Number' },
  { key: 'title', label: 'Track Title' },
  { key: 'version', label: 'Version' },
  { key: 'artist', label: 'Primary Artist' },
  { key: 'featuring', label: 'Featuring' },
  { key: 'remixer', label: 'Remixer' },
  { key: 'isrc', label: 'ISRC' },
  { key: 'trackUpc', label: 'Track UPC' },
  { key: 'duration', label: 'Duration' },
  { key: 'genre', label: 'Genre' },
  { key: 'subgenre', label: 'Subgenre' },
  { key: 'metadataLanguage', label: 'Metadata Language' },
  { key: 'audioLanguage', label: 'Audio Language' },
  { key: 'explicit', label: 'Explicit' },
  { key: 'parentalAdvisory', label: 'Parental Advisory' },
  { key: 'instrumental', label: 'Instrumental' },
  { key: 'composers', label: 'Composers' },
  { key: 'publishers', label: 'Publishers' },
  { key: 'producers', label: 'Producers' },
  { key: 'copyrightC', label: 'Copyright C' },
  { key: 'copyrightCYear', label: 'Copyright C Year' },
  { key: 'copyrightP', label: 'Copyright P' },
  { key: 'copyrightPYear', label: 'Copyright P Year' },
  { key: 'recordingYear', label: 'Recording Year' },
  { key: 'originalReleaseDate', label: 'Original Release Date' },
  { key: 'contributors', label: 'Contributors' },
  { key: 'territories', label: 'Territories' },
  { key: 'stores', label: 'DSPs' },
  { key: 'audioFile', label: 'Audio File' },
  { key: 'audioUrl', label: 'Audio URL' },
  { key: 'acrState', label: 'ACR State' },
  { key: 'acrSummary', label: 'ACR Match' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
];

const visibleColumns = columns.slice(0, 14);

const audiamColumns: Array<{
  key: string;
  label: string;
  getValue: (row: TrackMetadataRow) => string;
}> = [
  {
    key: 'audiamEmail',
    label: 'Email linked to Audiam Account',
    getValue: () => 'legal@singleaudio.com',
  },
  { key: 'songTitle', label: 'Song Title', getValue: row => row.title || '' },
  { key: 'titleAka', label: 'Title AKA', getValue: row => row.version || '' },
  { key: 'iswc', label: 'ISWC', getValue: () => '' },
  {
    key: 'publisherRepresented',
    label: 'Publisher you represent',
    getValue: () => 'Single Audio Private Limited',
  },
  { key: 'pro', label: 'PRO', getValue: () => '' },
  { key: 'publisherIpi', label: 'Publisher IPI Number', getValue: () => '' },
  {
    key: 'writerName',
    label: 'Writer Name',
    getValue: row => row.lyricists || row.composers || '',
  },
  { key: 'writerIpi', label: 'Writer IPI Number', getValue: () => '' },
  { key: 'percentageControlled', label: 'Percentage Controlled', getValue: () => '100' },
  { key: 'publicDomain', label: 'Public Domain?', getValue: () => 'No' },
  { key: 'territories', label: 'Territories', getValue: () => 'Worldwide' },
  { key: 'artist', label: 'Artist', getValue: row => row.artist || row.ownerName || '' },
  {
    key: 'isrc',
    label: 'ISRC (if multiple ISRCs, please separate with commas)',
    getValue: row => row.isrc || '',
  },
  {
    key: 'youtubeUrl',
    label: 'If No ISRC, URL Of A Video in YouTube using the song',
    getValue: () => '',
  },
];

function xmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildExcelXml(rows: TrackMetadataRow[]) {
  const header = audiamColumns
    .map(column => `<Cell><Data ss:Type="String">${xmlEscape(column.label)}</Data></Cell>`)
    .join('');
  const body = rows
    .map(
      row =>
        `<Row>${audiamColumns
          .map(
            column =>
              `<Cell><Data ss:Type="String">${xmlEscape(column.getValue(row))}</Data></Cell>`
          )
          .join('')}</Row>`
    )
    .join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Track Metadata">
  <Table>
   <Row>${header}</Row>
   ${body}
  </Table>
 </Worksheet>
</Workbook>`;
}

export default function AdminMusicPublishingPage() {
  const theme = useTheme();
  const [rows, setRows] = useState<TrackMetadataRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectCount, setSelectCount] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedRows = useMemo(
    () => rows.filter(row => selectedIds.includes(row.id)),
    [rows, selectedIds]
  );

  const allPageSelected = rows.length > 0 && rows.every(row => selectedIds.includes(row.id));

  useEffect(() => {
    const controller = new AbortController();

    async function loadTracks() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `/api/admin/music-publishing/tracks?page=${page + 1}&limit=${rowsPerPage}`,
          {
            signal: controller.signal,
          }
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Failed to load track metadata');
        }
        setRows(Array.isArray(payload.data?.tracks) ? payload.data.tracks : []);
        setTotal(Number(payload.data?.total || 0));
        setSelectedIds([]);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setRows([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Failed to load track metadata');
      } finally {
        setLoading(false);
      }
    }

    loadTracks();
    return () => controller.abort();
  }, [page, rowsPerPage]);

  const handleSelectRow = (id: string) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleSelectPage = () => {
    setSelectedIds(allPageSelected ? [] : rows.map(row => row.id));
  };

  const handleSelectCount = () => {
    setSelectedIds(rows.slice(0, Math.min(selectCount, rows.length)).map(row => row.id));
  };

  const handleExport = () => {
    if (!selectedRows.length) return;
    const xml = buildExcelXml(selectedRows);
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `track-metadata-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ px: { xs: 0, md: 1 }, py: 1, maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <PremiumHeader
        eyebrow="Admin Publishing"
        title="Music Publishing"
        description="Export track metadata for publishing, rights, and catalog operations."
      />

      <Paper
        elevation={0}
        sx={{
          ...premiumSurfaceSx(theme),
          p: { xs: 2, md: 2.5 },
          mb: 2,
          overflow: 'visible',
        }}
      >
        <Stack direction="column" spacing={2} alignItems="stretch" sx={{ minWidth: 0 }}>
          <Box sx={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Chip icon={<LibraryMusic />} label={`${total} Tracks`} variant="outlined" />
              <Chip
                icon={<PlaylistAddCheck />}
                label={`${selectedRows.length} Selected`}
                color="primary"
              />
            </Stack>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            useFlexGap
            flexWrap="wrap"
            sx={{
              flex: '1 1 100%',
              width: '100%',
              minWidth: 0,
              justifyContent: 'flex-start',
              alignItems: { xs: 'stretch', sm: 'center' },
              '& .MuiButton-root': {
                minHeight: 44,
                whiteSpace: 'nowrap',
                flex: { xs: '1 1 100%', sm: '0 0 auto' },
              },
            }}
          >
            <TextField
              label="Select Count"
              type="number"
              size="small"
              value={selectCount}
              onChange={event => setSelectCount(Math.max(1, Number(event.target.value || 1)))}
              inputProps={{ min: 1, max: rowsPerPage }}
              sx={{ width: { xs: '100%', sm: 160 } }}
            />
            <Button
              variant="outlined"
              startIcon={<SelectAll />}
              onClick={handleSelectCount}
              disabled={!rows.length}
            >
              Select Count
            </Button>
            <Button variant="outlined" onClick={handleSelectPage} disabled={!rows.length}>
              {allPageSelected ? 'Clear Page' : 'Select Page'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={!selectedRows.length}
            >
              Export Excel
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{ ...premiumSurfaceSx(theme), maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}
      >
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer
              sx={{
                maxHeight: 'calc(100vh - 310px)',
                overflowX: 'auto',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99,102,241,0.55) transparent',
                '&::-webkit-scrollbar': {
                  height: 8,
                  width: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(99,102,241,0.48)',
                  borderRadius: 999,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: 'rgba(99,102,241,0.75)',
                },
              }}
            >
              <Table stickyHeader size="small" aria-label="track metadata export table">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allPageSelected}
                        indeterminate={selectedIds.length > 0 && !allPageSelected}
                        onChange={handleSelectPage}
                        inputProps={{ 'aria-label': 'Select all visible tracks' }}
                      />
                    </TableCell>
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
                      <TableCell colSpan={visibleColumns.length + 1}>
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                          <Typography fontWeight={800}>No track metadata found</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Submitted releases with tracks appear here.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map(row => {
                      const checked = selectedIds.includes(row.id);
                      return (
                        <TableRow key={row.id} hover selected={checked}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={checked}
                              onChange={() => handleSelectRow(row.id)}
                              inputProps={{ 'aria-label': `Select ${row.title || 'track'}` }}
                            />
                          </TableCell>
                          {visibleColumns.map(column => (
                            <TableCell key={column.key} sx={{ maxWidth: 220 }}>
                              <Typography
                                variant="body2"
                                title={row[column.key] || ''}
                                style={{ wordBreak: 'break-all' }}
                              >
                                {row[column.key] || '-'}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
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
                <InputLabel id="page-size-label">Page Size</InputLabel>
                <Select
                  labelId="page-size-label"
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
                onPageChange={(_, nextPage) => setPage(nextPage)}
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
