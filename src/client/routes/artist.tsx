import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';

// Mock releases data
const mockUserReleases = [
  {
    id: '101',
    title: 'Midnight Dreams',
    status: 'PENDING',
    createdAt: '2023-08-10T14:30:00Z',
    tracks: [
      { id: '1001', title: 'Starlight', duration: '3:45' },
      { id: '1002', title: 'Moonwalk', duration: '4:12' }
    ]
  },
  {
    id: '102',
    title: 'Urban Jungle',
    status: 'APPROVED',
    createdAt: '2023-07-22T09:15:00Z',
    tracks: [
      { id: '1003', title: 'City Beats', duration: '3:30' },
      { id: '1004', title: 'Concrete Dreams', duration: '4:05' }
    ]
  }
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'PENDING':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'APPROVED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'REJECTED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export const artistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist',
  component: ArtistComponent,
});

function ArtistComponent() {
  const { user } = useAuth();
  const [releases, setReleases] = useState(mockUserReleases);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newRelease, setNewRelease] = useState({
    title: '',
    tracks: [{ title: '', file: null }]
  });
  
  // Redirect if not artist
  if (user?.role !== 'ARTIST') {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need artist privileges to access this page.</p>
      </div>
    );
  }

  const handleAddTrack = () => {
    setNewRelease(prev => ({
      ...prev,
      tracks: [...prev.tracks, { title: '', file: null }]
    }));
  };

  const handleTrackChange = (index: number, field: string, value: any) => {
    setNewRelease(prev => {
      const updatedTracks = [...prev.tracks];
      updatedTracks[index] = { ...updatedTracks[index], [field]: value };
      return { ...prev, tracks: updatedTracks };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newId = `${Date.now()}`;
      const newReleaseData = {
        id: newId,
        title: newRelease.title,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        tracks: newRelease.tracks.map((track, index) => ({
          id: `${newId}-${index}`,
          title: track.title,
          duration: '0:00' // Placeholder
        }))
      };
      
      setReleases(prev => [newReleaseData, ...prev]);
      setNewRelease({
        title: '',
        tracks: [{ title: '', file: null }]
      });
      setIsUploading(false);
      toast.success('Release submitted successfully!');
    }, 1500);
  };

  const selectedRelease = releases.find(r => r.id === selectedReleaseId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">Artist Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Release</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Release Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={newRelease.title}
                  onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tracks
                </label>
                
                {newRelease.tracks.map((track, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        placeholder="Track title"
                        value={track.title}
                        onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    <div className="flex-grow">
                      <input
                        type="file"
                        onChange={(e) => handleTrackChange(index, 'file', e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        accept="audio/*"
                        required
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddTrack}
                  className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
                >
                  + Add Track
                </button>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300"
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : 'Submit Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Releases</h2>
            
            {releases.length === 0 ? (
              <p className="text-gray-500 text-center py-4">You haven't uploaded any releases yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {releases.map((release) => (
                      <tr key={release.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{release.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={release.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(release.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedReleaseId(release.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Release Details</h2>
                <button
                  onClick={() => setSelectedReleaseId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedRelease.title}</h3>
                <p className="text-gray-600 mb-1">Status: <StatusBadge status={selectedRelease.status} /></p>
                <p className="text-gray-600 mb-4">Submitted: {new Date(selectedRelease.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Tracks</h4>
                <ul className="divide-y divide-gray-200">
                  {selectedRelease.tracks.map((track) => (
                    <li key={track.id} className="py-3">
                      <div className="flex justify-between">
                        <span className="text-gray-800">{track.title}</span>
                        <span className="text-gray-500">{track.duration}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default artistRoute;