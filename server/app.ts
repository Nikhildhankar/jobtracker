import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { isDBConnected } from './db/connect';
import { geminiService } from './services/gemini';
import { authRouter } from './routes/authRoutes';
import { dashboardRouter } from './routes/dashboardRoutes';
import { applicationRouter } from './routes/applicationRoutes';
import { resumeRouter } from './routes/resumeRoutes';
import { atsRouter } from './routes/atsRoutes';
import { interviewPrepRouter } from './routes/interviewPrepRoutes';
import { actionCenterRouter } from './routes/actionCenterRoutes';

export const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Dev Request Logger
if (env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health & System Status Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const dbStatus = isDBConnected() ? 'connected' : 'disconnected';
  const aiStatus = geminiService.isConfigured() ? 'ready' : 'fallback_mode';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      database: dbStatus,
      aiProvider: aiStatus,
    },
  });
});

// Authentication Routes
app.use('/api/auth', authRouter);

// Dashboard Analytics Routes
app.use('/api/dashboard', dashboardRouter);

// Application CRUD Routes
app.use('/api/applications', applicationRouter);

// Resume & ATS AI Routes
app.use('/api/resumes', resumeRouter);
app.use('/api/ats', atsRouter);

// Interview Prep & Answer Bank Routes
app.use('/api/interview-prep', interviewPrepRouter);

// Action Center Stale Detection Routes
app.use('/api/action-center', actionCenterRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});
