import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const adminArtistProfileLinkingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/artist-profile-linking',
  component: AdminArtistProfileLinkingComponent,
});

function AdminArtistProfileLinkingComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['adminArtistProfileLinking'],
    queryFn: () => api.artistProfileLinking.getAllAdmin(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      api.artistProfileLinking.updateStatus(id, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArtistProfileLinking'] });
      setSelectedRequest(null);
      setStatus('');
      setAdminNotes('');
      toast.success('Request status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update request status');
    },
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !status) return;

    updateStatusMutation.mutate({
      id: selectedRequest.id,
      status,
      adminNotes: adminNotes.trim() || undefined,
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

  const getStatusCounts = () => {
    if (!requests) return { pending: 0, processing: 0, completed: 0, rejected: 0 };
    
    return {
      pending: requests.filter((r: any) => r.status === 'PENDING').length,
      processing: requests.filter((r: any) => r.status === 'PROCESSING').length,
      completed: requests.filter((r: any) => r.status === 'COMPLETED').length,
      rejected: requests.filter((r: any) => r.status === 'REJECTED').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-800">Artist Profile Linking Management</h1>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900">{counts.pending}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">Processing</h3>
          <p className="text-2xl font-bold text-blue-900">{counts.processing}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800">Completed</h3>
          <p className="text-2xl font-bold text-green-900">{counts.completed}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Rejected</h3>
          <p className="text-2xl font-bold text-red-900">{counts.rejected}</p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Requests</h2>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platforms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request: any) => {
                    const platforms = [];
                    if (request.instagramUrl) platforms.push('Instagram');
                    if (request.youtubeUrl) platforms.push('YouTube');
                    if (request.facebookUrl) platforms.push('Facebook');
                    if (request.spotifyUrl) platforms.push('Spotify');
                    if (request.appleMusicUrl) platforms.push('Apple Music');

                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.artistName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {platforms.join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setStatus(request.status);
                              setAdminNotes(request.adminNotes || '');
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No requests found</p>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Update Request Status</h3>

            <div className="mb-4 p-4 bg-gray-50 rounded space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Artist Name:</span> {selectedRequest.artistName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {selectedRequest.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Submitted:</span>{' '}
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
              
              {selectedRequest.isrcCode && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ISRC Code:</span> {selectedRequest.isrcCode}
                </p>
              )}

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Platform URLs:</p>
                <div className="ml-4 space-y-1">
                  {selectedRequest.instagramUrl && (
                    <p className="text-sm text-gray-600">
                      📷 Instagram:{' '}
                      <a
                        href={selectedRequest.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {selectedRequest.instagramUrl}
                      </a>
                    </p>
                  )}
                  {selectedRequest.youtubeUrl && (
                    <p className="text-sm text-gray-600">
                      ▶️ YouTube:{' '}
                      <a
                        href={selectedRequest.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {selectedRequest.youtubeUrl}
                      </a>
                    </p>
                  )}
                  {selectedRequest.facebookUrl && (
                    <p className="text-sm text-gray-600">
                      👥 Facebook:{' '}
                      <a
                        href={selectedRequest.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {selectedRequest.facebookUrl}
                      </a>
                    </p>
                  )}
                  {selectedRequest.spotifyUrl && (
                    <p className="text-sm text-gray-600">
                      🎵 Spotify:{' '}
                      <a
                        href={selectedRequest.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {selectedRequest.spotifyUrl}
                      </a>
                    </p>
                  )}
                  {selectedRequest.appleMusicUrl && (
                    <p className="text-sm text-gray-600">
                      🍎 Apple Music:{' '}
                      <a
                        href={selectedRequest.appleMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {selectedRequest.appleMusicUrl}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {selectedRequest.additionalNotes && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Additional Notes:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.additionalNotes}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add any notes or comments..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    setStatus('');
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
