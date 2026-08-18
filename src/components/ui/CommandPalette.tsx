import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutDashboard, Kanban, FileText, MessageSquare, AlertCircle, Plus } from 'lucide-react';
import { useUI } from '../../context/useUI';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActivePage, setQuickAddOpen } = useUI();
  const [query, setQuery] = useState('');

  if (!commandPaletteOpen) return null;

  const handleSelect = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
    setQuery('');
  };

  const navItems = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />,
      action: () => setActivePage('dashboard'),
    },
    {
      id: 'nav-pipeline',
      label: 'Go to Pipeline Kanban Board',
      category: 'Navigation',
      icon: <Kanban className="w-4 h-4 text-[#7C3AED]" />,
      action: () => setActivePage('pipeline'),
    },
    {
      id: 'nav-ats',
      label: 'Go to ATS Resume Builder',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-[#059669]" />,
      action: () => setActivePage('ats'),
    },
    {
      id: 'nav-prep',
      label: 'Go to AI Interview Prep',
      category: 'Navigation',
      icon: <MessageSquare className="w-4 h-4 text-[#D97706]" />,
      action: () => setActivePage('prep'),
    },
    {
      id: 'nav-action',
      label: 'Go to Action Center (Follow-ups)',
      category: 'Navigation',
      icon: <AlertCircle className="w-4 h-4 text-[#E11D48]" />,
      action: () => setActivePage('action'),
    },
    {
      id: 'action-quickadd',
      label: 'Add New Job Application',
      category: 'Quick Actions',
      icon: <Plus className="w-4 h-4 text-[#2563EB]" />,
      action: () => setQuickAddOpen(true),
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCommandPaletteOpen(false)}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 border-b border-[#E2E8F0]">
            <Search className="w-5 h-5 text-[#94A3B8] mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search applications..."
              className="w-full py-4 text-sm text-[#0F172A] bg-transparent outline-none placeholder-[#94A3B8]"
            />
            <span className="px-2 py-0.5 text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded">
              ESC
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#64748B]">
                No commands or matching items found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.action)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#E2E8F0] border border-transparent transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium group-hover:text-[#2563EB]">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#7C8896] bg-[#F1F5F9] px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#7C8896]">
            <span>Navigate with keyboard</span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span><kbd className="bg-white border px-1 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="bg-white border px-1 rounded">↵</kbd> select</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
