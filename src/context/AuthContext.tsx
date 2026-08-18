import React, { useState, useEffect } from 'react';
import { AuthContext } from './authContextDef';
import type { UserProfile } from './authContextDef';

export type { UserProfile, AuthContextType } from './authContextDef';

const DEMO_USER: UserProfile = {
  id: 'demo-user-alex-hunter',
  email: 'alex@example.com',
  name: 'Alex Hunter',
  isVerified: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        // Check local demo persistence
        const localUser = localStorage.getItem('jobtracker_demo_user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          setUser(null);
        }
      }
    } catch {
      const localUser = localStorage.getItem('jobtracker_demo_user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signup = async (data: { email: string; password: string; name?: string }) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();
      if (!res.ok) {
        const msg = body.message || 'Signup failed';
        setError(msg);
        throw new Error(msg);
      }
      return body;
    } catch {
      // Fallback demo signup
      const newUser: UserProfile = {
        id: `demo-${Date.now()}`,
        email: data.email,
        name: data.name || 'Job Seeker',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('jobtracker_demo_user', JSON.stringify(newUser));
      return { user: newUser, message: 'Account created (Demo Mode)' };
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();
      if (!res.ok) {
        // If server actively returned an auth error (e.g. wrong password), throw it
        if (res.status === 401 || res.status === 400) {
          const msg = body.message || 'Invalid credentials';
          setError(msg);
          throw new Error(msg);
        }
      } else {
        setUser(body.user);
        return;
      }
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('NetworkError')) {
        // Re-throw genuine password errors if server responded
        throw err;
      }
    }

    // Fallback demo login if server is offline or on GitHub Pages static demo
    const loggedUser: UserProfile = {
      id: 'demo-user-alex-hunter',
      email: data.email || DEMO_USER.email,
      name: data.email === 'alex@example.com' ? 'Alex Hunter' : data.email.split('@')[0],
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    setUser(loggedUser);
    localStorage.setItem('jobtracker_demo_user', JSON.stringify(loggedUser));
  };

  const logout = async () => {
    setError(null);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // offline logout
    }
    localStorage.removeItem('jobtracker_demo_user');
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    setError(null);
    const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    }).catch(() => null);
    if (res && !res.ok) {
      const body = await res.json();
      const msg = body.message || 'Email verification failed';
      setError(msg);
      throw new Error(msg);
    }
    if (user) {
      const updated = { ...user, isVerified: true };
      setUser(updated);
      localStorage.setItem('jobtracker_demo_user', JSON.stringify(updated));
    }
  };

  const resendVerification = async (email: string) => {
    setError(null);
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    if (res && !res.ok) {
      const body = await res.json();
      const msg = body.message || 'Failed to resend verification';
      setError(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    if (res && res.ok) {
      return res.json();
    }
    return {
      message: 'Password reset link generated.',
      debugResetLink: `http://localhost:5173/reset-password?token=demo-token-${Date.now()}`,
    };
  };

  const resetPassword = async (data: { token: string; password: string }) => {
    setError(null);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (res && !res.ok) {
      const body = await res.json();
      const msg = body.message || 'Password reset failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
