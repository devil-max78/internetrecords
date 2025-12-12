"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const storage_1 = require("./storage");
const auth_1 = require("./auth");
// Import REST routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const release_routes_1 = __importDefault(require("./routes/release.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const metadata_routes_1 = __importDefault(require("./routes/metadata.routes"));
const youtube_claim_routes_1 = __importDefault(require("./routes/youtube-claim.routes"));
const youtube_oac_routes_1 = __importDefault(require("./routes/youtube-oac.routes"));
const social_media_linking_routes_1 = __importDefault(require("./routes/social-media-linking.routes"));
const label_publisher_routes_1 = __importDefault(require("./routes/label-publisher.routes"));
const artist_profile_linking_routes_1 = __importDefault(require("./routes/artist-profile-linking.routes"));
const custom_labels_routes_1 = __importDefault(require("./routes/custom-labels.routes"));
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('      Body:', JSON.stringify(req.body, null, 2));
    }
    if (req.headers.authorization) {
        console.log('      Auth: Bearer token present');
    }
    else {
        console.log('      Auth: No token provided');
    }
    // Capture response status
    const originalSend = res.send;
    res.send = function (body) {
        console.log(`[API] Response ${res.statusCode} for ${req.method} ${req.url}`);
        return originalSend.call(this, body);
    };
    next();
});
// Serve static files from the client build
const clientPath = path_1.default.join(__dirname, '..', 'client');
app.use(express_1.default.static(clientPath));
// REST API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/releases', release_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/metadata', metadata_routes_1.default);
app.use('/api/youtube-claims', youtube_claim_routes_1.default);
app.use('/api/youtube-oac', youtube_oac_routes_1.default);
app.use('/api/social-media-linking', social_media_linking_routes_1.default);
app.use('/api/label-publisher', label_publisher_routes_1.default);
app.use('/api/artist-profile-linking', artist_profile_linking_routes_1.default);
app.use('/api/custom-labels', custom_labels_routes_1.default);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
// Serve index.html for all other routes (SPA support)
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(clientPath, 'index.html'));
});
// Start server
const startServer = async () => {
    try {
        // Initialize Supabase Storage
        try {
            await (0, storage_1.initializeStorage)();
            console.log('Supabase Storage initialized successfully');
        }
        catch (error) {
            console.warn('Warning: Storage initialization failed. File uploads may not work.');
            console.error(error);
        }
        // Create initial admin user (optional for development)
        try {
            await (0, auth_1.createInitialAdmin)();
            console.log('Initial admin user created or verified');
        }
        catch (error) {
            console.warn('Warning: Could not create initial admin user. Database might not be available.');
        }
        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Client available at http://localhost:5173`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGINT', async () => {
    try {
        await db_1.db.$disconnect();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error disconnecting from database:', error);
    }
    process.exit(0);
});
process.on('SIGTERM', async () => {
    try {
        await db_1.db.$disconnect();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error disconnecting from database:', error);
    }
    process.exit(0);
});
// Start the server (only if not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
    startServer();
}
// Export the Express app for Vercel serverless
exports.default = app;
