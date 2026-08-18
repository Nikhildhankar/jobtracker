import React from 'react';
import type { PipelineStage } from '../../../server/models/Application';

export interface FunnelVisualizerProps {
  counts: Record<PipelineStage, number>;
  isLoading?: boolean;
}

export const FunnelVisualizer: React.FC<FunnelVisualizerProps> = ({ counts, isLoading }) => {
  const stages: Array<{ id: PipelineStage; label: string; bg: string; border: string; text: string; barBg: string }> = [
    { id: 'Wishlist', label: 'Wishlist', bg: 'bg-[#F8FAFC]', border: 'border-[#E2E8F0]', text: 'text-[#64748B]', barBg: 'bg-[#64748B]' },
    { id: 'Applied', label: 'Applied', bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]', text: 'text-[#2563EB]', barBg: 'bg-[#2563EB]' },
    { id: 'Screening', label: 'Screening', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#D97706]', barBg: 'bg-[#D97706]' },
    { id: 'Interviewing', label: 'Interview', bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]', text: 'text-[#7C3AED]', barBg: 'bg-[#7C3AED]' },
    { id: 'Offer', label: 'Offer', bg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]', text: 'text-[#059669]', barBg: 'bg-[#059669]' },
    { id: 'Archived', label: 'Archived', bg: 'bg-[#F4F4F5]', border: 'border-[#E4E4E7]', text: 'text-[#71717A]', barBg: 'bg-[#71717A]' },
  ];

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Pipeline Stage Distribution</h3>
          <p className="text-xs text-[#64748B]">Visual conversion progress across active recruiting stages</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]">
          {totalAll} Total
        </span>
      </div>

      {/* Progress Bar Funnel Strip */}
      {totalAll > 0 && !isLoading && (
        <div className="h-3 w-full bg-[#F1F5F9] rounded-full overflow-hidden flex gap-0.5">
          {stages.map((stage) => {
            const count = counts[stage.id] || 0;
            const pct = (count / totalAll) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={stage.id}
                style={{ width: `${pct}%` }}
                className={`${stage.barBg} transition-all duration-500`}
                title={`${stage.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#F1F5F9] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
          {stages.map((stage) => {
            const count = counts[stage.id] || 0;
            const pct = totalAll > 0 ? Math.round((count / totalAll) * 100) : 0;
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-2xl border space-y-1 transition-all hover:scale-[1.02] ${stage.bg} ${stage.border}`}
              >
                <span className={`text-xs font-bold ${stage.text}`}>{stage.label}</span>
                <p className={`text-xl font-extrabold font-mono-tabular ${stage.text}`}>{count}</p>
                <p className="text-[10px] text-[#64748B] font-mono font-semibold">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
