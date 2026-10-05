
import mongoose from 'mongoose';

const globalForMongoose = globalThis as unknown as {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};
const cached = (globalForMongoose.mongoose ??= { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add a MongoDB connection string to the root .env file.');
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://.');
  }


  const connection = cached.promise ?? (cached.promise = mongoose.connect(uri));
  try {
    cached.conn = await connection;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    if (error instanceof Error && error.name === 'MongoParseError') {
      throw new Error(
        'MONGODB_URI has invalid syntax. Check the host and replace placeholders; percent-encode reserved characters in the username or password.',
        { cause: error }
      );
    }
    throw error;
  }
}