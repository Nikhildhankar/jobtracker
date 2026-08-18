import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

export interface ExtractedKeywordsResult {
  requiredKeywords: string[];
  niceToHaveKeywords: string[];
  techStack: string[];
  roleSummary: string;
}

export interface BulletRewriteResult {
  originalBullet: string;
  suggestedBullet: string;
  rationale: string;
  keywordsIncluded: string[];
}

export interface GeneratedQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'role_fit' | 'system_design';
  question: string;
  context: string;
}

export interface FollowupDraftResult {
  subject: string;
  body: string;
}

class GeminiService {
  private client: GoogleGenAI | null = null;
  private modelName = 'gemini-2.0-flash';

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Extracts ATS-relevant keywords and tech stack from a raw Job Description.
   */
  async extractJobKeywords(jobDescription: string): Promise<ExtractedKeywordsResult> {
    if (!this.client) {
      return this.fallbackKeywordExtraction(jobDescription);
    }

    try {
      const prompt = `You are an expert ATS (Applicant Tracking System) parser and recruiter.
Analyze the following Job Description and extract:
1. "requiredKeywords": Top 10-15 must-have skills, qualifications, or requirements.
2. "niceToHaveKeywords": 5-10 preferred or bonus skills/qualifications.
3. "techStack": Array of specific tools, languages, libraries, frameworks, cloud platforms mentioned.
4. "roleSummary": A crisp 2-sentence summary of the core mission.

Return ONLY a valid JSON object matching this schema:
{
  "requiredKeywords": ["string"],
  "niceToHaveKeywords": ["string"],
  "techStack": ["string"],
  "roleSummary": "string"
}

Job Description:
${jobDescription}`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text) as ExtractedKeywordsResult;
    } catch (error) {
      console.warn('⚠️ Gemini keyword extraction failed, using fallback:', error);
      return this.fallbackKeywordExtraction(jobDescription);
    }
  }

  /**
   * Suggests high-impact bullet rewrite incorporating confirmed keywords without inventing experience.
   */
  async rewriteResumeBullet(
    originalBullet: string,
    targetKeywords: string[],
    roleContext?: string
  ): Promise<BulletRewriteResult> {
    if (!this.client) {
      return {
        originalBullet,
        suggestedBullet: originalBullet,
        rationale: 'Gemini API Key not configured for AI rewrite.',
        keywordsIncluded: [],
      };
    }

    try {
      const prompt = `You are a professional executive resume writer and ATS optimization specialist.
Rewrite the following resume bullet point to make it more impactful, metric-driven (Action Verb + Context + Measurable Result), and naturally incorporate some of the target keywords where truthful.
DO NOT hallucinate or make up false achievements. Keep it crisp, active voice, and under 25 words.

Original Bullet: "${originalBullet}"
Target Keywords to Naturally Include: ${targetKeywords.join(', ')}
${roleContext ? `Role / Project Context: ${roleContext}` : ''}

Return ONLY a valid JSON object with:
{
  "originalBullet": "${originalBullet}",
  "suggestedBullet": "string",
  "rationale": "string explaining the enhancement",
  "keywordsIncluded": ["string"]
}`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text) as BulletRewriteResult;
    } catch (error) {
      console.error('⚠️ Gemini bullet rewrite failed:', error);
      return {
        originalBullet,
        suggestedBullet: originalBullet,
        rationale: 'AI suggestion temporarily unavailable.',
        keywordsIncluded: [],
      };
    }
  }

  /**
   * Generates tailored interview questions based on company, role, and Job Description.
   */
  async generateInterviewQuestions(
    companyName: string,
    roleTitle: string,
    jobDescription?: string
  ): Promise<GeneratedQuestion[]> {
    if (!this.client) {
      return [
        {
          id: 'q-default-1',
          type: 'behavioral',
          question: `Tell me about a challenging technical project you led at ${companyName || 'your past company'} and how you handled unexpected roadblocks.`,
          context: 'Assesses leadership and problem-solving under pressure.',
        },
        {
          id: 'q-default-2',
          type: 'technical',
          question: `How would you architect a high-availability backend system for ${roleTitle || 'Software Engineer'} responsibilities?`,
          context: 'System design and architecture skills.',
        },
      ];
    }

    try {
      const prompt = `You are an experienced hiring manager for ${companyName} interviewing a candidate for ${roleTitle}.
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Generate:
- 3 Technical / System Design questions relevant to the role.
- 3 Behavioral (STAR method) questions tailored to leadership and execution.
- 2 Culture and motivation fit questions.

Return ONLY a valid JSON array of objects with schema:
[
  {
    "id": "string",
    "type": "technical" | "behavioral" | "role_fit" | "system_design",
    "question": "string",
    "context": "string explaining what the interviewer is evaluating"
  }
]`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '[]';
      return JSON.parse(text) as GeneratedQuestion[];
    } catch (error) {
      console.error('⚠️ Gemini question generation failed:', error);
      return [];
    }
  }

  /**
   * Evaluates user's STAR response, checks metric inclusion, and provides a polished draft.
   */
  async reviewStarAnswer(
    question: string,
    situation: string,
    task: string,
    action: string,
    result: string
  ): Promise<{
    feedback: string;
    hasQuantifiableMetric: boolean;
    polishedDraft: string;
  }> {
    const hasMetric = /\b(\d+%|\$\d+|\d+k|\d+x|\d+\+)\b/i.test(result);

    if (!this.client) {
      return {
        feedback: hasMetric
          ? 'Great STAR response! You included clear action steps and quantifiable metrics.'
          : 'Good context provided, but try adding a specific quantitative metric (e.g., % improvement, $ saved) in the Result section.',
        hasQuantifiableMetric: hasMetric,
        polishedDraft: `When ${situation}, I was responsible for ${task || 'delivering the core solution'}. I ${action}. As a result, ${result || 'achieved project milestones'}.`,
      };
    }

    try {
      const prompt = `You are an expert interview coach evaluating a candidate's STAR (Situation, Task, Action, Result) response.
Question: "${question}"
Situation: "${situation}"
Task: "${task}"
Action: "${action}"
Result: "${result}"

Evaluate:
1. "feedback": 2-3 sentences of coaching advice (clarity, action verb strength, conciseness).
2. "hasQuantifiableMetric": boolean (true if Result contains numbers, %, $, scale, or time metrics).
3. "polishedDraft": An optimized, natural sounding 3-4 sentence version combining the STAR components.

Return ONLY a valid JSON object:
{
  "feedback": "string",
  "hasQuantifiableMetric": true,
  "polishedDraft": "string"
}`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (error) {
      console.error('⚠️ Gemini STAR review failed:', error);
      return {
        feedback: 'Evaluation complete.',
        hasQuantifiableMetric: hasMetric,
        polishedDraft: `${situation} ${action} ${result}`,
      };
    }
  }

  /**
   * Drafts a polite, non-pushy follow-up email for stale applications.
   */
  async draftFollowupEmail(params: {
    companyName: string;
    roleTitle: string;
    contactName?: string;
    daysSinceApplied?: number;
    customNotes?: string;
  }): Promise<FollowupDraftResult> {
    const { companyName, roleTitle, contactName, daysSinceApplied = 7, customNotes } = params;

    if (!this.client) {
      const greeting = contactName ? `Hi ${contactName},` : 'Hello Hiring Team,';
      return {
        subject: `Following up on my application for ${roleTitle} - ${companyName}`,
        body: `${greeting}\n\nI hope you're having a great week. I recently submitted my application for the ${roleTitle} position at ${companyName} (${daysSinceApplied} days ago).\n\nI remain very enthusiastic about the opportunity and wanted to check in on the recruitment timeline. Please let me know if there are any additional materials I can provide.\n\nBest regards,`,
      };
    }

    try {
      const prompt = `Draft a concise, warm, and professional follow-up email for a job application.
Company: ${companyName}
Role: ${roleTitle}
Recipient Name: ${contactName || 'Hiring Team'}
Days since application: ${daysSinceApplied}
${customNotes ? `Additional context: ${customNotes}` : ''}

Tone Guidelines:
- Under 100 words.
- Respectful of their time, confident, not desperate or demanding.
- Reference enthusiasm for the role and specific value.

Return ONLY a valid JSON object with:
{
  "subject": "string",
  "body": "string"
}`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text) as FollowupDraftResult;
    } catch (error) {
      console.error('⚠️ Gemini follow-up draft generation failed:', error);
      return {
        subject: `Following up: ${roleTitle} role at ${companyName}`,
        body: `Hi ${contactName || 'there'},\n\nI'm following up on my application for the ${roleTitle} position. I look forward to hearing about next steps.\n\nBest regards,`,
      };
    }
  }

  /**
   * Fallback rule-based keyword extraction if Gemini API key is not yet provided.
   */
  private fallbackKeywordExtraction(text: string): ExtractedKeywordsResult {
    const commonTech = [
      'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB',
      'Docker', 'AWS', 'Next.js', 'FastAPI', 'Express', 'GraphQL', 'REST',
      'TailwindCSS', 'Git', 'CI/CD', 'Kubernetes', 'Redis', 'Java', 'Go'
    ];

    const detected = commonTech.filter((keyword) =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(text)
    );

    return {
      requiredKeywords: detected.slice(0, 8),
      niceToHaveKeywords: detected.slice(8, 12),
      techStack: detected,
      roleSummary: 'Role extracted via pattern analysis.',
    };
  }
}

export const geminiService = new GeminiService();
