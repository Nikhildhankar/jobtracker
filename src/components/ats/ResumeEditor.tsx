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

      {/* Professional Summary */}
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

      {/* Technical Skills Chips */}
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

      {/* Experience Bullets */}
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
