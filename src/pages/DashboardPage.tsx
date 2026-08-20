import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  FolderPlus,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { Button, Badge, CompanyAvatar } from '../components/ui';
import { useUI } from '../context/useUI';
import { api } from '../services/api';
import type { DashboardStats, AttentionItem, ActivityItem } from '../services/api';
import type { PipelineStage } from '../../server/models/Application';

/* ================= Conversion Funnel Visualizer Sub-Component ================= */
interface FunnelVisualizerProps {
  counts: Record<PipelineStage, number>;
  isLoading?: boolean;
}

const FunnelVisualizer: React.FC<FunnelVisualizerProps> = ({ counts, isLoading }) => {
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

/* ================= Consolidated Dashboard Page ================= */
export const DashboardPage: React.FC = () => {
  const { setQuickAddOpen, openDrawer, updateStageCounts, setActivePage } = useUI();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attention, setAttention] = useState<AttentionItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, attentionData, activityData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getDashboardAttention().catch(() => null),
        api.getDashboardActivity().catch(() => null),
      ]);

      if (statsData) {
        setStats(statsData);
        updateStageCounts(statsData.stageCounts);
      }
      if (attentionData) {
        const combined = [
          ...(attentionData.staleApplications || []),
          ...(attentionData.upcomingInterviews || []),
        ];
        setAttention(combined);
        updateStageCounts({ actionNeeded: combined.length });
      }
      if (activityData) {
        setActivities(activityData.activity || []);
      }
    } finally {
      setLoading(false);
    }
  }, [updateStageCounts]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stageCounts = stats?.stageCounts || {
    Wishlist: 0,
    Applied: 0,
    Screening: 0,
    Interviewing: 0,
    Offer: 0,
    Archived: 0,
  };

  const hasApplications = stats && stats.totalAll > 0;

  return (
    <div className="page-container">
      {/* Top Hero Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Job Search Insights</span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={13} /> Live Analytics
            </span>
          </h1>
          <p className="page-header-desc">
            Monitor conversion rates, response timelines, and stay on top of recruiter follow-ups.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivePage('pipeline')}
            icon={<ArrowRight size={14} />}
          >
            View Pipeline
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setQuickAddOpen(true)}
          >
            New Application
          </Button>
        </div>
      </div>

      {/* Zero Applications Onboarding Banner */}
      {!loading && !hasApplications && (
        <div style={{ padding: '32px', borderRadius: '18px', background: 'linear-gradient(135deg, #EFF6FF, #ffffff, #F5F3FF)', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>
            <Sparkles size={14} /> Welcome to JobTracker
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Start tracking your career pipeline</h2>
          <p style={{ fontSize: '13px', color: '#475569', maxWidth: '600px', lineHeight: 1.5 }}>
            Add your target job applications to unlock ATS keyword optimization, automated stale follow-up alerts, and AI interview prep.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={<FolderPlus size={18} />}
            onClick={() => setQuickAddOpen(true)}
          >
            Add First Application
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Active Pipeline */}
        <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Active Pipeline</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2B59FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0F172A', lineHeight: 1 }}>{stats ? stats.totalActive : 0}</span>
            {stats && stats.addedThisWeek > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#EFF6FF', color: '#2B59FF' }}>
                +{stats.addedThisWeek} this week
              </span>
            )}
          </div>
        </div>

        {/* Interview Loops */}
        <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Interview Loops</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0F172A', lineHeight: 1 }}>{stageCounts.Interviewing}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              In progress
            </span>
          </div>
        </div>

        {/* Response Rate */}
        <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Response Rate</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0F172A', lineHeight: 1 }}>{stats ? `${stats.responseRatePct}%` : '0%'}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#ECFDF5', color: '#059669' }}>
              Avg {stats?.avgDaysToResponse || 7}d
            </span>
          </div>
        </div>

        {/* Offers Received */}
        <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Offers Received</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669', lineHeight: 1 }}>{stageCounts.Offer}</span>
            {attention.length > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> {attention.length} Alert{attention.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel + Activity + Priority Action */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Funnel & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>
          <FunnelVisualizer counts={stageCounts} isLoading={loading} />

          {/* Activity Section */}
          <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Recent Pipeline Activity</h3>
              <button
                onClick={() => setActivePage('pipeline')}
                style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ height: '48px', backgroundColor: '#F1F5F9', borderRadius: '12px' }} />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                No recent activity logged yet. Add applications or update stages to see activity history.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activities.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openDrawer(item.applicationId)}
                    style={{ padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', cursor: 'pointer', transition: 'background-color 140ms ease' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CompanyAvatar name={item.companyName} size="md" />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{item.roleTitle}</p>
                        <p style={{ fontSize: '12px', color: '#64748B' }}>{item.companyName}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Badge stage={item.stage} size="sm" />
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Priority Action & Attention */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#D97706" />
                <span>Priority Action</span>
              </h3>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#FFE4E6', color: '#E11D48' }}>
                {attention.length} Alert{attention.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div style={{ height: '96px', backgroundColor: '#F1F5F9', borderRadius: '12px' }} />
            ) : attention.length === 0 ? (
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>All Caught Up!</p>
                <p style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>No stale applications or urgent follow-ups today.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {attention.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    style={{ padding: '16px', borderRadius: '16px', border: `1px solid ${item.type === 'stale' ? '#FECDD3' : '#DDD6FE'}`, backgroundColor: item.type === 'stale' ? '#FFF1F2' : '#F5F3FF', display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.type === 'stale' ? '#E11D48' : '#7C3AED' }}>
                        {item.type === 'stale' ? `Stale > ${item.daysStale || 7} Days` : 'Upcoming Interview'}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', backgroundColor: item.type === 'stale' ? '#FFE4E6' : '#F5F3FF', color: item.type === 'stale' ? '#E11D48' : '#7C3AED' }}>
                        {item.type === 'stale' ? 'Follow up' : 'In 48 hrs'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CompanyAvatar name={item.companyName} size="sm" />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{item.roleTitle}</p>
                        <p style={{ fontSize: '11px', color: '#64748B' }}>{item.companyName}</p>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openDrawer(item.id, item.type === 'stale' ? 'overview' : 'prep')}
                    >
                      {item.type === 'stale' ? 'Draft Follow-up Email' : 'Review Prep Notes'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
