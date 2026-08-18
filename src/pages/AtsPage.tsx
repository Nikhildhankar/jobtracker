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
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">ATS Resume Optimizer & AI Rewriter</h1>
          <p className="page-header-desc">
            Extract target JD keywords, audit ATS parser safety, and rewrite bullet points truthfully.
          </p>
        </div>
        <SegmentedTabs
          tabs={[
            { id: 'editor', label: 'Base Resume JSON', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'analysis', label: 'ATS Audit & Gap Analysis', icon: <SearchCheck className="w-3.5 h-3.5" /> },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* Target Job Selector Strip */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
        <h3 className="text-xs font-semibold uppercase text-[#0F172A] tracking-wider">
          Target Job Description Source
        </h3>

        {error && (
          <div className="p-3 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-xs font-medium text-[#E11D48]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#7C8896]">Select Job from Pipeline</label>
            <select
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                setRawJdText('');
              }}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
            >
              <option value="">-- Choose Pipeline Application --</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.companyName} - {app.roleTitle} ({app.stage})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#7C8896]">Or Paste Raw Job Description Text</label>
            <textarea
              rows={2}
              value={rawJdText}
              onChange={(e) => {
                setRawJdText(e.target.value);
                setSelectedAppId('');
              }}
              placeholder="Paste job posting duties, qualifications, and requirements..."
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <Button
            variant="primary"
            isLoading={analyzing}
            icon={<Sparkles className="w-4 h-4" />}
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
        <div className="space-y-6">
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
