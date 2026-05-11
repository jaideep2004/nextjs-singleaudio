export type DspKey = string;

export const ALL_DSP_KEYS: DspKey[] = [
  'spotify',
  'apple',
  'amazon',
  'youtube',
  'deezer',
  'tidal',
  'pandora',
  'soundcloud',
  'facebook',
  'instagram',
  'tiktok',
  'snapchat',
  'audiomack',
  'boomplay',
  'joox',
  'anghami',
  'iheartradio',
  'napster',
  'qobuz',
  'kkbox',
  'netease',
  'tencent',
  'kuwo',
  'kugou',
  'resso',
  'gaana',
  'jiosaavn',
  'wynk',
  'hungama',
  'yandex',
  'vk',
  'awa',
  'line',
  'melon',
  'genie',
  'flo',
  'bugs',
  'zvuk',
  'boom',
  'unitedmedia',
  'peloton',
];

export interface DspMeta {
  key: DspKey;
  name: string;
  logo: string;
  info: string;
}

export const DSP_META: DspMeta[] = [
  {
    key: 'spotify',
    name: 'Spotify',
    logo: '/images/dsp/spotify.png',
    info: "World's largest streaming service.",
  },
  {
    key: 'apple',
    name: 'Apple Music',
    logo: '/images/dsp/applemusic.png',
    info: "Apple's music streaming.",
  },
  {
    key: 'amazon',
    name: 'Amazon Music',
    logo: '/images/dsp/amazonmusic.png',
    info: "Amazon's music streaming.",
  },
  {
    key: 'youtube',
    name: 'YouTube Music',
    logo: '/images/dsp/ytmusic.png',
    info: "Google's streaming platform.",
  },
  {
    key: 'deezer',
    name: 'Deezer',
    logo: '/images/dsp/deezer.png',
    info: 'Popular in Europe.',
  },
  {
    key: 'tidal',
    name: 'Tidal',
    logo: '/images/dsp/tidal.png',
    info: 'High-fidelity audio.',
  },
  {
    key: 'pandora',
    name: 'Pandora',
    logo: '/images/dsp/pandora.png',
    info: 'US-based streaming.',
  },
  {
    key: 'soundcloud',
    name: 'SoundCloud',
    logo: '/images/dsp/soundcloud.png',
    info: 'Indie & creators.',
  },
  { key: 'facebook', name: 'Facebook Audio Library', logo: '', info: 'Meta music usage across Facebook surfaces.' },
  { key: 'instagram', name: 'Instagram Music', logo: '', info: 'Music for reels, stories, and creator tools.' },
  { key: 'tiktok', name: 'TikTok Music Library', logo: '', info: 'Short-form discovery and creator sounds.' },
  { key: 'snapchat', name: 'Snapchat Sounds', logo: '', info: 'Music for snaps and spotlight content.' },
  { key: 'audiomack', name: 'Audiomack', logo: '', info: 'Streaming platform for emerging and global catalog.' },
  { key: 'boomplay', name: 'Boomplay', logo: '', info: 'Major African music streaming platform.' },
  { key: 'joox', name: 'JOOX', logo: '', info: 'Streaming across Southeast Asia and South Africa.' },
  { key: 'anghami', name: 'Anghami', logo: '', info: 'Middle East and North Africa streaming.' },
  { key: 'iheartradio', name: 'iHeartRadio', logo: '', info: 'Radio, playlists, and streaming distribution.' },
  { key: 'napster', name: 'Napster', logo: '', info: 'Subscription music streaming service.' },
  { key: 'qobuz', name: 'Qobuz', logo: '', info: 'Hi-res streaming and download store.' },
  { key: 'kkbox', name: 'KKBOX', logo: '', info: 'East and Southeast Asian music platform.' },
  { key: 'netease', name: 'NetEase Cloud Music', logo: '', info: 'Chinese music streaming and community.' },
  { key: 'tencent', name: 'Tencent Music', logo: '', info: 'QQ Music, Kugou, Kuwo ecosystem access.' },
  { key: 'kuwo', name: 'Kuwo Music', logo: '', info: 'Chinese streaming destination.' },
  { key: 'kugou', name: 'Kugou Music', logo: '', info: 'Chinese music streaming platform.' },
  { key: 'resso', name: 'Resso', logo: '', info: 'Social music streaming service.' },
  { key: 'gaana', name: 'Gaana', logo: '', info: 'Indian music and podcast streaming.' },
  { key: 'jiosaavn', name: 'JioSaavn', logo: '', info: 'Indian and international catalog streaming.' },
  { key: 'wynk', name: 'Wynk Music', logo: '', info: 'Indian telecom-linked music streaming.' },
  { key: 'hungama', name: 'Hungama Music', logo: '', info: 'Indian digital music and entertainment.' },
  { key: 'yandex', name: 'Yandex Music', logo: '', info: 'Streaming across Yandex markets.' },
  { key: 'vk', name: 'VK Music', logo: '', info: 'Social music platform for VK users.' },
  { key: 'awa', name: 'AWA', logo: '', info: 'Japanese music streaming service.' },
  { key: 'line', name: 'LINE Music', logo: '', info: 'Music streaming for LINE markets.' },
  { key: 'melon', name: 'Melon', logo: '', info: 'South Korean music streaming leader.' },
  { key: 'genie', name: 'Genie Music', logo: '', info: 'South Korean streaming and charts.' },
  { key: 'flo', name: 'FLO', logo: '', info: 'South Korean music streaming platform.' },
  { key: 'bugs', name: 'Bugs!', logo: '', info: 'South Korean music service.' },
  { key: 'zvuk', name: 'Zvuk', logo: '', info: 'Music streaming for CIS markets.' },
  { key: 'boom', name: 'BOOM', logo: '', info: 'Social and regional music streaming.' },
  { key: 'unitedmedia', name: 'United Media Agency', logo: '', info: 'Additional delivery partner network.' },
  { key: 'peloton', name: 'Peloton', logo: '', info: 'Fitness and workout music usage.' },
];

export const DSP_META_BY_KEY: Record<DspKey, DspMeta> = Object.fromEntries(
  DSP_META.map((meta) => [meta.key, meta])
) as Record<DspKey, DspMeta>;

export function sanitizeDspKeys(input: unknown): DspKey[] {
  if (!Array.isArray(input)) return ALL_DSP_KEYS;
  const allowed = new Set(ALL_DSP_KEYS);
  const out: DspKey[] = [];
  for (const v of input) {
    if (typeof v === 'string' && allowed.has(v as DspKey)) out.push(v as DspKey);
  }
  // if admin clears all, we respect empty list (user sees none)
  return Array.from(new Set(out));
}
