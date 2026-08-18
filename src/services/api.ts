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

// Initial Mock Seed Data for Offline / GitHub Pages Mode
const INITIAL_DEMO_APPLICATIONS: ApplicationData[] = [
  {
    _id: 'demo-app-1',
    userId: 'demo-user-alex-hunter',
    companyName: 'Stripe',
    roleTitle: 'Senior Full Stack Engineer',
    stage: 'Interviewing',
    source: 'LinkedIn Referral',
    workModel: 'Remote',
    location: 'San Francisco, CA',
    salary: { min: 175000, max: 210000, currency: 'USD', period: 'yearly' },
    appliedDate: '2026-08-08T10:00:00.000Z',
    contact: { name: 'Sarah Jenkins', role: 'Staff Technical Recruiter', email: 'sarah.j@stripe.com' },
    notes: 'Technical system design loop scheduled for Thursday. Review distributed idempotency patterns.',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-08-08T10:00:00.000Z' },
      { stage: 'Screening', timestamp: '2026-08-11T14:00:00.000Z', notes: 'Great 30min recruiter screen.' },
      { stage: 'Interviewing', timestamp: '2026-08-14T09:00:00.000Z', notes: 'Passed coding assessment.' },
    ],
    createdAt: '2026-08-08T10:00:00.000Z',
    updatedAt: '2026-08-14T09:00:00.000Z',
  },
  {
    _id: 'demo-app-2',
    userId: 'demo-user-alex-hunter',
    companyName: 'OpenAI',
    roleTitle: 'Software Engineer, Platform Infrastructure',
    stage: 'Screening',
    source: 'Company Careers',
    workModel: 'Hybrid',
    location: 'San Francisco, CA',
    salary: { min: 220000, max: 280000, currency: 'USD', period: 'yearly' },
    appliedDate: '2026-08-10T11:00:00.000Z',
    contact: { name: 'Michael Chang', role: 'Head of Engineering Talent', email: 'mchang@openai.com' },
    notes: 'Submitted customized resume tailored with ATS keyword optimization.',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-08-10T11:00:00.000Z' },
      { stage: 'Screening', timestamp: '2026-08-13T16:00:00.000Z' },
    ],
    createdAt: '2026-08-10T11:00:00.000Z',
    updatedAt: '2026-08-13T16:00:00.000Z',
  },
  {
    _id: 'demo-app-3',
    userId: 'demo-user-alex-hunter',
    companyName: 'Vercel',
    roleTitle: 'Frontend Platform Engineer',
    stage: 'Offer',
    source: 'Twitter / X',
    workModel: 'Remote',
    location: 'Global / Remote',
    salary: { min: 185000, max: 215000, currency: 'USD', period: 'yearly' },
    appliedDate: '2026-07-28T09:30:00.000Z',
    contact: { name: 'David Lee', role: 'VP of Engineering', email: 'david.lee@vercel.com' },
    notes: 'Offer package received. Reviewing equity grant and benefits breakdown.',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-07-28T09:30:00.000Z' },
      { stage: 'Screening', timestamp: '2026-08-01T10:00:00.000Z' },
      { stage: 'Interviewing', timestamp: '2026-08-06T15:00:00.000Z' },
      { stage: 'Offer', timestamp: '2026-08-15T18:00:00.000Z' },
    ],
    createdAt: '2026-07-28T09:30:00.000Z',
    updatedAt: '2026-08-15T18:00:00.000Z',
  },
  {
    _id: 'demo-app-4',
    userId: 'demo-user-alex-hunter',
    companyName: 'Google',
    roleTitle: 'Software Engineer III (L4)',
    stage: 'Applied',
    source: 'Referral',
    workModel: 'Hybrid',
    location: 'Mountain View, CA',
    salary: { min: 160000, max: 195000, currency: 'USD', period: 'yearly' },
    appliedDate: '2026-08-02T14:00:00.000Z',
    contact: { name: 'Elena Rostova', role: 'Senior Recruiter', email: 'elena.r@google.com' },
    notes: 'No response after 16 days. Ready for 1-click AI follow-up email draft.',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-08-02T14:00:00.000Z' },
    ],
    createdAt: '2026-08-02T14:00:00.000Z',
    updatedAt: '2026-08-02T14:00:00.000Z',
  },
  {
    _id: 'demo-app-5',
    userId: 'demo-user-alex-hunter',
    companyName: 'Figma',
    roleTitle: 'Full Stack Product Engineer',
    stage: 'Wishlist',
    source: 'Simplify',
    workModel: 'Hybrid',
    location: 'San Francisco, CA',
    salary: { min: 170000, max: 200000, currency: 'USD', period: 'yearly' },
    appliedDate: '2026-08-16T12:00:00.000Z',
    notes: 'Bookmarked for tailored resume application next week.',
    stageHistory: [
      { stage: 'Wishlist', timestamp: '2026-08-16T12:00:00.000Z' },
    ],
    createdAt: '2026-08-16T12:00:00.000Z',
    updatedAt: '2026-08-16T12:00:00.000Z',
  },
];

function getLocalApplications(): ApplicationData[] {
  const data = localStorage.getItem('jobtracker_demo_apps');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('jobtracker_demo_apps', JSON.stringify(INITIAL_DEMO_APPLICATIONS));
  return INITIAL_DEMO_APPLICATIONS;
}

function saveLocalApplications(apps: ApplicationData[]) {
  localStorage.setItem('jobtracker_demo_apps', JSON.stringify(apps));
}

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const apps = getLocalApplications();
    const counts = {
      Wishlist: apps.filter((a) => a.stage === 'Wishlist').length,
      Applied: apps.filter((a) => a.stage === 'Applied').length,
      Screening: apps.filter((a) => a.stage === 'Screening').length,
      Interviewing: apps.filter((a) => a.stage === 'Interviewing').length,
      Offer: apps.filter((a) => a.stage === 'Offer').length,
      Archived: apps.filter((a) => a.stage === 'Archived').length,
    };
    const totalActive = counts.Applied + counts.Screening + counts.Interviewing + counts.Offer;

    return {
      totalActive,
      totalAll: apps.length,
      addedThisWeek: 2,
      responseRatePct: 40,
      avgDaysToResponse: 5,
      stageCounts: counts,
    };
  },

  async getDashboardAttention(): Promise<{
    totalAttention: number;
    staleApplications: AttentionItem[];
    upcomingInterviews: AttentionItem[];
  }> {
    try {
      const res = await fetch('/api/dashboard/attention', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const staleApplications: AttentionItem[] = [
      {
        id: 'demo-app-4',
        companyName: 'Google',
        roleTitle: 'Software Engineer III (L4)',
        stage: 'Applied',
        daysStale: 16,
        type: 'stale',
        contact: { name: 'Elena Rostova', role: 'Senior Recruiter', email: 'elena.r@google.com' },
      },
    ];

    const upcomingInterviews: AttentionItem[] = [
      {
        id: 'demo-app-1',
        companyName: 'Stripe',
        roleTitle: 'Senior Full Stack Engineer',
        stage: 'Interviewing',
        type: 'interview_upcoming',
        contact: { name: 'Sarah Jenkins', role: 'Staff Technical Recruiter', email: 'sarah.j@stripe.com' },
      },
    ];

    return {
      totalAttention: staleApplications.length + upcomingInterviews.length,
      staleApplications,
      upcomingInterviews,
    };
  },

  async getDashboardActivity(): Promise<{ activity: ActivityItem[] }> {
    try {
      const res = await fetch('/api/dashboard/activity', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      activity: [
        { id: 'act-1', applicationId: 'demo-app-3', companyName: 'Vercel', roleTitle: 'Frontend Platform Engineer', stage: 'Offer', timestamp: '2026-08-15T18:00:00.000Z' },
        { id: 'act-2', applicationId: 'demo-app-1', companyName: 'Stripe', roleTitle: 'Senior Full Stack Engineer', stage: 'Interviewing', timestamp: '2026-08-14T09:00:00.000Z' },
        { id: 'act-3', applicationId: 'demo-app-2', companyName: 'OpenAI', roleTitle: 'Platform Infrastructure', stage: 'Screening', timestamp: '2026-08-13T16:00:00.000Z' },
      ],
    };
  },

  async getApplications(): Promise<{ applications: ApplicationData[] }> {
    try {
      const res = await fetch('/api/applications', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return { applications: getLocalApplications() };
  },

  async getApplicationById(id: string): Promise<{ application: ApplicationData }> {
    try {
      const res = await fetch(`/api/applications/${id}`, { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const apps = getLocalApplications();
    const app = apps.find((a) => a._id === id) || apps[0];
    return { application: app };
  },

  async createApplication(data: Partial<ApplicationData>): Promise<{ application: ApplicationData }> {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const newApp: ApplicationData = {
      _id: `app-${Date.now()}`,
      userId: 'demo-user-alex-hunter',
      companyName: data.companyName || 'Target Corp',
      roleTitle: data.roleTitle || 'Software Engineer',
      stage: data.stage || 'Wishlist',
      workModel: data.workModel || 'Remote',
      location: data.location || 'San Francisco, CA',
      source: data.source || 'LinkedIn',
      salary: data.salary,
      jobDescriptionRaw: data.jobDescriptionRaw,
      stageHistory: [{ stage: data.stage || 'Wishlist', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const apps = [newApp, ...getLocalApplications()];
    saveLocalApplications(apps);
    return { application: newApp };
  },

  async updateApplicationStage(id: string, stage: string, notes?: string): Promise<{ application: ApplicationData }> {
    try {
      const res = await fetch(`/api/applications/${id}/stage`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, notes }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const apps = getLocalApplications();
    const updated = apps.map((a) =>
      a._id === id
        ? {
            ...a,
            stage: stage as any,
            stageHistory: [...a.stageHistory, { stage, timestamp: new Date().toISOString(), notes }],
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    saveLocalApplications(updated);
    const found = updated.find((a) => a._id === id) || updated[0];
    return { application: found };
  },

  async updateApplication(id: string, data: Partial<ApplicationData>): Promise<{ application: ApplicationData }> {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const apps = getLocalApplications();
    const updated = apps.map((a) => (a._id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a));
    saveLocalApplications(updated);
    const found = updated.find((a) => a._id === id) || updated[0];
    return { application: found };
  },

  async deleteApplication(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) return;
    } catch {
      // offline fallback
    }

    const apps = getLocalApplications().filter((a) => a._id !== id);
    saveLocalApplications(apps);
  },

  async getBaseResume(): Promise<{ resume: any }> {
    try {
      const res = await fetch('/api/resumes/base', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      resume: {
        basics: { name: 'Alex Hunter', email: 'alex@example.com', title: 'Senior Full Stack Engineer' },
        sections: {
          experience: [
            {
              company: 'CloudScale Technologies',
              role: 'Senior Software Engineer',
              bullets: [
                'Engineered distributed event-driven microservices handling 50k+ daily active users with Node.js and MongoDB.',
                'Architected modular React micro-frontends reducing initial bundle payload latency by 35%.',
                'Led migration of CI/CD test automation pipelines cutting build times from 15m to 2.5m.',
              ],
            },
          ],
          skills: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'REST APIs', 'System Design'],
        },
      },
    };
  },

  async updateBaseResume(sections: any): Promise<{ resume: any }> {
    try {
      const res = await fetch('/api/resumes/base', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }
    return { resume: { sections } };
  },

  async analyzeJob(applicationId?: string, jobDescriptionText?: string): Promise<{ analysis: any }> {
    try {
      const res = await fetch('/api/ats/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, jobDescriptionText }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      analysis: {
        score: 84,
        matchedKeywords: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'REST APIs', 'CI/CD'],
        missingKeywords: ['System Design', 'Kafka', 'GraphQL', 'Kubernetes'],
        recommendations: [
          'Incorporate concrete metrics demonstrating system throughput scaling.',
          'Add Kafka or messaging queue patterns to experience section.',
        ],
      },
    };
  },

  async rewriteBullet(originalBullet: string, missingKeywords: string[], roleContext?: string): Promise<{ suggestion: any }> {
    try {
      const res = await fetch('/api/ats/rewrite-bullet', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalBullet, missingKeywords, roleContext }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      suggestion: {
        improvedBullet: `Engineered high-throughput event streaming microservices incorporating ${missingKeywords[0] || 'System Design'}, scaling throughput to 50k+ daily users while cutting API latency by 35%.`,
        explanation: `Added missing keyword '${missingKeywords[0] || 'System Design'}' with quantified business outcomes.`,
      },
    };
  },

  async generateInterviewQuestions(payload: {
    applicationId?: string;
    companyName?: string;
    roleTitle?: string;
    jobDescription?: string;
  }): Promise<{ companyName: string; roleTitle: string; questions: any[] }> {
    try {
      const res = await fetch('/api/interview-prep/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      companyName: payload.companyName || 'Stripe',
      roleTitle: payload.roleTitle || 'Senior Full Stack Engineer',
      questions: [
        {
          id: 'q-1',
          type: 'technical',
          question: 'How would you architect a fault-tolerant idempotency key system for distributed payment transactions?',
          expectedFocus: 'Mention unique idempotency tokens, Redis distributed locks, and atomic DB transactions.',
        },
        {
          id: 'q-2',
          type: 'behavioral',
          question: 'Describe a time you navigated a high-stakes production outage under pressure.',
          expectedFocus: 'Use STAR format: isolate root cause, communicate with stakeholders, and implement preventative alerts.',
        },
      ],
    };
  },

  async reviewStarAnswer(question: string, star: { situation: string; task?: string; action: string; result?: string }): Promise<{ critique: any }> {
    try {
      const res = await fetch('/api/interview-prep/review-star', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, star }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      critique: {
        score: 92,
        strengths: ['Clear situation framing', 'Strong quantifiable results demonstrating 35% performance gain'],
        suggestions: ['Elaborate slightly on cross-functional alignment during the task phase.'],
      },
    };
  },

  async getAnswerBank(): Promise<{ answerBank: any[] }> {
    try {
      const res = await fetch('/api/interview-prep', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      answerBank: [
        {
          id: 'bank-1',
          question: 'Tell me about a complex architectural decision you led.',
          star: {
            situation: 'Our monolithic backend was bottlenecking at 50,000 concurrent websocket connections.',
            task: 'Migrate to decoupled event-driven services with Node.js and MongoDB sharding.',
            action: 'Implemented partitioned MongoDB cluster and redis pub/sub event bus.',
            result: 'Reduced P99 latency by 45% and scaled to 250k daily active users with zero downtime.',
          },
          savedAt: '2026-08-12T14:00:00.000Z',
        },
      ],
    };
  },

  async saveAnswer(data: any): Promise<{ entry: any }> {
    try {
      const res = await fetch('/api/interview-prep/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }
    return { entry: { id: `entry-${Date.now()}`, ...data, savedAt: new Date().toISOString() } };
  },

  async deleteAnswer(id: string): Promise<void> {
    try {
      await fetch(`/api/interview-prep/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch {
      // offline fallback
    }
  },

  async getActionCenterItems(): Promise<{
    totalActionNeeded: number;
    staleApplications: AttentionItem[];
    upcomingInterviews: AttentionItem[];
  }> {
    try {
      const res = await fetch('/api/action-center/items', { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      totalActionNeeded: 2,
      staleApplications: [
        {
          id: 'demo-app-4',
          companyName: 'Google',
          roleTitle: 'Software Engineer III (L4)',
          stage: 'Applied',
          daysStale: 16,
          type: 'stale',
          contact: { name: 'Elena Rostova', role: 'Senior Recruiter', email: 'elena.r@google.com' },
        },
      ],
      upcomingInterviews: [
        {
          id: 'demo-app-1',
          companyName: 'Stripe',
          roleTitle: 'Senior Full Stack Engineer',
          stage: 'Interviewing',
          type: 'interview_upcoming',
          contact: { name: 'Sarah Jenkins', role: 'Staff Technical Recruiter', email: 'sarah.j@stripe.com' },
        },
      ],
    };
  },

  async draftFollowupEmail(applicationId: string, customNotes?: string): Promise<{ companyName: string; roleTitle: string; contact?: any; draft: { subject: string; body: string } }> {
    try {
      const res = await fetch('/api/action-center/draft-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, customNotes }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    return {
      companyName: 'Google',
      roleTitle: 'Software Engineer III (L4)',
      contact: { name: 'Elena Rostova', email: 'elena.r@google.com' },
      draft: {
        subject: 'Following up on Software Engineer III application — Alex Hunter',
        body: `Hi Elena,\n\nI hope you are having a productive week.\n\nI am following up on my application for the Software Engineer III role at Google. I remain very enthusiastic about contributing to Google's engineering organization and would love to connect regarding next steps.\n\nBest regards,\nAlex Hunter`,
      },
    };
  },

  async markFollowedUp(applicationId: string, notes?: string): Promise<{ application: ApplicationData }> {
    try {
      const res = await fetch('/api/action-center/mark-followed-up', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, notes }),
      });
      if (res.ok) return res.json();
    } catch {
      // offline fallback
    }

    const apps = getLocalApplications();
    const updated = apps.map((a) => (a._id === applicationId ? { ...a, updatedAt: new Date().toISOString() } : a));
    saveLocalApplications(updated);
    const found = updated.find((a) => a._id === applicationId) || updated[0];
    return { application: found };
  },
};
