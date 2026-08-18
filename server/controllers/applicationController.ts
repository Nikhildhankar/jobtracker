import { Request, Response } from 'express';
import { Application } from '../models/Application';
import {
  createApplicationSchema,
  updateStageSchema,
  updateApplicationSchema,
} from '../validations/application';
import mongoose from 'mongoose';

export const applicationController = {
  /**
   * Fetch all applications owned by the authenticated user.
   */
  async getApplications(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const applications = await Application.find({ userId }).sort({ updatedAt: -1 });

      return res.status(200).json({
        applications,
      });
    } catch (error) {
      console.error('Get Applications Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch applications.',
      });
    }
  },

  /**
   * Fetch a single application by ID for the authenticated user.
   */
  async getApplicationById(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Invalid application ID format.',
        });
      }

      const application = await Application.findOne({ _id: id, userId });
      if (!application) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Application not found or unauthorized.',
        });
      }

      return res.status(200).json({
        application,
      });
    } catch (error) {
      console.error('Get Application By Id Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch application details.',
      });
    }
  },

  /**
   * Create a new job application for the authenticated user.
   */
  async createApplication(req: Request, res: Response) {
    try {
      const parseResult = createApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const data = parseResult.data;
      const appliedDate = data.appliedDate ? new Date(data.appliedDate) : new Date();

      const application = await Application.create({
        userId,
        companyName: data.companyName,
        roleTitle: data.roleTitle,
        source: data.source || 'Direct',
        stage: data.stage || 'Wishlist',
        workModel: data.workModel || 'Remote',
        location: data.location || '',
        salary: data.salary,
        contact: data.contact,
        appliedDate,
        jobDescriptionRaw: data.jobDescriptionRaw || '',
        notes: data.notes || '',
        stageHistory: [
          {
            stage: data.stage || 'Wishlist',
            timestamp: new Date(),
            notes: 'Application created',
          },
        ],
      });

      return res.status(201).json({
        message: 'Application created successfully.',
        application,
      });
    } catch (error) {
      console.error('Create Application Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to create application.',
      });
    }
  },

  /**
   * Update the pipeline stage of an application and record timeline history.
   */
  async updateStage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parseResult = updateStageSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const userId = new mongoose.Types.ObjectId(req.user!.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Invalid application ID format.',
        });
      }

      const application = await Application.findOne({ _id: id, userId });
      if (!application) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Application not found or unauthorized.',
        });
      }

      const { stage, notes } = parseResult.data;
      application.stage = stage;
      application.stageHistory.push({
        stage,
        timestamp: new Date(),
        notes: notes || `Moved to ${stage}`,
      });

      await application.save();

      return res.status(200).json({
        message: `Stage updated to ${stage}.`,
        application,
      });
    } catch (error) {
      console.error('Update Stage Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to update application stage.',
      });
    }
  },

  /**
   * Update application fields.
   */
  async updateApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parseResult = updateApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const userId = new mongoose.Types.ObjectId(req.user!.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Invalid application ID format.',
        });
      }

      const application = await Application.findOneAndUpdate(
        { _id: id, userId },
        { $set: parseResult.data },
        { new: true }
      );

      if (!application) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Application not found or unauthorized.',
        });
      }

      return res.status(200).json({
        message: 'Application updated successfully.',
        application,
      });
    } catch (error) {
      console.error('Update Application Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to update application.',
      });
    }
  },

  /**
   * Delete an application.
   */
  async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Invalid application ID format.',
        });
      }

      const application = await Application.findOneAndDelete({ _id: id, userId });
      if (!application) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Application not found or unauthorized.',
        });
      }

      return res.status(200).json({
        message: 'Application deleted successfully.',
      });
    } catch (error) {
      console.error('Delete Application Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to delete application.',
      });
    }
  },
};
