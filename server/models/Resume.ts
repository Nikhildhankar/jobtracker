import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExperienceItem {
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export interface IProjectItem {
  title: string;
  description?: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface IEducationItem {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: string;
}

export interface IResumeSections {
  summary?: string;
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  experience: IExperienceItem[];
  projects: IProjectItem[];
  education: IEducationItem[];
}

export interface IResume extends Document {
  userId: Types.ObjectId;
  applicationId?: Types.ObjectId; // null for base resume, set if tailored for a specific job
  versionLabel: string;
  isBaseResume: boolean;
  sections: IResumeSections;
  atsScore?: number;
  missingKeywordsConfirmed?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
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
      index: true,
    },
    versionLabel: {
      type: String,
      required: true,
      default: 'Base Resume',
    },
    isBaseResume: {
      type: Boolean,
      default: false,
    },
    sections: {
      summary: { type: String, default: '' },
      skills: {
        technical: { type: [String], default: [] },
        tools: { type: [String], default: [] },
        soft: { type: [String], default: [] },
      },
      experience: { type: [Schema.Types.Mixed], default: [] },
      projects: { type: [Schema.Types.Mixed], default: [] },
      education: { type: [Schema.Types.Mixed], default: [] },
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    missingKeywordsConfirmed: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1, isBaseResume: 1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
