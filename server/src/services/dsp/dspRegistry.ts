import { DspConnector, DspCapability } from '../../types/dsp';
import { GenericAudioConnector } from './connectors/genericAudioConnector';
import { ApiConnector } from './connectors/apiConnector';

const createConnector = (key: string, displayName: string, capabilities?: DspCapability[]): DspConnector =>
  new GenericAudioConnector(key, displayName, capabilities);

const createApiConnector = (
  key: string,
  displayName: string,
  capabilities: DspCapability[],
  requiredCredentialKeys: string[],
  deliveryPath: string
): DspConnector =>
  new ApiConnector({
    key,
    displayName,
    capabilities,
    requiredCredentialKeys,
    deliveryPath,
  });

const CONNECTORS: Record<string, DspConnector> = {
  spotify: createApiConnector('spotify', 'Spotify', ['audio_delivery', 'reporting'], ['clientId', 'clientSecret'], '/v1/deliveries'),
  apple_music: createApiConnector('apple_music', 'Apple Music', ['audio_delivery', 'reporting'], ['issuerId', 'privateKey'], '/v1/catalog/deliveries'),
  amazon_music: createApiConnector('amazon_music', 'Amazon Music', ['audio_delivery', 'reporting'], ['apiKey', 'apiSecret'], '/v1/releases'),
  deezer: createApiConnector('deezer', 'Deezer', ['audio_delivery', 'reporting'], ['apiKey'], '/v1/ingest/releases'),
  soundcloud: createApiConnector('soundcloud', 'SoundCloud', ['audio_delivery', 'reporting'], ['clientId', 'clientSecret'], '/v1/distribution/releases'),
  tidal: createApiConnector('tidal', 'TIDAL', ['audio_delivery', 'reporting'], ['apiKey', 'apiSecret'], '/v2/catalog/releases'),
  pandora: createConnector('pandora', 'Pandora'),
  iheartradio: createConnector('iheartradio', 'iHeartRadio'),
  anghami: createConnector('anghami', 'Anghami'),
  audiomack: createConnector('audiomack', 'Audiomack'),
  awa: createConnector('awa', 'AWA'),
  boomplay: createConnector('boomplay', 'Boomplay'),
  imusica: createConnector('imusica', 'iMusica'),
  jiosaavn: createConnector('jiosaavn', 'JioSaavn'),
  kkbox: createConnector('kkbox', 'KKBox'),
  mixcloud: createConnector('mixcloud', 'Mixcloud'),
  netease_cloud_music: createConnector('netease_cloud_music', 'NetEase Cloud Music'),
  qobuz: createConnector('qobuz', 'Qobuz'),
  touchtunes: createConnector('touchtunes', 'TouchTunes'),
  trebel: createConnector('trebel', 'Trebel'),
  tuned_global: createConnector('tuned_global', 'Tuned Global'),
  hungama_music: createConnector('hungama_music', 'Hungama Music'),
  wynk_music: createConnector('wynk_music', 'Wynk Music'),
  gaana: createConnector('gaana', 'Gaana'),
  seven_digital: createConnector('seven_digital', '7digital'),
  youtube_music: createApiConnector(
    'youtube_music',
    'YouTube Music',
    ['audio_delivery', 'video_delivery', 'reporting'],
    ['clientId', 'clientSecret'],
    '/youtube/v1/music/releases'
  ),
  youtube_content_id: createApiConnector(
    'youtube_content_id',
    'YouTube Content ID',
    ['rights_management', 'fingerprinting', 'reporting'],
    ['clientId', 'clientSecret'],
    '/youtube/v1/content-id/assets'
  ),
  youtube_music_video: createApiConnector(
    'youtube_music_video',
    'YouTube Music Video',
    ['video_delivery', 'reporting'],
    ['clientId', 'clientSecret'],
    '/youtube/v1/music-videos'
  ),
  youtube_art_track: createApiConnector(
    'youtube_art_track',
    'YouTube Art Track',
    ['audio_delivery', 'reporting'],
    ['clientId', 'clientSecret'],
    '/youtube/v1/art-tracks'
  ),
  facebook_audio_library: createConnector('facebook_audio_library', 'Facebook Audio Library', ['rights_management', 'reporting']),
  facebook_rights_manager: createConnector('facebook_rights_manager', 'Facebook Rights Manager', ['rights_management', 'fingerprinting', 'reporting']),
  instagram: createConnector('instagram', 'Instagram', ['rights_management', 'reporting']),
  whatsapp: createConnector('whatsapp', 'WhatsApp', ['rights_management', 'reporting']),
  snapchat: createConnector('snapchat', 'Snapchat', ['rights_management', 'reporting']),
  tiktok: createApiConnector(
    'tiktok',
    'TikTok',
    ['audio_delivery', 'rights_management', 'reporting'],
    ['clientId', 'clientSecret'],
    '/v1/music/assets'
  ),
  resso: createConnector('resso', 'Resso', ['audio_delivery', 'reporting']),
  acrcloud: createConnector('acrcloud', 'ACRCloud', ['fingerprinting', 'reporting']),
  audible_magic: createConnector('audible_magic', 'Audible Magic', ['fingerprinting', 'rights_management', 'reporting']),
  jaxsta: createConnector('jaxsta', 'Jaxsta', ['reporting']),
  audio_fingerprinting: createConnector('audio_fingerprinting', 'Audio Fingerprinting', ['fingerprinting', 'reporting']),
};

export const dspRegistry = {
  get(providerKey: string): DspConnector {
    const connector = CONNECTORS[providerKey];
    if (!connector) {
      throw new Error(`Unsupported DSP connector: ${providerKey}`);
    }
    return connector;
  },
  list(): DspConnector[] {
    return Object.values(CONNECTORS);
  },
};
