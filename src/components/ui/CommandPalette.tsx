import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutDashboard, Kanban, FileText, MessageSquare, AlertCircle, Plus } from 'lucide-react';
import { useUI } from '../../context/useUI';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActivePage, setQuickAddOpen } = useUI();
  const [query, setQuery] = useState('');

  const handleSelect = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
    setQuery('');
  };

  const navItems = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Analytics',
      icon: <LayoutDashboard className="w-4 h-4" />,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      action: () => setActivePage('dashboard'),
    },
    {
      id: 'nav-pipeline',
      label: 'Go to Pipeline Kanban Board',
      category: 'Pipeline',
      icon: <Kanban className="w-4 h-4" />,
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
      action: () => setActivePage('pipeline'),
    },
    {
      id: 'nav-ats',
      label: 'Go to ATS Resume Builder',
      category: 'AI Optimizer',
      icon: <FileText className="w-4 h-4" />,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      action: () => setActivePage('ats'),
    },
    {
      id: 'nav-prep',
      label: 'Go to AI Interview Prep',
      category: 'AI Coach',
      icon: <MessageSquare className="w-4 h-4" />,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      action: () => setActivePage('prep'),
    },
    {
      id: 'nav-action',
      label: 'Go to Action Center (Follow-ups)',
      category: 'Reminders',
      icon: <AlertCircle className="w-4 h-4" />,
      iconBg: '#FFF1F2',
      iconColor: '#E11D48',
      action: () => setActivePage('action'),
    },
    {
      id: 'action-quickadd',
      label: 'Add New Job Application',
      category: 'Quick Action',
      icon: <Plus className="w-4 h-4" />,
      iconBg: '#EFF6FF',
      iconColor: '#2B59FF',
      action: () => setQuickAddOpen(true),
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="cmd-palette-backdrop">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            style={{ position: 'fixed', inset: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="cmd-palette-modal"
            style={{ position: 'relative', zIndex: 10 }}
          >
            {/* Search Input Bar */}
            <div className="cmd-palette-search-bar">
              <Search className="w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, navigate pages, or add applications..."
                className="cmd-palette-search-input"
              />
              <span style={{ padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="cmd-palette-results-list">
              {filteredItems.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                  No commands or matching items found.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.action)}
                    className="cmd-palette-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          backgroundColor: item.iconBg,
                          color: item.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="cmd-palette-category-badge">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer Shortcuts */}
            <div className="cmd-palette-footer">
              <span>Quick Navigation</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <span><kbd style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>↑↓</kbd> navigate</span>
                <span><kbd style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>↵</kbd> select</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
