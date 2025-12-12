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

    rejectRelease: (id: string, rejectionReason: string, allowResubmission: boolean) =>
      fetchAPI(`/admin/releases/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason, allowResubmission }),
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

    getAllSubLabels: () => fetchAPI('/admin/sub-labels'),

    createSubLabel: (name: string, userId?: string) => {
      const payload: any = { 
        name,
        isGlobal: !userId, // If userId is provided, it's not global
      };
      
      // Only include userId if it's actually provided (not undefined)
      if (userId) {
        payload.userId = userId;
      }
      
      return fetchAPI('/admin/sub-labels', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

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

    deleteUser: (id: string) =>
      fetchAPI(`/admin/users/${id}`, {
        method: 'DELETE',
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

  // Artist Profile Linking
  artistProfileLinking: {
    create: (data: {
      artistName: string;
      email: string;
      instagramUrl?: string;
      youtubeUrl?: string;
      facebookUrl?: string;
      spotifyUrl?: string;
      appleMusicUrl?: string;
      isrcCode?: string;
      additionalNotes?: string;
    }) =>
      fetchAPI('/artist-profile-linking', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getAll: () => fetchAPI('/artist-profile-linking'),

    // Admin endpoints
    getAllAdmin: () => fetchAPI('/artist-profile-linking/admin/all'),

    updateStatus: (id: string, status: string, adminNotes?: string) =>
      fetchAPI(`/artist-profile-linking/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      }),
  },

  // Custom Label Requests
  customLabels: {
    request: (name: string) =>
      fetchAPI('/custom-labels', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),

    getAll: () => fetchAPI('/custom-labels'),

    approve: (id: string, adminNotes?: string) =>
      fetchAPI(`/custom-labels/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes }),
      }),

    reject: (id: string, adminNotes?: string) =>
      fetchAPI(`/custom-labels/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes }),
      }),
  },

  // Agreement System
  agreement: {
    /**
     * Generate a new agreement PDF for the authenticated user
     * @returns Promise with pdfUrl and agreementId
     */
    generate: (): Promise<{ pdfUrl: string; agreementId: string }> =>
      fetchAPI('/agreement/generate', {
        method: 'POST',
      }),

    /**
     * Submit agreement request after user confirms email was sent
     * @param agreementId - The ID of the agreement to submit
     * @returns Promise with success status and requestId
     */
    proceed: (agreementId: string): Promise<{ success: boolean; requestId: string }> =>
      fetchAPI('/agreement/proceed', {
        method: 'POST',
        body: JSON.stringify({ agreementId }),
      }),

    /**
     * Get the status of the user's latest agreement request
     * @returns Promise with status, timestamps, and pdfUrl
     */
    getStatus: (): Promise<{
      status: 'pending' | 'verified' | 'rejected';
      createdAt: string;
      updatedAt: string;
      pdfUrl: string | null;
    } | { agreement: null }> =>
      fetchAPI('/agreement/status'),

    /**
     * Download agreement PDF as a blob
     * @param id - The agreement ID
     * @returns Promise that resolves when download starts
     */
    download: async (id: string): Promise<void> => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/agreement/download/${id}`, {
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreement_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },

    // Admin endpoints
    /**
     * Get all agreement requests (admin only)
     * @returns Promise with array of agreement requests
     */
    getAllAgreements: (): Promise<{
      requests: Array<{
        id: string;
        userId: string;
        pdfPath: string;
        pdfHash: string;
        signedName: string;
        emailSent: boolean;
        status: 'pending' | 'verified' | 'rejected';
        createdAt: string;
        updatedAt: string;
      }>;
    }> =>
      fetchAPI('/agreement/admin/agreements'),

    /**
     * Update agreement status (admin only)
     * @param id - The agreement ID
     * @param status - New status value
     * @param notes - Optional admin notes
     * @returns Promise with success status
     */
    updateAgreementStatus: (
      id: string,
      status: 'pending' | 'verified' | 'rejected',
      notes?: string
    ): Promise<{ success: boolean }> =>
      fetchAPI(`/agreement/admin/agreement/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
      }),
  },

  // User Profile
  profile: {
    /**
     * Get current user's profile
     * @returns Promise with user profile data
     */
    getProfile: (): Promise<{
      id: string;
      email: string;
      name: string;
      role: string;
      legalName: string | null;
      mobile: string | null;
      address: string | null;
      entityName: string | null;
      createdAt: string;
      updatedAt: string;
    }> => fetchAPI('/user-profile'),

    /**
     * Update current user's profile
     * @param data - Profile data to update
     * @returns Promise with updated user profile
     */
    updateProfile: (data: {
      name: string;
      legalName?: string;
      mobile?: string;
      address?: string;
      entityName?: string;
    }): Promise<{
      id: string;
      email: string;
      name: string;
      role: string;
      legalName: string | null;
      mobile: string | null;
      address: string | null;
      entityName: string | null;
      createdAt: string;
      updatedAt: string;
    }> =>
      fetchAPI('/user-profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /**
     * Check if profile is complete for agreement generation
     * @returns Promise with completeness status
     */
    checkCompleteness: (): Promise<{
      isComplete: boolean;
      missingFields: string[];
      message: string;
    }> => fetchAPI('/user-profile/completeness'),
  },
};
