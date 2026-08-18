import { Router } from 'express';
import { interviewPrepController } from '../controllers/interviewPrepController';
import { requireAuth } from '../middleware/auth';

export const interviewPrepRouter = Router();

interviewPrepRouter.use(requireAuth);

interviewPrepRouter.get('/', interviewPrepController.getAnswerBank);
interviewPrepRouter.post('/generate', interviewPrepController.generateQuestions);
interviewPrepRouter.post('/review-star', interviewPrepController.reviewStarAnswer);
interviewPrepRouter.post('/save', interviewPrepController.saveAnswer);
interviewPrepRouter.delete('/:id', interviewPrepController.deleteAnswer);
