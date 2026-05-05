export interface RssCategory {
  id: number;
  label: string;
  localized_label?: string;
}

export interface RssPodcast {
  id: number;
  slug?: string;
  title: string;
  language: string;
  role: string;
  hibernated: boolean;
  cover_url?: string;
  redirect_url?: string;
  timestamp_created: string;
  timestamp_updated: string;
}

export interface RssEpisodeProcessingState {
  status: 'pending' | 'processing' | 'done' | 'error';
  details: string | null;
}

export interface RssEpisode {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'published';
  itunes_explicit?: boolean;
  itunes_episode?: number | null;
  itunes_season?: number | null;
  itunes_episode_type?: 'full' | 'trailer' | 'bonus';
  cover_url?: string;
  audio_url?: string;
  audio_preview_url?: string;
  publish_datetime?: string;
  schedule_datetime?: string | null;
  processing: {
    transcode?: RssEpisodeProcessingState;
    transcribe?: RssEpisodeProcessingState;
  };
  dashboard_url?: string;
  website_url?: string;
  guid: string;
}

export interface RssPresignedUpload {
  id: string;
  url: string;
  asset_type: 'audio' | 'image';
  expected_mime: string;
  filename: string;
}

export interface CreateRssPodcastPayload {
  slug?: string;
  title: string;
  language: string;
  author_name?: string;
  author_email?: string;
  copyright?: string;
  itunes_type: 'episodic' | 'serial';
  itunes_explicit: 'yes' | 'no';
  description: string;
  podcast_locked: boolean;
  podcast_funding?: string | null;
  podcast_funding_label?: string | null;
  custom_link?: string | null;
  itunes_categories_ids: number[];
  cover_upload_id?: string;
}

export interface CreateRssEpisodePayload {
  title: string;
  description: string;
  itunes_explicit?: boolean;
  itunes_episode?: number | null;
  itunes_season?: number | null;
  itunes_episode_type?: 'full' | 'trailer' | 'bonus';
  custom_link?: string | null;
  schedule_datetime?: string | null;
  apple_episode_access_type?: 'PUBLIC' | 'EARLY_ACCESS' | 'PAID_ONLY' | 'AD_FREE';
  ai_content?: boolean | null;
  cover_upload_id?: string | null;
  audio_upload_id?: string;
}
