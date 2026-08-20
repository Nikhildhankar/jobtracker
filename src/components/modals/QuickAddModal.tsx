import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Briefcase, MapPin, DollarSign, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { CompanyAvatar } from '../ui/CompanyAvatar';
import { useUI } from '../../context/useUI';
import { api } from '../../services/api';

export interface QuickAddModalProps {
  onSuccess?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ onSuccess }) => {
  const { quickAddOpen, setQuickAddOpen } = useUI();

  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [stage, setStage] = useState<'Wishlist' | 'Applied' | 'Screening' | 'Interviewing' | 'Offer' | 'Archived'>('Wishlist');
  const [workModel, setWorkModel] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [source, setSource] = useState('LinkedIn');
  const [jobDescriptionRaw, setJobDescriptionRaw] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.createApplication({
        companyName,
        roleTitle,
        stage,
        workModel,
        location,
        source,
        salary: {
          min: minSalary ? parseInt(minSalary, 10) : undefined,
          max: maxSalary ? parseInt(maxSalary, 10) : undefined,
          currency: 'USD',
          period: 'yearly',
        },
        jobDescriptionRaw,
      });

      // Reset fields
      setCompanyName('');
      setRoleTitle('');
      setJobDescriptionRaw('');
      setLocation('');
      setMinSalary('');
      setMaxSalary('');

      setQuickAddOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {quickAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickAddOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-10"
          >
            {/* Header with Live Company Avatar */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {companyName ? (
                  <CompanyAvatar name={companyName} size="md" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2B59FF] flex items-center justify-center font-bold text-sm">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    {companyName ? `Add ${companyName}` : 'New Job Application'}
                  </h2>
                  <p className="text-xs text-[#64748B]">Add a job to track in your search pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-xs font-medium text-[#E11D48]">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Company Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, OpenAI..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Role Title *</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white cursor-pointer"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer Received</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Work Model</label>
                  <select
                    value={workModel}
                    onChange={(e) => setWorkModel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white cursor-pointer"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="LinkedIn, Simplify, Referral..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Min Salary ($ / yr)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      placeholder="140000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">Max Salary ($ / yr)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      placeholder="180000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A]">Job Description (Optional)</label>
                <textarea
                  rows={3}
                  value={jobDescriptionRaw}
                  onChange={(e) => setJobDescriptionRaw(e.target.value)}
                  placeholder="Paste raw JD text for ATS keyword extraction & AI question prep..."
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2B59FF] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="bg-[#2B59FF] hover:bg-[#1E46E6]">
                  Save Application
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
