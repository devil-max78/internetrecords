import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const socialMediaLinkingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/social-media-linking',
  component: SocialMediaLinkingComponent,
});

function SocialMediaLinkingComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [platforms, setPlatforms] = useState('');
  const [facebookPageUrl, setFacebookPageUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isrc, setIsrc] = useState('');

  // Fetch user's requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['socialMediaLinkingRequests'],
    queryFn: () => api.socialMediaLinking.getAll(),
  });

  // Submit request mutation
  const submitRequestMutation = useMutation({
    mutationFn: (data: any) => api.socialMediaLinking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialMediaLinkingRequests'] });
      setEmail('');
      setLabel('');
      setPlatforms('');
      setFacebookPageUrl('');
      setInstagramHandle('');
      setIsrc('');
      toast.success('Social media linking request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !label || !platforms || !isrc) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (platforms === 'facebook' && !facebookPageUrl) {
      toast.error('Please enter Facebook Page URL');
      return;
    }

    if (platforms === 'instagram' && !instagramHandle) {
      toast.error('Please enter Instagram Handle');
      return;
    }

    if (platforms === 'both' && (!facebookPageUrl || !instagramHandle)) {
      toast.error('Please enter both Facebook and Instagram details');
      return;
    }

    submitRequestMutation.mutate({
      email,
      label,
      platforms,
      facebookPageUrl: platforms !== 'instagram' ? facebookPageUrl : undefined,
      instagramHandle: platforms !== 'facebook' ? instagramHandle : undefined,
      isrc,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to request social media linking.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-indigo-800">Facebook & Instagram Linking</h1>
        <p className="text-gray-600 mt-1">Request to link your social media profiles to your music</p>
      </div>

      {/* Submit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Facebook & Instagram Linking</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Your label name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Platforms *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="facebook"
                  checked={platforms === 'facebook'}
                  onChange={(e) => setPlatforms(e.target.value)}
                  className="mr-2"
                />
                <span>Facebook Page</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="instagram"
                  checked={platforms === 'instagram'}
                  onChange={(e) => setPlatforms(e.target.value)}
                  className="mr-2"
                />
                <span>Instagram Handle</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={platforms === 'both'}
                  onChange={(e) => setPlatforms(e.target.value)}
                  className="mr-2"
                />
                <span>Both</span>
              </label>
            </div>
          </div>

          {(platforms === 'facebook' || platforms === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={facebookPageUrl}
                onChange={(e) => setFacebookPageUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {(platforms === 'instagram' || platforms === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="Enter Instagram profile/page handle or URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ISRC *
            </label>
            <input
              type="text"
              value={isrc}
              onChange={(e) => setIsrc(e.target.value)}
              placeholder="International Standard Recording Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitRequestMutation.isPending}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitRequestMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Request History</h2>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{request.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Email:</span> {request.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Platforms:</span> {request.platforms}
                    </p>
                    {request.facebookPageUrl && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Facebook:</span>{' '}
                        <a href={request.facebookPageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {request.facebookPageUrl}
                        </a>
                      </p>
                    )}
                    {request.instagramHandle && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Instagram:</span> {request.instagramHandle}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ISRC:</span> {request.isrc}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </p>
                    {request.adminNotes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No requests submitted yet</p>
        )}
      </div>
    </div>
  );
}
