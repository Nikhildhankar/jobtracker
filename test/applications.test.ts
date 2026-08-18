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

async function runApplicationTests() {
  console.log('🧪 Starting Phase 5 Application CRUD & Pipeline Tests...\n');

  await setupTestDB();

  // Clean test accounts
  await User.deleteMany({ email: { $in: ['app_user_a@example.com', 'app_user_b@example.com'] } });
  await Session.deleteMany({});
  await Application.deleteMany({});

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  baseUrl = `http://localhost:${port}`;

  try {
    // 1. Setup User A & User B
    const userA = await User.create({
      email: 'app_user_a@example.com',
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
      email: 'app_user_b@example.com',
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

    // Test 1: Create Application for User A
    console.log('Test 1: Creating Application (POST /api/applications)...');
    const createRes = await makeRequest('/api/applications', {
      method: 'POST',
      cookie: cookieA,
      body: {
        companyName: 'Acme AI',
        roleTitle: 'Senior Staff Engineer',
        stage: 'Wishlist',
        workModel: 'Remote',
        location: 'San Francisco, CA',
        salary: { min: 160000, max: 190000, currency: 'USD', period: 'yearly' },
      },
    });

    if (createRes.status !== 201 || !createRes.data.application?._id) {
      throw new Error(`Create application failed: ${JSON.stringify(createRes.data)}`);
    }
    const appId = createRes.data.application._id;
    console.log(`✅ Application created (ID: ${appId}, Stage: ${createRes.data.application.stage})`);

    // Test 2: Stage Transition & Timeline Appending
    console.log('\nTest 2: Stage Transition (PATCH /api/applications/:id/stage)...');
    const stageRes = await makeRequest(`/api/applications/${appId}/stage`, {
      method: 'PATCH',
      cookie: cookieA,
      body: {
        stage: 'Interviewing',
        notes: 'Scheduled 45min System Design round',
      },
    });

    if (stageRes.status !== 200 || stageRes.data.application?.stage !== 'Interviewing') {
      throw new Error(`Stage transition failed: ${JSON.stringify(stageRes.data)}`);
    }
    const history = stageRes.data.application.stageHistory;
    if (history.length !== 2 || history[1].stage !== 'Interviewing') {
      throw new Error(`Stage history appending error: ${JSON.stringify(history)}`);
    }
    console.log(`✅ Stage updated to Interviewing. Timeline history recorded ${history.length} events.`);

    // Test 3: Multi-Tenancy Protection (User B tries to access User A's application)
    console.log('\nTest 3: Multi-Tenant Protection (User B cross-tenant access check)...');
    const unauthorizedGet = await makeRequest(`/api/applications/${appId}`, {
      cookie: cookieB,
    });
    if (unauthorizedGet.status !== 404) {
      throw new Error(`❌ Security flaw: User B was able to fetch User A's application! Status: ${unauthorizedGet.status}`);
    }

    const unauthorizedPatch = await makeRequest(`/api/applications/${appId}/stage`, {
      method: 'PATCH',
      cookie: cookieB,
      body: { stage: 'Offer' },
    });
    if (unauthorizedPatch.status !== 404) {
      throw new Error(`❌ Security flaw: User B was able to update User A's application stage! Status: ${unauthorizedPatch.status}`);
    }
    console.log('✅ Multi-tenancy isolation confirmed: User B cannot access or mutate User A\'s applications.');

    // Test 4: Delete Application
    console.log('\nTest 4: Deleting Application (DELETE /api/applications/:id)...');
    const deleteRes = await makeRequest(`/api/applications/${appId}`, {
      method: 'DELETE',
      cookie: cookieA,
    });
    if (deleteRes.status !== 200) {
      throw new Error(`Delete application failed: ${JSON.stringify(deleteRes.data)}`);
    }

    const getDeleted = await makeRequest(`/api/applications/${appId}`, {
      cookie: cookieA,
    });
    if (getDeleted.status !== 404) {
      throw new Error('Deleted application still exists');
    }
    console.log('✅ Application deleted successfully.');

    console.log('\n🎉 ALL PHASE 5 APPLICATION CRUD & PIPELINE TESTS PASSED!\n');
  } finally {
    await teardownTestDB();
  }
}

runApplicationTests().catch(async (err) => {
  console.error('\n❌ Application Test Suite Failed:', err);
  await teardownTestDB();
  process.exit(1);
});
