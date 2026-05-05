export type DspKey =
  | 'spotify'
  | 'apple'
  | 'amazon'
  | 'youtube'
  | 'deezer'
  | 'tidal'
  | 'pandora'
  | 'soundcloud';

export const ALL_DSP_KEYS: DspKey[] = [
  'spotify',
  'apple',
  'amazon',
  'youtube',
  'deezer',
  'tidal',
  'pandora',
  'soundcloud',
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

