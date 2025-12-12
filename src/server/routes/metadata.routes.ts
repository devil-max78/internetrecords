import { Router } from 'express';
import { db } from '../db';
import { supabase } from '../supabase';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all sub-labels (global + user-specific)
router.get('/sub-labels', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get global sub-labels (is_global = true) and user-specific sub-labels
    const { data, error } = await supabase
      .from('sub_labels')
      .select('*')
      .or(`is_global.eq.true,user_id.eq.${userId}`)
      .order('name');
    
    if (error) throw error;
    
    // Convert to camelCase
    const subLabels = data ? data.map((label: any) => ({
      id: label.id,
      name: label.name,
      userId: label.user_id,
      isGlobal: label.is_global,
      createdAt: label.created_at,
      updatedAt: label.updated_at,
    })) : [];
    
    res.json(subLabels);
  } catch (error) {
    console.error('Get sub-labels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search artists
router.get('/artists/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const artists = await db.artist.findByName(q);

    res.json(artists);
  } catch (error) {
    console.error('Search artists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all artists
router.get('/artists', async (_req, res) => {
  try {
    const artists = await db.artist.findMany();
    res.json(artists);
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new artist
router.post('/artists', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const artist = await db.artist.create({
      data: { name },
    });

    res.status(201).json(artist);
  } catch (error: any) {
    console.error('Create artist error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Artist already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all publishers
router.get('/publishers', async (_req, res) => {
  try {
    const publishers = await db.publisher.findMany();
    res.json(publishers);
  } catch (error) {
    console.error('Get publishers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all album categories
router.get('/album-categories', async (_req, res) => {
  try {
    const categories = await db.albumCategory.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Get album categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all content types
router.get('/content-types', async (_req, res) => {
  try {
    const types = await db.contentType.findMany();
    res.json(types);
  } catch (error) {
    console.error('Get content types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
