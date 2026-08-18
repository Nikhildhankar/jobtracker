import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Check } from 'lucide-react';
import type { PipelineStage } from '../../../server/models/Application';

export interface StageDropdownProps {
  stage: PipelineStage | string;
  onChange: (newStage: PipelineStage) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

const STAGES: Array<{ id: PipelineStage; label: string; dot: string; bg: string; text: string; border: string }> = [
  { id: 'Wishlist', label: 'Wishlist', dot: 'bg-[#64748B]', bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', border: 'border-[#E2E8F0]' },
  { id: 'Applied', label: 'Applied', dot: 'bg-[#2563EB]', bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]' },
  { id: 'Screening', label: 'Screening', dot: 'bg-[#D97706]', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
  { id: 'Interviewing', label: 'Interviewing', dot: 'bg-[#7C3AED]', bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]' },
  { id: 'Offer', label: 'Offer Received', dot: 'bg-[#059669]', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', border: 'border-[#A7F3D0]' },
  { id: 'Archived', label: 'Archived', dot: 'bg-[#71717A]', bg: 'bg-[#F4F4F5]', text: 'text-[#71717A]', border: 'border-[#E4E4E7]' },
];

export const StageDropdown: React.FC<StageDropdownProps> = ({
  stage,
  onChange,
  size = 'sm',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStage = STAGES.find((s) => s.id === stage) || STAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={clsx(
          'inline-flex items-center font-semibold rounded-full border transition-all cursor-pointer select-none group',
          currentStage.bg,
          currentStage.text,
          currentStage.border,
          size === 'sm' ? 'px-2.5 py-0.5 text-xs gap-1.5' : 'px-3 py-1 text-xs gap-2',
          disabled && 'opacity-60 pointer-events-none'
        )}
      >
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', currentStage.dot)} />
        <span>{currentStage.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-1 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5"
        >
          {STAGES.map((s) => {
            const isSelected = s.id === stage;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                  isSelected ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold' : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
                  <span>{s.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2B59FF]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
