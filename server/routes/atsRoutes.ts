import { Router } from 'express';
import { atsController } from '../controllers/atsController';
import { requireAuth } from '../middleware/auth';

export const atsRouter = Router();

atsRouter.use(requireAuth);

atsRouter.post('/analyze', atsController.analyzeJob);
atsRouter.post('/rewrite-bullet', atsController.rewriteBullet);
