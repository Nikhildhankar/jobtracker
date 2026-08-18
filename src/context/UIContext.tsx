import React, { createContext, useContext, useState, useEffect } from 'react';

export type ActivePage = 'dashboard' | 'pipeline' | 'ats' | 'prep' | 'action';

export interface StageCounts {
  Wishlist: number;
  Applied: number;
  Screening: number;
  Interviewing: number;
  Offer: number;
  Archived: number;
  actionNeeded: number;
}

interface UIContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  selectedAppId: string | null;
  drawerTab: 'overview' | 'timeline' | 'prep' | 'docs';
  setDrawerTab: (tab: 'overview' | 'timeline' | 'prep' | 'docs') => void;
  openDrawer: (appId: string, initialTab?: 'overview' | 'timeline' | 'prep' | 'docs') => void;
  closeDrawer: () => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  stageCounts: StageCounts;
  updateStageCounts: (counts: Partial<StageCounts>) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'timeline' | 'prep' | 'docs'>('overview');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const [stageCounts, setStageCounts] = useState<StageCounts>({
    Wishlist: 3,
    Applied: 8,
    Screening: 2,
    Interviewing: 4,
    Offer: 1,
    Archived: 5,
    actionNeeded: 2,
  });

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const openDrawer = (appId: string, initialTab: 'overview' | 'timeline' | 'prep' | 'docs' = 'overview') => {
    setSelectedAppId(appId);
    setDrawerTab(initialTab);
  };

  const closeDrawer = () => {
    setSelectedAppId(null);
  };

  const updateStageCounts = (newCounts: Partial<StageCounts>) => {
    setStageCounts((prev) => ({ ...prev, ...newCounts }));
  };

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K, N, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside an input/textarea
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement)?.tagName
      );

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (quickAddOpen) {
          setQuickAddOpen(false);
        } else if (selectedAppId) {
          closeDrawer();
        }
        return;
      }

      if (!isInput && !commandPaletteOpen && !quickAddOpen && !selectedAppId) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setQuickAddOpen(true);
        } else if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          setActivePage('pipeline');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, quickAddOpen, selectedAppId]);

  return (
    <UIContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        commandPaletteOpen,
        setCommandPaletteOpen,
        quickAddOpen,
        setQuickAddOpen,
        selectedAppId,
        drawerTab,
        setDrawerTab,
        openDrawer,
        closeDrawer,
        activePage,
        setActivePage,
        stageCounts,
        updateStageCounts,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
