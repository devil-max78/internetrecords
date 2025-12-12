/**
 * PDF Generator Service
 * 
 * This service handles the generation of PDF documents from HTML templates.
 * It uses Puppeteer for HTML-to-PDF conversion, generates cryptographic hashes
 * for document integrity, and integrates with Supabase Storage for PDF upload.
 */

import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { supabase } from '../supabase';
import { populateTemplate, UserData } from './template-populator';

const AGREEMENT_BUCKET = 'agreements';

export interface PDFGenerationResult {
  pdfPath: string;
  hash: string;
}

/**
 * Generates a cryptographic hash for the PDF content
 * 
 * @param pdfBuffer - The PDF file buffer
 * @returns SHA-256 hash of the PDF content
 */
export function generatePDFHash(pdfBuffer: Buffer): string {
  return crypto.createHash('sha256').update(pdfBuffer).digest('hex');
}

/**
 * Generates an agreement PDF from user data
 * 
 * This function:
 * 1. Populates the agreement template with user data
 * 2. Converts the HTML to PDF using Puppeteer
 * 3. Generates a cryptographic hash for the PDF
 * 4. Uploads the PDF to Supabase Storage
 * 5. Returns the storage path and hash
 * 
 * @param userData - The user data to populate the template with
 * @param agreementTemplate - The HTML template string
 * @returns Promise resolving to PDF path and hash
 * @throws Error if PDF generation or upload fails
 */
export async function generateAgreementPDF(
  userData: UserData,
  agreementTemplate: string
): Promise<PDFGenerationResult> {
  let browser;
  
  try {
    // Step 1: Populate the template with user data
    const populatedHTML = populateTemplate(agreementTemplate, userData);
    
    // Step 2: Launch Puppeteer and generate PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(populatedHTML, { waitUntil: 'networkidle0' });
    
    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    browser = null;
    
    // Step 3: Generate cryptographic hash
    const hash = generatePDFHash(Buffer.from(pdfBuffer));
    
    // Step 4: Upload to Supabase Storage
    // Sanitize email for use in file path (remove special characters)
    const sanitizedEmail = userData.user_email.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `agreement_${sanitizedEmail}_${Date.now()}.pdf`;
    const filePath = `${sanitizedEmail}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(AGREEMENT_BUCKET)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }
    
    // Step 5: Return the storage path and hash
    return {
      pdfPath: filePath,
      hash
    };
    
  } catch (error) {
    // Clean up browser if still open
    if (browser) {
      await browser.close();
    }
    
    console.error('Error generating agreement PDF:', error);
    throw error;
  }
}

/**
 * Downloads a PDF from Supabase Storage
 * 
 * @param pdfPath - The storage path of the PDF
 * @returns Promise resolving to the PDF buffer
 * @throws Error if download fails
 */
export async function downloadPDF(pdfPath: string): Promise<Buffer> {
  try {
    const { data, error } = await supabase.storage
      .from(AGREEMENT_BUCKET)
      .download(pdfPath);
    
    if (error) {
      console.error('Error downloading PDF from storage:', error);
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
    
    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Verifies the integrity of a PDF by comparing its hash
 * 
 * @param pdfBuffer - The PDF buffer to verify
 * @param expectedHash - The expected hash value
 * @returns True if the hash matches, false otherwise
 */
export function verifyPDFHash(pdfBuffer: Buffer, expectedHash: string): boolean {
  const actualHash = generatePDFHash(pdfBuffer);
  return actualHash === expectedHash;
}
