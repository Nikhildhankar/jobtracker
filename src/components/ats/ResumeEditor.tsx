import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export interface ResumeEditorProps {
  initialResume: any;
  onSaveSuccess?: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ initialResume, onSaveSuccess }) => {
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
    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">Master Base Resume JSON</h3>
          <p className="text-xs text-[#7C8896]">
            Your central source-of-truth resume. All ATS scans and AI rewrites build from this base.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          isLoading={saving}
          icon={savedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          {savedMsg ? 'Saved!' : 'Save Base Resume'}
        </Button>
      </div>

      {/* Professional Summary */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
          Professional Summary
        </label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief executive summary of core technical background and focus..."
          className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
        />
      </div>

      {/* Technical Skills Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
          Technical Skills & Keywords
        </label>
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          {techSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-xs"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-[#94A3B8] hover:text-[#E11D48] cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="+ Add Skill"
              className="px-2 py-0.5 text-xs bg-transparent outline-none border-b border-transparent focus:border-[#2563EB] w-24"
            />
          </div>
        </div>
      </div>

      {/* Experience Bullets */}
      <div className="space-y-4">
        <label className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
          Professional Experience Bullets
        </label>
        {experience.map((exp, expIdx) => (
          <div key={expIdx} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A]">{exp.company}</span>
                <span className="text-xs text-[#7C8896]">• {exp.role}</span>
              </div>
              <span className="text-[11px] font-mono text-[#7C8896]">
                {exp.startDate} - {exp.endDate}
              </span>
            </div>

            <div className="space-y-2">
              {exp.bullets.map((bullet: string, bIdx: number) => (
                <div key={bIdx} className="flex items-start gap-2">
                  <span className="text-xs text-[#2563EB] mt-2">•</span>
                  <textarea
                    rows={2}
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                    className="flex-1 p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                  <button
                    onClick={() => handleRemoveBullet(expIdx, bIdx)}
                    className="p-1 text-[#94A3B8] hover:text-[#E11D48] mt-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => handleAddBullet(expIdx)}
            >
              Add Bullet
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
