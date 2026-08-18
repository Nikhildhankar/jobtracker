import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  _id: string; // Cryptographic opaque session token (UUID or 64-char hex)
  userId: Types.ObjectId;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    _id: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup when expiresAt is reached
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);
