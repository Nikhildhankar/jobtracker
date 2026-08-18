import React from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trendText?: string;
  trendType?: 'positive' | 'neutral' | 'warning';
  subtext?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-[#EFF6FF]',
  iconColor = 'text-[#2563EB]',
  trendText,
  trendType = 'positive',
  subtext,
  isLoading = false,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3 transition-all hover:border-[#CBD5E1]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#7C8896]">{title}</span>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>

      {isLoading ? (
        <div className="h-8 w-24 bg-[#F1F5F9] rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-[#0F172A] font-mono-tabular tracking-tight">
            {value}
          </span>

          {trendText && (
            <span
              className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full border',
                trendType === 'positive' && 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
                trendType === 'neutral' && 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
                trendType === 'warning' && 'bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]'
              )}
            >
              {trendText}
            </span>
          )}

          {subtext && !trendText && <span className="text-xs text-[#7C8896]">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
