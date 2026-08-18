import { Request, Response } from 'express';
import { geminiService } from '../services/gemini';
import { Application } from '../models/Application';
import { InterviewPrep } from '../models/InterviewPrep';
import mongoose from 'mongoose';

export const interviewPrepController = {
  /**
   * Generate role-specific interview questions for a job application using Gemini API.
   */
  async generateQuestions(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { applicationId, companyName, roleTitle, jobDescription } = req.body;

      let company = companyName || 'Target Company';
      let role = roleTitle || 'Software Engineer';
      let jd = jobDescription || '';

      if (applicationId && mongoose.Types.ObjectId.isValid(applicationId)) {
        const app = await Application.findOne({ _id: applicationId, userId });
        if (app) {
          company = app.companyName;
          role = app.roleTitle;
          if (app.jobDescriptionRaw) jd = app.jobDescriptionRaw;
        }
      }

      const questions = await geminiService.generateInterviewQuestions(company, role, jd);

      return res.status(200).json({
        companyName: company,
        roleTitle: role,
        questions,
      });
    } catch (error) {
      console.error('Generate Interview Questions Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to generate interview questions.',
      });
    }
  },

  /**
   * Evaluate user's STAR response using Gemini API and return critique + polished draft.
   */
  async reviewStarAnswer(req: Request, res: Response) {
    try {
      const { question, star } = req.body;

      if (!question || !star || !star.situation || !star.action) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Question and STAR components (situation, action) are required.',
        });
      }

      const critique = await geminiService.reviewStarAnswer(
        question,
        star.situation || '',
        star.task || '',
        star.action || '',
        star.result || ''
      );

      return res.status(200).json({
        critique,
      });
    } catch (error) {
      console.error('Review STAR Answer Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to review STAR answer.',
      });
    }
  },

  /**
   * Fetch user's saved answer bank entries.
   */
  async getAnswerBank(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const items = await InterviewPrep.find({ userId }).sort({ updatedAt: -1 });

      return res.status(200).json({
        answerBank: items,
      });
    } catch (error) {
      console.error('Get Answer Bank Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch answer bank.',
      });
    }
  },

  /**
   * Save or update an answer bank Q&A entry.
   */
  async saveAnswer(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { id, applicationId, question, category, starAnswer, polishedDraft, companyName } = req.body;

      if (!question) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Question text is required.',
        });
      }

      let entry;
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        entry = await InterviewPrep.findOneAndUpdate(
          { _id: id, userId },
          {
            $set: {
              ...(applicationId && { applicationId: new mongoose.Types.ObjectId(applicationId) }),
              question,
              category: category || 'Behavioral',
              starAnswer,
              polishedDraft,
              companyName,
            },
          },
          { new: true }
        );
      } else {
        entry = await InterviewPrep.create({
          userId,
          ...(applicationId && { applicationId: new mongoose.Types.ObjectId(applicationId) }),
          question,
          category: category || 'Behavioral',
          starAnswer,
          polishedDraft,
          companyName,
        });
      }

      return res.status(200).json({
        message: 'Answer saved to Answer Bank.',
        entry,
      });
    } catch (error) {
      console.error('Save Answer Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to save answer.',
      });
    }
  },

  /**
   * Delete an entry from the Answer Bank.
   */
  async deleteAnswer(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Invalid answer ID format.',
        });
      }

      const item = await InterviewPrep.findOneAndDelete({ _id: id, userId });
      if (!item) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Answer bank entry not found or unauthorized.',
        });
      }

      return res.status(200).json({
        message: 'Entry deleted from Answer Bank.',
      });
    } catch (error) {
      console.error('Delete Answer Error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to delete answer.',
      });
    }
  },
};
