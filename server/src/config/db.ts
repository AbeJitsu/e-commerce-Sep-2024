import mongoose from 'mongoose';

interface DBConnection {
  client: mongoose.Mongoose;
  db: mongoose.Connection;
}

let cachedConnection: DBConnection | null = null;

const validateMongoURI = (uri: string | undefined): string => {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  return uri;
};

const connectDB = async (
  mongoURI: string | undefined,
  retries = 5
): Promise<DBConnection> => {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  console.log('Attempting to connect to MongoDB');

  const validatedURI = validateMongoURI(mongoURI);

  try {
    const client = await mongoose.connect(validatedURI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    cachedConnection = { client, db: client.connection };
    console.log('MongoDB connected successfully');
    return cachedConnection;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Connection failed. Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(validatedURI, retries - 1);
    }
    throw new Error(
      err instanceof Error ? err.message : 'Unknown connection error'
    );
  }
};

export const closeConnection = async (): Promise<void> => {
  if (cachedConnection) {
    await cachedConnection.client.disconnect();
    cachedConnection = null;
    console.log('MongoDB connection closed');
  }
};

export const isConnected = (): boolean => {
  return !!cachedConnection && cachedConnection.db.readyState === 1;
};

export default connectDB;

// server/src/config/db.ts
