'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
  Card,
  CardContent,
  Radio,
  FormControl,
  Divider,
  CircularProgress,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Tooltip,
  Fade,
  Slide,
  Avatar,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  MusicNote,
  Album,
  LibraryMusic,
  ArrowForward,
  ArrowBack,
  CloudUpload,
  Delete,
  Add,
  ExpandMore,
  Info,
  CheckCircle,
  AudioFile,
  Image,
  PlayArrow,
  Stop,
  PlaylistAddCheck,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import Cookies from 'js-cookie';
import countries from '@/utils/countries';
import { ALL_DSP_KEYS, DSP_META, DspMeta, DspKey } from '@/lib/platforms';
import { PremiumHeader, premiumSurfaceSx } from '@/components/premium/PremiumSurface';
import {
  AcrCloudStatusLike,
  fetchAcrCloudScanResult,
  getAcrCloudColor,
  getAcrCloudLabel,
  getAcrCloudState,
  getAcrCloudSummary,
} from '@/lib/acrCloud';

// Helper: call Express API for uploads (uses NEXT_PUBLIC_API_URL in browser)
const API_BASE = (
  typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_API_URL || '').startsWith('http')
    ? process.env.NEXT_PUBLIC_API_URL!
    : 'http://localhost:5000/api'
)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '') + '/api';
const VERCEL_FUNCTION_UPLOAD_LIMIT_BYTES = 4.5 * 1024 * 1024;
const VERCEL_FUNCTION_UPLOAD_SAFE_BYTES = 4.3 * 1024 * 1024;
const isVercelFunctionUploadTarget =
  typeof window !== 'undefined' && /^https:\/\/[^/]+\.vercel\.app\/api$/.test(API_BASE);

const assertVercelUploadSize = (file: File, type: 'artwork' | 'audio') => {
  if (!isVercelFunctionUploadTarget || file.size <= VERCEL_FUNCTION_UPLOAD_SAFE_BYTES) return;

  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
  const limitMb = (VERCEL_FUNCTION_UPLOAD_LIMIT_BYTES / (1024 * 1024)).toFixed(1);
  throw new Error(
    `${type === 'audio' ? 'Audio' : 'Artwork'} file is ${sizeMb}MB. Vercel Functions only accept about ${limitMb}MB request bodies. Upload via direct storage or deploy the Express upload server on a non-serverless Node host.`
  );
};

type AcrCloudUploadState = AcrCloudStatusLike;

const resizeList = <T,>(items: T[], length: number, fallback: T): T[] => {
  if (items.length === length) return items;
  if (items.length > length) return items.slice(0, length);
  return [...items, ...Array.from({ length: length - items.length }, () => fallback)];
};

async function uploadArtworkToServer(file: File): Promise<{ url: string; filename: string }> {
  assertVercelUploadSize(file, 'artwork');
  const fd = new FormData();
  fd.append('artwork', file);
  const token = Cookies.get('token');
  const res = await fetch(`${API_BASE}/uploads/artwork`, {
    method: 'POST',
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to upload artwork');
  }
  const data = await res.json();
  return { url: data.url, filename: data.filename };
}

async function uploadAudioToServer(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; filename: string; acrCloud?: AcrCloudUploadState }> {
  assertVercelUploadSize(file, 'audio');
  const fd = new FormData();
  fd.append('audio', file);
  const token = Cookies.get('token');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/uploads/audio`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.min(100, Math.round((100 * ev.loaded) / ev.total)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.url, filename: data.filename, acrCloud: data.acrCloud });
        } catch {
          reject(new Error('Invalid upload response'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error || xhr.statusText || 'Failed to upload audio'));
        } catch {
          reject(new Error('Failed to upload audio'));
        }
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
}

// Define release types

type ReleaseType = 'single' | 'ep' | 'album';

interface TrackData {
  id: string;
  title: string;
  version: string;
  primaryArtist: string;
  featuring: string;
  remixer: string;
  audioFile: File | null;
  duration: string;
  isrc: string;
  explicit: boolean;
  genre: string;
  subgenre: string;
  composers: string;
  publishers: string;
  producers: string;
  lyrics: string;
  copyrightC: string;
  copyrightP: string;
  recordingYear: string;
  language: string;
  instrumental: boolean;
}

interface ReleaseData {
  releaseType: ReleaseType;
  releaseTitle: string;
  primaryArtist: string;
  label: string;
  upc: string;
  releaseDate: string;
  artwork: File | null;
  territories: string[];
  stores: string[];
  tracks: TrackData[];
}

interface ReleaseTypeOption {
  value: ReleaseType;
  label: string;
  description: string;
  icon: React.ReactNode;
  minTracks: number;
  maxTracks: number;
  color: string;
}

const releaseTypes: ReleaseTypeOption[] = [
  {
    value: 'single',
    label: 'Single',
    description: '1-2 tracks perfect for focused promotion',
    icon: <MusicNote sx={{ fontSize: 40 }} />,
    minTracks: 1,
    maxTracks: 2,
    color: '#1976d2',
  },
  {
    value: 'ep',
    label: 'EP',
    description: '3-7 tracks for extended storytelling',
    icon: <Album sx={{ fontSize: 40 }} />,
    minTracks: 3,
    maxTracks: 7,
    color: '#ed6c02',
  },
  {
    value: 'album',
    label: 'Album',
    description: 'Up to 50 tracks for complete artistic vision',
    icon: <LibraryMusic sx={{ fontSize: 40 }} />,
    minTracks: 7,
    maxTracks: 50,
    color: '#2e7d32',
  },
];

const genres = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'Folk', 'Reggae', 'Blues', 'R&B', 'Alternative', 'Indie', 'Metal', 'Punk', 'Other'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

// Define steps (combined flow)
const steps = [
  'Select Release Type',
  'Artwork',
  'Tracks & Info',
  'Distribution Providers',
  'Territories & Rights',
  'Review & Submit',
];

// --- helpers: formatting for analysis data ---
const formatDuration = (seconds: number | string) => {
  const s = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  if (!Number.isFinite(s)) return '';
  const mins = Math.floor(s / 60);
  const secs = Math.round(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatBitrate = (bpsOrKbps?: number) => {
  if (!bpsOrKbps || !Number.isFinite(bpsOrKbps)) return '';
  // Some analyzers return kbps already; if very large, treat as bps
  return bpsOrKbps > 10000 ? `${Math.round(bpsOrKbps / 1000)} kbps` : `${Math.round(bpsOrKbps)} kbps`;
};

function AcrCloudResultPanel({
  acrCloud,
  progress,
}: {
  acrCloud?: AcrCloudUploadState | null;
  progress: number;
}) {
  if (!acrCloud) return null;

  const state = getAcrCloudState(acrCloud);
  const showProgress = state === 'pending' || (progress > 0 && progress < 100);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>ACRCloud verification</Typography>
          <Typography variant="caption" color="text.secondary">
            Scan details are available to admins during release review.
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={state === 'pending' ? <CircularProgress size={12} /> : <PlaylistAddCheck fontSize="small" />}
          label={getAcrCloudLabel(acrCloud)}
          color={getAcrCloudColor(acrCloud) as any}
          variant="outlined"
        />
      </Box>

      {showProgress ? (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">ACR scan progress</Typography>
            <Typography variant="caption" color="text.secondary">{progress}%</Typography>
          </Box>
          <LinearProgress
            variant={state === 'pending' ? 'determinate' : 'determinate'}
            value={Math.min(100, Math.max(0, progress))}
            sx={{ height: 7, borderRadius: 4, '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
          />
        </Box>
      ) : null}

      {acrCloud.lastError ? (
        <Alert severity={state === 'not_configured' ? 'info' : 'error'} sx={{ mb: 2 }}>
          {acrCloud.lastError}
        </Alert>
      ) : null}
    </Paper>
  );
}

import TerritoryManager, { TerritoryMode } from '@/components/territory/TerritoryManager';
import RightsManager, { RightsType } from '@/components/rights/RightsManager';
// --- TrackInfo type (inline, since not using TrackInfoForm) ---
type ContributorRole = 'artist' | 'performer' | 'composer' | 'lyricist' | 'producer' | 'publisher' | 'remixer' | 'other';

interface TrackContributor {
  role: ContributorRole;
  name: string;
}  
 
interface TrackInfo { 
  title: string;
  version: string;
  artist: string;
  featuring: string;
  remixer: string;
  isrc: string;
  upc: string;
  language: string;
  metadataLanguage: string;
  audioLanguage: string;
  explicit: boolean;
  genre: string;
  subgenre: string;
  trackNumber: number;
  discNumber: number;
  duration: string;
  composers: string;
  publishers: string;
  producers: string;
  lyrics: string;
  copyrightC: string;
  copyrightP: string;
  copyrightCYear: string;
  copyrightPYear: string;
  recordingYear: string;
  originalReleaseDate: string;
  parentalAdvisory: string;
  instrumental: boolean;
  contributors: TrackContributor[];
}

const contributorRoles: { value: ContributorRole; label: string }[] = [
  { value: 'artist', label: 'Artist' },
  { value: 'performer', label: 'Performer' },
  { value: 'composer', label: 'Composer' },
  { value: 'lyricist', label: 'Lyricist' },
  { value: 'producer', label: 'Producer' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'remixer', label: 'Remixer' },
  { value: 'other', label: 'Other' },
];

const currentYear = new Date().getFullYear();
const copyrightYears = Array.from({ length: 80 }, (_, index) => String(currentYear - index));

const cloneTrackInfo = (info: TrackInfo): TrackInfo => ({
  ...info,
  contributors: info.contributors.map(contributor => ({ ...contributor })),
});

const createDefaultTrackInfo = (): TrackInfo => cloneTrackInfo(defaultTrackInfo);

const defaultTrackInfo: TrackInfo = {
  title: '',
  version: '',
  artist: '',
  featuring: '',
  remixer: '',
  isrc: '',
  upc: '',
  language: '',
  metadataLanguage: '',
  audioLanguage: '',
  explicit: false,
  genre: '',
  subgenre: '',
  trackNumber: 1,
  discNumber: 1, 
  duration: '',
  composers: '',
  publishers: '',   
  lyrics: '',
  producers: '',
  copyrightC: '',
  copyrightP: '',
  copyrightCYear: String(currentYear),
  copyrightPYear: String(currentYear),
  recordingYear: '',
  originalReleaseDate: '',
  parentalAdvisory: 'none',
  instrumental: false,
  contributors: [{ role: 'artist', name: '' }],
};

export default function UploadPage() {
  const theme = useTheme();
  // ...existing state
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [releaseTitle, setReleaseTitle] = useState('');
  const [label, setLabel] = useState('');
  const [upc, setUpc] = useState('');
  const [autoGenerateCodes, setAutoGenerateCodes] = useState(true);
  const [allowedDspKeys, setAllowedDspKeys] = useState<DspKey[] | null>(null);
  const [platformAccessError, setPlatformAccessError] = useState('');
  // ...existing state

  // All hooks must be at the top and called unconditionally
  const auth = useAuth();
  // All useState hooks declared at the top in consistent order
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [releaseType, setReleaseType] = useState<ReleaseType>('single');
  const [tracks, setTracks] = useState<File[]>([]);
  // Which track is being edited in the right-side form
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // Step 1 track analysis state (must always be declared after tracks)
  const [analysisResults, setAnalysisResults] = useState<(any | null)[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState<boolean[]>([]);
  const [analysisErrors, setAnalysisErrors] = useState<(string | null)[]>([]);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Track upload progress indicator (indeterminate for now)
  const [trackUploading, setTrackUploading] = useState<boolean[]>([]);
  const [audioUploadPct, setAudioUploadPct] = useState<number[]>([]);
  const [acrCloudProgressPct, setAcrCloudProgressPct] = useState<number[]>([]);
  const appendTracksInputRef = useRef<HTMLInputElement | null>(null);
  const acrCloudPollRef = useRef<Record<number, string>>({});
  // Uploaded media (server) state
  const [artworkUploadedUrl, setArtworkUploadedUrl] = useState<string | null>(null);
  const [artworkUploadedFilename, setArtworkUploadedFilename] = useState<string | null>(null);
  const [audioUploadedUrls, setAudioUploadedUrls] = useState<(string | null)[]>([]);
  const [audioUploadedFilenames, setAudioUploadedFilenames] = useState<(string | null)[]>([]);
  const [audioAcrCloudStatuses, setAudioAcrCloudStatuses] = useState<(AcrCloudUploadState | null)[]>([]);
  const [territoryCountries, setTerritoryCountries] = useState<string[]>([]);
  const [territoryMode, setTerritoryMode] = useState<TerritoryMode>('allowed');
  const [rightsType, setRightsType] = useState<RightsType>('exclusive');
  const [rightsDescription, setRightsDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null); 
  const [analysisError, setAnalysisError] = useState('');
  // Multi-track info state for Track Information step
  const [trackInfos, setTrackInfos] = useState<TrackInfo[]>([]);
  // Distribution Step State
  const DSP_LIST = DSP_META;
  type DspItem = DspMeta;
  const visibleDSPs = useMemo(() => {
    const allow = new Set(((allowedDspKeys ?? ALL_DSP_KEYS) as string[]));
    return DSP_LIST.filter((dsp: DspItem) => allow.has(dsp.key));
  }, [allowedDspKeys]);

  const [selectedDSPs, setSelectedDSPs] = useState<DspKey[]>([]);
  const [releaseWorldwide, setReleaseWorldwide] = useState(true);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [originalReleaseDate, setOriginalReleaseDate] = useState<string>("");
  // Artwork loading indicator
  const [artworkUploading, setArtworkUploading] = useState<boolean>(false);
  // Local audio preview URLs for each selected track
  const [trackPreviewUrls, setTrackPreviewUrls] = useState<(string | null)[]>([]);
  // Snackbar for "Apply to all"
  const [snackOpen, setSnackOpen] = useState(false);
  const [trackValidationAttempted, setTrackValidationAttempted] = useState(false);
  const [reviewTerritoriesExpanded, setReviewTerritoriesExpanded] = useState(false);

  // Computed values (not state)
  const isPlatformAccessLoading = allowedDspKeys === null;
  const allSelected = visibleDSPs.length > 0 && selectedDSPs.length === visibleDSPs.length;

  const ensureTrackStateLength = (length: number) => {
    setAnalysisResults((arr) => resizeList(arr, length, null));
    setAnalysisLoading((arr) => resizeList(arr, length, false));
    setAnalysisErrors((arr) => resizeList(arr, length, null));
    setTrackUploading((arr) => resizeList(arr, length, false));
    setAudioUploadPct((arr) => resizeList(arr, length, 0));
    setAcrCloudProgressPct((arr) => resizeList(arr, length, 0));
    setAudioUploadedUrls((arr) => resizeList(arr, length, null));
    setAudioUploadedFilenames((arr) => resizeList(arr, length, null));
    setAudioAcrCloudStatuses((arr) => resizeList(arr, length, null));
    setTrackInfos((arr) => {
      if (arr.length === length) return arr;
      if (arr.length > length) return arr.slice(0, length);
      return [
        ...arr,
        ...Array.from({ length: length - arr.length }, (_, offset) => ({
          ...createDefaultTrackInfo(),
          trackNumber: arr.length + offset + 1,
        })),
      ];
    });
  };

  const setTrackTitleFromFile = (index: number, file: File) => {
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    if (!baseName) return;
    setTrackInfos((prev) =>
      prev.map((info, i) => (i === index ? { ...info, title: info.title.trim() ? info.title : baseName } : info))
    );
  };

  const setAcrCloudPending = (index: number, progress = 5) => {
    setAudioAcrCloudStatuses((prev) => prev.map((status, i) => (i === index ? { ...(status || {}), state: 'pending' } : status)));
    setAcrCloudProgressPct((prev) => prev.map((pct, i) => (i === index ? Math.max(pct, progress) : pct)));
  };

  const getContributorNames = (track: TrackInfo, role: ContributorRole) =>
    track.contributors
      .filter(contributor => contributor.role === role && contributor.name.trim())
      .map(contributor => contributor.name.trim())
      .join(', ');

  

  // Simulate release submission to DSPs
  const handleSubmitRelease = async () => {
    setSubmitState('loading');
    // Gather release data
    const releasePayload = {
      releaseType,
      releaseTitle,
      primaryArtist: trackInfos[0] ? getContributorNames(trackInfos[0], 'artist') : '',
      label,
      upc,
      autoGenerateCodes,
      releaseDate,
      originalReleaseDate,
      artworkUrl: artworkUploadedUrl,
      artworkFile: artworkUploadedFilename,
      territories: territoryCountries,
      stores: selectedDSPs,
      tracks: trackInfos.map((t, idx) => ({
        contributors: t.contributors.filter(contributor => contributor.name.trim()),
        title: t.title,
        artist: getContributorNames(t, 'artist') || t.artist,
        genre: t.genre,
        language: t.audioLanguage || t.language,
        metadataLanguage: t.metadataLanguage,
        audioLanguage: t.audioLanguage || t.language,
        explicit: t.explicit,
        composers: getContributorNames(t, 'composer') || t.composers,
        publishers: getContributorNames(t, 'publisher') || t.publishers,
        producers: getContributorNames(t, 'producer') || t.producers,
        lyrics: t.lyrics,
        copyrightC: t.copyrightC,
        copyrightP: t.copyrightP,
        copyrightCYear: t.copyrightCYear,
        copyrightPYear: t.copyrightPYear,
        recordingYear: t.recordingYear,
        duration: t.duration,
        isrc: t.isrc,
        upc: t.upc,
        trackNumber: t.trackNumber,
        discNumber: t.discNumber,
        parentalAdvisory: t.parentalAdvisory,
        instrumental: t.instrumental,
        subgenre: t.subgenre,
        version: t.version,
        featuring: getContributorNames(t, 'performer') || t.featuring,
        remixer: getContributorNames(t, 'remixer') || t.remixer,
        originalReleaseDate: t.originalReleaseDate || originalReleaseDate,
        audioUrl: audioUploadedUrls[idx] || null,
        audioFile: audioUploadedFilenames[idx] || null,
        acrCloud: audioAcrCloudStatuses[idx] || null,
      }))
    };
    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releasePayload)
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => setSubmitState('success'), 1200); // Simulate DSP delay
      } else {
        setSubmitState('idle');
        alert('Failed to save release: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      setSubmitState('idle');
      alert('Failed to save release: ' + e.message);
    }
  };


  const isDistributionValid = selectedDSPs.length > 0;

  // Event handlers
  const handleDSPToggle = (key: DspKey) => {
    setSelectedDSPs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const handleSelectAll = () => {
    if (visibleDSPs.length === 0) return;
    setSelectedDSPs(allSelected ? [] : visibleDSPs.map((dsp: DspItem) => dsp.key));
  };
  const handleContinue = () => {
    if (isDistributionValid) handleNext();
  };

  // Keep trackInfos in sync with tracks length
  useEffect(() => {
    setTrackInfos(prev => {
      if (prev.length < tracks.length) {
        return [...prev, ...Array.from({ length: tracks.length - prev.length }, createDefaultTrackInfo)];
      } else if (prev.length > tracks.length) {
        return prev.slice(0, tracks.length);
      }
      return prev;
    });
  }, [tracks.length]);

  // Handler to update a field for a specific track
  const handleTrackInfoChange = (idx: number, field: keyof TrackInfo, value: any) => {
    setTrackInfos(prev => prev.map((info, i) => i === idx ? { ...info, [field]: value } : info));
  };

  const updateContributor = (trackIdx: number, contributorIdx: number, field: keyof TrackContributor, value: string) => {
    setTrackInfos(prev => prev.map((info, i) => {
      if (i !== trackIdx) return info;
      return {
        ...info,
        contributors: info.contributors.map((contributor, cIdx) =>
          cIdx === contributorIdx
            ? { ...contributor, [field]: field === 'role' ? value as ContributorRole : value }
            : contributor
        ),
      };
    }));
  };

  const addContributor = (trackIdx: number) => {
    setTrackInfos(prev => prev.map((info, i) =>
      i === trackIdx
        ? { ...info, contributors: [...info.contributors, { role: 'performer', name: '' }] }
        : info
    ));
  };

  const removeContributor = (trackIdx: number, contributorIdx: number) => {
    setTrackInfos(prev => prev.map((info, i) => {
      if (i !== trackIdx) return info;
      const contributors = info.contributors.filter((_, cIdx) => cIdx !== contributorIdx);
      return { ...info, contributors: contributors.length ? contributors : [{ role: 'artist', name: '' }] };
    }));
  };

  const handleApplyTrackInfoToAll = (idx: number) => {
    const source = trackInfos[idx];
    if (!source) return;
    const shareable = cloneTrackInfo(source);
    delete (shareable as Partial<TrackInfo>).title;
    delete (shareable as Partial<TrackInfo>).originalReleaseDate;
    delete (shareable as Partial<TrackInfo>).artist;
    delete (shareable as Partial<TrackInfo>).featuring;
    delete (shareable as Partial<TrackInfo>).isrc;
    delete (shareable as Partial<TrackInfo>).upc;
    delete (shareable as Partial<TrackInfo>).copyrightC;
    delete (shareable as Partial<TrackInfo>).copyrightP;
    delete (shareable as Partial<TrackInfo>).copyrightCYear;
    delete (shareable as Partial<TrackInfo>).copyrightPYear;
    delete (shareable as Partial<TrackInfo>).explicit;

    setTrackInfos(prev => prev.map((info, i) => (
      i === idx ? info : { ...info, ...shareable }
    )));
    setSnackOpen(true);
  };

  // Validation: all required fields for all tracks
  const selectedReleaseTypeConfig = releaseTypes.find((t) => t.value === releaseType);
  const minTracksRequired = selectedReleaseTypeConfig?.minTracks ?? 1;

  const trackHasListedArtist = (info: TrackInfo) =>
    info.contributors.some((c) => c.role === 'artist' && c.name.trim());

  const getTrackInfoIssues = () => {
    const issues: Array<{ trackIndex: number | null; message: string }> = [];

    if (tracks.length < minTracksRequired) {
      issues.push({
        trackIndex: null,
        message: `Add at least ${minTracksRequired} track${minTracksRequired === 1 ? '' : 's'} for ${selectedReleaseTypeConfig?.label || 'this release type'}.`,
      });
    }

    tracks.forEach((_, idx) => {
      const info = trackInfos[idx];
      const label = `Track ${idx + 1}`;
      if (!info) {
        issues.push({ trackIndex: idx, message: `${label}: metadata is not ready yet.` });
        return;
      }
      if (!info.title.trim()) issues.push({ trackIndex: idx, message: `${label}: track title is required.` });
      if (!trackHasListedArtist(info)) issues.push({ trackIndex: idx, message: `${label}: add at least one Artist contributor.` });
      if (!info.metadataLanguage) issues.push({ trackIndex: idx, message: `${label}: metadata language is required.` });
      if (!(info.audioLanguage || info.language)) issues.push({ trackIndex: idx, message: `${label}: audio language is required.` });
      if (!info.genre) issues.push({ trackIndex: idx, message: `${label}: genre is required.` });
    });

    if (!releaseDate.trim()) {
      issues.push({ trackIndex: selectedTrackIdx, message: 'Digital release date is required.' });
    }

    return issues;
  };

  const trackInfoIssues = getTrackInfoIssues();
  const selectedTrackMissingArtist =
    trackValidationAttempted &&
    Boolean(trackInfos[selectedTrackIdx]) &&
    !trackHasListedArtist(trackInfos[selectedTrackIdx]);

  const isTrackInfoListValid =
    tracks.length >= minTracksRequired &&
    tracks.every((_, idx) => {
      const info = trackInfos[idx];
      if (!info) return false;
      return (
        info.title.trim() &&
        trackHasListedArtist(info) &&
        info.metadataLanguage &&
        (info.audioLanguage || info.language) &&
        info.genre
      );
    }) &&
    releaseDate.trim();

  const handleTracksInfoContinue = () => {
    setTrackValidationAttempted(true);
    const issues = getTrackInfoIssues();
    if (issues.length) {
      const firstTrackIssue = issues.find((issue) => typeof issue.trackIndex === 'number');
      if (typeof firstTrackIssue?.trackIndex === 'number') {
        setSelectedTrackIdx(firstTrackIssue.trackIndex);
      }
      return;
    }
    handleNext();
  };

  // All useEffect hooks
  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
    return () => {
      acrCloudPollRef.current = {};
    };
  }, []);

  useEffect(() => {
    const loadAllowed = async () => {
      try {
        setPlatformAccessError('');
        const res = await fetch('/api/platforms', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load platform access');
        const keys = Array.isArray(json?.data?.dspKeys) ? (json.data.dspKeys as DspKey[]) : ALL_DSP_KEYS;
        setAllowedDspKeys(keys);
      } catch (error) {
        setPlatformAccessError(error instanceof Error ? error.message : 'Failed to load platform access');
        setAllowedDspKeys(ALL_DSP_KEYS);
      }
    };
    void loadAllowed();
  }, []);

  useEffect(() => {
    const allow = new Set(visibleDSPs.map((d: DspItem) => d.key));
    setSelectedDSPs((prev) => {
      const filtered = prev.filter((k) => allow.has(k));
      return filtered.length ? filtered : visibleDSPs.map((d: DspItem) => d.key);
    });
  }, [visibleDSPs]);

  // Keep analysis / upload state arrays in sync with tracks array length
  useEffect(() => {
    const len = tracks.length;
    setAnalysisResults((arr) => resizeList(arr, len, null));
    setAnalysisLoading((arr) => resizeList(arr, len, false));
    setAnalysisErrors((arr) => resizeList(arr, len, null));
    setTrackUploading((arr) => resizeList(arr, len, false));
    setAudioUploadPct((arr) => resizeList(arr, len, 0));
    setAcrCloudProgressPct((arr) => resizeList(arr, len, 0));
  }, [tracks.length]);

  // When release type changes, only enforce max track count (no empty placeholder slots)
  useEffect(() => {
    const selectedType = releaseTypes.find((t) => t.value === releaseType);
    if (!selectedType) return;
    setTracks((prev) => (prev.length > selectedType.maxTracks ? prev.slice(0, selectedType.maxTracks) : prev));
  }, [releaseType]);

  // Create preview for artwork
  useEffect(() => {
    if (!artworkFile) {
      setArtworkPreview(null);
      setArtworkError(null);
      setArtworkUploading(false);
      return;
    }

    // Validate type
    setArtworkUploading(true);
    if (!['image/jpeg', 'image/png'].includes(artworkFile.type)) {
      setArtworkError('Artwork must be a JPG or PNG image.');
      setArtworkPreview(null);
      setArtworkUploading(false);
      return;
    }
    // Validate size
    if (artworkFile.size > 10 * 1024 * 1024) {
      setArtworkError('Artwork must be less than or equal to 10MB.');
      setArtworkPreview(null);
      setArtworkUploading(false);
      return;
    }
    // Validate dimensions (must be exactly 3000x3000 and square)
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(artworkFile);
    img.onload = () => {
      if (img.width !== 3000 || img.height !== 3000) {
        setArtworkError('Artwork must be exactly 3000x3000 pixels.');
        setArtworkPreview(null);
      } else {
        setArtworkError(null);
        setArtworkPreview(objectUrl);
      }
      setArtworkUploading(false);
      // Do NOT revoke objectUrl here! Only on unmount.
    };
    img.onerror = () => {
      setArtworkError('Invalid image file.');
      setArtworkPreview(null);
      setArtworkUploading(false);
      // Do NOT revoke objectUrl here! Only on unmount.
    };
    img.src = objectUrl;
    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [artworkFile]);

  // Keep preview URLs in sync with selected track files
  useEffect(() => {
    // Revoke old URLs
    return () => {
      trackPreviewUrls.forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTrackPreviewUrls((prev) => {
      // Revoke URLs that are no longer needed
      prev.forEach((url, i) => {
        if (url && (!tracks[i] || i >= tracks.length)) {
          URL.revokeObjectURL(url);
        }
      });
      const next = tracks.map((f, i) => (f ? (prev[i] || URL.createObjectURL(f)) : null));
      return next;
    });
  }, [tracks]);

  // Keep uploaded audio arrays in sync with tracks length
  useEffect(() => {
    setAudioUploadedUrls(arr => resizeList(arr, tracks.length, null));
    setAudioUploadedFilenames(arr => resizeList(arr, tracks.length, null));
    setAudioAcrCloudStatuses(arr => resizeList(arr, tracks.length, null));
  }, [tracks.length]);

  // Safe access to auth context
  const { user } = auth || { user: null };
  
  // File validation for tracks
  const validateTrackFile = (file: File | null) => {
    if (!file) return 'No file selected';
    if (!['audio/mpeg', 'audio/wav', 'audio/flac'].includes(file.type)) return 'Invalid audio format (mp3, wav, flac only)';
    if (file.size > 100 * 1024 * 1024) return 'File size must be <= 100MB';
    return '';
  };

  const handleAppendTracksClick = () => {
    appendTracksInputRef.current?.click();
  };

  const handleRemoveTrack = (index: number) => {
    delete acrCloudPollRef.current[index];
    setTracks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setSelectedTrackIdx((si) => (next.length === 0 ? 0 : Math.min(si, next.length - 1)));
      return next;
    });
    setAnalysisResults((prev) => prev.filter((_, i) => i !== index));
    setAnalysisLoading((prev) => prev.filter((_, i) => i !== index));
    setAnalysisErrors((prev) => prev.filter((_, i) => i !== index));
    setTrackUploading((prev) => prev.filter((_, i) => i !== index));
    setAudioUploadPct((prev) => prev.filter((_, i) => i !== index));
    setAcrCloudProgressPct((prev) => prev.filter((_, i) => i !== index));
    setAudioUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    setAudioUploadedFilenames((prev) => prev.filter((_, i) => i !== index));
    setAudioAcrCloudStatuses((prev) => prev.filter((_, i) => i !== index));
  };

  /** Replace audio for an existing row, or remove row when `file` is null. */
  const handleTrackFileChange = async (index: number, file: File | null) => {
    if (!file) {
      handleRemoveTrack(index);
      return;
    }

    const err = validateTrackFile(file);
    if (err) {
      alert(err);
      return;
    }

    setTracks((prev) => {
      const next = [...prev];
      if (index < next.length) next[index] = file;
      return next;
    });
    ensureTrackStateLength(Math.max(tracks.length, index + 1));

    setAnalysisResults((prev) => prev.map((r, i) => (i === index ? null : r)));
    setAnalysisErrors((prev) => prev.map((e, i) => (i === index ? null : e)));
    setTrackUploading((prev) => prev.map((u, i) => (i === index ? true : u)));
    setAudioUploadPct((prev) => prev.map((p, i) => (i === index ? 1 : p)));
    setAcrCloudPending(index);
    delete acrCloudPollRef.current[index];
    setTrackTitleFromFile(index, file);
    setAnalysisLoading((prev) => prev.map((l, i) => (i === index ? true : l)));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/audio/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        let errMsg = 'Analysis failed';
        try {
          const errBody = await res.json();
          errMsg = errBody?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setAnalysisResults((prev) => prev.map((r, i) => (i === index ? data : r)));
      const dur = data?.duration;
      if (typeof dur === 'number' || typeof dur === 'string') {
        const durStr = formatDuration(dur);
        setTrackInfos((prev) =>
          prev.map((info, i) => (i === index ? { ...info, duration: durStr } : info))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error analyzing audio';
      setAnalysisErrors((prev) => prev.map((e, i) => (i === index ? msg : e)));
    } finally {
      setAnalysisLoading((prev) => prev.map((l, i) => (i === index ? false : l)));
    }

    try {
      const { url, filename, acrCloud } = await uploadAudioToServer(file, (pct) =>
        setAudioUploadPct((prev) => prev.map((p, i) => (i === index ? pct : p)))
      );
      setAudioUploadedUrls((prev) => prev.map((u, i) => (i === index ? url : u)));
      setAudioUploadedFilenames((prev) => prev.map((u, i) => (i === index ? filename : u)));
      setAudioAcrCloudStatuses((prev) => prev.map((status, i) => (i === index ? (acrCloud || { state: 'error', lastError: 'Missing ACRCloud response' }) : status)));
      setAudioUploadPct((prev) => prev.map((p, i) => (i === index ? 100 : p)));
      setAcrCloudProgressPct((prev) => prev.map((p, i) => (i === index ? (getAcrCloudState(acrCloud) === 'pending' ? Math.max(p, 25) : 100) : p)));
      if (acrCloud?.fileId && getAcrCloudState(acrCloud) === 'pending') {
        void pollAcrCloudStatus(index, acrCloud.fileId);
      }
    } catch (e) {
      console.error('Audio upload failed:', e);
      setAudioAcrCloudStatuses((prev) => prev.map((status, i) => (i === index ? { state: 'error', lastError: e instanceof Error ? e.message : 'Audio upload failed' } : status)));
      setAcrCloudProgressPct((prev) => prev.map((p, i) => (i === index ? 100 : p)));
    }
    setTrackUploading((prev) => prev.map((u, i) => (i === index ? false : u)));
  };

  const handleAppendTracksSelected = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const selectedType = releaseTypes.find((t) => t.value === releaseType);
    const max = selectedType?.maxTracks ?? 50;
    const room = max - tracks.length;
    if (room <= 0) return;

    const incoming = Array.from(fileList)
      .filter((f) => validateTrackFile(f) === '')
      .slice(0, room);

    if (!incoming.length) return;

    const startIdx = tracks.length;
    setTracks((prev) => [...prev, ...incoming]);
    ensureTrackStateLength(startIdx + incoming.length);
    if (appendTracksInputRef.current) appendTracksInputRef.current.value = '';

    for (let i = 0; i < incoming.length; i++) {
      await analyzeAndUploadForIndex(startIdx + i, incoming[i]);
    }
  };

  // Handle track analysis
  const handleAnalyzeTrack = async (index: number) => {
    const file = tracks[index];
    if (!file) return;

    // Update loading state for this track
    setAnalysisLoading(prev => prev.map((loading, i) => i === index ? true : loading));
    setAnalysisErrors(prev => prev.map((error, i) => i === index ? null : error));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/audio/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        let errMsg = 'Analysis failed';
        try {
          const errBody = await res.json();
          errMsg = errBody?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      setAnalysisResults(prev => prev.map((result, i) => i === index ? data : result));
    } catch (err: any) {
      setAnalysisErrors(prev => prev.map((error, i) => i === index ? (err.message || 'Error analyzing audio') : error));
    } finally {
      setAnalysisLoading(prev => prev.map((loading, i) => i === index ? false : loading));
    }
  };

  const handleReleaseTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReleaseType(event.target.value as ReleaseType);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Helper: analyze and upload one track (reuses same logic as handleTrackFileChange)
  const analyzeAndUploadForIndex = async (index: number, file: File) => {
    // Set file and reset states
    ensureTrackStateLength(Math.max(tracks.length, index + 1));
    setTracks(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setAnalysisResults(prev => prev.map((r, i) => (i === index ? null : r)));
    setAnalysisErrors(prev => prev.map((e, i) => (i === index ? null : e)));
    setTrackUploading(prev => prev.map((u, i) => (i === index ? true : u)));
    setAudioUploadPct((prev) => prev.map((p, i) => (i === index ? 1 : p)));
    setAcrCloudPending(index);
    delete acrCloudPollRef.current[index];

    // Autofill title and analyze
    setTrackTitleFromFile(index, file);
    setAnalysisLoading(prev => prev.map((l, i) => (i === index ? true : l)));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/audio/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        let errMsg = 'Analysis failed';
        try { const errBody = await res.json(); errMsg = errBody?.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setAnalysisResults(prev => prev.map((r, i) => (i === index ? data : r)));
      const dur = data?.duration;
      if (typeof dur === 'number' || typeof dur === 'string') {
        const durStr = formatDuration(dur);
        setTrackInfos(prev => prev.map((info, i) => i === index ? { ...info, duration: durStr } : info));
      }
    } catch (err: any) {
      setAnalysisErrors(prev => prev.map((e, i) => (i === index ? (err?.message || 'Error analyzing audio') : e)));
    } finally {
      setAnalysisLoading((prev) => prev.map((l, i) => (i === index ? false : l)));
    }

    try {
      const { url, filename, acrCloud } = await uploadAudioToServer(file, (pct) =>
        setAudioUploadPct((prev) => prev.map((p, i) => (i === index ? pct : p)))
      );
      setAudioUploadedUrls((prev) => prev.map((u, i) => (i === index ? url : u)));
      setAudioUploadedFilenames((prev) => prev.map((u, i) => (i === index ? filename : u)));
      setAudioAcrCloudStatuses((prev) => prev.map((status, i) => (i === index ? (acrCloud || { state: 'error', lastError: 'Missing ACRCloud response' }) : status)));
      setAudioUploadPct((prev) => prev.map((p, i) => (i === index ? 100 : p)));
      setAcrCloudProgressPct((prev) => prev.map((p, i) => (i === index ? (getAcrCloudState(acrCloud) === 'pending' ? Math.max(p, 25) : 100) : p)));
      if (acrCloud?.fileId && getAcrCloudState(acrCloud) === 'pending') {
        void pollAcrCloudStatus(index, acrCloud.fileId);
      }
    } catch (e) {
      console.error('Audio upload failed:', e);
      setAudioAcrCloudStatuses((prev) => prev.map((status, i) => (i === index ? { state: 'error', lastError: e instanceof Error ? e.message : 'Audio upload failed' } : status)));
      setAcrCloudProgressPct((prev) => prev.map((p, i) => (i === index ? 100 : p)));
    } finally {
      setTrackUploading((prev) => prev.map((u, i) => (i === index ? false : u)));
    }
  };

  const pollAcrCloudStatus = async (index: number, fileId: string) => {
    acrCloudPollRef.current[index] = fileId;

    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (acrCloudPollRef.current[index] !== fileId) return;
      setAcrCloudProgressPct((prev) =>
        prev.map((pct, i) => (i === index ? Math.max(pct, Math.min(90, 25 + attempt * 2)) : pct))
      );

      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2500 : 4000));
      if (acrCloudPollRef.current[index] !== fileId) return;

      try {
        const nextStatus = await fetchAcrCloudScanResult(fileId);
        if (acrCloudPollRef.current[index] !== fileId) return;

        setAudioAcrCloudStatuses((prev) =>
          prev.map((status, i) => (i === index ? { ...(status || {}), ...nextStatus } : status))
        );
        setAcrCloudProgressPct((prev) =>
          prev.map((pct, i) => (i === index ? (getAcrCloudState(nextStatus) === 'pending' ? Math.max(pct, 35) : 100) : pct))
        );

        if (getAcrCloudState(nextStatus) !== 'pending') {
          delete acrCloudPollRef.current[index];
          return;
        }
      } catch (error) {
        if (attempt >= 5) {
          setAudioAcrCloudStatuses((prev) =>
            prev.map((status, i) =>
              i === index
                ? {
                    ...(status || {}),
                    state: 'error',
                    lastError: error instanceof Error ? error.message : 'Failed to refresh ACRCloud status',
                  }
                : status
            )
          );
          setAcrCloudProgressPct((prev) => prev.map((pct, i) => (i === index ? 100 : pct)));
          delete acrCloudPollRef.current[index];
          return;
        }
      }
    }
  };

  const handleMultiTrackFiles = async (fileList: FileList) => {
    const selectedType = releaseTypes.find((t) => t.value === releaseType);
    const max = selectedType?.maxTracks ?? 50;
    const files = Array.from(fileList)
      .filter((f) => validateTrackFile(f) === '')
      .slice(0, max);

    if (!files.length) return;

    setTracks(files);
    ensureTrackStateLength(files.length);
    setSelectedTrackIdx(0);

    for (let i = 0; i < files.length; i++) {
      await analyzeAndUploadForIndex(i, files[i]);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Select Your Release Type
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Choose the type of release you want to distribute
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  flexWrap: 'wrap',
                  gap: { xs: 2.5, md: 4 },
                  mt: 1,
                  width: '100%',
                }}
              >
                {releaseTypes.map((type) => (
                  <Box
                    key={type.value}
                    sx={{
                      flex: { md: '1 1 0' },
                      minWidth: { xs: '100%', md: 0 },
                      width: { xs: '100%' },
                    }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        borderRadius: 2,
                        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: releaseType === type.value ? 2 : 1,
                        borderColor: releaseType === type.value ? 'primary.main' : 'divider',
                        boxShadow:
                          releaseType === type.value
                            ? (theme) =>
                                theme.palette.mode === 'dark'
                                  ? '0 8px 32px rgba(25,118,210,0.2)'
                                  : '0 8px 28px rgba(25,118,210,0.12)'
                            : 'none',
                        '&:hover': {
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 12px 40px rgba(0,0,0,0.35)'
                              : '0 12px 36px rgba(15, 23, 42, 0.1)',
                        },
                      }}
                      onClick={() => setReleaseType(type.value)}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          zIndex: 1,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Radio
                          checked={releaseType === type.value}
                          onChange={handleReleaseTypeChange}
                          value={type.value}
                          name="release-type"
                          sx={{ p: 0.5 }}
                        />
                      </Box>
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          p: 3,
                          pt: 4,
                        }}
                      >
                        <Box sx={{ color: 'primary.main', mb: 2 }}>{type.icon}</Box>
                        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                          {type.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          {type.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </FormControl>

            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Release Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Release Type:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {releaseTypes.find(t => t.value === releaseType)?.label}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body1">
                  Track Range:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {releaseTypes.find(t => t.value === releaseType)?.minTracks} - {releaseTypes.find(t => t.value === releaseType)?.maxTracks}
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Release Title"
                    fullWidth
                    value={releaseTitle}
                    onChange={e => setReleaseTitle(e.target.value)}
                    required
                    inputProps={{ 'aria-label': 'Release Title' }}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    label="Label"
                    fullWidth
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    inputProps={{ 'aria-label': 'Label' }}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    label="UPC (optional)"
                    fullWidth
                    value={upc}
                    onChange={e => setUpc(e.target.value)}
                    inputProps={{ 'aria-label': 'UPC' }}
                    disabled={autoGenerateCodes}
                    helperText={autoGenerateCodes ? 'System assigns release UPC during submit.' : 'Enter an existing release UPC.'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <FormControlLabel
                            sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: 12, whiteSpace: 'nowrap' } }}
                            control={
                              <Checkbox
                                size="small"
                                checked={autoGenerateCodes}
                                onChange={(e) => setAutoGenerateCodes(e.target.checked)}
                              />
                            }
                            label="Auto"
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!releaseTitle.trim()}
                endIcon={<ArrowForward />}
                size="large"
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 1:
        // Artwork Step
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Artwork</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload a square JPG/PNG. Exactly 3000x3000px. Max 10MB.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid xs={12} md={8} lg={7}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderRadius: '28px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 22px 56px rgba(15,23,42,0.08)',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: artworkPreview ? 'primary.main' : 'divider',
                        borderRadius: '22px',
                        p: { xs: 1.5, sm: 2 },
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 1fr) 220px' },
                        alignItems: 'center',
                        gap: { xs: 2, md: 2.5 },
                        minHeight: 360,
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(248,250,252,0.74)',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 460,
                          aspectRatio: '1 / 1',
                          justifySelf: 'center',
                          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.055)' : '#eef2f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '18px',
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: artworkPreview
                            ? theme => theme.palette.mode === 'dark'
                              ? '0 18px 44px rgba(0,0,0,0.32)'
                              : '0 18px 44px rgba(15,23,42,0.12)'
                            : 'none',
                        }}
                      >
                        {artworkPreview ? (
                          <Box
                            component="img"
                            src={artworkPreview}
                            alt="Artwork preview"
                            sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                          />
                        ) : (
                          <Album sx={{ fontSize: 56, color: 'text.secondary' }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, gap: 1.25 }}>
                        <Typography variant="subtitle1" fontWeight={900}>
                          {artworkPreview ? 'Artwork Ready' : 'Add Cover Artwork'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 240, textAlign: { xs: 'center', md: 'left' } }}>
                          Preview uses the same square crop stores will receive.
                        </Typography>
                        <input id="artwork-upload" type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
                          onChange={e => { if (e.target.files && e.target.files[0]) setArtworkFile(e.target.files[0]); }} />
                        <label htmlFor="artwork-upload">
                        <Button variant={artworkPreview ? 'contained' : 'outlined'} component="span">
                          {artworkPreview ? 'Change Image' : 'Select Image'}
                        </Button>
                        </label>
                        {artworkUploading && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <LinearProgress />
                          <Typography variant="caption" color="text.secondary">Validating artwork…</Typography>
                        </Box>
                        )}
                        {artworkError && <Typography color="error" sx={{ mt: 1 }}>{artworkError}</Typography>}
                        {!artworkError && artworkPreview && (
                        <Typography color="success.main" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
                          <CheckCircle fontSize="small" /> 3000x3000 verified
                        </Typography>
                        )}
                        <Box sx={{ display: 'grid', gap: 0.5, mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">JPG or PNG</Typography>
                          <Typography variant="caption" color="text.secondary">Exactly 3000x3000px</Typography>
                          <Typography variant="caption" color="text.secondary">Max 10MB</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!!artworkError || !artworkPreview || artworkUploading}
                onClick={async () => {
                  if (!artworkFile) return;
                  try {
                    const { url, filename } = await uploadArtworkToServer(artworkFile);
                    setArtworkUploadedUrl(url);
                    setArtworkUploadedFilename(filename);
                    handleNext();
                  } catch (e: any) {
                    alert(e?.message || 'Failed to upload artwork');
                  }
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 2: {
        const selectedTypeLb = releaseTypes.find((t) => t.value === releaseType);
        const uploadPctAvg =
          tracks.length > 0
            ? Math.round(
                tracks.reduce((acc, _, i) => acc + (audioUploadPct[i] ?? 0), 0) / tracks.length
              )
            : 0;
        const anyAnalyzing = analysisLoading.some(Boolean);
        const anyUploadingPct = tracks.some((_, i) => {
          const p = audioUploadPct[i] ?? 0;
          return p > 0 && p < 100;
        });
        const showAggBar = tracks.length > 0 && (anyAnalyzing || anyUploadingPct || trackUploading.some(Boolean));

        // Tracks & Info
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={700}>
              Upload Your Track{tracks.length !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 720 }}>
              {selectedTypeLb?.label === 'Single' && `Need at least ${minTracksRequired} track. Audio cards appear below after you select files.`}
              {selectedTypeLb?.label === 'EP' && `Need ${selectedTypeLb.minTracks}–${selectedTypeLb.maxTracks} tracks. Upload multiple files or add more.`}
              {selectedTypeLb?.label === 'Album' && `Up to ${selectedTypeLb.maxTracks} tracks.`}
            </Typography>

            {showAggBar && (
              <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Overall upload progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {anyAnalyzing ? 'Analyzing + uploading…' : `${uploadPctAvg}%`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant={anyAnalyzing || anyUploadingPct ? (anyAnalyzing ? 'indeterminate' : 'determinate') : 'determinate'}
                  value={uploadPctAvg}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: theme => theme.palette.action.hover,
                    '& .MuiLinearProgress-bar': { borderRadius: 5 },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {tracks.length} file{tracks.length === 1 ? '' : 's'} queued
                </Typography>
              </Paper>
            )}

            {trackValidationAttempted && trackInfoIssues.length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                  Complete these items before continuing
                </Typography>
                <Box component="ul" sx={{ pl: 2.25, m: 0 }}>
                  {trackInfoIssues.slice(0, 6).map((issue, issueIdx) => (
                    <li key={`${issue.message}-${issueIdx}`}>
                      <Typography variant="body2">{issue.message}</Typography>
                    </li>
                  ))}
                  {trackInfoIssues.length > 6 ? (
                    <li>
                      <Typography variant="body2">{trackInfoIssues.length - 6} more item{trackInfoIssues.length - 6 === 1 ? '' : 's'} need attention.</Typography>
                    </li>
                  ) : null}
                </Box>
              </Alert>
            )}

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'flex-start',
                gap: { xs: 2.5, md: 3.5 },
                mt: 0.5,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  flex: { md: '0 1 42%' },
                  minWidth: { md: 0 },
                  width: { xs: '100%', md: 'auto' },
                  maxWidth: { md: 520 },
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, alignItems: 'center' }}>
                  <input
                    id="multi-track-upload"
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.length) void handleMultiTrackFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor="multi-track-upload">
                    <Button variant="contained" component="span" startIcon={<CloudUpload />} sx={{ borderRadius: 2 }}>
                      {tracks.length === 0 ? 'Select audio files' : 'Replace all audio'}
                    </Button>
                  </label>
                  <input
                    ref={appendTracksInputRef}
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      void handleAppendTracksSelected(e.target.files);
                    }}
                  />
                  {selectedTypeLb && tracks.length > 0 && tracks.length < selectedTypeLb.maxTracks && (
                    <Button variant="outlined" startIcon={<Add />} onClick={handleAppendTracksClick} sx={{ borderRadius: 2 }}>
                      Add more tracks
                    </Button>
                  )}
                </Box>

                {tracks.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, borderStyle: 'dashed', bgcolor: theme => theme.palette.action.hover }}>
                    <Typography color="text.secondary" align="center">
                      No audio yet. Use <strong>Select audio files</strong> — track cards appear here automatically.
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', minWidth: 0 }}>
                    {tracks.map((file, idx) => (
                      <Card
                        key={idx}
                        onClick={() => setSelectedTrackIdx(idx)}
                        elevation={0}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderRadius: 2,
                          border: 2,
                          borderColor: idx === selectedTrackIdx ? 'primary.main' : 'divider',
                          transition: 'border-color .2s ease, box-shadow .2s ease',
                          minWidth: 0,
                          overflow: 'hidden',
                        }}
                      >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Typography fontWeight={700} sx={{ flexShrink: 0 }}>
                              Track {idx + 1}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
                              <input
                                id={`track-replace-${idx}`}
                                type="file"
                                accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const next = e.target.files?.[0];
                                  void handleTrackFileChange(idx, next ?? null);
                                  e.target.value = '';
                                }}
                              />
                              <label htmlFor={`track-replace-${idx}`}>
                                <Button component="span" size="small" variant="text" onClick={(e) => e.stopPropagation()}>
                                  Replace
                                </Button>
                              </label>
                              {tracks.length > 1 ? (
                                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleRemoveTrack(idx); }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              ) : null}
                            </Box>
                          </Box>
                          <Chip
                            icon={<AudioFile />}
                            label={file.name}
                            title={file.name}
                            sx={{ mt: 1, mb: 1, maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                            variant="outlined"
                          />
                          {(trackUploading[idx] || analysisLoading[idx] || (audioUploadPct[idx] ?? 0) > 0) && (audioUploadPct[idx] ?? 0) < 100 && (
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Audio upload</Typography>
                                <Typography variant="caption" color="text.secondary">{audioUploadPct[idx] ?? 0}%</Typography>
                              </Box>
                              <LinearProgress
                                variant={analysisLoading[idx] && (audioUploadPct[idx] ?? 0) <= 1 ? 'indeterminate' : 'determinate'}
                                value={audioUploadPct[idx] ?? 0}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  '& .MuiLinearProgress-bar': { borderRadius: 3 },
                                }}
                              />
                            </Box>
                          )}
                          {trackPreviewUrls[idx] && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                              <audio controls src={trackPreviewUrls[idx] || undefined} style={{ width: '100%', borderRadius: 8 }} />
                            </Box>
                          )}
                          {!analysisLoading[idx] && (audioUploadPct[idx] ?? 0) >= 100 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircle sx={{ fontSize: 14 }} /> Upload complete
                              </Typography>
                            </Box>
                          )}
                          {audioAcrCloudStatuses[idx] && (
                            <Box sx={{ mb: 1 }}>
                              <Tooltip title={audioAcrCloudStatuses[idx]?.lastError || 'ACRCloud verification status'}>
                                <Chip
                                  size="small"
                                  icon={getAcrCloudState(audioAcrCloudStatuses[idx]) === 'pending' ? <CircularProgress size={12} /> : <PlaylistAddCheck fontSize="small" />}
                                  label={getAcrCloudLabel(audioAcrCloudStatuses[idx])}
                                  color={getAcrCloudColor(audioAcrCloudStatuses[idx]) as any}
                                  variant="outlined"
                                  sx={{ maxWidth: '100%' }}
                                />
                              </Tooltip>
                              {getAcrCloudSummary(audioAcrCloudStatuses[idx]) && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {getAcrCloudSummary(audioAcrCloudStatuses[idx])}
                                </Typography>
                              )}
                              {(acrCloudProgressPct[idx] ?? 0) > 0 && (acrCloudProgressPct[idx] ?? 0) < 100 && (
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">ACR scan</Typography>
                                    <Typography variant="caption" color="text.secondary">{acrCloudProgressPct[idx] ?? 0}%</Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={acrCloudProgressPct[idx] ?? 0}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      '& .MuiLinearProgress-bar': { borderRadius: 3 },
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          )}
                          {analysisLoading[idx] && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CircularProgress size={14} />
                              <Typography variant="caption" color="text.secondary">
                                Analyzing…
                              </Typography>
                            </Box>
                          )}
                          {analysisResults[idx] && (
                            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="success.main">
                                Format: {analysisResults[idx].format || analysisResults[idx].container || '—'}
                              </Typography>
                              <Typography variant="caption" color="success.main">
                                Duration: {formatDuration(analysisResults[idx].duration)}
                              </Typography>
                              <Typography variant="caption" color="success.main">
                                Bitrate: {formatBitrate(analysisResults[idx].bitrate || analysisResults[idx].bit_rate)}
                              </Typography>
                            </Box>
                          )}
                          {analysisErrors[idx] && (
                            <Typography variant="caption" color="error.main">
                              {analysisErrors[idx]}
                            </Typography>
                          )}
                        </Card>
                    ))}
                  </Box>
                )}
                <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" color="primary" startIcon={<ArrowBack />} onClick={handleBack} sx={{ borderRadius: 2 }}>
                    Back
                  </Button>
                </Box>
              </Box>
              <Box sx={{ flex: { md: '1 1 0' }, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Typography variant="h6" fontWeight="bold">Track Information</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlaylistAddCheck />}
                    onClick={() => handleApplyTrackInfoToAll(selectedTrackIdx)}
                    disabled={tracks.length < 2}
                  >
                    Apply to all
                  </Button>
                </Box>
                {tracks.length === 0 ? (
                  <Paper variant="outlined" sx={{ mt: 2.5, p: 3, borderRadius: 2, borderStyle: 'dashed', bgcolor: theme => theme.palette.action.hover }}>
                    <Typography color="text.secondary" align="center">
                      Upload audio on the left. Each file becomes a track and unlocks metadata here.
                    </Typography>
                  </Paper>
                ) : null}
                {tracks.length > 0 && selectedTrackIdx >= 0 && selectedTrackIdx < tracks.length && (
                  <Box sx={{ mt: 2.5, mb: 3, p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Track {selectedTrackIdx + 1}</Typography>
                    <Box sx={{ display: 'grid', gap: 2.5 }}>
                      <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Track details</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
                          <TextField
                            label="Track Title *"
                            fullWidth
                            required
                            value={trackInfos[selectedTrackIdx]?.title || ''}
                            onChange={e => handleTrackInfoChange(selectedTrackIdx, 'title', e.target.value)}
                            error={trackValidationAttempted && !trackInfos[selectedTrackIdx]?.title?.trim()}
                            helperText={trackValidationAttempted && !trackInfos[selectedTrackIdx]?.title?.trim() ? 'Track title is required.' : ''}
                            InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Use a clear, searchable name. Avoid extra version text here."><Info fontSize="small" /></Tooltip></InputAdornment> }}
                          />
                          <TextField
                            label="Version"
                            fullWidth
                            value={trackInfos[selectedTrackIdx]?.version || ''}
                            onChange={e => handleTrackInfoChange(selectedTrackIdx, 'version', e.target.value)}
                            InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="e.g., Radio Edit, Acoustic, Remix"><Info fontSize="small" /></Tooltip></InputAdornment> }}
                          />
                        </Box>
                      </Box>

                      <AcrCloudResultPanel
                        acrCloud={audioAcrCloudStatuses[selectedTrackIdx]}
                        progress={acrCloudProgressPct[selectedTrackIdx] ?? 0}
                      />

                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
                          <Typography variant="overline" sx={{ color: 'text.secondary' }}>Contributors</Typography>
                          <Tooltip title="Add contributor">
                            <IconButton size="small" color="primary" onClick={() => addContributor(selectedTrackIdx)}>
                              <Add fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Add credits here. Include at least one row with role <strong>Artist</strong> (required).
                          Use <strong>Performer</strong> for featuring guests.
                        </Typography>
                        {selectedTrackMissingArtist && (
                          <Alert severity="warning" sx={{ mb: 1.5 }}>
                            Add at least one contributor with role Artist and a name.
                          </Alert>
                        )}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr 48px' }, gap: 1, px: 1.5, py: 1, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" fontWeight={700}>Role</Typography>
                            <Typography variant="caption" fontWeight={700}>Name</Typography>
                          </Box>
                          {trackInfos[selectedTrackIdx]?.contributors.map((contributor, contributorIdx) => (
                            <Box key={`${contributorIdx}-${contributor.role}`} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr 48px' }, gap: 1.5, p: 1.5, borderTop: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
                              <TextField
                                select
                                size="small"
                                value={contributor.role}
                                onChange={e => updateContributor(selectedTrackIdx, contributorIdx, 'role', e.target.value)}
                              >
                                {contributorRoles.map(role => (
                                  <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                size="small"
                                label="Contributor name"
                                value={contributor.name}
                                onChange={e => updateContributor(selectedTrackIdx, contributorIdx, 'name', e.target.value)}
                                error={selectedTrackMissingArtist && contributor.role === 'artist' && !contributor.name.trim()}
                                helperText={selectedTrackMissingArtist && contributor.role === 'artist' && !contributor.name.trim() ? 'Required' : ''}
                              />
                              <Tooltip title="Remove contributor">
                                <IconButton size="small" color="error" onClick={() => removeContributor(selectedTrackIdx, contributorIdx)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Metadata</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
                          <TextField
                            select
                            label="Metadata Language *"
                            fullWidth
                            required
                            value={trackInfos[selectedTrackIdx]?.metadataLanguage || ''}
                            onChange={e => handleTrackInfoChange(selectedTrackIdx, 'metadataLanguage', e.target.value)}
                            error={trackValidationAttempted && !trackInfos[selectedTrackIdx]?.metadataLanguage}
                            helperText={trackValidationAttempted && !trackInfos[selectedTrackIdx]?.metadataLanguage ? 'Metadata language is required.' : ''}
                          >
                            {languages.map(lang => (<MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>))}
                          </TextField>
                          <TextField
                            select
                            label="Audio Language *"
                            fullWidth
                            required
                            value={trackInfos[selectedTrackIdx]?.audioLanguage || trackInfos[selectedTrackIdx]?.language || ''}
                            onChange={e => {
                              handleTrackInfoChange(selectedTrackIdx, 'audioLanguage', e.target.value);
                              handleTrackInfoChange(selectedTrackIdx, 'language', e.target.value);
                            }}
                            error={trackValidationAttempted && !(trackInfos[selectedTrackIdx]?.audioLanguage || trackInfos[selectedTrackIdx]?.language)}
                            helperText={trackValidationAttempted && !(trackInfos[selectedTrackIdx]?.audioLanguage || trackInfos[selectedTrackIdx]?.language) ? 'Audio language is required.' : ''}
                          >
                            {languages.map(lang => (<MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>))}
                          </TextField>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                          <TextField
                            select
                            label="Genre *"
                            fullWidth
                            required
                            value={trackInfos[selectedTrackIdx]?.genre || ''}
                            onChange={e => handleTrackInfoChange(selectedTrackIdx, 'genre', e.target.value)}
                            error={trackValidationAttempted && !trackInfos[selectedTrackIdx]?.genre}
                            helperText={trackValidationAttempted && !trackInfos[selectedTrackIdx]?.genre ? 'Genre is required.' : ''}
                          >
                            {genres.map(g => (<MenuItem key={g} value={g}>{g}</MenuItem>))}
                          </TextField>
                          <TextField label="Subgenre" fullWidth value={trackInfos[selectedTrackIdx]?.subgenre || ''} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'subgenre', e.target.value)} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                          <TextField
                            label="Original release date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={originalReleaseDate}
                            onChange={(e) => setOriginalReleaseDate(e.target.value)}
                            helperText="If this catalog was issued before."
                          />
                          <TextField
                            label="Digital release date *"
                            type="date"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            error={trackValidationAttempted && !releaseDate.trim()}
                            helperText={trackValidationAttempted && !releaseDate.trim() ? 'Digital release date is required.' : 'Date stores should go live.'}
                          />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                          <TextField select label="Recording Year" fullWidth value={trackInfos[selectedTrackIdx]?.recordingYear || ''} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'recordingYear', e.target.value)}>
                            <MenuItem value="">Not set</MenuItem>
                            {copyrightYears.map(year => (<MenuItem key={year} value={year}>{year}</MenuItem>))}
                          </TextField>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Identifiers</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 1 }}>
                          <TextField
                            label="ISRC"
                            fullWidth
                            value={trackInfos[selectedTrackIdx]?.isrc || ''}
                            onChange={e => handleTrackInfoChange(selectedTrackIdx, 'isrc', e.target.value)}
                            helperText="Leave blank for IN-9SN yearly sequence assignment."
                          />
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Rights</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 120px ' }, gap: 2, mt: 1 }}>
                          <TextField label="C-line name" fullWidth value={trackInfos[selectedTrackIdx]?.copyrightC || ''} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'copyrightC', e.target.value)} />
                          <TextField select label="Year" fullWidth value={trackInfos[selectedTrackIdx]?.copyrightCYear || String(currentYear)} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'copyrightCYear', e.target.value)}>
                            {copyrightYears.map(year => (<MenuItem key={year} value={year}>{year}</MenuItem>))}
                          </TextField>
                          <TextField label="P-line name" fullWidth value={trackInfos[selectedTrackIdx]?.copyrightP || ''} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'copyrightP', e.target.value)} />
                          <TextField select label="Year" fullWidth value={trackInfos[selectedTrackIdx]?.copyrightPYear || String(currentYear)} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'copyrightPYear', e.target.value)}>
                            {copyrightYears.map(year => (<MenuItem key={year} value={year}>{year}</MenuItem>))}
                          </TextField>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Content</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
                          <Box>
                            <TextField label="Lyrics" fullWidth multiline minRows={3} value={trackInfos[selectedTrackIdx]?.lyrics || ''} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'lyrics', e.target.value)} />
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <TextField select label="Parental Advisory" fullWidth value={trackInfos[selectedTrackIdx]?.parentalAdvisory || 'none'} onChange={e => handleTrackInfoChange(selectedTrackIdx, 'parentalAdvisory', e.target.value)}>
                                <MenuItem value="none">None</MenuItem>
                                <MenuItem value="explicit">Explicit</MenuItem>
                                <MenuItem value="clean">Clean</MenuItem>
                              </TextField>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!!trackInfos[selectedTrackIdx]?.explicit}
                                      onChange={e => handleTrackInfoChange(selectedTrackIdx, 'explicit', e.target.checked)}
                                    />
                                  }
                                  label="Explicit Lyrics"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!!trackInfos[selectedTrackIdx]?.instrumental}
                                      onChange={e => handleTrackInfoChange(selectedTrackIdx, 'instrumental', e.target.checked)}
                                    />
                                  }
                                  label="Instrumental"
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
                <Snackbar
                  open={snackOpen}
                  autoHideDuration={2000}
                  onClose={() => setSnackOpen(false)}
                  message="Applied to all tracks"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2, px: 3 }}
                onClick={handleTracksInfoContinue}
                disabled={
                  analysisLoading.some(Boolean) ||
                  trackUploading.some(Boolean)
                }
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      }

      case 3:
        // Distribution Providers
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight={800}>Distribution Providers</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
                  Pick every store for this release. Selected providers are shown again in final review.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`${selectedDSPs.length}/${visibleDSPs.length} selected`} color={selectedDSPs.length ? 'primary' : 'default'} variant="outlined" />
                <Button variant="outlined" size="small" onClick={handleSelectAll} disabled={isPlatformAccessLoading || visibleDSPs.length === 0}>{allSelected ? 'Deselect All' : 'Select All'}</Button>
              </Stack>
            </Box>
            {platformAccessError && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                {platformAccessError}. Showing default providers.
              </Alert>
            )}
            {isPlatformAccessLoading ? (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Loading platform access...</Typography>
                </Stack>
              </Paper>
            ) : visibleDSPs.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  bgcolor: 'background.default',
                }}
              >
                <Typography fontWeight={800}>No providers enabled</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Ask an admin to enable platform access before submitting this release.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
                {visibleDSPs.map((dsp: DspItem) => {
                  const selected = selectedDSPs.includes(dsp.key);
                  const initials = (dsp.name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase();
                  return (
                    <Paper
                      key={dsp.key}
                      variant="outlined"
                      onClick={() => handleDSPToggle(dsp.key)}
                      sx={{
                        cursor: 'pointer',
                        p: 2,
                        minHeight: 150,
                        borderRadius: 2,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        transition: 'border-color 160ms, transform 160ms, box-shadow 160ms',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme => theme.palette.mode === 'dark' ? '0 14px 34px rgba(0,0,0,0.28)' : '0 14px 34px rgba(15,23,42,0.08)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Avatar
                          src={dsp.logo || undefined}
                          alt={dsp.name}
                          variant="rounded"
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 0.75,
                            fontSize: 13,
                            fontWeight: 900,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Checkbox
                          checked={selected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => handleDSPToggle(dsp.key)}
                          inputProps={{ 'aria-label': `Select ${dsp.name}` }}
                        />
                      </Box>
                      <Box>
                        <Typography fontWeight={800}>{dsp.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {dsp.info}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" color="primary" onClick={handleContinue} disabled={!isDistributionValid}>Continue</Button>
            </Box>
          </Box>
        );

      case 4:
        // Territories & Rights
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Territories & Rights</Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid xs={12} md={6}>
                <TerritoryManager
                  value={territoryCountries}
                  mode={territoryMode}
                  onChange={(countries, mode) => { setTerritoryCountries(countries); setTerritoryMode(mode); }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <RightsManager
                  rightsType={rightsType}
                  description={rightsDescription}
                  onChange={(type, desc) => { setRightsType(type); setRightsDescription(desc); }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" color="primary" onClick={handleNext} disabled={!rightsType || territoryCountries.length === 0}>Continue</Button>
            </Box>
          </Box>
        );
      case 5:
        // Review & Submit
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Review & Submit</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Review all details before submitting your release.
            </Typography>
            <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 2, bgcolor: 'background.paper', color: 'text.primary', boxShadow: theme => theme.palette.mode === 'dark' ? 'none' : '0 14px 40px rgba(15,23,42,0.06)' }}>
              <Typography variant="subtitle1" fontWeight="bold">Release Overview</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid xs={12} md={4} lg={3}>
                  <Box sx={{
                    width: '100%',
                    maxWidth: 240,
                    aspectRatio: '1 / 1',
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.055)' : '#eef2f7',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: artworkPreview
                      ? theme => theme.palette.mode === 'dark'
                        ? '0 18px 44px rgba(0,0,0,0.32)'
                        : '0 18px 44px rgba(15,23,42,0.12)'
                      : 'none',
                  }}>
                    {artworkPreview ? (
                      <Box
                        component="img"
                        src={artworkPreview}
                        alt="Artwork preview"
                        sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        <Album />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid xs={12} md={8} lg={9}>
                  <Box>
                    <strong>Release Title:</strong> {releaseTitle || 'N/A'}<br />
                    <strong>Type:</strong> {releaseType}<br />
                    <strong>Primary artist:</strong>{' '}
                    {trackInfos[0] ? getContributorNames(trackInfos[0], 'artist') || '—' : '—'}
                    <br />
                    <strong>Label:</strong> {label || 'N/A'}<br />
                    <strong>Original Release Date:</strong> {originalReleaseDate || 'N/A'}<br />
                    <strong>Release Date:</strong> {releaseDate || 'N/A'}<br />
                    <strong>Tracks:</strong> {tracks.length}<br />
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Tracklist</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                <Table size="small" aria-label="release review tracklist">
                  <TableHead>
                    <TableRow>
                      <TableCell>Track</TableCell>
                      <TableCell>Artists</TableCell>
                      <TableCell>Metadata</TableCell>
                      <TableCell>ACR</TableCell>
                      <TableCell align="right">Preview</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tracks.map((_file, idx) => {
                      const track = trackInfos[idx];
                      if (!track) return null;
                      const mainArtist = getContributorNames(track, 'artist') || 'Artist TBD';
                      const featPerf = getContributorNames(track, 'performer');
                      const remixCredits = getContributorNames(track, 'remixer');
                      const contributors = track.contributors
                        .filter(contributor => contributor.name.trim())
                        .map(contributor => `${contributorRoles.find(role => role.value === contributor.role)?.label || contributor.role}: ${contributor.name.trim()}`)
                        .join(' | ');

                      return (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ minWidth: 260 }}>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                              <Avatar
                                src={artworkPreview || undefined}
                                alt={releaseTitle || 'Artwork'}
                                variant="rounded"
                                sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'background.default' }}
                              >
                                <Album fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={800}>
                                  {idx + 1}. {track.title || `Track ${idx + 1}`}{track.version ? ` (${track.version})` : ''}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {track.duration ? `${track.duration} | ` : ''}{track.isrc ? `ISRC ${track.isrc}` : 'ISRC auto'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ minWidth: 220 }}>
                            <Typography variant="body2" fontWeight={700}>{mainArtist}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[featPerf ? `Feat. ${featPerf}` : '', remixCredits ? `Remix ${remixCredits}` : ''].filter(Boolean).join(' | ') || 'No featured credits'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 260 }}>
                            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                              <Chip size="small" label={track.genre ? `${track.genre}${track.subgenre ? ` / ${track.subgenre}` : ''}` : 'Genre missing'} variant="outlined" />
                              <Chip size="small" label={track.audioLanguage || track.language || 'Audio language missing'} variant="outlined" />
                              <Chip size="small" label={track.explicit ? 'Explicit' : 'Clean'} variant="outlined" />
                              <Chip size="small" label={track.instrumental ? 'Instrumental' : 'Vocal'} variant="outlined" />
                            </Stack>
                            {contributors ? (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                {contributors}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            {audioAcrCloudStatuses[idx] ? (
                              <Stack spacing={0.5} alignItems="flex-start">
                                <Chip
                                  size="small"
                                  icon={getAcrCloudState(audioAcrCloudStatuses[idx]) === 'pending' ? <CircularProgress size={12} /> : <PlaylistAddCheck fontSize="small" />}
                                  label={getAcrCloudLabel(audioAcrCloudStatuses[idx])}
                                  color={getAcrCloudColor(audioAcrCloudStatuses[idx]) as any}
                                  variant="outlined"
                                />
                                {getAcrCloudSummary(audioAcrCloudStatuses[idx]) ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {getAcrCloudSummary(audioAcrCloudStatuses[idx])}
                                  </Typography>
                                ) : null}
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.secondary">Pending upload scan</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {trackPreviewUrls[idx] ? (
                              <IconButton size="small" aria-label={`Play ${track.title || `Track ${idx + 1}`}`}>
                                <PlayArrow />
                              </IconButton>
                            ) : (
                              <Typography variant="caption" color="text.secondary">No preview</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <ol style={{ paddingLeft: 18, display: 'none' }}>
                {tracks.map((_file, idx) => {
                  const track = trackInfos[idx];
                  if (!track) return null;
                  const mainArtist = getContributorNames(track, 'artist') || 'Artist TBD';
                  const featPerf = getContributorNames(track, 'performer');
                  const remixCredits = getContributorNames(track, 'remixer');
                  return (
                  <li key={idx}>
                    <div>
                      <strong>{track.title || `Track ${idx + 1}`}</strong>
                      {track.version ? ` (${track.version})` : ''}
                      {` — ${mainArtist}`}
                      {featPerf ? ` feat. ${featPerf}` : ''}
                      {remixCredits ? ` [Remix: ${remixCredits}]` : ''}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
                      {track.duration ? `Duration: ${track.duration} · ` : ''}
                      {track.genre ? `Genre: ${track.genre}${track.subgenre ? `/${track.subgenre}` : ''} · ` : ''}
                      {track.metadataLanguage ? `Metadata Language: ${track.metadataLanguage} · ` : ''}
                      {track.audioLanguage || track.language ? `Audio Language: ${track.audioLanguage || track.language} · ` : ''}
                      {track.isrc ? `ISRC: ${track.isrc} · ` : ''}
                      {track.parentalAdvisory && track.parentalAdvisory !== 'none' ? `Advisory: ${track.parentalAdvisory} · ` : ''}
                      {track.instrumental ? `Instrumental · ` : ''}
                      {track.recordingYear ? `Recording Year: ${track.recordingYear} · ` : ''}
                      {track.copyrightC ? `© ${track.copyrightC} · ` : ''}
                      {track.copyrightP ? `℗ ${track.copyrightP}` : ''}
                    </div>
                    {audioAcrCloudStatuses[idx] && (
                      <div style={{ marginTop: 6 }}>
                        <Chip
                          size="small"
                          icon={getAcrCloudState(audioAcrCloudStatuses[idx]) === 'pending' ? <CircularProgress size={12} /> : <PlaylistAddCheck fontSize="small" />}
                          label={getAcrCloudLabel(audioAcrCloudStatuses[idx])}
                          color={getAcrCloudColor(audioAcrCloudStatuses[idx]) as any}
                          variant="outlined"
                        />
                        {getAcrCloudSummary(audioAcrCloudStatuses[idx]) ? (
                          <div style={{ fontSize: 12, color: 'var(--mui-palette-text-secondary)', marginTop: 4 }}>
                            {getAcrCloudSummary(audioAcrCloudStatuses[idx])}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {(track.composers || track.publishers || track.producers) && (
                      <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
                        {track.composers ? `Composers: ${track.composers} · ` : ''}
                        {track.publishers ? `Publishers: ${track.publishers} · ` : ''}
                        {track.producers ? `Producers: ${track.producers}` : ''}
                      </div>
                    )}
                    {track.contributors.some(contributor => contributor.name.trim()) && (
                      <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
                        Contributors: {track.contributors
                          .filter(contributor => contributor.name.trim())
                          .map(contributor => `${contributorRoles.find(role => role.value === contributor.role)?.label || contributor.role}: ${contributor.name.trim()}`)
                          .join(' · ')}
                      </div>
                    )}
                    {(track.copyrightC || track.copyrightP) && (
                      <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
                        {track.upc ? `UPC: ${track.upc}` : ''}
                      </div>
                    )}
                    {trackPreviewUrls[idx] && (
                      <div style={{ marginTop: 8 }}>
                        <audio controls src={trackPreviewUrls[idx] || undefined} style={{ width: '100%' }} />
                      </div>
                    )}
                  </li>
                  );
                })}
              </ol>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">Distribution Providers</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 1 }}>
                {selectedDSPs.map((key) => {
                  const dsp =
                    visibleDSPs.find((d: DspItem) => d.key === key) ||
                    DSP_LIST.find((d: DspItem) => d.key === key);
                  if (!dsp) return null;
                  return (
                    <Chip key={key} label={dsp.name} avatar={<Avatar src={dsp.logo} alt={dsp.name} />} variant="outlined" />
                  );
                })}
                {selectedDSPs.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No providers selected</Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">Territories & Rights</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Mode: <strong>{territoryMode === 'allowed' ? 'Allowed' : 'Disallowed'}</strong>
                </Typography>
                {territoryCountries.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No territories selected</Typography>
                ) : (() => {
                  const REVIEW_TR_MAX = 14;
                  const sortedTerritory = [...territoryCountries]
                    .map((code) => ({
                      code,
                      label: countries.find((ct) => ct.code === code)?.label || code,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                  const showExpandToggle = sortedTerritory.length > REVIEW_TR_MAX;
                  const visible = reviewTerritoriesExpanded
                    ? sortedTerritory
                    : sortedTerritory.slice(0, REVIEW_TR_MAX);
                  return (
                    <Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {visible.map(({ code, label }) => (
                          <Chip key={code} label={label} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                        ))}
                      </Box>
                      {showExpandToggle ? (
                        <Button
                          size="small"
                          onClick={() => setReviewTerritoriesExpanded((prev) => !prev)}
                          endIcon={<ExpandMore sx={{
                            transition: 'transform 0.2s',
                            transform: reviewTerritoriesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }} />}
                          sx={{ mt: 1 }}
                        >
                          {reviewTerritoriesExpanded
                            ? 'Show fewer territories'
                            : `Show all ${sortedTerritory.length} territories`}
                        </Button>
                      ) : null}
                    </Box>
                  );
                })()}
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2">
                    Rights: <strong>{rightsType}</strong>{rightsDescription ? ` — ${rightsDescription}` : ''}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            {submitState === 'idle' ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack} sx={{ borderRadius: 2 }}>Back</Button>
                <Button variant="contained" color="primary" sx={{ borderRadius: 2, px: 3 }} onClick={handleSubmitRelease} disabled={!isTrackInfoListValid}>
                  Submit Release
                </Button>
              </Box>
            ) : submitState === 'loading' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Submitting your release...</Typography>
              </Box>
            ) : (
              <Alert severity="success">Your release has been queued for distribution!</Alert>
            )}
          </Box>
        );
    }
  };
  
  // Show loading state until client-side hydration is complete
  if (!mounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  


  return (
    <Box sx={{ width: '100%' }}>
      <PremiumHeader
        eyebrow="Release Studio"
        title="Create New Release"
        description="A guided release room for audio, artwork, metadata, territories, rights, and final checks before distribution."
      />

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1, sm: 2 },
          mb: 3,
          ...premiumSurfaceSx(theme),
          overflowX: 'auto',
          position: 'sticky',
          top: 76,
          zIndex: 3,
          backdropFilter: 'blur(18px)',
        }}
      >
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          '& .MuiStepConnector-line': {
            borderTopWidth: 2,
            borderColor: theme => theme.palette.divider,
          },
          '& .Mui-active .MuiStepConnector-line, & .Mui-completed .MuiStepConnector-line': {
            borderColor: 'primary.main',
          },
          '& .MuiStepLabel-labelContainer': {
            typography: 'caption',
            mt: { xs: 1, md: 0 },
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              sx={{ cursor: 'pointer', '& .Mui-active': { fontWeight: 700 }, '& .Mui-completed': { fontWeight: 600 } }}
              onClick={() => setActiveStep(index)} 
              componentsProps={{
                label: {
                  role: 'button',
                  tabIndex: 0,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveStep(index);
                    }
                  },
                  'aria-label': `Go to ${label}`,
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.25, sm: 3.5, md: 4.5 },
          ...premiumSurfaceSx(theme),
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(18,26,43,0.98), rgba(11,16,32,0.96))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))',
        }}
      >
        {renderStepContent()}
      </Paper>
    </Box>
  );
}
