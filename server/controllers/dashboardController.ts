import { Request, Response } from 'express';
import { Application, PipelineStage } from '../models/Application';
import mongoose from 'mongoose';

export const dashboardController = {
  /**
   * Fetch aggregate KPI metrics and 6-stage distribution breakdown for the authenticated user.
   */
  async getStats(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch all applications for this user
      const applications = await Application.find({ userId });

      const totalActive = applications.filter((app) => app.stage !== 'Archived').length;
      const totalAll = applications.length;

      // Applications created in the last 7 days
      const addedThisWeek = applications.filter(
        (app) => app.createdAt && app.createdAt >= sevenDaysAgo
      ).length;

      // Response Rate calculation: (Screening + Interviewing + Offer + Rejected) / total Applied+
      const respondedApps = applications.filter((app) =>
        ['Screening', 'Interviewing', 'Offer', 'Rejected'].includes(app.stage)
      ).length;
      const totalApplied = applications.filter((app) => app.stage !== 'Wishlist').length;
      const responseRatePct =
        totalApplied > 0 ? Math.round((respondedApps / totalApplied) * 100 * 10) / 10 : 0;

      // Avg days to response
      let totalDays = 0;
      let countWithResponse = 0;
      for (const app of applications) {
        if (['Screening', 'Interviewing', 'Offer'].includes(app.stage) && app.appliedDate) {
          const firstResponse = app.stageHistory.find((h) =>
            ['Screening', 'Interviewing', 'Offer'].includes(h.stage)
          );
          if (firstResponse) {
            const diffDays = Math.max(
              1,
              Math.round(
                (new Date(firstResponse.timestamp).getTime() - new Date(app.appliedDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );
            totalDays += diffDays;
            countWithResponse += 1;
          }
        }
      }
      const avgDaysToResponse = countWithResponse > 0 ? Math.round(totalDays / countWithResponse) : 0;

      // Stage Distribution Counts
      const stageCounts: Record<PipelineStage, number> = {
        Wishlist: 0,
        Applied: 0,
        Screening: 0,
        Interviewing: 0,
        Offer: 0,
        Archived: 0,
      };

      for (const app of applications) {
        if (stageCounts[app.stage] !== undefined) {
          stageCounts[app.stage] += 1;
        }
      }

      return res.status(200).json({
        totalActive,
        totalAll,
        addedThisWeek,
        responseRatePct,
        avgDaysToResponse,
        stageCounts,
      });
    } catch (error) {
      console.error('Dashboard Stats Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to compute dashboard metrics.',
      });
    }
  },

  /**
   * Fetch applications requiring attention (stale > 7 days or upcoming interviews < 48 hours).
   */
  async getAttentionItems(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const applications = await Application.find({ userId });

      const staleApplications = applications.filter((app) => {
        if (!['Applied', 'Screening'].includes(app.stage)) return false;
        // Check last stage change timestamp
        const lastActivity = app.stageHistory.length > 0
          ? new Date(app.stageHistory[app.stageHistory.length - 1].timestamp)
          : new Date(app.updatedAt || app.createdAt);

        return lastActivity <= sevenDaysAgo;
      }).map((app) => {
        const lastActivity = app.stageHistory.length > 0
          ? new Date(app.stageHistory[app.stageHistory.length - 1].timestamp)
          : new Date(app.updatedAt || app.createdAt);
        const daysStale = Math.max(7, Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)));

        return {
          id: app._id.toString(),
          companyName: app.companyName,
          roleTitle: app.roleTitle,
          stage: app.stage,
          appliedDate: app.appliedDate,
          daysStale,
          contact: app.contact,
          type: 'stale',
        };
      });

      const upcomingInterviews = applications.filter((app) => {
        return (
          app.stage === 'Interviewing' &&
          app.nextActionDate &&
          new Date(app.nextActionDate) >= now &&
          new Date(app.nextActionDate) <= in48Hours
        );
      }).map((app) => ({
        id: app._id.toString(),
        companyName: app.companyName,
        roleTitle: app.roleTitle,
        stage: app.stage,
        nextActionDate: app.nextActionDate,
        contact: app.contact,
        type: 'interview_upcoming',
      }));

      return res.status(200).json({
        totalAttention: staleApplications.length + upcomingInterviews.length,
        staleApplications,
        upcomingInterviews,
      });
    } catch (error) {
      console.error('Dashboard Attention Items Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch attention items.',
      });
    }
  },

  /**
   * Fetch recent 10 timeline activity events for the user.
   */
  async getActivityFeed(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const applications = await Application.find({ userId });

      const events: Array<{
        id: string;
        applicationId: string;
        companyName: string;
        roleTitle: string;
        stage: PipelineStage;
        timestamp: Date;
        notes?: string;
      }> = [];

      for (const app of applications) {
        for (const history of app.stageHistory) {
          events.push({
            id: `${app._id.toString()}-${new Date(history.timestamp).getTime()}`,
            applicationId: app._id.toString(),
            companyName: app.companyName,
            roleTitle: app.roleTitle,
            stage: history.stage,
            timestamp: new Date(history.timestamp),
            notes: history.notes,
          });
        }
      }

      // Sort by timestamp descending
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return res.status(200).json({
        activity: events.slice(0, 10),
      });
    } catch (error) {
      console.error('Dashboard Activity Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch activity feed.',
      });
    }
  },
};
