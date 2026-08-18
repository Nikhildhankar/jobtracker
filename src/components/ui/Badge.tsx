import React from 'react';
import { clsx } from 'clsx';
import type { PipelineStage } from '../../../server/models/Application';

export interface BadgeProps {
  stage?: PipelineStage | string;
  variant?: 'stage' | 'neutral' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky';
  size?: 'sm' | 'md';
  count?: number;
  showDot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  stage,
  variant,
  size = 'md',
  count,
  showDot = true,
  children,
  className,
}) => {
  const getStageStyles = (stageName?: string) => {
    switch (stageName) {
      case 'Wishlist':
        return {
          bg: 'bg-[#F1F5F9]',
          text: 'text-[#64748B]',
          border: 'border-[#E2E8F0]',
          dot: 'bg-[#64748B]',
        };
      case 'Applied':
        return {
          bg: 'bg-[#EFF6FF]',
          text: 'text-[#2563EB]',
          border: 'border-[#BFDBFE]',
          dot: 'bg-[#2563EB]',
        };
      case 'Screening':
        return {
          bg: 'bg-[#FFFBEB]',
          text: 'text-[#D97706]',
          border: 'border-[#FDE68A]',
          dot: 'bg-[#D97706]',
        };
      case 'Interviewing':
        return {
          bg: 'bg-[#F5F3FF]',
          text: 'text-[#7C3AED]',
          border: 'border-[#DDD6FE]',
          dot: 'bg-[#7C3AED]',
        };
      case 'Offer':
      case 'Offer Received':
        return {
          bg: 'bg-[#ECFDF5]',
          text: 'text-[#059669]',
          border: 'border-[#A7F3D0]',
          dot: 'bg-[#059669]',
        };
      case 'Rejected':
        return {
          bg: 'bg-[#FFF1F2]',
          text: 'text-[#E11D48]',
          border: 'border-[#FECDD3]',
          dot: 'bg-[#E11D48]',
        };
      case 'Archived':
      default:
        return {
          bg: 'bg-[#F4F4F5]',
          text: 'text-[#71717A]',
          border: 'border-[#E4E4E7]',
          dot: 'bg-[#71717A]',
        };
    }
  };

  const getVariantStyles = (varName?: string) => {
    switch (varName) {
      case 'emerald':
        return { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', border: 'border-[#A7F3D0]', dot: 'bg-[#059669]' };
      case 'amber':
        return { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#FDE68A]', dot: 'bg-[#D97706]' };
      case 'violet':
        return { bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]', dot: 'bg-[#7C3AED]' };
      case 'rose':
        return { bg: 'bg-[#FFF1F2]', text: 'text-[#E11D48]', border: 'border-[#FECDD3]', dot: 'bg-[#E11D48]' };
      case 'sky':
        return { bg: 'bg-[#F0F9FF]', text: 'text-[#0284C7]', border: 'border-[#BAE6FD]', dot: 'bg-[#0284C7]' };
      case 'neutral':
      default:
        return { bg: 'bg-[#F8FAFC]', text: 'text-[#475569]', border: 'border-[#E2E8F0]', dot: 'bg-[#94A3B8]' };
    }
  };

  const style = stage ? getStageStyles(stage) : getVariantStyles(variant);
  const label = children || stage;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border rounded-full select-none',
        style.bg,
        style.text,
        style.border,
        size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1.5' : 'px-2.5 py-1 text-xs gap-2',
        className
      )}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="ml-0.5 font-mono text-[10px] opacity-75">({count})</span>
      )}
    </span>
  );
};
