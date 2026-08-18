import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface SegmentedTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className,
  size = 'md',
}) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-1 select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative flex items-center justify-center font-medium rounded-md transition-colors duration-150 cursor-pointer outline-none z-10',
              size === 'sm' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-3.5 py-1.5 text-sm gap-2',
              isActive ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-tab-active"
                className="absolute inset-0 bg-white rounded-md shadow-[0_1px_2px_0_rgba(15,23,42,0.08)] -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 text-[10px] font-mono rounded-full',
                  isActive ? 'bg-[#F1F5F9] text-[#0F172A]' : 'bg-[#E2E8F0] text-[#64748B]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
