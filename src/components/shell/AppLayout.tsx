import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  Search,
  Plus,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LayoutDashboard,
  Kanban,
  FileText,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useUI } from '../../context/useUI';
import type { ActivePage } from '../../context/uiContextDef';
import { Button, Drawer, CommandPalette } from '../ui';
import { QuickAddModal } from '../modals/QuickAddModal';

import { DashboardPage } from '../../pages/DashboardPage';
import { PipelinePage } from '../../pages/PipelinePage';
import { AtsPage } from '../../pages/AtsPage';
import { InterviewPrepPage } from '../../pages/InterviewPrepPage';
import { ActionCenterPage } from '../../pages/ActionCenterPage';

/* ================= Top Navbar Sub-Component ================= */
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { setCommandPaletteOpen, setQuickAddOpen } = useUI();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="app-navbar">
      {/* Brand Logo & Title */}
      <div className="navbar-brand-group">
        <div className="navbar-brand-badge">JT</div>
        <div>
          <h1 className="navbar-brand-title">JobTracker</h1>
          <p className="navbar-brand-subtitle">Pipeline & AI Copilot</p>
        </div>
      </div>

      {/* Center Search Trigger (Cmd + K) */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="navbar-search-btn"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={14} color="#94A3B8" />
          <span>Search applications, companies, or commands...</span>
        </div>
        <kbd style={{ padding: '2px 6px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748B', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          ⌘K
        </kbd>
      </button>

      {/* Right User Controls & CTA */}
      <div className="navbar-actions">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setQuickAddOpen(true)}
        >
          New Application
        </Button>

        {/* User Account Menu */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="navbar-user-trigger"
            >
              <div className="navbar-user-avatar">
                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || user.email}
              </span>
              <ChevronDown size={14} color="#94A3B8" />
            </button>

            {userMenuOpen && (
              <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '260px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 12px 24px -4px rgba(15,23,42,0.12),0 4px 6px -2px rgba(15,23,42,0.04)', border: '1px solid #E2E8F0', padding: '14px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{user.name || 'Job Seeker'}</p>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>{user.email}</p>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    {user.isVerified ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
                        <CheckCircle2 size={12} /> Verified Account
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600, backgroundColor: '#FFFBEB', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
                        <AlertTriangle size={12} /> Unverified (Check Email)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#E11D48', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <LogOut size={16} />
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

/* ================= Left Sidebar Sub-Component ================= */
const Sidebar: React.FC = () => {
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

/* ================= Consolidated App Shell Layout ================= */
export const AppLayout: React.FC = () => {
  const { activePage, selectedAppId, closeDrawer, drawerTab, setDrawerTab } = useUI();

  const renderActivePage = () => {
    switch (activePage) {
      case 'pipeline':
        return <PipelinePage />;
      case 'ats':
        return <AtsPage />;
      case 'prep':
        return <InterviewPrepPage />;
      case 'action':
        return <ActionCenterPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout-root">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Sidebar + Active Page */}
      <div className="app-main-layout">
        <Sidebar />
        <main className="app-content-area">{renderActivePage()}</main>
      </div>

      {/* Global Slide-Over Drawer */}
      <Drawer
        isOpen={Boolean(selectedAppId)}
        onClose={closeDrawer}
        applicationId={selectedAppId}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
      />

      {/* Global Quick Add Modal */}
      <QuickAddModal />

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
};
