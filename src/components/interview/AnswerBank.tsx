import React, { useState } from 'react';
import { Search, Copy, Check, Trash2, Bookmark } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';

export interface AnswerBankProps {
  items: any[];
  onRefresh: () => void;
}

export const AnswerBank: React.FC<AnswerBankProps> = ({ items, onRefresh }) => {
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
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white border border-[#E2E8F0] rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved interview answers by question or company..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
          />
        </div>
        <span className="text-xs font-mono text-[#7C8896]">
          Total Saved: {items.length}
        </span>
      </div>

      {/* Answer Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-2">
          <Bookmark className="w-6 h-6 text-[#94A3B8] mx-auto" />
          <h4 className="text-sm font-semibold text-[#0F172A]">No Answers Found</h4>
          <p className="text-xs text-[#7C8896]">
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
