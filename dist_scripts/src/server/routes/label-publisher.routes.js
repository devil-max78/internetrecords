"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const supabase_1 = require("../supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get global defaults
router.get('/global-defaults', auth_1.authMiddleware, async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('global_settings')
            .select('*')
            .in('setting_key', ['default_publisher', 'default_label']);
        if (error)
            throw error;
        const defaults = {
            defaultPublisher: data?.find((s) => s.setting_key === 'default_publisher')?.setting_value || 'Internet Records',
            defaultLabel: data?.find((s) => s.setting_key === 'default_label')?.setting_value || 'Internet Records'
        };
        res.json(defaults);
    }
    catch (error) {
        console.error('Error fetching global defaults:', error);
        res.status(500).json({ error: 'Failed to fetch global defaults' });
    }
});
// Get user's custom labels
router.get('/user-labels', auth_1.authMiddleware, async (req, res) => {
    try {
        const labels = await db_1.db.userLabel.findMany({
            where: { userId: req.user.id }
        });
        res.json(labels);
    }
    catch (error) {
        console.error('Error fetching user labels:', error);
        res.status(500).json({ error: 'Failed to fetch user labels' });
    }
});
// Get user's custom publishers
router.get('/user-publishers', auth_1.authMiddleware, async (req, res) => {
    try {
        const publishers = await db_1.db.userPublisher.findMany({
            where: { userId: req.user.id }
        });
        res.json(publishers);
    }
    catch (error) {
        console.error('Error fetching user publishers:', error);
        res.status(500).json({ error: 'Failed to fetch user publishers' });
    }
});
// Add user label
router.post('/user-labels', auth_1.authMiddleware, async (req, res) => {
    try {
        const { labelName } = req.body;
        if (!labelName || labelName.trim() === '') {
            return res.status(400).json({ error: 'Label name is required' });
        }
        const newLabel = await db_1.db.userLabel.create({
            data: {
                userId: req.user.id,
                labelName: labelName.trim()
            }
        });
        res.status(201).json(newLabel);
    }
    catch (error) {
        console.error('Error adding user label:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'This label already exists' });
        }
        res.status(500).json({ error: 'Failed to add user label' });
    }
});
// Add user publisher
router.post('/user-publishers', auth_1.authMiddleware, async (req, res) => {
    try {
        const { publisherName } = req.body;
        if (!publisherName || publisherName.trim() === '') {
            return res.status(400).json({ error: 'Publisher name is required' });
        }
        const newPublisher = await db_1.db.userPublisher.create({
            data: {
                userId: req.user.id,
                publisherName: publisherName.trim()
            }
        });
        res.status(201).json(newPublisher);
    }
    catch (error) {
        console.error('Error adding user publisher:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'This publisher already exists' });
        }
        res.status(500).json({ error: 'Failed to add user publisher' });
    }
});
// Delete user label
router.delete('/user-labels/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('user_labels')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);
        if (error)
            throw error;
        res.json({ message: 'Label deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user label:', error);
        res.status(500).json({ error: 'Failed to delete user label' });
    }
});
// Delete user publisher
router.delete('/user-publishers/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('user_publishers')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);
        if (error)
            throw error;
        res.json({ message: 'Publisher deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user publisher:', error);
        res.status(500).json({ error: 'Failed to delete user publisher' });
    }
});
// Get user's selected custom label/publisher
router.get('/user-preferences', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await db_1.db.user.findUnique({
            where: { id: req.user.id }
        });
        res.json({
            customLabel: user?.customLabel || null,
            customPublisher: user?.customPublisher || null
        });
    }
    catch (error) {
        console.error('Error fetching user preferences:', error);
        res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
});
// Update user's selected custom label/publisher
router.put('/user-preferences', auth_1.authMiddleware, async (req, res) => {
    try {
        const { customLabel, customPublisher } = req.body;
        const updated = await db_1.db.user.update({
            where: { id: req.user.id },
            data: {
                customLabel: customLabel || null,
                customPublisher: customPublisher || null
            }
        });
        res.json({
            customLabel: updated.customLabel,
            customPublisher: updated.customPublisher
        });
    }
    catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ error: 'Failed to update user preferences' });
    }
});
exports.default = router;
