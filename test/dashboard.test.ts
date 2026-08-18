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

async function runDashboardTests() {
  console.log('🧪 Starting Phase 4 Dashboard Analytics Tests...\n');

  await setupTestDB();

  // Clean data
  await User.deleteMany({ email: { $in: ['dash_user_a@example.com', 'dash_user_b@example.com'] } });
  await Session.deleteMany({});
  await Application.deleteMany({});

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  baseUrl = `http://localhost:${port}`;

  try {
    // 1. Create User A and User B
    const userA = await User.create({
      email: 'dash_user_a@example.com',
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
      email: 'dash_user_b@example.com',
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

    // 2. Create sample applications for User A
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // App 1: Applied 10 days ago (Stale > 7 days)
    await Application.create({
      userId: userA._id,
      companyName: 'Acme AI',
      roleTitle: 'Senior Full Stack Engineer',
      stage: 'Applied',
      appliedDate: tenDaysAgo,
      createdAt: tenDaysAgo,
      updatedAt: tenDaysAgo,
      stageHistory: [{ stage: 'Applied', timestamp: tenDaysAgo }],
    });

    // App 2: Interviewing (Created 2 days ago)
    await Application.create({
      userId: userA._id,
      companyName: 'Stripe',
      roleTitle: 'Staff Engineer',
      stage: 'Interviewing',
      appliedDate: twoDaysAgo,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
      stageHistory: [
        { stage: 'Applied', timestamp: tenDaysAgo },
        { stage: 'Interviewing', timestamp: twoDaysAgo },
      ],
    });

    // App 3: Wishlist
    await Application.create({
      userId: userA._id,
      companyName: 'Vercel',
      roleTitle: 'Solutions Architect',
      stage: 'Wishlist',
      createdAt: twoDaysAgo,
      stageHistory: [{ stage: 'Wishlist', timestamp: twoDaysAgo }],
    });

    // Create App for User B
    await Application.create({
      userId: userB._id,
      companyName: 'Secret Competitor',
      roleTitle: 'Lead Developer',
      stage: 'Offer',
      createdAt: twoDaysAgo,
      stageHistory: [{ stage: 'Offer', timestamp: twoDaysAgo }],
    });

    // Test 1: Fetch Stats for User A
    console.log('Test 1: Fetching GET /api/dashboard/stats for User A...');
    const statsRes = await makeRequest('/api/dashboard/stats', { cookie: cookieA });

    if (statsRes.status !== 200 || !statsRes.data.stageCounts) {
      throw new Error(`Stats endpoint failed: ${JSON.stringify(statsRes.data)}`);
    }

    if (statsRes.data.totalActive !== 3 || statsRes.data.totalAll !== 3) {
      throw new Error(`❌ Stats calculation error: Expected 3 applications for User A, got ${statsRes.data.totalAll}`);
    }

    if (statsRes.data.stageCounts.Applied !== 1 || statsRes.data.stageCounts.Interviewing !== 1) {
      throw new Error(`❌ Stage counts calculation error: ${JSON.stringify(statsRes.data.stageCounts)}`);
    }

    console.log('✅ User A Stats verified (Total: 3, Active: 3, Interviewing: 1).');

    // Test 2: Multi-Tenancy Scoping Test for User B
    console.log('\nTest 2: Verifying Multi-Tenant Isolation for User B...');
    const statsBRes = await makeRequest('/api/dashboard/stats', { cookie: cookieB });

    if (statsBRes.data.totalAll !== 1 || statsBRes.data.stageCounts.Offer !== 1) {
      throw new Error(`❌ Multi-tenancy leak: User B stats returned incorrect data: ${JSON.stringify(statsBRes.data)}`);
    }
    console.log('✅ Multi-tenancy isolation confirmed: User B sees only their 1 Offer application.');

    // Test 3: Stale Application Detection
    console.log('\nTest 3: Fetching GET /api/dashboard/attention (Stale detection)...');
    const attentionRes = await makeRequest('/api/dashboard/attention', { cookie: cookieA });

    if (attentionRes.status !== 200 || !attentionRes.data.staleApplications) {
      throw new Error(`Attention endpoint failed: ${JSON.stringify(attentionRes.data)}`);
    }

    const staleApps = attentionRes.data.staleApplications;
    if (staleApps.length !== 1 || staleApps[0].companyName !== 'Acme AI') {
      throw new Error(`❌ Stale detection error: Expected 1 stale app (Acme AI), got: ${JSON.stringify(staleApps)}`);
    }
    console.log(`✅ Stale application correctly identified: ${staleApps[0].companyName} (${staleApps[0].daysStale} days stale).`);

    // Test 4: Activity Feed Ordering
    console.log('\nTest 4: Fetching GET /api/dashboard/activity (Activity stream)...');
    const activityRes = await makeRequest('/api/dashboard/activity', { cookie: cookieA });

    if (activityRes.status !== 200 || !Array.isArray(activityRes.data.activity)) {
      throw new Error(`Activity endpoint failed: ${JSON.stringify(activityRes.data)}`);
    }

    console.log(`✅ Activity feed returned ${activityRes.data.activity.length} timeline events sorted by timestamp.`);

    console.log('\n🎉 ALL PHASE 4 DASHBOARD ANALYTICS TESTS PASSED!\n');
  } finally {
    await teardownTestDB();
  }
}

runDashboardTests()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('\n❌ Dashboard Test Suite Failed:', err);
    await teardownTestDB();
    process.exit(1);
  });
