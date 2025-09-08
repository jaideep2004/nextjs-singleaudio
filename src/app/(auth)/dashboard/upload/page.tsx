'use client';
import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {Grid} from '@mui/material';
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
import { useRouter } from 'next/navigation';
import countries from '@/utils/countries';

// Helper: call Express API for uploads (uses NEXT_PUBLIC_API_URL in browser)
const API_BASE = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_API_URL || '').startsWith('http')
  ? process.env.NEXT_PUBLIC_API_URL!
  : 'http://localhost:5000/api';

async function uploadArtworkToServer(file: File): Promise<{ url: string; filename: string }> {
  const fd = new FormData();
  fd.append('artwork', file);
  const res = await fetch(`${API_BASE}/uploads/artwork`, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to upload artwork');
  }
  const data = await res.json();
  return { url: data.url, filename: data.filename };
}

async function uploadAudioToServer(file: File): Promise<{ url: string; filename: string }> {
  const fd = new FormData();
  fd.append('audio', file);
  const res = await fetch(`${API_BASE}/uploads/audio`, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to upload audio');
  }
  const data = await res.json();
  return { url: data.url, filename: data.filename };
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

const territories = [
  'Worldwide', 'North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'
];

const stores = [
  'Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Deezer', 'Tidal', 'Pandora', 'SoundCloud', 'Bandcamp'
];

// Define steps (combined flow)
const steps = [
  'Select Release Type',
  'Artwork',
  'Tracks & Info',
  'Pricing & Scheduling',
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

import TerritoryManager, { TerritoryMode } from '@/components/territory/TerritoryManager';
import RightsManager, { RightsType } from '@/components/rights/RightsManager';
// --- TrackInfo type (inline, since not using TrackInfoForm) ---
interface TrackInfo {
  title: string;
  version: string;
  artist: string;
  featuring: string;
  remixer: string;
  isrc: string;
  upc: string;
  language: string;
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
  recordingYear: string;
  originalReleaseDate: string;
  parentalAdvisory: string;
  instrumental: boolean;
}

const defaultTrackInfo: TrackInfo = {
  title: '',
  version: '',
  artist: '',
  featuring: '',
  remixer: '',
  isrc: '',
  upc: '',
  language: '',
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
  recordingYear: '',
  originalReleaseDate: '',
  parentalAdvisory: 'none',
  instrumental: false,
};

export default function UploadPage() {
  // ...existing state
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [releaseTitle, setReleaseTitle] = useState('');
  const [label, setLabel] = useState('');
  const [upc, setUpc] = useState('');
  // ...existing state

  // All hooks must be at the top and called unconditionally
  const auth = useAuth();
  const router = useRouter();

  // All useState hooks declared at the top in consistent order
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [releaseType, setReleaseType] = useState<ReleaseType>('single');
  const [tracks, setTracks] = useState<(File | null)[]>(() => {
    // Default to minTracks for initial releaseType
    const initialType = releaseTypes.find(t => t.value === 'single');
    return Array(initialType?.minTracks ?? 1).fill(null);
  });
  // Which track is being edited in the right-side form
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // Step 1 track analysis state (must always be declared after tracks)
  const [analysisResults, setAnalysisResults] = useState<(any | null)[]>(() => Array(tracks.length).fill(null));
  const [analysisLoading, setAnalysisLoading] = useState<boolean[]>(() => Array(tracks.length).fill(false));
  const [analysisErrors, setAnalysisErrors] = useState<(string | null)[]>(() => Array(tracks.length).fill(null));
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Track upload progress indicator (indeterminate for now)
  const [trackUploading, setTrackUploading] = useState<boolean[]>(() => Array(tracks.length).fill(false));
  // Uploaded media (server) state
  const [artworkUploadedUrl, setArtworkUploadedUrl] = useState<string | null>(null);
  const [artworkUploadedFilename, setArtworkUploadedFilename] = useState<string | null>(null);
  const [audioUploadedUrls, setAudioUploadedUrls] = useState<(string | null)[]>(() => Array(tracks.length).fill(null));
  const [audioUploadedFilenames, setAudioUploadedFilenames] = useState<(string | null)[]>(() => Array(tracks.length).fill(null));
  const [territoryCountries, setTerritoryCountries] = useState<string[]>([]);
  const [territoryMode, setTerritoryMode] = useState<TerritoryMode>('allowed');
  const [rightsType, setRightsType] = useState<RightsType>('exclusive');
  const [rightsDescription, setRightsDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null); 
  const [analysisError, setAnalysisError] = useState('');
  // Multi-track info state for Track Information step
  const [trackInfos, setTrackInfos] = useState<TrackInfo[]>(() => Array(tracks.length).fill({ ...defaultTrackInfo }));
  // Distribution Step State
  const DSP_LIST = [
    { key: 'spotify', name: 'Spotify', logo: '/dsp/spotify.png', info: 'World\'s largest streaming service.' },
    { key: 'apple', name: 'Apple Music', logo: '/dsp/applemusic.png', info: 'Apple\'s music streaming.' },
    { key: 'amazon', name: 'Amazon Music', logo: '/dsp/amazonmusic.png', info: 'Amazon\'s music streaming.' },
    { key: 'youtube', name: 'YouTube Music', logo: '/dsp/youtubemusic.png', info: 'Google\'s streaming platform.' },
    { key: 'deezer', name: 'Deezer', logo: '/dsp/deezer.png', info: 'Popular in Europe.' },
    { key: 'tidal', name: 'Tidal', logo: '/dsp/tidal.png', info: 'High-fidelity audio.' },
    { key: 'pandora', name: 'Pandora', logo: '/dsp/pandora.png', info: 'US-based streaming.' },
    { key: 'soundcloud', name: 'SoundCloud', logo: '/dsp/soundcloud.png', info: 'Indie & creators.' },
  ];
  const [selectedDSPs, setSelectedDSPs] = useState<string[]>(DSP_LIST.map(dsp => dsp.key));
  const [releaseWorldwide, setReleaseWorldwide] = useState(true);
  const [releaseDate, setReleaseDate] = useState<string>("");
  // Artwork loading indicator
  const [artworkUploading, setArtworkUploading] = useState<boolean>(false);
  // Local audio preview URLs for each selected track
  const [trackPreviewUrls, setTrackPreviewUrls] = useState<(string | null)[]>(() => Array(tracks.length).fill(null));
  // Pricing & scheduling state
  const [currency, setCurrency] = useState<string>('USD');
  const [albumPrice, setAlbumPrice] = useState<number | ''>('');
  const [trackPrice, setTrackPrice] = useState<number | ''>('');
  // Snackbar for "Apply to all"
  const [snackOpen, setSnackOpen] = useState(false);

  // Computed values (not state)
  const allSelected = selectedDSPs.length === DSP_LIST.length;

  

  // Simulate release submission to DSPs
  const handleSubmitRelease = async () => {
    setSubmitState('loading');
    // Gather release data
    const releasePayload = {
      releaseType,
      releaseTitle,
      primaryArtist: trackInfos[0]?.artist || '',
      label,
      upc,
      releaseDate,
      artworkUrl: artworkUploadedUrl,
      artworkFile: artworkUploadedFilename,
      territories: territoryCountries,
      stores: selectedDSPs,
      tracks: trackInfos.map((t, idx) => ({
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        language: t.language,
        explicit: t.explicit,
        composers: t.composers,
        publishers: t.publishers,
        producers: t.producers,
        lyrics: t.lyrics,
        copyrightC: t.copyrightC,
        copyrightP: t.copyrightP,
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
        featuring: t.featuring,
        remixer: t.remixer,
        originalReleaseDate: t.originalReleaseDate,
        audioUrl: audioUploadedUrls[idx] || null,
        audioFile: audioUploadedFilenames[idx] || null,
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
  const handleDSPToggle = (key: string) => {
    setSelectedDSPs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const handleSelectAll = () => {
    setSelectedDSPs(allSelected ? [] : DSP_LIST.map(dsp => dsp.key));
  };
  const handleContinue = () => {
    if (isDistributionValid) handleNext();
  };

  const isPricingValid = (() => {
    const validNumber = (v: number | '') => typeof v === 'number' && v >= 0;
    if (releaseType === 'single') return validNumber(trackPrice);
    return validNumber(albumPrice) && validNumber(trackPrice);
  })();

  // Keep trackInfos in sync with tracks length
  useEffect(() => {
    setTrackInfos(prev => {
      if (prev.length < tracks.length) {
        return [...prev, ...Array(tracks.length - prev.length).fill({ ...defaultTrackInfo })];
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

  // Handler to apply a field value from one track to all tracks, only if the value is not empty/null
  const handleApplyToAll = (idx: number, field: keyof TrackInfo) => {
    const value = trackInfos[idx]?.[field];
    // Only apply if value is not empty (for strings) or not null/undefined
    if (
      (typeof value === 'string' && value.trim() === '') ||
      value === undefined ||
      value === null
    ) {
      return;
    }
    setTrackInfos(prev => prev.map(info => ({ ...info, [field]: value })));
  };

  // Validation: all required fields for all tracks
  const isTrackInfoListValid = trackInfos.every(info =>
    info.title.trim() &&
    info.artist.trim() &&
    info.language &&
    info.genre
  );

  // All useEffect hooks
  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep analysis state arrays in sync with tracks array length
  useEffect(() => {
    setAnalysisResults(arr => arr.length === tracks.length ? arr : Array(tracks.length).fill(null));
    setAnalysisLoading(arr => arr.length === tracks.length ? arr : Array(tracks.length).fill(false));
    setAnalysisErrors(arr => arr.length === tracks.length ? arr : Array(tracks.length).fill(null));
    setTrackUploading(arr => arr.length === tracks.length ? arr : Array(tracks.length).fill(false));
  }, [tracks.length]);

  // Update tracks state when releaseType changes
  useEffect(() => {
    const selectedType = releaseTypes.find(t => t.value === releaseType);
    if (!selectedType) return;
    setTracks(prev => {
      if (prev.length < selectedType.minTracks) {
        return [...prev, ...Array(selectedType.minTracks - prev.length).fill(null)];
      } else if (prev.length > selectedType.maxTracks) {
        return prev.slice(0, selectedType.maxTracks);
      } else if (prev.length < selectedType.maxTracks) {
        // If user switched from album to single/ep, trim tracks
        return prev.slice(0, selectedType.maxTracks);
      }
      return prev;
    });
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
    setAudioUploadedUrls(arr => arr.length === tracks.length ? arr : Array(tracks.length).fill(null));
    setAudioUploadedFilenames(arr => arr.length === tracks.length ? arr : Array(tracks.length).fill(null));
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

  // Add or remove tracks (for EP/Album)
  const handleAddTrack = () => {
    const selectedType = releaseTypes.find(t => t.value === releaseType);
    if (selectedType && tracks.length < selectedType.maxTracks) {
      setTracks([...tracks, null]);
    }
  };
  
  const handleRemoveTrack = (index: number) => {
    const selectedType = releaseTypes.find(t => t.value === releaseType);
    if (selectedType && tracks.length > selectedType.minTracks) {
      setTracks(tracks.filter((_, i) => i !== index));
    }
  };
  
  // Handle file drop or selection
  const handleTrackFileChange = async (index: number, file: File | null) => {
    const newTracks = [...tracks];
    newTracks[index] = file;
    setTracks(newTracks);

    // Reset previous analysis state for this index
    setAnalysisResults(prev => prev.map((r, i) => (i === index ? null : r)));
    setAnalysisErrors(prev => prev.map((e, i) => (i === index ? null : e)));
    setTrackUploading(prev => prev.map((u, i) => (i === index ? !!file : u)));

    // If the file is cleared, also clear autofilled fields so re-uploads can repopulate
    if (!file) {
      // Clear title and duration to enable fresh autofill on next upload
      setTrackInfos(prev => prev.map((info, i) => (
        i === index ? { ...info, title: '', duration: '' } : info
      )));
      // Make sure loading is not stuck for this slot
      setAnalysisLoading(prev => prev.map((l, i) => (i === index ? false : l)));
      // Clear uploaded refs too
      setAudioUploadedUrls(prev => prev.map((u, i) => (i === index ? null : u)));
      setAudioUploadedFilenames(prev => prev.map((u, i) => (i === index ? null : u)));
      return;
    }

    // Auto-analyze on valid selection
    // Autofill title from file name if empty
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    setTrackInfos(prev => prev.map((info, i) => i === index ? { ...info, title: info.title ? info.title : baseName } : info));
    setAnalysisLoading(prev => prev.map((l, i) => (i === index ? true : l)));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/audio/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        // Surface backend error
        let errMsg = 'Analysis failed';
        try {
          const errBody = await res.json();
          errMsg = errBody?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setAnalysisResults(prev => prev.map((r, i) => (i === index ? data : r)));
      // Autofill duration from analysis if available
      const dur = data?.duration;
      if (typeof dur === 'number' || typeof dur === 'string') {
        const durStr = formatDuration(dur);
        setTrackInfos(prev => prev.map((info, i) => i === index ? { ...info, duration: durStr } : info));
      }
    } catch (err: any) {
      setAnalysisErrors(prev => prev.map((e, i) => (i === index ? (err?.message || 'Error analyzing audio') : e)));
    } finally {
      setAnalysisLoading(prev => prev.map((l, i) => (i === index ? false : l)));
      setTrackUploading(prev => prev.map((u, i) => (i === index ? false : u)));
    }

    // Upload audio to server (after analysis kicks off)
    try {
      const { url, filename } = await uploadAudioToServer(file);
      setAudioUploadedUrls(prev => prev.map((u, i) => (i === index ? url : u)));
      setAudioUploadedFilenames(prev => prev.map((u, i) => (i === index ? filename : u)));
    } catch (e: any) {
      console.error('Audio upload failed:', e);
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
    setTracks(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setAnalysisResults(prev => prev.map((r, i) => (i === index ? null : r)));
    setAnalysisErrors(prev => prev.map((e, i) => (i === index ? null : e)));
    setTrackUploading(prev => prev.map((u, i) => (i === index ? true : u)));

    // Autofill title and analyze
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    setTrackInfos(prev => prev.map((info, i) => i === index ? { ...info, title: info.title ? info.title : baseName } : info));
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
      setAnalysisLoading(prev => prev.map((l, i) => (i === index ? false : l)));
      setTrackUploading(prev => prev.map((u, i) => (i === index ? false : u)));
    }

    // Upload audio to server
    try {
      const { url, filename } = await uploadAudioToServer(file);
      setAudioUploadedUrls(prev => prev.map((u, i) => (i === index ? url : u)));
      setAudioUploadedFilenames(prev => prev.map((u, i) => (i === index ? filename : u)));
    } catch (e: any) {
      console.error('Audio upload failed:', e);
    }
  };

  // Multi-file selection handler
  const handleMultiTrackFiles = async (fileList: FileList) => {
    const selectedType = releaseTypes.find(t => t.value === releaseType);
    const max = selectedType?.maxTracks ?? 50;
    const files = Array.from(fileList).slice(0, max);
    // Initialize tracks array to the selected files length
    setTracks(files.map(f => f));
    // Ensure dependent arrays resize
    setSelectedTrackIdx(0);
    // Kick off analyze+upload for each file
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
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {releaseTypes.map((type) => (
                  <Grid xs={12} md={4} key={type.value}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: releaseType === type.value ? 2 : 1,
                        borderColor: releaseType === type.value ? 'primary.main' : 'divider',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => setReleaseType(type.value)}
                    >
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                        <Radio
                          checked={releaseType === type.value}
                          onChange={handleReleaseTypeChange}
                          value={type.value}
                          name="release-type"
                          sx={{ alignSelf: 'flex-end', mt: -2, mr: -2 }}
                        />
                        <Box sx={{ color: 'primary.main', mb: 2 }}>
                          {type.icon}
                        </Box>
                        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                          {type.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
              <Grid xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper', color: 'text.primary' }}>
                  <CardContent>
                    <Box
                      sx={{
                        border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240,
                      }}
                    >
                      <Box sx={{ width: 160, height: 160, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                        {artworkPreview ? (
                          <img src={artworkPreview} alt="Artwork preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Album sx={{ fontSize: 56, color: 'text.secondary' }} />
                        )}
                      </Box>
                      <input id="artwork-upload" type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
                        onChange={e => { if (e.target.files && e.target.files[0]) setArtworkFile(e.target.files[0]); }} />
                      <label htmlFor="artwork-upload">
                        <Button variant="outlined" component="span">Select Image</Button>
                      </label>
                      {artworkUploading && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <LinearProgress />
                          <Typography variant="caption" color="text.secondary">Validating artwork…</Typography>
                        </Box>
                      )}
                      {artworkError && <Typography color="error" sx={{ mt: 1 }}>{artworkError}</Typography>}
                      {!artworkError && artworkPreview && (
                        <Typography color="success.main" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle fontSize="small" /> Artwork looks good (3000x3000)
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>JPG or PNG (exactly 3000x3000px, max 10MB)</Typography>
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
      
      case 2:
        // Tracks & Info
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Upload Your Track{tracks.length > 1 ? 's' : ''}</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {releaseTypes.find(t => t.value === releaseType)?.label === 'Single' && 'Select and upload your track.'}
              {releaseTypes.find(t => t.value === releaseType)?.label === 'EP' && 'Upload 3-7 tracks for your EP.'}
              {releaseTypes.find(t => t.value === releaseType)?.label === 'Album' && 'Upload up to 50 tracks for your album.'}
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start',flexWrap: 'nowrap' }}>
              <Grid xs={12} md={5} minWidth={350}>
                {/* Single multi-file selector */}
                <Box sx={{ mb: 2 }}>
                  <input
                    id="multi-track-upload"
                    type="file"
                    accept="audio/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => { if (e.target.files && e.target.files.length) handleMultiTrackFiles(e.target.files); }}
                  />
                  <label htmlFor="multi-track-upload">
                    <Button variant="outlined" component="span" startIcon={<CloudUpload />}>Select Tracks</Button>
                  </label>
                </Box>
                <Grid container spacing={2}>
                  {tracks.map((file, idx) => (
                    <Grid xs={12} key={idx}>
                      <Card
                        onClick={() => setSelectedTrackIdx(idx)}
                        sx={{ p: 2, cursor: 'pointer', border: 2, borderColor: idx === selectedTrackIdx ? 'primary.main' : 'divider' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography fontWeight="bold">Track {idx + 1}</Typography>
                          {(() => {
                            const selectedType = releaseTypes.find(t => t.value === releaseType);
                            return selectedType && tracks.length > selectedType.minTracks ? (
                              <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveTrack(idx); }} color="error"><Delete /></IconButton>
                            ) : null;
                          })()}
                        </Box>
                        {file && <Chip icon={<AudioFile />} label={file.name} sx={{ mt: 1, mb: 1 }} />}
                        {trackPreviewUrls[idx] && (
                          <Box sx={{ width: '100%', mt: 1 }}>
                            <audio controls src={trackPreviewUrls[idx] || undefined} style={{ width: '100%' }} />
                          </Box>
                        )}
                        {analysisLoading[idx] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="caption" color="text.secondary">Analyzing…</Typography>
                          </Box>
                        )}
                        {analysisResults[idx] && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="success.main">Format: {analysisResults[idx].format || analysisResults[idx].container || '—'}</Typography><br />
                            <Typography variant="caption" color="success.main">Duration: {formatDuration(analysisResults[idx].duration)}</Typography><br />
                            <Typography variant="caption" color="success.main">Bitrate: {formatBitrate(analysisResults[idx].bitrate || analysisResults[idx].bit_rate)}</Typography>
                          </Box>
                        )}
                        {analysisErrors[idx] && (<Typography variant="caption" color="error.main">{analysisErrors[idx]}</Typography>)}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="outlined" color="primary" startIcon={<ArrowBack />} onClick={handleBack}>Back</Button>
                  <Box>
                    {(() => {
                      const selectedType = releaseTypes.find(t => t.value === releaseType);
                      return selectedType && tracks.length < selectedType.maxTracks ? (
                        <Button variant="contained" color="secondary" startIcon={<Add />} onClick={handleAddTrack} sx={{ mr: 2 }}>Add Track</Button>
                      ) : null;
                    })()}
                  </Box>
                </Box>
              </Grid>
              <Grid xs={12} md={7}>
                <Typography variant="h6" fontWeight="bold">Track Information</Typography>
                {tracks.length > 0 && selectedTrackIdx >= 0 && selectedTrackIdx < tracks.length && (
                  <Box sx={{ mt: 3, mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Track {selectedTrackIdx + 1}</Typography>
                    <Grid container spacing={2}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Basic Info</Typography>
                        <Divider />
                      </Box>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Track Title *"
                          fullWidth
                          sx={{ flex: 1, minWidth: 260 }}
                          required
                          value={trackInfos[selectedTrackIdx]?.title || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'title', e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="Use a clear, searchable name. Avoid extra version text here.">
                                  <Info fontSize="small" />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'title'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Version"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.version || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'version', e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="e.g., Radio Edit, Acoustic, Remix">
                                  <Info fontSize="small" />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'version'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Primary Artist *"
                          fullWidth
                          sx={{ flex: 1, minWidth: 260 }}
                          required
                          value={trackInfos[selectedTrackIdx]?.artist || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'artist', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'artist'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Featuring Artist"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.featuring || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'featuring', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'featuring'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Remixer"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.remixer || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'remixer', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'remixer'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          select
                          label="Language *"
                          fullWidth
                          sx={{ flex: 1, minWidth: 260 }}
                          required
                          value={trackInfos[selectedTrackIdx]?.language || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'language', e.target.value)}
                        >
                          {languages.map(lang => (
                            <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
                          ))}
                        </TextField>
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'language'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          select
                          label="Genre *"
                          fullWidth
                          sx={{ flex: 1, minWidth: 260 }}
                          required
                          value={trackInfos[selectedTrackIdx]?.genre || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'genre', e.target.value)}
                        >
                          {genres.map(g => (
                            <MenuItem key={g} value={g}>{g}</MenuItem>
                          ))}
                        </TextField>
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'genre'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Subgenre"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.subgenre || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'subgenre', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'subgenre'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Box sx={{ width: '100%', mt: 2, mb: 1 }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Identifiers & Dates</Typography>
                        <Divider />
                      </Box>
                      <Grid xs={12} md={6}>
                        <TextField
                          label="ISRC"
                          fullWidth
                          sx={{ minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.isrc || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'isrc', e.target.value)}
                          helperText="Leave blank for auto assign by system"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="International Standard Recording Code">
                                  <Info fontSize="small" />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          label="UPC"
                          fullWidth
                          sx={{ minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.upc || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'upc', e.target.value)}
                          helperText="Leave blank for auto assign by system"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="Universal Product Code for releases">
                                  <Info fontSize="small" />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          label="Original Release Date"
                          type="date"
                          fullWidth
                          sx={{ minWidth: 220 }}
                          InputLabelProps={{ shrink: true }}
                          value={trackInfos[selectedTrackIdx]?.originalReleaseDate || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'originalReleaseDate', e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="Date the track was first released">
                                  <Info fontSize="small" />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid xs={12} md={3}>
                        <TextField
                          label="Track #"
                          type="number"
                          fullWidth
                          sx={{ minWidth: 160 }}
                          inputProps={{ min: 1 }}
                          value={trackInfos[selectedTrackIdx]?.trackNumber || 1}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'trackNumber', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          label="Duration"
                          fullWidth
                          InputProps={{ readOnly: true }}
                          value={trackInfos[selectedTrackIdx]?.duration || ''}
                        />
                      </Grid>
                      <Box sx={{ width: '100%', mt: 2, mb: 1 }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Credits</Typography>
                        <Divider />
                      </Box>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Composers"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.composers || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'composers', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'composers'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Publishers"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.publishers || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'publishers', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'publishers'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Producers"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.producers || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'producers', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'producers'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Recording Year"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.recordingYear || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'recordingYear', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'recordingYear'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Box sx={{ width: '100%', mt: 2, mb: 1 }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Lyrics</Typography>
                        <Divider />
                      </Box>
                      <Grid xs={12} md={6}>
                        <TextField
                          label="Lyrics"
                          fullWidth
                          sx={{ minWidth: 260 }}
                          multiline
                          minRows={3}
                          value={trackInfos[selectedTrackIdx]?.lyrics || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'lyrics', e.target.value)}
                        />
                      </Grid>
                      <Box sx={{ width: '100%', mt: 2, mb: 1 }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Rights</Typography>
                        <Divider />
                      </Box>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Copyright (C) (C-line)"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.copyrightC || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'copyrightC', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'copyrightC'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Sound Recording (P) (P-line)"
                          fullWidth
                          sx={{ flex: 1, minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.copyrightP || ''}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'copyrightP', e.target.value)}
                        />
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'copyrightP'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          select
                          label="Parental Advisory"
                          fullWidth
                          sx={{ minWidth: 220 }}
                          value={trackInfos[selectedTrackIdx]?.parentalAdvisory || 'none'}
                          onChange={e => handleTrackInfoChange(selectedTrackIdx, 'parentalAdvisory', e.target.value)}
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="explicit">Explicit</MenuItem>
                          <MenuItem value="clean">Clean</MenuItem>
                        </TextField>
                        <Tooltip title="Apply to all tracks">
                          <IconButton sx={{ ml: 1 }} onClick={() => { handleApplyToAll(selectedTrackIdx, 'parentalAdvisory'); setSnackOpen(true); }}>
                            <PlaylistAddCheck fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
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
                          sx={{ ml: 2 }}
                          control={
                            <Checkbox
                              checked={!!trackInfos[selectedTrackIdx]?.instrumental}
                              onChange={e => handleTrackInfoChange(selectedTrackIdx, 'instrumental', e.target.checked)}
                            />
                          }
                          label="Instrumental"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                <Snackbar
                  open={snackOpen}
                  autoHideDuration={2000}
                  onClose={() => setSnackOpen(false)}
                  message="Applied to all tracks"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={
                  !isTrackInfoListValid ||
                  analysisLoading.some(Boolean) ||
                  trackUploading.some(Boolean) ||
                  tracks.some(f => !f)
                }
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 3:
        // Pricing & Scheduling
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Pricing & Scheduling</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid xs={12} md={4}><TextField select label="Currency" fullWidth value={currency} onChange={e => setCurrency(e.target.value)}><MenuItem value="USD">USD</MenuItem><MenuItem value="EUR">EUR</MenuItem><MenuItem value="INR">INR</MenuItem></TextField></Grid>
              {releaseType !== 'single' && (
                <Grid xs={12} md={4}><TextField label="Album Price" type="number" inputProps={{ step: '0.01', min: 0 }} fullWidth value={albumPrice} onChange={e => setAlbumPrice(e.target.value === '' ? '' : Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">{currency}</InputAdornment> }} /></Grid>
              )}
              <Grid xs={12} md={4}><TextField label="Track Price" type="number" inputProps={{ step: '0.01', min: 0 }} fullWidth value={trackPrice} onChange={e => setTrackPrice(e.target.value === '' ? '' : Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">{currency}</InputAdornment> }} /></Grid>
              <Grid xs={12} md={4}><TextField label="Release Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={releaseDate} onChange={e => setReleaseDate(e.target.value)} /></Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" color="primary" onClick={handleNext} disabled={!isPricingValid || !releaseDate}>Continue</Button>
            </Box>
          </Box>
        );
      
      case 4:
        // Distribution Providers
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Distribution Providers</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Select the DSPs where you want your release to be distributed.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Select Stores</Typography>
              <Button size="small" onClick={handleSelectAll}>{allSelected ? 'Deselect All' : 'Select All'}</Button>
            </Box>
            <Grid container spacing={2}>
              {DSP_LIST.map(dsp => {
                const selected = selectedDSPs.includes(dsp.key);
                return (
                  <Grid xs={12} sm={6} md={4} key={dsp.key}>
                    <Card
                      onClick={() => handleDSPToggle(dsp.key)}
                      sx={{
                        cursor: 'pointer',
                        border: selected ? 2 : 1,
                        borderColor: selected ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: 3 },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={dsp.logo} alt={dsp.name} sx={{ width: 36, height: 36 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{dsp.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{dsp.info}</Typography>
                        </Box>
                        <Checkbox checked={selected} onChange={() => handleDSPToggle(dsp.key)} />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" color="primary" onClick={handleContinue} disabled={!isDistributionValid}>Continue</Button>
            </Box>
          </Box>
        );

      case 5:
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
      case 6:
        // Review & Submit
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Review & Submit</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Review all details before submitting your release.
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
              <Typography variant="subtitle1" fontWeight="bold">Release Overview</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid xs={12} md={3}>
                  <Box sx={{
                    width: 160,
                    height: 160,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    {artworkPreview ? (
                      <img src={artworkPreview} alt="Artwork preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        <Album />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid xs={12} md={9}>
                  <Box>
                    <strong>Release Title:</strong> {releaseTitle || 'N/A'}<br />
                    <strong>Type:</strong> {releaseType}<br />
                    <strong>Primary Artist:</strong> {trackInfos[0]?.artist || 'N/A'}<br />
                    <strong>Label:</strong> {label || 'N/A'}<br />
                    <strong>Release Date:</strong> {releaseDate || 'N/A'}<br />
                    <strong>Pricing:</strong> {releaseType !== 'single' ? `Album ${currency} ${albumPrice || '—'}, ` : ''}Track {currency} {trackPrice || '—'}<br />
                    <strong>Tracks:</strong> {tracks.length}<br />
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">Tracklist</Typography>
              <ol style={{ paddingLeft: 18 }}>
                {trackInfos.map((track, idx) => (
                  <li key={idx}>
                    <div>
                      <strong>{track.title || `Track ${idx + 1}`}</strong>
                      {track.version ? ` (${track.version})` : ''}
                      {` — ${track.artist || 'Unknown Artist'}`}
                      {track.featuring ? ` feat. ${track.featuring}` : ''}
                      {track.remixer ? ` [Remix: ${track.remixer}]` : ''}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
                      {track.duration ? `Duration: ${track.duration} · ` : ''}
                      {track.genre ? `Genre: ${track.genre}${track.subgenre ? `/${track.subgenre}` : ''} · ` : ''}
                      {track.language ? `Language: ${track.language} · ` : ''}
                      {track.isrc ? `ISRC: ${track.isrc} · ` : ''}
                      {track.parentalAdvisory && track.parentalAdvisory !== 'none' ? `Advisory: ${track.parentalAdvisory} · ` : ''}
                      {track.instrumental ? `Instrumental · ` : ''}
                      {track.recordingYear ? `Recording Year: ${track.recordingYear} · ` : ''}
                      {track.copyrightC ? `© ${track.copyrightC} · ` : ''}
                      {track.copyrightP ? `℗ ${track.copyrightP}` : ''}
                    </div>
                    {(track.composers || track.publishers || track.producers) && (
                      <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
                        {track.composers ? `Composers: ${track.composers} · ` : ''}
                        {track.publishers ? `Publishers: ${track.publishers} · ` : ''}
                        {track.producers ? `Producers: ${track.producers}` : ''}
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
                ))}
              </ol>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">Distribution Providers</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 1 }}>
                {selectedDSPs.map((key) => {
                  const dsp = DSP_LIST.find(d => d.key === key);
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {territoryCountries.length > 0 ? (
                    territoryCountries
                      .map(code => {
                        const c = countries.find(ct => ct.code === code);
                        return c ? c.label : code;
                      })
                      .sort()
                      .map(label => (
                        <Chip key={label} label={label} size="small" />
                      ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No territories selected</Typography>
                  )}
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2">
                    Rights: <strong>{rightsType}</strong>{rightsDescription ? ` — ${rightsDescription}` : ''}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            {submitState === 'idle' ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button variant="contained" color="primary" onClick={handleSubmitRelease} disabled={!isTrackInfoListValid}>
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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Upload Your Track
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Share your music with the world through our distribution platform
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              sx={{ cursor: 'pointer' }}
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

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {renderStepContent()}
      </Paper>
    </Box>
  );
}