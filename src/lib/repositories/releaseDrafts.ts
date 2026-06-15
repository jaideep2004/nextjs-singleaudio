import { Db, ObjectId } from 'mongodb';

export type ReleaseDraftDocument = {
  _id?: ObjectId;
  ownerUserId: string;
  draft: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export function releaseDraftsCollection(db: Db) {
  return db.collection<ReleaseDraftDocument>('releaseDrafts');
}

export async function getReleaseDraftForUser(db: Db, ownerUserId: string) {
  return releaseDraftsCollection(db).findOne({ ownerUserId });
}

export async function upsertReleaseDraftForUser(
  db: Db,
  ownerUserId: string,
  draft: Record<string, any>
) {
  const now = new Date();
  return releaseDraftsCollection(db).findOneAndUpdate(
    { ownerUserId },
    {
      $set: {
        ownerUserId,
        draft,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function deleteReleaseDraftForUser(db: Db, ownerUserId: string) {
  return releaseDraftsCollection(db).deleteOne({ ownerUserId });
}
