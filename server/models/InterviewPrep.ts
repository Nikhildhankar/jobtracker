import mongoose, { Document, Schema, Types } from 'mongoose';

export type RoundType = 'Phone Screen' | 'Technical / Coding' | 'System Design' | 'Behavioral / STAR' | 'Hiring Manager' | 'Final Round';

export interface IQuestionItem {
  id: string;
  type: 'technical' | 'behavioral' | 'role_fit' | 'system_design';
  question: string;
  context?: string;
  userAnswer?: string;
  starBreakdown?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
}

export interface IInterviewPrep extends Document {
  userId: Types.ObjectId;
  applicationId?: Types.ObjectId;
  roundType?: RoundType;
  techStackDetected?: string[];
  keyResponsibilities?: string[];
  questions?: IQuestionItem[];
  checklistCompleted?: string[];
  // Answer Bank Standalone Fields
  question?: string;
  category?: string;
  companyName?: string;
  starAnswer?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
  polishedDraft?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionItemSchema = new Schema<IQuestionItem>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'role_fit', 'system_design'],
      required: true,
    },
    question: { type: String, required: true },
    context: { type: String },
    userAnswer: { type: String, default: '' },
    starBreakdown: {
      situation: { type: String },
      task: { type: String },
      action: { type: String },
      result: { type: String },
    },
  },
  { _id: false }
);

const interviewPrepSchema = new Schema<IInterviewPrep>(
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
      required: false,
      index: true,
    },
    roundType: {
      type: String,
      enum: [
        'Phone Screen',
        'Technical / Coding',
        'System Design',
        'Behavioral / STAR',
        'Hiring Manager',
        'Final Round',
      ],
      default: 'Technical / Coding',
    },
    techStackDetected: {
      type: [String],
      default: [],
    },
    keyResponsibilities: {
      type: [String],
      default: [],
    },
    questions: {
      type: [questionItemSchema],
      default: [],
    },
    checklistCompleted: {
      type: [String],
      default: [],
    },
    question: { type: String },
    category: { type: String, default: 'Behavioral' },
    companyName: { type: String },
    starAnswer: {
      situation: { type: String },
      task: { type: String },
      action: { type: String },
      result: { type: String },
    },
    polishedDraft: { type: String },
  },
  {
    timestamps: true,
  }
);

interviewPrepSchema.index({ userId: 1, applicationId: 1 });

export const InterviewPrep = mongoose.model<IInterviewPrep>('InterviewPrep', interviewPrepSchema);
