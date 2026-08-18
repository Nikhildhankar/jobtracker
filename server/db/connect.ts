import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // Don't crash immediately in dev mode to allow healthcheck reporting
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return mongoose;
  }
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
