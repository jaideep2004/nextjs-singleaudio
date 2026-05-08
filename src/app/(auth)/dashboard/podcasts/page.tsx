'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider, 
  FormControlLabel,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
  LinearProgress,
  Avatar,
  Paper,
  useTheme,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import PodcastIcon from '@mui/icons-material/Podcasts';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '@/context/AppContext';
import {
  CreateRssEpisodePayload,
  CreateRssPodcastPayload,
  RssCategory,
  RssEpisode,
  RssPodcast,
  RssPresignedUpload,
} from '@/types/rss';

const LANGUAGE_OPTIONS = [
  { value: 'en-us', label: 'English (US)' },
  { value: 'en', label: 'English' },
  { value: 'en-gb', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'hi', label: 'Hindi' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

type PublishMode = 'draft' | 'publish-now' | 'schedule';
type PodcastAccessMode = 'shared' | 'owned';
type ActiveView = 'podcast' | 'episodes' | 'analytics';

interface PodcastFormState {
  title: string;
  slug: string;
  description: string;
  language: string;
  author_name: string;
  author_email: string;
  copyright: string;
  itunes_type: 'episodic' | 'serial';
  itunes_explicit: 'yes' | 'no';
  podcast_locked: boolean;
  podcast_funding: string;
  podcast_funding_label: string;
  custom_link: string;
}

interface EpisodeFormState {
  title: string;
  description: string;
  itunes_episode_type: 'full' | 'trailer' | 'bonus';
  itunes_explicit: boolean;
  itunes_episode: string;
  itunes_season: string;
  custom_link: string;
  schedule_datetime: string;
}

const defaultPodcastForm: PodcastFormState = {
  title: '',
  slug: '',
  description: '',
  language: 'en-us',
  author_name: '',
  author_email: '',
  copyright: '',
  itunes_type: 'episodic',
  itunes_explicit: 'no',
  podcast_locked: false,
  podcast_funding: '',
  podcast_funding_label: '',
  custom_link: '',
};

const defaultEpisodeForm: EpisodeFormState = {
  title: '',
  description: '',
  itunes_episode_type: 'full',
  itunes_explicit: false,
  itunes_episode: '',
  itunes_season: '',
  custom_link: '',
  schedule_datetime: '',
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function readJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

const toOptionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toOptionalNullableUrl = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// ─── Step form config ────────────────────────────────────────────────────────
const CREATE_STEPS = ['Basics & Cover', 'Details'];
const EPISODE_STEPS = ['Content', 'Media & Publishing'];

// ─── Podcast step 1 validation ───────────────────────────────────────────────
function step1Valid(form: PodcastFormState, cats: RssCategory[]) {
  return form.title.trim().length > 0 && form.description.trim().length > 0 && cats.length > 0;
}

// ─── Podcast step 2 validation ───────────────────────────────────────────────
function step2Valid(form: PodcastFormState) {
  return form.language.length > 0;
}

// ─── Episode step 1 validation ───────────────────────────────────────────────
function episodeStep1Valid(form: EpisodeFormState) {
  return form.title.trim().length > 0 && form.description.trim().length > 0;
}

function PodcastsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Derive active view from URL query param
  const viewParam = searchParams.get('view') as ActiveView | null;
  const activeView: ActiveView = viewParam === 'episodes' ? 'episodes' : viewParam === 'analytics' ? 'analytics' : 'podcast';

  const [categories, setCategories] = useState<RssCategory[]>([]);
  const [podcasts, setPodcasts] = useState<RssPodcast[]>([]);
  const [episodes, setEpisodes] = useState<RssEpisode[]>([]);
  const [selectedPodcastId, setSelectedPodcastId] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<RssCategory[]>([]);
  const [podcastForm, setPodcastForm] = useState<PodcastFormState>(defaultPodcastForm);
  const [episodeForm, setEpisodeForm] = useState<EpisodeFormState>(defaultEpisodeForm);
  const [podcastCover, setPodcastCover] = useState<File | null>(null);
  const [episodeAudio, setEpisodeAudio] = useState<File | null>(null);
  const [episodeCover, setEpisodeCover] = useState<File | null>(null);
  const [publishMode, setPublishMode] = useState<PublishMode>('draft');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmittingPodcast, setIsSubmittingPodcast] = useState(false);
  const [isSubmittingEpisode, setIsSubmittingEpisode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [accessMode, setAccessMode] = useState<PodcastAccessMode>('shared');
  const [workspaceSupervisor, setWorkspaceSupervisor] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<unknown>(null);
  const [podcastCoverPreview, setPodcastCoverPreview] = useState<string | null>(null);

  // Step form state
  const [createStep, setCreateStep] = useState(0);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [episodeStep, setEpisodeStep] = useState(0);
  const [episodeCoverPreview, setEpisodeCoverPreview] = useState<string | null>(null);

  const selectedPodcast = useMemo(
    () => podcasts.find((p) => p.id === selectedPodcastId) ?? null,
    [podcasts, selectedPodcastId]
  );

  const publishedEpisodes = useMemo(
    () => episodes.filter((e) => e.status === 'published').length,
    [episodes]
  );

  const hasPodcast = accessMode === 'owned' && podcasts.length > 0 && !workspaceSupervisor;

  // Auto-fill author from user
  useEffect(() => {
    setPodcastForm((cur) => ({
      ...cur,
      author_name: cur.author_name || user?.artistName || user?.name || '',
      author_email: cur.author_email || user?.email || '',
      copyright: cur.copyright || user?.artistName || user?.name || '',
    }));
  }, [user]);

  // Bootstrap
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsBootstrapping(true);
        const [catRes, podRes] = await Promise.all([
          fetch('/api/rss/categories', { cache: 'no-store' }),
          fetch('/api/rss/podcasts', { cache: 'no-store' }),
        ]);
        const catJson = await readJson<{ success: boolean; data?: RssCategory[]; message?: string }>(catRes);
        const podJson = await readJson<{
          success: boolean;
          data?: RssPodcast[];
          message?: string;
          meta?: { accessMode?: PodcastAccessMode; workspaceSupervisor?: boolean };
        }>(podRes);
        if (!catJson.success) throw new Error(catJson.message || 'Failed to load categories');
        if (!podJson.success) throw new Error(podJson.message || 'Failed to load podcasts');
        setCategories(catJson.data || []);
        setPodcasts(podJson.data || []);
        setAccessMode(podJson.meta?.accessMode === 'owned' ? 'owned' : 'shared');
        setWorkspaceSupervisor(podJson.meta?.workspaceSupervisor === true);
        if ((podJson.data || []).length > 0) {
          setSelectedPodcastId((cur) => cur ?? podJson.data![0].id);
        }
      } catch (error) {
        setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load podcast workspace' });
      } finally {
        setIsBootstrapping(false);
      }
    };
    void bootstrap();
  }, []);

  // Cover preview
  useEffect(() => {
    if (!podcastCover) { setPodcastCoverPreview(null); return; }
    const url = URL.createObjectURL(podcastCover);
    setPodcastCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [podcastCover]);

  // Episode cover preview
  useEffect(() => {
    if (!episodeCover) { setEpisodeCoverPreview(null); return; }
    const url = URL.createObjectURL(episodeCover);
    setEpisodeCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [episodeCover]);

  // Load episodes when podcast selected
  useEffect(() => {
    if (!selectedPodcastId) { setEpisodes([]); return; }
    const load = async () => {
      try {
        const res = await fetch(`/api/rss/podcasts/${selectedPodcastId}/episodes`, { cache: 'no-store' });
        const json = await readJson<{ success: boolean; data?: RssEpisode[]; message?: string }>(res);
        if (!json.success) throw new Error(json.message || 'Failed to load episodes');
        setEpisodes(json.data || []);
      } catch (error) {
        setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load episodes' });
      }
    };
    void load();
  }, [selectedPodcastId]);

  // Load analytics
  useEffect(() => {
    if (activeView !== 'analytics' || !selectedPodcastId) {
      setAnalyticsData(null); setAnalyticsError(null); setAnalyticsLoading(false); return;
    }
    const load = async () => {
      try {
        setAnalyticsLoading(true); setAnalyticsError(null);
        const res = await fetch(`/api/rss/podcasts/${selectedPodcastId}/analytics`, { cache: 'no-store' });
        const json = await readJson<{ success: boolean; data?: unknown; message?: string }>(res);
        if (!json.success) throw new Error(json.message || 'Failed to load analytics');
        setAnalyticsData(json.data ?? null);
      } catch (error) {
        setAnalyticsError(error instanceof Error ? error.message : 'Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    void load();
  }, [activeView, selectedPodcastId]);

  const analyticsSeries = useMemo(() => {
    const data = analyticsData;
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    for (const key of ['downloads_by_day', 'daily_downloads', 'downloads', 'series', 'timeline']) {
      const value = obj[key];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        const rows = value as Array<Record<string, unknown>>;
        const normalized = rows.map((row) => {
          const date = (row.date as string) || (row.day as string) || (row.timestamp as string) || (row.label as string);
          const v = (row.downloads as number) || (row.count as number) || (row.value as number) || (row.total as number);
          if (!date || typeof date !== 'string') return null;
          const num = typeof v === 'number' ? v : Number(v);
          if (!Number.isFinite(num)) return null;
          return { date, downloads: num };
        }).filter(Boolean) as { date: string; downloads: number }[];
        if (normalized.length) return normalized;
      }
    }
    return null;
  }, [analyticsData]);

  const uploadAsset = async (podcastId: number, file: File, assetType: 'audio' | 'image'): Promise<RssPresignedUpload> => {
    const formData = new FormData();
    formData.append('assetType', assetType);
    formData.append('file', file);
    const res = await fetch(`/api/rss/podcasts/${podcastId}/assets/upload`, { method: 'POST', body: formData });
    const json = await readJson<{ success: boolean; data?: RssPresignedUpload; message?: string }>(res);
    if (!json.success || !json.data) throw new Error(json.message || `Failed to upload ${assetType}`);
    return json.data;
  };

  const handlePodcastSubmit = async () => {
    if (selectedCategories.length === 0) {
      setFeedback({ type: 'error', message: 'Pick at least one podcast category.' });
      return;
    }
    try {
      setIsSubmittingPodcast(true);
      setFeedback(null);
      const payload: CreateRssPodcastPayload = {
        title: podcastForm.title.trim(),
        description: podcastForm.description.trim(),
        slug: podcastForm.slug || slugify(podcastForm.title),
        language: podcastForm.language,
        itunes_type: podcastForm.itunes_type,
        itunes_explicit: podcastForm.itunes_explicit,
        podcast_locked: podcastForm.podcast_locked,
        author_name: toOptionalString(podcastForm.author_name),
        author_email: toOptionalString(podcastForm.author_email),
        copyright: toOptionalString(podcastForm.copyright),
        podcast_funding: toOptionalNullableUrl(podcastForm.podcast_funding),
        podcast_funding_label: toOptionalString(podcastForm.podcast_funding_label) ?? null,
        custom_link: toOptionalNullableUrl(podcastForm.custom_link),
        itunes_categories_ids: selectedCategories.map((c) => c.id),
      };
      const createRes = await fetch('/api/rss/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const createJson = await readJson<{
        success: boolean; data?: RssPodcast; message?: string; details?: unknown;
        meta?: { accessMode?: PodcastAccessMode };
      }>(createRes);
      if (!createJson.success || !createJson.data) {
        let errorMessage = createJson.message || 'Failed to create podcast';
        if (createJson.details && typeof createJson.details === 'object') {
          const details = createJson.details as Record<string, unknown>;
          const fieldErrors = details.field_errors as Record<string, string[]> | undefined;
          const formErrors = details.form_errors as string[] | undefined;
          const parts: string[] = [];
          if (formErrors?.length) parts.push(...formErrors);
          if (fieldErrors) {
            for (const [field, msgs] of Object.entries(fieldErrors)) {
              if (Array.isArray(msgs)) parts.push(`${field}: ${msgs.join(', ')}`);
            }
          }
          if (parts.length > 0) errorMessage = parts.join(' | ');
        }
        throw new Error(errorMessage);
      }
      let finalPodcast = createJson.data;
      if (podcastCover) {
        const coverUpload = await uploadAsset(createJson.data.id, podcastCover, 'image');
        const patchRes = await fetch(`/api/rss/podcasts/${createJson.data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cover_upload_id: coverUpload.id }),
        });
        const patchJson = await readJson<{ success: boolean; data?: RssPodcast; message?: string }>(patchRes);
        if (!patchJson.success || !patchJson.data) throw new Error(patchJson.message || 'Cover upload failed.');
        finalPodcast = patchJson.data;
      }
      setPodcasts((cur) => [finalPodcast, ...cur.filter((p) => p.id !== finalPodcast.id)]);
      setSelectedPodcastId(finalPodcast.id);
      setPodcastForm({ ...defaultPodcastForm, author_name: user?.artistName || user?.name || '', author_email: user?.email || '', copyright: user?.artistName || user?.name || '' });
      setSelectedCategories([]);
      setPodcastCover(null);
      setPodcastCoverPreview(null);
      setCreateStep(0);
      setSlugManuallyEdited(false);
      setFeedback({ type: 'success', message: `Podcast "${finalPodcast.title}" created successfully.` });
      router.push('/dashboard/podcasts?view=episodes');
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to create podcast' });
    } finally {
      setIsSubmittingPodcast(false);
    }
  };

  const handleEpisodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPodcastId) { setFeedback({ type: 'error', message: 'Select or create a podcast first.' }); return; }
    if (!episodeAudio) { setFeedback({ type: 'error', message: 'Select an audio file for the episode.' }); return; }
    try {
      setIsSubmittingEpisode(true);
      setFeedback(null);
      const audioUpload = await uploadAsset(selectedPodcastId, episodeAudio, 'audio');
      let coverUploadId: string | undefined;
      if (episodeCover) {
        const coverUpload = await uploadAsset(selectedPodcastId, episodeCover, 'image');
        coverUploadId = coverUpload.id;
      }
      const payload: CreateRssEpisodePayload = {
        title: episodeForm.title,
        description: episodeForm.description,
        itunes_explicit: episodeForm.itunes_explicit,
        itunes_episode_type: episodeForm.itunes_episode_type,
        itunes_episode: episodeForm.itunes_episode ? Number(episodeForm.itunes_episode) : null,
        itunes_season: episodeForm.itunes_season ? Number(episodeForm.itunes_season) : null,
        custom_link: episodeForm.custom_link || null,
        schedule_datetime:
          publishMode === 'publish-now' ? new Date().toISOString()
          : publishMode === 'schedule' && episodeForm.schedule_datetime ? new Date(episodeForm.schedule_datetime).toISOString()
          : null,
        audio_upload_id: audioUpload.id,
        cover_upload_id: coverUploadId || null,
      };
      const res = await fetch(`/api/rss/podcasts/${selectedPodcastId}/episodes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await readJson<{ success: boolean; data?: RssEpisode; message?: string }>(res);
      if (!json.success || !json.data) throw new Error(json.message || 'Failed to create episode');
      setEpisodes((cur) => [json.data!, ...cur]);
      setEpisodeForm(defaultEpisodeForm);
      setEpisodeAudio(null);
      setEpisodeCover(null);
      setPublishMode('draft');
      setEpisodeStep(0);
      setFeedback({ type: 'success', message: `Episode "${json.data.title}" published successfully.` });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to create episode' });
    } finally {
      setIsSubmittingEpisode(false);
    }
  };

  if (isBootstrapping) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ─── Podcast step form renderer ───────────────────────────────────────────
  const renderCreateStep = () => {
    if (createStep === 0) {
      // Step 1: Basics + Cover Art side by side
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 3 }}>
          {/* Left: text fields */}
          <Stack spacing={2.5}>
              <TextField
                label="Podcast Title"
                required
                fullWidth
                value={podcastForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setPodcastForm((cur) => ({
                    ...cur,
                    title,
                    slug: slugManuallyEdited ? cur.slug : slugify(title),
                  }));
                }}
                inputProps={{ maxLength: 100 }}
                helperText={`${podcastForm.title.length}/100`}
              />
              <TextField
                label="Podcast URL Slug"
                fullWidth
                value={podcastForm.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setPodcastForm((cur) => ({ ...cur, slug: slugify(e.target.value) }));
                }}
                helperText={podcastForm.slug ? `rss.com/podcasts/${podcastForm.slug}` : 'Auto-generated from title'}
                InputProps={{
                  startAdornment: (
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5, whiteSpace: 'nowrap' }}>
                      rss.com/podcasts/
                    </Typography>
                  ),
                }}
              />
              <TextField
                label="Description"
                required
                fullWidth
                multiline
                minRows={4}
                value={podcastForm.description}
                onChange={(e) => setPodcastForm((cur) => ({ ...cur, description: e.target.value }))}
                inputProps={{ maxLength: 4000 }}
                helperText={`${podcastForm.description.length}/4000`}
              />
              <Autocomplete
                multiple
                options={categories}
                getOptionLabel={(o) => o.localized_label || o.label}
                value={selectedCategories}
                onChange={(_e, val) => setSelectedCategories(val.slice(0, 2))}
                renderInput={(params) => (
                  <TextField {...params} label="Categories" required helperText="Up to 2 categories." />
                )}
              />
          </Stack>

          {/* Right: cover art upload */}
          <Box>
            <Stack spacing={1.5} alignItems="center">
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ alignSelf: 'flex-start' }}>
                Cover Art
              </Typography>
              <Box
                component="label"
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxWidth: 200,
                  border: '2px dashed',
                  borderColor: podcastCoverPreview ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(e) => setPodcastCover(e.target.files?.[0] || null)}
                />
                {podcastCoverPreview ? (
                  <Box
                    component="img"
                    src={podcastCoverPreview}
                    alt="Cover preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1} sx={{ p: 2 }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Click to upload
                    </Typography>
                  </Stack>
                )}
              </Box>
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="caption" color="text.secondary">Square • JPG or PNG • max 5MB</Typography>
                <Typography variant="caption" color="text.secondary">Recommended: 3000×3000 px</Typography>
              </Stack>
              {podcastCoverPreview && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => { setPodcastCover(null); setPodcastCoverPreview(null); }}
                >
                  Remove
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      );
    }

    // Step 2: Details
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Language"
              value={podcastForm.language}
              onChange={(e) => setPodcastForm((cur) => ({ ...cur, language: e.target.value }))}
              fullWidth
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Podcast Type"
              value={podcastForm.itunes_type}
              onChange={(e) => setPodcastForm((cur) => ({ ...cur, itunes_type: e.target.value as 'episodic' | 'serial' }))}
              fullWidth
            >
              <MenuItem value="episodic">Episodic</MenuItem>
              <MenuItem value="serial">Serial</MenuItem>
            </TextField>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Author Name"
              fullWidth
              value={podcastForm.author_name}
              onChange={(e) => setPodcastForm((cur) => ({ ...cur, author_name: e.target.value }))}
            />
            <TextField
              label="Author Email"
              type="email"
              fullWidth
              value={podcastForm.author_email}
              onChange={(e) => setPodcastForm((cur) => ({ ...cur, author_email: e.target.value }))}
            />
        </Box>
        <TextField
          label="Copyright Notice"
          fullWidth
          value={podcastForm.copyright}
          onChange={(e) => setPodcastForm((cur) => ({ ...cur, copyright: e.target.value }))}
          helperText={`e.g. ${user?.artistName || 'Artist Name'} ${new Date().getFullYear()}`}
        />
        <Stack direction="row" spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={podcastForm.itunes_explicit === 'yes'}
                onChange={(e) => setPodcastForm((cur) => ({ ...cur, itunes_explicit: e.target.checked ? 'yes' : 'no' }))}
              />
            }
            label="Explicit content"
          />
          <FormControlLabel
            control={
              <Switch
                checked={podcastForm.podcast_locked}
                onChange={(e) => setPodcastForm((cur) => ({ ...cur, podcast_locked: e.target.checked }))}
              />
            }
            label="Lock podcast"
          />
        </Stack>
      </Stack>
    );
  };

  // ─── Episode step form renderer ───────────────────────────────────────────
  const renderEpisodeStep = () => {
    if (episodeStep === 0) {
      // Step 1: Content
      return (
        <Stack spacing={2.5}>
          <TextField
            label="Episode Title"
            required
            fullWidth
            value={episodeForm.title}
            onChange={(e) => setEpisodeForm((cur) => ({ ...cur, title: e.target.value }))}
          />
          <TextField
            label="Episode Description"
            required
            fullWidth
            multiline
            minRows={5}
            value={episodeForm.description}
            onChange={(e) => setEpisodeForm((cur) => ({ ...cur, description: e.target.value }))}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                select
                label="Episode Type"
                value={episodeForm.itunes_episode_type}
                onChange={(e) => setEpisodeForm((cur) => ({ ...cur, itunes_episode_type: e.target.value as 'full' | 'trailer' | 'bonus' }))}
                fullWidth
              >
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="trailer">Trailer</MenuItem>
                <MenuItem value="bonus">Bonus</MenuItem>
              </TextField>
              <TextField
                label="Season #"
                type="number"
                fullWidth
                value={episodeForm.itunes_season}
                onChange={(e) => setEpisodeForm((cur) => ({ ...cur, itunes_season: e.target.value }))}
              />
              <TextField
                label="Episode #"
                type="number"
                fullWidth
                value={episodeForm.itunes_episode}
                onChange={(e) => setEpisodeForm((cur) => ({ ...cur, itunes_episode: e.target.value }))}
              />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={episodeForm.itunes_explicit}
                onChange={(e) => setEpisodeForm((cur) => ({ ...cur, itunes_explicit: e.target.checked }))}
              />
            }
            label="Explicit content"
          />
        </Stack>
      );
    }

    // Step 2: Media + Publishing
    return (
      <Stack spacing={2.5}>
        {/* Audio upload */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Episode Audio <Typography component="span" color="error">*</Typography>
          </Typography>
          <Box
            component="label"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '2px dashed',
              borderColor: episodeAudio ? 'primary.main' : 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => setEpisodeAudio(e.target.files?.[0] || null)}
            />
            <MicIcon sx={{ color: episodeAudio ? 'primary.main' : 'text.disabled', fontSize: 32, flexShrink: 0 }} />
            <Box>
              {episodeAudio ? (
                <>
                  <Typography variant="body2" fontWeight={600}>{episodeAudio.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(episodeAudio.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" fontWeight={500}>Click to upload audio</Typography>
                  <Typography variant="caption" color="text.secondary">MP3, WAV, M4A, FLAC supported</Typography>
                </>
              )}
            </Box>
            {episodeAudio && (
              <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
            )}
          </Box>
        </Box>

        {/* Cover art upload */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Episode Cover <Typography component="span" color="text.secondary">(optional)</Typography>
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              component="label"
              sx={{
                width: 80,
                height: 80,
                border: '2px dashed',
                borderColor: episodeCoverPreview ? 'primary.main' : 'divider',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) => setEpisodeCover(e.target.files?.[0] || null)}
              />
              {episodeCoverPreview ? (
                <Box component="img" src={episodeCoverPreview} alt="Episode cover" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon sx={{ color: 'text.disabled' }} />
              )}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {episodeCover ? episodeCover.name : 'JPG or PNG, square recommended'}
              </Typography>
              {episodeCoverPreview && (
                <Button size="small" color="error" onClick={() => { setEpisodeCover(null); setEpisodeCoverPreview(null); }}>
                  Remove
                </Button>
              )}
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Publishing */}
        <TextField
          select
          label="Publishing Mode"
          value={publishMode}
          onChange={(e) => setPublishMode(e.target.value as PublishMode)}
          fullWidth
        >
          <MenuItem value="draft">Save as draft</MenuItem>
          <MenuItem value="publish-now">Publish immediately</MenuItem>
          <MenuItem value="schedule">Schedule for later</MenuItem>
        </TextField>
        {publishMode === 'schedule' && (
          <TextField
            label="Schedule Date & Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={episodeForm.schedule_datetime}
            onChange={(e) => setEpisodeForm((cur) => ({ ...cur, schedule_datetime: e.target.value }))}
          />
        )}
      </Stack>
    );
  };

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>
      {/* Page header */}
      <Box
        sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', borderRadius: '14px', bgcolor: isDark ? '#111827' : '#ffffff' }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.85rem' }, color: isDark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.02em' }}>Podcasts</Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)' }}>
            {workspaceSupervisor
              ? 'Workspace owner: all podcasts under this API key are listed here.'
              : accessMode === 'owned'
                ? 'Each account gets one podcast. Create it once, then keep adding episodes.'
                : 'Shared workspace — create and manage podcasts without separate subscriptions.'}
          </Typography>
        </Stack>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} sx={{ mb: 3 }} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {/* Stats row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          <Box sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', bgcolor: isDark ? '#111827' : '#ffffff', p: 2.25 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#4a6cf7', width: 44, height: 44 }}><PodcastIcon /></Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>{podcasts.length}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)' }}>Connected Podcasts</Typography>
                </Box>
              </Stack>
          </Box>
          <Box sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', bgcolor: isDark ? '#111827' : '#ffffff', p: 2.25 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#f59e0b', width: 44, height: 44 }}><MicIcon /></Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>{episodes.length}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)' }}>Total Episodes</Typography>
                </Box>
              </Stack>
          </Box>
          <Box sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', bgcolor: isDark ? '#111827' : '#ffffff', p: 2.25 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#10b981', width: 44, height: 44 }}><UploadFileIcon /></Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>{publishedEpisodes}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)' }}>Published Episodes</Typography>
                </Box>
              </Stack>
          </Box>
      </Box>

      {/* ── MY PODCAST VIEW ─────────────────────────────────────────────── */}
      {activeView === 'podcast' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Left: step form */}
          <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', bgcolor: isDark ? '#111827' : '#ffffff' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {hasPodcast ? 'Your Podcast' : 'Create Podcast'}
                  </Typography>
                  {!hasPodcast && (
                    <Typography variant="body2" color="text.secondary">
                      Step {createStep + 1} of {CREATE_STEPS.length}
                    </Typography>
                  )}
                </Box>
                {!hasPodcast && (
                  <Chip
                    label={`${Math.round(((createStep + 1) / CREATE_STEPS.length) * 100)}%`}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>

              {hasPodcast ? (
                <Alert severity="info">
                  This account already has a linked podcast. Head to <strong>Episodes</strong> in the sidebar to publish new episodes.
                </Alert>
              ) : (
                <>
                  {workspaceSupervisor && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Workspace supervisor: you can create additional podcasts.
                    </Alert>
                  )}

                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={((createStep + 1) / CREATE_STEPS.length) * 100}
                    sx={{ mb: 3, borderRadius: 4, height: 6 }}
                  />

                  {/* Stepper */}
                  <Stepper activeStep={createStep} sx={{ mb: 4 }}>
                    {CREATE_STEPS.map((label, idx) => (
                      <Step key={label} completed={createStep > idx}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Step content */}
                  <Box sx={{ minHeight: 320 }}>
                    {renderCreateStep()}
                  </Box>

                  {/* Navigation */}
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      disabled={createStep === 0}
                      onClick={() => setCreateStep((s) => s - 1)}
                    >
                      Previous
                    </Button>

                    {createStep < CREATE_STEPS.length - 1 ? (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        disabled={
                          (createStep === 0 && !step1Valid(podcastForm, selectedCategories)) ||
                          (createStep === 1 && !step2Valid(podcastForm))
                        }
                        onClick={() => setCreateStep((s) => s + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={isSubmittingPodcast}
                        startIcon={isSubmittingPodcast ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                        onClick={handlePodcastSubmit}
                      >
                        {isSubmittingPodcast ? 'Creating...' : 'Create Podcast'}
                      </Button>
                    )}
                  </Stack>
                </>
              )}
          </Box>

          {/* Right: existing podcasts list */}
          <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', bgcolor: isDark ? '#111827' : '#ffffff' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {podcasts.length > 0 ? 'Your Podcasts' : 'No Podcasts Yet'}
              </Typography>
              {podcasts.length === 0 ? (
                <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
                  <PodcastIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography color="text.secondary">Complete the form to create your first podcast.</Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {podcasts.map((podcast) => (
                    <Box
                      key={podcast.id}
                      onClick={() => setSelectedPodcastId(podcast.id)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: selectedPodcastId === podcast.id ? 'primary.main' : 'divider',
                        bgcolor: selectedPodcastId === podcast.id ? 'action.selected' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        {podcast.cover_url ? (
                          <Box
                            component="img"
                            src={podcast.cover_url}
                            alt={podcast.title}
                            sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'primary.dark' }}>
                            <PodcastIcon />
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600} noWrap>{podcast.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {podcast.language.toUpperCase()} • {podcast.role}
                          </Typography>
                          {podcast.redirect_url && (
                            <Typography variant="caption" color="primary.main" noWrap sx={{ display: 'block' }}>
                              {podcast.redirect_url}
                            </Typography>
                          )}
                        </Box>
                        {selectedPodcastId === podcast.id && (
                          <CheckCircleIcon color="primary" />
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
          </Box>
        </Box>
      )}

      {/* ── EPISODES VIEW ───────────────────────────────────────────────── */}
      {activeView === 'episodes' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 3 }}>
          {/* Left: publish form */}
          <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', bgcolor: isDark ? '#111827' : '#ffffff' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Publish Episode</Typography>

              {podcasts.length === 0 ? (
                <Alert severity="warning">
                  Create a podcast first before publishing episodes.
                </Alert>
              ) : (
                <>
                  {/* Podcast selector */}
                  <TextField
                    select
                    label="Podcast"
                    value={selectedPodcastId ?? ''}
                    onChange={(e) => setSelectedPodcastId(Number(e.target.value))}
                    fullWidth
                    sx={{ mb: 2.5 }}
                  >
                    {podcasts.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                    ))}
                  </TextField>

                  {/* Distribution chips */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Distributes to</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {['Apple Podcasts', 'Spotify', 'Amazon Music', 'Deezer', 'iHeartRadio', 'Pandora', 'TuneIn', 'Pocket Casts', 'Overcast', 'Castbox', 'Podcast Addict', 'Podcast Index'].map((name) => (
                        <Chip key={name} label={name} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Paper>

                  {/* Step indicator */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Step {episodeStep + 1} of {EPISODE_STEPS.length}
                    </Typography>
                    <Chip
                      label={`${Math.round(((episodeStep + 1) / EPISODE_STEPS.length) * 100)}%`}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={((episodeStep + 1) / EPISODE_STEPS.length) * 100}
                    sx={{ mb: 2.5, borderRadius: 4, height: 6 }}
                  />
                  <Stepper activeStep={episodeStep} sx={{ mb: 3 }}>
                    {EPISODE_STEPS.map((label, idx) => (
                      <Step key={label} completed={episodeStep > idx}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Step content */}
                  <Box sx={{ minHeight: 280 }}>
                    {renderEpisodeStep()}
                  </Box>

                  {/* Navigation */}
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      disabled={episodeStep === 0}
                      onClick={() => setEpisodeStep((s) => s - 1)}
                    >
                      Previous
                    </Button>

                    {episodeStep < EPISODE_STEPS.length - 1 ? (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        disabled={!episodeStep1Valid(episodeForm)}
                        onClick={() => setEpisodeStep((s) => s + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={!selectedPodcastId || isSubmittingEpisode || !episodeAudio}
                        startIcon={isSubmittingEpisode ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                        onClick={(e) => {
                          // Trigger submit via synthetic form event
                          const syntheticEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                          void handleEpisodeSubmit(syntheticEvent);
                        }}
                      >
                        {isSubmittingEpisode ? 'Uploading...' : 'Publish Episode'}
                      </Button>
                    )}
                  </Stack>
                </>
              )}
          </Box>

          {/* Right: episodes list */}
          <Box>
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Episodes</Typography>
                <Chip label={`${episodes.length} total`} size="small" variant="outlined" />
              </Stack>
              {episodes.length === 0 ? (
                <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
                  <MicIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography color="text.secondary">No episodes yet. Publish your first one.</Typography>
                </Stack>
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {episodes.map((episode) => (
                    <Box key={episode.id} sx={{ py: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600} noWrap>{episode.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
                            {episode.description}
                          </Typography>
                          {episode.publish_datetime && (
                            <Typography variant="caption" color="text.disabled">
                              {new Date(episode.publish_datetime).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" flexShrink={0}>
                          <Chip
                            size="small"
                            label={episode.status}
                            color={episode.status === 'published' ? 'success' : episode.status === 'scheduled' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`Transcode: ${episode.processing?.transcode?.status || 'pending'}`}
                            color={
                              episode.processing?.transcode?.status === 'done' ? 'success'
                              : episode.processing?.transcode?.status === 'error' ? 'error'
                              : 'warning'
                            }
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Box>
      )}

      {/* ── ANALYTICS VIEW ──────────────────────────────────────────────── */}
      {activeView === 'analytics' && (
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>Podcast Analytics</Typography>
            {podcasts.length > 0 && (
              <TextField
                select
                label="Podcast"
                value={selectedPodcastId ?? ''}
                onChange={(e) => setSelectedPodcastId(Number(e.target.value))}
                fullWidth
                sx={{ maxWidth: 400 }}
              >
                {podcasts.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                ))}
              </TextField>
            )}
            {analyticsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            )}
            {analyticsError && <Alert severity="error">{analyticsError}</Alert>}
            {!analyticsLoading && !analyticsError && selectedPodcastId && (
              <Box sx={{ height: 320, width: '100%' }}>
                {analyticsSeries ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="downloads" stroke="#5B8CFF" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="info">
                    Analytics loaded but response shape not yet recognized. Will map once exact API payload is available.
                  </Alert>
                )}
              </Box>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

export default function PodcastsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <PodcastsContent />
    </Suspense>
  );
}
