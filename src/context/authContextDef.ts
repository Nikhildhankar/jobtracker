import { createContext } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signup: (data: { email: string; password: string; name?: string }) => Promise<{ debugVerificationLink?: string } | void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (data: { token: string; password: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
