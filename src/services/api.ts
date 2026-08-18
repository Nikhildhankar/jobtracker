export interface DashboardStats {
  totalActive: number;
  totalAll: number;
  addedThisWeek: number;
  responseRatePct: number;
  avgDaysToResponse: number;
  stageCounts: {
    Wishlist: number;
    Applied: number;
    Screening: number;
    Interviewing: number;
    Offer: number;
    Archived: number;
  };
}

export interface AttentionItem {
  id: string;
  companyName: string;
  roleTitle: string;
  stage: string;
  appliedDate?: string;
  nextActionDate?: string;
  daysStale?: number;
  type: 'stale' | 'interview_upcoming';
  contact?: {
    name?: string;
    email?: string;
    role?: string;
    verificationStatus?: string;
  };
}

export interface ActivityItem {
  id: string;
  applicationId: string;
  companyName: string;
  roleTitle: string;
  stage: string;
  timestamp: string;
  notes?: string;
}

export interface ApplicationData {
  _id: string;
  userId: string;
  companyName: string;
  roleTitle: string;
  source?: string;
  stage: 'Wishlist' | 'Applied' | 'Screening' | 'Interviewing' | 'Offer' | 'Archived';
  workModel?: 'Remote' | 'Hybrid' | 'On-site';
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    verificationStatus?: 'verified' | 'risky' | 'unverified';
  };
  appliedDate?: string;
  jobDescriptionRaw?: string;
  extractedKeywords?: string[];
  stageHistory: Array<{
    stage: string;
    timestamp: string;
    notes?: string;
  }>;
  nextActionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getDashboardAttention(): Promise<{
    totalAttention: number;
    staleApplications: AttentionItem[];
    upcomingInterviews: AttentionItem[];
  }> {
    const res = await fetch('/api/dashboard/attention');
    if (!res.ok) throw new Error('Failed to fetch attention items');
    return res.json();
  },

  async getDashboardActivity(): Promise<{ activity: ActivityItem[] }> {
    const res = await fetch('/api/dashboard/activity');
    if (!res.ok) throw new Error('Failed to fetch activity feed');
    return res.json();
  },

  async getApplications(): Promise<{ applications: ApplicationData[] }> {
    const res = await fetch('/api/applications');
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async getApplicationById(id: string): Promise<{ application: ApplicationData }> {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) throw new Error('Failed to fetch application');
    return res.json();
  },

  async createApplication(data: Partial<ApplicationData>): Promise<{ application: ApplicationData }> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create application');
    return res.json();
  },

  async updateApplicationStage(id: string, stage: string, notes?: string): Promise<{ application: ApplicationData }> {
    const res = await fetch(`/api/applications/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, notes }),
    });
    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
  },

  async updateApplication(id: string, data: Partial<ApplicationData>): Promise<{ application: ApplicationData }> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  async deleteApplication(id: string): Promise<void> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete application');
  },

  async getBaseResume(): Promise<{ resume: any }> {
    const res = await fetch('/api/resumes/base');
    if (!res.ok) throw new Error('Failed to fetch base resume');
    return res.json();
  },

  async updateBaseResume(sections: any): Promise<{ resume: any }> {
    const res = await fetch('/api/resumes/base', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    });
    if (!res.ok) throw new Error('Failed to update base resume');
    return res.json();
  },

  async analyzeJob(applicationId?: string, jobDescriptionText?: string): Promise<{ analysis: any }> {
    const res = await fetch('/api/ats/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, jobDescriptionText }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to analyze job description');
    }
    return res.json();
  },

  async rewriteBullet(originalBullet: string, missingKeywords: string[], roleContext?: string): Promise<{ suggestion: any }> {
    const res = await fetch('/api/ats/rewrite-bullet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalBullet, missingKeywords, roleContext }),
    });
    if (!res.ok) throw new Error('Failed to rewrite bullet point');
    return res.json();
  },

  async generateInterviewQuestions(payload: {
    applicationId?: string;
    companyName?: string;
    roleTitle?: string;
    jobDescription?: string;
  }): Promise<{ companyName: string; roleTitle: string; questions: any[] }> {
    const res = await fetch('/api/interview-prep/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate interview questions');
    return res.json();
  },

  async reviewStarAnswer(question: string, star: { situation: string; task?: string; action: string; result?: string }): Promise<{ critique: any }> {
    const res = await fetch('/api/interview-prep/review-star', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, star }),
    });
    if (!res.ok) throw new Error('Failed to review STAR answer');
    return res.json();
  },

  async getAnswerBank(): Promise<{ answerBank: any[] }> {
    const res = await fetch('/api/interview-prep');
    if (!res.ok) throw new Error('Failed to fetch answer bank');
    return res.json();
  },

  async saveAnswer(data: any): Promise<{ entry: any }> {
    const res = await fetch('/api/interview-prep/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save answer to bank');
    return res.json();
  },

  async deleteAnswer(id: string): Promise<void> {
    const res = await fetch(`/api/interview-prep/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete answer');
  },

  async getActionCenterItems(): Promise<{
    totalActionNeeded: number;
    staleApplications: AttentionItem[];
    upcomingInterviews: AttentionItem[];
  }> {
    const res = await fetch('/api/action-center/items');
    if (!res.ok) throw new Error('Failed to fetch action center items');
    return res.json();
  },

  async draftFollowupEmail(applicationId: string, customNotes?: string): Promise<{ companyName: string; roleTitle: string; contact?: any; draft: { subject: string; body: string } }> {
    const res = await fetch('/api/action-center/draft-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, customNotes }),
    });
    if (!res.ok) throw new Error('Failed to draft follow-up email');
    return res.json();
  },

  async markFollowedUp(applicationId: string, notes?: string): Promise<{ application: ApplicationData }> {
    const res = await fetch('/api/action-center/mark-followed-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, notes }),
    });
    if (!res.ok) throw new Error('Failed to mark application as followed up');
    return res.json();
  },
};
