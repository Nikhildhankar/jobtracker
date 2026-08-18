import React, { useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, AlertCircle, Plus, Sparkles, FolderPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/dashboard/StatCard';
import { FunnelVisualizer } from '../components/dashboard/FunnelVisualizer';
import { useUI } from '../context/UIContext';
import { api } from '../services/api';
import type { DashboardStats, AttentionItem, ActivityItem } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { setQuickAddOpen, openDrawer, updateStageCounts } = useUI();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attention, setAttention] = useState<AttentionItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
    };

    fetchDashboardData();
  }, [updateStageCounts]);

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Job Hunt Overview</h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Track applications, monitor conversion funnel, and respond to follow-up alerts.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setQuickAddOpen(true)}>
          New Application
        </Button>
      </div>

      {/* Zero Applications Onboarding Banner */}
      {!loading && !hasApplications && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] border border-[#BFDBFE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#BFDBFE] rounded-full text-xs font-semibold text-[#2563EB]">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to JobTracker
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Start tracking your career pipeline</h2>
            <p className="text-xs text-[#475569] max-w-lg leading-relaxed">
              Add your target job applications to unlock ATS keyword optimization, automated stale follow-up alerts, and AI interview prep.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<FolderPlus className="w-5 h-5" />}
            onClick={() => setQuickAddOpen(true)}
          >
            Add First Application
          </Button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Applications"
          value={stats ? stats.totalActive : 0}
          icon={<Briefcase className="w-4 h-4" />}
          iconBgColor="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
          trendText={stats && stats.addedThisWeek > 0 ? `+${stats.addedThisWeek} this week` : undefined}
          trendType="positive"
          subtext="Active pipeline"
          isLoading={loading}
        />

        <StatCard
          title="Active Interviews"
          value={stageCounts.Interviewing}
          icon={<Sparkles className="w-4 h-4" />}
          iconBgColor="bg-[#F5F3FF]"
          iconColor="text-[#7C3AED]"
          subtext="Interviewing loops"
          isLoading={loading}
        />

        <StatCard
          title="Response Rate"
          value={stats ? `${stats.responseRatePct}%` : '0%'}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-[#ECFDF5]"
          iconColor="text-[#059669]"
          subtext="Applied to response"
          isLoading={loading}
        />

        <StatCard
          title="Action Needed Today"
          value={attention.length}
          icon={<AlertCircle className="w-4 h-4" />}
          iconBgColor="bg-[#FFE4E6]"
          iconColor="text-[#E11D48]"
          trendText={attention.length > 0 ? `${attention.length} Alert${attention.length > 1 ? 's' : ''}` : 'All Clear'}
          trendType={attention.length > 0 ? 'warning' : 'positive'}
          isLoading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Funnel & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Funnel Visualizer */}
          <FunnelVisualizer counts={stageCounts} isLoading={loading} />

          {/* Recent Activity Stream */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Recent Pipeline Activity</h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[#F1F5F9] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7C8896]">
                No recent activity logged yet. Add applications or update stages to see activity history.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openDrawer(item.applicationId)}
                    className="py-3.5 flex items-center justify-between hover:bg-[#F8FAFC] px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center font-bold text-[#2563EB]">
                        {item.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{item.roleTitle}</p>
                        <p className="text-xs text-[#475569]">{item.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge stage={item.stage} size="sm" />
                      <span className="text-xs text-[#7C8896] font-mono-tabular">
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attention Needed Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0F172A]">Needs Attention Today</h3>
              <Badge variant="rose" size="sm">
                {attention.length} Alert{attention.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-24 bg-[#F1F5F9] rounded-xl animate-pulse" />
              </div>
            ) : attention.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-1">
                <p className="text-xs font-semibold text-[#059669]">All Caught Up!</p>
                <p className="text-[11px] text-[#059669]">No stale applications or urgent follow-ups today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attention.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      item.type === 'stale'
                        ? 'bg-[#FFF1F2] border-[#FECDD3]'
                        : 'bg-[#F5F3FF] border-[#DDD6FE]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          item.type === 'stale' ? 'text-[#E11D48]' : 'text-[#7C3AED]'
                        }`}
                      >
                        {item.type === 'stale'
                          ? `Stale > ${item.daysStale || 7} Days`
                          : 'Upcoming Interview'}
                      </span>
                      <span
                        className={`text-[11px] font-mono ${
                          item.type === 'stale' ? 'text-[#E11D48]' : 'text-[#7C3AED]'
                        }`}
                      >
                        {item.type === 'stale' ? 'Follow up' : 'In 48 hrs'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#0F172A]">
                      {item.companyName} • {item.roleTitle}
                    </p>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() =>
                        openDrawer(item.id, item.type === 'stale' ? 'overview' : 'prep')
                      }
                    >
                      {item.type === 'stale' ? 'Generate AI Follow-up Draft' : 'Review Prep Notes'}
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
