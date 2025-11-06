import express from 'express';
import cors from 'cors';
import { db } from './db';
import { initializeStorage } from './storage';
import { createInitialAdmin } from './auth';

// Import REST routes
import authRoutes from './routes/auth.routes';
import releaseRoutes from './routes/release.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import metadataRoutes from './routes/metadata.routes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/metadata', metadataRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize Supabase Storage
    try {
      await initializeStorage();
      console.log('Supabase Storage initialized successfully');
    } catch (error) {
      console.warn('Warning: Storage initialization failed. File uploads may not work.');
      console.error(error);
    }

    // Create initial admin user (optional for development)
    try {
      await createInitialAdmin();
      console.log('Initial admin user created or verified');
    } catch (error) {
      console.warn('Warning: Could not create initial admin user. Database might not be available.');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Client available at http://localhost:5173`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await db.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  try {
    await db.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
  process.exit(0);
});

// Start the server
startServer();