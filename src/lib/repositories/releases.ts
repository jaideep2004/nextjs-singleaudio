import { Db, ObjectId, type CreateIndexesOptions, type IndexSpecification } from 'mongodb';
import { getReleaseOwnerQuery } from '@/lib/musicPublishing';
import {
  hydrateReleasesWithCanonicalTracks,
  replaceReleaseCanonicalTracks,
  toObjectId,
  tracksCollection,
  upsertCanonicalTracksFromRelease,
} from '@/lib/repositories/tracks';
import { getDefaultOrganizationIdForUser } from '@/lib/repositories/organizations';

export type ReleaseDocument = Record<string, any> & {
  _id?: ObjectId;
  tracks?: Record<string, any>[];
};

export function releasesCollection(db: Db) {
  return db.collection<ReleaseDocument>('releases');
}

let releaseIndexesReady: Promise<void> | null = null;

export async function ensureReleaseIndexes(db: Db) {
  if (!releaseIndexesReady) {
    const collection = releasesCollection(db);
    releaseIndexesReady = (async () => {
      const existingKeys = new Set((await collection.indexes()).map((index) => JSON.stringify(index.key)));
      const desiredIndexes: Array<{ key: IndexSpecification; options: CreateIndexesOptions }> = [
        { key: { createdAt: -1 }, options: { name: 'releases_created_desc' } },
        { key: { updatedAt: -1 }, options: { name: 'releases_updated_desc' } },
        { key: { status: 1, createdAt: -1 }, options: { name: 'releases_status_created' } },
        { key: { status: 1, updatedAt: -1 }, options: { name: 'releases_status_updated' } },
        { key: { ownerUserId: 1, createdAt: -1 }, options: { name: 'releases_owner_created' } },
        { key: { userId: 1, createdAt: -1 }, options: { name: 'releases_user_created' } },
        { key: { organizationId: 1, createdAt: -1 }, options: { name: 'releases_org_created', sparse: true } },
        { key: { ownerId: 1, createdAt: -1 }, options: { name: 'releases_ownerId_created', sparse: true } },
        { key: { releaseType: 1, status: 1 }, options: { name: 'releases_type_status', sparse: true } },
        { key: { upc: 1 }, options: { name: 'releases_upc', sparse: true } },
        { key: { releaseTitle: 1 }, options: { name: 'releases_title', sparse: true } },
        { key: { primaryArtist: 1 }, options: { name: 'releases_artist', sparse: true } },
        { key: { stores: 1 }, options: { name: 'releases_stores', sparse: true } },
        { key: { 'dspDeliveries.providerKey': 1, status: 1 }, options: { name: 'releases_dsp_status', sparse: true } },
      ];

      await Promise.all(
        desiredIndexes
          .filter((index) => !existingKeys.has(JSON.stringify(index.key)))
          .map((index) => collection.createIndex(index.key, index.options))
      );
    })();
  }

  await releaseIndexesReady;
}

export function legacyTrackSnapshotsEnabled() {
  return process.env.FREEZE_LEGACY_RELEASE_TRACKS !== 'true';
}

export function withOptionalLegacyTrackSnapshot(
  update: Record<string, any>,
  tracks: Record<string, any>[]
) {
  return legacyTrackSnapshotsEnabled() ? { ...update, tracks } : update;
}

export async function createRelease(
  db: Db,
  payload: Record<string, any>,
  user: { _id: string; email?: string; name?: string; artistName?: string }
) {
  const now = new Date();
  const ownerUserId = String(user._id);
  const organizationId = payload.organizationId || await getDefaultOrganizationIdForUser(db, user);

  const release = {
    ...payload,
    organizationId,
    ownerUserId,
    userId: ownerUserId,
    artistId: ownerUserId,
    ownerEmail: user.email,
    ownerName: user.name,
    ownerArtistName: user.artistName || user.name,
    createdAt: now,
    updatedAt: now,
    status: 'pending_review',
  };

  const result = await releasesCollection(db).insertOne(release as ReleaseDocument);
  await upsertCanonicalTracksFromRelease(db, { ...release, _id: result.insertedId });

  return result;
}

export async function findReleaseByIdRaw(db: Db, id: string | ObjectId) {
  const _id = toObjectId(id);
  if (!_id) return null;
  return releasesCollection(db).findOne({ _id });
}

export async function findReleaseByIdWithTracks(db: Db, id: string | ObjectId) {
  const release = await findReleaseByIdRaw(db, id);
  if (!release) return null;
  const [hydrated] = await hydrateReleasesWithCanonicalTracks(db, [release]);
  return hydrated;
}

export async function listReleasesWithTracks(
  db: Db,
  query: Record<string, any>,
  options: { summary?: boolean } = {}
) {
  await ensureReleaseIndexes(db);

  if (options.summary) {
    return listReleaseSummaries(db, query);
  }

  const releases = await releasesCollection(db)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return hydrateReleasesWithCanonicalTracks(db, releases);
}

async function listReleaseSummaries(db: Db, query: Record<string, any>) {
  const releases = await releasesCollection(db)
    .aggregate<Record<string, any>>([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          releaseTitle: 1,
          title: 1,
          releaseType: 1,
          status: 1,
          releaseDate: 1,
          originalReleaseDate: 1,
          label: 1,
          upc: 1,
          ownerUserId: 1,
          organizationId: 1,
          userId: 1,
          artistId: 1,
          ownerId: 1,
          createdBy: 1,
          ownerName: 1,
          ownerArtistName: 1,
          ownerEmail: 1,
          primaryArtist: 1,
          artist: 1,
          territories: 1,
          artworkUrl: 1,
          stores: 1,
          updatedAt: 1,
          createdAt: 1,
          legacyTrackCount: {
            $cond: [{ $isArray: '$tracks' }, { $size: '$tracks' }, 0],
          },
        },
      },
    ])
    .toArray();

  const releaseIds = releases
    .map((release) => toObjectId(release._id))
    .filter((value): value is ObjectId => Boolean(value));

  const canonicalCounts = releaseIds.length
    ? await tracksCollection(db)
        .aggregate<{ _id: ObjectId; count: number }>([
          {
            $match: {
              releaseId: { $in: releaseIds },
              deletedAt: { $exists: false },
              source: 'release_embed',
            },
          },
          { $group: { _id: '$releaseId', count: { $sum: 1 } } },
        ])
        .toArray()
    : [];

  const countsByReleaseId = new Map(
    canonicalCounts.map((row) => [row._id.toHexString(), row.count])
  );

  return releases.map((release) => {
    const releaseId = String(release._id);
    const { legacyTrackCount, ...summary } = release;
    return {
      ...summary,
      ownerUserId: release.ownerUserId || release.userId || release.artistId || release.ownerId || release.createdBy,
      trackCount: countsByReleaseId.get(releaseId) ?? Number(legacyTrackCount || 0),
    };
  });
}

export async function listApprovedReleasesForPublishing(db: Db) {
  const releases = await releasesCollection(db)
    .find(
      { status: 'approved' },
      {
        projection: {
          releaseTitle: 1,
          title: 1,
          releaseType: 1,
          status: 1,
          releaseDate: 1,
          originalReleaseDate: 1,
          label: 1,
          upc: 1,
          ownerUserId: 1,
          organizationId: 1,
          userId: 1,
          artistId: 1,
          ownerName: 1,
          ownerArtistName: 1,
          ownerEmail: 1,
          primaryArtist: 1,
          territories: 1,
          stores: 1,
          tracks: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  return hydrateReleasesWithCanonicalTracks(db, releases);
}

export async function updateReleaseTracksSnapshot(
  db: Db,
  release: ReleaseDocument & { _id: ObjectId },
  tracks: Record<string, any>[],
  update: Record<string, any> = {}
) {
  await replaceReleaseCanonicalTracks(db, release, tracks);
  return releasesCollection(db).findOneAndUpdate(
    { _id: release._id },
    {
      $set: {
        ...update,
        ...(legacyTrackSnapshotsEnabled() ? { tracks } : {}),
        updatedAt: update.updatedAt || new Date(),
      },
    },
    { returnDocument: 'after' }
  );
}

export { getReleaseOwnerQuery };
