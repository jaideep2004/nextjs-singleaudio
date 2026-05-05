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

export async function upsertUserPodcastOwnership(userId: string, rssPodcastId: number) {
  const { db } = await connectToDatabase();
  const now = new Date();

  await db.collection<RssPodcastOwnership>(COLLECTION_NAME).updateOne(
    { userId },
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
  await db.collection<RssPodcastOwnership>(COLLECTION_NAME).deleteOne({ userId });
}
