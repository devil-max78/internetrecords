"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// Simple REST API client
const API_URL = '/api'; // Proxied through Vite
// Helper function to make authenticated requests
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
}
// API methods
exports.api = {
    // Auth
    auth: {
        login: (email, password) => fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        signup: (email, password, name, role) => fetchAPI('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role }),
        }),
    },
    // Releases
    releases: {
        getAll: () => fetchAPI('/releases'),
        getById: (id) => fetchAPI(`/releases/${id}`),
        create: (data) => fetchAPI('/releases', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id, data) => fetchAPI(`/releases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        submitForReview: (id) => fetchAPI(`/releases/${id}/submit`, {
            method: 'POST',
        }),
        addTrack: (releaseId, data) => fetchAPI(`/releases/${releaseId}/tracks`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateTrack: (trackId, data) => fetchAPI(`/releases/tracks/${trackId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteTrack: (trackId) => fetchAPI(`/releases/tracks/${trackId}`, {
            method: 'DELETE',
        }),
    },
    // Upload
    upload: {
        getPresignedUrl: (data) => fetchAPI('/upload/presigned-url', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateTrackAudio: (data) => fetchAPI('/upload/track-audio', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    // Admin
    admin: {
        approveRelease: (id) => fetchAPI(`/admin/releases/${id}/approve`, {
            method: 'POST',
        }),
        rejectRelease: (id, rejectionReason, allowResubmission) => fetchAPI(`/admin/releases/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ rejectionReason, allowResubmission }),
        }),
        distributeRelease: (id) => fetchAPI(`/admin/releases/${id}/distribute`, {
            method: 'POST',
        }),
        getDownloadUrls: (id) => fetchAPI(`/admin/releases/${id}/downloads`),
        getMetadataJson: (id) => fetchAPI(`/admin/releases/${id}/metadata/json`),
        getMetadataCsv: (id) => fetchAPI(`/admin/releases/${id}/metadata/csv`),
        // Admin dropdown management
        createPublisher: (name) => fetchAPI('/admin/publishers', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        createAlbumCategory: (name) => fetchAPI('/admin/album-categories', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        createContentType: (name) => fetchAPI('/admin/content-types', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        createSubLabel: (name) => fetchAPI('/admin/sub-labels', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        // Delete endpoints
        deleteSubLabel: (id) => fetchAPI(`/admin/sub-labels/${id}`, {
            method: 'DELETE',
        }),
        deletePublisher: (id) => fetchAPI(`/admin/publishers/${id}`, {
            method: 'DELETE',
        }),
        deleteAlbumCategory: (id) => fetchAPI(`/admin/album-categories/${id}`, {
            method: 'DELETE',
        }),
        deleteContentType: (id) => fetchAPI(`/admin/content-types/${id}`, {
            method: 'DELETE',
        }),
        // User management
        getAllUsers: () => fetchAPI('/admin/users'),
        updateUserRole: (id, role) => fetchAPI(`/admin/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        }),
        deleteRelease: (id) => fetchAPI(`/admin/releases/${id}`, {
            method: 'DELETE',
        }),
        deleteTrack: (id) => fetchAPI(`/admin/tracks/${id}`, {
            method: 'DELETE',
        }),
    },
    // Metadata
    metadata: {
        getSubLabels: () => fetchAPI('/metadata/sub-labels'),
        createSubLabel: (name) => fetchAPI('/metadata/sub-labels', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        searchArtists: (query) => fetchAPI(`/metadata/artists/search?q=${encodeURIComponent(query)}`),
        getArtists: () => fetchAPI('/metadata/artists'),
        createArtist: (name) => fetchAPI('/metadata/artists', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        getPublishers: () => fetchAPI('/metadata/publishers'),
        getAlbumCategories: () => fetchAPI('/metadata/album-categories'),
        getContentTypes: () => fetchAPI('/metadata/content-types'),
    },
    // YouTube Claims
    youtubeClaims: {
        create: (data) => fetchAPI('/youtube-claims', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        getAll: () => fetchAPI('/youtube-claims'),
        getById: (id) => fetchAPI(`/youtube-claims/${id}`),
        // Admin endpoints
        getAllAdmin: () => fetchAPI('/admin/youtube-claims'),
        updateStatus: (id, status, notes) => fetchAPI(`/admin/youtube-claims/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, notes }),
        }),
    },
    // YouTube OAC Requests
    youtubeOac: {
        create: (data) => fetchAPI('/youtube-oac', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        getAll: () => fetchAPI('/youtube-oac'),
        getById: (id) => fetchAPI(`/youtube-oac/${id}`),
        // Admin endpoints
        getAllAdmin: () => fetchAPI('/admin/youtube-oac-requests'),
        updateStatus: (id, status, adminNotes) => fetchAPI(`/admin/youtube-oac-requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, adminNotes }),
        }),
    },
    // Social Media Linking Requests
    socialMediaLinking: {
        create: (data) => fetchAPI('/social-media-linking', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        getAll: () => fetchAPI('/social-media-linking'),
        // Admin endpoints
        getAllAdmin: () => fetchAPI('/admin/social-media-linking'),
        updateStatus: (id, status, adminNotes) => fetchAPI(`/admin/social-media-linking/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, adminNotes }),
        }),
    },
    // Label & Publisher Settings
    labelPublisher: {
        getGlobalDefaults: () => fetchAPI('/label-publisher/global-defaults'),
        getUserLabels: () => fetchAPI('/label-publisher/user-labels'),
        getUserPublishers: () => fetchAPI('/label-publisher/user-publishers'),
        addUserLabel: (labelName) => fetchAPI('/label-publisher/user-labels', {
            method: 'POST',
            body: JSON.stringify({ labelName }),
        }),
        addUserPublisher: (publisherName) => fetchAPI('/label-publisher/user-publishers', {
            method: 'POST',
            body: JSON.stringify({ publisherName }),
        }),
        deleteUserLabel: (id) => fetchAPI(`/label-publisher/user-labels/${id}`, {
            method: 'DELETE',
        }),
        deleteUserPublisher: (id) => fetchAPI(`/label-publisher/user-publishers/${id}`, {
            method: 'DELETE',
        }),
        getUserPreferences: () => fetchAPI('/label-publisher/user-preferences'),
        updateUserPreferences: (data) => fetchAPI('/label-publisher/user-preferences', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    },
    // Artist Profile Linking
    artistProfileLinking: {
        create: (data) => fetchAPI('/artist-profile-linking', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        getAll: () => fetchAPI('/artist-profile-linking'),
        // Admin endpoints
        getAllAdmin: () => fetchAPI('/artist-profile-linking/admin/all'),
        updateStatus: (id, status, adminNotes) => fetchAPI(`/artist-profile-linking/admin/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, adminNotes }),
        }),
    },
    // Custom Label Requests
    customLabels: {
        request: (name) => fetchAPI('/custom-labels', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        getAll: () => fetchAPI('/custom-labels'),
        approve: (id, adminNotes) => fetchAPI(`/custom-labels/${id}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ adminNotes }),
        }),
        reject: (id, adminNotes) => fetchAPI(`/custom-labels/${id}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ adminNotes }),
        }),
    },
};
