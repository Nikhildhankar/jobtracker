import { IResumeSections } from '../models/Resume';

export interface AtsCheckItem {
  id: string;
  category: 'format' | 'content' | 'keywords' | 'structure';
  label: string;
  passed: boolean;
  scoreImpact: number;
  tip: string;
}

export interface AtsScoreResult {
  score: number; // 0 - 100
  keywordMatchPct: number;
  checks: AtsCheckItem[];
}

const ACTION_VERBS = new Set([
  'built', 'engineered', 'developed', 'architected', 'spearheaded', 'designed',
  'implemented', 'optimized', 'scaled', 'led', 'managed', 'created', 'launched',
  'delivered', 'reduced', 'increased', 'improved', 'automated', 'streamlined',
  'refactored', 'integrated', 'deployed', 'migrated', 'transformed', 'formulated',
]);

/**
 * Rules-based non-AI evaluator checking ATS parser safety, structure, action verbs, and date formats.
 */
export function evaluateAtsScore(
  sections: IResumeSections,
  matchedKeywordsCount = 0,
  totalTargetKeywordsCount = 0
): AtsScoreResult {
  const checks: AtsCheckItem[] = [];

  // Check 1: Section Completeness
  const hasSummary = Boolean(sections.summary && sections.summary.trim().length > 30);
  const hasSkills = Boolean(
    (sections.skills?.technical?.length || 0) +
      (sections.skills?.tools?.length || 0) +
      (sections.skills?.soft?.length || 0) > 0
  );
  const hasExperience = Boolean(sections.experience && sections.experience.length > 0);
  const hasEducation = Boolean(sections.education && sections.education.length > 0);

  const sectionsPassed = hasSummary && hasSkills && hasExperience && hasEducation;
  checks.push({
    id: 'sec-completeness',
    category: 'structure',
    label: 'Standard Section Hierarchy',
    passed: sectionsPassed,
    scoreImpact: 20,
    tip: 'Ensure Summary, Skills, Experience, and Education sections are present.',
  });

  // Check 2: Action Verbs at Bullet Starts
  let totalBullets = 0;
  let actionVerbBullets = 0;

  if (sections.experience) {
    for (const exp of sections.experience) {
      if (exp.bullets) {
        for (const bullet of exp.bullets) {
          totalBullets += 1;
          const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
          if (firstWord && ACTION_VERBS.has(firstWord)) {
            actionVerbBullets += 1;
          }
        }
      }
    }
  }

  const actionVerbPct = totalBullets > 0 ? (actionVerbBullets / totalBullets) * 100 : 0;
  const actionVerbsPassed = actionVerbPct >= 70;
  checks.push({
    id: 'action-verbs',
    category: 'content',
    label: 'Action-Verb Bullet Openings',
    passed: actionVerbsPassed,
    scoreImpact: 20,
    tip: 'Start at least 70% of bullets with strong action verbs (e.g., Engineered, Spearheaded, Scaled).',
  });

  // Check 3: Date Format Consistency
  let dateConsistencyPassed = true;
  if (sections.experience) {
    for (const exp of sections.experience) {
      if (exp.startDate && !/^\d{4}(-\d{2})?$/i.test(exp.startDate) && !/^[A-Z][a-z]{2}\s\d{4}$/i.test(exp.startDate)) {
        dateConsistencyPassed = false;
        break;
      }
    }
  }
  checks.push({
    id: 'date-formats',
    category: 'format',
    label: 'Consistent Clean Date Formats',
    passed: dateConsistencyPassed,
    scoreImpact: 15,
    tip: 'Use standard date formats like YYYY-MM or "Jan 2024" so ATS parsers accurately read your timeline.',
  });

  // Check 4: Bullet Length & Quantitative Metrics
  let metricBullets = 0;
  if (sections.experience) {
    for (const exp of sections.experience) {
      if (exp.bullets) {
        for (const bullet of exp.bullets) {
          if (/\b(\d+%|\$\d+|\d+k|\d+x|\d+\+)\b/i.test(bullet)) {
            metricBullets += 1;
          }
        }
      }
    }
  }
  const metricRatio = totalBullets > 0 ? (metricBullets / totalBullets) * 100 : 0;
  const metricsPassed = metricRatio >= 40;
  checks.push({
    id: 'measurable-impact',
    category: 'content',
    label: 'Measurable Metrics & Results',
    passed: metricsPassed,
    scoreImpact: 15,
    tip: 'Include quantifiable metrics (%, $, scale) in at least 40% of experience bullet points.',
  });

  // Check 5: Target Keyword Match Ratio
  const keywordMatchPct =
    totalTargetKeywordsCount > 0
      ? Math.round((matchedKeywordsCount / totalTargetKeywordsCount) * 100)
      : 100;
  const keywordPassed = keywordMatchPct >= 65;
  checks.push({
    id: 'keyword-density',
    category: 'keywords',
    label: 'Target Job Keyword Density',
    passed: keywordPassed,
    scoreImpact: 30,
    tip: 'Aim for at least 65% keyword alignment with the target job description.',
  });

  // Calculate composite score (0 - 100)
  let totalScore = 0;
  for (const check of checks) {
    if (check.passed) {
      totalScore += check.scoreImpact;
    } else {
      // Partial credit
      if (check.id === 'keyword-density') {
        totalScore += Math.round((keywordMatchPct / 100) * check.scoreImpact);
      } else if (check.id === 'action-verbs') {
        totalScore += Math.round((actionVerbPct / 100) * check.scoreImpact);
      }
    }
  }

  const finalScore = Math.min(100, Math.max(0, totalScore));

  return {
    score: finalScore,
    keywordMatchPct,
    checks,
  };
}
