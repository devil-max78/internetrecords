// Simple REST API client
const API_URL = '/api'; // Proxied through Vite

// Helper function to make authenticated requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
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
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    signup: (email: string, password: string, name: string, role: string) =>
      fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      }),
  },
  
  // Releases
  releases: {
    getAll: () => fetchAPI('/releases'),
    
    getById: (id: string) => fetchAPI(`/releases/${id}`),
    
    create: (data: any) =>
      fetchAPI('/releases', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) =>
      fetchAPI(`/releases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    submitForReview: (id: string) =>
      fetchAPI(`/releases/${id}/submit`, {
        method: 'POST',
      }),
    
    addTrack: (releaseId: string, data: any) =>
      fetchAPI(`/releases/${releaseId}/tracks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    updateTrack: (trackId: string, data: any) =>
      fetchAPI(`/releases/tracks/${trackId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    deleteTrack: (trackId: string) =>
      fetchAPI(`/releases/tracks/${trackId}`, {
        method: 'DELETE',
      }),
  },
  
  // Upload
  upload: {
    getPresignedUrl: (data: { fileType: string; fileName: string; releaseId: string }) =>
      fetchAPI('/upload/presigned-url', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    updateTrackAudio: (data: { trackId: string; audioUrl: string }) =>
      fetchAPI('/upload/track-audio', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  
  // Admin
  admin: {
    approveRelease: (id: string) =>
      fetchAPI(`/admin/releases/${id}/approve`, {
        method: 'POST',
      }),
    
    rejectRelease: (id: string) =>
      fetchAPI(`/admin/releases/${id}/reject`, {
        method: 'POST',
      }),
    
    distributeRelease: (id: string) =>
      fetchAPI(`/admin/releases/${id}/distribute`, {
        method: 'POST',
      }),
    
    getDownloadUrls: (id: string) =>
      fetchAPI(`/admin/releases/${id}/downloads`),
    
    getMetadataJson: (id: string) =>
      fetchAPI(`/admin/releases/${id}/metadata/json`),
    
    getMetadataCsv: (id: string) =>
      fetchAPI(`/admin/releases/${id}/metadata/csv`),
    
    // Admin dropdown management
    createPublisher: (name: string) =>
      fetchAPI('/admin/publishers', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    
    createAlbumCategory: (name: string) =>
      fetchAPI('/admin/album-categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    
    createContentType: (name: string) =>
      fetchAPI('/admin/content-types', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    
    createSubLabel: (name: string) =>
      fetchAPI('/admin/sub-labels', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    
    // Delete endpoints
    deleteSubLabel: (id: string) =>
      fetchAPI(`/admin/sub-labels/${id}`, {
        method: 'DELETE',
      }),
    
    deletePublisher: (id: string) =>
      fetchAPI(`/admin/publishers/${id}`, {
        method: 'DELETE',
      }),
    
    deleteAlbumCategory: (id: string) =>
      fetchAPI(`/admin/album-categories/${id}`, {
        method: 'DELETE',
      }),
    
    deleteContentType: (id: string) =>
      fetchAPI(`/admin/content-types/${id}`, {
        method: 'DELETE',
      }),
    
    // User management
    getAllUsers: () => fetchAPI('/admin/users'),
    
    updateUserRole: (id: string, role: string) =>
      fetchAPI(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    
    deleteRelease: (id: string) =>
      fetchAPI(`/admin/releases/${id}`, {
        method: 'DELETE',
      }),
    
    deleteTrack: (id: string) =>
      fetchAPI(`/admin/tracks/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Metadata
  metadata: {
    getSubLabels: () => fetchAPI('/metadata/sub-labels'),
    
    createSubLabel: (name: string) =>
      fetchAPI('/metadata/sub-labels', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    
    searchArtists: (query: string) =>
      fetchAPI(`/metadata/artists/search?q=${encodeURIComponent(query)}`),
    
    getArtists: () => fetchAPI('/metadata/artists'),
    
    createArtist: (name: string) =>
      fetchAPI('/metadata/artists', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    
    getPublishers: () => fetchAPI('/metadata/publishers'),
    
    getAlbumCategories: () => fetchAPI('/metadata/album-categories'),
    
    getContentTypes: () => fetchAPI('/metadata/content-types'),
  },

  // YouTube Claims
  youtubeClaims: {
    create: (data: { releaseId?: string; videoUrls: string }) =>
      fetchAPI('/youtube-claims', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getAll: () => fetchAPI('/youtube-claims'),
    
    getById: (id: string) => fetchAPI(`/youtube-claims/${id}`),
    
    // Admin endpoints
    getAllAdmin: () => fetchAPI('/admin/youtube-claims'),
    
    updateStatus: (id: string, status: string, notes?: string) =>
      fetchAPI(`/admin/youtube-claims/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
  },

  // YouTube OAC Requests
  youtubeOac: {
    create: (data: { channelLink: string; legalName: string; channelName: string }) =>
      fetchAPI('/youtube-oac', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getAll: () => fetchAPI('/youtube-oac'),
    
    getById: (id: string) => fetchAPI(`/youtube-oac/${id}`),
    
    // Admin endpoints
    getAllAdmin: () => fetchAPI('/admin/youtube-oac-requests'),
    
    updateStatus: (id: string, status: string, adminNotes?: string) =>
      fetchAPI(`/admin/youtube-oac-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      }),
  },

  // Social Media Linking Requests
  socialMediaLinking: {
    create: (data: { 
      email: string; 
      label: string; 
      platforms: string; 
      facebookPageUrl?: string; 
      instagramHandle?: string; 
      isrc: string 
    }) =>
      fetchAPI('/social-media-linking', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getAll: () => fetchAPI('/social-media-linking'),
    
    // Admin endpoints
    getAllAdmin: () => fetchAPI('/admin/social-media-linking'),
    
    updateStatus: (id: string, status: string, adminNotes?: string) =>
      fetchAPI(`/admin/social-media-linking/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      }),
  },

  // Label & Publisher Settings
  labelPublisher: {
    getGlobalDefaults: () => fetchAPI('/label-publisher/global-defaults'),
    
    getUserLabels: () => fetchAPI('/label-publisher/user-labels'),
    
    getUserPublishers: () => fetchAPI('/label-publisher/user-publishers'),
    
    addUserLabel: (labelName: string) =>
      fetchAPI('/label-publisher/user-labels', {
        method: 'POST',
        body: JSON.stringify({ labelName }),
      }),
    
    addUserPublisher: (publisherName: string) =>
      fetchAPI('/label-publisher/user-publishers', {
        method: 'POST',
        body: JSON.stringify({ publisherName }),
      }),
    
    deleteUserLabel: (id: string) =>
      fetchAPI(`/label-publisher/user-labels/${id}`, {
        method: 'DELETE',
      }),
    
    deleteUserPublisher: (id: string) =>
      fetchAPI(`/label-publisher/user-publishers/${id}`, {
        method: 'DELETE',
      }),
    
    getUserPreferences: () => fetchAPI('/label-publisher/user-preferences'),
    
    updateUserPreferences: (data: { customLabel: string | null; customPublisher: string | null }) =>
      fetchAPI('/label-publisher/user-preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
