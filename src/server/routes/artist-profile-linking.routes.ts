import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Create new profile linking request
router.post('/', async (req, res) => {
  try {
    const {
      artistName,
      email,
      instagramUrl,
      youtubeUrl,
      facebookUrl,
      spotifyUrl,
      appleMusicUrl,
      isrcCode,
      additionalNotes,
    } = req.body;

    const userId = req.user!.id;

    if (!artistName || !email) {
      return res.status(400).json({ error: 'Artist name and email are required' });
    }

    // At least one platform URL must be provided
    if (!instagramUrl && !youtubeUrl && !facebookUrl && !spotifyUrl && !appleMusicUrl) {
      return res.status(400).json({ error: 'At least one platform URL is required' });
    }

    const request = await db.artistProfileLinking.create({
      data: {
        userId,
        artistName: artistName.trim(),
        email: email.trim(),
        instagramUrl: instagramUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        facebookUrl: facebookUrl?.trim() || null,
        spotifyUrl: spotifyUrl?.trim() || null,
        appleMusicUrl: appleMusicUrl?.trim() || null,
        isrcCode: isrcCode?.trim() || null,
        additionalNotes: additionalNotes?.trim() || null,
        status: 'PENDING',
      },
    });

    res.status(201).json(request);
  } catch (error: any) {
    console.error('Create profile linking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's profile linking requests
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    const requests = await db.artistProfileLinking.findMany({
      where: { userId },
    });

    res.json(requests);
  } catch (error: any) {
    console.error('Get profile linking requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all profile linking requests
router.get('/admin/all', async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const requests = await db.artistProfileLinking.findMany({});
    res.json(requests);
  } catch (error: any) {
    console.error('Get all profile linking requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update profile linking request status
router.patch('/admin/:id', async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateData: any = { status };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    if (status === 'COMPLETED' || status === 'REJECTED') {
      updateData.processedAt = new Date().toISOString();
    }

    const updated = await db.artistProfileLinking.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update profile linking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
