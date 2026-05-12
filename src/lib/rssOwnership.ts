import { connectToDatabase } from '@/utils/mongodb';

export interface RssPodcastOwnership {
  userId: string;
  rssPodcastId: number;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'rssPodcastOwnership';

export async function getUserPodcastOwnership(userId: string): Promise<RssPodcastOwnership | null> {
  const { db } = await connectToDatabase();
  const ownership = await db.collection<RssPodcastOwnership>(COLLECTION_NAME).findOne({ userId });
  return ownership;
}

export async function getUserPodcastOwnerships(userId: string): Promise<RssPodcastOwnership[]> {
  const { db } = await connectToDatabase();
  return db
    .collection<RssPodcastOwnership>(COLLECTION_NAME)
    .find({ userId })
    .sort({ createdAt: 1 })
    .toArray();
}

export async function listPodcastOwnerships(): Promise<RssPodcastOwnership[]> {
  const { db } = await connectToDatabase();
  return db
    .collection<RssPodcastOwnership>(COLLECTION_NAME)
    .find({})
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function countUserPodcastOwnerships(userId: string): Promise<number> {
  const { db } = await connectToDatabase();
  return db.collection<RssPodcastOwnership>(COLLECTION_NAME).countDocuments({ userId });
}

export async function upsertUserPodcastOwnership(userId: string, rssPodcastId: number) {
  const { db } = await connectToDatabase();
  const now = new Date();

  await db.collection<RssPodcastOwnership>(COLLECTION_NAME).updateOne(
    { userId, rssPodcastId },
    {
      $set: {
        userId,
        rssPodcastId,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

export async function deleteUserPodcastOwnership(userId: string) {
  const { db } = await connectToDatabase();
  await db.collection<RssPodcastOwnership>(COLLECTION_NAME).deleteMany({ userId });
}

export async function deleteUserPodcastOwnershipForPodcast(userId: string, rssPodcastId: number) {
  const { db } = await connectToDatabase();
  await db.collection<RssPodcastOwnership>(COLLECTION_NAME).deleteOne({ userId, rssPodcastId });
}
