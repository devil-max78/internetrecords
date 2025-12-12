import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { generateAgreementPDF, downloadPDF } from '../services/pdf-generator';
import { UserData, validateUserData } from '../services/template-populator';
import { supabase } from '../supabase';

const router = Router();

// Simple agreement template (this would typically be loaded from a file or database)
const AGREEMENT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Letter of Understanding</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 40px;
      color: #333;
    }
    h1 {
      text-align: center;
      color: #2c3e50;
    }
    .section {
      margin: 20px 0;
    }
    .signature-line {
      margin-top: 40px;
      border-top: 1px solid #000;
      width: 300px;
    }
  </style>
</head>
<body>
  <h1>Letter of Understanding</h1>
  
  <div class="section">
    <p><strong>Effective Date:</strong> {{effective_date}}</p>
    <p><strong>Date Generated:</strong> {{today_date}}</p>
  </div>
  
  <div class="section">
    <p>This Letter of Understanding ("Agreement") is entered into between:</p>
    <p><strong>Internet Records</strong> ("Label")</p>
    <p>and</p>
    <p><strong>{{user_entity_name}}</strong> ("Artist/Label")</p>
  </div>
  
  <div class="section">
    <h3>Artist/Label Information:</h3>
    <p><strong>Display Name:</strong> {{user_display_name}}</p>
    <p><strong>Legal Name:</strong> {{user_legal_name}}</p>
    <p><strong>Email:</strong> {{user_email}}</p>
    <p><strong>Mobile:</strong> {{user_mobile}}</p>
    <p><strong>Address:</strong> {{user_full_address}}</p>
  </div>
  
  <div class="section">
    <h3>Terms:</h3>
    <p>This agreement establishes a partnership between Internet Records and {{user_entity_name}} 
    for the distribution and promotion of musical content.</p>
    
    <p>All references to "IT Music" in previous communications shall be understood to refer to {{user_entity_name}}.</p>
  </div>
  
  <div class="section">
    <p><strong>Signature:</strong></p>
    <div class="signature-line">{{user_legal_name}}</div>
    <p>Date: {{today_date}}</p>
  </div>
</body>
</html>
`;

// POST /agreement/generate - Generate PDF from template
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user details from database
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user data for template population
    // Map database fields to template fields
    const userData: UserData = {
      user_display_name: user.name || '',
      user_legal_name: user.legalName || '',
      user_email: user.email || '',
      user_mobile: user.mobile || '',
      user_full_address: user.address || '',
      user_entity_name: user.entityName || ''
    };

    // Validate user data
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Incomplete profile data',
        missingFields: validationErrors.map(e => e.field)
      });
    }

    // Generate PDF
    const { pdfPath, hash } = await generateAgreementPDF(userData, AGREEMENT_TEMPLATE);

    // Create agreement request record
    const agreementRequest = await db.agreementRequest.create({
      data: {
        userId,
        pdfPath,
        pdfHash: hash,
        signedName: userData.user_legal_name,
        emailSent: false,
        status: 'pending'
      }
    });

    // Create audit log for agreement creation
    await db.agreementAuditLog.create({
      data: {
        agreementRequestId: agreementRequest.id,
        actorId: userId,
        actorRole: 'user',
        action: 'created',
        details: {
          pdfPath,
          hash
        }
      }
    });

    // Generate download URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('agreements')
      .createSignedUrl(pdfPath, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Error generating download URL:', urlError);
      return res.status(500).json({ error: 'Failed to generate download URL' });
    }

    res.json({
      pdfUrl: urlData.signedUrl,
      agreementId: agreementRequest.id
    });
  } catch (error: any) {
    console.error('Generate agreement error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /agreement/proceed - Submit agreement request
router.post('/proceed', authMiddleware, async (req, res) => {
  try {
    const { agreementId } = req.body;
    const userId = req.user!.id;

    if (!agreementId) {
      return res.status(400).json({ error: 'Agreement ID is required' });
    }

    // Verify agreement exists and belongs to user
    const agreement = await db.agreementRequest.findUnique({
      where: { id: agreementId }
    });

    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    if (agreement.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this agreement' });
    }

    // Update agreement to mark email as sent
    const updatedAgreement = await db.agreementRequest.update({
      where: { id: agreementId },
      data: {
        emailSent: true,
        updatedAt: new Date()
      }
    });

    // Create audit log for submission
    await db.agreementAuditLog.create({
      data: {
        agreementRequestId: agreementId,
        actorId: userId,
        actorRole: 'user',
        action: 'submitted',
        details: {
          emailSent: true
        }
      }
    });

    res.json({
      success: true,
      requestId: updatedAgreement.id
    });
  } catch (error: any) {
    console.error('Proceed agreement error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /agreement/status - Get user's latest agreement status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get latest agreement request for user
    const latestAgreement = await db.agreementRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestAgreement) {
      return res.json({ agreement: null });
    }

    // Generate download URL for PDF
    const { data: urlData, error: urlError } = await supabase.storage
      .from('agreements')
      .createSignedUrl(latestAgreement.pdfPath, 3600);

    if (urlError) {
      console.error('Error generating download URL:', urlError);
    }

    res.json({
      status: latestAgreement.status,
      createdAt: latestAgreement.createdAt,
      updatedAt: latestAgreement.updatedAt,
      pdfUrl: urlData?.signedUrl || null
    });
  } catch (error: any) {
    console.error('Get agreement status error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /agreement/download/:id - Download PDF
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    // Get agreement request
    const agreement = await db.agreementRequest.findUnique({
      where: { id }
    });

    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    // Check authorization: user must own the agreement or be an admin
    if (!isAdmin && agreement.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this agreement' });
    }

    // Download PDF from storage
    const pdfBuffer = await downloadPDF(agreement.pdfPath);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="agreement_${agreement.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Download agreement error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /admin/agreements - List all agreement requests (admin only)
router.get('/admin/agreements', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    // Get all agreement requests
    const agreements = await db.agreementRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests: agreements });
  } catch (error: any) {
    console.error('Get all agreements error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /admin/agreement/:id/status - Update agreement status (admin only)
router.post('/admin/agreement/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user!.id;

    // Validate status
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Get current agreement
    const agreement = await db.agreementRequest.findUnique({
      where: { id }
    });

    if (!agreement) {
      return res.status(404).json({ error: 'Agreement request not found' });
    }

    // Update status
    await db.agreementRequest.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    // If status is verified, add the user's entity name as a custom label
    if (status === 'verified') {
      try {
        // Get user details to get their entity name
        const user = await db.user.findUnique({ where: { id: agreement.userId } });
        
        if (user && user.entityName) {
          // Check if label already exists for this user
          const existingLabels = await db.userLabel.findMany({
            where: { userId: agreement.userId }
          });
          
          const labelExists = existingLabels.some(
            (label: any) => label.labelName === user.entityName
          );
          
          if (!labelExists) {
            // Add the entity name as a custom label
            await db.userLabel.create({
              data: {
                userId: agreement.userId,
                labelName: user.entityName
              }
            });
            console.log(`Added custom label "${user.entityName}" for user ${agreement.userId}`);
          }
        }
      } catch (labelError) {
        console.error('Error adding custom label:', labelError);
        // Don't fail the whole operation if label creation fails
      }
    }

    // Create audit log
    await db.agreementAuditLog.create({
      data: {
        agreementRequestId: id,
        actorId: adminId,
        actorRole: 'admin',
        action: 'status_changed',
        details: {
          oldStatus: agreement.status,
          newStatus: status,
          notes: notes || null
        }
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update agreement status error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
