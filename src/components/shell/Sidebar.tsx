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
      icon: <LayoutDashboard size={16} />,
    },
    {
      id: 'pipeline',
      label: 'Pipeline Kanban',
      icon: <Kanban size={16} />,
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
      icon: <FileText size={16} />,
    },
    {
      id: 'prep',
      label: 'Interview Prep',
      icon: <MessageSquare size={16} />,
    },
    {
      id: 'action',
      label: 'Action Center',
      icon: <AlertCircle size={16} />,
      alertBadge: stageCounts.actionNeeded > 0,
      badgeCount: stageCounts.actionNeeded,
    },
  ];

  return (
    <aside className={clsx('app-sidebar', sidebarCollapsed && 'collapsed')}>
      {/* Top Navigation Section */}
      <div className="sidebar-nav-container">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={clsx('sidebar-link', isActive && 'active')}
              >
                <div className="sidebar-link-content">
                  <span style={{ color: isActive ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!sidebarCollapsed && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span
                    className={clsx(
                      'sidebar-badge-count',
                      isActive && 'active',
                      item.alertBadge && 'alert'
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
      <div className="sidebar-footer">
        {!sidebarCollapsed && (
          <div className="sidebar-ai-promo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>
              <Sparkles size={14} />
              <span>Gemini AI Copilot</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Tailor resumes, analyze ATS keywords & practice interview loops.
            </p>
          </div>
        )}

        {/* Collapse Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="sidebar-collapse-btn"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
