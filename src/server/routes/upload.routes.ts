import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { generateUploadUrl } from '../storage';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get presigned URL for file upload
router.post('/presigned-url', async (req, res) => {
  try {
    const { fileType, fileName, releaseId } = req.body;
    const userId = req.user!.id;

    if (!['AUDIO', 'ARTWORK'].includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Check if release exists and belongs to user
    const release = await db.release.findUnique({ where: { id: releaseId } });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    if (release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this release' });
    }

    // Generate upload URL using Supabase Storage
    const { uploadUrl, filePath } = await generateUploadUrl(fileName, fileType, releaseId);

    // Create file upload record
    const fileUpload = await db.fileUpload.create({
      data: {
        fileType,
        url: filePath,
        releaseId,
      },
    });

    // Update release with artwork URL if file type is ARTWORK
    if (fileType === 'ARTWORK') {
      await db.release.update({
        where: { id: releaseId },
        data: { artworkUrl: filePath },
      });
    }

    res.json({
      uploadUrl,
      fileUrl: filePath,
      fileUploadId: fileUpload.id,
    });
  } catch (error: any) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload URL',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update track with audio URL
router.post('/track-audio', async (req, res) => {
  try {
    const { trackId, audioUrl } = req.body;
    const userId = req.user!.id;

    console.log('Updating track audio:', { trackId, userId, audioUrl: audioUrl?.substring(0, 50) });

    const track = await db.track.findUnique({
      where: { id: trackId },
      include: { release: true },
    });

    console.log('Track found:', { 
      trackId: track?.id, 
      releaseId: track?.releaseId,
      releaseUserId: track?.release?.userId,
      currentUserId: userId 
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (!track.release) {
      console.error('Track release not loaded:', track);
      return res.status(500).json({ error: 'Track release data not available' });
    }

    if (track.release.userId !== userId) {
      console.error('User ID mismatch:', { 
        trackReleaseUserId: track.release.userId, 
        currentUserId: userId 
      });
      return res.status(403).json({ error: 'You do not have access to this track' });
    }

    const updatedTrack = await db.track.update({
      where: { id: trackId },
      data: { audioUrl },
    });

    res.json(updatedTrack);
  } catch (error: any) {
    console.error('Error updating track audio:', error);
    res.status(500).json({ 
      error: 'Failed to update track audio',
      details: error.message 
    });
  }
});

export default router;
