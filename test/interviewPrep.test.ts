import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server/app';
import { connectDB } from '../server/db/connect';
import { User } from '../server/models/User';
import { Session } from '../server/models/Session';
import { InterviewPrep } from '../server/models/InterviewPrep';
import { generateOpaqueToken } from '../server/utils/crypto';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from '../server/middleware/auth';

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

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    console.error('MongoMemoryServer setup error:', err);
  }
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

async function runInterviewPrepTests() {
  console.log('🧪 Starting Phase 7 AI Interview Prep & Answer Bank Tests...\n');

  await setupTestDB();

  // Clean test accounts
  await User.deleteMany({ email: { $in: ['prep_user_a@example.com', 'prep_user_b@example.com'] } });
  await Session.deleteMany({});
  await InterviewPrep.deleteMany({});

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  baseUrl = `http://localhost:${port}`;

  try {
    // 1. Setup User A & User B
    const userA = await User.create({
      email: 'prep_user_a@example.com',
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
      email: 'prep_user_b@example.com',
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

    // Test 1: Generate Interview Questions (POST /api/interview-prep/generate)
    console.log('Test 1: Generating Interview Questions (POST /api/interview-prep/generate)...');
    const genRes = await makeRequest('/api/interview-prep/generate', {
      method: 'POST',
      cookie: cookieA,
      body: {
        companyName: 'Stripe',
        roleTitle: 'Staff Backend Engineer',
      },
    });

    if (genRes.status !== 200 || !Array.isArray(genRes.data.questions)) {
      throw new Error(`Generate questions failed: ${JSON.stringify(genRes.data)}`);
    }
    console.log(`✅ Generated ${genRes.data.questions.length} questions for Stripe Staff Backend Engineer.`);

    // Test 2: Review STAR Answer (POST /api/interview-prep/review-star)
    console.log('\nTest 2: Reviewing STAR Answer (POST /api/interview-prep/review-star)...');
    const reviewRes = await makeRequest('/api/interview-prep/review-star', {
      method: 'POST',
      cookie: cookieA,
      body: {
        question: 'Tell me about a time you resolved a major system latency issue under pressure.',
        star: {
          situation: 'Our checkout API experienced 500ms latency spikes during Black Friday traffic.',
          task: 'I was tasked with diagnosing the bottleneck and restoring response times.',
          action: 'Implemented Redis caching, added compound MongoDB indexes, and refactored async loop.',
          result: 'Reduced API response latency by 65% (down to 140ms) and maintained 99.99% uptime.',
        },
      },
    });

    if (reviewRes.status !== 200 || !reviewRes.data.critique?.polishedDraft) {
      throw new Error(`Review STAR answer failed: ${JSON.stringify(reviewRes.data)}`);
    }
    console.log('✅ STAR critique generated with metric check and polished draft.');

    // Test 3: Save Answer to Bank (POST /api/interview-prep/save)
    console.log('\nTest 3: Saving Answer to Answer Bank (POST /api/interview-prep/save)...');
    const saveRes = await makeRequest('/api/interview-prep/save', {
      method: 'POST',
      cookie: cookieA,
      body: {
        question: 'Tell me about a time you resolved a major system latency issue under pressure.',
        category: 'Behavioral',
        companyName: 'Stripe',
        starAnswer: {
          situation: 'Our checkout API experienced 500ms latency spikes.',
          action: 'Implemented Redis caching and compound indexes.',
          result: 'Reduced latency by 65%.',
        },
        polishedDraft: reviewRes.data.critique.polishedDraft,
      },
    });

    if (saveRes.status !== 200 || !saveRes.data.entry?._id) {
      throw new Error(`Save answer failed: ${JSON.stringify(saveRes.data)}`);
    }
    const entryId = saveRes.data.entry._id;
    console.log(`✅ Answer saved to Answer Bank (ID: ${entryId}).`);

    // Test 4: Multi-Tenant Answer Bank Isolation
    console.log('\nTest 4: Multi-Tenant Isolation Check for User B...');
    const bankBRes = await makeRequest('/api/interview-prep', { cookie: cookieB });
    if (bankBRes.data.answerBank.length !== 0) {
      throw new Error('❌ Multi-tenancy leak: User B received User A\'s saved answer bank entries!');
    }
    console.log('✅ Multi-tenant isolation verified: User B sees 0 entries.');

    // Test 5: Delete Answer from Bank
    console.log('\nTest 5: Deleting Answer from Bank (DELETE /api/interview-prep/:id)...');
    const deleteRes = await makeRequest(`/api/interview-prep/${entryId}`, {
      method: 'DELETE',
      cookie: cookieA,
    });
    if (deleteRes.status !== 200) {
      throw new Error(`Delete answer failed: ${JSON.stringify(deleteRes.data)}`);
    }
    console.log('✅ Answer deleted successfully.');

    console.log('\n🎉 ALL PHASE 7 AI INTERVIEW PREP & ANSWER BANK TESTS PASSED!\n');
  } finally {
    await teardownTestDB();
  }
}

runInterviewPrepTests()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('\n❌ Interview Prep Test Suite Failed:', err);
    await teardownTestDB();
    process.exit(1);
  });
