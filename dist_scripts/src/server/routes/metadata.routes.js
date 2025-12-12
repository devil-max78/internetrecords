"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Get all sub-labels (global, available to all users)
// Get all sub-labels (global, available to all users)
router.get('/sub-labels', async (req, res) => {
    try {
        const userId = req.user?.id;
        const subLabels = await db_1.db.subLabel.findMany({
            where: {
                OR: [
                    { user_id: null },
                    ...(userId ? [{ user_id: userId }] : [])
                ]
            }
        });
        res.json(subLabels);
    }
    catch (error) {
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
        const artists = await db_1.db.artist.findByName(q);
        res.json(artists);
    }
    catch (error) {
        console.error('Search artists error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all artists
router.get('/artists', async (_req, res) => {
    try {
        const artists = await db_1.db.artist.findMany();
        res.json(artists);
    }
    catch (error) {
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
        const artist = await db_1.db.artist.create({
            data: { name },
        });
        res.status(201).json(artist);
    }
    catch (error) {
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
        const publishers = await db_1.db.publisher.findMany();
        res.json(publishers);
    }
    catch (error) {
        console.error('Get publishers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all album categories
router.get('/album-categories', async (_req, res) => {
    try {
        const categories = await db_1.db.albumCategory.findMany();
        res.json(categories);
    }
    catch (error) {
        console.error('Get album categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all content types
router.get('/content-types', async (_req, res) => {
    try {
        const types = await db_1.db.contentType.findMany();
        res.json(types);
    }
    catch (error) {
        console.error('Get content types error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
