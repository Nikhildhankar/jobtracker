import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server/app';
import { connectDB } from '../server/db/connect';
import { User } from '../server/models/User';
import { Session } from '../server/models/Session';

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
    // fallback to memory server
  }

  console.log('📦 Starting in-memory MongoDB for test execution...');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('✅ In-memory MongoDB connected successfully.');
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
): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: any; cookies: string[] }> {
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
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch {
            // raw string
          }
          const cookies = (res.headers['set-cookie'] as string[]) || [];
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            data,
            cookies,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function extractSessionCookie(cookies: string[]): string {
  for (const c of cookies) {
    if (c.startsWith('jobtracker_session=')) {
      return c.split(';')[0];
    }
  }
  return '';
}

async function runAuthTests() {
  console.log('🧪 Starting Phase 2 Custom Session Auth & Multi-Tenancy Tests...\n');

  await setupTestDB();

  // Clean test accounts before starting
  await User.deleteMany({ email: { $in: ['alex@example.com', 'maria@example.com'] } });
  await Session.deleteMany({});

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  baseUrl = `http://localhost:${port}`;

  try {
    // Test 1: Signup User A (Alex)
    console.log('Test 1: User Registration (Signup)...');
    const signupRes = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'alex@example.com',
        password: 'Password123!',
        name: 'Alex Hunter',
      },
    });

    if (signupRes.status !== 201 || !signupRes.data.user?.id) {
      throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
    }
    const userAId = signupRes.data.user.id;
    const verificationToken = signupRes.data.debugVerificationToken;
    const cookieA = extractSessionCookie(signupRes.cookies);

    console.log(`✅ User A created (ID: ${userAId}, isVerified: ${signupRes.data.user.isVerified})`);
    console.log(`✅ Session cookie received: ${cookieA}`);

    // Test 2: Email Verification
    console.log('\nTest 2: Email Verification...');
    const verifyRes = await makeRequest(`/api/auth/verify-email?token=${verificationToken}`, {
      method: 'GET',
    });

    if (verifyRes.status !== 200 || !verifyRes.data.isVerified) {
      throw new Error(`Email verification failed: ${JSON.stringify(verifyRes.data)}`);
    }
    console.log('✅ User A successfully verified.');

    // Test 3: Authenticated /me endpoint
    console.log('\nTest 3: Fetching Authenticated Profile (/api/auth/me)...');
    const meRes = await makeRequest('/api/auth/me', {
      method: 'GET',
      cookie: cookieA,
    });

    if (meRes.status !== 200 || meRes.data.user?.email !== 'alex@example.com' || !meRes.data.user?.isVerified) {
      throw new Error(`Authenticated /me failed: ${JSON.stringify(meRes.data)}`);
    }
    console.log(`✅ Verified /me returns correct authenticated user: ${meRes.data.user.name} (${meRes.data.user.email})`);

    // Test 4: Multi-Tenancy Isolation — Create User B (Maria)
    console.log('\nTest 4: Multi-Tenant Scoping (User B creation & isolation)...');
    const signupBRes = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'maria@example.com',
        password: 'Password456!',
        name: 'Maria Developer',
      },
    });
    const userBId = signupBRes.data.user.id;
    const cookieB = extractSessionCookie(signupBRes.cookies);

    if (userAId === userBId) {
      throw new Error('❌ Multi-tenancy leak: User A and User B share the same ID!');
    }

    const meBRes = await makeRequest('/api/auth/me', {
      method: 'GET',
      cookie: cookieB,
    });
    if (meBRes.data.user?.id !== userBId || meBRes.data.user?.email !== 'maria@example.com') {
      throw new Error('❌ Multi-tenancy leak: User B session returned incorrect user data!');
    }
    console.log(`✅ Multi-tenancy confirmed: User A (${userAId}) and User B (${userBId}) have isolated sessions.`);

    // Test 5: Logout Flow
    console.log('\nTest 5: Logout & Session Revocation...');
    const logoutRes = await makeRequest('/api/auth/logout', {
      method: 'POST',
      cookie: cookieA,
    });
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed: ${JSON.stringify(logoutRes.data)}`);
    }

    // Try accessing /me with revoked session
    const revokedRes = await makeRequest('/api/auth/me', {
      method: 'GET',
      cookie: cookieA,
    });
    if (revokedRes.status !== 401) {
      throw new Error(`❌ Security flaw: Revoked session was still able to access /me (Status: ${revokedRes.status})`);
    }
    console.log('✅ Logout verified: Session revoked server-side and subsequent /me returns 401 Unauthorized.');

    // Test 6: Password Reset Flow
    console.log('\nTest 6: Forgot & Reset Password Flow...');
    const forgotRes = await makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'maria@example.com' },
    });
    const resetToken = forgotRes.data.debugResetToken;
    if (!resetToken) {
      throw new Error('Reset token was not generated');
    }

    const resetRes = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: resetToken,
        password: 'NewBrandPassword789!',
      },
    });
    if (resetRes.status !== 200) {
      throw new Error(`Reset password failed: ${JSON.stringify(resetRes.data)}`);
    }

    // Login with new password
    const newLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'maria@example.com',
        password: 'NewBrandPassword789!',
      },
    });
    if (newLoginRes.status !== 200) {
      throw new Error(`Login with new password failed: ${JSON.stringify(newLoginRes.data)}`);
    }
    console.log('✅ Password reset verified and login successful with updated credentials.');

    console.log('\n🎉 ALL PHASE 2 AUTH & MULTI-TENANCY TESTS PASSED!\n');
  } finally {
    await teardownTestDB();
  }
}

runAuthTests()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('\n❌ Auth Test Suite Failed:', err);
    await teardownTestDB();
    process.exit(1);
  });
