import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const adminAgreementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/agreements',
  component: AdminAgreementsComponent,
});

interface AgreementRequest {
  id: string;
  userId: string;
  pdfPath: string;
  pdfHash: string;
  signedName: string;
  emailSent: boolean;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected';
type SortField = 'createdAt' | 'updatedAt' | 'status';
type SortOrder = 'asc' | 'desc';

function AdminAgreementsComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AgreementRequest | null>(null);
  const [newStatus, setNewStatus] = useState<'verified' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch all agreement requests
  const { data: agreementsData, isLoading } = useQuery({
    queryKey: ['admin-agreements'],
    queryFn: () => api.agreement.getAllAgreements(),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: 'pending' | 'verified' | 'rejected'; notes?: string }) =>
      api.agreement.updateAgreementStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agreements'] });
      setShowConfirmDialog(false);
      setSelectedRequest(null);
      setNewStatus(null);
      setAdminNotes('');
      toast.success('Agreement status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update agreement status');
    },
  });

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const requests: AgreementRequest[] = agreementsData?.requests || [];

  // Filter requests by status
  const filteredRequests = requests.filter((request) => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Convert dates to timestamps for comparison
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleStatusChange = (request: AgreementRequest, status: 'verified' | 'rejected') => {
    setSelectedRequest(request);
    setNewStatus(status);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = () => {
    if (!selectedRequest || !newStatus) return;

    updateStatusMutation.mutate({
      id: selectedRequest.id,
      status: newStatus,
      notes: adminNotes.trim() || undefined,
    });
  };

  const handleViewPDF = async (request: AgreementRequest) => {
    try {
      // Use the download endpoint to view PDF
      const response = await fetch(`/api/agreement/download/${request.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error: any) {
      toast.error(error.message || 'Failed to view PDF');
    }
  };

  const getStatusBadge = (status: 'pending' | 'verified' | 'rejected') => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const text = {
      pending: 'Pending',
      verified: 'Verified',
      rejected: 'Rejected',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {text[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-800">Agreement Requests</h1>
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Back to Admin
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {/* Filters and Sort Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {sortedRequests.length} of {requests.length} agreement requests
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading agreement requests...</p>
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-gray-600">No agreement requests found</p>
            </div>
          ) : (
            /* Agreements Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signed Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.signedName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {request.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.emailSent
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {request.emailSent ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPDF(request)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View PDF"
                          >
                            View PDF
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <span className="text-gray-300">|</span>
                              <select
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === 'verified' || value === 'rejected') {
                                    handleStatusChange(request, value);
                                  }
                                  e.target.value = ''; // Reset dropdown
                                }}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Change Status
                                </option>
                                <option value="verified">Verify</option>
                                <option value="rejected">Reject</option>
                              </select>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedRequest && newStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Status Change
            </h3>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to change the status of this agreement to{' '}
                <strong className="capitalize">{newStatus}</strong>?
              </p>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <p>
                  <strong>Signed Name:</strong> {selectedRequest.signedName}
                </p>
                <p>
                  <strong>Current Status:</strong>{' '}
                  <span className="capitalize">{selectedRequest.status}</span>
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedRequest(null);
                  setNewStatus(null);
                  setAdminNotes('');
                }}
                disabled={updateStatusMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={updateStatusMutation.isPending}
                className={`flex-1 px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                  newStatus === 'verified'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
