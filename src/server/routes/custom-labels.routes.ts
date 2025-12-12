import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all requests (User sees their own, Admin sees all)
router.get('/', async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let where: any = {};

        // If not admin, only show own requests
        if (user.role !== 'ADMIN') {
            where = { user_id: user.id };
        }

        const requests = await db.customLabelRequest.findMany({ where });
        res.json(requests);
    } catch (error) {
        console.error('Get custom label requests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new request
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user!.id; // Auth middleware ensures user exists
        console.log(`[CustomLabelRequest] POST request from user ${userId} for label "${name}"`);

        if (!name) {
            return res.status(400).json({ error: 'Label name is required' });
        }

        // Check if label name already exists in global sub_labels or requests
        // Note: strict check might need to be relaxed or improved
        const existingLabels = await db.subLabel.findMany({
            where: { name }
        });

        if (existingLabels.length > 0) {
            return res.status(409).json({ error: 'Label name already exists' });
        }

        const request = await db.customLabelRequest.create({
            data: {
                name,
                userId,
                status: 'PENDING'
            }
        });
        console.log('[CustomLabelRequest] Created successfully:', request);

        res.status(201).json(request);
    } catch (error) {
        console.error('Create custom label request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve a request (Admin only)
router.patch('/:id/approve', async (req, res) => {
    try {
        if (req.user!.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        // Get the request
        const request = (await db.customLabelRequest.findMany({ where: { id } }))[0]; // TODO: Add findUnique to customLabelRequestOperations

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request is not pending' });
        }

        // Create the SubLabel (scoped to user)
        const subLabel = await db.subLabel.create({
            data: {
                name: request.name,
                userId: request.userId
            }
        });

        // Update request status
        const updatedRequest = await db.customLabelRequest.update({
            where: { id },
            data: { status: 'APPROVED' }
        });

        res.json({ request: updatedRequest, label: subLabel });
    } catch (error) {
        console.error('Approve custom label request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reject a request (Admin only)
router.patch('/:id/reject', async (req, res) => {
    try {
        if (req.user!.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { adminNotes } = req.body;

        // Update request status
        const updatedRequest = await db.customLabelRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                adminNotes: adminNotes || null
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Reject custom label request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
