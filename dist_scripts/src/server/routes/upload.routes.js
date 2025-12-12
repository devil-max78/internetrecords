"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const storage_1 = require("../storage");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Get presigned URL for file upload
router.post('/presigned-url', async (req, res) => {
    try {
        const { fileType, fileName, releaseId } = req.body;
        const userId = req.user.id;
        if (!['AUDIO', 'ARTWORK'].includes(fileType)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }
        // Validate MP3 format for audio files
        if (fileType === 'AUDIO') {
            const fileExtension = fileName.toLowerCase().split('.').pop();
            if (fileExtension !== 'mp3') {
                return res.status(400).json({ error: 'Only MP3 files are allowed for audio uploads' });
            }
        }
        // Check if release exists and belongs to user
        const release = await db_1.db.release.findUnique({ where: { id: releaseId } });
        if (!release) {
            return res.status(404).json({ error: 'Release not found' });
        }
        if (release.userId !== userId) {
            return res.status(403).json({ error: 'You do not have access to this release' });
        }
        // Generate upload URL using Supabase Storage
        const { uploadUrl, filePath } = await (0, storage_1.generateUploadUrl)(fileName, fileType, releaseId);
        // Create file upload record
        const fileUpload = await db_1.db.fileUpload.create({
            data: {
                fileType,
                url: filePath,
                releaseId,
            },
        });
        // Update release with artwork URL if file type is ARTWORK
        if (fileType === 'ARTWORK') {
            await db_1.db.release.update({
                where: { id: releaseId },
                data: { artworkUrl: filePath },
            });
        }
        res.json({
            uploadUrl,
            fileUrl: filePath,
            fileUploadId: fileUpload.id,
        });
    }
    catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({
            error: 'Failed to generate upload URL',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
// Update track with audio URL
router.post('/track-audio', async (req, res) => {
    try {
        const { trackId, audioUrl } = req.body;
        const userId = req.user.id;
        console.log('Updating track audio:', { trackId, userId, audioUrl: audioUrl?.substring(0, 50) });
        const track = await db_1.db.track.findUnique({
            where: { id: trackId },
            include: { release: true },
        });
        console.log('Track found:', {
            trackId: track?.id,
            releaseId: track?.releaseId,
            releaseUserId: track?.release?.userId,
            currentUserId: userId
        });
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }
        if (!track.release) {
            console.error('Track release not loaded:', track);
            return res.status(500).json({ error: 'Track release data not available' });
        }
        if (track.release.userId !== userId) {
            console.error('User ID mismatch:', {
                trackReleaseUserId: track.release.userId,
                currentUserId: userId
            });
            return res.status(403).json({ error: 'You do not have access to this track' });
        }
        const updatedTrack = await db_1.db.track.update({
            where: { id: trackId },
            data: { audioUrl },
        });
        res.json(updatedTrack);
    }
    catch (error) {
        console.error('Error updating track audio:', error);
        res.status(500).json({
            error: 'Failed to update track audio',
            details: error.message
        });
    }
});
exports.default = router;
