import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Submit a YouTube OAC request
router.post('/', async (req, res) => {
  try {
    const { channelLink, legalName, channelName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!channelLink || !legalName || !channelName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user has at least 3 releases
    const releases = await db.release.findMany({ where: { userId } });
    if (releases.length < 3) {
      return res.status(400).json({ 
        error: 'You must have at least 3 songs distributed through our platform to request YouTube OAC' 
      });
    }

    // Check if user already has a pending request
    const existingRequests = await db.youtubeOacRequest.findMany({
      where: { userId, status: 'PENDING' }
    });

    if (existingRequests.length > 0) {
      return res.status(400).json({ 
        error: 'You already have a pending OAC request' 
      });
    }

    const request = await db.youtubeOacRequest.create({
      data: {
        userId,
        channelLink: channelLink.trim(),
        legalName: legalName.trim(),
        channelName: channelName.trim(),
        status: 'PENDING',
      },
    });

    res.status(201).json(request);
  } catch (error: any) {
    console.error('Create YouTube OAC request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's YouTube OAC requests
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requests = await db.youtubeOacRequest.findMany({
      where: { userId },
    });

    res.json(requests);
  } catch (error: any) {
    console.error('Get YouTube OAC requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific YouTube OAC request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const request = await db.youtubeOacRequest.findUnique({ where: { id } });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error: any) {
    console.error('Get YouTube OAC request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
