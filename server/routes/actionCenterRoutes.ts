import { Router } from 'express';
import { actionCenterController } from '../controllers/actionCenterController';
import { requireAuth } from '../middleware/auth';

export const actionCenterRouter = Router();

actionCenterRouter.use(requireAuth);

actionCenterRouter.get('/items', actionCenterController.getItems);
actionCenterRouter.post('/draft-email', actionCenterController.draftEmail);
actionCenterRouter.post('/mark-followed-up', actionCenterController.markFollowedUp);
