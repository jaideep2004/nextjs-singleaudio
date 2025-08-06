import * as dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

// Load env from server/.env if not already loaded
dotenv.config({ path: require('path').resolve(process.cwd(), 'server/.env') });

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the value is preserved across module reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client for every connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  const client = await clientPromise;
  const db = client.db();
  return { db, client };
}
