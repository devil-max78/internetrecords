import { useState, useEffect } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { rootRoute } from './root';
import { api } from '../api';

export const agreementStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agreement-status',
  component: AgreementStatusComponent,
});

interface AgreementStatusResponse {
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  pdfUrl: string | null;
}

function AgreementStatusComponent() {
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Load agreement status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await api.agreement.getStatus();
      
      // Check if agreement exists (API returns { agreement: null } when no agreement)
      if ('agreement' in response && response.agreement === null) {
        setAgreementStatus(null);
      } else if ('status' in response) {
        // Response has status field directly (agreement exists)
        setAgreementStatus(response);
      } else {
        setAgreementStatus(null);
      }
    } catch (error: any) {
      console.error('Load status error:', error);
      
      // If no agreement found, that's not an error - just empty state
      if (error.message.includes('No agreement') || error.message.includes('not found')) {
        setAgreementStatus(null);
      } else {
        toast.error(error.message || 'Failed to load agreement status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedownloadPDF = async () => {
    if (!agreementStatus || !agreementStatus.pdfUrl) return;

    try {
      setDownloading(true);
      
      // Open PDF in new tab using the pdfUrl from status
      window.open(agreementStatus.pdfUrl, '_blank');
      toast.success('PDF opened successfully!');
    } catch (error: any) {
      console.error('Download PDF error:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}
      >
        {text[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading agreement status...</p>
        </div>
      </div>
    );
  }

  // Empty state - no agreement requests
  if (!agreementStatus) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Agreement Status</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Agreement Requests Found</h2>
            <p className="text-gray-600 mb-6">
              You haven't submitted any label partnership agreements yet.
            </p>
            <a
              href="/agreement-request"
              className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              Request New Label Partnership
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Display agreement status
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Agreement Status</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Label Partnership Agreement</h2>
            {getStatusBadge(agreementStatus.status)}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{agreementStatus.status}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(agreementStatus.createdAt)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(agreementStatus.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Status-specific messages */}
        <div className="mb-6">
          {agreementStatus.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Pending Review</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your agreement is currently under review by our team. We'll update the status once it's been processed.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {agreementStatus.status === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Agreement Verified</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Your label partnership agreement has been verified and approved. Welcome to Internet Records!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {agreementStatus.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Agreement Rejected</h3>
                  <p className="mt-1 text-sm text-red-700">
                    Your agreement request was not approved. Please contact support@internetrecords.tech for more information.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Re-download PDF button */}
        <div className="flex justify-end">
          <button
            onClick={handleRedownloadPDF}
            disabled={downloading}
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloading ? 'Downloading...' : 'Re-download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
