import crypto from 'crypto';
import { Db, ObjectId } from 'mongodb';
import { validateReleaseAssetsForDelivery } from './dspAssetReadiness';
import { evaluateBromaReleaseReadiness } from './bromaDeliveryReadiness';
import { hydrateReleasesWithCanonicalTracks } from '@/lib/repositories/tracks';
import { releasesCollection } from '@/lib/repositories/releases';

type ReleaseDoc = Record<string, any> & {
  _id: ObjectId;
  releaseTitle?: string;
  title?: string;
  stores?: string[];
  tracks?: Array<Record<string, any>>;
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const sha256 = (value: unknown) =>
  crypto.createHash('sha256').update(stableStringify(value)).digest('hex');

function buildSnapshot(release: ReleaseDoc, providerKeys: string[], createdBy?: string) {
  const tracks = Array.isArray(release.tracks) ? release.tracks : [];
  const assetChecks = release.deliveryAssetReadiness?.checks || [];
  const bromaReadiness = release.bromaReadiness || {};
  const releaseGenre = release.genre || release.metadata?.genre || tracks[0]?.genre || tracks[0]?.metadata?.genre;
  const payload = {
    releaseId: release._id.toString(),
    releaseTitle: release.releaseTitle || release.title || 'Untitled release',
    upc: release.upc,
    primaryArtist: release.primaryArtist || release.artist || release.artistName,
    label: release.label,
    genre: releaseGenre,
    language: release.language,
    releaseDate: release.releaseDate,
    stores: Array.isArray(release.stores) ? release.stores : [],
    tracks: tracks.map((track) => ({
      id: String(track._id || track.id || track.isrc || track.title || ''),
      title: track.title,
      artistName: track.artistName || track.primaryArtist || release.primaryArtist,
      isrc: track.isrc,
      upc: track.upc || release.upc,
      genre: track.genre,
      explicit: track.explicit,
      audioFile: track.audioUrl || track.fileUrl || track.audioFile,
      artwork: track.artworkUrl || track.artwork || release.artworkUrl || release.artwork || release.coverArt,
      duration: track.duration,
      contributors: track.contributors || track.rightsHolders || [],
      composers: track.composers || [],
      lyricists: track.lyricists || [],
      publishers: track.publishers || [],
    })),
    territories: release.territories || ['WORLD'],
    assetChecks: assetChecks.map((check: any) => ({
      kind: check.kind,
      owner: check.owner,
      value: check.value,
      sizeBytes: check.sizeBytes,
      checksumSha256: check.checksumSha256,
    })),
    metadata: {
      artwork: release.artworkUrl || release.artwork || release.coverArt,
      releaseType: release.releaseType,
      pline: release.pline || release.pLine,
      cline: release.cline || release.cLine,
      bromaOutletIds: bromaReadiness.outletIds || [],
      bromaOutletMappings: bromaReadiness.outletMappings || [],
    },
  };

  return {
    releaseId: release._id,
    version: 1,
    providerKeys,
    payload,
    payloadHash: sha256(payload),
    createdBy,
    createdAt: new Date(),
  };
}

function evaluateNativeProviderReadiness(provider: any) {
  if (!provider || provider.enabled === false || provider.maintenanceMode) {
    return { state: 'paused', canDispatch: false, missing: [] };
  }

  const integrationMode = provider.integrationMode || provider.config?.integrationMode || 'shell';
  if (integrationMode === 'shell') {
    return {
      state: 'shell_ready',
      canDispatch: false,
      missing: ['partner_contract', 'credentials', 'delivery_endpoint', 'webhook_secret'],
    };
  }

  const config = provider.config || {};
  const hasEncryptedCredential = (key: string) =>
    Boolean(provider.credentials?.__encrypted && provider.credentials?.values?.[key]);
  const requiredConfig = provider.key === 'mock_dsp'
    ? ['webhookSecret']
    : provider.key === 'broma'
      ? ['baseUrl', 'accountId']
      : ['baseUrl', 'webhookSecret'];
  const requiredCredentials = provider.key === 'broma' ? ['email', 'password'] : [];
  const missing = [
    ...requiredConfig.filter((key) => {
      if (key === 'webhookSecret') return !config[key] && !hasEncryptedCredential('webhookSecret');
      return !config[key];
    }),
    ...requiredCredentials.filter((key) => !hasEncryptedCredential(key)),
  ];
  if (missing.length > 0) {
    return { state: 'missing_credentials', canDispatch: false, missing };
  }

  return {
    state: integrationMode === 'live' ? 'live_ready' : 'sandbox_ready',
    canDispatch: true,
    missing: [],
  };
}

export async function createReleaseDeliveryShellJobs(db: Db, release: ReleaseDoc, createdBy?: string) {
  const [releaseForDelivery] = await hydrateReleasesWithCanonicalTracks(db, [release]);
  release = releaseForDelivery;
  const rawStores = Array.isArray(release.stores) ? release.stores : [];
  if (rawStores.length === 0) {
    return { snapshotId: null, jobsCreated: 0, providerKeys: [], blocked: true };
  }
  const providerKeys = ['broma'];

  const assetReadiness = await validateReleaseAssetsForDelivery(release);
  const bromaReadiness = await evaluateBromaReleaseReadiness(db, release);
  await releasesCollection(db).updateOne(
    { _id: release._id },
    {
      $set: {
        deliveryAssetReadiness: assetReadiness,
        bromaReadiness,
        deliveryReadinessCheckedAt: new Date(),
      },
    }
  );

  if (!assetReadiness.ok || !bromaReadiness.ok) {
    return {
      snapshotId: null,
      jobsCreated: 0,
      providerKeys,
      blocked: true,
      assetReadiness,
      bromaReadiness,
    };
  }

  release.deliveryAssetReadiness = assetReadiness;
  release.bromaReadiness = bromaReadiness;
  const snapshot = buildSnapshot(release, providerKeys, createdBy);
  const snapshotResult = await db.collection('releaseDeliverySnapshots').insertOne(snapshot);
  const providers = await db
    .collection('dspproviders')
    .find({ key: { $in: providerKeys } })
    .toArray();
  const providerMap = new Map(providers.map((provider) => [provider.key, provider]));
  const now = new Date();

  const jobs = providerKeys.map((providerKey) => {
    const provider = providerMap.get(providerKey);
    const readiness = evaluateNativeProviderReadiness(provider);
    const state = readiness.canDispatch ? 'queued' : 'needs_attention';
    const idempotencyKey = sha256({
      releaseId: release._id.toString(),
      providerKey,
      operation: 'deliver',
      payloadHash: snapshot.payloadHash,
    });

    return {
      targetType: 'release',
      releaseId: release._id,
      snapshotId: snapshotResult.insertedId,
      providerKey,
      operation: 'deliver',
      state,
      priority: 5,
      idempotencyKey,
      maxRetries: 5,
      retryCount: 0,
      nextRetryAt: now,
      deadLettered: false,
      metadata: {
        releaseTitle: snapshot.payload.releaseTitle,
        payloadHash: snapshot.payloadHash,
        bromaStep: 'create_release',
        bromaOutletIds: bromaReadiness.outletIds,
        bromaOutletMappings: bromaReadiness.outletMappings,
        readiness,
        deliverySnapshot: {
          upc: snapshot.payload.upc,
          trackCount: snapshot.payload.tracks.length,
        },
      },
      errorMessage: readiness.canDispatch ? undefined : `Provider not ready: ${readiness.state}`,
      attempts: [],
      events: [
        {
          state,
          message: readiness.canDispatch
            ? 'Release delivery job created from approval snapshot'
            : `Release delivery shell waiting for: ${readiness.missing.join(', ') || readiness.state}`,
          source: 'system',
          createdAt: now,
        },
      ],
      createdBy: createdBy && ObjectId.isValid(createdBy) ? new ObjectId(createdBy) : undefined,
      createdAt: now,
      updatedAt: now,
    };
  });

  if (jobs.length > 0) {
    await db.collection('deliveryjobs').bulkWrite(
      jobs.map((job) => ({
        updateOne: {
          filter: { idempotencyKey: job.idempotencyKey },
          update: { $setOnInsert: job },
          upsert: true,
        },
      }))
    );
  }

  return { snapshotId: snapshotResult.insertedId, jobsCreated: jobs.length, providerKeys };
}
