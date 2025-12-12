import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { logAgreementCreation, logStatusChange, ActorRole } from './audit-logger';
import { db } from '../db';
import { supabase } from '../supabase';

// Arbitraries for property-based testing
const uuidArbitrary = fc.uuid();
const actorRoleArbitrary = fc.constantFrom('user' as ActorRole, 'admin' as ActorRole);
const statusArbitrary = fc.constantFrom('pending', 'verified', 'rejected');
const detailsArbitrary = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string({ maxLength: 100 }),
    fc.integer(),
    fc.boolean()
  )
);

// Helper function to create a test user
async function createTestUser(userId: string): Promise<void> {
  try {
    await db.user.create({
      data: {
        id: userId,
        email: `test_${userId.substring(0, 8)}@example.com`,
        name: 'Test User',
        role: 'ARTIST',
        password: 'hashedpassword'
      }
    });
  } catch (error) {
    // User might already exist, ignore error
  }
}

// Helper function to create a test agreement request
async function createTestAgreementRequest(userId: string): Promise<string> {
  // Ensure user exists first
  await createTestUser(userId);
  
  const agreementRequest = await db.agreementRequest.create({
    data: {
      userId,
      pdfPath: `test/path/${Date.now()}.pdf`,
      pdfHash: `hash_${Date.now()}`,
      signedName: 'Test User',
      emailSent: false,
      status: 'pending'
    }
  });
  return agreementRequest.id;
}

// Helper function to cleanup test data
async function cleanupTestData(agreementRequestId: string, userId?: string) {
  // Delete audit logs first (due to foreign key constraint)
  await supabase
    .from('agreement_audit_log')
    .delete()
    .eq('agreement_request_id', agreementRequestId);
  
  // Delete agreement request
  await supabase
    .from('agreement_requests')
    .delete()
    .eq('id', agreementRequestId);
  
  // Delete test user if provided
  if (userId) {
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);
  }
}

describe('Audit Logger - Property 15: Audit log on request creation', () => {
  // Feature: label-agreement-system, Property 15: Audit log on request creation
  it('creates audit log entry when agreement request is created', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArbitrary,
        detailsArbitrary,
        async (userId, details) => {
          // Create a test agreement request first
          const agreementRequestId = await createTestAgreementRequest(userId);

          try {
            // Log the agreement creation
            await logAgreementCreation(agreementRequestId, userId, details);

            // Query the audit log to verify entry exists
            const logs = await db.agreementAuditLog.findMany({
              where: { agreementRequestId },
            });

            // Should have at least one log entry
            expect(logs.length).toBeGreaterThan(0);

            // Find the creation log
            const creationLog = logs.find(log => log.action === 'created');
            expect(creationLog).toBeDefined();
            expect(creationLog?.actorId).toBe(userId);
            expect(creationLog?.actorRole).toBe('user');
            expect(creationLog?.action).toBe('created');
          } finally {
            // Cleanup
            await cleanupTestData(agreementRequestId, userId);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Audit Logger - Property 16: Audit log actor role validity', () => {
  // Feature: label-agreement-system, Property 16: Audit log actor role validity
  it('ensures actor_role is either user or admin', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArbitrary,
        uuidArbitrary,
        actorRoleArbitrary,
        statusArbitrary,
        statusArbitrary,
        async (userId, actorId, actorRole, oldStatus, newStatus) => {
          // Create a test agreement request first
          const agreementRequestId = await createTestAgreementRequest(userId);

          try {
            // Log a status change
            await logStatusChange(
              agreementRequestId,
              actorId,
              actorRole,
              oldStatus,
              newStatus
            );

            // Query the audit log
            const logs = await db.agreementAuditLog.findMany({
              where: { agreementRequestId },
            });

            // Verify all logs have valid actor_role
            for (const log of logs) {
              expect(['user', 'admin']).toContain(log.actorRole);
            }
          } finally {
            // Cleanup
            await cleanupTestData(agreementRequestId, userId);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Audit Logger - Property 17: Audit log details structure', () => {
  // Feature: label-agreement-system, Property 17: Audit log details structure
  it('ensures details field is valid JSON and parseable as object', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArbitrary,
        detailsArbitrary,
        async (userId, details) => {
          // Create a test agreement request first
          const agreementRequestId = await createTestAgreementRequest(userId);

          try {
            // Log agreement creation with details
            await logAgreementCreation(agreementRequestId, userId, details);

            // Query the audit log
            const logs = await db.agreementAuditLog.findMany({
              where: { agreementRequestId },
            });

            // Verify all logs have valid details structure
            for (const log of logs) {
              // Details should be an object (not null, not undefined)
              expect(log.details).toBeDefined();
              expect(typeof log.details).toBe('object');
              expect(log.details).not.toBeNull();

              // Should be parseable (already parsed by Supabase, but verify structure)
              // If it's stored as JSONB, it should come back as an object
              const detailsObj = log.details as Record<string, any>;
              expect(detailsObj).toBeInstanceOf(Object);
              
              // Verify it can be stringified and parsed (round-trip test)
              const jsonString = JSON.stringify(detailsObj);
              const parsed = JSON.parse(jsonString);
              expect(parsed).toEqual(detailsObj);
            }
          } finally {
            // Cleanup
            await cleanupTestData(agreementRequestId, userId);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('ensures status change details contain oldStatus and newStatus', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArbitrary,
        uuidArbitrary,
        actorRoleArbitrary,
        statusArbitrary,
        statusArbitrary,
        async (userId, actorId, actorRole, oldStatus, newStatus) => {
          // Create a test agreement request first
          const agreementRequestId = await createTestAgreementRequest(userId);

          try {
            // Log a status change
            await logStatusChange(
              agreementRequestId,
              actorId,
              actorRole,
              oldStatus,
              newStatus
            );

            // Query the audit log
            const logs = await db.agreementAuditLog.findMany({
              where: { agreementRequestId },
            });

            // Find status change logs
            const statusChangeLogs = logs.filter(log => log.action === 'status_changed');
            
            for (const log of statusChangeLogs) {
              const details = log.details as Record<string, any>;
              expect(details).toHaveProperty('oldStatus');
              expect(details).toHaveProperty('newStatus');
              expect(details.oldStatus).toBe(oldStatus);
              expect(details.newStatus).toBe(newStatus);
            }
          } finally {
            // Cleanup
            await cleanupTestData(agreementRequestId, userId);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Audit Logger - Complete audit log structure', () => {
  it('ensures all audit logs include required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArbitrary,
        detailsArbitrary,
        async (userId, details) => {
          // Create a test agreement request first
          const agreementRequestId = await createTestAgreementRequest(userId);

          try {
            // Log agreement creation
            await logAgreementCreation(agreementRequestId, userId, details);

            // Query the audit log
            const logs = await db.agreementAuditLog.findMany({
              where: { agreementRequestId },
            });

            // Verify all required fields are present
            for (const log of logs) {
              expect(log.id).toBeDefined();
              expect(log.agreementRequestId).toBe(agreementRequestId);
              expect(log.actorId).toBeDefined();
              expect(log.actorRole).toBeDefined();
              expect(log.action).toBeDefined();
              expect(log.details).toBeDefined();
              expect(log.createdAt).toBeDefined();
              // Supabase returns timestamps as strings, so check if it's a valid date string
              expect(typeof log.createdAt === 'string' || log.createdAt instanceof Date).toBe(true);
              // Verify it can be converted to a Date
              const dateObj = new Date(log.createdAt);
              expect(dateObj.getTime()).not.toBeNaN();
            }
          } finally {
            // Cleanup
            await cleanupTestData(agreementRequestId, userId);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
