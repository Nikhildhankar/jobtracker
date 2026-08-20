import React, { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
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
  AlertCircle,
} from 'lucide-react';
import { Button, CompanyAvatar, StageDropdown } from '../components/ui';
import { useUI } from '../context/useUI';
import { api } from '../services/api';
import type { ApplicationData } from '../services/api';
import type { PipelineStage } from '../../server/models/Application';

/* ================= Kanban Card Sub-Component ================= */
interface KanbanCardProps {
  application: ApplicationData;
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ application, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
    data: { application },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const now = new Date();
  const lastHistory = application.stageHistory && application.stageHistory.length > 0
    ? new Date(application.stageHistory[application.stageHistory.length - 1].timestamp)
    : new Date(application.updatedAt || application.createdAt);
  const daysInStage = Math.floor((now.getTime() - lastHistory.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = ['Applied', 'Screening'].includes(application.stage) && daysInStage >= 7;

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
        'bg-white border border-[#E2E8F0] rounded-2xl p-4 cursor-grab active:cursor-grabbing space-y-3 select-none touch-none transition-all shadow-xs hover:border-[#CBD5E1] hover:shadow-md group',
        isDragging && 'opacity-50 ring-2 ring-[#2B59FF] shadow-2xl scale-[1.02]',
        isStale && 'border-[#FECDD3] bg-[#FFF1F2]/20'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CompanyAvatar name={application.companyName} size="sm" />
          <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#2B59FF] transition-colors truncate max-w-[120px]">
            {application.companyName}
          </span>
        </div>

        {isStale ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
            <AlertCircle className="w-3 h-3" /> {daysInStage}d stale
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#94A3B8]" />
            {daysInStage === 0 ? 'Today' : `${daysInStage}d ago`}
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-[#0F172A] leading-snug truncate">
        {application.roleTitle}
      </h4>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F1F5F9]">
        <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-md font-semibold text-[11px] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#94A3B8]" />
          {application.workModel || 'Remote'}
        </span>

        {salaryText ? (
          <span className="font-mono text-[#059669] font-bold text-[11px] flex items-center gap-0.5">
            <DollarSign className="w-3 h-3" />
            {salaryText}
          </span>
        ) : (
          <span className="text-[10px] text-[#94A3B8] font-mono">No salary</span>
        )}
      </div>
    </div>
  );
};

/* ================= Kanban Column Sub-Component ================= */
interface KanbanColumnProps {
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

const KanbanColumn: React.FC<KanbanColumnProps> = ({
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

/* ================= Consolidated Pipeline Page ================= */
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
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [applications, searchQuery, selectedStageFilter, sortBy]);

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
    <div className="page-container">
      {/* Top Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Job Applications</span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', backgroundColor: '#EFF6FF', color: '#2B59FF', border: '1px solid #BFDBFE' }}>
              {applications.length} Tracked
            </span>
          </h1>
          <p className="page-header-desc">
            Centralized search pipeline • {activeInterviewsCount} interviewing • {activeOffersCount} offers
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', padding: '4px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: 'none', background: viewMode === 'table' ? '#2B59FF' : 'transparent', color: viewMode === 'table' ? '#ffffff' : '#64748B', cursor: 'pointer' }}
            >
              <LayoutList size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: 'none', background: viewMode === 'kanban' ? '#2B59FF' : 'transparent', color: viewMode === 'kanban' ? '#ffffff' : '#64748B', cursor: 'pointer' }}
            >
              <KanbanIcon size={14} />
              <span>Board</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setQuickAddOpen(true)}
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div className="input-with-icon-wrap" style={{ maxWidth: '400px', flex: 1 }}>
            <Search className="input-leading-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by company, role, or location..."
              className="form-input-with-icon"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {['All', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Wishlist', 'Archived'].map((stg) => {
                const count = stageFilterCounts[stg] || 0;
                const isSelected = selectedStageFilter === stg;
                return (
                  <button
                    key={stg}
                    onClick={() => setSelectedStageFilter(stg)}
                    style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, border: '1px solid #E2E8F0', backgroundColor: isSelected ? '#0F172A' : '#F8FAFC', color: isSelected ? '#ffffff' : '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                  >
                    <span>{stg}</span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: '9999px', backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#E2E8F0', color: isSelected ? '#ffffff' : '#64748B' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort applications"
                style={{ padding: '6px 12px 6px 28px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', fontWeight: 500, color: '#475569', outline: 'none', cursor: 'pointer' }}
              >
                <option value="newest">Sort: Newest</option>
                <option value="company">Sort: Company A-Z</option>
                <option value="salary">Sort: Salary High-Low</option>
              </select>
              <ArrowUpDown size={12} color="#94A3B8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: '64px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px' }} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ padding: '48px 24px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EFF6FF', color: '#2B59FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Track Your First Application</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', maxWidth: '440px' }}>
              Add your applied jobs to organize interviews, run ATS keyword matching, and draft follow-up emails.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FolderPlus size={16} />}
            onClick={() => setQuickAddOpen(true)}
          >
            Add Application
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Company & Role</th>
                  <th style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                  <th style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Applied Date</th>
                  <th style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Work Model</th>
                  <th style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Compensation</th>
                  <th style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
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
                        style={{ cursor: 'pointer', transition: 'background-color 140ms ease' }}
                        className="hover:bg-[#F8FAFC]"
                      >
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CompanyAvatar name={app.companyName} size="md" />
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                {app.companyName}
                              </p>
                              <p style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>
                                {app.roleTitle}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9' }} onClick={(e) => e.stopPropagation()}>
                          <StageDropdown
                            stage={app.stage}
                            onChange={(newStage) => handleStageChange(app._id, newStage)}
                          />
                        </td>

                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#94A3B8" />
                            <span>{appliedDateStr}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: '#F1F5F9', color: '#475569' }}>
                              {app.workModel || 'Remote'}
                            </span>
                            {app.location && (
                              <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <MapPin size={12} color="#94A3B8" />
                                {app.location}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} color="#059669" />
                            <span>{salaryFormatted}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              onClick={() => openDrawer(app._id, 'prep')}
                              title="Interview Prep"
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer' }}
                            >
                              <FileEdit size={16} />
                            </button>
                            <button
                              onClick={() => openDrawer(app._id, 'overview')}
                              title="Draft Follow-up"
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer' }}
                            >
                              <Mail size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteApplication(e, app._id)}
                              title="Delete"
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#E11D48', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => openDrawer(app._id)}
                              title="View Details"
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#0F172A', cursor: 'pointer' }}
                            >
                              <ExternalLink size={16} />
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
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', alignItems: 'flex-start' }}>
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
    </div>
  );
};
