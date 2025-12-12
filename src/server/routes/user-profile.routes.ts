import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /profile - Get current user's profile
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        legalName: true,
        mobile: true,
        address: true,
        entityName: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /profile - Update current user's profile
router.put('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, legalName, mobile, address, entityName } = req.body;

    // Validate input
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        legalName: legalName?.trim() || null,
        mobile: mobile?.trim() || null,
        address: address?.trim() || null,
        entityName: entityName?.trim() || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        legalName: true,
        mobile: true,
        address: true,
        entityName: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /profile/completeness - Check if profile is complete for agreement generation
router.get('/completeness', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        legalName: true,
        mobile: true,
        address: true,
        entityName: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check which fields are missing
    const missingFields: string[] = [];
    if (!user.name || user.name.trim() === '') missingFields.push('name');
    if (!user.legalName || user.legalName.trim() === '') missingFields.push('legalName');
    if (!user.mobile || user.mobile.trim() === '') missingFields.push('mobile');
    if (!user.address || user.address.trim() === '') missingFields.push('address');
    if (!user.entityName || user.entityName.trim() === '') missingFields.push('entityName');

    const isComplete = missingFields.length === 0;

    res.json({
      isComplete,
      missingFields,
      message: isComplete 
        ? 'Profile is complete' 
        : `Please complete your profile: ${missingFields.join(', ')}`
    });
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    res.status(500).json({ error: 'Failed to check profile completeness' });
  }
});

// Get user's effective label (custom or global default)
router.get('/label', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has custom label
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (user?.customLabel) {
      return res.json({ label: user.customLabel, isCustom: true });
    }

    // Return global default
    const globalLabel = await db.globalSettings.get('default_label');
    res.json({ label: globalLabel?.settingValue || 'Internet Records', isCustom: false });
  } catch (error: any) {
    console.error('Get user label error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's effective publisher (custom or global default)
router.get('/publisher', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has custom publisher
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (user?.customPublisher) {
      return res.json({ publisher: user.customPublisher, isCustom: true });
    }

    // Return global default
    const globalPublisher = await db.globalSettings.get('default_publisher');
    res.json({ publisher: globalPublisher?.settingValue || 'Internet Records', isCustom: false });
  } catch (error: any) {
    console.error('Get user publisher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request custom label
router.post('/request-label', async (req, res) => {
  try {
    const { labelName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!labelName || !labelName.trim()) {
      return res.status(400).json({ error: 'Label name is required' });
    }

    // Create user label request
    const userLabel = await db.userLabel.create({
      data: {
        userId,
        labelName: labelName.trim(),
      },
    });

    res.status(201).json(userLabel);
  } catch (error: any) {
    console.error('Request label error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You already have a label with this name' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request custom publisher
router.post('/request-publisher', async (req, res) => {
  try {
    const { publisherName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!publisherName || !publisherName.trim()) {
      return res.status(400).json({ error: 'Publisher name is required' });
    }

    // Create user publisher request
    const userPublisher = await db.userPublisher.create({
      data: {
        userId,
        publisherName: publisherName.trim(),
      },
    });

    res.status(201).json(userPublisher);
  } catch (error: any) {
    console.error('Request publisher error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You already have a publisher with this name' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set user's active custom label
router.post('/set-label', async (req, res) => {
  try {
    const { labelName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update user's custom label (null to use global default)
    const user = await db.user.update({
      where: { id: userId },
      data: { customLabel: labelName || null },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Set label error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set user's active custom publisher
router.post('/set-publisher', async (req, res) => {
  try {
    const { publisherName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update user's custom publisher (null to use global default)
    const user = await db.user.update({
      where: { id: userId },
      data: { customPublisher: publisherName || null },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Set publisher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's custom labels
router.get('/my-labels', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const labels = await db.userLabel.findMany({ where: { userId } });
    res.json(labels);
  } catch (error: any) {
    console.error('Get user labels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's custom publishers
router.get('/my-publishers', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const publishers = await db.userPublisher.findMany({ where: { userId } });
    res.json(publishers);
  } catch (error: any) {
    console.error('Get user publishers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
