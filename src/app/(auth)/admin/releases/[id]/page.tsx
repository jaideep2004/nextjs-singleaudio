"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
  PlaylistAddCheck,
  Delete,
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
import {
  getAcrCloudProviderMetadata,
  fetchAcrCloudScanResult,
  getAcrCloudColor,
  getAcrCloudLabel,
  getAcrCloudRightsClaims,
  getAcrCloudState,
  getAcrCloudSummary,
  stringifyAcrCloudRawResult,
} from '@/lib/acrCloud';

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

const formatAcrProbability = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'n/a';
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
};

const formatAcrTime = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const mins = Math.floor(value / 60);
  const secs = Math.round(value % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatAcrTimeRange = (start?: number, end?: number) => {
  const startText = formatAcrTime(start);
  const endText = formatAcrTime(end);
  return startText && endText ? `${startText}-${endText}` : null;
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
  const acrRefreshRef = useRef<Record<string, boolean>>({});

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [trackDeleteTarget, setTrackDeleteTarget] = useState<{ index: number; title: string } | null>(null);
  const [trackDeleteReason, setTrackDeleteReason] = useState("");
  const [deletingTrack, setDeletingTrack] = useState(false);
  const [showAllTerritories, setShowAllTerritories] = useState(false);

  const mergeTrackAcrCloudStatus = (tracks: any[], fileId: string, acrCloud: any) =>
    tracks.map((track: any) =>
      track?.acrCloud?.fileId === fileId
        ? { ...track, acrCloud: { ...(track.acrCloud || {}), ...acrCloud } }
        : track
    );

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

  useEffect(() => {
    if (!Array.isArray(release?.tracks)) return;

    const pendingTracks = release.tracks.filter(
      (track: any) =>
        track?.acrCloud?.fileId &&
        getAcrCloudState(track.acrCloud) === 'pending' &&
        !acrRefreshRef.current[track.acrCloud.fileId]
    );
    if (!pendingTracks.length) return;

    let cancelled = false;

    const refreshPending = async () => {
      for (const track of pendingTracks) {
        if (cancelled) return;
        acrRefreshRef.current[track.acrCloud.fileId] = true;

        try {
          const nextStatus = await fetchAcrCloudScanResult(track.acrCloud.fileId);
          if (cancelled) return;

          setRelease((prev: any) =>
            prev
              ? {
                  ...prev,
                  tracks: Array.isArray(prev.tracks)
                    ? mergeTrackAcrCloudStatus(prev.tracks, track.acrCloud.fileId, nextStatus)
                    : prev.tracks,
                }
              : prev
          );
        } catch {
          // Leave pending if refresh fails.
        } finally {
          delete acrRefreshRef.current[track.acrCloud.fileId];
        }
      }
    };

    void refreshPending();

    return () => {
      cancelled = true;
    };
  }, [release]);

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

  const handleDeleteReleaseTrack = async () => {
    if (!trackDeleteTarget) return;
    try {
      setDeletingTrack(true);
      const resp = await releaseAPI.deleteReleaseTrack(releaseId, trackDeleteTarget.index, trackDeleteReason || undefined);
      if (resp?.success) {
        setRelease(resp.release || ((prev: any) => {
          if (!prev || !Array.isArray(prev.tracks)) return prev;
          return {
            ...prev,
            tracks: prev.tracks.filter((_: any, idx: number) => idx !== trackDeleteTarget.index),
            updatedAt: new Date().toISOString(),
          };
        }));
        setTrackDeleteTarget(null);
        setTrackDeleteReason("");
      } else {
        setError(resp?.message || resp?.error || "Failed to delete track from release");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete track from release");
    } finally {
      setDeletingTrack(false);
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

  const flagFromCountryCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return '🌐';
    return normalized
      .split('')
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  };

  const renderTerritories = (territories: string[]) => {
    const list = Array.isArray(territories) && territories.length > 0 ? territories : ['Worldwide'];
    const visible = showAllTerritories ? list : list.slice(0, 30);
    const hiddenCount = Math.max(list.length - visible.length, 0);

    return (
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {visible.map((territory) => (
            <Chip
              key={territory}
              size="small"
              label={`${flagFromCountryCode(territory)} ${territory}`}
              variant="outlined"
              sx={{
                borderRadius: '10px',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.74)',
                '& .MuiChip-label': { fontWeight: 750 },
              }}
            />
          ))}
        </Box>
        {list.length > 30 ? (
          <Button
            size="small"
            variant="text"
            onClick={() => setShowAllTerritories((value) => !value)}
            sx={{ justifySelf: 'flex-start', px: 0.5 }}
          >
            {showAllTerritories ? 'Show Less' : `Show ${hiddenCount} More`}
          </Button>
        ) : null}
      </Box>
    );
  };

  const renderAcrCloudReview = (acrCloud: any) => {
    if (!acrCloud) return null;

    const state = getAcrCloudState(acrCloud);
    const aiDetections = Array.isArray(acrCloud.aiDetection) ? acrCloud.aiDetection : [];
    const fingerprintMatches = Array.isArray(acrCloud.fingerprintMatches) ? acrCloud.fingerprintMatches : [];
    const rawResult = stringifyAcrCloudRawResult(acrCloud);

    return (
      <Paper
        variant="outlined"
        sx={{
          mt: 1.5,
          p: { xs: 1.5, md: 2 },
          borderRadius: '18px',
          width: '100%',
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.035)' : 'rgba(255, 255, 255, 0.72)',
          boxShadow: mode === 'dark' ? 'none' : '0 18px 44px rgba(15,23,42,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              ACRCloud admin review
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Full scan payload. Visible to admins only.
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

        {acrCloud.lastError ? (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 1.5, borderColor: 'error.main' }}>
            <Typography variant="caption" color="error.main" fontWeight={700}>ACRCloud error</Typography>
            <Typography variant="body2">{acrCloud.lastError}</Typography>
          </Paper>
        ) : null}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' }, gap: 1.5 }}>
          <Box sx={{ minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: '14px', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={700}>AI detection</Typography>
            </Box>
            <Box sx={{ p: 1.5, display: 'grid', gap: 1 }}>
              {aiDetections.length ? aiDetections.map((item: any, idx: number) => {
                const source = item.likelySource || item.likely_source || item.prediction || 'Unknown';
                const probability = item.aiProbability ?? item.ai_probability;
                const sourceProbabilities = item.sourceProbabilities || item.source_probabilities || [];
                return (
                  <Box key={`${source}-${idx}`} sx={{ display: 'grid', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={600}>{source}</Typography>
                      <Chip size="small" label={`AI ${formatAcrProbability(probability)}`} color="warning" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {[item.prediction, formatAcrTimeRange(item.start, item.end), item.stem].filter(Boolean).join(' | ')}
                    </Typography>
                    {sourceProbabilities.length ? (
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {sourceProbabilities.slice(0, 4).map((probabilityItem: any, probabilityIdx: number) => (
                          <Chip
                            key={`${probabilityItem.source || 'source'}-${probabilityIdx}`}
                            size="small"
                            label={`${probabilityItem.source || 'Source'} ${formatAcrProbability(probabilityItem.probability)}`}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                );
              }) : (
                <Typography variant="body2" color="text.secondary">No AI detection segments returned.</Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: '14px', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={700}>Fingerprint, DSP and rights</Typography>
            </Box>
            <Box sx={{ p: 1.5, display: 'grid', gap: 1.25 }}>
              {fingerprintMatches.length ? fingerprintMatches.map((match: any, idx: number) => {
                const providerMetadata = getAcrCloudProviderMetadata(match.raw);
                const rightsClaims = getAcrCloudRightsClaims(match.raw);
                return (
                  <Box key={`${match.acrid || match.title || 'match'}-${idx}`} sx={{ display: 'grid', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{match.title || 'Untitled match'}</Typography>
                      {typeof match.score === 'number' ? <Chip size="small" label={`Score ${match.score}`} color="info" variant="outlined" /> : null}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                      {[match.artist, match.album, match.isrc ? `ISRC ${match.isrc}` : null, match.upc ? `UPC ${match.upc}` : null].filter(Boolean).join(' | ')}
                    </Typography>

                    {providerMetadata.length ? (
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          DSP / provider metadata
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', minWidth: 0 }}>
                          {providerMetadata.map((provider) => (
                            <Tooltip
                              key={`${provider.provider}-${provider.trackId || provider.albumId || idx}`}
                              title={[
                                provider.isYoutube ? 'YouTube video ID. This is not a guaranteed Content ID enrollment flag.' : null,
                                provider.trackId ? `Track ${provider.trackId}` : null,
                                provider.albumId ? `Album ${provider.albumId}` : null,
                                provider.artistIds.length ? `Artists ${provider.artistIds.join(', ')}` : null,
                              ].filter(Boolean).join(' | ') || 'Provider metadata returned by ACRCloud'}
                            >
                              <Chip
                                size="small"
                                color={provider.isYoutube ? 'error' : 'default'}
                                label={`${provider.label}${provider.trackId ? `: ${provider.trackId}` : ''}`}
                                variant="outlined"
                                sx={{ maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>
                    ) : null}

                    {rightsClaims.length ? (
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Rights / distributor claims
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {rightsClaims.slice(0, 6).map((claim: any, claimIdx: number) => {
                            const distributorName = claim?.distributor?.name || 'Distributor';
                            const territories = Array.isArray(claim?.territories) ? claim.territories.length : 0;
                            return (
                              <Tooltip
                                key={`${distributorName}-${claimIdx}`}
                                title={[
                                  claim?.rights_claim_policy ? `Policy ${claim.rights_claim_policy}` : null,
                                  territories ? `${territories} territories` : null,
                                ].filter(Boolean).join(' | ') || 'Rights claim returned by ACRCloud'}
                              >
                                <Chip size="small" label={distributorName} color="secondary" variant="outlined" />
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                );
              }) : (
                <Typography variant="body2" color="text.secondary">No fingerprint match returned.</Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* {rawResult ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Full raw ACRCloud response
            </Typography>
            <Box
              component="pre"
              sx={{
                mt: 0.75,
                p: 1.5,
                maxHeight: 320,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                bgcolor: mode === 'dark' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.04)',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {rawResult}
            </Box>
          </Box>
        ) : null} */}
      </Paper>
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
            borderRadius: '22px',
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255, 255, 255, 0.86)',
          }}
        >
          <Stack spacing={1.5} sx={{ p: { xs: 1.25, md: 2 } }}>
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
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                    gap: 2,
                    p: { xs: 1.5, md: 2 },
                    borderRadius: '18px',
                    border: '1px solid',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                    bgcolor: mode === 'dark' ? 'rgba(11, 16, 32, 0.42)' : 'rgba(248, 250, 252, 0.92)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                      }}
                    >
                      <MusicNote />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={750} sx={{ overflowWrap: 'anywhere' }}>
                        {title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isrc}
                      </Typography>
                      {track.acrCloud && getAcrCloudSummary(track.acrCloud) && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          {getAcrCloudSummary(track.acrCloud)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                    </Typography>
                    {track.acrCloud && (
                      <Chip
                        size="small"
                        icon={getAcrCloudState(track.acrCloud) === 'pending' ? <CircularProgress size={12} /> : <PlaylistAddCheck fontSize="small" />}
                        label={getAcrCloudLabel(track.acrCloud)}
                        color={getAcrCloudColor(track.acrCloud) as any}
                        variant="outlined"
                      />
                    )}
                    {audioUrl && (
                      <IconButton
                        size="small"
                        aria-label={currentlyPlaying === trackId ? 'Pause track' : 'Play track'}
                        onClick={() => handlePlayTrack(audioUrl, trackId)}
                        sx={{
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        {currentlyPlaying === trackId ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    )}
                    <Tooltip title="Delete track from this release">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Delete track from release"
                          onClick={() => setTrackDeleteTarget({ index, title })}
                          disabled={deletingTrack || release?.status === 'approved'}
                          sx={{
                            bgcolor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.06)',
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                  {track.acrCloud ? (
                    <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
                      {renderAcrCloudReview(track.acrCloud)}
                    </Box>
                  ) : null}
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
      <Container maxWidth={false} sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 4 }}>
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
      <Container maxWidth={false} sx={{ py: 4 }}>
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
    <Container maxWidth={false} sx={{ py: 4 }}>
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
              {renderTerritories(release.territories || [])}
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

      {/* Delete Track Dialog */}
      <Dialog open={!!trackDeleteTarget} onClose={() => !deletingTrack && setTrackDeleteTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Track From Release</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This removes "{trackDeleteTarget?.title || 'this track'}" from the submitted release for admin review. It does not approve or reject the release.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Admin reason"
            fullWidth
            multiline
            rows={3}
            value={trackDeleteReason}
            onChange={(e) => setTrackDeleteReason(e.target.value)}
            helperText="Stored with release audit data."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackDeleteTarget(null)} disabled={deletingTrack}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteReleaseTrack}
            color="error"
            variant="contained"
            disabled={deletingTrack}
          >
            {deletingTrack ? <CircularProgress size={20} /> : 'Delete Track'}
          </Button>
        </DialogActions>
      </Dialog>

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
