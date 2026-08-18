import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import type { ApplicationData } from '../../services/api';
import type { PipelineStage } from '../../../server/models/Application';

export interface KanbanColumnProps {
  id: PipelineStage;
  title: string;
  applications: ApplicationData[];
  onCardClick: (appId: string) => void;
  onAddClick: () => void;
}

const COLUMN_COLORS: Record<PipelineStage, { dot: string; headerBg: string }> = {
  Wishlist: { dot: 'bg-[#64748B]', headerBg: 'bg-[#F1F5F9]' },
  Applied: { dot: 'bg-[#2563EB]', headerBg: 'bg-[#EFF6FF]' },
  Screening: { dot: 'bg-[#D97706]', headerBg: 'bg-[#FFFBEB]' },
  Interviewing: { dot: 'bg-[#7C3AED]', headerBg: 'bg-[#F5F3FF]' },
  Offer: { dot: 'bg-[#059669]', headerBg: 'bg-[#ECFDF5]' },
  Archived: { dot: 'bg-[#71717A]', headerBg: 'bg-[#F4F4F5]' },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  applications,
  onCardClick,
  onAddClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const cardIds = applications.map((app) => app._id);
  const colStyle = COLUMN_COLORS[id] || COLUMN_COLORS.Wishlist;

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#F8FAFC] border rounded-2xl p-3 flex flex-col max-h-full space-y-3 min-w-[260px] transition-colors ${
        isOver ? 'border-[#2B59FF] bg-[#EFF6FF]/60 ring-2 ring-[#2B59FF]/20' : 'border-[#E2E8F0]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colStyle.dot}`} />
          <span className="text-xs font-bold text-[#0F172A] tracking-tight">{title}</span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#475569] bg-white border border-[#E2E8F0] rounded-full shadow-xs">
            {applications.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          title="Add application to this stage"
          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-white transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Droppable Card List */}
      <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5 min-h-[140px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <KanbanCard
              key={app._id}
              application={app}
              onClick={() => onCardClick(app._id)}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="h-28 border-2 border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-xs text-[#94A3B8] font-medium select-none">
            Drop applications here
          </div>
        )}
      </div>
    </div>
  );
};
