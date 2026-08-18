import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter, signupRateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

// Registration & Verification
authRouter.post('/signup', signupRateLimiter, authController.signup);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/verify-email', authController.verifyEmail);
authRouter.post('/resend-verification', authRateLimiter, authController.resendVerification);

// Authentication & Session
authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.getMe);

// Password Recovery
authRouter.post('/forgot-password', authRateLimiter, authController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, authController.resetPassword);
