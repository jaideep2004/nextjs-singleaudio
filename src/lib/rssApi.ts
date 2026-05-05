import {
  CreateRssEpisodePayload,
  CreateRssPodcastPayload,
  RssCategory,
  RssEpisode,
  RssPodcast,
  RssPresignedUpload,
} from '@/types/rss';

const RSS_API_BASE_URL = process.env.RSS_API_BASE_URL || 'https://api.rss.com';

class RssApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'RssApiError';
    this.status = status;
    this.details = details;
  }
}

const getApiKey = () => {
  const apiKey = process.env.RSS_API_KEY;

  if (!apiKey) {
    throw new RssApiError(
      'RSS_API_KEY is not configured. Add it to your environment before using the podcast integration.',
      500
    );
  }

  return apiKey;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    let message: string | null =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : null;

    if (!message && data && typeof data === 'object') {
      const formErrors =
        'form_errors' in data && Array.isArray(data.form_errors)
          ? data.form_errors.filter((value: unknown): value is string => typeof value === 'string')
          : [];

      const fieldErrors =
        'field_errors' in data && data.field_errors && typeof data.field_errors === 'object'
          ? Object.entries(data.field_errors as Record<string, unknown>)
              .flatMap(([field, value]: [string, unknown]) =>
                Array.isArray(value)
                  ? value
                      .filter((entry: unknown): entry is string => typeof entry === 'string')
                      .map((entry: string) => `${field}: ${entry}`)
                  : []
              )
          : [];

      const combinedErrors = [...formErrors, ...fieldErrors];
      if (combinedErrors.length > 0) {
        message = combinedErrors.join(' ');
      }
    }

    message = message || `RSS API request failed with status ${response.status}`;

    if (
      response.status === 402 ||
      /active subscription|requires an active subscription|payment/i.test(message)
    ) {
      message =
        'RSS.com rejected podcast creation for the configured RSS_API_KEY because this feature requires an active subscription or payment. ' +
        'The API key can still be valid for reading the workspace, so verify billing status and that the key belongs to the intended paid workspace with podcast-creation access.';
    }

    throw new RssApiError(message, response.status, data);
  }

  return data as T;
}

async function rssFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('X-Api-Key', getApiKey());

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${RSS_API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  return parseResponse<T>(response);
}

export const rssApi = {
  getCategories() {
    return rssFetch<RssCategory[]>('/v4/categories');
  },

  getPodcasts() {
    return rssFetch<RssPodcast[]>('/v4/podcasts');
  },

  getPodcast(podcastId: number | string) {
    return rssFetch<RssPodcast>(`/v4/podcasts/${podcastId}`);
  },

  createPodcast(payload: CreateRssPodcastPayload) {
    const createPayload = { ...payload };
    delete createPayload.cover_upload_id;

    return rssFetch<RssPodcast>('/v4/podcasts', {
      method: 'POST',
      body: JSON.stringify(createPayload),
    });
  },

  updatePodcast(podcastId: number | string, payload: Record<string, unknown>) {
    return rssFetch<RssPodcast>(`/v4/podcasts/${podcastId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getEpisodes(podcastId: number | string) {
    return rssFetch<RssEpisode[]>(`/v4/podcasts/${podcastId}/episodes`);
  },

  async getPodcastAnalytics(podcastId: number | string, query?: Record<string, string | number>) {
    // RSS.com Core API v4 currently does not expose podcast analytics endpoints.
    // Docs note analytics are only available in the RSS.com dashboard UI.
    // Keep function for future API additions.
    void podcastId;
    void query;
    throw new RssApiError(
      'RSS.com API does not provide podcast analytics. Analytics are currently only available through the RSS.com dashboard.',
      501
    );
  },

  createEpisode(podcastId: number | string, payload: CreateRssEpisodePayload) {
    return rssFetch<RssEpisode>(`/v4/podcasts/${podcastId}/episodes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createPresignedUpload(
    podcastId: number | string,
    payload: { asset_type: 'audio' | 'image'; expected_mime: string; filename: string }
  ) {
    return rssFetch<RssPresignedUpload>(`/v4/podcasts/${podcastId}/assets/presigned-uploads`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export { RssApiError };
