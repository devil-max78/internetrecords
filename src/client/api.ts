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
};
