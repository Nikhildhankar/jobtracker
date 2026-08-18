import React, { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export interface BulletRewriterProps {
  bullets: string[];
  missingKeywords: string[];
  onAcceptRewrite: (originalIndex: number, newText: string) => void;
}

export const BulletRewriter: React.FC<BulletRewriterProps> = ({
  bullets,
  missingKeywords,
  onAcceptRewrite,
}) => {
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  const handleGenerateRewrite = async () => {
    const original = bullets[selectedBulletIndex];
    if (!original) return;

    try {
      setLoading(true);
      const res = await api.rewriteBullet(original, missingKeywords);
      setSuggestion(res.suggestion);
    } catch (err) {
      console.error('Failed to generate rewrite:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">AI Side-by-Side Bullet Optimizer</h3>
          <p className="text-xs text-[#7C8896]">
            Select a bullet to tailor with your confirmed keywords ({missingKeywords.join(', ') || 'None'}).
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          isLoading={loading}
          icon={<Sparkles className="w-4 h-4" />}
          onClick={handleGenerateRewrite}
        >
          Generate AI Suggestion
        </Button>
      </div>

      {/* Bullet Point Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
          Select Bullet Point to Optimize
        </label>
        <select
          value={selectedBulletIndex}
          onChange={(e) => {
            setSelectedBulletIndex(parseInt(e.target.value, 10));
            setSuggestion(null);
          }}
          className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
        >
          {bullets.map((bullet, idx) => (
            <option key={idx} value={idx}>
              Bullet {idx + 1}: "{bullet.slice(0, 60)}..."
            </option>
          ))}
        </select>
      </div>

      {/* Side-by-Side Comparison */}
      {suggestion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/30">
          {/* Original */}
          <div className="p-4 rounded-lg bg-white border border-[#E2E8F0] space-y-2">
            <span className="text-[11px] font-semibold uppercase text-[#7C8896]">Original Bullet</span>
            <p className="text-xs text-[#475569] leading-relaxed">{suggestion.originalBullet}</p>
          </div>

          {/* AI Suggested */}
          <div className="p-4 rounded-lg bg-white border border-[#BFDBFE] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-[#2563EB] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Tailored Suggestion
              </span>
            </div>
            <p className="text-xs font-semibold text-[#0F172A] leading-relaxed">
              {suggestion.suggestedBullet}
            </p>

            {suggestion.rationale && (
              <p className="text-[11px] text-[#7C8896] italic">{suggestion.rationale}</p>
            )}

            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Check className="w-3.5 h-3.5" />}
                onClick={() => {
                  onAcceptRewrite(selectedBulletIndex, suggestion.suggestedBullet);
                  setSuggestion(null);
                }}
              >
                Accept & Apply
              </Button>
              <Button variant="outline" size="sm" icon={<X className="w-3.5 h-3.5" />} onClick={() => setSuggestion(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
