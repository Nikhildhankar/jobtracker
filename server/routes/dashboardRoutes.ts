import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

export const dashboardRouter = Router();

// All dashboard endpoints require valid session authentication
dashboardRouter.use(requireAuth);

dashboardRouter.get('/stats', dashboardController.getStats);
dashboardRouter.get('/attention', dashboardController.getAttentionItems);
dashboardRouter.get('/activity', dashboardController.getActivityFeed);
