import React from 'react';
import { Mail, User, Sparkles, ExternalLink, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CompanyAvatar } from '../ui/CompanyAvatar';
import type { AttentionItem } from '../../services/api';

export interface StaleCardProps {
  item: AttentionItem;
  onDraftEmail: (item: AttentionItem) => void;
  onOpenDrawer: (id: string) => void;
}

export const StaleCard: React.FC<StaleCardProps> = ({ item, onDraftEmail, onOpenDrawer }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#FECDD3] bg-gradient-to-br from-white to-[#FFF1F2]/20 shadow-xs space-y-4 transition-all hover:border-[#E11D48] hover:shadow-md">
      {/* Header Badges */}
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

      {/* Company Avatar & Role Details */}
      <div className="flex items-center gap-3">
        <CompanyAvatar name={item.companyName} size="md" />
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-[#0F172A]">{item.roleTitle}</h3>
          <p className="text-xs text-[#64748B] font-semibold">{item.companyName}</p>
        </div>
      </div>

      {/* Contact Spec Box */}
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

      {/* Actions */}
      <div className="pt-1 flex items-center justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => onDraftEmail(item)}
          className="bg-[#2B59FF] hover:bg-[#1E46E6]"
        >
          Draft AI Follow-up Email
        </Button>
      </div>
    </div>
  );
};
