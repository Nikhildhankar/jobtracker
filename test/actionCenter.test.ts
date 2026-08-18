import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server/app';
import { connectDB } from '../server/db/connect';
import { User } from '../server/models/User';
import { Session } from '../server/models/Session';
import { Application } from '../server/models/Application';
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
    // fallback to MongoMemoryServer
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

async function runActionCenterTests() {
  console.log('🧪 Starting Phase 8 Action Center & AI Email Drafter Tests...\n');

  await setupTestDB();

  // Clean test accounts
  await User.deleteMany({ email: { $in: ['action_user_a@example.com', 'action_user_b@example.com'] } });
  await Session.deleteMany({});
  await Application.deleteMany({});

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  baseUrl = `http://localhost:${port}`;

  try {
    // 1. Setup User A & User B
    const userA = await User.create({
      email: 'action_user_a@example.com',
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
      email: 'action_user_b@example.com',
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

    // 2. Create Stale Application for User A (10 days ago)
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const staleApp = await Application.create({
      userId: userA._id,
      companyName: 'Acme AI',
      roleTitle: 'Senior Systems Engineer',
      stage: 'Applied',
      appliedDate: tenDaysAgo,
      createdAt: tenDaysAgo,
      updatedAt: tenDaysAgo,
      contact: {
        name: 'Sarah Lin',
        email: 'sarah.lin@acmeai.com',
        role: 'Recruiter',
      },
      stageHistory: [{ stage: 'Applied', timestamp: tenDaysAgo }],
    });

    // Test 1: Fetch Action Items (GET /api/action-center/items)
    console.log('Test 1: Fetching GET /api/action-center/items for User A...');
    const itemsRes = await makeRequest('/api/action-center/items', { cookie: cookieA });

    if (itemsRes.status !== 200 || !itemsRes.data.staleApplications) {
      throw new Error(`Get action items failed: ${JSON.stringify(itemsRes.data)}`);
    }

    const stales = itemsRes.data.staleApplications;
    if (stales.length !== 1 || stales[0].companyName !== 'Acme AI') {
      throw new Error(`❌ Stale detection error: Expected 1 stale app (Acme AI), got ${JSON.stringify(stales)}`);
    }
    console.log(`✅ Stale application correctly identified: ${stales[0].companyName} (${stales[0].daysStale} days stale).`);

    // Test 2: Draft Follow-up Email (POST /api/action-center/draft-email)
    console.log('\nTest 2: Drafting Follow-up Email via Gemini (POST /api/action-center/draft-email)...');
    const draftRes = await makeRequest('/api/action-center/draft-email', {
      method: 'POST',
      cookie: cookieA,
      body: {
        applicationId: staleApp._id.toString(),
        customNotes: 'Mentioned our mutual contact Alex.',
      },
    });

    if (draftRes.status !== 200 || !draftRes.data.draft?.subject || !draftRes.data.draft?.body) {
      throw new Error(`Draft follow-up email failed: ${JSON.stringify(draftRes.data)}`);
    }
    console.log(`✅ Follow-up email generated: Subject: "${draftRes.data.draft.subject}"`);

    // Test 3: Mark Followed Up (POST /api/action-center/mark-followed-up)
    console.log('\nTest 3: Marking Followed Up (POST /api/action-center/mark-followed-up)...');
    const markRes = await makeRequest('/api/action-center/mark-followed-up', {
      method: 'POST',
      cookie: cookieA,
      body: {
        applicationId: staleApp._id.toString(),
        notes: 'Sent follow-up email via Action Center',
      },
    });

    if (markRes.status !== 200 || markRes.data.application?.stageHistory?.length !== 2) {
      throw new Error(`Mark followed up failed: ${JSON.stringify(markRes.data)}`);
    }
    console.log('✅ Marked followed up: stageHistory appended and updatedAt refreshed.');

    // Test 4: Verify Stale Status Cleared
    console.log('\nTest 4: Verifying Stale Status Cleared after update...');
    const recheckRes = await makeRequest('/api/action-center/items', { cookie: cookieA });
    if (recheckRes.data.staleApplications.length !== 0) {
      throw new Error('❌ Stale status was not cleared after markFollowedUp!');
    }
    console.log('✅ Stale status cleared successfully (0 stale items remaining).');

    // Test 5: Multi-Tenant Isolation for User B
    console.log('\nTest 5: Multi-Tenant Isolation Check for User B...');
    const bankBRes = await makeRequest('/api/action-center/items', { cookie: cookieB });
    if (bankBRes.data.totalActionNeeded !== 0) {
      throw new Error('❌ Multi-tenancy leak: User B received User A\'s action items!');
    }
    console.log('✅ Multi-tenant isolation verified: User B sees 0 action items.');

    console.log('\n🎉 ALL PHASE 8 ACTION CENTER & AI EMAIL DRAFTER TESTS PASSED!\n');
  } finally {
    await teardownTestDB();
  }
}

runActionCenterTests()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('\n❌ Action Center Test Suite Failed:', err);
    await teardownTestDB();
    process.exit(1);
  });
