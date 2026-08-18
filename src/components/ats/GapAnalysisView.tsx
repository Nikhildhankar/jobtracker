import React from 'react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

export interface GapAnalysisViewProps {
  analysis: any;
  selectedMissingKeywords: string[];
  onToggleKeyword: (kw: string) => void;
  onTriggerRewrite: () => void;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  analysis,
  selectedMissingKeywords,
  onToggleKeyword,
  onTriggerRewrite,
}) => {
  if (!analysis) return null;

  const { atsScore, keywordMatchPct, matchedKeywords, missingKeywords, checks, roleSummary } = analysis;

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
      {/* Top Gauge & Score Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] border border-[#BFDBFE]">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[#2563EB] tracking-wider">
            Composite ATS Score
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-[#0F172A] font-mono-tabular">
              {atsScore}
            </span>
            <span className="text-sm font-semibold text-[#7C8896]">/ 100</span>
            <span
              className={clsx(
                'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                atsScore >= 80
                  ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                  : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
              )}
            >
              {atsScore >= 80 ? 'ATS Optimized' : 'Needs Optimization'}
            </span>
          </div>
          {roleSummary && <p className="text-xs text-[#475569] max-w-md mt-1">{roleSummary}</p>}
        </div>

        <div className="text-right">
          <span className="text-xs text-[#7C8896]">Keyword Match Ratio</span>
          <p className="text-2xl font-bold text-[#2563EB] font-mono-tabular">
            {keywordMatchPct}%
          </p>
          <p className="text-[11px] text-[#7C8896]">
            {matchedKeywords?.length || 0} matched • {missingKeywords?.length || 0} missing
          </p>
        </div>
      </div>

      {/* Interactive Missing Keyword Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase text-[#0F172A] tracking-wider">
            Missing Target Keywords (Select to Confirm Truthful Experience)
          </h4>
          <span className="text-[11px] text-[#7C8896]">
            {selectedMissingKeywords.length} selected for AI rewrite
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(missingKeywords || []).map((kw: string) => {
            const isSelected = selectedMissingKeywords.includes(kw);
            return (
              <button
                key={kw}
                onClick={() => onToggleKeyword(kw)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] hover:border-[#E11D48]'
                )}
              >
                {isSelected ? '✓ ' : '+ '} {kw}
              </button>
            );
          })}
        </div>

        {selectedMissingKeywords.length > 0 && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={onTriggerRewrite}
            >
              Rewrite Bullet Points with {selectedMissingKeywords.length} Confirmed Keywords
            </Button>
          </div>
        )}
      </div>

      {/* Rules-Based Format Checks Checklist */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold uppercase text-[#0F172A] tracking-wider">
          ATS Format & Parser Safety Checklist
        </h4>
        <div className="space-y-2">
          {(checks || []).map((check: any) => (
            <div
              key={check.id}
              className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#E11D48] flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-[#0F172A]">{check.label}</p>
                  <p className="text-[#475569] mt-0.5">{check.tip}</p>
                </div>
              </div>
              <span className="font-mono text-[#7C8896] text-[11px] flex-shrink-0">
                +{check.scoreImpact} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
