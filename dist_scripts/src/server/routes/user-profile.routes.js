"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Get user's effective label (custom or global default)
router.get('/label', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if user has custom label
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (user?.customLabel) {
            return res.json({ label: user.customLabel, isCustom: true });
        }
        // Return global default
        const globalLabel = await db_1.db.globalSettings.get('default_label');
        res.json({ label: globalLabel?.settingValue || 'Internet Records', isCustom: false });
    }
    catch (error) {
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
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (user?.customPublisher) {
            return res.json({ publisher: user.customPublisher, isCustom: true });
        }
        // Return global default
        const globalPublisher = await db_1.db.globalSettings.get('default_publisher');
        res.json({ publisher: globalPublisher?.settingValue || 'Internet Records', isCustom: false });
    }
    catch (error) {
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
        const userLabel = await db_1.db.userLabel.create({
            data: {
                userId,
                labelName: labelName.trim(),
            },
        });
        res.status(201).json(userLabel);
    }
    catch (error) {
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
        const userPublisher = await db_1.db.userPublisher.create({
            data: {
                userId,
                publisherName: publisherName.trim(),
            },
        });
        res.status(201).json(userPublisher);
    }
    catch (error) {
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
        const user = await db_1.db.user.update({
            where: { id: userId },
            data: { customLabel: labelName || null },
        });
        res.json(user);
    }
    catch (error) {
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
        const user = await db_1.db.user.update({
            where: { id: userId },
            data: { customPublisher: publisherName || null },
        });
        res.json(user);
    }
    catch (error) {
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
        const labels = await db_1.db.userLabel.findMany({ where: { userId } });
        res.json(labels);
    }
    catch (error) {
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
        const publishers = await db_1.db.userPublisher.findMany({ where: { userId } });
        res.json(publishers);
    }
    catch (error) {
        console.error('Get user publishers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
