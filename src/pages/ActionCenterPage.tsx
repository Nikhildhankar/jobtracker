import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StaleCard } from '../components/action/StaleCard';
import { EmailDrafterModal } from '../components/action/EmailDrafterModal';
import { useUI } from '../context/useUI';
import { api } from '../services/api';
import type { AttentionItem } from '../services/api';

export const ActionCenterPage: React.FC = () => {
  const { openDrawer, updateStageCounts } = useUI();

  const [activeFilter, setActiveFilter] = useState<'all' | 'stale' | 'interviews'>('all');
  const [loading, setLoading] = useState(true);
  const [staleItems, setStaleItems] = useState<AttentionItem[]>([]);
  const [interviewItems, setInterviewItems] = useState<AttentionItem[]>([]);
  const [selectedDrafterItem, setSelectedDrafterItem] = useState<AttentionItem | null>(null);

  const fetchActionItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getActionCenterItems();
      setStaleItems(res.staleApplications || []);
      setInterviewItems(res.upcomingInterviews || []);
      updateStageCounts({ actionNeeded: res.totalActionNeeded || 0 });
    } catch (err) {
      console.error('Failed to fetch action center items:', err);
    } finally {
      setLoading(false);
    }
  }, [updateStageCounts]);

  useEffect(() => {
    fetchActionItems();
  }, [fetchActionItems]);

  const totalAlerts = staleItems.length + interviewItems.length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Action Center</h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Never lose track of a job application. Automated stale alerts and AI follow-up email drafter.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'all' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Alerts ({totalAlerts})
          </button>
          <button
            onClick={() => setActiveFilter('stale')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'stale' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Stale &gt; 7d ({staleItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('interviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'interviews' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Upcoming Interviews ({interviewItems.length})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-[#F1F5F9] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : totalAlerts === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-xl font-bold mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-[#0F172A]">All Clear!</h3>
            <p className="text-xs text-[#7C8896]">
              No stale applications or urgent follow-ups required today. Great job keeping your pipeline active!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeFilter === 'all' || activeFilter === 'stale') &&
            staleItems.map((item) => (
              <StaleCard
                key={item.id}
                item={item}
                onDraftEmail={(item) => setSelectedDrafterItem(item)}
                onOpenDrawer={(id) => openDrawer(id)}
              />
            ))}

          {(activeFilter === 'all' || activeFilter === 'interviews') &&
            interviewItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-[#DDD6FE] bg-gradient-to-br from-white to-[#F5F3FF]/30 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                    <Sparkles className="w-3.5 h-3.5" /> Upcoming Interview
                  </span>
                  <Badge stage={item.stage} size="sm" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0F172A]">{item.roleTitle}</h3>
                  <p className="text-xs text-[#475569] font-medium">{item.companyName}</p>
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openDrawer(item.id, 'prep')}
                  >
                    Review Prep Notes
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* AI Email Drafter Modal */}
      {selectedDrafterItem && (
        <EmailDrafterModal
          item={selectedDrafterItem}
          onClose={() => setSelectedDrafterItem(null)}
          onSuccess={fetchActionItems}
        />
      )}
    </div>
  );
};
