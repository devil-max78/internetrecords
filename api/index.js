// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');

// Import compiled routes
let authRoutes, releaseRoutes, uploadRoutes, adminRoutes, metadataRoutes;
let youtubeClaimRoutes, youtubeOacRoutes, socialMediaLinkingRoutes, labelPublisherRoutes;

try {
  authRoutes = require('../dist/server/routes/auth.routes').default;
  releaseRoutes = require('../dist/server/routes/release.routes').default;
  uploadRoutes = require('../dist/server/routes/upload.routes').default;
  adminRoutes = require('../dist/server/routes/admin.routes').default;
  metadataRoutes = require('../dist/server/routes/metadata.routes').default;
  youtubeClaimRoutes = require('../dist/server/routes/youtube-claim.routes').default;
  youtubeOacRoutes = require('../dist/server/routes/youtube-oac.routes').default;
  socialMediaLinkingRoutes = require('../dist/server/routes/social-media-linking.routes').default;
  labelPublisherRoutes = require('../dist/server/routes/label-publisher.routes').default;
} catch (error) {
  console.error('Error loading routes:', error);
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
if (authRoutes) app.use('/api/auth', authRoutes);
if (releaseRoutes) app.use('/api/releases', releaseRoutes);
if (uploadRoutes) app.use('/api/upload', uploadRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (metadataRoutes) app.use('/api/metadata', metadataRoutes);
if (youtubeClaimRoutes) app.use('/api/youtube-claims', youtubeClaimRoutes);
if (youtubeOacRoutes) app.use('/api/youtube-oac', youtubeOacRoutes);
if (socialMediaLinkingRoutes) app.use('/api/social-media-linking', socialMediaLinkingRoutes);
if (labelPublisherRoutes) app.use('/api/label-publisher', labelPublisherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vercel serverless function running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

module.exports = app;
