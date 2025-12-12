import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { generateDownloadUrl } from '../storage';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new release
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      artworkUrl, 
      upc,
      originalReleaseDate,
      goLiveDate,
      albumCategoryId,
      contentTypeId,
      cLine,
      subLabelId,
      publisherId,
      primaryArtistId
    } = req.body;
    const userId = req.user!.id;

    const release = await db.release.create({
      data: {
        title,
        artworkUrl,
        upc,
        originalReleaseDate,
        goLiveDate,
        albumCategoryId,
        contentTypeId,
        cLine: cLine || 'Internet Records',
        subLabelId,
        publisherId,
        primaryArtistId,
        status: 'DRAFT',
        userId,
      },
    });

    res.status(201).json(release);
  } catch (error) {
    console.error('Create release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all releases for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const releases = await db.release.findMany({
      where: isAdmin ? {} : { userId },
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
      orderBy: {
        created_at: 'desc',
      },
    });

    // Generate signed URLs for artwork
    const releasesWithUrls = await Promise.all(
      releases.map(async (release) => {
        let artworkSignedUrl = null;
        if (release.artworkUrl) {
          try {
            artworkSignedUrl = await generateDownloadUrl(release.artworkUrl, 3600);
          } catch (error: any) {
            // File doesn't exist in storage, set to null
            if (error.statusCode === '404') {
              console.warn(`Artwork file not found for release ${release.id}: ${release.artworkUrl}`);
            } else {
              console.error('Error generating artwork URL:', error);
            }
          }
        }
        return {
          ...release,
          artworkUrl: artworkSignedUrl, // Return null if file doesn't exist
        };
      })
    );

    res.json(releasesWithUrls);
  } catch (error) {
    console.error('Get releases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single release by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const release = await db.release.findUnique({
      where: { id },
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

    // Check if user has access to this release
    if (!isAdmin && release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this release' });
    }

    // Generate signed URL for artwork
    let artworkSignedUrl = null;
    if (release.artworkUrl) {
      try {
        artworkSignedUrl = await generateDownloadUrl(release.artworkUrl, 3600);
      } catch (error: any) {
        // File doesn't exist in storage, set to null
        if (error.statusCode === '404') {
          console.warn(`Artwork file not found for release ${release.id}: ${release.artworkUrl}`);
        } else {
          console.error('Error generating artwork URL:', error);
        }
      }
    }

    res.json({
      ...release,
      artworkUrl: artworkSignedUrl, // Return null if file doesn't exist
    });
  } catch (error) {
    console.error('Get release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a release
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artworkUrl, status } = req.body;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const release = await db.release.findUnique({ where: { id } });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    if (!isAdmin && release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this release' });
    }

    // Only admin can change status
    if (status && !isAdmin) {
      return res.status(403).json({ error: 'Only admin can change release status' });
    }

    const updatedRelease = await db.release.update({
      where: { id },
      data: { title, artworkUrl, status },
      include: { tracks: true },
    });

    res.json(updatedRelease);
  } catch (error) {
    console.error('Update release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a release for review
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const release = await db.release.findUnique({
      where: { id },
      include: { tracks: true },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    if (release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this release' });
    }

    if (release.tracks.length === 0) {
      return res.status(400).json({ error: 'Release must have at least one track' });
    }

    // Determine status: RESUBMITTED if previously rejected, otherwise UNDER_REVIEW
    const newStatus = release.status === 'REJECTED' ? 'RESUBMITTED' : 'UNDER_REVIEW';

    const updatedRelease = await db.release.update({
      where: { id },
      data: { 
        status: newStatus,
        // Clear rejection reason when resubmitting
        rejectionReason: newStatus === 'RESUBMITTED' ? null : release.rejectionReason,
      },
      include: { tracks: true },
    });

    res.json(updatedRelease);
  } catch (error) {
    console.error('Submit release error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a track to a release
router.post('/:id/tracks', async (req, res) => {
  try {
    const { id: releaseId } = req.params;
    const { title, duration, genre, language, isrc, audioUrl, crbtStartTime, crbtEndTime, singer, lyricist, composer, producer, featuring } = req.body;
    const userId = req.user!.id;

    const release = await db.release.findUnique({ where: { id: releaseId } });

    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    if (release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this release' });
    }

    if (release.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Cannot add tracks to a release that is not in draft status' });
    }

    const track = await db.track.create({
      data: {
        title,
        duration,
        genre,
        language,
        isrc,
        singer,
        lyricist,
        composer,
        producer,
        featuring,
        audioUrl,
        crbtStartTime,
        crbtEndTime,
        releaseId,
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error('Add track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a track
router.put('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, genre, language, isrc, audioUrl, crbtStartTime, crbtEndTime, singer, lyricist, composer, producer, featuring } = req.body;
    const userId = req.user!.id;

    const track = await db.track.findUnique({
      where: { id },
      include: { release: true },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (track.release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this track' });
    }

    if (track.release.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Cannot update tracks for a release that is not in draft status' });
    }

    const updatedTrack = await db.track.update({
      where: { id },
      data: { title, duration, genre, language, isrc, audioUrl, crbtStartTime, crbtEndTime, singer, lyricist, composer, producer, featuring },
    });

    res.json(updatedTrack);
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a track
router.delete('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const track = await db.track.findUnique({
      where: { id },
      include: { release: true },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (track.release.userId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this track' });
    }

    if (track.release.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Cannot delete tracks from a release that is not in draft status' });
    }

    await db.track.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
