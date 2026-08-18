import { Router } from 'express';
import { applicationController } from '../controllers/applicationController';
import { requireAuth } from '../middleware/auth';

export const applicationRouter = Router();

// All application routes require authentication
applicationRouter.use(requireAuth);

applicationRouter.get('/', applicationController.getApplications);
applicationRouter.post('/', applicationController.createApplication);
applicationRouter.get('/:id', applicationController.getApplicationById);
applicationRouter.patch('/:id/stage', applicationController.updateStage);
applicationRouter.patch('/:id', applicationController.updateApplication);
applicationRouter.delete('/:id', applicationController.deleteApplication);
