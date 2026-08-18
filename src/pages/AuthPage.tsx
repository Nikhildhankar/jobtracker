import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { Lock, Mail, User as UserIcon, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, forgotPassword, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const isSignup = activeTab === 'signup';

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
    setActiveTab('signin');
    setSubmitting(true);
    try {
      await login({ email: 'alex@example.com', password: 'Password123!' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2 max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B59FF] to-[#1E46E6] text-white font-bold text-xl flex items-center justify-center mx-auto shadow-[0_4px_12px_0_rgba(43,89,255,0.3)]">
          JT
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">JobTracker</h1>
        <p className="text-xs text-[#64748B]">
          AI-Powered Career Pipeline, ATS Resume Audit & Interview Prep
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_12px_24px_-4px_rgba(15,23,42,0.08),0_4px_6px_-2px_rgba(15,23,42,0.03)] space-y-5">
        {/* Segmented Tabs */}
        <SegmentedTabs
          tabs={[
            { id: 'signin', label: 'Sign In' },
            { id: 'signup', label: 'Create Account' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as any);
            setDebugMsg(null);
            setForgotOpen(false);
          }}
          className="w-full justify-between"
        />

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-xs font-medium text-[#E11D48] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Debug Banner */}
        {debugMsg && (
          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-mono text-[#2B59FF] break-all space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registration Successful</span>
            </div>
            <p className="text-[11px] text-[#475569]">{debugMsg}</p>
          </div>
        )}

        {/* Forgot Password Flow */}
        {forgotOpen ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0F172A]">Reset Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="text-xs text-[#2B59FF] hover:underline font-semibold cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
              <p className="text-xs text-[#64748B]">
                Enter your account email to receive a password reset token.
              </p>
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="input-tactile pl-10"
              />
            </div>

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-mono text-[#059669] break-all">
                {forgotSuccess}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full py-2.5 bg-[#2B59FF] hover:bg-[#1E46E6] font-semibold"
              isLoading={submitting}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          /* Main Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A]">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Hunter"
                    className="input-tactile pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0F172A]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="input-tactile pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0F172A]">Password</label>
                {!isSignup && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotEmail(email);
                      setForgotSuccess(null);
                    }}
                    className="text-xs text-[#2B59FF] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-tactile pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full py-2.5 font-bold text-sm bg-[#2B59FF] hover:bg-[#1E46E6] shadow-[0_1px_2px_0_rgba(43,89,255,0.28)]"
              isLoading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isSignup ? 'Create Free Account' : 'Sign In to Dashboard'}
            </Button>
          </form>
        )}

        {/* 1-Click Demo Login Button */}
        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-center">
          <button
            type="button"
            onClick={fillAndSubmitDemo}
            className="w-full flex items-center justify-center gap-2 text-xs text-[#2B59FF] hover:text-[#1E46E6] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#2B59FF]" />
            <span>1-Click Demo Sign In (Alex Hunter)</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-[#64748B] space-y-1">
        <p className="font-semibold text-[#0F172A]">JobTracker • Career Pipeline & AI Copilot</p>
        <p className="text-[11px] text-[#94A3B8]">Secured with custom session tokens & HTTP-only cookies</p>
      </div>
    </div>
  );
};
