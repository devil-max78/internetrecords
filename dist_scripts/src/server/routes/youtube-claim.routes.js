"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Submit a YouTube claim
router.post('/', async (req, res) => {
    try {
        const { releaseId, videoUrls } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!videoUrls || !videoUrls.trim()) {
            return res.status(400).json({ error: 'Video URLs are required' });
        }
        // Validate release belongs to user if releaseId provided
        if (releaseId) {
            const release = await db_1.db.release.findUnique({ where: { id: releaseId } });
            if (!release || release.userId !== userId) {
                return res.status(403).json({ error: 'Release not found or access denied' });
            }
        }
        const claim = await db_1.db.youtubeClaim.create({
            data: {
                userId,
                releaseId: releaseId || null,
                videoUrls: videoUrls.trim(),
                status: 'PENDING',
            },
        });
        res.status(201).json(claim);
    }
    catch (error) {
        console.error('Create YouTube claim error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user's YouTube claims
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const claims = await db_1.db.youtubeClaim.findMany({
            where: { userId },
        });
        res.json(claims);
    }
    catch (error) {
        console.error('Get YouTube claims error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a specific YouTube claim
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const claim = await db_1.db.youtubeClaim.findUnique({ where: { id } });
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        if (claim.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(claim);
    }
    catch (error) {
        console.error('Get YouTube claim error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
