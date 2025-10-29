import { MongoClient, Db } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB || "testdb";

/**
 * Singleton mongo client + db.
 * client lives as module-level variable to avoid GC and reconnecting per request.
 */
let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  // If auth database is admin and MONGO_URL lacks authSource param, it's okay because MONGO_URL from docker contains credentials.
  client = new MongoClient(MONGO_URL, {
    // options can be added here
  });

  await client.connect();
  db = client.db(MONGO_DB_NAME);
  console.log("✅ Connected to MongoDB");
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("🛑 MongoDB connection closed");
  }
}
