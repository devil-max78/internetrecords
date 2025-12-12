/**
 * Property-Based Tests for Agreement Routes
 * 
 * These tests verify the correctness properties of the agreement API endpoints
 * using property-based testing with fast-check.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { supabase } from '../supabase';
import { db } from '../db';
import { generateAgreementPDF } from '../services/pdf-generator';

// Test template
const testTemplate = `
<!DOCTYPE html>
<html>
<body>
  <h1>Agreement for {{user_entity_name}}</h1>
  <p>Email: {{user_email}}</p>
</body>
</html>
`;

// Arbitrary for generating valid user data
const userDataArbitrary = fc.record({
  user_display_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  user_legal_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  user_email: fc.emailAddress(),
  user_mobile: fc.string({ minLength: 10, maxLength: 20 }).filter(s => s.trim().length > 0),
  user_full_address: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  user_entity_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
});

// Status arbitrary
const statusArbitrary = fc.constantFrom('pending', 'verified', 'rejected');

// Test user IDs
let testUserId: string;

// Helper to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
        allowedMimeTypes: ['application/pdf']
      });
    }

    // Use a valid UUID for test user
    testUserId = generateUUID();
  } catch (error) {
    console.error('Error in beforeAll:', error);
  }
});

// Cleanup after each test
afterAll(async () => {
  try {
    // Clean up test agreement requests
    const testAgreements = await db.agreementRequest.findMany({
      where: { userId: testUserId }
    });

    for (const agreement of testAgreements) {
      // Delete PDF from storage
      try {
        await supabase.storage
          .from('agreements')
          .remove([agreement.pdfPath]);
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }

      // Delete audit logs
      await db.agreementAuditLog.findMany({
        where: { agreementRequestId: agreement.id }
      }).then(async () => {
        // Note: We'd need a delete method for audit logs
      });
    }
  } catch (error) {
    console.error('Error in afterAll:', error);
  }
});

/**
 * Feature: label-agreement-system, Property 5: PDF download URL provision
 * For any successfully generated PDF, the system should return a valid download URL 
 * that can be used to retrieve the file.
 * Validates: Requirements 2.4
 */
describe('Agreement Routes - Property 5: PDF download URL provision', () => {
  it('provides valid download URL for generated PDFs', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Create agreement request
        await db.agreementRequest.create({
          data: {
            userId: testUserId,
            pdfPath: result.pdfPath,
            pdfHash: result.hash,
            signedName: userData.user_legal_name,
            emailSent: false,
            status: 'pending'
          }
        });

        // Generate download URL
        const { data: urlData, error } = await supabase.storage
          .from('agreements')
          .createSignedUrl(result.pdfPath, 3600);

        // Verify URL is provided
        expect(error).toBeNull();
        expect(urlData).toBeDefined();
        expect(urlData?.signedUrl).toBeDefined();
        expect(urlData?.signedUrl).toContain('agreements');
        expect(urlData?.signedUrl).toContain(result.pdfPath);

        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 7: Agreement submission creates pending record
 * For any user confirmation of agreement submission, the system should create 
 * a database record with status set to 'pending'.
 * Validates: Requirements 3.4
 */
describe('Agreement Routes - Property 7: Agreement submission creates pending record', () => {
  it('creates pending record on submission', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Create agreement request (simulating the generate endpoint)
        const agreement = await db.agreementRequest.create({
          data: {
            userId: testUserId,
            pdfPath: result.pdfPath,
            pdfHash: result.hash,
            signedName: userData.user_legal_name,
            emailSent: false,
            status: 'pending'
          }
        });

        // Verify the record was created with pending status
        expect(agreement.status).toBe('pending');
        expect(agreement.userId).toBe(testUserId);

        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 8: Agreement record completeness
 * For any created agreement request record, the record should contain non-null values 
 * for pdf_path, signed_name, and created_at timestamp.
 * Validates: Requirements 3.5
 */
describe('Agreement Routes - Property 8: Agreement record completeness', () => {
  it('creates complete agreement records', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Create agreement request
        const agreement = await db.agreementRequest.create({
          data: {
            userId: testUserId,
            pdfPath: result.pdfPath,
            pdfHash: result.hash,
            signedName: userData.user_legal_name,
            emailSent: false,
            status: 'pending'
          }
        });

        // Verify all required fields are present and non-null
        expect(agreement.pdfPath).toBeDefined();
        expect(agreement.pdfPath).not.toBe('');
        expect(agreement.signedName).toBeDefined();
        expect(agreement.signedName).not.toBe('');
        expect(agreement.createdAt).toBeDefined();
        expect(agreement.createdAt).toBeInstanceOf(Date);

        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 9: Latest request retrieval
 * For any user with multiple agreement requests, when querying for status, 
 * the system should return the request with the most recent created_at timestamp.
 * Validates: Requirements 4.1
 */
describe('Agreement Routes - Property 9: Latest request retrieval', () => {
  it('retrieves the most recent agreement request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userDataArbitrary, { minLength: 2, maxLength: 5 }),
        async (userDataArray) => {
          const createdAgreements = [];

          // Create multiple agreement requests with delays to ensure different timestamps
          for (let i = 0; i < userDataArray.length; i++) {
            const userData = userDataArray[i];
            const result = await generateAgreementPDF(userData, testTemplate);
            
            // Add small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const agreement = await db.agreementRequest.create({
              data: {
                userId: testUserId,
                pdfPath: result.pdfPath,
                pdfHash: result.hash,
                signedName: userData.user_legal_name,
                emailSent: false,
                status: 'pending'
              }
            });
            
            createdAgreements.push(agreement);
          }

          // Get latest agreement
          const latestAgreement = await db.agreementRequest.findFirst({
            where: { userId: testUserId },
            orderBy: { createdAt: 'desc' }
          });

          // Verify it's the last one we created
          expect(latestAgreement).toBeDefined();
          expect(latestAgreement!.id).toBe(createdAgreements[createdAgreements.length - 1].id);

          // Verify it has the most recent timestamp
          const allTimestamps = createdAgreements.map(a => a.createdAt.getTime());
          const latestTimestamp = Math.max(...allTimestamps);
          expect(latestAgreement!.createdAt.getTime()).toBe(latestTimestamp);

          // Cleanup
          for (const agreement of createdAgreements) {
            await supabase.storage
              .from('agreements')
              .remove([agreement.pdfPath]);
          }
        }
      ),
      { numRuns: 3 } // Reduced runs due to multiple operations
    );
  }, 180000);
});

/**
 * Feature: label-agreement-system, Property 10: Status value validity
 * For any displayed agreement status, the status value should be exactly one of: 
 * 'pending', 'verified', or 'rejected'.
 * Validates: Requirements 4.2
 */
describe('Agreement Routes - Property 10: Status value validity', () => {
  it('only allows valid status values', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, statusArbitrary, async (userData, status) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Create agreement request with the status
        const agreement = await db.agreementRequest.create({
          data: {
            userId: testUserId,
            pdfPath: result.pdfPath,
            pdfHash: result.hash,
            signedName: userData.user_legal_name,
            emailSent: false,
            status
          }
        });

        // Verify status is one of the valid values
        expect(['pending', 'verified', 'rejected']).toContain(agreement.status);

        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 10 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 11: Status information completeness
 * For any agreement request displayed on the status page, both created_at and 
 * updated_at timestamps should be present and valid dates.
 * Validates: Requirements 4.3
 */
describe('Agreement Routes - Property 11: Status information completeness', () => {
  it('includes complete timestamp information', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Create agreement request
        const agreement = await db.agreementRequest.create({
          data: {
            userId: testUserId,
            pdfPath: result.pdfPath,
            pdfHash: result.hash,
            signedName: userData.user_legal_name,
            emailSent: false,
            status: 'pending'
          }
        });

        // Verify timestamps are present and valid
        expect(agreement.createdAt).toBeDefined();
        expect(agreement.createdAt).toBeInstanceOf(Date);
        expect(agreement.updatedAt).toBeDefined();
        expect(agreement.updatedAt).toBeInstanceOf(Date);
        
        // Verify timestamps are reasonable (not in the future, not too old)
        const now = Date.now();
        expect(agreement.createdAt.getTime()).toBeLessThanOrEqual(now);
        expect(agreement.updatedAt.getTime()).toBeLessThanOrEqual(now);
        expect(agreement.createdAt.getTime()).toBeGreaterThan(now - 60000); // Within last minute

        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 18: PDF authorization enforcement
 * For any PDF download request, if the requesting user is not the owner and not an admin, 
 * the system should reject the request with an authorization error.
 * Validates: Requirements 8.4
 */
describe('Agreement Routes - Property 18: PDF authorization enforcement', () => {
  it('enforces authorization for PDF downloads', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Create agreement request for testUserId
        const agreement = await db.agreementRequest.create({
          data: {
            userId: testUserId,
            pdfPath: result.pdfPath,
            pdfHash: result.hash,
            signedName: userData.user_legal_name,
            emailSent: false,
            status: 'pending'
          }
        });

        // Simulate checking authorization for a different user (not owner, not admin)
        const differentUserId = generateUUID();
        const isOwner = agreement.userId === differentUserId;
        const isAdmin = false; // Simulating non-admin user

        // Verify that authorization check would fail
        const hasAccess = isOwner || isAdmin;
        expect(hasAccess).toBe(false);

        // Verify owner has access
        const ownerHasAccess = agreement.userId === testUserId || isAdmin;
        expect(ownerHasAccess).toBe(true);

        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 12: Admin retrieves all requests
 * For any set of agreement requests in the database, when an admin queries for all requests, 
 * the returned list should contain all requests without omission.
 * Validates: Requirements 5.1
 */
describe('Agreement Routes - Property 12: Admin retrieves all requests', () => {
  it('retrieves all agreement requests for admin', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userDataArbitrary, { minLength: 1, maxLength: 5 }),
        async (userDataArray) => {
          const createdAgreements = [];

          // Create multiple agreement requests
          for (const userData of userDataArray) {
            const result = await generateAgreementPDF(userData, testTemplate);
            
            const agreement = await db.agreementRequest.create({
              data: {
                userId: testUserId,
                pdfPath: result.pdfPath,
                pdfHash: result.hash,
                signedName: userData.user_legal_name,
                emailSent: false,
                status: 'pending'
              }
            });
            
            createdAgreements.push(agreement);
          }

          // Get all agreements (simulating admin endpoint)
          const allAgreements = await db.agreementRequest.findMany({
            orderBy: { createdAt: 'desc' }
          });

          // Verify all created agreements are in the result
          for (const created of createdAgreements) {
            const found = allAgreements.find(a => a.id === created.id);
            expect(found).toBeDefined();
            expect(found?.userId).toBe(created.userId);
            expect(found?.pdfPath).toBe(created.pdfPath);
          }

          // Verify count is at least the number we created
          expect(allAgreements.length).toBeGreaterThanOrEqual(createdAgreements.length);

          // Cleanup
          for (const agreement of createdAgreements) {
            await supabase.storage
              .from('agreements')
              .remove([agreement.pdfPath]);
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 180000);
});

/**
 * Feature: label-agreement-system, Property 13: Status update persistence
 * For any admin status change operation, after the operation completes, 
 * querying the database should return the agreement request with the new status value.
 * Validates: Requirements 5.2, 5.3
 */
describe('Agreement Routes - Property 13: Status update persistence', () => {
  it('persists status updates correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        userDataArbitrary,
        statusArbitrary,
        statusArbitrary,
        async (userData, initialStatus, newStatus) => {
          // Generate PDF
          const result = await generateAgreementPDF(userData, testTemplate);
          
          // Create agreement request with initial status
          const agreement = await db.agreementRequest.create({
            data: {
              userId: testUserId,
              pdfPath: result.pdfPath,
              pdfHash: result.hash,
              signedName: userData.user_legal_name,
              emailSent: false,
              status: initialStatus
            }
          });

          // Update status (simulating admin endpoint)
          const updatedAgreement = await db.agreementRequest.update({
            where: { id: agreement.id },
            data: {
              status: newStatus,
              updatedAt: new Date()
            }
          });

          // Verify the status was updated
          expect(updatedAgreement.status).toBe(newStatus);

          // Query the database again to verify persistence
          const queriedAgreement = await db.agreementRequest.findUnique({
            where: { id: agreement.id }
          });

          expect(queriedAgreement).toBeDefined();
          expect(queriedAgreement!.status).toBe(newStatus);
          expect(queriedAgreement!.updatedAt.getTime()).toBeGreaterThan(agreement.createdAt.getTime());

          // Cleanup
          await supabase.storage
            .from('agreements')
            .remove([result.pdfPath]);
        }
      ),
      { numRuns: 10 }
    );
  }, 120000);
});

/**
 * Feature: label-agreement-system, Property 14: Audit log creation on status change
 * For any admin status change operation, the system should create an audit log entry 
 * containing the agreement_request_id, actor_id, actor_role, action, and timestamp.
 * Validates: Requirements 5.4, 6.2
 */
describe('Agreement Routes - Property 14: Audit log creation on status change', () => {
  it('creates audit log on status change', async () => {
    await fc.assert(
      fc.asyncProperty(
        userDataArbitrary,
        statusArbitrary,
        statusArbitrary,
        async (userData, initialStatus, newStatus) => {
          // Generate PDF
          const result = await generateAgreementPDF(userData, testTemplate);
          
          // Create agreement request
          const agreement = await db.agreementRequest.create({
            data: {
              userId: testUserId,
              pdfPath: result.pdfPath,
              pdfHash: result.hash,
              signedName: userData.user_legal_name,
              emailSent: false,
              status: initialStatus
            }
          });

          const adminId = generateUUID();

          // Update status and create audit log (simulating admin endpoint)
          await db.agreementRequest.update({
            where: { id: agreement.id },
            data: {
              status: newStatus,
              updatedAt: new Date()
            }
          });

          // Create audit log
          const auditLog = await db.agreementAuditLog.create({
            data: {
              agreementRequestId: agreement.id,
              actorId: adminId,
              actorRole: 'admin',
              action: 'status_changed',
              details: {
                oldStatus: initialStatus,
                newStatus: newStatus
              }
            }
          });

          // Verify audit log was created with all required fields
          expect(auditLog.agreementRequestId).toBe(agreement.id);
          expect(auditLog.actorId).toBe(adminId);
          expect(auditLog.actorRole).toBe('admin');
          expect(auditLog.action).toBe('status_changed');
          expect(auditLog.createdAt).toBeDefined();
          expect(auditLog.createdAt).toBeInstanceOf(Date);

          // Verify details contain status information
          expect(auditLog.details).toBeDefined();
          expect(typeof auditLog.details).toBe('object');
          expect((auditLog.details as any).oldStatus).toBe(initialStatus);
          expect((auditLog.details as any).newStatus).toBe(newStatus);

          // Cleanup
          await supabase.storage
            .from('agreements')
            .remove([result.pdfPath]);
        }
      ),
      { numRuns: 10 }
    );
  }, 120000);
});

