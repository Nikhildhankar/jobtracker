import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import '../styles/login.css';

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
    <div className="login-page-wrapper">
      {/* Brand Header */}
      <div className="login-brand-header">
        <div className="login-brand-logo">JT</div>
        <h1 className="login-brand-title">JobTracker</h1>
        <p className="login-brand-desc">AI-Powered Career Pipeline & Copilot</p>
      </div>

      {/* Container for the login box */}
      <div className="login-container">
        <h2>{forgotOpen ? 'Reset Password' : isSignup ? 'Create Account' : 'Account Login'}</h2>

        {/* Error Alert */}
        {error && <div className="login-alert-error">{error}</div>}

        {/* Success Alert */}
        {debugMsg && (
          <div className="login-alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginBottom: '4px' }}>
              <CheckCircle2 size={16} />
              <span>Registration Successful</span>
            </div>
            <div>{debugMsg}</div>
          </div>
        )}

        {forgotOpen ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPassword}>
            <div className="input-group">
              <label htmlFor="forgot-email">Email Address</label>
              <input
                type="email"
                id="forgot-email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {forgotSuccess && (
              <div className="login-alert-success" style={{ color: '#137333', background: '#e6f4ea', borderColor: '#ceead6' }}>
                {forgotSuccess}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="signup-link" style={{ marginTop: '16px' }}>
              <button type="button" onClick={() => setForgotOpen(false)}>
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Main Login / Registration Form */
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {/* Secondary Actions: Remember Me + Forgot Password */}
            {!isSignup && (
              <div className="form-actions">
                <label>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
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
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 1-Click Demo Login */}
        <button type="button" onClick={fillAndSubmitDemo} disabled={submitting} className="demo-helper-btn">
          <Sparkles size={14} />
          <span>1-Click Demo Login (Alex Hunter)</span>
        </button>

        {/* Registration Redirect */}
        <div className="signup-link">
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setDebugMsg(null);
                }}
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
              >
                Sign up here
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="login-footer-info">
        <p style={{ fontWeight: 600, color: '#555555' }}>JobTracker • Career Pipeline & AI Copilot</p>
        <p style={{ fontSize: '11px', color: '#999999', marginTop: '2px' }}>
          Secured with custom session tokens & HTTP-only cookies
        </p>
      </div>
    </div>
  );
};
