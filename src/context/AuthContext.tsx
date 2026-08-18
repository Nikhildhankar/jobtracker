import React, { useState, useEffect } from 'react';
import { AuthContext } from './authContextDef';
import type { UserProfile } from './authContextDef';

export type { UserProfile, AuthContextType } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signup = async (data: { email: string; password: string; name?: string }) => {
    setError(null);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
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
  };

  const login = async (data: { email: string; password: string }) => {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
      const msg = body.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }

    setUser(body.user);
  };

  const logout = async () => {
    setError(null);
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    setError(null);
    const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
    const body = await res.json();
    if (!res.ok) {
      const msg = body.message || 'Email verification failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const resendVerification = async (email: string) => {
    setError(null);
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const body = await res.json();
    if (!res.ok) {
      const msg = body.message || 'Failed to resend verification';
      setError(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const body = await res.json();
    if (!res.ok) {
      const msg = body.message || 'Failed to process forgot password';
      setError(msg);
      throw new Error(msg);
    }
    return body;
  };

  const resetPassword = async (data: { token: string; password: string }) => {
    setError(null);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
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
