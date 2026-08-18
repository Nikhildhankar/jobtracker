import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, ExternalLink, Calendar, MapPin, DollarSign, Briefcase, FileText } from 'lucide-react';
import { Badge } from './Badge';
import { SegmentedTabs } from './SegmentedTabs';
import { api } from '../../services/api';
import type { ApplicationData } from '../../services/api';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | null;
  activeTab: 'overview' | 'timeline' | 'prep' | 'docs';
  onTabChange: (tab: 'overview' | 'timeline' | 'prep' | 'docs') => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  applicationId,
  activeTab,
  onTabChange,
}) => {
  const [appData, setAppData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      setLoading(true);
      api
        .getApplicationById(applicationId)
        .then((res) => setAppData(res.application))
        .catch(() => setAppData(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, applicationId]);

  // Fallback demo values if real ID is not in DB yet
  const companyName = appData?.companyName || 'Acme AI Systems';
  const roleTitle = appData?.roleTitle || 'Senior Full Stack Engineer';
  const stage = appData?.stage || 'Interviewing';
  const location = appData?.location || 'San Francisco, CA (Hybrid)';
  const salaryText = appData?.salary?.min
    ? `$${appData.salary.min / 1000}k - $${(appData.salary.max || 0) / 1000}k / yr`
    : '$165,000 - $190,000 / year';
  const appliedDate = appData?.appliedDate
    ? new Date(appData.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Aug 10, 2026';
  const source = appData?.source || 'LinkedIn Referral';
  const contactName = appData?.contact?.name || 'Sarah Lin';
  const contactRole = appData?.contact?.role || 'Lead Tech Recruiter';
  const contactEmail = appData?.contact?.email || 'sarah.lin@acmeai.com';
  const notes = appData?.notes || 'Had recruiter screen on Aug 12. Technical system design interview scheduled.';
  const stageHistory = appData?.stageHistory || [
    { stage: 'Interviewing', timestamp: '2026-08-14T10:00:00.000Z', notes: 'Scheduled 45min System Design' },
    { stage: 'Screening', timestamp: '2026-08-12T10:00:00.000Z', notes: 'Spoke with Sarah Lin' },
    { stage: 'Applied', timestamp: '2026-08-10T10:00:00.000Z', notes: 'Via LinkedIn Referral' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-[2px] transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            {/* 520px Slide-Over Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-screen max-w-[520px] bg-white shadow-2xl flex flex-col border-l border-[#E2E8F0]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#E2E8F0] space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] font-bold text-xl uppercase">
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#0F172A]">{roleTitle}</h2>
                      <div className="flex items-center gap-2 text-xs text-[#475569] mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{companyName}</span>
                        <span>•</span>
                        <Badge stage={stage} size="sm" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Craft-Style Drawer Tabs */}
                <SegmentedTabs
                  tabs={[
                    { id: 'overview', label: 'Overview' },
                    { id: 'timeline', label: 'Timeline' },
                    { id: 'prep', label: 'Interview Prep' },
                    { id: 'docs', label: 'Documents' },
                  ]}
                  activeId={activeTab}
                  onChange={(id) => onTabChange(id as any)}
                  size="sm"
                  className="w-full justify-between"
                />
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-20 bg-[#F1F5F9] rounded-xl animate-pulse" />
                    <div className="h-32 bg-[#F1F5F9] rounded-xl animate-pulse" />
                  </div>
                ) : (
                  <>
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Quick Specs Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#7C8896]">
                              <DollarSign className="w-3.5 h-3.5 text-[#059669]" />
                              <span>Compensation</span>
                            </div>
                            <p className="text-sm font-semibold text-[#0F172A] font-mono-tabular">
                              {salaryText}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#7C8896]">
                              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>Location</span>
                            </div>
                            <p className="text-sm font-medium text-[#0F172A] truncate">{location}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#7C8896]">
                              <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                              <span>Applied Date</span>
                            </div>
                            <p className="text-sm font-medium text-[#0F172A]">{appliedDate}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#7C8896]">
                              <Briefcase className="w-3.5 h-3.5 text-[#7C3AED]" />
                              <span>Source</span>
                            </div>
                            <p className="text-sm font-medium text-[#0F172A]">{source}</p>
                          </div>
                        </div>

                        {/* Recruiter / Contact Card */}
                        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase text-[#7C8896] tracking-wider">
                              Primary Contact
                            </h4>
                            <Badge variant="emerald" size="sm" showDot={true}>
                              Verified Email
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[#0F172A]">{contactName}</p>
                              <p className="text-xs text-[#475569]">{contactRole}</p>
                            </div>
                            <a
                              href={`mailto:${contactEmail}`}
                              className="text-xs font-medium text-[#2563EB] hover:underline"
                            >
                              {contactEmail}
                            </a>
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase text-[#7C8896] tracking-wider">
                            Application Notes
                          </h4>
                          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#475569]">
                            {notes || 'No custom notes recorded.'}
                          </div>
                        </div>

                        {/* Raw Job Description */}
                        {appData?.jobDescriptionRaw && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-[#7C8896] tracking-wider">
                              Job Description Text
                            </h4>
                            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {appData.jobDescriptionRaw}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'timeline' && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase text-[#7C8896] tracking-wider">
                          Stage History & Log
                        </h4>
                        <div className="border-l-2 border-[#E2E8F0] pl-4 space-y-6">
                          {stageHistory.map((item, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-4 ring-white" />
                              <p className="text-sm font-semibold text-[#0F172A]">
                                Moved to {item.stage}
                              </p>
                              <p className="text-xs text-[#7C8896]">
                                {new Date(item.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {item.notes ? ` • ${item.notes}` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'prep' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase text-[#7C8896] tracking-wider">
                            AI Interview Questions
                          </h4>
                          <Badge variant="violet" size="sm">
                            Tech & System Design
                          </Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
                          <p className="text-xs font-semibold text-[#7C3AED]">
                            Generated Technical Question
                          </p>
                          <p className="text-sm font-medium text-[#0F172A]">
                            "How would you optimize data access and multi-tenant indexes for {companyName}'s architecture?"
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'docs' && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase text-[#7C8896] tracking-wider">
                          Attached Documents
                        </h4>
                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#2563EB]" />
                            <span className="text-sm font-medium text-[#0F172A]">
                              Resume_Tailored_{companyName.replace(/\s+/g, '')}.pdf
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-[#2563EB] cursor-pointer" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
