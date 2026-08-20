import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { Drawer } from '../ui/Drawer';
import { QuickAddModal } from '../modals/QuickAddModal';
import { useUI } from '../../context/useUI';

import { DashboardPage } from '../../pages/DashboardPage';
import { PipelinePage } from '../../pages/PipelinePage';
import { AtsPage } from '../../pages/AtsPage';
import { InterviewPrepPage } from '../../pages/InterviewPrepPage';
import { ActionCenterPage } from '../../pages/ActionCenterPage';

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
