import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { generateDownloadUrl } from '../storage';
import { sendStatusUpdateEmail, formatStatusForEmail, getStatusMessage } from '../email';

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
      include: { 
        tracks: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notification
    if (release.user && release.tracks.length > 0) {
      const firstTrack = release.tracks[0];
      await sendStatusUpdateEmail({
        user_name: release.user.name || 'Artist',
        user_email: release.user.email,
        song_name: firstTrack.title || release.title,
        singer_name: release.user.name || 'Unknown Artist',
        song_status: formatStatusForEmail('APPROVED'),
        status_message: getStatusMessage('APPROVED'),
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      });
    }

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
      include: { 
        tracks: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notification
    if (release.user && release.tracks.length > 0) {
      const firstTrack = release.tracks[0];
      await sendStatusUpdateEmail({
        user_name: release.user.name || 'Artist',
        user_email: release.user.email,
        song_name: firstTrack.title || release.title,
        singer_name: release.user.name || 'Unknown Artist',
        song_status: formatStatusForEmail('REJECTED'),
        status_message: getStatusMessage('REJECTED'),
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      });
    }

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
      include: { 
        tracks: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notification
    if (release.user && release.tracks.length > 0) {
      const firstTrack = release.tracks[0];
      await sendStatusUpdateEmail({
        user_name: release.user.name || 'Artist',
        user_email: release.user.email,
        song_name: firstTrack.title || release.title,
        singer_name: release.user.name || 'Unknown Artist',
        song_status: formatStatusForEmail('DISTRIBUTED'),
        status_message: getStatusMessage('DISTRIBUTED'),
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      });
    }

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

    // Create CSV header with all track details
    let csv = 'Track Title,Artist,Singer,Lyricist,Composer,Producer,Featuring,Duration,Genre,Language,ISRC,CRBT Start,CRBT End\n';

    // Add tracks to CSV
    for (const track of release.tracks) {
      const duration = track.duration
        ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
        : '';
      
      const crbtStart = track.crbtStartTime ? `${track.crbtStartTime}s` : '';
      const crbtEnd = track.crbtEndTime ? `${track.crbtEndTime}s` : '';

      csv += `"${track.title}","${release.user.name}","${track.singer || ''}","${track.lyricist || ''}","${track.composer || ''}","${track.producer || ''}","${track.featuring || ''}","${duration}","${track.genre || ''}","${track.language || ''}","${track.isrc || ''}","${crbtStart}","${crbtEnd}"\n`;
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

// Delete sub-label
router.delete('/sub-labels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if sub-label is being used by any releases
    const releases = await db.release.findMany({ where: { subLabelId: id } });
    if (releases && releases.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete: This sub-label is used by ${releases.length} release(s). Please remove it from those releases first.` 
      });
    }
    
    await db.subLabel.delete({ where: { id } });
    res.json({ success: true, message: 'Sub-label deleted successfully' });
  } catch (error: any) {
    console.error('Delete sub-label error:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete: This item is currently in use' });
    }
    res.status(500).json({ error: error.message || 'Failed to delete sub-label' });
  }
});

// Delete publisher
router.delete('/publishers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if publisher is being used
    const releases = await db.release.findMany({ where: { publisherId: id } });
    if (releases && releases.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete: This publisher is used by ${releases.length} release(s)` 
      });
    }
    
    await db.publisher.delete({ where: { id } });
    res.json({ success: true, message: 'Publisher deleted successfully' });
  } catch (error: any) {
    console.error('Delete publisher error:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete: This item is currently in use' });
    }
    res.status(500).json({ error: 'Failed to delete publisher' });
  }
});

// Delete album category
router.delete('/album-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is being used
    const releases = await db.release.findMany({ where: { albumCategoryId: id } });
    if (releases && releases.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete: This category is used by ${releases.length} release(s)` 
      });
    }
    
    await db.albumCategory.delete({ where: { id } });
    res.json({ success: true, message: 'Album category deleted successfully' });
  } catch (error: any) {
    console.error('Delete album category error:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete: This item is currently in use' });
    }
    res.status(500).json({ error: 'Failed to delete album category' });
  }
});

// Delete content type
router.delete('/content-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if content type is being used
    const releases = await db.release.findMany({ where: { contentTypeId: id } });
    if (releases && releases.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete: This content type is used by ${releases.length} release(s)` 
      });
    }
    
    await db.contentType.delete({ where: { id } });
    res.json({ success: true, message: 'Content type deleted successfully' });
  } catch (error: any) {
    console.error('Delete content type error:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete: This item is currently in use' });
    }
    res.status(500).json({ error: 'Failed to delete content type' });
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
    console.error('Error details:', error.message, error.code, error.details);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Sub-label already exists' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
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

// Get all YouTube claims (admin only)
router.get('/youtube-claims', async (_req, res) => {
  try {
    const claims = await db.youtubeClaim.findMany();
    res.json(claims);
  } catch (error: any) {
    console.error('Get YouTube claims error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update YouTube claim status (admin only)
router.patch('/youtube-claims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (status === 'COMPLETED' || status === 'REJECTED') {
      updateData.processedAt = new Date().toISOString();
    }

    const claim = await db.youtubeClaim.update({
      where: { id },
      data: updateData,
    });

    res.json(claim);
  } catch (error: any) {
    console.error('Update YouTube claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/users', async (_req, res) => {
  try {
    const users = await db.user.findMany();
    res.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const validRoles = ['ARTIST', 'LABEL', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await db.user.update({
      where: { id },
      data: { role },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all YouTube OAC requests (admin only)
router.get('/youtube-oac-requests', async (_req, res) => {
  try {
    const requests = await db.youtubeOacRequest.findMany();
    res.json(requests);
  } catch (error: any) {
    console.error('Get YouTube OAC requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update YouTube OAC request status (admin only)
router.patch('/youtube-oac-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    if (status === 'APPROVED' || status === 'REJECTED') {
      updateData.processedAt = new Date().toISOString();
    }

    const request = await db.youtubeOacRequest.update({
      where: { id },
      data: updateData,
    });

    res.json(request);
  } catch (error: any) {
    console.error('Update YouTube OAC request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all social media linking requests (admin only)
router.get('/social-media-linking', async (_req, res) => {
  try {
    const requests = await db.socialMediaLinking.findMany();
    res.json(requests);
  } catch (error: any) {
    console.error('Get social media linking requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update social media linking request status (admin only)
router.patch('/social-media-linking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    if (status === 'COMPLETED' || status === 'REJECTED') {
      updateData.processedAt = new Date().toISOString();
    }

    const request = await db.socialMediaLinking.update({
      where: { id },
      data: updateData,
    });

    res.json(request);
  } catch (error: any) {
    console.error('Update social media linking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
