import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { QuestionGenerator } from '../components/interview/QuestionGenerator';
import { StarBuilder } from '../components/interview/StarBuilder';
import { AnswerBank } from '../components/interview/AnswerBank';
import { api } from '../services/api';
import type { ApplicationData } from '../services/api';

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">AI Interview Coach & Answer Bank</h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Generate role-specific technical & behavioral questions, build STAR answers, and maintain a reusable answer bank.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'practice' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Practice Coaching
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'bank' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Answer Bank ({answerBankItems.length})
          </button>
        </div>
      </div>

      {activeTab === 'practice' ? (
        <div className="space-y-6">
          {/* Target Job Selection Card */}
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
                className="w-full sm:flex-1 p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
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

          {/* Questions Stream */}
          <QuestionGenerator
            questions={questionsData?.questions || []}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
            isLoading={generating}
          />
        </div>
      ) : (
        <AnswerBank items={answerBankItems} onRefresh={fetchAnswerBank} />
      )}

      {/* STAR Response Modal */}
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
