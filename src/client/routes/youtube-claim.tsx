import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const youtubeClaimRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/youtube-claim',
  component: YoutubeClaimComponent,
});

function YoutubeClaimComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [videoUrls, setVideoUrls] = useState('');
  const [selectedReleaseId, setSelectedReleaseId] = useState('');

  // Fetch user's releases
  const { data: releases } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.releases.getAll(),
  });

  // Fetch user's YouTube claims history
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['youtubeClaims'],
    queryFn: () => api.youtubeClaims.getAll(),
  });

  // Submit claim mutation
  const submitClaimMutation = useMutation({
    mutationFn: (data: { releaseId?: string; videoUrls: string }) =>
      api.youtubeClaims.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubeClaims'] });
      setVideoUrls('');
      setSelectedReleaseId('');
      toast.success('YouTube claim submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit claim');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrls.trim()) {
      toast.error('Please enter at least one video URL');
      return;
    }

    submitClaimMutation.mutate({
      releaseId: selectedReleaseId || undefined,
      videoUrls: videoUrls.trim(),
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
        <p className="text-gray-600">Please log in to submit YouTube claims.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">YouTube Claim Release</h1>
          <p className="text-gray-600 mt-1">Submit YouTube video URLs for content claiming</p>
        </div>
      </div>

      {/* Submit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">YouTube Claim Release</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Release (Optional)
            </label>
            <select
              value={selectedReleaseId}
              onChange={(e) => setSelectedReleaseId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- No release selected --</option>
              {releases?.map((release: any) => (
                <option key={release.id} value={release.id}>
                  {release.title}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Link this claim to one of your releases (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL of the Video to Release Claim (Use comma for multiple links) *
            </label>
            <textarea
              value={videoUrls}
              onChange={(e) => setVideoUrls(e.target.value)}
              placeholder="https://youtube.com/..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter one or more YouTube video URLs separated by commas
            </p>
          </div>

          <button
            type="submit"
            disabled={submitClaimMutation.isPending}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitClaimMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">History</h2>

        {claimsLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : claims && claims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    YouTube Video URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted on
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim: any, index: number) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-md truncate">
                        {claim.videoUrls.split(',').map((url: string, i: number) => (
                          <div key={i} className="mb-1">
                            <a
                              href={url.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {url.trim()}
                            </a>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(claim.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                      {claim.notes && (
                        <p className="text-xs text-gray-500 mt-1">{claim.notes}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No claims submitted yet</p>
        )}
      </div>
    </div>
  );
}
