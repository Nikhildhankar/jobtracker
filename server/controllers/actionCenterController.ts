import { Request, Response } from 'express';
import { geminiService } from '../services/gemini';
import { Application } from '../models/Application';
import mongoose from 'mongoose';

export const actionCenterController = {
  /**
   * Get items needing action: stale applications (>= 7 days inactive) and upcoming interviews.
   */
  async getItems(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const applications = await Application.find({ userId }).sort({ updatedAt: -1 });

      const now = new Date();
      const STALE_DAYS_THRESHOLD = 7;

      const staleApplications: any[] = [];
      const upcomingInterviews: any[] = [];

      for (const app of applications) {
        // Calculate days since last activity/update
        const lastActivity = app.updatedAt || app.createdAt;
        const daysDiff = Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

        if (['Applied', 'Screening'].includes(app.stage) && daysDiff >= STALE_DAYS_THRESHOLD) {
          staleApplications.push({
            id: app._id,
            companyName: app.companyName,
            roleTitle: app.roleTitle,
            stage: app.stage,
            appliedDate: app.appliedDate,
            daysStale: daysDiff,
            contact: app.contact,
            source: app.source,
          });
        }

        if (app.stage === 'Interviewing') {
          upcomingInterviews.push({
            id: app._id,
            companyName: app.companyName,
            roleTitle: app.roleTitle,
            stage: app.stage,
            nextActionDate: app.nextActionDate,
            contact: app.contact,
          });
        }
      }

      return res.status(200).json({
        totalActionNeeded: staleApplications.length + upcomingInterviews.length,
        staleApplications,
        upcomingInterviews,
      });
    } catch (error) {
      console.error('Get Action Center Items Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch action center items.',
      });
    }
  },

  /**
   * Draft follow-up email using Gemini API.
   */
  async draftEmail(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { applicationId, customNotes } = req.body;

      if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Valid applicationId is required.',
        });
      }

      const app = await Application.findOne({ _id: applicationId, userId });
      if (!app) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Application not found or unauthorized.',
        });
      }

      const now = new Date();
      const lastActivity = app.updatedAt || app.createdAt;
      const daysSinceApplied = Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

      const draft = await geminiService.draftFollowupEmail({
        companyName: app.companyName,
        roleTitle: app.roleTitle,
        contactName: app.contact?.name,
        daysSinceApplied,
        customNotes,
      });

      return res.status(200).json({
        companyName: app.companyName,
        roleTitle: app.roleTitle,
        contact: app.contact,
        draft,
      });
    } catch (error) {
      console.error('Draft Follow-up Email Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to draft follow-up email.',
      });
    }
  },

  /**
   * Mark an application as followed up: updates updatedAt and appends stageHistory event.
   */
  async markFollowedUp(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { applicationId, notes } = req.body;

      if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Valid applicationId is required.',
        });
      }

      const app = await Application.findOne({ _id: applicationId, userId });
      if (!app) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Application not found or unauthorized.',
        });
      }

      app.stageHistory.push({
        stage: app.stage,
        timestamp: new Date(),
        notes: notes || 'Sent follow-up email to recruiter',
      });
      app.updatedAt = new Date();

      await app.save();

      return res.status(200).json({
        message: 'Application marked as followed up.',
        application: app,
      });
    } catch (error) {
      console.error('Mark Followed Up Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to mark application as followed up.',
      });
    }
  },
};
