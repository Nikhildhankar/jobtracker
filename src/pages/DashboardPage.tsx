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
    <div className="page-container select-none">
      {/* Top Simplify Insights Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>Job Search Insights</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Analytics
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor conversion rates, response timelines, and stay on top of recruiter follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivePage('pipeline')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Pipeline
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(true)}
            className="bg-[#2B59FF] hover:bg-[#1E46E6]"
          >
            New Application
          </Button>
        </div>
      </div>

      {/* Zero Applications Onboarding Banner */}
      {!loading && !hasApplications && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] border border-[#BFDBFE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2B59FF]">
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
            className="bg-[#2B59FF] hover:bg-[#1E46E6]"
          >
            Add First Application
          </Button>
        </div>
      )}

      {/* Simplify-Style Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Active Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Active Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2B59FF] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono-tabular tracking-tight">
              {stats ? stats.totalActive : 0}
            </span>
            {stats && stats.addedThisWeek > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2B59FF]">
                +{stats.addedThisWeek} this week
              </span>
            )}
          </div>
        </div>

        {/* Interviews Active */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Interview Loops</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono-tabular tracking-tight">
              {stageCounts.Interviewing}
            </span>
            <span className="text-[11px] font-medium text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
              In progress
            </span>
          </div>
        </div>

        {/* Response Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Response Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono-tabular tracking-tight">
              {stats ? `${stats.responseRatePct}%` : '0%'}
            </span>
            <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              Avg {stats?.avgDaysToResponse || 7}d
            </span>
          </div>
        </div>

        {/* Offers / Action Needed */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Offers Received</span>
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#059669] font-mono-tabular tracking-tight">
              {stageCounts.Offer}
            </span>
            {attention.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {attention.length} Alert{attention.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel Visualizer + Recent Activity + Follow-up Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Funnel & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Funnel Visualizer */}
          <FunnelVisualizer counts={stageCounts} isLoading={loading} />

          {/* Recent Activity Feed */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A]">Recent Pipeline Activity</h3>
              <button
                onClick={() => setActivePage('pipeline')}
                className="text-xs text-[#2B59FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[#F1F5F9] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No recent activity logged yet. Add applications or update stages to see activity history.
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openDrawer(item.applicationId)}
                    className="py-3 flex items-center justify-between hover:bg-[#F8FAFC] px-3 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={item.companyName} size="md" />
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#2B59FF] transition-colors">
                          {item.roleTitle}
                        </p>
                        <p className="text-xs font-medium text-[#64748B]">{item.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge stage={item.stage} size="sm" />
                      <span className="text-xs text-[#94A3B8] font-mono-tabular">
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Follow-up & Priority Attention */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D97706]" />
                <span>Priority Action</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48]">
                {attention.length} Alert{attention.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-24 bg-[#F1F5F9] rounded-xl animate-pulse" />
              </div>
            ) : attention.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-1.5">
                <p className="text-xs font-bold text-[#059669]">All Caught Up!</p>
                <p className="text-[11px] text-[#059669]">No stale applications or urgent follow-ups today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attention.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                      item.type === 'stale'
                        ? 'bg-[#FFF1F2]/60 border-[#FECDD3] hover:border-[#E11D48]'
                        : 'bg-[#F5F3FF]/60 border-[#DDD6FE] hover:border-[#7C3AED]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          item.type === 'stale' ? 'text-[#E11D48]' : 'text-[#7C3AED]'
                        }`}
                      >
                        {item.type === 'stale'
                          ? `Stale > ${item.daysStale || 7} Days`
                          : 'Upcoming Interview'}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          item.type === 'stale' ? 'bg-[#FFE4E6] text-[#E11D48]' : 'bg-[#F5F3FF] text-[#7C3AED]'
                        }`}
                      >
                        {item.type === 'stale' ? 'Follow up' : 'In 48 hrs'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <CompanyAvatar name={item.companyName} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{item.roleTitle}</p>
                        <p className="text-xs text-[#64748B]">{item.companyName}</p>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1 font-semibold"
                      onClick={() =>
                        openDrawer(item.id, item.type === 'stale' ? 'overview' : 'prep')
                      }
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
