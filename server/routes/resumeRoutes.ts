import { Router } from 'express';
import { resumeController } from '../controllers/resumeController';
import { requireAuth } from '../middleware/auth';

export const resumeRouter = Router();

resumeRouter.use(requireAuth);

resumeRouter.get('/base', resumeController.getBaseResume);
resumeRouter.put('/base', resumeController.updateBaseResume);
resumeRouter.post('/tailor', resumeController.createTailoredResume);
