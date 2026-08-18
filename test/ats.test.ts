import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server/app';
import { connectDB } from '../server/db/connect';
import { User } from '../server/models/User';
import { Session } from '../server/models/Session';
import { Resume } from '../server/models/Resume';
import { generateOpaqueToken } from '../server/utils/crypto';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from '../server/middleware/auth';
import { evaluateAtsScore } from '../server/utils/atsScorer';

let server: http.Server;
let baseUrl: string;
let mongod: MongoMemoryServer | null = null;

async function setupTestDB() {
  try {
    const conn = await connectDB();
    if (conn.connection.readyState === 1) {
      return;
    }
  } catch {
    // fallback
  }

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

async function teardownTestDB() {
  if (server) {
    server.close();
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
}

function makeRequest(
  path: string,
  options: {
    method?: string;
    body?: any;
    cookie?: string;
  } = {}
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const postData = options.body ? JSON.stringify(options.body) : '';

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
          ...(options.cookie && { Cookie: options.cookie }),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch {
            // raw string
          }
          resolve({ status: res.statusCode || 500, data });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAtsTests() {
  console.log('🧪 Starting Phase 6 ATS Resume Builder & Gemini AI Tests...\n');

  await setupTestDB();

  // Clean test accounts
  await User.deleteMany({ email: { $in: ['ats_user_a@example.com', 'ats_user_b@example.com'] } });
  await Session.deleteMany({});
  await Resume.deleteMany({});

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  baseUrl = `http://localhost:${port}`;

  try {
    // 1. Setup User A & User B
    const userA = await User.create({
      email: 'ats_user_a@example.com',
      passwordHash: 'hash',
      isVerified: true,
    });
    const sessionAId = generateOpaqueToken();
    await Session.create({
      _id: sessionAId,
      userId: userA._id,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    });
    const cookieA = `${SESSION_COOKIE_NAME}=${sessionAId}`;

    const userB = await User.create({
      email: 'ats_user_b@example.com',
      passwordHash: 'hash',
      isVerified: true,
    });
    const sessionBId = generateOpaqueToken();
    await Session.create({
      _id: sessionBId,
      userId: userB._id,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    });
    const cookieB = `${SESSION_COOKIE_NAME}=${sessionBId}`;

    // Test 1: Fetch Base Resume for User A (Auto-initialization)
    console.log('Test 1: Fetching GET /api/resumes/base for User A...');
    const baseRes = await makeRequest('/api/resumes/base', { cookie: cookieA });

    if (baseRes.status !== 200 || !baseRes.data.resume?.sections) {
      throw new Error(`Get base resume failed: ${JSON.stringify(baseRes.data)}`);
    }
    console.log('✅ Base resume auto-initialized with standard section hierarchy.');

    // Test 2: Rules-Based ATS Evaluator Unit Test
    console.log('\nTest 2: Rules-Based ATS Scorer Unit Test (evaluateAtsScore)...');
    const sections = baseRes.data.resume.sections;
    const scoreResult = evaluateAtsScore(sections, 8, 10);

    if (scoreResult.score < 0 || scoreResult.score > 100 || scoreResult.checks.length < 5) {
      throw new Error(`ATS Scorer calculation invalid: ${JSON.stringify(scoreResult)}`);
    }
    console.log(`✅ ATS Scorer unit test passed: Score=${scoreResult.score}/100, Checks Passed=${scoreResult.checks.filter(c => c.passed).length}/5.`);

    // Test 3: ATS Job Analysis API (POST /api/ats/analyze)
    console.log('\nTest 3: ATS Job Analysis (POST /api/ats/analyze)...');
    const sampleJd = `
      We are looking for a Senior Staff Software Engineer skilled in TypeScript, React, Node.js, GraphQL, Redis, and Kubernetes.
      Responsibilities: Build scalable high-throughput microservices, optimize database indexes, and lead cross-functional architecture.
    `;
    const analyzeRes = await makeRequest('/api/ats/analyze', {
      method: 'POST',
      cookie: cookieA,
      body: { jobDescriptionText: sampleJd },
    });

    if (analyzeRes.status !== 200 || !analyzeRes.data.analysis) {
      throw new Error(`ATS Job Analysis failed: ${JSON.stringify(analyzeRes.data)}`);
    }
    const analysis = analyzeRes.data.analysis;
    if (!analysis.missingKeywords || !analysis.atsScore) {
      throw new Error(`Analysis payload missing required fields: ${JSON.stringify(analysis)}`);
    }
    console.log(`✅ Job analysis successful: Identified ${analysis.missingKeywords.length} missing keywords, ATS score = ${analysis.atsScore}.`);

    // Test 4: AI Bullet Rewriter API (POST /api/ats/rewrite-bullet)
    console.log('\nTest 4: AI Bullet Rewriter (POST /api/ats/rewrite-bullet)...');
    const rewriteRes = await makeRequest('/api/ats/rewrite-bullet', {
      method: 'POST',
      cookie: cookieA,
      body: {
        originalBullet: 'Engineered high-throughput REST APIs handling 50k daily active users with Node.js and MongoDB.',
        missingKeywords: ['Redis', 'GraphQL'],
      },
    });

    if (rewriteRes.status !== 200 || !rewriteRes.data.suggestion?.suggestedBullet) {
      throw new Error(`Bullet rewriter failed: ${JSON.stringify(rewriteRes.data)}`);
    }
    console.log(`✅ Bullet rewriter successful: Suggested bullet: "${rewriteRes.data.suggestion.suggestedBullet}"`);

    // Test 5: Multi-Tenant Base Resume Isolation
    console.log('\nTest 5: Multi-Tenant Base Resume Isolation for User B...');
    const userBResume = await makeRequest('/api/resumes/base', { cookie: cookieB });
    if (userBResume.data.resume.userId === userA._id.toString()) {
      throw new Error('❌ Multi-tenancy leak: User B received User A\'s base resume!');
    }
    console.log('✅ Multi-tenant security verified: User B receives their own isolated base resume.');

    console.log('\n🎉 ALL PHASE 6 ATS RESUME BUILDER & GEMINI TESTS PASSED!\n');
  } finally {
    await teardownTestDB();
  }
}

runAtsTests().catch(async (err) => {
  console.error('\n❌ ATS Test Suite Failed:', err);
  await teardownTestDB();
  process.exit(1);
});
