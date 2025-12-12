/**
 * Integration Tests for Label Agreement System
 * 
 * These tests verify the complete end-to-end workflows of the agreement system:
 * - User flow: generate → download → submit → view status
 * - Admin flow: view requests → update status → verify audit log
 * - Authorization: user cannot access other users' PDFs
 * - Edge cases: empty state, missing profile data, concurrent submissions
 */

// Prevent server from starting during tests
process.env.VERCEL = '1';

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { db } from '../db';
import { supabase } from '../supabase';

// Test configuration
const TEST_USER_EMAIL = 'test-user-integration@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!';
const TEST_ADMIN_EMAIL = 'test-admin-integration@example.com';
const TEST_ADMIN_PASSWORD = 'AdminPassword123!';
const TEST_USER2_EMAIL = 'test-user2-integration@example.com';
const TEST_USER2_PASSWORD = 'TestPassword456!';

// Test state
let testUserToken: string;
let testUserId: string;
let testAdminToken: string;
let testAdminId: string;
let testUser2Token: string;
let testUser2Id: string;

// Helper to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to create test user in Supabase Auth and database
async function createTestUser(email: string, password: string, role: 'ARTIST' | 'ADMIN' = 'ARTIST'): Promise<{ userId: string; token: string }> {
  try {
    // Try to sign in first (user might already exist)
    let userId: string;
    let token: string;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData && signInData.session) {
      // User exists, use existing credentials
      userId = signInData.user.id;
      token = signInData.session.access_token;
    } else {
      // User doesn't exist, create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError && authError.message !== 'User already registered') {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      userId = authData.user.id;

      // Sign in to get token
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (newSignInError || !newSignInData.session) {
        throw newSignInError || new Error('No session returned');
      }

      token = newSignInData.session.access_token;
    }

    // Create or update user in database with complete profile data
    await db.user.upsert({
      where: { id: userId },
      update: {
        email,
        name: email.split('@')[0],
        role,
        legalName: `Legal ${email.split('@')[0]}`,
        mobile: '+1234567890',
        address: '123 Test Street, Test City, TS 12345',
        entityName: `${email.split('@')[0]} Entity`,
      },
      create: {
        id: userId,
        email,
        name: email.split('@')[0],
        role,
        password: 'hashed', // Not used with Supabase Auth
        legalName: `Legal ${email.split('@')[0]}`,
        mobile: '+1234567890',
        address: '123 Test Street, Test City, TS 12345',
        entityName: `${email.split('@')[0]} Entity`,
      },
    });

    return {
      userId,
      token,
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Helper to cleanup test data
async function cleanupTestData() {
  try {
    // Get all test agreement requests for each user
    const testAgreements = [];
    
    for (const userId of [testUserId, testAdminId, testUser2Id]) {
      const agreements = await db.agreementRequest.findMany({
        where: { userId },
      });
      testAgreements.push(...agreements);
    }

    // Delete PDFs from storage
    for (const agreement of testAgreements) {
      try {
        await supabase.storage.from('agreements').remove([agreement.pdfPath]);
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }

    // Delete audit logs (must be done before deleting agreement requests due to foreign key)
    if (testAgreements.length > 0) {
      await db.agreementAuditLog.deleteMany({
        where: {
          agreementRequestId: {
            in: testAgreements.map(a => a.id),
          },
        },
      });
    }

    // Delete agreement requests for each user
    for (const userId of [testUserId, testAdminId, testUser2Id]) {
      await db.agreementRequest.deleteMany({
        where: { userId },
      });
    }

    // Delete test users from database
    for (const email of [TEST_USER_EMAIL, TEST_ADMIN_EMAIL, TEST_USER2_EMAIL]) {
      await db.user.deleteMany({
        where: { email },
      });
    }

    // Delete test users from Supabase Auth
    // Note: This requires admin privileges, so we'll skip it in tests
    // In production, you'd use the Supabase admin API
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

// Setup: Create test users and ensure bucket exists
beforeAll(async () => {
  try {
    // Ensure agreements bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'agreements');

    if (!bucketExists) {
      await supabase.storage.createBucket('agreements', {
        public: false,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['application/pdf'],
      });
    }

    // Create test users
    const user = await createTestUser(TEST_USER_EMAIL, TEST_USER_PASSWORD, 'ARTIST');
    testUserToken = user.token;
    testUserId = user.userId;

    const admin = await createTestUser(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'ADMIN');
    testAdminToken = admin.token;
    testAdminId = admin.userId;

    const user2 = await createTestUser(TEST_USER2_EMAIL, TEST_USER2_PASSWORD, 'ARTIST');
    testUser2Token = user2.token;
    testUser2Id = user2.userId;

    console.log('Test users created:', { testUserId, testAdminId, testUser2Id });
  } catch (error) {
    console.error('Error in beforeAll:', error);
    throw error;
  }
}, 30000);

// Cleanup after all tests
afterAll(async () => {
  await cleanupTestData();
}, 30000);

// Clean up between tests
beforeEach(async () => {
  // Delete any existing agreement requests for test users
  // Query each user separately to avoid OR clause issues
  const testAgreements = [];
  
  for (const userId of [testUserId, testAdminId, testUser2Id]) {
    const agreements = await db.agreementRequest.findMany({
      where: { userId },
    });
    testAgreements.push(...agreements);
  }

  for (const agreement of testAgreements) {
    try {
      await supabase.storage.from('agreements').remove([agreement.pdfPath]);
    } catch (error) {
      // Ignore errors
    }
  }

  // Delete audit logs
  if (testAgreements.length > 0) {
    await db.agreementAuditLog.deleteMany({
      where: {
        agreementRequestId: {
          in: testAgreements.map(a => a.id),
        },
      },
    });
  }

  // Delete agreement requests for each user
  for (const userId of [testUserId, testAdminId, testUser2Id]) {
    await db.agreementRequest.deleteMany({
      where: { userId },
    });
  }
});

/**
 * Integration Test 1: Complete User Flow
 * Test: generate → download → submit → view status
 */
describe('Integration Test 1: Complete User Flow', () => {
  it('should complete the full user workflow from generation to status check', async () => {
    // Step 1: Generate agreement PDF
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(generateResponse.body).toHaveProperty('pdfUrl');
    expect(generateResponse.body).toHaveProperty('agreementId');
    expect(generateResponse.body.pdfUrl).toContain('agreements');

    const agreementId = generateResponse.body.agreementId;

    // Step 2: Download the PDF
    const downloadResponse = await request(app)
      .get(`/api/agreement/download/${agreementId}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toBe('application/pdf');
    expect(downloadResponse.body).toBeDefined();
    expect(downloadResponse.body.length).toBeGreaterThan(0);

    // Step 3: Submit the agreement (proceed)
    const proceedResponse = await request(app)
      .post('/api/agreement/proceed')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ agreementId })
      .expect(200);

    expect(proceedResponse.body).toHaveProperty('success', true);
    expect(proceedResponse.body).toHaveProperty('requestId');

    // Step 4: View status
    const statusResponse = await request(app)
      .get('/api/agreement/status')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(statusResponse.body).toHaveProperty('status', 'pending');
    expect(statusResponse.body).toHaveProperty('createdAt');
    expect(statusResponse.body).toHaveProperty('updatedAt');
    expect(statusResponse.body).toHaveProperty('pdfUrl');
    expect(statusResponse.body.pdfUrl).toBeTruthy();

    // Verify timestamps are valid dates
    const createdAt = new Date(statusResponse.body.createdAt);
    const updatedAt = new Date(statusResponse.body.updatedAt);
    expect(createdAt.getTime()).not.toBeNaN();
    expect(updatedAt.getTime()).not.toBeNaN();
  }, 60000);
});

/**
 * Integration Test 2: Admin Flow
 * Test: view requests → update status → verify audit log
 */
describe('Integration Test 2: Admin Flow', () => {
  it('should allow admin to view, update status, and create audit logs', async () => {
    // Setup: Create an agreement request as a user
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const agreementId = generateResponse.body.agreementId;

    await request(app)
      .post('/api/agreement/proceed')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ agreementId })
      .expect(200);

    // Step 1: Admin views all requests
    const viewResponse = await request(app)
      .get('/api/agreement/admin/agreements')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .expect(200);

    expect(viewResponse.body).toHaveProperty('requests');
    expect(Array.isArray(viewResponse.body.requests)).toBe(true);
    expect(viewResponse.body.requests.length).toBeGreaterThan(0);

    // Find our test agreement
    const testAgreement = viewResponse.body.requests.find(
      (req: any) => req.id === agreementId
    );
    expect(testAgreement).toBeDefined();
    expect(testAgreement.status).toBe('pending');

    // Step 2: Admin updates status to verified
    const updateResponse = await request(app)
      .post(`/api/agreement/admin/agreement/${agreementId}/status`)
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({ status: 'verified', notes: 'Approved after review' })
      .expect(200);

    expect(updateResponse.body).toHaveProperty('success', true);

    // Step 3: Verify status was updated
    const statusResponse = await request(app)
      .get('/api/agreement/status')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(statusResponse.body.status).toBe('verified');

    // Step 4: Verify audit log was created
    const auditLogs = await db.agreementAuditLog.findMany({
      where: { agreementRequestId: agreementId },
      orderBy: { createdAt: 'desc' },
    });

    expect(auditLogs.length).toBeGreaterThan(0);

    // Find the status change log
    const statusChangeLog = auditLogs.find(log => log.action === 'status_changed');
    expect(statusChangeLog).toBeDefined();
    expect(statusChangeLog!.actorId).toBe(testAdminId);
    expect(statusChangeLog!.actorRole).toBe('admin');
    expect(statusChangeLog!.action).toBe('status_changed');

    const details = statusChangeLog!.details as any;
    expect(details.oldStatus).toBe('pending');
    expect(details.newStatus).toBe('verified');
    expect(details.notes).toBe('Approved after review');
  }, 60000);
});

/**
 * Integration Test 3: Authorization - User Cannot Access Other Users' PDFs
 */
describe('Integration Test 3: Authorization Enforcement', () => {
  it('should prevent users from accessing other users PDFs', async () => {
    // User 1 creates an agreement
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const agreementId = generateResponse.body.agreementId;

    // User 2 tries to download User 1's PDF
    const downloadResponse = await request(app)
      .get(`/api/agreement/download/${agreementId}`)
      .set('Authorization', `Bearer ${testUser2Token}`)
      .expect(403);

    expect(downloadResponse.body).toHaveProperty('error');
    expect(downloadResponse.body.error).toContain('access');
  }, 60000);

  it('should allow admin to access any users PDF', async () => {
    // User creates an agreement
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const agreementId = generateResponse.body.agreementId;

    // Admin downloads the PDF
    const downloadResponse = await request(app)
      .get(`/api/agreement/download/${agreementId}`)
      .set('Authorization', `Bearer ${testAdminToken}`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toBe('application/pdf');
    expect(downloadResponse.body.length).toBeGreaterThan(0);
  }, 60000);

  it('should prevent non-admin users from accessing admin endpoints', async () => {
    // User tries to access admin agreements list
    const viewResponse = await request(app)
      .get('/api/agreement/admin/agreements')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(403);

    expect(viewResponse.body).toHaveProperty('error');
    expect(viewResponse.body.error).toContain('Admin');
  }, 60000);
});

/**
 * Integration Test 4: Edge Cases
 */
describe('Integration Test 4: Edge Cases', () => {
  it('should handle empty state when user has no agreements', async () => {
    // User checks status with no agreements
    const statusResponse = await request(app)
      .get('/api/agreement/status')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(statusResponse.body).toHaveProperty('agreement', null);
  }, 30000);

  it('should handle missing profile data gracefully', async () => {
    // Create a user with incomplete profile
    const incompleteUserId = generateUUID();
    await db.user.create({
      data: {
        id: incompleteUserId,
        email: 'incomplete@example.com',
        name: '', // Empty name
        role: 'ARTIST',
        password: 'hashed',
      },
    });

    // Create auth session for incomplete user
    const { data: authData } = await supabase.auth.signUp({
      email: 'incomplete@example.com',
      password: 'TestPassword123!',
    });

    if (!authData.session) {
      throw new Error('Failed to create session for incomplete user');
    }

    // Try to generate agreement with incomplete profile
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${authData.session.access_token}`)
      .expect(400);

    expect(generateResponse.body).toHaveProperty('error');
    expect(generateResponse.body.error).toContain('Incomplete profile');
    expect(generateResponse.body).toHaveProperty('missingFields');
    expect(Array.isArray(generateResponse.body.missingFields)).toBe(true);

    // Cleanup
    await db.user.delete({ where: { id: incompleteUserId } });
  }, 60000);

  it('should handle concurrent submissions from the same user', async () => {
    // Create multiple agreement requests concurrently
    const promises = [
      request(app)
        .post('/api/agreement/generate')
        .set('Authorization', `Bearer ${testUserToken}`),
      request(app)
        .post('/api/agreement/generate')
        .set('Authorization', `Bearer ${testUserToken}`),
      request(app)
        .post('/api/agreement/generate')
        .set('Authorization', `Bearer ${testUserToken}`),
    ];

    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pdfUrl');
      expect(response.body).toHaveProperty('agreementId');
    });

    // Verify all agreements were created
    const agreements = await db.agreementRequest.findMany({
      where: { userId: testUserId },
    });

    expect(agreements.length).toBe(3);

    // Verify each has unique ID and PDF path
    const ids = agreements.map(a => a.id);
    const paths = agreements.map(a => a.pdfPath);
    expect(new Set(ids).size).toBe(3);
    expect(new Set(paths).size).toBe(3);
  }, 90000);

  it('should return the latest agreement when multiple exist', async () => {
    // Create multiple agreements with delays
    const response1 = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 100));

    const response2 = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 100));

    const response3 = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    // Get status - should return the latest (response3)
    const statusResponse = await request(app)
      .get('/api/agreement/status')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    // Verify it's the latest agreement
    const latestAgreement = await db.agreementRequest.findFirst({
      where: { userId: testUserId },
      orderBy: { createdAt: 'desc' },
    });

    expect(statusResponse.body.createdAt).toBe(latestAgreement!.createdAt.toISOString());
  }, 90000);

  it('should handle invalid status values in admin update', async () => {
    // Create an agreement
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const agreementId = generateResponse.body.agreementId;

    // Try to update with invalid status
    const updateResponse = await request(app)
      .post(`/api/agreement/admin/agreement/${agreementId}/status`)
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({ status: 'invalid_status' })
      .expect(400);

    expect(updateResponse.body).toHaveProperty('error');
    expect(updateResponse.body.error).toContain('Invalid status');
  }, 60000);

  it('should handle non-existent agreement ID', async () => {
    const fakeId = generateUUID();

    // Try to download non-existent agreement
    const downloadResponse = await request(app)
      .get(`/api/agreement/download/${fakeId}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(404);

    expect(downloadResponse.body).toHaveProperty('error');
    expect(downloadResponse.body.error).toContain('not found');

    // Try to update non-existent agreement
    const updateResponse = await request(app)
      .post(`/api/agreement/admin/agreement/${fakeId}/status`)
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({ status: 'verified' })
      .expect(404);

    expect(updateResponse.body).toHaveProperty('error');
    expect(updateResponse.body.error).toContain('not found');
  }, 60000);
});

/**
 * Integration Test 5: Audit Log Completeness
 */
describe('Integration Test 5: Audit Log Completeness', () => {
  it('should create audit logs for all major operations', async () => {
    // Generate agreement
    const generateResponse = await request(app)
      .post('/api/agreement/generate')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const agreementId = generateResponse.body.agreementId;

    // Submit agreement
    await request(app)
      .post('/api/agreement/proceed')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ agreementId })
      .expect(200);

    // Admin updates status
    await request(app)
      .post(`/api/agreement/admin/agreement/${agreementId}/status`)
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({ status: 'verified' })
      .expect(200);

    // Verify audit logs
    const auditLogs = await db.agreementAuditLog.findMany({
      where: { agreementRequestId: agreementId },
      orderBy: { createdAt: 'asc' },
    });

    // Should have at least 3 logs: created, submitted, status_changed
    expect(auditLogs.length).toBeGreaterThanOrEqual(3);

    // Verify created log
    const createdLog = auditLogs.find(log => log.action === 'created');
    expect(createdLog).toBeDefined();
    expect(createdLog!.actorId).toBe(testUserId);
    expect(createdLog!.actorRole).toBe('user');

    // Verify submitted log
    const submittedLog = auditLogs.find(log => log.action === 'submitted');
    expect(submittedLog).toBeDefined();
    expect(submittedLog!.actorId).toBe(testUserId);
    expect(submittedLog!.actorRole).toBe('user');

    // Verify status change log
    const statusLog = auditLogs.find(log => log.action === 'status_changed');
    expect(statusLog).toBeDefined();
    expect(statusLog!.actorId).toBe(testAdminId);
    expect(statusLog!.actorRole).toBe('admin');

    // Verify all logs have required fields
    auditLogs.forEach(log => {
      expect(log.id).toBeDefined();
      expect(log.agreementRequestId).toBe(agreementId);
      expect(log.actorId).toBeDefined();
      expect(log.actorRole).toBeDefined();
      expect(['user', 'admin']).toContain(log.actorRole);
      expect(log.action).toBeDefined();
      expect(log.details).toBeDefined();
      expect(typeof log.details).toBe('object');
      expect(log.createdAt).toBeDefined();
    });
  }, 60000);
});
