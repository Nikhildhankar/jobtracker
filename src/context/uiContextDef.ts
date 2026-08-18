import { createContext } from 'react';

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

export interface UIContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
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

export const UIContext = createContext<UIContextType | undefined>(undefined);
