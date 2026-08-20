import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Mail,
  User,
  ExternalLink,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { Button, Badge, CompanyAvatar, SegmentedTabs } from '../components/ui';
import { useUI } from '../context/useUI';
import { api } from '../services/api';
import type { AttentionItem } from '../services/api';

/* ================= Stale Card Sub-Component ================= */
interface StaleCardProps {
  item: AttentionItem;
  onDraftEmail: (item: AttentionItem) => void;
  onOpenDrawer: (id: string) => void;
}

const StaleCard: React.FC<StaleCardProps> = ({ item, onDraftEmail, onOpenDrawer }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#FECDD3] bg-gradient-to-br from-white to-[#FFF1F2]/20 shadow-xs space-y-4 transition-all hover:border-[#E11D48] hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
            <Clock className="w-3.5 h-3.5" /> {item.daysStale || 7} Days Inactive
          </span>
          <Badge stage={item.stage} size="sm" />
        </div>

        <button
          onClick={() => onOpenDrawer(item.id)}
          className="text-xs text-[#2B59FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          View Specs <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <CompanyAvatar name={item.companyName} size="md" />
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-[#0F172A]">{item.roleTitle}</h3>
          <p className="text-xs text-[#64748B] font-semibold">{item.companyName}</p>
        </div>
      </div>

      {item.contact && (item.contact.name || item.contact.email) && (
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#64748B]" />
            <div>
              <p className="font-bold text-[#0F172A]">{item.contact.name || 'Hiring Recruiter'}</p>
              {item.contact.role && <p className="text-[11px] text-[#64748B]">{item.contact.role}</p>}
            </div>
          </div>

          {item.contact.email && (
            <a
              href={`mailto:${item.contact.email}`}
              className="text-xs text-[#2B59FF] hover:underline font-semibold flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" /> {item.contact.email}
            </a>
          )}
        </div>
      )}

      <div className="pt-1 flex items-center justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => onDraftEmail(item)}
        >
          Draft AI Follow-up Email
        </Button>
      </div>
    </div>
  );
};

/* ================= Email Drafter Modal Sub-Component ================= */
interface EmailDrafterModalProps {
  item: AttentionItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EmailDrafterModal: React.FC<EmailDrafterModalProps> = ({
  item,
  onClose,
  onSuccess,
}) => {
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [marking, setMarking] = useState(false);
  const [markedMsg, setMarkedMsg] = useState(false);

  const generateDraft = React.useCallback(async () => {
    if (!item) return;
    try {
      setLoading(true);
      const res = await api.draftFollowupEmail(item.id, customNotes || undefined);
      setDraft(res.draft);
    } catch (err) {
      console.error('Failed to draft email:', err);
    } finally {
      setLoading(false);
    }
  }, [item, customNotes]);

  useEffect(() => {
    if (item) {
      generateDraft();
    }
  }, [item, generateDraft]);

  if (!item) return null;

  const handleCopySubject = () => {
    if (draft?.subject) {
      navigator.clipboard.writeText(draft.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    }
  };

  const handleCopyBody = () => {
    if (draft?.body) {
      navigator.clipboard.writeText(draft.body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const handleMarkFollowedUp = async () => {
    try {
      setMarking(true);
      await api.markFollowedUp(item.id, 'Sent follow-up email via Action Center');
      setMarkedMsg(true);
      setTimeout(() => {
        setMarkedMsg(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to mark followed up:', err);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop">
      <div onClick={onClose} style={{ position: 'fixed', inset: 0 }} />

      <div className="modal-dialog-box" style={{ maxWidth: '580px', position: 'relative', zIndex: 10, padding: '24px', gap: '16px' }}>
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">AI Follow-up Email Drafter</h3>
              <p className="text-xs text-[#64748B]">
                {item.companyName} • {item.roleTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="form-group-wrap">
          <label className="form-label-title">
            Additional Context (Optional)
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateDraft()}
            placeholder="e.g., Mentioned our discussion about system design architecture..."
            className="form-input-box"
          />
        </div>

        {loading ? (
          <div className="space-y-3 py-6">
            <div className="h-10 bg-[#F1F5F9] rounded-xl animate-pulse" />
            <div className="h-32 bg-[#F1F5F9] rounded-xl animate-pulse" />
          </div>
        ) : draft ? (
          <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-[#64748B]">
                  Subject Line
                </span>
                <button
                  onClick={handleCopySubject}
                  className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedSubject ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Subject
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-[#0F172A] p-2 bg-white rounded-lg border border-[#E2E8F0]">
                {draft.subject}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-[#64748B]">
                  Email Body
                </span>
                <button
                  onClick={handleCopyBody}
                  className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedBody ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Body
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-[#475569] p-3 bg-white rounded-lg border border-[#E2E8F0] whitespace-pre-wrap font-sans leading-relaxed">
                {draft.body}
              </div>
            </div>
          </div>
        ) : null}

        <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
          <Button variant="outline" size="sm" onClick={generateDraft} isLoading={loading}>
            Regenerate Draft
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={marking}
              icon={markedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : undefined}
              onClick={handleMarkFollowedUp}
            >
              {markedMsg ? 'Followed Up!' : 'Mark Followed Up'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Consolidated Action Center Page ================= */
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Action Center</h1>
          <p className="page-header-desc">
            Automated stale alerts, upcoming interview reminders, and AI follow-up email drafts.
          </p>
        </div>

        <SegmentedTabs
          tabs={[
            { id: 'all', label: `All Alerts (${totalAlerts})`, icon: <AlertCircle className="w-3.5 h-3.5" /> },
            { id: 'stale', label: `Stale > 7d (${staleItems.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'interviews', label: `Interviews (${interviewItems.length})`, icon: <Calendar className="w-3.5 h-3.5" /> },
          ]}
          activeId={activeFilter}
          onChange={(id) => setActiveFilter(id as any)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-[#F1F5F9] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : totalAlerts === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-3 shadow-sm my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-xl font-bold mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-[#0F172A]">All Clear!</h3>
            <p className="text-xs text-[#64748B]">
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
                className="p-5 rounded-2xl bg-white border border-[#DDD6FE] bg-gradient-to-br from-white to-[#F5F3FF]/30 shadow-sm space-y-4 transition-all hover:border-[#7C3AED]"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                    <Calendar className="w-3.5 h-3.5" /> Upcoming Round
                  </span>
                  <button
                    onClick={() => openDrawer(item.id, 'prep')}
                    className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    Open Prep Notes <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <CompanyAvatar name={item.companyName} size="md" />
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-[#0F172A]">{item.roleTitle}</h3>
                    <p className="text-xs text-[#64748B] font-semibold">{item.companyName}</p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    onClick={() => openDrawer(item.id, 'prep')}
                  >
                    Practice STAR Questions
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

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
