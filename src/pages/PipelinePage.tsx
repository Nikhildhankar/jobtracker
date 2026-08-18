import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Plus, Filter, Sparkles, FolderPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { KanbanCard } from '../components/kanban/KanbanCard';
import { QuickAddModal } from '../components/modals/QuickAddModal';
import { useUI } from '../context/useUI';
import { api } from '../services/api';
import type { ApplicationData } from '../services/api';
import type { PipelineStage } from '../../server/models/Application';

export const PipelinePage: React.FC = () => {
  const { setQuickAddOpen, openDrawer, updateStageCounts } = useUI();

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<ApplicationData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getApplications();
      setApplications(res.applications || []);

      const counts: Record<PipelineStage, number> = {
        Wishlist: 0,
        Applied: 0,
        Screening: 0,
        Interviewing: 0,
        Offer: 0,
        Archived: 0,
      };
      (res.applications || []).forEach((app) => {
        if (counts[app.stage] !== undefined) {
          counts[app.stage] += 1;
        }
      });
      updateStageCounts(counts);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, [updateStageCounts]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const columns: Array<{ id: PipelineStage; title: string }> = [
    { id: 'Wishlist', title: 'Wishlist' },
    { id: 'Applied', title: 'Applied' },
    { id: 'Screening', title: 'Screening' },
    { id: 'Interviewing', title: 'Interviewing' },
    { id: 'Offer', title: 'Offer Received' },
    { id: 'Archived', title: 'Archived / Rejected' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = applications.find((app) => app._id === active.id);
    if (found) {
      setActiveCard(found);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const appId = active.id as string;
    const targetStage = over.id as PipelineStage;

    const currentApp = applications.find((app) => app._id === appId);
    if (!currentApp || currentApp.stage === targetStage) return;

    // Optimistic UI Update
    const previousApplications = [...applications];
    setApplications((prev) =>
      prev.map((app) =>
        app._id === appId
          ? {
              ...app,
              stage: targetStage,
              stageHistory: [
                ...app.stageHistory,
                { stage: targetStage, timestamp: new Date().toISOString() },
              ],
            }
          : app
      )
    );

    // Sync with backend API
    try {
      await api.updateApplicationStage(appId, targetStage);
    } catch (err) {
      console.error('Failed to sync stage update:', err);
      // Rollback on error
      setApplications(previousApplications);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Pipeline Kanban</h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Drag applications across columns to record stage transitions in your timeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
            Filter
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(true)}
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* 6 Column Board Layout */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 bg-[#F1F5F9] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white border border-[#E2E8F0] rounded-2xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-xl font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-[#0F172A]">Your Kanban Board is Empty</h3>
            <p className="text-xs text-[#7C8896] leading-relaxed">
              Add job applications to track recruiters, structure interview prep, and get follow-up nudges.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(true)}
          >
            Add Your First Application
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1 overflow-x-auto pb-4 items-start">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                applications={applications.filter((app) => app.stage === col.id)}
                onCardClick={(appId) => openDrawer(appId)}
                onAddClick={() => setQuickAddOpen(true)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? <KanbanCard application={activeCard} onClick={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal onSuccess={fetchApplications} />
    </div>
  );
};
