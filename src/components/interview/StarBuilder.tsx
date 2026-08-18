import React, { useState } from 'react';
import { Sparkles, CheckCircle2, BookmarkPlus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export interface StarBuilderProps {
  questionObj: any;
  companyName?: string;
  onClose: () => void;
  onSavedSuccess: () => void;
}

export const StarBuilder: React.FC<StarBuilderProps> = ({
  questionObj,
  companyName,
  onClose,
  onSavedSuccess,
}) => {
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');

  const [reviewing, setReviewing] = useState(false);
  const [critique, setCritique] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleReview = async () => {
    try {
      setReviewing(true);
      const res = await api.reviewStarAnswer(questionObj.question, {
        situation,
        task,
        action,
        result,
      });
      setCritique(res.critique);
    } catch (err) {
      console.error('Failed to review STAR answer:', err);
    } finally {
      setReviewing(false);
    }
  };

  const handleSaveToBank = async () => {
    try {
      setSaving(true);
      await api.saveAnswer({
        question: questionObj.question,
        category: questionObj.category || 'Behavioral',
        companyName,
        starAnswer: {
          situation,
          task,
          action,
          result,
        },
        polishedDraft: critique?.polishedDraft || `${situation} ${action} ${result}`,
      });

      setSavedMsg(true);
      setTimeout(() => {
        setSavedMsg(false);
        onSavedSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save answer:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-10 space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">
              STAR Behavioral Framework Builder
            </span>
            <h3 className="text-base font-bold text-[#0F172A]">{questionObj.question}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAR Grid Inputs */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A]">
              Situation (Set the context & background) *
            </label>
            <textarea
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g., At my previous role, our primary payment API was experiencing 400ms latency spikes..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A]">
              Task (What was your specific responsibility?)
            </label>
            <textarea
              rows={2}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., I was tasked with diagnosing the bottleneck and refactoring the DB layer..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A]">
              Action (What specific steps did YOU execute?) *
            </label>
            <textarea
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g., Introduced Redis caching layer, added compound DB indexes, and refactored async loop..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A]">
              Result (Quantifiable metric & outcome) *
            </label>
            <textarea
              rows={2}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g., Reduced average API response latency by 65% (from 400ms to 140ms) and saved $12k/mo in server costs."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* AI Critique Feedback Panel */}
        {critique && (
          <div className="p-4 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7C3AED] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI STAR Critique Feedback
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  critique.hasQuantifiableMetric
                    ? 'bg-[#ECFDF5] text-[#059669]'
                    : 'bg-[#FFE4E6] text-[#E11D48]'
                }`}
              >
                {critique.hasQuantifiableMetric ? '✓ Metric Included' : '⚠ Missing Metric'}
              </span>
            </div>
            <p className="text-xs text-[#475569]">{critique.feedback}</p>
            {critique.polishedDraft && (
              <div className="p-3 bg-white rounded-lg border border-[#DDD6FE] text-xs font-medium text-[#0F172A]">
                <span className="font-bold text-[#7C3AED]">Polished Draft: </span>
                {critique.polishedDraft}
              </div>
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
          <Button
            variant="outline"
            size="sm"
            isLoading={reviewing}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />}
            onClick={handleReview}
          >
            Review STAR with AI
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              icon={savedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <BookmarkPlus className="w-4 h-4" />}
              onClick={handleSaveToBank}
            >
              {savedMsg ? 'Saved!' : 'Save to Answer Bank'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
