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
        <div className="modal-overlay-backdrop">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickAddOpen(false)}
            style={{ position: 'fixed', inset: 0 }}
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="modal-dialog-box"
            style={{ position: 'relative', zIndex: 10 }}
          >
            {/* Header with Live Company Avatar */}
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {companyName ? (
                  <CompanyAvatar name={companyName} size="md" />
                ) : (
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2B59FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    <Plus size={18} />
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    {companyName ? `Add ${companyName}` : 'New Job Application'}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Track interviews, ATS keywords, and recruiter follow-ups
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickAddOpen(false)}
                style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="modal-body-form">
              {error && (
                <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FFE4E6', border: '1px solid #FECDD3', fontSize: '12px', fontWeight: 600, color: '#E11D48' }}>
                  {error}
                </div>
              )}

              {/* Row 1: Company & Role */}
              <div className="modal-form-grid-2">
                <div className="form-group-wrap">
                  <label className="form-label-title">Company Name *</label>
                  <div className="input-with-icon-wrap">
                    <Building2 className="input-leading-icon" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, OpenAI..."
                      className="form-input-with-icon"
                    />
                  </div>
                </div>

                <div className="form-group-wrap">
                  <label className="form-label-title">Role Title *</label>
                  <div className="input-with-icon-wrap">
                    <Briefcase className="input-leading-icon" />
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="form-input-with-icon"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Stage & Work Model */}
              <div className="modal-form-grid-2">
                <div className="form-group-wrap">
                  <label className="form-label-title">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="form-select-box"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer Received</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="form-group-wrap">
                  <label className="form-label-title">Work Model</label>
                  <select
                    value={workModel}
                    onChange={(e) => setWorkModel(e.target.value as any)}
                    className="form-select-box"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Location & Source */}
              <div className="modal-form-grid-2">
                <div className="form-group-wrap">
                  <label className="form-label-title">Location</label>
                  <div className="input-with-icon-wrap">
                    <MapPin className="input-leading-icon" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA..."
                      className="form-input-with-icon"
                    />
                  </div>
                </div>

                <div className="form-group-wrap">
                  <label className="form-label-title">Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="LinkedIn, Simplify, Referral..."
                    className="form-input-box"
                  />
                </div>
              </div>

              {/* Row 4: Min & Max Salary */}
              <div className="modal-form-grid-2">
                <div className="form-group-wrap">
                  <label className="form-label-title">Min Salary ($ / yr)</label>
                  <div className="input-with-icon-wrap">
                    <DollarSign className="input-leading-icon" />
                    <input
                      type="number"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      placeholder="140000"
                      className="form-input-with-icon"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                <div className="form-group-wrap">
                  <label className="form-label-title">Max Salary ($ / yr)</label>
                  <div className="input-with-icon-wrap">
                    <DollarSign className="input-leading-icon" />
                    <input
                      type="number"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      placeholder="180000"
                      className="form-input-with-icon"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Job Description */}
              <div className="form-group-wrap">
                <label className="form-label-title">Job Description (Optional)</label>
                <textarea
                  rows={3}
                  value={jobDescriptionRaw}
                  onChange={(e) => setJobDescriptionRaw(e.target.value)}
                  placeholder="Paste raw JD duties & qualifications for automatic ATS keyword extraction..."
                  className="form-textarea-box"
                />
              </div>

              {/* Actions Footer */}
              <div className="modal-footer-actions">
                <Button type="button" variant="secondary" size="md" onClick={() => setQuickAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={submitting}>
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
