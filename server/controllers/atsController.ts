import { Request, Response } from 'express';
import { geminiService } from '../services/gemini';
import { Resume } from '../models/Resume';
import { Application } from '../models/Application';
import { evaluateAtsScore } from '../utils/atsScorer';
import mongoose from 'mongoose';

export const atsController = {
  /**
   * Analyze target job description against user's base resume.
   */
  async analyzeJob(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { applicationId, jobDescriptionText } = req.body;

      let jdText = jobDescriptionText || '';

      // If applicationId provided, pull stored raw JD from Application document
      if (!jdText && applicationId && mongoose.Types.ObjectId.isValid(applicationId)) {
        const app = await Application.findOne({ _id: applicationId, userId });
        if (app && app.jobDescriptionRaw) {
          jdText = app.jobDescriptionRaw;
        }
      }

      if (!jdText || jdText.trim().length < 20) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Please provide a valid Job Description (minimum 20 characters).',
        });
      }

      // Fetch user's base resume
      let baseResume = await Resume.findOne({ userId, isBaseResume: true });
      if (!baseResume) {
        // Create fallback base resume if missing
        baseResume = await Resume.create({
          userId,
          versionLabel: 'Master Base Resume',
          isBaseResume: true,
          sections: {
            summary: 'Software Engineer',
            skills: { technical: ['TypeScript', 'React', 'Node.js'], tools: ['Git'], soft: [] },
            experience: [],
            projects: [],
            education: [],
          },
        });
      }

      // Extract JD keywords using Gemini Service
      const extracted = await geminiService.extractJobKeywords(jdText);

      // Collect all keywords in user's current resume
      const resumeKeywordsSet = new Set<string>();
      const skills = baseResume.sections?.skills;
      if (skills) {
        [...(skills.technical || []), ...(skills.tools || []), ...(skills.soft || [])].forEach((kw) =>
          resumeKeywordsSet.add(kw.toLowerCase())
        );
      }

      if (baseResume.sections?.experience) {
        for (const exp of baseResume.sections.experience) {
          if (exp.bullets) {
            for (const bullet of exp.bullets) {
              bullet.split(/\W+/).forEach((word) => {
                if (word.length > 2) resumeKeywordsSet.add(word.toLowerCase());
              });
            }
          }
        }
      }

      // Identify missing keywords
      const allTargetKeywords = [
        ...extracted.requiredKeywords,
        ...extracted.niceToHaveKeywords,
        ...extracted.techStack,
      ];
      const uniqueTargetKeywords = Array.from(new Set(allTargetKeywords));

      const matchedKeywords: string[] = [];
      const missingKeywords: string[] = [];

      for (const targetKw of uniqueTargetKeywords) {
        const normalized = targetKw.toLowerCase();
        let isMatch = false;

        for (const resKw of resumeKeywordsSet) {
          if (resKw.includes(normalized) || normalized.includes(resKw)) {
            isMatch = true;
            break;
          }
        }

        if (isMatch) {
          matchedKeywords.push(targetKw);
        } else {
          missingKeywords.push(targetKw);
        }
      }

      // Compute Rules-Based ATS Score
      const atsResult = evaluateAtsScore(
        baseResume.sections,
        matchedKeywords.length,
        uniqueTargetKeywords.length
      );

      return res.status(200).json({
        analysis: {
          roleSummary: extracted.roleSummary,
          requiredKeywords: extracted.requiredKeywords,
          niceToHaveKeywords: extracted.niceToHaveKeywords,
          techStack: extracted.techStack,
          matchedKeywords,
          missingKeywords,
          atsScore: atsResult.score,
          keywordMatchPct: atsResult.keywordMatchPct,
          checks: atsResult.checks,
        },
      });
    } catch (error) {
      console.error('ATS Analyze Job Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to analyze job description.',
      });
    }
  },

  /**
   * AI Bullet Rewriter: rewrites resume bullet to naturally incorporate confirmed missing keywords.
   */
  async rewriteBullet(req: Request, res: Response) {
    try {
      const { originalBullet, missingKeywords, roleContext } = req.body;

      if (!originalBullet || typeof originalBullet !== 'string' || originalBullet.trim().length === 0) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'originalBullet string is required.',
        });
      }

      const targetKeywords = Array.isArray(missingKeywords) ? missingKeywords : [];

      const rewriteResult = await geminiService.rewriteResumeBullet(
        originalBullet,
        targetKeywords,
        roleContext
      );

      return res.status(200).json({
        suggestion: rewriteResult,
      });
    } catch (error) {
      console.error('ATS Rewrite Bullet Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to rewrite bullet.',
      });
    }
  },
};
