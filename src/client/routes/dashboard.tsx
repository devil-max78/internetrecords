import { createRoute, Link } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { rootRoute } from './root';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardComponent,
});

function DashboardComponent() {
  const { data: releases, isLoading, error } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.releases.getAll(),
  });

  // Fetch user's custom labels
  const { data: userLabels = [] } = useQuery({
    queryKey: ['userLabels'],
    queryFn: () => api.labelPublisher.getUserLabels(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-indigo-600">Loading releases...</div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load releases');
    return (
      <div className="text-center text-red-600 p-4">
        Error loading releases. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Releases</h1>
        <div className="flex gap-3">
          <Link
            to="/agreement-status"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition"
          >
            Agreement Status
          </Link>
          <Link
            to="/upload"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 transition"
          >
            Create New Release
          </Link>
        </div>
      </div>

      {/* User's Custom Labels Section */}
      {userLabels.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Your Labels</h2>
            <Link
              to="/label-publisher-settings"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Manage Labels →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {userLabels.map((label: any) => (
              <span
                key={label.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200"
              >
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {label.labelName}
              </span>
            ))}
          </div>
        </div>
      )}

      {releases?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No releases yet</h2>
          <p className="text-gray-600 mb-4">
            Get started by creating your first release.
          </p>
          <Link
            to="/upload"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 transition"
          >
            Create Release
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {releases?.map((release: any) => (
            <Link
              key={release.id}
              to="/release/$releaseId"
              params={{ releaseId: release.id }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                {release.artworkUrl ? (
                  <img
                    src={release.artworkUrl}
                    alt={release.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-white text-xl font-bold">No Artwork</div>';
                    }}
                  />
                ) : (
                  <div className="text-white text-xl font-bold">No Artwork</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{release.title}</h2>
                  <StatusBadge status={release.status} />
                </div>
                
                {/* Show rejection reason if rejected */}
                {release.status === 'REJECTED' && release.rejectionReason && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{release.rejectionReason}</p>
                    {release.allowResubmission && (
                      <p className="text-xs text-red-600 mt-2">
                        ✓ You can edit and resubmit this release
                      </p>
                    )}
                    {!release.allowResubmission && (
                      <p className="text-xs text-red-600 mt-2">
                        ✗ Resubmission not allowed. Please contact support.
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mb-2">
                  {release.tracks.length} tracks
                </p>
                <p className="text-gray-500 text-xs">
                  Created: {new Date(release.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}