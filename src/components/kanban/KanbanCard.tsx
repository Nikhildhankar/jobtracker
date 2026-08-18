import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';
import type { ApplicationData } from '../../services/api';

export interface KanbanCardProps {
  application: ApplicationData;
  onClick: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ application, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
    data: { application },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate days in current stage
  const now = new Date();
  const lastHistory = application.stageHistory && application.stageHistory.length > 0
    ? new Date(application.stageHistory[application.stageHistory.length - 1].timestamp)
    : new Date(application.updatedAt || application.createdAt);
  const daysInStage = Math.floor((now.getTime() - lastHistory.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = ['Applied', 'Screening'].includes(application.stage) && daysInStage >= 7;

  // Format salary
  const salaryText = application.salary && (application.salary.min || application.salary.max)
    ? `$${(application.salary.min || 0) / 1000}k - $${(application.salary.max || 0) / 1000}k`
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        'spring-card p-4 cursor-grab active:cursor-grabbing space-y-3 select-none touch-none',
        isDragging && 'opacity-50 ring-2 ring-[#2563EB] shadow-2xl scale-[1.02]',
        isStale && 'border-[#FECDD3] bg-[#FFF1F2]/20'
      )}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] font-bold text-xs flex items-center justify-center uppercase">
            {application.companyName.charAt(0)}
          </div>
          <span className="text-xs font-bold text-[#0F172A] truncate max-w-[120px]">
            {application.companyName}
          </span>
        </div>

        {isStale ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
            <AlertCircle className="w-3 h-3" /> {daysInStage}d stale
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#7C8896]">
            {daysInStage === 0 ? 'Today' : `${daysInStage}d ago`}
          </span>
        )}
      </div>

      {/* Role Title */}
      <h4 className="text-sm font-semibold text-[#0F172A] leading-snug truncate">
        {application.roleTitle}
      </h4>

      {/* Bottom Metadata Badges */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F1F5F9]">
        <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded font-medium text-[11px]">
          {application.workModel || 'Remote'}
        </span>

        {salaryText && (
          <span className="font-mono-tabular text-[#059669] font-semibold text-[11px]">
            {salaryText}
          </span>
        )}
      </div>
    </div>
  );
};
