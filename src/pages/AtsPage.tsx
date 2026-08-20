import React, { useEffect, useState } from 'react';
import { Sparkles, FileText, SearchCheck, CheckCircle2, XCircle, Check, X, Save, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button, SegmentedTabs } from '../components/ui';
import { api } from '../services/api';
import type { ApplicationData } from '../services/api';

/* ================= Base Resume Editor Sub-Component ================= */
interface ResumeEditorProps {
  initialResume: any;
  onSaveSuccess?: () => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ initialResume, onSaveSuccess }) => {
  const [summary, setSummary] = useState(initialResume?.sections?.summary || '');
  const [techSkills, setTechSkills] = useState<string[]>(
    initialResume?.sections?.skills?.technical || ['TypeScript', 'React', 'Node.js', 'MongoDB']
  );
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState<any[]>(
    initialResume?.sections?.experience || [
      {
        company: 'Tech Solutions Inc.',
        role: 'Software Engineer',
        startDate: '2023-01',
        endDate: 'Present',
        bullets: [
          'Engineered high-throughput REST APIs handling 50k daily active users with Node.js and MongoDB.',
          'Architected modular React micro-frontends reducing page load latency by 35%.',
        ],
      },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !techSkills.includes(newSkill.trim())) {
      setTechSkills([...techSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTechSkills(techSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...experience];
    updated[expIndex].bullets.push('Spearheaded new feature development with measurable impact.');
    setExperience(updated);
  };

  const handleUpdateBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...experience];
    updated[expIndex].bullets[bulletIndex] = text;
    setExperience(updated);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experience];
    updated[expIndex].bullets.splice(bulletIndex, 1);
    setExperience(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateBaseResume({
        summary,
        skills: {
          technical: techSkills,
          tools: ['Git', 'Docker', 'Vite'],
          soft: ['Leadership'],
        },
        experience,
        projects: initialResume?.sections?.projects || [],
        education: initialResume?.sections?.education || [],
      });

      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      if (onSaveSuccess) onSaveSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ats-section-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Master Base Resume JSON</h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Your central source-of-truth resume. All ATS scans and AI rewrites build from this base.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          isLoading={saving}
          icon={savedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          {savedMsg ? 'Saved!' : 'Save Base Resume'}
        </Button>
      </div>

      <div className="form-group-wrap">
        <label className="form-label-title">Professional Summary</label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief executive summary of core technical background, architectural focus, and impact..."
          className="form-textarea-box"
        />
      </div>

      <div className="form-group-wrap">
        <label className="form-label-title">Technical Skills & Keywords</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          {techSkills.map((skill) => (
            <span key={skill} className="ats-skill-chip">
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                title="Remove skill"
              >
                ×
              </button>
            </span>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="+ Add Skill"
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '8px', border: '1px dashed #CBD5E1', backgroundColor: '#FFFFFF', outline: 'none', width: '100px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label className="form-label-title">Professional Experience Bullets</label>
        {experience.map((exp, expIdx) => (
          <div key={expIdx} className="ats-experience-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{exp.company}</span>
                <span style={{ fontSize: '13px', color: '#64748B' }}>• {exp.role}</span>
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                {exp.startDate} - {exp.endDate}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {exp.bullets.map((bullet: string, bIdx: number) => (
                <div key={bIdx} className="ats-bullet-item">
                  <span style={{ fontSize: '14px', color: '#2B59FF', marginTop: '10px' }}>•</span>
                  <textarea
                    rows={2}
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                    className="form-textarea-box"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => handleRemoveBullet(expIdx, bIdx)}
                    className="ats-delete-btn"
                    title="Delete Bullet"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => handleAddBullet(expIdx)}
              >
                Add Bullet
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= Gap Analysis Sub-Component ================= */
interface GapAnalysisViewProps {
  analysis: any;
  selectedMissingKeywords: string[];
  onToggleKeyword: (kw: string) => void;
  onTriggerRewrite: () => void;
}

const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  analysis,
  selectedMissingKeywords,
  onToggleKeyword,
  onTriggerRewrite,
}) => {
  if (!analysis) return null;

  const { atsScore, keywordMatchPct, matchedKeywords, missingKeywords, checks, roleSummary } = analysis;

  return (
    <div className="ats-section-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] border border-[#BFDBFE]">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[#2563EB] tracking-wider">
            Composite ATS Score
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-[#0F172A] font-mono">
              {atsScore}
            </span>
            <span className="text-sm font-semibold text-[#64748B]">/ 100</span>
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
          <span className="text-xs text-[#64748B]">Keyword Match Ratio</span>
          <p className="text-2xl font-bold text-[#2563EB] font-mono">
            {keywordMatchPct}%
          </p>
          <p className="text-[11px] text-[#64748B]">
            {matchedKeywords?.length || 0} matched • {missingKeywords?.length || 0} missing
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase text-[#0F172A] tracking-wider">
            Missing Target Keywords (Select to Confirm Truthful Experience)
          </h4>
          <span className="text-[11px] text-[#64748B]">
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

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold uppercase text-[#0F172A] tracking-wider">
          ATS Format & Parser Safety Checklist
        </h4>
        <div className="space-y-2">
          {(checks || []).map((check: any) => (
            <div
              key={check.id}
              className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between gap-3 text-xs"
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
              <span className="font-mono text-[#64748B] text-[11px] flex-shrink-0">
                +{check.scoreImpact} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= Bullet Rewriter Sub-Component ================= */
interface BulletRewriterProps {
  bullets: string[];
  missingKeywords: string[];
  onAcceptRewrite: (originalIndex: number, newText: string) => void;
}

const BulletRewriter: React.FC<BulletRewriterProps> = ({
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
    <div className="ats-section-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">AI Side-by-Side Bullet Optimizer</h3>
          <p className="text-xs text-[#64748B]">
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
          className="form-select-box"
        >
          {bullets.map((bullet, idx) => (
            <option key={idx} value={idx}>
              Bullet {idx + 1}: "{bullet.slice(0, 60)}..."
            </option>
          ))}
        </select>
      </div>

      {suggestion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF]/30">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <span className="text-[11px] font-semibold uppercase text-[#64748B]">Original Bullet</span>
            <p className="text-xs text-[#475569] leading-relaxed">{suggestion.originalBullet}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#BFDBFE] space-y-3 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-[#2563EB] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Tailored Suggestion
            </span>
            <p className="text-xs font-semibold text-[#0F172A] leading-relaxed">
              {suggestion.suggestedBullet}
            </p>

            {suggestion.rationale && (
              <p className="text-[11px] text-[#64748B] italic">{suggestion.rationale}</p>
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

/* ================= Consolidated ATS Page ================= */
export const AtsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis'>('editor');
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [rawJdText, setRawJdText] = useState<string>('');
  const [baseResume, setBaseResume] = useState<any>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedMissingKeywords, setSelectedMissingKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getApplications().then((res) => setApplications(res.applications || [])).catch(() => {});
    api.getBaseResume().then((res) => setBaseResume(res.resume)).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    try {
      const res = await api.analyzeJob(selectedAppId || undefined, rawJdText || undefined);
      setAnalysisResult(res.analysis);
      setSelectedMissingKeywords(res.analysis.missingKeywords || []);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job description.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleKeyword = (kw: string) => {
    if (selectedMissingKeywords.includes(kw)) {
      setSelectedMissingKeywords(selectedMissingKeywords.filter((k) => k !== kw));
    } else {
      setSelectedMissingKeywords([...selectedMissingKeywords, kw]);
    }
  };

  const handleAcceptRewrite = (bulletIndex: number, newText: string) => {
    if (!baseResume) return;
    const updated = { ...baseResume };
    if (updated.sections?.experience?.[0]?.bullets) {
      updated.sections.experience[0].bullets[bulletIndex] = newText;
      setBaseResume(updated);
      api.updateBaseResume(updated.sections);
    }
  };

  const currentBullets =
    baseResume?.sections?.experience?.[0]?.bullets || [
      'Engineered high-throughput REST APIs handling 50k daily active users with Node.js and MongoDB.',
      'Architected modular React micro-frontends reducing page load latency by 35%.',
    ];

  return (
    <div className="ats-page-container">
      <div className="ats-header-row">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>ATS Resume Optimizer & AI Rewriter</span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
              Parser Ready
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Extract target JD keywords, audit ATS safety, and rewrite bullet points truthfully.
          </p>
        </div>

        <SegmentedTabs
          tabs={[
            { id: 'editor', label: 'Base Resume JSON', icon: <FileText className="w-4 h-4" /> },
            { id: 'analysis', label: 'ATS Audit & Gap Analysis', icon: <SearchCheck className="w-4 h-4" /> },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      <div className="ats-section-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Target Job Description Source
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Choose an active pipeline job or paste raw text
          </span>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#FFE4E6', border: '1px solid #FECDD3', fontSize: '12px', fontWeight: 600, color: '#E11D48' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group-wrap">
            <label className="form-label-title">Select Job from Pipeline</label>
            <select
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                setRawJdText('');
              }}
              className="form-select-box"
            >
              <option value="">-- Choose Pipeline Application --</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.companyName} — {app.roleTitle} ({app.stage})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-wrap">
            <label className="form-label-title">Or Paste Raw Job Description Text</label>
            <textarea
              rows={2}
              value={rawJdText}
              onChange={(e) => {
                setRawJdText(e.target.value);
                setSelectedAppId('');
              }}
              placeholder="Paste job posting requirements, skills, and qualifications..."
              className="form-textarea-box"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <Button
            variant="primary"
            size="md"
            isLoading={analyzing}
            icon={<Sparkles size={16} />}
            onClick={handleAnalyze}
          >
            Run ATS Gap Analysis
          </Button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <ResumeEditor initialResume={baseResume} onSaveSuccess={() => {}} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GapAnalysisView
            analysis={analysisResult}
            selectedMissingKeywords={selectedMissingKeywords}
            onToggleKeyword={handleToggleKeyword}
            onTriggerRewrite={() => {}}
          />

          {analysisResult && (
            <BulletRewriter
              bullets={currentBullets}
              missingKeywords={selectedMissingKeywords}
              onAcceptRewrite={handleAcceptRewrite}
            />
          )}
        </div>
      )}
    </div>
  );
};
