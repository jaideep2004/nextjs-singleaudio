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
  Grid,
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
} from '@mui/material';
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
  Error,
  AudioFile,
  Image,
  PlayArrow,
  Stop,
  PlaylistAddCheck,
} from '@mui/icons-material';
import { useAuth } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

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

// Define steps
const steps = [
  'Select Release Type',
  'Upload Files',
  'Territory Restrictions',
  'Rights Management',
  'Track Information',
  'Distribution',
  'Review & Submit',
];

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
  lyrics: string;
  producers: string;
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // Step 1 track analysis state (must always be declared after tracks)
  const [analysisResults, setAnalysisResults] = useState<(any | null)[]>(() => Array(tracks.length).fill(null));
  const [analysisLoading, setAnalysisLoading] = useState<boolean[]>(() => Array(tracks.length).fill(false));
  const [analysisErrors, setAnalysisErrors] = useState<(string | null)[]>(() => Array(tracks.length).fill(null));
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
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
      artwork: null, // File uploads need special handling, skip for now
      territories: territoryCountries,
      stores: selectedDSPs,
      tracks: trackInfos.map(t => ({
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
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png'].includes(artworkFile.type)) {
      setArtworkError('Artwork must be a JPG or PNG image.');
      setArtworkPreview(null);
      return;
    }
    // Validate size
    if (artworkFile.size > 10 * 1024 * 1024) {
      setArtworkError('Artwork must be less than or equal to 10MB.');
      setArtworkPreview(null);
      return;
    }
    // Validate dimensions
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(artworkFile);
    img.onload = () => {
      if (img.width < 3000 || img.height < 3000) {
        setArtworkError('Artwork must be at least 3000x3000 pixels.');
        setArtworkPreview(null);
      } else if (img.width !== img.height) {
        setArtworkError('Artwork must be a square image (width = height).');
        setArtworkPreview(null);
      } else {
        setArtworkError(null);
        setArtworkPreview(objectUrl);
      }
      // Do NOT revoke objectUrl here! Only on unmount.
    };
    img.onerror = () => {
      setArtworkError('Invalid image file.');
      setArtworkPreview(null);
      // Do NOT revoke objectUrl here! Only on unmount.
    };
    img.src = objectUrl;
    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [artworkFile]);

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
  const handleTrackFileChange = (index: number, file: File | null) => {
    const newTracks = [...tracks];
    newTracks[index] = file;
    setTracks(newTracks);
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
        throw new Error('Analysis failed');
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
                  <Grid item xs={12} md={4} key={type.value}>
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
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                size="large"
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 1:
        // Upload Files Step
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Upload Your Track{tracks.length > 1 ? 's' : ''}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {releaseTypes.find(t => t.value === releaseType)?.label === 'Single' && 'Select and upload your track.'}
              {releaseTypes.find(t => t.value === releaseType)?.label === 'EP' && 'Upload 3-7 tracks for your EP.'}
              {releaseTypes.find(t => t.value === releaseType)?.label === 'Album' && 'Upload up to 50 tracks for your album.'}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {tracks.map((file, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Card sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                    <Typography fontWeight="bold">Track {idx + 1}</Typography>
                    {file ? (
                      <>
                        <Chip icon={<AudioFile />} label={file.name} sx={{ mt: 1, mb: 1 }} />
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleAnalyzeTrack(idx)}
                          disabled={analysisLoading[idx]}
                          sx={{ mb: 1 }}
                        >
                          {analysisLoading[idx] ? <CircularProgress size={18} /> : 'Analyze'}
                        </Button>
                        {analysisResults[idx] && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="success.main">Format: {analysisResults[idx].format}</Typography><br />
                            <Typography variant="caption" color="success.main">Duration: {analysisResults[idx].duration}s</Typography><br />
                            <Typography variant="caption" color="success.main">Bitrate: {analysisResults[idx].bitrate} kbps</Typography>
                          </Box>
                        )}
                        {analysisErrors[idx] && (
                          <Typography variant="caption" color="error.main">{analysisErrors[idx]}</Typography>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{ mt: 2 }}
                      >
                        Upload
                        <input type="file" hidden accept="audio/*" onChange={e => handleTrackFileChange(idx, e.target.files?.[0] || null)} />
                      </Button>
                    )}
                    {(() => {
                      const selectedType = releaseTypes.find(t => t.value === releaseType);
                      return selectedType && tracks.length > selectedType.minTracks ? (
                        <IconButton onClick={() => handleRemoveTrack(idx)} color="error" sx={{ mt: 1 }}>
                          <Delete />
                        </IconButton>
                      ) : null;
                    })()}
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Back
              </Button>
              <Box>
                {(() => {
                  const selectedType = releaseTypes.find(t => t.value === releaseType);
                  return selectedType && tracks.length < selectedType.maxTracks ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<Add />}
                      onClick={handleAddTrack}
                      sx={{ mr: 2 }}
                    >
                      Add Track
                    </Button>
                  ) : null;
                })()}
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                  disabled={tracks.some(f => !f || !!validateTrackFile(f))}
                >
                  Continue
                </Button>
              </Box>
            </Box>

            {/* Artwork Upload Section */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper', color: 'text.primary' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cover Artwork
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                      }}
                    >
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          borderRadius: 1,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {artworkPreview ? (
                          <img
                            src={artworkPreview}
                            alt="Artwork preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Album sx={{ fontSize: 40, color: 'text.secondary' }} />
                        )}
                      </Box>
                      <Typography variant="body1" align="center">
                        Drag and drop your artwork here or
                      </Typography>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        style={{ display: 'none' }}
                        id="artwork-upload"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setArtworkFile(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="artwork-upload">
                        <Button 
                          variant="outlined" 
                          component="span"
                          sx={{ mt: 2 }}
                        >
                          Select Image
                        </Button>
                      </label>
                      {artworkError && (
                        <Typography color="error" sx={{ mt: 1, display: 'block' }}>{artworkError}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        JPG or PNG (min 3000x3000px, max 10MB, must be square)
                      </Typography>
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
                onClick={handleNext}
                disabled={!analysisResult}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <TerritoryManager
              value={territoryCountries}
              mode={territoryMode}
              onChange={(countries, mode) => {
                setTerritoryCountries(countries);
                setTerritoryMode(mode);
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={territoryCountries.length === 0}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <RightsManager
              rightsType={rightsType}
              description={rightsDescription}
              onChange={(type, desc) => {
                setRightsType(type);
                setRightsDescription(desc);
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!rightsType}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 4:
        // Track Information - Orchard-style, dynamic per track
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Track Information
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please provide detailed information for each track. Fields marked with * are required.
            </Typography>
            {tracks.map((track, idx) => (
              <Box key={idx} sx={{ mt: 4, mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Track {idx + 1}
                </Typography>
                {/* Core Info */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Track Title *" fullWidth required value={trackInfos[idx]?.title || ''} onChange={e => handleTrackInfoChange(idx, 'title', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Version (Remix, Acoustic, etc.)" fullWidth value={trackInfos[idx]?.version || ''} onChange={e => handleTrackInfoChange(idx, 'version', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Primary Artist *" fullWidth required value={trackInfos[idx]?.artist || ''} onChange={e => handleTrackInfoChange(idx, 'artist', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Featuring Artist(s)" fullWidth value={trackInfos[idx]?.featuring || ''} onChange={e => handleTrackInfoChange(idx, 'featuring', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Remixer(s)" fullWidth value={trackInfos[idx]?.remixer || ''} onChange={e => handleTrackInfoChange(idx, 'remixer', e.target.value)} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="Track Number *" fullWidth type="number" required value={trackInfos[idx]?.trackNumber || idx + 1} onChange={e => handleTrackInfoChange(idx, 'trackNumber', Number(e.target.value))} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="Disc Number" fullWidth type="number" value={trackInfos[idx]?.discNumber || 1} onChange={e => handleTrackInfoChange(idx, 'discNumber', Number(e.target.value))} />
                  </Grid>
                </Grid>
                {/* Identifiers */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Identifiers</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField label={<span>ISRC <Tooltip title="International Standard Recording Code. Leave blank to auto-assign by DSP."><Info fontSize="small" /></Tooltip></span>} fullWidth value={trackInfos[idx]?.isrc || ''} onChange={e => handleTrackInfoChange(idx, 'isrc', e.target.value)} helperText="Leave blank to auto-assign by DSP" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField label={<span>UPC <Tooltip title="Universal Product Code. Leave blank to auto-assign by DSP."><Info fontSize="small" /></Tooltip></span>} fullWidth value={trackInfos[idx]?.upc || ''} onChange={e => handleTrackInfoChange(idx, 'upc', e.target.value)} helperText="Leave blank to auto-assign by DSP" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField label="Duration (mm:ss)" fullWidth value={trackInfos[idx]?.duration || ''} onChange={e => handleTrackInfoChange(idx, 'duration', e.target.value)} />
                    </Grid>
                  </Grid>
                </Box>
                {/* Credits */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Credits</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField label="Composer(s)" fullWidth value={trackInfos[idx]?.composers || ''} onChange={e => handleTrackInfoChange(idx, 'composers', e.target.value)} />
                      <Tooltip title="Apply to all tracks">
                        <IconButton sx={{ ml: 1 }} onClick={() => handleApplyToAll(idx, 'composers')}><PlaylistAddCheck fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField label="Publisher(s)" fullWidth value={trackInfos[idx]?.publishers || ''} onChange={e => handleTrackInfoChange(idx, 'publishers', e.target.value)} />
                      <Tooltip title="Apply to all tracks">
                        <IconButton sx={{ ml: 1 }} onClick={() => handleApplyToAll(idx, 'publishers')}><PlaylistAddCheck fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField label="Producer(s)" fullWidth value={trackInfos[idx]?.producers || ''} onChange={e => handleTrackInfoChange(idx, 'producers', e.target.value)} />
                      <Tooltip title="Apply to all tracks">
                        <IconButton sx={{ ml: 1 }} onClick={() => handleApplyToAll(idx, 'producers')}><PlaylistAddCheck fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField label="Lyrics" fullWidth value={trackInfos[idx]?.lyrics || ''} onChange={e => handleTrackInfoChange(idx, 'lyrics', e.target.value)} />
                      <Tooltip title="Apply to all tracks">
                        <IconButton sx={{ ml: 1 }} onClick={() => handleApplyToAll(idx, 'lyrics')}><PlaylistAddCheck fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
                {/* Rights & Metadata */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Rights & Metadata</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField label={<span>Copyright (C) <Tooltip title="Copyright owner of the composition."><Info fontSize="small" /></Tooltip></span>} fullWidth value={trackInfos[idx]?.copyrightC || ''} onChange={e => handleTrackInfoChange(idx, 'copyrightC', e.target.value)} />
                      <Tooltip title="Apply to all tracks">
                        <IconButton sx={{ ml: 1 }} onClick={() => handleApplyToAll(idx, 'copyrightC')}><PlaylistAddCheck fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField label={<span>Copyright (P) <Tooltip title="Copyright owner of the sound recording."><Info fontSize="small" /></Tooltip></span>} fullWidth value={trackInfos[idx]?.copyrightP || ''} onChange={e => handleTrackInfoChange(idx, 'copyrightP', e.target.value)} />
                      <Tooltip title="Apply to all tracks">
                        <IconButton sx={{ ml: 1 }} onClick={() => handleApplyToAll(idx, 'copyrightP')}><PlaylistAddCheck fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField label="Recording Year" fullWidth value={trackInfos[idx]?.recordingYear || ''} onChange={e => handleTrackInfoChange(idx, 'recordingYear', e.target.value)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField label="Original Release Date" fullWidth type="date" InputLabelProps={{ shrink: true }} value={trackInfos[idx]?.originalReleaseDate || ''} onChange={e => handleTrackInfoChange(idx, 'originalReleaseDate', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField select label="Language *" fullWidth required sx={{ minWidth: 180 }} value={trackInfos[idx]?.language || ''} onChange={e => handleTrackInfoChange(idx, 'language', e.target.value)} >
                        {languages.map(lang => (
                          <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField select label="Genre *" fullWidth required sx={{ minWidth: 180 }} value={trackInfos[idx]?.genre || ''} onChange={e => handleTrackInfoChange(idx, 'genre', e.target.value)} >
                        {genres.map(genre => (
                          <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField label="Subgenre" fullWidth value={trackInfos[idx]?.subgenre || ''} onChange={e => handleTrackInfoChange(idx, 'subgenre', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel control={<Checkbox checked={trackInfos[idx]?.explicit || false} onChange={e => handleTrackInfoChange(idx, 'explicit', e.target.checked)} />} label={<span>Explicit Content <Tooltip title="Check if the track contains explicit lyrics or themes."><Info fontSize="small" /></Tooltip></span>} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select label="Parental Advisory" fullWidth value={trackInfos[idx]?.parentalAdvisory || 'none'} onChange={e => handleTrackInfoChange(idx, 'parentalAdvisory', e.target.value)} >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="clean">Clean</MenuItem>
                        <MenuItem value="explicit">Explicit</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel control={<Checkbox checked={trackInfos[idx]?.instrumental || false} onChange={e => handleTrackInfoChange(idx, 'instrumental', e.target.checked)} />} label={<span>Instrumental <Tooltip title="Check if the track is fully instrumental."><Info fontSize="small" /></Tooltip></span>} />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ))}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" color="primary" startIcon={<ArrowBack />} onClick={handleBack}>Back</Button>
              <Button variant="contained" color="primary" endIcon={<ArrowForward />} onClick={handleNext} disabled={!isTrackInfoListValid}>Continue</Button>
            </Box>
          </Box>
        );
      case 5:
        // Professional Distribution step (Orchard-style)
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Distribution</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Distribution will be handled automatically once DSP integration is live. Your selections will be saved.
            </Alert>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Select DSPs</Typography>
              <Button
                variant={allSelected ? "outlined" : "contained"}
                onClick={handleSelectAll}
                size="small"
                sx={{ mb: 2, mr: 2 }}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <Grid container spacing={2}>
                {DSP_LIST.map(dsp => (
  <Grid item xs={6} sm={4} md={3} key={dsp.key}>
    <Card
      sx={{
        width: 160,
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: selectedDSPs.includes(dsp.key) ? '2px solid #7b61ff' : '1px solid #333',
        boxShadow: selectedDSPs.includes(dsp.key) ? 4 : 1,
        transition: '0.2s',
        cursor: 'pointer',
        '&:hover': { boxShadow: 6, borderColor: '#7b61ff' },
        background: selectedDSPs.includes(dsp.key) ? 'rgba(123,97,255,0.06)' : 'background.paper',
        p: 2,
        m: 'auto',
      }}
      onClick={() => handleDSPToggle(dsp.key)}
      elevation={0}
    >
      <Tooltip title={dsp.info} arrow>
        <Avatar src={dsp.logo} alt={dsp.name} sx={{ width: 56, height: 56, mb: 1, bgcolor: 'white', objectFit: 'contain' }} />
      </Tooltip>
      <Typography sx={{ mt: 1, fontWeight: 500, fontSize: 16, textAlign: 'center' }}>{dsp.name}</Typography>
      <Checkbox
        checked={selectedDSPs.includes(dsp.key)}
        onChange={e => handleDSPToggle(dsp.key)}
        color="secondary"
        sx={{ mt: 1 }}
        inputProps={{ 'aria-label': dsp.name }}
        onClick={e => e.stopPropagation()}
      />
    </Card>
  </Grid>
))}
              </Grid>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Release Preferences</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Release Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={releaseDate}
                    onChange={e => setReleaseDate(e.target.value)}
                    helperText="Choose when your release goes live (for preview only)"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={releaseWorldwide}
                        onChange={e => setReleaseWorldwide(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={<span>Release worldwide <Tooltip title="Territory selection coming soon" arrow><span style={{ color: '#aaa', marginLeft: 4 }}>(Coming soon)</span></Tooltip></span>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button onClick={handleBack} sx={{ minWidth: 100 }}>Back</Button>
              <Button
                variant="contained"
                onClick={handleContinue}
                sx={{ minWidth: 120 }}
                disabled={!isDistributionValid}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      case 6: // Review & Submit
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Review & Submit</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please review your release details below. When you submit, your release will be processed and delivered to all selected DSPs (Digital Service Providers) just like a real distributor. You'll see a confirmation and tracking info after submission.
            </Typography>
            {/* Summary Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
              <Typography variant="subtitle1" fontWeight="bold">Release Overview</Typography>
              <Box sx={{ mt: 2 }}>
                <strong>Release Title:</strong> {releaseTitle || 'N/A'}<br />
                <strong>Type:</strong> {releaseType}<br />
                <strong>Primary Artist:</strong> {trackInfos[0]?.artist || 'N/A'}<br />
                <strong>Label:</strong> {label || 'N/A'}<br />
                <strong>Release Date:</strong> {releaseDate || 'N/A'}<br />
                <strong>DSPs:</strong> {selectedDSPs.map(key => DSP_LIST.find(d => d.key === key)?.name).join(', ') || 'None'}<br />
                <strong>Tracks:</strong> {tracks.length}<br />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">Tracklist</Typography>
              <ol style={{ paddingLeft: 18 }}>
                {trackInfos.map((track, idx) => (
                  <li key={idx}>
                    <strong>{track.title || `Track ${idx + 1}`}</strong> — {track.artist} ({track.genre})
                  </li>
                ))}
              </ol>
            </Paper>
            {/* Submission/Confirmation UI */}
            {submitState === 'success' ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6">Release Submitted Successfully!</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Your release is now being processed by our system and will be delivered to the selected DSPs.<br />
                  <b>What happens next?</b> Your tracks and metadata will be validated, artwork checked, and the release will be queued for delivery. You will receive a confirmation email and can track your release status in the dashboard.
                </Typography>
              </Alert>
            ) : submitState === 'loading' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Submitting your release to DSPs...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitRelease}
                  disabled={!isTrackInfoListValid || !isDistributionValid}
                >
                  Submit Release
                </Button>
              </Box>
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
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {renderStepContent()}
      </Paper>
    </Box>
  );
}