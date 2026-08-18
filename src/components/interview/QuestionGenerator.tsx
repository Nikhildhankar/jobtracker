import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface QuestionGeneratorProps {
  questions: any[];
  onSelectQuestion: (question: any) => void;
  isLoading?: boolean;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
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
        <p className="text-xs text-[#7C8896] max-w-sm mx-auto">
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
              <span className="text-[11px] font-mono text-[#7C8896]">
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
