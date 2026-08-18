import { Request, Response } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import {
  generateOpaqueToken,
  hashToken,
  hashPassword,
  comparePassword,
} from '../utils/crypto';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth';
import {
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from '../middleware/auth';
import { env } from '../config/env';

export const authController = {
  /**
   * Register a new user account and start a session.
   */
  async signup(req: Request, res: Response) {
    try {
      const parseResult = signupSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email, password, name } = parseResult.data;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists.',
        });
      }

      const passwordHash = await hashPassword(password);
      const rawVerificationToken = generateOpaqueToken();
      const verificationTokenHash = hashToken(rawVerificationToken);
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await User.create({
        email,
        passwordHash,
        name: name || '',
        isVerified: false,
        verificationTokenHash,
        verificationExpiresAt,
      });

      // Create initial active session
      const sessionId = generateOpaqueToken();
      const sessionExpiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

      await Session.create({
        _id: sessionId,
        userId: user._id,
        expiresAt: sessionExpiresAt,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      });

      setSessionCookie(res, sessionId, sessionExpiresAt);

      const verificationLink = `${env.CLIENT_URL}/verify-email?token=${rawVerificationToken}`;
      console.log(`✉️ [Email Verification Link for ${user.email}]: ${verificationLink}`);

      return res.status(201).json({
        message: 'Account created successfully. Please verify your email.',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
        // In dev mode, return verification link for testing ease
        ...(env.NODE_ENV !== 'production' && {
          debugVerificationToken: rawVerificationToken,
          debugVerificationLink: verificationLink,
        }),
      });
    } catch (error) {
      console.error('Signup Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to create account.',
      });
    }
  },

  /**
   * Verify email address using token.
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const token = (req.query.token as string) || req.body?.token;
      const parseResult = verifyEmailSchema.safeParse({ token });
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Valid verification token is required.',
        });
      }

      const hashed = hashToken(parseResult.data.token);
      const user = await User.findOne({
        verificationTokenHash: hashed,
        verificationExpiresAt: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          error: 'InvalidToken',
          message: 'The verification token is invalid or has expired.',
        });
      }

      user.isVerified = true;
      user.verificationTokenHash = undefined;
      user.verificationExpiresAt = undefined;
      await user.save();

      return res.status(200).json({
        message: 'Email address verified successfully.',
        isVerified: true,
      });
    } catch (error) {
      console.error('Verify Email Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to verify email.',
      });
    }
  },

  /**
   * Resend verification link to user's email.
   */
  async resendVerification(req: Request, res: Response) {
    try {
      const parseResult = resendVerificationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email } = parseResult.data;
      const user = await User.findOne({ email });

      if (!user) {
        // Return 200 to prevent account probing
        return res.status(200).json({
          message: 'If an account exists, a new verification link has been sent.',
        });
      }

      if (user.isVerified) {
        return res.status(200).json({
          message: 'This account is already verified.',
          isVerified: true,
        });
      }

      const rawToken = generateOpaqueToken();
      user.verificationTokenHash = hashToken(rawToken);
      user.verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const verificationLink = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
      console.log(`✉️ [Resent Verification Link for ${user.email}]: ${verificationLink}`);

      return res.status(200).json({
        message: 'A new verification link has been sent to your email.',
        ...(env.NODE_ENV !== 'production' && {
          debugVerificationToken: rawToken,
          debugVerificationLink: verificationLink,
        }),
      });
    } catch (error) {
      console.error('Resend Verification Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to resend verification.',
      });
    }
  },

  /**
   * Authenticate user credentials and create session cookie.
   */
  async login(req: Request, res: Response) {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parseResult.data;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          error: 'InvalidCredentials',
          message: 'Invalid email or password.',
        });
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'InvalidCredentials',
          message: 'Invalid email or password.',
        });
      }

      const sessionId = generateOpaqueToken();
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

      await Session.create({
        _id: sessionId,
        userId: user._id,
        expiresAt,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      });

      setSessionCookie(res, sessionId, expiresAt);

      return res.status(200).json({
        message: 'Logged in successfully.',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to authenticate user.',
      });
    }
  },

  /**
   * Log out active session and clear cookie.
   */
  async logout(req: Request, res: Response) {
    try {
      const sessionId = req.sessionId || req.cookies[SESSION_COOKIE_NAME];
      if (sessionId) {
        await Session.findByIdAndDelete(sessionId);
      }
      clearSessionCookie(res);

      return res.status(200).json({
        message: 'Logged out successfully.',
      });
    } catch (error) {
      console.error('Logout Error:', error);
      clearSessionCookie(res);
      return res.status(200).json({
        message: 'Logged out successfully.',
      });
    }
  },

  /**
   * Get authenticated user profile.
   */
  async getMe(req: Request, res: Response) {
    return res.status(200).json({
      user: req.user,
    });
  },

  /**
   * Request password reset token.
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const parseResult = forgotPasswordSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email } = parseResult.data;
      const user = await User.findOne({ email });

      if (user) {
        const rawResetToken = generateOpaqueToken();
        user.resetPasswordTokenHash = hashToken(rawResetToken);
        user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const resetLink = `${env.CLIENT_URL}/reset-password?token=${rawResetToken}`;
        console.log(`🔑 [Password Reset Link for ${user.email}]: ${resetLink}`);

        return res.status(200).json({
          message: 'If an account with that email exists, a password reset link has been sent.',
          ...(env.NODE_ENV !== 'production' && {
            debugResetToken: rawResetToken,
            debugResetLink: resetLink,
          }),
        });
      }

      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to process password reset request.',
      });
    }
  },

  /**
   * Reset password with valid reset token.
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const parseResult = resetPasswordSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { token, password } = parseResult.data;
      const hashed = hashToken(token);

      const user = await User.findOne({
        resetPasswordTokenHash: hashed,
        resetPasswordExpiresAt: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          error: 'InvalidToken',
          message: 'Password reset token is invalid or has expired.',
        });
      }

      user.passwordHash = await hashPassword(password);
      user.resetPasswordTokenHash = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();

      // Revoke all existing sessions on password change for security
      await Session.deleteMany({ userId: user._id });
      clearSessionCookie(res);

      return res.status(200).json({
        message: 'Your password has been successfully reset. Please log in with your new password.',
      });
    } catch (error) {
      console.error('Reset Password Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to reset password.',
      });
    }
  },
};
