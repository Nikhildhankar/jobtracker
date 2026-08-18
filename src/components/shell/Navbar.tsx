import React, { useState } from 'react';
import { Search, Plus, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useUI } from '../../context/useUI';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { setCommandPaletteOpen, setQuickAddOpen } = useUI();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-40 flex items-center justify-between px-6 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-bold text-lg shadow-[0_2px_4px_0_rgba(37,99,235,0.3)]">
          JT
        </div>
        <div>
          <h1 className="text-base font-semibold text-[#0F172A] leading-tight">JobTracker</h1>
          <p className="text-[11px] font-medium text-[#7C8896]">Pipeline & AI Copilot</p>
        </div>
      </div>

      {/* Center Search Trigger (Cmd + K) */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="w-full max-w-md hidden sm:flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#7C8896] hover:border-[#CBD5E1] hover:text-[#0F172A] transition-all cursor-pointer text-xs select-none shadow-[inset_0_1px_1px_0_rgba(15,23,42,0.03)]"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <span>Search applications, companies, or commands...</span>
        </div>
        <kbd className="px-2 py-0.5 text-[10px] font-mono text-[#64748B] bg-white border border-[#E2E8F0] rounded-md shadow-xs">
          ⌘K
        </kbd>
      </button>

      {/* Right User Controls & CTA */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setQuickAddOpen(true)}
        >
          New Application
        </Button>

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-semibold text-xs flex items-center justify-center uppercase">
                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
              </div>
              <span className="text-xs font-medium text-[#0F172A] hidden md:inline max-w-[120px] truncate">
                {user.name || user.email}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 space-y-3 z-50">
                <div className="border-b border-[#E2E8F0] pb-2.5">
                  <p className="text-xs font-semibold text-[#0F172A] truncate">{user.name || 'Job Seeker'}</p>
                  <p className="text-xs text-[#7C8896] truncate">{user.email}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                    {user.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[#059669] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Account
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#D97706] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Unverified (Check Email)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#E11D48] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
