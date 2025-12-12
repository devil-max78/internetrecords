/**
 * Property-Based Tests for PDF Generator Service
 * 
 * These tests verify the correctness properties of the PDF generation system
 * using property-based testing with fast-check.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { 
  generateAgreementPDF, 
  downloadPDF, 
  generatePDFHash, 
  verifyPDFHash 
} from './pdf-generator';
import { UserData } from './template-populator';
import { supabase } from '../supabase';

// Arbitrary for generating valid user data
const userDataArbitrary = fc.record({
  user_display_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  user_legal_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  user_email: fc.emailAddress(),
  user_mobile: fc.string({ minLength: 10, maxLength: 20 }).filter(s => s.trim().length > 0),
  user_full_address: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  user_entity_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
});

// Simple agreement template for testing
const testTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Agreement</title>
</head>
<body>
  <h1>Letter of Understanding</h1>
  <p>This agreement is between IT Music and {{user_entity_name}}</p>
  <p>Contact: {{user_display_name}}</p>
  <p>Email: {{user_email}}</p>
  <p>Effective Date: {{effective_date}}</p>
</body>
</html>
`;

// Setup: Ensure the agreements bucket exists
beforeAll(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'agreements');
    
    if (!bucketExists) {
      await supabase.storage.createBucket('agreements', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf']
      });
    }
  } catch (error) {
    console.error('Error setting up test bucket:', error);
  }
});

// Cleanup: Remove test files after all tests
afterAll(async () => {
  try {
    // List all files in the test bucket
    const { data: files } = await supabase.storage
      .from('agreements')
      .list();
    
    if (files && files.length > 0) {
      // Delete test files (be careful in production!)
      const filePaths = files.map(f => f.name);
      await supabase.storage
        .from('agreements')
        .remove(filePaths);
    }
  } catch (error) {
    console.error('Error cleaning up test files:', error);
  }
});

/**
 * Feature: label-agreement-system, Property 3: PDF generation produces valid output
 * For any valid user data, when PDF generation is requested, 
 * the system should return a PDF file path and the file should exist in storage.
 * Validates: Requirements 2.1, 2.3
 */
describe('PDF Generator - Property 3: PDF generation produces valid output', () => {
  it('generates a PDF with valid path for any user data', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Verify we got a path and hash
        expect(result.pdfPath).toBeDefined();
        expect(result.pdfPath).toContain('.pdf');
        expect(result.hash).toBeDefined();
        expect(result.hash).toHaveLength(64); // SHA-256 produces 64 hex characters
        
        // Verify the file exists in storage by attempting to download it
        const { data, error } = await supabase.storage
          .from('agreements')
          .download(result.pdfPath);
        
        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.size).toBeGreaterThan(0);
        
        // Cleanup: delete the test file
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 } // Reduced runs for PDF generation (slower operation)
    );
  }, 120000); // 120 second timeout for PDF generation tests
});

/**
 * Feature: label-agreement-system, Property 4: PDF hash integrity
 * For any generated PDF, the system should embed a cryptographic hash in the metadata,
 * and the hash should be verifiable against the PDF content.
 * Validates: Requirements 2.2, 8.5
 */
describe('PDF Generator - Property 4: PDF hash integrity', () => {
  it('generates consistent hash for PDF content', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        
        // Download the PDF
        const pdfBuffer = await downloadPDF(result.pdfPath);
        
        // Verify the hash matches
        const isValid = verifyPDFHash(pdfBuffer, result.hash);
        expect(isValid).toBe(true);
        
        // Verify that a different hash would fail
        const fakeHash = 'a'.repeat(64);
        const isInvalid = verifyPDFHash(pdfBuffer, fakeHash);
        expect(isInvalid).toBe(false);
        
        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
  
  it('generates different hashes for different content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10 }),
        fc.string({ minLength: 10 }),
        (content1, content2) => {
          fc.pre(content1 !== content2); // Only test when contents are different
          
          const hash1 = generatePDFHash(Buffer.from(content1));
          const hash2 = generatePDFHash(Buffer.from(content2));
          
          expect(hash1).not.toBe(hash2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: label-agreement-system, Property 6: PDF storage round-trip
 * For any generated and stored PDF, downloading the PDF from storage 
 * should return content that matches the originally generated content.
 * Validates: Requirements 2.5
 */
describe('PDF Generator - Property 6: PDF storage round-trip', () => {
  it('preserves PDF content through upload and download', async () => {
    await fc.assert(
      fc.asyncProperty(userDataArbitrary, async (userData) => {
        // Generate and upload PDF
        const result = await generateAgreementPDF(userData, testTemplate);
        const originalHash = result.hash;
        
        // Download the PDF
        const downloadedBuffer = await downloadPDF(result.pdfPath);
        
        // Verify the downloaded content matches the original by comparing hashes
        const downloadedHash = generatePDFHash(downloadedBuffer);
        expect(downloadedHash).toBe(originalHash);
        
        // Verify the hash is still valid
        const isValid = verifyPDFHash(downloadedBuffer, originalHash);
        expect(isValid).toBe(true);
        
        // Cleanup
        await supabase.storage
          .from('agreements')
          .remove([result.pdfPath]);
      }),
      { numRuns: 5 }
    );
  }, 120000);
});
