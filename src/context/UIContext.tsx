import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UIContext } from './uiContextDef';
import type { ActivePage, StageCounts } from './uiContextDef';

export type { ActivePage, StageCounts, UIContextType } from './uiContextDef';

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'timeline' | 'prep' | 'docs'>('overview');

  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const [stageCounts, setStageCounts] = useState<StageCounts>({
    Wishlist: 0,
    Applied: 0,
    Screening: 0,
    Interviewing: 0,
    Offer: 0,
    Archived: 0,
    actionNeeded: 0,
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const openDrawer = useCallback((appId: string, initialTab: 'overview' | 'timeline' | 'prep' | 'docs' = 'overview') => {
    setSelectedAppId(appId);
    setDrawerTab(initialTab);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedAppId(null);
  }, []);

  const updateStageCounts = useCallback((counts: Partial<StageCounts>) => {
    setStageCounts((prev) => ({ ...prev, ...counts }));
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // 'N' key (when not typing in an input/textarea) -> Quick Add Modal
      if (
        e.key.toLowerCase() === 'n' &&
        !['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase()) &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setQuickAddOpen(true);
      }

      // 'Escape' -> Close open modals/drawers
      if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (quickAddOpen) setQuickAddOpen(false);
        if (drawerOpen) closeDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, quickAddOpen, drawerOpen, closeDrawer]);

  const contextValue = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      commandPaletteOpen,
      setCommandPaletteOpen,
      drawerOpen,
      setDrawerOpen,
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
    }),
    [
      sidebarCollapsed,
      toggleSidebar,
      commandPaletteOpen,
      drawerOpen,
      quickAddOpen,
      selectedAppId,
      drawerTab,
      openDrawer,
      closeDrawer,
      activePage,
      stageCounts,
      updateStageCounts,
    ]
  );

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};
