import React, { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, BookOpen, CheckCircle2, BookmarkPlus, X, Search, Copy, Check, Trash2, Bookmark } from 'lucide-react';
import { Button, Badge, SegmentedTabs } from '../components/ui';
import { api } from '../services/api';
import type { ApplicationData } from '../services/api';

/* ================= Question Generator Sub-Component ================= */
interface QuestionGeneratorProps {
  questions: any[];
  onSelectQuestion: (question: any) => void;
  isLoading?: boolean;
}

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  questions,
  onSelectQuestion,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-[#F1F5F9] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-2">
        <Sparkles className="w-6 h-6 text-[#7C3AED] mx-auto" />
        <h4 className="text-sm font-semibold text-[#0F172A]">No Questions Generated Yet</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto">
          Select a target job application above and click "Generate Questions with AI" to unlock tailored coaching notes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#DDD6FE] transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <Badge
              variant={
                q.category === 'Technical' ? 'sky' : q.category === 'Behavioral' ? 'violet' : 'amber'
              }
              size="sm"
            >
              {q.category || 'General'}
            </Badge>

            {q.keyConcepts && (
              <span className="text-[11px] font-mono text-[#64748B]">
                Key Focus: {q.keyConcepts.slice(0, 2).join(', ')}
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-[#0F172A] leading-snug">{q.question}</p>

          {q.sampleAnswerGuidance && (
            <p className="text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <span className="font-semibold text-[#2563EB]">Coaching Tip: </span>
              {q.sampleAnswerGuidance}
            </p>
          )}

          <div className="pt-1 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => onSelectQuestion(q)}
            >
              Practice STAR Answer
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ================= STAR Builder Modal Sub-Component ================= */
interface StarBuilderProps {
  questionObj: any;
  companyName?: string;
  onClose: () => void;
  onSavedSuccess: () => void;
}

const StarBuilder: React.FC<StarBuilderProps> = ({
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
    <div className="modal-overlay-backdrop">
      <div onClick={onClose} style={{ position: 'fixed', inset: 0 }} />

      <div className="modal-dialog-box" style={{ maxWidth: '640px', position: 'relative', zIndex: 10, padding: '24px', gap: '16px' }}>
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">
              STAR Behavioral Framework Builder
            </span>
            <h3 className="text-base font-bold text-[#0F172A]">{questionObj.question}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="form-group-wrap">
            <label className="form-label-title">
              Situation (Context & Background) *
            </label>
            <textarea
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g., At my previous role, our primary payment API was experiencing 400ms latency spikes..."
              className="form-textarea-box"
            />
          </div>

          <div className="form-group-wrap">
            <label className="form-label-title">
              Task (Your Specific Responsibility)
            </label>
            <textarea
              rows={2}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., I was tasked with diagnosing the bottleneck and refactoring the DB layer..."
              className="form-textarea-box"
            />
          </div>

          <div className="form-group-wrap">
            <label className="form-label-title">
              Action (What specific steps did YOU execute?) *
            </label>
            <textarea
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g., Introduced Redis caching layer, added compound DB indexes, and refactored async loop..."
              className="form-textarea-box"
            />
          </div>

          <div className="form-group-wrap">
            <label className="form-label-title">
              Result (Quantifiable outcome & metrics) *
            </label>
            <textarea
              rows={2}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g., Reduced average API response latency by 65% (from 400ms to 140ms) and saved $12k/mo in server costs."
              className="form-textarea-box"
            />
          </div>
        </div>

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

/* ================= Answer Bank Sub-Component ================= */
interface AnswerBankProps {
  items: any[];
  onRefresh: () => void;
}

const AnswerBank: React.FC<AnswerBankProps> = ({ items, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = items.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      (item.companyName && item.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAnswer(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete answer:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 p-4 bg-white border border-[#E2E8F0] rounded-2xl">
        <div className="input-with-icon-wrap" style={{ flex: 1 }}>
          <Search className="input-leading-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved interview answers by question or company..."
            className="form-input-with-icon"
          />
        </div>
        <span className="text-xs font-mono text-[#64748B]">
          Total Saved: {items.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-2">
          <Bookmark className="w-6 h-6 text-[#94A3B8] mx-auto" />
          <h4 className="text-sm font-semibold text-[#0F172A]">No Answers Found</h4>
          <p className="text-xs text-[#64748B]">
            Save STAR responses from your practice sessions to build a reusable interview answer bank.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="violet" size="sm">
                    {item.category || 'Behavioral'}
                  </Badge>
                  {item.companyName && (
                    <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                      {item.companyName}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#0F172A] leading-snug">{item.question}</h4>

                {item.polishedDraft ? (
                  <p className="text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] leading-relaxed">
                    {item.polishedDraft}
                  </p>
                ) : item.starAnswer ? (
                  <div className="space-y-1.5 text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    {item.starAnswer.situation && (
                      <p>
                        <strong className="text-[#0F172A]">Situation:</strong> {item.starAnswer.situation}
                      </p>
                    )}
                    {item.starAnswer.action && (
                      <p>
                        <strong className="text-[#0F172A]">Action:</strong> {item.starAnswer.action}
                      </p>
                    )}
                    {item.starAnswer.result && (
                      <p>
                        <strong className="text-[#059669]">Result:</strong> {item.starAnswer.result}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
                <button
                  onClick={() =>
                    handleCopy(item._id, item.polishedDraft || JSON.stringify(item.starAnswer))
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {copiedId === item._id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= Consolidated Interview Prep Page ================= */
export const InterviewPrepPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'practice' | 'bank'>('practice');
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  const [generating, setGenerating] = useState(false);
  const [questionsData, setQuestionsData] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const [answerBankItems, setAnswerBankItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswerBank = async () => {
    try {
      const res = await api.getAnswerBank();
      setAnswerBankItems(res.answerBank || []);
    } catch (err) {
      console.error('Failed to fetch answer bank:', err);
    }
  };

  useEffect(() => {
    api.getApplications().then((res) => setApplications(res.applications || [])).catch(() => {});
    fetchAnswerBank();
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const res = await api.generateInterviewQuestions({
        applicationId: selectedAppId || undefined,
      });
      setQuestionsData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview questions.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">AI Interview Coach & Answer Bank</h1>
          <p className="page-header-desc">
            Generate role-specific questions, construct structured STAR answers, and maintain a reusable bank.
          </p>
        </div>
        <SegmentedTabs
          tabs={[
            { id: 'practice', label: 'Practice Coaching', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'bank', label: `Answer Bank (${answerBankItems.length})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {activeTab === 'practice' ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase text-[#0F172A] tracking-wider">
              Select Application for Interview Coaching
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-xs font-medium text-[#E11D48]">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="form-select-box sm:flex-1"
              >
                <option value="">-- Choose Pipeline Application --</option>
                {applications.map((app) => (
                  <option key={app._id} value={app._id}>
                    {app.companyName} - {app.roleTitle} ({app.stage})
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                isLoading={generating}
                icon={<Sparkles className="w-4 h-4" />}
                onClick={handleGenerate}
              >
                Generate Questions with AI
              </Button>
            </div>
          </div>

          <QuestionGenerator
            questions={questionsData?.questions || []}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
            isLoading={generating}
          />
        </div>
      ) : (
        <AnswerBank items={answerBankItems} onRefresh={fetchAnswerBank} />
      )}

      {selectedQuestion && (
        <StarBuilder
          questionObj={selectedQuestion}
          companyName={questionsData?.companyName}
          onClose={() => setSelectedQuestion(null)}
          onSavedSuccess={fetchAnswerBank}
        />
      )}
    </div>
  );
};
