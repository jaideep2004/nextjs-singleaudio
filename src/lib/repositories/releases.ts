import { Db, ObjectId } from 'mongodb';
import { getReleaseOwnerQuery } from '@/lib/musicPublishing';
import {
  hydrateReleasesWithCanonicalTracks,
  replaceReleaseCanonicalTracks,
  toObjectId,
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
    status: 'pending',
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
  const projection = options.summary
    ? {
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
        tracks: 1,
        updatedAt: 1,
        createdAt: 1,
      }
    : undefined;

  const releases = await releasesCollection(db)
    .find(query, projection ? { projection } : undefined)
    .sort({ createdAt: -1 })
    .toArray();

  return hydrateReleasesWithCanonicalTracks(db, releases);
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
