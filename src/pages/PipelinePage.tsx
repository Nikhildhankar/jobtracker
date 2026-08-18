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
    <div className="pipeline-page-container">
      {/* Top Header Banner */}
      <div className="pipeline-header-bar">
        <div>
          <h1 className="pipeline-header-title">
            <span>Job Applications</span>
            <span className="pipeline-count-tag">{applications.length} Tracked</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Centralized search pipeline • {activeInterviewsCount} interviewing • {activeOffersCount} offers
          </p>
        </div>

        {/* View Mode Switcher + Add Application Button */}
        <div className="pipeline-controls-group">
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode('table')}
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            >
              <LayoutList size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
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
      <div className="pipeline-filter-toolbar">
        {/* Left: Search Input Bar */}
        <div className="pipeline-search-input-wrap">
          <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by company, role, or location..."
            className="pipeline-search-input-field"
          />
        </div>

        {/* Center/Right: Stage Filter Pills & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          <div className="pipeline-stage-filter-list">
            {['All', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Wishlist', 'Archived'].map((stg) => {
              const count = stageFilterCounts[stg] || 0;
              const isSelected = selectedStageFilter === stg;
              return (
                <button
                  key={stg}
                  onClick={() => setSelectedStageFilter(stg)}
                  className={`stage-filter-pill ${isSelected ? 'active' : ''}`}
                >
                  <span>{stg}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort applications"
              className="sort-dropdown-select"
            >
              <option value="newest">Sort: Newest</option>
              <option value="company">Sort: Company A-Z</option>
              <option value="salary">Sort: Salary High-Low</option>
            </select>
            <ArrowUpDown size={12} color="#94A3B8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Main View Area: Table View or Kanban Board */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: '64px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px' }} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ padding: '48px 24px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
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
        /* ================= SIMPLIFY-GRADE TABLE VIEW ================= */
        <div className="simplify-table-wrapper">
          <div style={{ overflowX: 'auto' }}>
            <table className="simplify-table">
              <thead>
                <tr>
                  <th className="simplify-th">Company & Role</th>
                  <th className="simplify-th">Status</th>
                  <th className="simplify-th">Applied Date</th>
                  <th className="simplify-th">Work Model & Location</th>
                  <th className="simplify-th">Compensation</th>
                  <th className="simplify-th" style={{ textAlign: 'right' }}>Actions</th>
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
                        className="simplify-tr"
                      >
                        {/* Company & Role Column */}
                        <td className="simplify-td">
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

                        {/* Interactive Status Pill Dropdown */}
                        <td className="simplify-td" onClick={(e) => e.stopPropagation()}>
                          <StageDropdown
                            stage={app.stage}
                            onChange={(newStage) => handleStageChange(app._id, newStage)}
                          />
                        </td>

                        {/* Applied Date */}
                        <td className="simplify-td" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#94A3B8" />
                            <span>{appliedDateStr}</span>
                          </div>
                        </td>

                        {/* Location & Work Model */}
                        <td className="simplify-td">
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

                        {/* Salary */}
                        <td className="simplify-td" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} color="#059669" />
                            <span>{salaryFormatted}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="simplify-td" style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
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
        /* ================= SIMPLIFY-GRADE KANBAN VIEW ================= */
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban-columns-grid">
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
