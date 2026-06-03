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
import { useAuth } from '@/context/AppContext';
import RouteTabs from '@/components/navigation/RouteTabs';
import {
  CreateRssEpisodePayload,
  CreateRssPodcastPayload,
  RssCategory,
  RssEpisode,
  RssEpisodeMidroll,
  RssPodcast,
  RssPresignedUpload,
} from '@/types/rss';
import { toast } from 'sonner';

const LANGUAGE_OPTIONS = [
  { value: 'en-us', label: 'English (US)' },
  { value: 'en', label: 'English' },
  { value: 'en-gb', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'hi', label: 'Hindi' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

type PodcastAccessMode = 'shared' | 'owned';
type ActiveView = 'podcast' | 'episodes' | 'payouts';

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
  ai_content: boolean;
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
  ai_content: false,
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

const formatMarkerTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
};

const parseMarkerTimeToMs = (value: string) => {
  const parts = value.trim().split(':').map(Number);
  if (![2, 3].includes(parts.length) || parts.some(part => !Number.isInteger(part) || part < 0)) {
    return null;
  }

  const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
  if (minutes > 59 || seconds > 59) return null;
  return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
};

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
const EPISODE_STEPS = ['Episode setup', 'Metadata', 'Publish'];
const PODCAST_DESTINATIONS = [
  { name: 'Apple Podcasts', mark: 'AP', color: '#7c3aed', logoSrc: '/images/podcast-logos/apple-podcasts.svg' },
  { name: 'Spotify', mark: 'S', color: '#16a34a', logoSrc: '/images/podcast-logos/spotify.svg' },
  { name: 'Amazon Music', mark: 'AM', color: '#2563eb', logoSrc: '/images/podcast-logos/amazon-music.svg' },
  { name: 'Podcast Index', mark: 'PI', color: '#f97316', logoSrc: '/images/podcast-logos/podcast-index.svg' },
  { name: 'Listen Notes', mark: 'LN', color: '#dc2626', logoSrc: '/images/podcast-logos/listen-notes.svg' },
  { name: 'Podcast Community', mark: 'PC', color: '#f97316', logoSrc: '/images/podcast-logos/podcast-community.svg' },
  { name: 'Castamatic', mark: 'CA', color: '#0891b2', logoSrc: '/images/podcast-logos/castamatic.svg' },
  { name: 'Castbox', mark: 'CB', color: '#ef4444', logoSrc: '/images/podcast-logos/castbox.svg' },
  { name: 'Castro', mark: 'C', color: '#4338ca', logoSrc: '/images/podcast-logos/castro.svg' },
  { name: 'Curiocaster', mark: 'CU', color: '#0f766e', logoSrc: '/images/podcast-logos/curiocaster.svg' },
  { name: 'Overcast', mark: 'O', color: '#fb923c', logoSrc: '/images/podcast-logos/overcast.svg' },
  { name: 'Pocket Casts', mark: 'PC', color: '#e11d48', logoSrc: '/images/podcast-logos/pocket-casts.svg' },
  { name: 'Podcast Addict', mark: 'PA', color: '#2563eb', logoSrc: '/images/podcast-logos/podcast-addict.svg' },
  { name: 'Podcast Guru', mark: 'PG', color: '#7c2d12', logoSrc: '/images/podcast-logos/podcast-guru.svg' },
  { name: 'PodLP', mark: 'PL', color: '#4f46e5', logoSrc: '/images/podcast-logos/podlp.svg' },
  { name: 'Podverse', mark: 'PV', color: '#9333ea', logoSrc: '/images/podcast-logos/podverse.svg' },
  { name: 'Deezer', mark: 'D', color: '#0f172a', logoSrc: '/images/podcast-logos/deezer.svg' },
  { name: 'iHeartRadio', mark: 'IH', color: '#dc2626', logoSrc: '/images/podcast-logos/iheart-radio.svg' },
  { name: 'Pandora', mark: 'P', color: '#0284c7', logoSrc: '/images/podcast-logos/pandora.svg' },
  { name: 'Tune In', mark: 'TI', color: '#14b8a6', logoSrc: '/images/podcast-logos/tune-in.svg' },
];

// ─── Podcast step 1 validation ───────────────────────────────────────────────
function step1Valid(form: PodcastFormState, cats: RssCategory[]) {
  return form.title.trim().length > 0 && form.description.trim().length > 0 && cats.length > 0;
}

// ─── Podcast step 2 validation ───────────────────────────────────────────────
function step2Valid(form: PodcastFormState) {
  return form.language.length > 0;
}

// ─── Episode step 1 validation ───────────────────────────────────────────────
function episodeStepValid(step: number, form: EpisodeFormState, audio: File | null) {
  if (step === 0) {
    return form.title.trim().length > 0 && form.description.trim().length > 0 && Boolean(audio);
  }
  return true;
}

export function PodcastsContent({
  allowPodcastCreation = false,
  navigationBase = '/dashboard/podcasts',
}: {
  allowPodcastCreation?: boolean;
  navigationBase?: '/dashboard/podcasts' | '/admin/podcasts';
}) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const wizardTextColor = isDark ? '#f8fafc' : '#0f172a';
  const wizardMutedColor = isDark ? 'rgba(248,250,252,0.72)' : 'rgba(15,23,42,0.68)';

  // Derive active view from URL query param
  const viewParam = searchParams.get('view') as ActiveView | null;
  const activeView: ActiveView =
    viewParam === 'payouts'
      ? 'payouts'
      : viewParam === 'episodes'
        ? 'episodes'
        : allowPodcastCreation
          ? 'podcast'
          : 'episodes';

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
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmittingPodcast, setIsSubmittingPodcast] = useState(false);
  const [isSubmittingEpisode, setIsSubmittingEpisode] = useState(false);
  const [accessMode, setAccessMode] = useState<PodcastAccessMode>('shared');
  const [workspaceSupervisor, setWorkspaceSupervisor] = useState(false);
  const [podcastCoverPreview, setPodcastCoverPreview] = useState<string | null>(null);

  // Step form state
  const [createStep, setCreateStep] = useState(0);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [episodeStep, setEpisodeStep] = useState(0);
  const [episodeCoverPreview, setEpisodeCoverPreview] = useState<string | null>(null);
  const [midrollsByEpisode, setMidrollsByEpisode] = useState<Record<number, RssEpisodeMidroll[]>>({});
  const [midrollInputs, setMidrollInputs] = useState<Record<number, string>>({});
  const [midrollLoading, setMidrollLoading] = useState<Record<number, boolean>>({});
  const [midrollSaving, setMidrollSaving] = useState<Record<number, boolean>>({});
  const [midrollDeleting, setMidrollDeleting] = useState<Record<number, number | null>>({});

  const publishedEpisodes = useMemo(
    () => episodes.filter(e => e.status === 'published').length,
    [episodes]
  );
  const selectedPodcast = useMemo(
    () => podcasts.find(podcast => podcast.id === selectedPodcastId) || null,
    [podcasts, selectedPodcastId]
  );

  const hasPodcast =
    !allowPodcastCreation && accessMode === 'owned' && podcasts.length > 0 && !workspaceSupervisor;
  const canCreatePodcasts = allowPodcastCreation;

  // Auto-fill author from user
  useEffect(() => {
    setPodcastForm(cur => ({
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
        const catJson = await readJson<{
          success: boolean;
          data?: RssCategory[];
          message?: string;
        }>(catRes);
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
          setSelectedPodcastId(cur => cur ?? podJson.data![0].id);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load podcast workspace');
      } finally {
        setIsBootstrapping(false);
      }
    };
    void bootstrap();
  }, []);

  // Cover preview
  useEffect(() => {
    if (!podcastCover) {
      setPodcastCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(podcastCover);
    setPodcastCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [podcastCover]);

  // Episode cover preview
  useEffect(() => {
    if (!episodeCover) {
      setEpisodeCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(episodeCover);
    setEpisodeCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [episodeCover]);

  // Load episodes when podcast selected
  useEffect(() => {
    if (!selectedPodcastId) {
      setEpisodes([]);
      setMidrollsByEpisode({});
      setMidrollInputs({});
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/rss/podcasts/${selectedPodcastId}/episodes`, {
          cache: 'no-store',
        });
        const json = await readJson<{ success: boolean; data?: RssEpisode[]; message?: string }>(
          res
        );
        if (!json.success) throw new Error(json.message || 'Failed to load episodes');
        setEpisodes(json.data || []);
        setMidrollsByEpisode({});
        setMidrollInputs({});
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load episodes');
      }
    };
    void load();
  }, [selectedPodcastId]);

  const uploadAsset = async (
    podcastId: number,
    file: File,
    assetType: 'audio' | 'image'
  ): Promise<RssPresignedUpload> => {
    const formData = new FormData();
    formData.append('assetType', assetType);
    formData.append('file', file);
    const res = await fetch(`/api/rss/podcasts/${podcastId}/assets/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await readJson<{ success: boolean; data?: RssPresignedUpload; message?: string }>(
      res
    );
    if (!json.success || !json.data)
      throw new Error(json.message || `Failed to upload ${assetType}`);
    return json.data;
  };

  const loadEpisodeMidrolls = async (episodeId: number) => {
    if (!selectedPodcastId) return;
    try {
      setMidrollLoading(cur => ({ ...cur, [episodeId]: true }));
      const res = await fetch(
        `/api/rss/podcasts/${selectedPodcastId}/episodes/${episodeId}/midrolls`,
        { cache: 'no-store' }
      );
      const json = await readJson<{
        success: boolean;
        data?: RssEpisodeMidroll[];
        message?: string;
      }>(res);
      if (!json.success) throw new Error(json.message || 'Failed to load ad markers');
      setMidrollsByEpisode(cur => ({ ...cur, [episodeId]: json.data || [] }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load ad markers');
    } finally {
      setMidrollLoading(cur => ({ ...cur, [episodeId]: false }));
    }
  };

  const handleAddMidroll = async (episodeId: number) => {
    if (!selectedPodcastId) return;
    const startTimeMs = parseMarkerTimeToMs(midrollInputs[episodeId] || '');
    if (startTimeMs === null) {
      toast.error('Use HH:MM:SS or MM:SS for ad marker time.');
      return;
    }

    try {
      setMidrollSaving(cur => ({ ...cur, [episodeId]: true }));
      const res = await fetch(
        `/api/rss/podcasts/${selectedPodcastId}/episodes/${episodeId}/midrolls`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start_time_ms: startTimeMs }),
        }
      );
      const json = await readJson<{ success: boolean; data?: RssEpisodeMidroll; message?: string }>(
        res
      );
      if (!json.success || !json.data) throw new Error(json.message || 'Failed to add ad marker');

      setMidrollsByEpisode(cur => ({
        ...cur,
        [episodeId]: [...(cur[episodeId] || []), json.data!].sort(
          (a, b) => a.start_time_ms - b.start_time_ms
        ),
      }));
      setMidrollInputs(cur => ({ ...cur, [episodeId]: '' }));
      toast.success('Ad marker added.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add ad marker');
    } finally {
      setMidrollSaving(cur => ({ ...cur, [episodeId]: false }));
    }
  };

  const handleDeleteMidroll = async (episodeId: number, midrollId: number) => {
    if (!selectedPodcastId) return;
    try {
      setMidrollDeleting(cur => ({ ...cur, [episodeId]: midrollId }));
      const res = await fetch(
        `/api/rss/podcasts/${selectedPodcastId}/episodes/${episodeId}/midrolls/${midrollId}`,
        { method: 'DELETE' }
      );
      const json = await readJson<{ success: boolean; message?: string }>(res);
      if (!json.success) throw new Error(json.message || 'Failed to delete ad marker');

      setMidrollsByEpisode(cur => ({
        ...cur,
        [episodeId]: (cur[episodeId] || []).filter(marker => marker.id !== midrollId),
      }));
      toast.success('Ad marker removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete ad marker');
    } finally {
      setMidrollDeleting(cur => ({ ...cur, [episodeId]: null }));
    }
  };

  const handlePodcastSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Pick at least one podcast category.');
      return;
    }
    try {
      setIsSubmittingPodcast(true);
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
        itunes_categories_ids: selectedCategories.map(c => c.id),
      };
      const createRes = await fetch('/api/rss/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const createJson = await readJson<{
        success: boolean;
        data?: RssPodcast;
        message?: string;
        details?: unknown;
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
        const patchJson = await readJson<{ success: boolean; data?: RssPodcast; message?: string }>(
          patchRes
        );
        if (!patchJson.success || !patchJson.data)
          throw new Error(patchJson.message || 'Cover upload failed.');
        finalPodcast = patchJson.data;
      }
      setPodcasts(cur => [finalPodcast, ...cur.filter(p => p.id !== finalPodcast.id)]);
      setSelectedPodcastId(finalPodcast.id);
      setPodcastForm({
        ...defaultPodcastForm,
        author_name: user?.artistName || user?.name || '',
        author_email: user?.email || '',
        copyright: user?.artistName || user?.name || '',
      });
      setSelectedCategories([]);
      setPodcastCover(null);
      setPodcastCoverPreview(null);
      setCreateStep(0);
      setSlugManuallyEdited(false);
      toast.success(`Podcast "${finalPodcast.title}" created successfully.`);
      router.push(allowPodcastCreation ? '/admin/podcasts?view=episodes' : '/dashboard/podcasts?view=episodes');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create podcast');
    } finally {
      setIsSubmittingPodcast(false);
    }
  };

  const handleEpisodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPodcastId) {
      toast.error('Select a podcast first.');
      return;
    }
    if (!episodeAudio) {
      toast.error('Select an audio file for the episode.');
      return;
    }
    try {
      setIsSubmittingEpisode(true);
      const audioUpload = await uploadAsset(selectedPodcastId, episodeAudio, 'audio');
      let coverUploadId: string | undefined;
      if (episodeCover) {
        const coverUpload = await uploadAsset(selectedPodcastId, episodeCover, 'image');
        coverUploadId = coverUpload.id;
      }
      const payload: CreateRssEpisodePayload = {
        title: episodeForm.title,
        description: episodeForm.description.trim() || episodeForm.title.trim(),
        itunes_explicit: episodeForm.itunes_explicit,
        itunes_episode_type: episodeForm.itunes_episode_type,
        itunes_episode: episodeForm.itunes_episode ? Number(episodeForm.itunes_episode) : null,
        itunes_season: episodeForm.itunes_season ? Number(episodeForm.itunes_season) : null,
        custom_link: episodeForm.custom_link || null,
        schedule_datetime: null,
        ai_content: episodeForm.ai_content,
        audio_upload_id: audioUpload.id,
        cover_upload_id: coverUploadId || null,
      };
      const res = await fetch(`/api/rss/podcasts/${selectedPodcastId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await readJson<{ success: boolean; data?: RssEpisode; message?: string }>(res);
      if (!json.success || !json.data) throw new Error(json.message || 'Failed to create episode');
      setEpisodes(cur => [json.data!, ...cur]);
      setEpisodeForm(defaultEpisodeForm);
      setEpisodeAudio(null);
      setEpisodeCover(null);
      setEpisodeStep(0);
      toast.success(`Episode "${json.data.title}" published successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create episode');
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
              onChange={e => {
                const title = e.target.value;
                setPodcastForm(cur => ({
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
              onChange={e => {
                setSlugManuallyEdited(true);
                setPodcastForm(cur => ({ ...cur, slug: slugify(e.target.value) }));
              }}
              helperText={
                podcastForm.slug
                  ? `Public podcast URL slug: ${podcastForm.slug}`
                  : 'Auto-generated from title'
              }
              InputProps={{
                startAdornment: (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mr: 0.5, whiteSpace: 'nowrap' }}
                  >
                    podcast/
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
              onChange={e => setPodcastForm(cur => ({ ...cur, description: e.target.value }))}
              inputProps={{ maxLength: 4000 }}
              helperText={`${podcastForm.description.length}/4000`}
            />
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={o => o.localized_label || o.label}
              value={selectedCategories}
              onChange={(_e, val) => setSelectedCategories(val.slice(0, 2))}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Categories"
                  required
                  helperText="Up to 2 categories."
                />
              )}
            />
          </Stack>

          {/* Right: cover art upload */}
          <Box>
            <Stack spacing={1.5} alignItems="center">
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
                sx={{ alignSelf: 'flex-start' }}
              >
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
                  onChange={e => setPodcastCover(e.target.files?.[0] || null)}
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
                <Typography variant="caption" color="text.secondary">
                  Square • JPG or PNG • max 5MB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recommended: 3000×3000 px
                </Typography>
              </Stack>
              {podcastCoverPreview && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    setPodcastCover(null);
                    setPodcastCoverPreview(null);
                  }}
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
            onChange={e => setPodcastForm(cur => ({ ...cur, language: e.target.value }))}
            fullWidth
          >
            {LANGUAGE_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Podcast Type"
            value={podcastForm.itunes_type}
            onChange={e =>
              setPodcastForm(cur => ({
                ...cur,
                itunes_type: e.target.value as 'episodic' | 'serial',
              }))
            }
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
            onChange={e => setPodcastForm(cur => ({ ...cur, author_name: e.target.value }))}
          />
          <TextField
            label="Author Email"
            type="email"
            fullWidth
            value={podcastForm.author_email}
            onChange={e => setPodcastForm(cur => ({ ...cur, author_email: e.target.value }))}
          />
        </Box>
        <TextField
          label="Copyright Notice"
          fullWidth
          value={podcastForm.copyright}
          onChange={e => setPodcastForm(cur => ({ ...cur, copyright: e.target.value }))}
          helperText={`e.g. ${user?.artistName || 'Artist Name'} ${new Date().getFullYear()}`}
        />
        <Stack direction="row" spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={podcastForm.itunes_explicit === 'yes'}
                onChange={e =>
                  setPodcastForm(cur => ({
                    ...cur,
                    itunes_explicit: e.target.checked ? 'yes' : 'no',
                  }))
                }
              />
            }
            label="Explicit content"
          />
          <FormControlLabel
            control={
              <Switch
                checked={podcastForm.podcast_locked}
                onChange={e =>
                  setPodcastForm(cur => ({ ...cur, podcast_locked: e.target.checked }))
                }
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
      return (
        <Stack spacing={2.5}>
          <TextField
            label="Episode Title"
            required
            fullWidth
            value={episodeForm.title}
            onChange={e => setEpisodeForm(cur => ({ ...cur, title: e.target.value }))}
          />
          <TextField
            label="Episode Notes"
            required
            fullWidth
            multiline
            minRows={7}
            value={episodeForm.description}
            onChange={e => setEpisodeForm(cur => ({ ...cur, description: e.target.value }))}
            inputProps={{ maxLength: 4000 }}
            helperText={`${episodeForm.description.length}/4000`}
          />
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gap: 2 }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: wizardTextColor }}>
                Audio file *
              </Typography>
              <Box
                component="label"
                sx={{
                  minHeight: 132,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  p: 2,
                  border: '2px dashed',
                  borderColor: episodeAudio ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  textAlign: 'center',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={e => setEpisodeAudio(e.target.files?.[0] || null)}
                />
                <MicIcon
                  sx={{ color: episodeAudio ? 'primary.main' : 'text.disabled', fontSize: 34 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: wizardTextColor }}>
                    {episodeAudio ? episodeAudio.name : 'Upload audio file'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: wizardMutedColor }}>
                    {episodeAudio
                      ? `${(episodeAudio.size / 1024 / 1024).toFixed(2)} MB`
                      : 'MP3, WAV, M4A, FLAC'}
                  </Typography>
                </Box>
                {episodeAudio && <CheckCircleIcon color="primary" />}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: wizardTextColor }}>
                Cover art
              </Typography>
              <Box
                component="label"
                sx={{
                  aspectRatio: '1 / 1',
                  minHeight: 132,
                  border: '2px dashed',
                  borderColor: episodeCoverPreview ? 'primary.main' : 'divider',
                  borderRadius: 2,
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
                  onChange={e => setEpisodeCover(e.target.files?.[0] || null)}
                />
                {episodeCoverPreview ? (
                  <Box
                    component="img"
                    src={episodeCoverPreview}
                    alt="Episode cover"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <ImageIcon sx={{ color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ color: wizardMutedColor }}>
                      Upload cover art
                    </Typography>
                  </Stack>
                )}
              </Box>
              {episodeCoverPreview && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setEpisodeCover(null);
                    setEpisodeCoverPreview(null);
                  }}
                  sx={{ mt: 0.75 }}
                >
                  Remove
                </Button>
              )}
            </Box>
          </Box>

          <TextField
            select
            label="Type of episode"
            value={episodeForm.itunes_episode_type}
            onChange={e =>
              setEpisodeForm(cur => ({
                ...cur,
                itunes_episode_type: e.target.value as 'full' | 'trailer' | 'bonus',
              }))
            }
            fullWidth
          >
            <MenuItem value="full">Full</MenuItem>
            <MenuItem value="trailer">Trailer</MenuItem>
            <MenuItem value="bonus">Bonus</MenuItem>
          </TextField>
        </Stack>
      );
    }

    if (episodeStep === 1) {
      return (
        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Season number"
              type="number"
              fullWidth
              value={episodeForm.itunes_season}
              onChange={e => setEpisodeForm(cur => ({ ...cur, itunes_season: e.target.value }))}
            />
            <TextField
              label="Episode number"
              type="number"
              fullWidth
              value={episodeForm.itunes_episode}
              onChange={e => setEpisodeForm(cur => ({ ...cur, itunes_episode: e.target.value }))}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={episodeForm.ai_content}
                onChange={e => setEpisodeForm(cur => ({ ...cur, ai_content: e.target.checked }))}
              />
            }
            label="Does this episode include AI content?"
            sx={{ '& .MuiFormControlLabel-label': { color: wizardTextColor, fontWeight: 600 } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={episodeForm.itunes_explicit}
                onChange={e =>
                  setEpisodeForm(cur => ({ ...cur, itunes_explicit: e.target.checked }))
                }
              />
            }
            label="Explicit content"
            sx={{ '& .MuiFormControlLabel-label': { color: wizardTextColor, fontWeight: 600 } }}
          />
        </Stack>
      );
    }

    return (
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
            gap: 1.25,
          }}
        >
          {PODCAST_DESTINATIONS.map(destination => (
            <Box
              key={destination.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 1.25,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: destination.color,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {destination.mark}
                <Box
                  component="img"
                  src={destination.logoSrc}
                  alt=""
                  aria-hidden="true"
                  width={34}
                  height={34}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                  sx={{
                    position: 'absolute',
                    width: 34,
                    height: 34,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: wizardTextColor }} noWrap>
                {destination.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    );
  };

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>
      {/* Page header */}
      

      <RouteTabs
        ariaLabel="podcast sections"
        items={[
          ...(allowPodcastCreation ? [{ label: 'Manage Podcasts', href: navigationBase }] : []),
          { label: 'Upload Episode', href: `${navigationBase}?view=episodes` },
          { label: 'Payouts', href: `${navigationBase}?view=payouts` },
        ]}
      />

      {/* Stats row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            bgcolor: isDark ? '#111827' : '#ffffff',
            p: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#4a6cf7', width: 36, height: 36 }}>
              <PodcastIcon />
            </Avatar>
            <Box>
              <Typography
                sx={{ fontWeight: 800, fontSize: '1.15rem', color: isDark ? '#f1f5f9' : '#0f172a' }}
              >
                {podcasts.length}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)',
                }}
              >
                Connected Podcasts
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            bgcolor: isDark ? '#111827' : '#ffffff',
            p: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#f59e0b', width: 36, height: 36 }}>
              <MicIcon />
            </Avatar>
            <Box>
              <Typography
                sx={{ fontWeight: 800, fontSize: '1.15rem', color: isDark ? '#f1f5f9' : '#0f172a' }}
              >
                {episodes.length}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)',
                }}
              >
                Total Episodes
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            bgcolor: isDark ? '#111827' : '#ffffff',
            p: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36 }}>
              <UploadFileIcon />
            </Avatar>
            <Box>
              <Typography
                sx={{ fontWeight: 800, fontSize: '1.15rem', color: isDark ? '#f1f5f9' : '#0f172a' }}
              >
                {publishedEpisodes}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)',
                }}
              >
                Published Episodes
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* ── MY PODCAST VIEW ─────────────────────────────────────────────── */}
      {activeView === 'podcast' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: canCreatePodcasts ? { xs: '1fr', lg: '1fr 1fr' } : '1fr',
            gap: 3,
          }}
        >
          {/* Left: step form */}
          {canCreatePodcasts && (
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '14px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                bgcolor: isDark ? '#111827' : '#ffffff',
              }}
            >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                >
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
                This account already has a linked podcast. Head to <strong>Upload Episode</strong>{' '}
                in the sidebar to publish new episodes.
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
                <Box sx={{ minHeight: 320 }}>{renderCreateStep()}</Box>

                {/* Navigation */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    disabled={createStep === 0}
                    onClick={() => setCreateStep(s => s - 1)}
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
                      onClick={() => setCreateStep(s => s + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={isSubmittingPodcast}
                      startIcon={
                        isSubmittingPodcast ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                      onClick={handlePodcastSubmit}
                    >
                      {isSubmittingPodcast ? 'Creating…' : 'Create Podcast'}
                    </Button>
                  )}
                </Stack>
              </>
            )}
            </Box>
          )}

          {/* Right: existing podcasts list */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: '14px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              bgcolor: isDark ? '#111827' : '#ffffff',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mb: 2, color: isDark ? '#f1f5f9' : '#0f172a' }}
            >
              {podcasts.length > 0 ? 'Available Podcasts' : 'No Podcasts Available'}
            </Typography>
            {podcasts.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: isDark ? 'rgba(255,255,255,0.56)' : 'rgba(15,23,42,0.58)' }}
              >
                No podcasts are available yet. Contact admin.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {podcasts.map(podcast => (
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
                      transition: 'border-color 150ms ease, background-color 150ms ease',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {podcast.cover_url ? (
                        <Box
                          component="img"
                          src={podcast.cover_url}
                          alt={podcast.title}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'primary.dark' }}
                        >
                          <PodcastIcon />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                          variant="subtitle1"
                          fontWeight={600}
                        >
                          {podcast.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {podcast.language.toUpperCase()} • {podcast.role}
                        </Typography>
                        {podcast.redirect_url && (
                          <Typography
                            variant="caption"
                            color="primary.main"
                            noWrap
                            sx={{ display: 'block' }}
                          >
                            {podcast.redirect_url}
                          </Typography>
                        )}
                      </Box>
                      {selectedPodcastId === podcast.id && <CheckCircleIcon color="primary" />}
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' }, gap: 3 }}>
          {/* Left: publish form */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: '14px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              bgcolor: isDark ? '#111827' : '#ffffff',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mb: 2, color: isDark ? '#f1f5f9' : '#0f172a' }}
            >
              Publish Episode
            </Typography>

            {podcasts.length === 0 ? (
              <Alert severity="warning">No podcasts are available yet. Contact admin.</Alert>
            ) : (
              <>
                <TextField
                  select
                  label="Select Category"
                  value={selectedPodcastId ?? ''}
                  onChange={e => setSelectedPodcastId(Number(e.target.value))}
                  fullWidth
                  sx={{
                    mb: 2.5,
                    '& .MuiSelect-select': {
                      alignItems: 'center',
                      display: 'flex',
                      minHeight: 48,
                    },
                  }}
                  SelectProps={{
                    renderValue: value => {
                      const podcast = podcasts.find(p => p.id === Number(value)) || selectedPodcast;

                      if (!podcast) return 'Select Podcast';

                      return (
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                          {podcast.cover_url ? (
                            <Box
                              component="img"
                              src={podcast.cover_url}
                              alt=""
                              aria-hidden="true"
                              width={40}
                              height={40}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.25,
                                objectFit: 'cover',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <Avatar sx={{ width: 40, height: 40, borderRadius: 1.25, bgcolor: 'primary.dark' }}>
                              <PodcastIcon />
                            </Avatar>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={800} noWrap>
                              {podcast.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {podcast.language.toUpperCase()}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    },
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            height: 'auto',
                            minHeight: 64,
                            py: 1,
                          },
                        },
                      },
                    },
                  }}
                >
                  {podcasts.map(p => (
                    <MenuItem
                      key={p.id}
                      value={p.id}
                      sx={{
                        gap: 1.5,
                        whiteSpace: 'normal',
                      }}
                    >
                      {p.cover_url ? (
                        <Box
                          component="img"
                          src={p.cover_url}
                          alt=""
                          aria-hidden="true"
                          width={44}
                          height={44}
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.25,
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Avatar sx={{ width: 44, height: 44, borderRadius: 1.25, bgcolor: 'primary.dark' }}>
                          <PodcastIcon />
                        </Avatar>
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {p.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.language.toUpperCase()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Step indicator */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
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
                <Box sx={{ minHeight: 280 }}>{renderEpisodeStep()}</Box>

                {/* Navigation */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    disabled={episodeStep === 0}
                    onClick={() => setEpisodeStep(s => s - 1)}
                  >
                    Previous
                  </Button>

                  {episodeStep < EPISODE_STEPS.length - 1 ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      disabled={!episodeStepValid(episodeStep, episodeForm, episodeAudio)}
                      onClick={() => setEpisodeStep(s => s + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!selectedPodcastId || isSubmittingEpisode || !episodeAudio}
                      startIcon={
                        isSubmittingEpisode ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <UploadFileIcon />
                        )
                      }
                      onClick={() => {
                        const syntheticEvent = {
                          preventDefault: () => {},
                        } as React.FormEvent<HTMLFormElement>;
                        void handleEpisodeSubmit(syntheticEvent);
                      }}
                    >
                      {isSubmittingEpisode ? 'Uploading…' : 'Publish Episode'}
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </Box>

          {/* Right: episodes list */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Episodes
                </Typography>
                <Chip label={`${episodes.length} total`} size="small" variant="outlined" />
              </Stack>
              <Alert severity="info" sx={{ mb: 2 }}>
                Ad markers use podcast midrolls. Paid ad insertion must be enabled on the podcast.
              </Alert>
              {episodes.length === 0 ? (
                <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
                  <MicIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography color="text.secondary">
                    No episodes yet. Publish your first one.
                  </Typography>
                </Stack>
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {episodes.map(episode => (
                    <Box key={episode.id} sx={{ py: 2 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {episode.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
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
                            color={
                              episode.status === 'published'
                                ? 'success'
                                : episode.status === 'scheduled'
                                  ? 'warning'
                                  : 'default'
                            }
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`Transcode: ${episode.processing?.transcode?.status || 'pending'}`}
                            color={
                              episode.processing?.transcode?.status === 'done'
                                ? 'success'
                                : episode.processing?.transcode?.status === 'error'
                                  ? 'error'
                                  : 'warning'
                            }
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Stack spacing={1.25}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                          >
                            <TextField
                              size="small"
                              label="Ad marker"
                              placeholder="00:07:43"
                              value={midrollInputs[episode.id] || ''}
                              onChange={e =>
                                setMidrollInputs(cur => ({ ...cur, [episode.id]: e.target.value }))
                              }
                              sx={{ minWidth: { sm: 160 } }}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={midrollSaving[episode.id]}
                              onClick={() => handleAddMidroll(episode.id)}
                              startIcon={
                                midrollSaving[episode.id] ? (
                                  <CircularProgress size={14} />
                                ) : undefined
                              }
                            >
                              Insert Ad Marker
                            </Button>
                            <Button
                              size="small"
                              disabled={midrollLoading[episode.id]}
                              onClick={() => loadEpisodeMidrolls(episode.id)}
                            >
                              {midrollLoading[episode.id] ? 'Loading…' : 'Load markers'}
                            </Button>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Use HH:MM:SS or MM:SS.
                          </Typography>
                          {(midrollsByEpisode[episode.id] || []).length > 0 && (
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {(midrollsByEpisode[episode.id] || []).map((marker, index) => (
                                <Chip
                                  key={marker.id}
                                  size="small"
                                  variant="outlined"
                                  label={`Ad ${index + 1}: ${formatMarkerTime(marker.start_time_ms)}`}
                                  disabled={midrollDeleting[episode.id] === marker.id}
                                  onDelete={() => handleDeleteMidroll(episode.id, marker.id)}
                                />
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Box>
      )}

      {/* ── PAYOUTS VIEW ────────────────────────────────────────────────── */}
      {activeView === 'payouts' && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Podcast Payouts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Podcast payout and profit data is not exposed by the current Core API.
              </Typography>
            </Box>
            {podcasts.length > 0 && (
              <TextField
                select
                label="Podcast"
                value={selectedPodcastId ?? ''}
                onChange={e => setSelectedPodcastId(Number(e.target.value))}
                fullWidth
                sx={{ maxWidth: 400 }}
              >
                {podcasts.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Official Core API paths currently cover categories, podcasts, episodes, assets,
              collaborators, keywords, roles, chapters, transcripts, soundbites, and midrolls. No
              payout, revenue, earning, monetization, balance, or profit endpoint is available, so
              this app cannot show podcast profit from the API yet.
            </Alert>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {[
                ['Available API payout', 'Not available'],
                ['Profit reporting', 'Not available'],
                ['Status', 'Waiting for API support'],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={800}>
                    {label}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 0.5 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
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
