import { Request, Response, NextFunction } from 'express';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { env } from '../config/env';

export const SESSION_COOKIE_NAME = 'jobtracker_session';
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

/**
 * Sets the httpOnly session cookie with security flags.
 */
export function setSessionCookie(res: Response, sessionId: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Clears the session cookie.
 */
export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
}

/**
 * Middleware ensuring request is made by an authenticated user with a valid session.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication session is required.',
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session has expired or was revoked. Please log in again.',
      });
    }

    const now = new Date();
    if (session.expiresAt <= now) {
      await Session.findByIdAndDelete(sessionId);
      clearSessionCookie(res);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired. Please log in again.',
      });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      await Session.findByIdAndDelete(sessionId);
      clearSessionCookie(res);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account not found.',
      });
    }

    // Sliding session renewal: extend if less than 15 days remaining
    const halfLife = SESSION_MAX_AGE_MS / 2;
    if (session.expiresAt.getTime() - now.getTime() < halfLife) {
      const newExpiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
      session.expiresAt = newExpiresAt;
      await session.save();
      setSessionCookie(res, sessionId, newExpiresAt);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    };
    req.sessionId = sessionId;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to authenticate session.',
    });
  }
}

/**
 * Middleware requiring user to have completed email verification.
 */
export function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required.',
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'UNVERIFIED_ACCOUNT',
      message: 'Please verify your email address to access this feature.',
    });
  }

  next();
}
