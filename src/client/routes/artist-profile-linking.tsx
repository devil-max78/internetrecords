import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const artistProfileLinkingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist-profile-linking',
  component: ArtistProfileLinkingComponent,
});

function ArtistProfileLinkingComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [artistName, setArtistName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [isrcCode, setIsrcCode] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['artistProfileLinkingRequests'],
    queryFn: () => api.artistProfileLinking.getAll(),
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.artistProfileLinking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistProfileLinkingRequests'] });
      // Reset form
      setArtistName('');
      setInstagramUrl('');
      setYoutubeUrl('');
      setFacebookUrl('');
      setSpotifyUrl('');
      setAppleMusicUrl('');
      setIsrcCode('');
      setAdditionalNotes('');
      toast.success('Profile linking request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!artistName.trim()) {
      toast.error('Artist name is required');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    // At least one platform URL must be provided
    if (!instagramUrl && !youtubeUrl && !facebookUrl && !spotifyUrl && !appleMusicUrl) {
      toast.error('Please provide at least one platform URL');
      return;
    }

    submitMutation.mutate({
      artistName: artistName.trim(),
      email: email.trim(),
      instagramUrl: instagramUrl.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
      facebookUrl: facebookUrl.trim() || null,
      spotifyUrl: spotifyUrl.trim() || null,
      appleMusicUrl: appleMusicUrl.trim() || null,
      isrcCode: isrcCode.trim() || null,
      additionalNotes: additionalNotes.trim() || null,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Artist Profile Linking</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">What is Profile Linking?</h2>
        <p className="text-sm text-blue-800 mb-2">
          Link your artist profiles across major streaming and social media platforms to ensure your music reaches the right audience.
        </p>
        <p className="text-sm text-blue-700">
          We'll verify and connect your profiles on Instagram, YouTube, Facebook, Spotify, and Apple Music.
        </p>
      </div>

      {/* Submit Request Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Submit Linking Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your artist name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Platform URLs</h3>
            <p className="text-sm text-gray-600 mb-4">Provide at least one platform URL</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://instagram.com/yourartist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://youtube.com/@yourartist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://facebook.com/yourartist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spotify Artist URL
                </label>
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apple Music Artist URL
                </label>
                <input
                  type="url"
                  value={appleMusicUrl}
                  onChange={(e) => setAppleMusicUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://music.apple.com/artist/..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ISRC Code (Optional)
            </label>
            <input
              type="text"
              value={isrcCode}
              onChange={(e) => setIsrcCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="USRC17607839"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Any additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Previous Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Requests</h2>
        
        {isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <div key={request.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{request.artistName}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  {request.instagramUrl && <p>📷 Instagram: {request.instagramUrl}</p>}
                  {request.youtubeUrl && <p>▶️ YouTube: {request.youtubeUrl}</p>}
                  {request.facebookUrl && <p>👥 Facebook: {request.facebookUrl}</p>}
                  {request.spotifyUrl && <p>🎵 Spotify: {request.spotifyUrl}</p>}
                  {request.appleMusicUrl && <p>🍎 Apple Music: {request.appleMusicUrl}</p>}
                </div>

                {request.adminNotes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                    <p className="text-sm text-gray-600">{request.adminNotes}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No requests yet. Submit your first request above!</p>
        )}
      </div>
    </div>
  );
}
