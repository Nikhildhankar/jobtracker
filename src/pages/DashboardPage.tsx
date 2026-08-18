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
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CompanyAvatar } from '../components/ui/CompanyAvatar';
import { FunnelVisualizer } from '../components/dashboard/FunnelVisualizer';
import { useUI } from '../context/useUI';
import { api } from '../services/api';
import type { DashboardStats, AttentionItem, ActivityItem } from '../services/api';

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
    <div className="dashboard-page-container">
      {/* Top Hero Banner */}
      <div className="dashboard-hero-header">
        <div>
          <h1 className="dashboard-hero-title">
            <span>Job Search Insights</span>
            <span className="dashboard-hero-pill">
              <TrendingUp size={13} /> Live Analytics
            </span>
          </h1>
          <p className="dashboard-hero-desc">
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
        <div style={{ padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF, #ffffff, #F5F3FF)', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
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
      <div className="metrics-cards-row">
        {/* Active Pipeline */}
        <div className="metric-kpi-card">
          <div className="metric-kpi-top">
            <span className="metric-kpi-label">Active Pipeline</span>
            <div className="metric-kpi-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2B59FF' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div className="metric-kpi-bottom">
            <span className="metric-kpi-value">{stats ? stats.totalActive : 0}</span>
            {stats && stats.addedThisWeek > 0 && (
              <span className="metric-kpi-tag" style={{ backgroundColor: '#EFF6FF', color: '#2B59FF' }}>
                +{stats.addedThisWeek} this week
              </span>
            )}
          </div>
        </div>

        {/* Interview Loops */}
        <div className="metric-kpi-card">
          <div className="metric-kpi-top">
            <span className="metric-kpi-label">Interview Loops</span>
            <div className="metric-kpi-icon-wrap" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div className="metric-kpi-bottom">
            <span className="metric-kpi-value">{stageCounts.Interviewing}</span>
            <span className="metric-kpi-tag" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              In progress
            </span>
          </div>
        </div>

        {/* Response Rate */}
        <div className="metric-kpi-card">
          <div className="metric-kpi-top">
            <span className="metric-kpi-label">Response Rate</span>
            <div className="metric-kpi-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-kpi-bottom">
            <span className="metric-kpi-value">{stats ? `${stats.responseRatePct}%` : '0%'}</span>
            <span className="metric-kpi-tag" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              Avg {stats?.avgDaysToResponse || 7}d
            </span>
          </div>
        </div>

        {/* Offers Received */}
        <div className="metric-kpi-card">
          <div className="metric-kpi-top">
            <span className="metric-kpi-label">Offers Received</span>
            <div className="metric-kpi-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <Award size={16} />
            </div>
          </div>
          <div className="metric-kpi-bottom">
            <span className="metric-kpi-value" style={{ color: '#059669' }}>{stageCounts.Offer}</span>
            {attention.length > 0 && (
              <span className="metric-kpi-tag" style={{ backgroundColor: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> {attention.length} Alert{attention.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel + Activity + Priority Action */}
      <div className="dashboard-main-grid">
        {/* Left Column: Funnel & Activity */}
        <div className="dashboard-left-col">
          <FunnelVisualizer counts={stageCounts} isLoading={loading} />

          {/* Activity Section */}
          <div className="dashboard-card-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Recent Pipeline Activity</h3>
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
        <div className="dashboard-right-col">
          <div className="dashboard-card-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
