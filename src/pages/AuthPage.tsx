import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, error } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDebugMsg(null);

    try {
      if (isSignup) {
        const res = await signup({ email, password, name });
        if (res?.debugVerificationLink) {
          setDebugMsg(`Demo Verification Link: ${res.debugVerificationLink}`);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      {/* Brand Icon Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#2563EB]/25">
          JT
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome to JobTracker</h1>
        <p className="text-xs text-[#7C8896]">Clean career pipeline tracking & AI copilot</p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-xl space-y-6">
        <div className="flex border-b border-[#E2E8F0]">
          <button
            onClick={() => { setIsSignup(false); setDebugMsg(null); }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              !isSignup ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#7C8896]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignup(true); setDebugMsg(null); }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              isSignup ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#7C8896]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-xs font-medium text-[#E11D48]">
            {error}
          </div>
        )}

        {debugMsg && (
          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-mono text-[#2563EB] break-all">
            {debugMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Hunter"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <Button variant="primary" className="w-full py-2.5" isLoading={submitting}>
            {isSignup ? 'Create Account' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};
