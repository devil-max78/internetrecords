import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const youtubeOacRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/youtube-oac',
  component: YoutubeOacComponent,
});

function YoutubeOacComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [channelLink, setChannelLink] = useState('');
  const [legalName, setLegalName] = useState('');
  const [channelName, setChannelName] = useState('');

  // Fetch user's releases to check eligibility
  const { data: releases } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.releases.getAll(),
  });

  // Fetch user's OAC requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['youtubeOacRequests'],
    queryFn: () => api.youtubeOac.getAll(),
  });

  // Submit request mutation
  const submitRequestMutation = useMutation({
    mutationFn: (data: { channelLink: string; legalName: string; channelName: string }) =>
      api.youtubeOac.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubeOacRequests'] });
      setChannelLink('');
      setLegalName('');
      setChannelName('');
      toast.success('YouTube OAC request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelLink.trim() || !legalName.trim() || !channelName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitRequestMutation.mutate({
      channelLink: channelLink.trim(),
      legalName: legalName.trim(),
      channelName: channelName.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const releaseCount = releases?.length || 0;
  const isEligible = releaseCount >= 3;
  const hasPendingRequest = requests?.some((r: any) => r.status === 'PENDING');

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to request YouTube OAC.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">YouTube Official Artist Channel (OAC)</h1>
          <p className="text-gray-600 mt-1">Request verification for your YouTube channel</p>
        </div>
      </div>

      {/* Eligibility Notice */}
      <div className={`p-4 rounded-lg ${isEligible ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isEligible ? (
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${isEligible ? 'text-green-800' : 'text-yellow-800'}`}>
              {isEligible ? 'You are eligible!' : 'Eligibility Requirement'}
            </h3>
            <div className={`mt-2 text-sm ${isEligible ? 'text-green-700' : 'text-yellow-700'}`}>
              <p>
                You have <strong>{releaseCount}</strong> song{releaseCount !== 1 ? 's' : ''} distributed through our platform.
                {!isEligible && ` You need at least 3 songs to request YouTube OAC.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      {isEligible && !hasPendingRequest && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Request YouTube OAC</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Channel Link *
              </label>
              <input
                type="url"
                value={channelLink}
                onChange={(e) => setChannelLink(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your YouTube channel URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Legal Name *
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Your legal name or company name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                As it appears on official documents
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Name *
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Your YouTube channel name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                The name displayed on your YouTube channel
              </p>
            </div>

            <button
              type="submit"
              disabled={submitRequestMutation.isPending}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {hasPendingRequest && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            You already have a pending OAC request. Please wait for admin review.
          </p>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Request History</h2>

        {requestsLoading ? (
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
                    <h3 className="font-medium text-gray-900">{request.channelName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Legal Name:</span> {request.legalName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Channel:</span>{' '}
                      <a
                        href={request.channelLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {request.channelLink}
                      </a>
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
