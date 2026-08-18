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

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  applications,
  onCardClick,
  onAddClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const cardIds = applications.map((app) => app._id);

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#F8FAFC] border rounded-2xl p-3 flex flex-col max-h-full space-y-3 min-w-[240px] transition-colors ${
        isOver ? 'border-[#2563EB] bg-[#EFF6FF]/40' : 'border-[#E2E8F0]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#0F172A]">{title}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#64748B] bg-white border border-[#E2E8F0] rounded-full">
            {applications.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1 rounded text-[#94A3B8] hover:text-[#0F172A] hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Droppable Card List */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-0.5 min-h-[120px]">
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
          <div className="h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-xs text-[#94A3B8]">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  );
};
