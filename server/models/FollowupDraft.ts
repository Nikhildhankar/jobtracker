import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFollowupDraft extends Document {
  userId: Types.ObjectId;
  applicationId: Types.ObjectId;
  recipientName?: string;
  recipientEmail?: string;
  emailSubject: string;
  bodyText: string;
  sent: boolean;
  sentAt?: Date;
  deliveryConfidence: 'verified' | 'risky' | 'unverified';
  createdAt: Date;
  updatedAt: Date;
}

const followupDraftSchema = new Schema<IFollowupDraft>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailSubject: {
      type: String,
      required: true,
    },
    bodyText: {
      type: String,
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    deliveryConfidence: {
      type: String,
      enum: ['verified', 'risky', 'unverified'],
      default: 'unverified',
    },
  },
  {
    timestamps: true,
  }
);

followupDraftSchema.index({ userId: 1, applicationId: 1 });

export const FollowupDraft = mongoose.model<IFollowupDraft>('FollowupDraft', followupDraftSchema);
