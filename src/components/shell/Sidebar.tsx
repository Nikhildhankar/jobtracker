import React from 'react';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Kanban,
  FileText,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useUI } from '../../context/useUI';
import type { ActivePage } from '../../context/uiContextDef';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, activePage, setActivePage, stageCounts } = useUI();

  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    alertBadge?: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'pipeline',
      label: 'Pipeline Kanban',
      icon: <Kanban className="w-4 h-4" />,
      badgeCount:
        stageCounts.Wishlist +
        stageCounts.Applied +
        stageCounts.Screening +
        stageCounts.Interviewing +
        stageCounts.Offer,
    },
    {
      id: 'ats',
      label: 'ATS Builder',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'prep',
      label: 'Interview Prep',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'action',
      label: 'Action Center',
      icon: <AlertCircle className="w-4 h-4" />,
      alertBadge: stageCounts.actionNeeded > 0,
      badgeCount: stageCounts.actionNeeded,
    },
  ];

  return (
    <aside
      className={clsx(
        'border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between transition-all duration-200 select-none z-30',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Navigation Section */}
      <div className="p-3 space-y-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer group',
                  isActive
                    ? 'bg-white text-[#2563EB] shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)] border border-[#E2E8F0]'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={clsx(isActive ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#0F172A]')}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!sidebarCollapsed && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span
                    className={clsx(
                      'px-2 py-0.5 text-[10px] font-mono rounded-full font-bold',
                      item.alertBadge
                        ? 'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]'
                        : isActive
                        ? 'bg-[#EFF6FF] text-[#2563EB]'
                        : 'bg-[#E2E8F0] text-[#64748B]'
                    )}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Collapse Toggle */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-3">
        {!sidebarCollapsed && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] border border-[#BFDBFE] space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Copilot</span>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Tailor resumes, analyze ATS keywords & practice interview loops.
            </p>
          </div>
        )}

        {/* Collapse Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-xs"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
