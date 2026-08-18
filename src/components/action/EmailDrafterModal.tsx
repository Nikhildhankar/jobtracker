import React, { useEffect, useState } from 'react';
import { Sparkles, Copy, Check, CheckCircle2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import type { AttentionItem } from '../../services/api';

export interface EmailDrafterModalProps {
  item: AttentionItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmailDrafterModal: React.FC<EmailDrafterModalProps> = ({
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
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs" />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-10 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">AI Follow-up Email Drafter</h3>
              <p className="text-xs text-[#7C8896]">
                {item.companyName} • {item.roleTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Context Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0F172A]">
            Additional Context (Optional)
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateDraft()}
            placeholder="e.g., Mentioned our discussion about system design architecture..."
            className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Email Draft Preview Box */}
        {loading ? (
          <div className="space-y-3 py-6">
            <div className="h-10 bg-[#F1F5F9] rounded-xl animate-pulse" />
            <div className="h-32 bg-[#F1F5F9] rounded-xl animate-pulse" />
          </div>
        ) : draft ? (
          <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            {/* Subject Line */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-[#7C8896]">
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

            {/* Email Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-[#7C8896]">
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

        {/* Footer Actions */}
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
