import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { generateDownloadUrl } from '../storage';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Approve a release
router.post('/releases/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const release = await db.release.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { tracks: true },
    });

    res.json(release);
  } catch (error) {
    console.error('Approve release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a release
router.post('/releases/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const release = await db.release.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { tracks: true },
    });

    res.json(release);
  } catch (error) {
    console.error('Reject release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Distribute a release
router.post('/releases/:id/distribute', async (req, res) => {
  try {
    const { id } = req.params;

    const release = await db.release.update({
      where: { id },
      data: { status: 'DISTRIBUTED' },
      include: { tracks: true },
    });

    res.json(release);
  } catch (error) {
    console.error('Distribute release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get download URLs for all files in a release
router.get('/releases/:id/downloads', async (req, res) => {
  try {
    const { id: releaseId } = req.params;

    const release = await db.release.findUnique({
      where: { id: releaseId },
      include: { tracks: true },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const downloadUrls = [];

    // Add artwork URL if exists
    if (release.artworkUrl) {
      const artworkUrl = await generateDownloadUrl(release.artworkUrl);
      downloadUrls.push({
        type: 'ARTWORK',
        name: `${release.title} - Artwork`,
        url: artworkUrl,
      });
    }

    // Add track URLs
    for (const track of release.tracks) {
      if (track.audioUrl) {
        const audioUrl = await generateDownloadUrl(track.audioUrl);
        downloadUrls.push({
          type: 'AUDIO',
          name: track.title,
          url: audioUrl,
        });
      }
    }

    res.json(downloadUrls);
  } catch (error) {
    console.error('Error generating download URLs:', error);
    res.status(500).json({ error: 'Failed to generate download URLs' });
  }
});

// Get metadata as JSON for a release
router.get('/releases/:id/metadata/json', async (req, res) => {
  try {
    const { id: releaseId } = req.params;

    const release = await db.release.findUnique({
      where: { id: releaseId },
      include: {
        tracks: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const metadata = {
      release: {
        id: release.id,
        title: release.title,
        status: release.status,
        artworkUrl: release.artworkUrl,
        createdAt: release.createdAt,
        updatedAt: release.updatedAt,
      },
      artist: {
        id: release.user.id,
        name: release.user.name,
        email: release.user.email,
        role: release.user.role,
      },
      tracks: release.tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        genre: track.genre,
        language: track.language,
        isrc: track.isrc,
      })),
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error generating metadata JSON:', error);
    res.status(500).json({ error: 'Failed to generate metadata JSON' });
  }
});

// Get metadata as CSV for a release
router.get('/releases/:id/metadata/csv', async (req, res) => {
  try {
    const { id: releaseId } = req.params;

    const release = await db.release.findUnique({
      where: { id: releaseId },
      include: {
        tracks: true,
        user: {
          select: { name: true },
        },
      },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Create CSV header
    let csv = 'Track Title,Artist,Duration,Genre,Language,ISRC\n';

    // Add tracks to CSV
    for (const track of release.tracks) {
      const duration = track.duration
        ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
        : '';

      csv += `"${track.title}","${release.user.name}","${duration}","${track.genre || ''}","${track.language || ''}","${track.isrc || ''}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${release.title}-metadata.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating metadata CSV:', error);
    res.status(500).json({ error: 'Failed to generate metadata CSV' });
  }
});

// Admin dropdown management routes

// Create publisher
router.post('/publishers', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const publisher = await db.publisher.create({ data: { name } });
    res.status(201).json(publisher);
  } catch (error: any) {
    console.error('Create publisher error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Publisher already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create album category
router.post('/album-categories', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await db.albumCategory.create({ data: { name } });
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Create album category error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Album category already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create content type
router.post('/content-types', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const contentType = await db.contentType.create({ data: { name } });
    res.status(201).json(contentType);
  } catch (error: any) {
    console.error('Create content type error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Content type already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create sub-label (admin only)
router.post('/sub-labels', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const subLabel = await db.subLabel.create({ data: { name } });
    res.status(201).json(subLabel);
  } catch (error: any) {
    console.error('Create sub-label error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Sub-label already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a release (admin only)
router.delete('/releases/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get release with tracks to delete associated files
    const release = await db.release.findUnique({
      where: { id },
      include: { tracks: true },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Delete the release (tracks will be cascade deleted)
    await db.release.delete({ where: { id } });

    res.json({ success: true, message: 'Release deleted successfully' });
  } catch (error: any) {
    console.error('Delete release error:', error);
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

// Delete a track (admin only)
router.delete('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const track = await db.track.findUnique({
      where: { id },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    await db.track.delete({ where: { id } });

    res.json({ success: true, message: 'Track deleted successfully' });
  } catch (error: any) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

export default router;
