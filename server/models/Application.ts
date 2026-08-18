import mongoose, { Document, Schema, Types } from 'mongoose';

export type PipelineStage =
  | 'Wishlist'
  | 'Applied'
  | 'Screening'
  | 'Interviewing'
  | 'Offer'
  | 'Archived';

export type WorkModel = 'Remote' | 'Hybrid' | 'On-site';
export type VerificationStatus = 'verified' | 'risky' | 'unverified';

export interface IStageHistory {
  stage: PipelineStage;
  timestamp: Date;
  notes?: string;
}

export interface IContact {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  verificationStatus: VerificationStatus;
}

export interface ISalary {
  min?: number;
  max?: number;
  currency: string;
  period: 'yearly' | 'hourly' | 'monthly';
}

export interface IApplication extends Document {
  userId: Types.ObjectId;
  companyName: string;
  roleTitle: string;
  source?: string;
  stage: PipelineStage;
  workModel?: WorkModel;
  location?: string;
  salary?: ISalary;
  contact?: IContact;
  appliedDate?: Date;
  jobDescriptionRaw?: string;
  extractedKeywords?: string[];
  stageHistory: IStageHistory[];
  nextActionDate?: Date;
  notes?: string;
  resumeId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stageHistorySchema = new Schema<IStageHistory>(
  {
    stage: {
      type: String,
      enum: ['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Archived'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Multi-tenant primary index
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    roleTitle: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    stage: {
      type: String,
      enum: ['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Archived'],
      default: 'Wishlist',
      index: true,
    },
    workModel: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
    },
    location: {
      type: String,
      trim: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['yearly', 'hourly', 'monthly'], default: 'yearly' },
    },
    contact: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      role: { type: String, trim: true },
      phone: { type: String, trim: true },
      verificationStatus: {
        type: String,
        enum: ['verified', 'risky', 'unverified'],
        default: 'unverified',
      },
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    jobDescriptionRaw: {
      type: String,
    },
    extractedKeywords: {
      type: [String],
      default: [],
    },
    stageHistory: {
      type: [stageHistorySchema],
      default: () => [{ stage: 'Wishlist', timestamp: new Date() }],
    },
    nextActionDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant multi-tenant queries
applicationSchema.index({ userId: 1, stage: 1 });
applicationSchema.index({ userId: 1, appliedDate: -1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
