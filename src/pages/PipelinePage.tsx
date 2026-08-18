import React, { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  Plus,
  Search,
  LayoutList,
  Kanban as KanbanIcon,
  Sparkles,
  FolderPlus,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar,
  Trash2,
  FileEdit,
  Mail,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CompanyAvatar } from '../components/ui/CompanyAvatar';
import { StageDropdown } from '../components/ui/StageDropdown';
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
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'company' | 'salary'>('newest');
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
    { id: 'Offer', title: 'Offer' },
    { id: 'Archived', title: 'Archived' },
  ];

  // Stage change handler
  const handleStageChange = async (appId: string, targetStage: PipelineStage) => {
    const previous = [...applications];
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

    try {
      await api.updateApplicationStage(appId, targetStage);
    } catch (err) {
      console.error('Failed to update stage:', err);
      setApplications(previous);
    }
  };

  // Delete handler
  const handleDeleteApplication = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this application from your tracker?')) return;
    try {
      await api.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  // Drag & Drop handlers
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

    handleStageChange(appId, targetStage);
  };

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesQuery =
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStage =
          selectedStageFilter === 'All' || app.stage === selectedStageFilter;

        return matchesQuery && matchesStage;
      })
      .sort((a, b) => {
        if (sortBy === 'company') {
          return a.companyName.localeCompare(b.companyName);
        }
        if (sortBy === 'salary') {
          const salA = a.salary?.max || a.salary?.min || 0;
          const salB = b.salary?.max || b.salary?.min || 0;
          return salB - salA;
        }
        // Default newest
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [applications, searchQuery, selectedStageFilter, sortBy]);

  // Stage count statistics for filter pills
  const stageFilterCounts = useMemo(() => {
    const counts: Record<string, number> = { All: applications.length };
    applications.forEach((a) => {
      counts[a.stage] = (counts[a.stage] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const activeInterviewsCount = applications.filter((a) => a.stage === 'Interviewing').length;
  const activeOffersCount = applications.filter((a) => a.stage === 'Offer').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1500px] mx-auto flex flex-col min-h-screen">
      {/* Top Simplify-Style Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>Job Applications</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2B59FF] border border-[#BFDBFE]">
              {applications.length} Tracked
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Centralized search pipeline • {activeInterviewsCount} interviewing • {activeOffersCount} offers
          </p>
        </div>

        {/* View Mode Switcher + Add Application Button */}
        <div className="flex items-center gap-3">
          {/* Table / Kanban View Toggle */}
          <div className="bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-xs flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#2B59FF] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#2B59FF] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(true)}
            className="bg-[#2B59FF] hover:bg-[#1E46E6]"
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* Simplify-Style Search & Filter Toolbar */}
      <div className="p-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search Input Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by company, role, or location..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all placeholder-[#94A3B8]"
          />
        </div>

        {/* Center/Right: Stage Filter Pills & Sort */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {['All', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Wishlist', 'Archived'].map((stg) => {
              const count = stageFilterCounts[stg] || 0;
              const isSelected = selectedStageFilter === stg;
              return (
                <button
                  key={stg}
                  onClick={() => setSelectedStageFilter(stg)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  <span>{stg}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort applications"
              className="pl-7 pr-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#475569] outline-none hover:border-[#CBD5E1] cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="company">Sort: Company A-Z</option>
              <option value="salary">Sort: Salary High-Low</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-[#94A3B8] absolute left-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main View Area: Table View or Kanban Board */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white border border-[#E2E8F0] rounded-2xl text-center space-y-4 shadow-sm my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2B59FF] flex items-center justify-center text-2xl font-bold shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-[#0F172A]">Track Your First Application</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Add your applied jobs to organize interviews, run ATS keyword matching, and draft follow-up emails.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(true)}
            className="bg-[#2B59FF] hover:bg-[#1E46E6]"
          >
            Add Application
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= SIMPLIFY-GRADE TABLE VIEW ================= */
        <div className="simplify-table-wrapper">
          <div className="overflow-x-auto">
            <table className="simplify-table">
              <thead>
                <tr>
                  <th className="simplify-th">Company & Role</th>
                  <th className="simplify-th">Status</th>
                  <th className="simplify-th">Applied Date</th>
                  <th className="simplify-th">Work Model & Location</th>
                  <th className="simplify-th">Compensation</th>
                  <th className="simplify-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[#64748B]">
                      No applications found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const salaryFormatted =
                      app.salary && (app.salary.min || app.salary.max)
                        ? `$${(app.salary.min || 0) / 1000}k - $${(app.salary.max || 0) / 1000}k`
                        : '—';

                    const appliedDateStr = app.appliedDate
                      ? new Date(app.appliedDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        });

                    return (
                      <tr
                        key={app._id}
                        onClick={() => openDrawer(app._id)}
                        className="simplify-tr group"
                      >
                        {/* Company & Role Column */}
                        <td className="simplify-td">
                          <div className="flex items-center gap-3">
                            <CompanyAvatar name={app.companyName} size="md" />
                            <div>
                              <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#2B59FF] transition-colors">
                                {app.companyName}
                              </p>
                              <p className="text-xs font-medium text-[#475569]">
                                {app.roleTitle}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Interactive Status Pill Dropdown */}
                        <td className="simplify-td" onClick={(e) => e.stopPropagation()}>
                          <StageDropdown
                            stage={app.stage}
                            onChange={(newStage) => handleStageChange(app._id, newStage)}
                          />
                        </td>

                        {/* Applied Date */}
                        <td className="simplify-td font-mono-tabular text-xs text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                            <span>{appliedDateStr}</span>
                          </div>
                        </td>

                        {/* Location & Work Model */}
                        <td className="simplify-td">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F1F5F9] text-[#475569]">
                              {app.workModel || 'Remote'}
                            </span>
                            {app.location && (
                              <span className="text-xs text-[#64748B] flex items-center gap-1 truncate max-w-[140px]">
                                <MapPin className="w-3 h-3 text-[#94A3B8]" />
                                {app.location}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Salary */}
                        <td className="simplify-td font-mono-tabular text-xs font-semibold text-[#059669]">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-[#059669]" />
                            <span>{salaryFormatted}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="simplify-td text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDrawer(app._id, 'prep')}
                              title="Interview Prep"
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] transition-colors cursor-pointer"
                            >
                              <FileEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDrawer(app._id, 'overview')}
                              title="Draft Follow-up"
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2B59FF] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteApplication(e, app._id)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDrawer(app._id)}
                              title="View Details"
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= SIMPLIFY-GRADE KANBAN VIEW ================= */
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1 overflow-x-auto pb-4 items-start">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                applications={filteredApplications.filter((app) => app.stage === col.id)}
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
