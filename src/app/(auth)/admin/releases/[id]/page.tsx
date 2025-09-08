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
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { releaseAPI } from "@/services/api";
import { Album } from "@mui/icons-material";
import countries from "@/utils/countries";

export default function AdminReleaseDetailPage() {
  const params = useParams<{ id: string }>();
  const releaseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [release, setRelease] = useState<any | null>(null);

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

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
        {value ?? "—"}
      </Typography>
    </Stack>
  );

  // DSP metadata to render pretty chips with logos
  const DSP_LIST = [
    { key: "spotify", name: "Spotify", logo: "/dsp/spotify.png" },
    { key: "apple", name: "Apple Music", logo: "/dsp/applemusic.png" },
    { key: "amazon", name: "Amazon Music", logo: "/dsp/amazonmusic.png" },
    { key: "youtube", name: "YouTube Music", logo: "/dsp/youtubemusic.png" },
    { key: "deezer", name: "Deezer", logo: "/dsp/deezer.png" },
    { key: "tidal", name: "Tidal", logo: "/dsp/tidal.png" },
    { key: "pandora", name: "Pandora", logo: "/dsp/pandora.png" },
    { key: "soundcloud", name: "SoundCloud", logo: "/dsp/soundcloud.png" },
  ];

  const renderStores = (stores: any) => {
    const list = Array.isArray(stores)
      ? stores
      : typeof stores === "string"
        ? stores.split(/\s*,\s*/).filter(Boolean)
        : [];
    if (!list.length) return <Typography variant="body2" color="text.secondary">—</Typography>;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {list.map((k: string) => {
          const key = k.trim().toLowerCase();
          const meta = DSP_LIST.find(d => d.key === key) || DSP_LIST.find(d => d.name.toLowerCase() === key);
          const label = meta?.name || k;
          const logo = meta?.logo;
          return <Chip key={k} label={label} avatar={logo ? <Avatar src={logo} alt={label} /> : undefined} variant="outlined" />;
        })}
      </Box>
    );
  };

  const renderTerritories = (codes: any) => {
    const list = Array.isArray(codes)
      ? codes
      : typeof codes === "string"
        ? codes.split(/\s*,\s*/).filter(Boolean)
        : [];
    if (!list.length) return <Typography variant="body2" color="text.secondary">—</Typography>;
    const labels = list.map((code: string) => countries.find(c => c.code === code)?.label || code).sort();
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          maxHeight: 160,
          overflowY: 'auto',
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.default',
        }}
      >
        {labels.map((l) => (<Chip key={l} size="small" variant="outlined" label={l} />))}
      </Box>
    );
  };

  // Build media base from NEXT_PUBLIC_API_URL (strip trailing /api) or default localhost:5000
  const MEDIA_BASE = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_API_URL || '';
    if (env && env.startsWith('http')) {
      return env.replace(/\/?api\/?$/, '');
    }
    return 'http://localhost:5000';
  }, []);

  const getArtworkUrl = (r: any): string | null => {
    const direct = r?.artworkUrl || r?.artworkURL || r?.artwork || r?.artworkPath || null;
    if (direct) return String(direct);
    const file = r?.artworkFile;
    if (file) return `${MEDIA_BASE}/uploads/artwork/${file}`;
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={700}>
          Release Review
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/admin/releases" variant="outlined" size="small">
            Back
          </Button>
          {release && (
            <Chip label={release.status} color={statusColor} size="small" sx={{ textTransform: "capitalize" }} />
          )}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !release ? (
        <Typography color="text.secondary">Release not found.</Typography>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: 2 }}>
            <Box>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 1 }}>
                  <Box sx={{ width: 160, height: 160, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'grey.200', flexShrink: 0 }}>
                    {getArtworkUrl(release) ? (
                      <img src={getArtworkUrl(release) as string} alt="Artwork" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        <Album />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <InfoRow label="Title" value={release.releaseTitle || "Untitled"} />
                    <InfoRow label="Primary Artist" value={release.primaryArtist} />
                    <InfoRow label="Featuring Artists" value={Array.isArray(release.featuredArtists) ? release.featuredArtists.join(", ") : release.featuredArtists} />
                    <InfoRow label="Label" value={release.label} />
                    <InfoRow label="UPC" value={release.upc} />
                    <InfoRow label="Primary Genre" value={release.primaryGenre} />
                    <InfoRow label="Secondary Genre" value={release.secondaryGenre} />
                    <InfoRow label="Language" value={release.language} />
                    <InfoRow label="P Line" value={release.pLine} />
                    <InfoRow label="C Line" value={release.cLine} />
                    <InfoRow label="Release Date" value={release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : undefined} />
                  </Box>
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Stores (DSPs)</Typography>
                {renderStores(release.stores)}
                {(() => {
                  const tList = Array.isArray(release.territories)
                    ? release.territories
                    : typeof release.territories === 'string'
                      ? release.territories.split(/\s*,\s*/).filter(Boolean)
                      : [];
                  return (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Territories <Typography component="span" variant="caption" color="text.secondary">({tList.length})</Typography>
                      </Typography>
                      {renderTerritories(release.territories)}
                    </>
                  );
                })()}
                <Divider sx={{ my: 2 }} />
                <InfoRow label="Created" value={release.createdAt ? new Date(release.createdAt).toLocaleString() : undefined} />
                <InfoRow label="Updated" value={release.updatedAt ? new Date(release.updatedAt).toLocaleString() : undefined} />
              </Paper>

              {Array.isArray(release.tracks) && release.tracks.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Tracks
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    {release.tracks.map((t: any, idx: number) => (
                      <Box key={t._id || idx}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Chip size="small" label={`#${idx + 1}`} sx={{ minWidth: 48 }} />
                          <Typography variant="body2" fontWeight={700}>{t.title || `Track ${idx + 1}`}</Typography>
                          <Typography variant="body2" color="text.secondary">{t.version ? `(${t.version})` : ''}</Typography>
                          <Typography variant="body2" color="text.secondary">— {t.artist || release.primaryArtist}</Typography>
                          {t.featuring && <Typography variant="body2" color="text.secondary">feat. {t.featuring}</Typography>}
                          {t.remixer && <Typography variant="body2" color="text.secondary">[Remix: {t.remixer}]</Typography>}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {t.duration ? `Duration: ${t.duration} · ` : ''}
                          {t.genre ? `Genre: ${t.genre}${t.subgenre ? `/${t.subgenre}` : ''} · ` : ''}
                          {t.language ? `Language: ${t.language} · ` : ''}
                          {t.isrc ? `ISRC: ${t.isrc} · ` : ''}
                          {t.parentalAdvisory && t.parentalAdvisory !== 'none' ? `Advisory: ${t.parentalAdvisory} · ` : ''}
                          {t.instrumental ? `Instrumental · ` : ''}
                          {t.recordingYear ? `Recording Year: ${t.recordingYear}` : ''}
                        </Typography>
                        {(t.composers || t.publishers || t.producers) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {t.composers ? `Composers: ${t.composers} · ` : ''}
                            {t.publishers ? `Publishers: ${t.publishers} · ` : ''}
                            {t.producers ? `Producers: ${t.producers}` : ''}
                          </Typography>
                        )}
                        {(t.copyrightC || t.copyrightP || t.upc) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {t.copyrightC ? `© ${t.copyrightC} · ` : ''}
                            {t.copyrightP ? `℗ ${t.copyrightP} · ` : ''}
                            {t.upc ? `UPC: ${t.upc}` : ''}
                          </Typography>
                        )}
                        {(t.audioUrl || t.previewUrl || t.audio) && (
                          <Box sx={{ mt: 1 }}>
                            <audio controls src={(t.audioUrl || t.previewUrl || t.audio) as string} style={{ width: '100%' }} />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Box>

            <Box>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: "sticky", top: 24 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    disabled={saving || release.status === "approved"}
                    onClick={handleApprove}
                  >
                    {saving ? "Saving..." : "Approve"}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    disabled={saving || release.status === "rejected"}
                    onClick={() => setRejectOpen(true)}
                  >
                    Reject
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Box>

          <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Reject Release</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please provide a reason to help the artist understand what to fix.
              </Typography>
              <TextField
                autoFocus
                label="Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleReject} disabled={saving}>
                {saving ? "Saving..." : "Reject"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
}
