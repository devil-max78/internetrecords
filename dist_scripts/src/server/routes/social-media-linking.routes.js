"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
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
        const request = await db_1.db.socialMediaLinking.create({
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
    }
    catch (error) {
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
        const requests = await db_1.db.socialMediaLinking.findMany({
            where: { userId },
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Get social media linking requests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
