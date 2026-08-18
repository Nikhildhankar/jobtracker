import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, forgotPassword, error } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDebugMsg(null);

    try {
      if (isSignup) {
        const res = await signup({ email, password, name });
        if (res?.debugVerificationLink) {
          setDebugMsg(`Email verification link: ${res.debugVerificationLink}`);
        }
      } else {
        await login({ email, password });
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail);
      if (res?.debugResetLink) {
        setForgotSuccess(`Password reset link: ${res.debugResetLink}`);
      } else {
        setForgotSuccess('If the account exists, a reset link has been generated.');
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const fillAndSubmitDemo = async () => {
    setEmail('alex@example.com');
    setPassword('Password123!');
    setIsSignup(false);
    setSubmitting(true);
    try {
      await login({ email: 'alex@example.com', password: 'Password123!' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-1">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007bff] to-[#0056b3] text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
          JT
        </div>
        <h1 className="text-2xl font-bold text-[#333333] tracking-tight">JobTracker</h1>
        <p className="text-xs text-[#666666]">AI-Powered Career Pipeline & Copilot</p>
      </div>

      {/* Main Login Box */}
      <div className="bg-white p-8 sm:p-10 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] w-full max-w-[400px]">
        <h2 className="text-center text-xl font-bold text-[#333333] mb-6">
          {forgotOpen ? 'Reset Password' : isSignup ? 'Create Account' : 'Account Login'}
        </h2>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-[#ffebe8] border border-[#ffc4bd] text-xs font-medium text-[#d93025]">
            {error}
          </div>
        )}

        {/* Success Verification Banner */}
        {debugMsg && (
          <div className="mb-4 p-3 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] text-xs text-[#1a73e8] break-all space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registration Successful</span>
            </div>
            <p className="text-[11px] text-[#5f6368]">{debugMsg}</p>
          </div>
        )}

        {forgotOpen ? (
          /* Forgot Password View */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="forgot-email" className="block text-xs font-medium text-[#666666]">
                Email Address
              </label>
              <input
                type="email"
                id="forgot-email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-[#cccccc] rounded-md text-sm outline-none focus:border-[#007bff] transition-colors"
              />
            </div>

            {forgotSuccess && (
              <div className="p-3 rounded-md bg-[#e6f4ea] border border-[#ceead6] text-xs font-mono text-[#137333] break-all">
                {forgotSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full p-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-md font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="text-[#007bff] hover:underline font-medium cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="mb-4 space-y-1.5">
                <label htmlFor="name" className="block text-xs font-medium text-[#666666]">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 border border-[#cccccc] rounded-md text-sm outline-none focus:border-[#007bff] transition-colors"
                />
              </div>
            )}

            {/* Email Input */}
            <div className="mb-4 space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-[#666666]">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-[#cccccc] rounded-md text-sm outline-none focus:border-[#007bff] transition-colors"
              />
            </div>

            {/* Password Input */}
            <div className="mb-5 space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-[#666666]">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border border-[#cccccc] rounded-md text-sm outline-none focus:border-[#007bff] transition-colors"
              />
            </div>

            {/* Secondary Actions (Remember Me + Forgot Password) */}
            {!isSignup && (
              <div className="flex justify-between items-center mb-6 text-xs text-[#666666]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#007bff] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setForgotEmail(email);
                    setForgotSuccess(null);
                  }}
                  className="text-[#007bff] hover:underline font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full p-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-md font-bold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {submitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 1-Click Demo Account Helper */}
        <div className="mt-5 pt-4 border-t border-[#eeeeee]">
          <button
            type="button"
            onClick={fillAndSubmitDemo}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md text-xs font-semibold text-[#007bff] bg-[#f0f7ff] hover:bg-[#e0efff] border border-[#cce4ff] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Login (Alex Hunter)</span>
          </button>
        </div>

        {/* Footer Redirect Link */}
        <div className="text-center mt-5 text-xs text-[#666666]">
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setDebugMsg(null);
                }}
                className="text-[#007bff] font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setDebugMsg(null);
                }}
                className="text-[#007bff] font-bold hover:underline cursor-pointer"
              >
                Sign up here
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-[#888888] space-y-0.5">
        <p className="font-semibold text-[#555555]">JobTracker • Career Pipeline & AI Copilot</p>
        <p className="text-[11px] text-[#999999]">Secured with custom session tokens & HTTP-only cookies</p>
      </div>
    </div>
  );
};
