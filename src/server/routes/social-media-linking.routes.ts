import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Submit a social media linking request
router.post('/', async (req, res) => {
  try {
    const { email, label, platforms, facebookPageUrl, instagramHandle, isrc } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!email || !label || !platforms || !isrc) {
      return res.status(400).json({ error: 'Email, label, platforms, and ISRC are required' });
    }

    if (platforms === 'facebook' && !facebookPageUrl) {
      return res.status(400).json({ error: 'Facebook Page URL is required' });
    }

    if (platforms === 'instagram' && !instagramHandle) {
      return res.status(400).json({ error: 'Instagram Handle is required' });
    }

    if (platforms === 'both' && (!facebookPageUrl || !instagramHandle)) {
      return res.status(400).json({ error: 'Both Facebook and Instagram details are required' });
    }

    const request = await db.socialMediaLinking.create({
      data: {
        userId,
        email: email.trim(),
        label: label.trim(),
        platforms,
        facebookPageUrl: facebookPageUrl?.trim() || null,
        instagramHandle: instagramHandle?.trim() || null,
        isrc: isrc.trim(),
        status: 'PENDING',
      },
    });

    res.status(201).json(request);
  } catch (error: any) {
    console.error('Create social media linking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's social media linking requests
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requests = await db.socialMediaLinking.findMany({
      where: { userId },
    });

    res.json(requests);
  } catch (error: any) {
    console.error('Get social media linking requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
