import { Db } from 'mongodb';
import { validateReleaseAssetsForDelivery } from './dspAssetReadiness';

type ReleaseLike = Record<string, any> & {
  stores?: string[];
  tracks?: Array<Record<string, any>>;
};

type BromaReadiness = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  outletIds: string[];
  outletMappings: Array<{ store: string; outletId: string; name: string }>;
  assetReadiness: Awaited<ReturnType<typeof validateReleaseAssetsForDelivery>>;
};

const normalize = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();

function getContributors(track: Record<string, any>) {
  const values = [
    track.contributors,
    track.composers,
    track.lyricists,
    track.publishers,
    track.rightsHolders,
    track.metadata?.contributors,
    track.metadata?.composers,
  ];
  return values.flatMap((value) => (Array.isArray(value) ? value : []));
}

function getContributorShare(contributor: Record<string, any>) {
  const raw = contributor.share ?? contributor.percentage ?? contributor.ownership ?? contributor.split;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function hasRole(contributors: Array<Record<string, any>>, names: string[]) {
  return contributors.some((contributor) => {
    const role = normalize(contributor.role || contributor.type || contributor.category);
    return names.some((name) => role.includes(name));
  });
}

async function mapOutlets(db: Db, stores: string[]) {
  const normalizedStores = stores.map(normalize).filter(Boolean);
  if (!normalizedStores.length) return { mappings: [], missing: stores };

  const docs = await db
    .collection('bromaOutlets')
    .find({
      active: true,
      $or: [
        { normalizedName: { $in: normalizedStores } },
        { aliases: { $in: normalizedStores } },
      ],
    })
    .toArray();

  const byKey = new Map<string, any>();
  docs.forEach((doc) => {
    byKey.set(doc.normalizedName, doc);
    (doc.aliases || []).forEach((alias: string) => byKey.set(alias, doc));
  });

  const mappings = stores.flatMap((store) => {
    const doc = byKey.get(normalize(store));
    return doc ? [{ store, outletId: String(doc.outletId), name: String(doc.name || store) }] : [];
  });
  const mappedStores = new Set(mappings.map((mapping) => normalize(mapping.store)));
  const missing = stores.filter((store) => !mappedStores.has(normalize(store)));
  return { mappings, missing };
}

function validateTrackComposition(track: Record<string, any>, index: number) {
  const errors: string[] = [];
  const contributors = getContributors(track).filter(
    (contributor): contributor is Record<string, any> => contributor && typeof contributor === 'object'
  );

  if (!contributors.length) {
    errors.push(`Track ${index + 1}: composition/contributor data is required`);
    return errors;
  }

  if (!hasRole(contributors, ['composer', 'author', 'writer', 'c/a', 'ca'])) {
    errors.push(`Track ${index + 1}: composer/author contributor is required`);
  }

  const totalShare = contributors.reduce((sum, contributor) => sum + getContributorShare(contributor), 0);
  if (Math.abs(totalShare - 100) > 0.01) {
    errors.push(`Track ${index + 1}: contributor ownership shares must total 100%`);
  }

  return errors;
}

export async function evaluateBromaReleaseReadiness(db: Db, release: ReleaseLike): Promise<BromaReadiness> {
  const tracks = Array.isArray(release.tracks) ? release.tracks : [];
  const stores = Array.isArray(release.stores) ? release.stores.filter(Boolean) : [];
  const assetReadiness = await validateReleaseAssetsForDelivery(release);
  const errors: string[] = [...assetReadiness.errors];
  const warnings: string[] = [...assetReadiness.warnings];

  if (!firstString(release.releaseTitle, release.title)) errors.push('Release title is required');
  if (!firstString(release.primaryArtist, release.artist, release.artistName)) errors.push('Primary artist is required');
  if (!firstString(release.upc, release.ean)) errors.push('UPC/EAN is required');
  if (!firstString(release.genre)) errors.push('Release genre is required');
  if (!firstString(release.releaseDate, release.originalReleaseDate)) errors.push('Release date is required');
  if (!tracks.length) errors.push('At least one track is required');

  if (tracks.length === 1 && String(release.releaseType || '').toLowerCase().includes('album')) {
    errors.push('Album release type requires at least two tracks');
  }
  if (tracks.length > 40) errors.push('Broma album/compilation releases support at most 40 tracks');

  tracks.forEach((track, index) => {
    if (!firstString(track.title, track.name)) errors.push(`Track ${index + 1}: title is required`);
    if (!firstString(track.artistName, track.primaryArtist, release.primaryArtist)) {
      errors.push(`Track ${index + 1}: artist is required`);
    }
    if (!firstString(track.isrc)) errors.push(`Track ${index + 1}: ISRC is required`);
    if (!firstString(track.audioFile, track.audioUrl, track.fileUrl)) errors.push(`Track ${index + 1}: audio is required`);
    errors.push(...validateTrackComposition(track, index));
  });

  const outletResult = await mapOutlets(db, stores);
  if (!stores.length) errors.push('At least one DSP outlet must be selected');
  outletResult.missing.forEach((store) => {
    errors.push(`Broma outlet mapping missing or inactive for "${store}"`);
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    outletIds: outletResult.mappings.map((mapping) => mapping.outletId),
    outletMappings: outletResult.mappings,
    assetReadiness,
  };
}

export async function assertBromaReleaseReady(db: Db, release: ReleaseLike) {
  const readiness = await evaluateBromaReleaseReadiness(db, release);
  if (!readiness.ok) {
    const error = new Error(`Broma readiness failed: ${readiness.errors.join('; ')}`);
    (error as any).statusCode = 422;
    (error as any).readiness = readiness;
    throw error;
  }
  return readiness;
}
