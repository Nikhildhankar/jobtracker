import { z } from 'zod';

export const createApplicationSchema = z.object({
  companyName: z.string({ required_error: 'Company name is required' }).trim().min(1).max(150),
  roleTitle: z.string({ required_error: 'Role title is required' }).trim().min(1).max(150),
  source: z.string().trim().optional(),
  stage: z
    .enum(['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Archived'])
    .default('Wishlist'),
  workModel: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
  location: z.string().trim().optional(),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default('USD'),
      period: z.enum(['yearly', 'hourly', 'monthly']).default('yearly'),
    })
    .optional(),
  contact: z
    .object({
      name: z.string().trim().optional(),
      email: z.string().trim().email().optional().or(z.literal('')),
      role: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      verificationStatus: z.enum(['verified', 'risky', 'unverified']).default('unverified'),
    })
    .optional(),
  appliedDate: z.string().optional(),
  jobDescriptionRaw: z.string().optional(),
  notes: z.string().optional(),
});

export const updateStageSchema = z.object({
  stage: z.enum(['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Archived']),
  notes: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();
