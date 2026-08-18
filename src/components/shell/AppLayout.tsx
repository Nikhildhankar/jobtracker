import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { Drawer } from '../ui/Drawer';
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Sidebar + Active Page */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{renderActivePage()}</main>
      </div>

      {/* Slide-Over Drawer */}
      <Drawer
        isOpen={Boolean(selectedAppId)}
        onClose={closeDrawer}
        applicationId={selectedAppId}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
      />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};
