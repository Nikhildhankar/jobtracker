import { Request, Response } from 'express';
import { Resume } from '../models/Resume';
import mongoose from 'mongoose';

export const resumeController = {
  /**
   * Fetch or initialize user's Base Resume JSON.
   */
  async getBaseResume(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      let baseResume = await Resume.findOne({ userId, isBaseResume: true });

      if (!baseResume) {
        // Initialize default empty base resume
        baseResume = await Resume.create({
          userId,
          versionLabel: 'Master Base Resume',
          isBaseResume: true,
          sections: {
            summary: 'Experienced Full Stack Software Engineer specializing in scalable web systems, TypeScript, Node.js, and cloud architecture.',
            skills: {
              technical: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'REST APIs'],
              tools: ['Git', 'Docker', 'Vite', 'Jest', 'Postman'],
              soft: ['Technical Leadership', 'Cross-Functional Collaboration', 'Agile/Scrum'],
            },
            experience: [
              {
                company: 'Tech Solutions Inc.',
                role: 'Software Engineer',
                startDate: '2023-01',
                endDate: 'Present',
                current: true,
                bullets: [
                  'Engineered high-throughput REST APIs handling 50k daily active users with Node.js and MongoDB.',
                  'Architected modular React micro-frontends reducing page load latency by 35%.',
                  'Automated CI/CD pipelines reducing deployment cycle times from 4 hours to 15 minutes.',
                ],
              },
            ],
            projects: [
              {
                title: 'JobTracker SaaS',
                technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Gemini AI'],
                bullets: [
                  'Built multi-tenant career pipeline tracking product with automated ATS gap analysis.',
                ],
              },
            ],
            education: [
              {
                institution: 'State University',
                degree: 'B.S. in Computer Science',
                graduationYear: '2022',
              },
            ],
          },
        });
      }

      return res.status(200).json({
        resume: baseResume,
      });
    } catch (error) {
      console.error('Get Base Resume Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch base resume.',
      });
    }
  },

  /**
   * Update base resume JSON sections.
   */
  async updateBaseResume(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { sections, versionLabel } = req.body;

      const baseResume = await Resume.findOneAndUpdate(
        { userId, isBaseResume: true },
        {
          $set: {
            ...(sections && { sections }),
            ...(versionLabel && { versionLabel }),
          },
        },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        message: 'Base resume updated successfully.',
        resume: baseResume,
      });
    } catch (error) {
      console.error('Update Base Resume Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to update base resume.',
      });
    }
  },

  /**
   * Save a tailored resume version for a specific job application.
   */
  async createTailoredResume(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { applicationId, versionLabel, sections, atsScore, missingKeywordsConfirmed } = req.body;

      if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Valid applicationId is required to create a tailored resume.',
        });
      }

      const tailoredResume = await Resume.create({
        userId,
        applicationId: new mongoose.Types.ObjectId(applicationId),
        versionLabel: versionLabel || 'Tailored Resume',
        isBaseResume: false,
        sections,
        atsScore,
        missingKeywordsConfirmed: missingKeywordsConfirmed || [],
      });

      return res.status(201).json({
        message: 'Tailored resume version saved successfully.',
        resume: tailoredResume,
      });
    } catch (error) {
      console.error('Create Tailored Resume Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to save tailored resume.',
      });
    }
  },
};
