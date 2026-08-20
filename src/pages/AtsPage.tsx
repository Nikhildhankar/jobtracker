import React, { useEffect, useState } from 'react';
import { Sparkles, FileText, SearchCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { ResumeEditor } from '../components/ats/ResumeEditor';
import { GapAnalysisView } from '../components/ats/GapAnalysisView';
import { BulletRewriter } from '../components/ats/BulletRewriter';
import { api } from '../services/api';
import type { ApplicationData } from '../services/api';

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
    // Fetch pipeline applications & base resume on load
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

  // Collect experience bullets for rewriter
  const currentBullets =
    baseResume?.sections?.experience?.[0]?.bullets || [
      'Engineered high-throughput REST APIs handling 50k daily active users with Node.js and MongoDB.',
      'Architected modular React micro-frontends reducing page load latency by 35%.',
    ];

  return (
    <div className="ats-page-container">
      {/* Top Header Row */}
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

      {/* Target Job Selector Card */}
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

      {/* Main Tab Views */}
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
