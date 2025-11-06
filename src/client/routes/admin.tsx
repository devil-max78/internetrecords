import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminComponent,
});

function AdminComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  
  const { data: releases, isLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.releases.getAll(),
  });
  
  const { data: downloadUrls } = useQuery({
    queryKey: ['downloadUrls', selectedReleaseId],
    queryFn: () => selectedReleaseId ? api.admin.getDownloadUrls(selectedReleaseId) : Promise.resolve([]),
    enabled: !!selectedReleaseId,
  });
  
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.admin.approveRelease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast.success('Release approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve release');
    },
  });
  
  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.admin.rejectRelease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast.success('Release rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject release');
    },
  });
  
  const deleteReleaseMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteRelease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setSelectedReleaseId(null);
      toast.success('Release deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete release');
    },
  });
  
  const deleteTrackMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast.success('Track deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete track');
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

  const handleApprove = (releaseId: string) => {
    approveMutation.mutate(releaseId);
  };

  const handleReject = (releaseId: string) => {
    rejectMutation.mutate(releaseId);
  };
  
  const handleDeleteRelease = (releaseId: string, releaseTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${releaseTitle}"? This action cannot be undone.`)) {
      deleteReleaseMutation.mutate(releaseId);
    }
  };
  
  const handleDeleteTrack = (trackId: string, trackTitle: string) => {
    if (window.confirm(`Are you sure you want to delete track "${trackTitle}"? This action cannot be undone.`)) {
      deleteTrackMutation.mutate(trackId);
    }
  };

  const downloadReleaseData = async (release: any) => {
    try {
      // Get download URLs
      const urls = await api.admin.getDownloadUrls(release.id);
      const artworkUrl = urls?.find((u: any) => u.type === 'ARTWORK')?.url || '';
      
      // Create header row with ALL fields
      const headers = [
        'Release Title',
        'UPC',
        'Original Release Date',
        'Go Live Date',
        'C-Line',
        'Status',
        'Artist Name',
        'Artist Email',
        'Artwork URL',
        'Track #',
        'Track Title',
        'Duration',
        'Genre',
        'Language',
        'ISRC',
        'CRBT Start (sec)',
        'CRBT End (sec)',
        'Audio Download URL',
      ];
      
      const rows: string[][] = [];
      
      // Add a row for each track with all release info repeated
      if (release.tracks && release.tracks.length > 0) {
        release.tracks.forEach((track: any, index: number) => {
          const audioUrl = urls?.find((u: any) => 
            u.type === 'AUDIO' && u.name === track.title
          )?.url || '';
          
          const duration = track.duration 
            ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
            : '';
          
          rows.push([
            release.title || '',
            release.upc || '',
            release.originalReleaseDate || '',
            release.goLiveDate || '',
            release.cLine || 'Internet Records',
            release.status || '',
            release.user?.name || '',
            release.user?.email || '',
            artworkUrl,
            (index + 1).toString(),
            track.title || '',
            duration,
            track.genre || '',
            track.language || '',
            track.isrc || '',
            track.crbtStartTime?.toString() || '',
            track.crbtEndTime?.toString() || '',
            audioUrl,
          ]);
        });
      } else {
        // If no tracks, add one row with release info only
        rows.push([
          release.title || '',
          release.upc || '',
          release.originalReleaseDate || '',
          release.goLiveDate || '',
          release.cLine || 'Internet Records',
          release.status || '',
          release.user?.name || '',
          release.user?.email || '',
          artworkUrl,
          '',
          'No tracks',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ]);
      }
      
      // Combine header and rows
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${release.title.replace(/[^a-z0-9]/gi, '_')}-data.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Release data downloaded as CSV');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download release data');
    }
  };

  const generateCSV = () => {
    if (!releases || releases.length === 0) {
      toast.error('No releases to export');
      return;
    }
    
    // Create CSV header with all fields
    const headers = [
      'ID', 'Title', 'Artist', 'Email', 'Status', 'UPC', 
      'Original Release Date', 'Go Live Date', 'C-Line',
      'Tracks Count', 'Created At'
    ];
    
    // Create rows
    const rows = releases.map((release: any) => [
      release.id,
      release.title,
      release.user?.name || 'Unknown',
      release.user?.email || '',
      release.status,
      release.upc || '',
      release.originalReleaseDate || '',
      release.goLiveDate || '',
      release.cLine || 'Internet Records',
      release.tracks?.length?.toString() || '0',
      new Date(release.createdAt).toISOString(),
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'releases.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV downloaded successfully');
  };

  const selectedRelease = releases?.find((r: any) => r.id === selectedReleaseId);
  
  const getAudioUrl = (trackId: string) => {
    const audioDownload = downloadUrls?.find((d: any) => d.type === 'AUDIO' && d.name === selectedRelease?.tracks?.find((t: any) => t.id === trackId)?.title);
    return audioDownload?.url;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-800">Admin Dashboard</h1>
        <button
          onClick={generateCSV}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Download All CSV
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Releases Management</h2>
          
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {releases?.map((release: any) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{release.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{release.user?.name || 'Unknown'}</div>
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
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadReleaseData(release)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Download
                        </button>
                        {release.status === 'UNDER_REVIEW' && (
                          <>
                            <button
                              onClick={() => handleApprove(release.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(release.id)}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRelease(release.id, release.title)}
                          className="text-red-600 hover:text-red-900 font-bold"
                          title="Delete release"
                        >
                          Delete
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
      
      {selectedRelease && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Release Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadReleaseData(selectedRelease)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download Data
                </button>
                <button
                  onClick={() => setSelectedReleaseId(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{selectedRelease.title}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Artist:</span> {selectedRelease.user?.name || 'Unknown'}</p>
                  <p className="text-gray-600"><span className="font-medium">Email:</span> {selectedRelease.user?.email || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-medium">Status:</span> <StatusBadge status={selectedRelease.status} /></p>
                  <p className="text-gray-600"><span className="font-medium">UPC:</span> {selectedRelease.upc || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-medium">Original Release Date:</span> {selectedRelease.originalReleaseDate || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-medium">Go Live Date:</span> {selectedRelease.goLiveDate || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-medium">C-Line:</span> {selectedRelease.cLine || 'Internet Records'}</p>
                  <p className="text-gray-600"><span className="font-medium">Created:</span> {new Date(selectedRelease.createdAt).toLocaleDateString()}</p>
                </div>
                
                {selectedRelease.status === 'UNDER_REVIEW' && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleApprove(selectedRelease.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedRelease.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                {selectedRelease.artworkUrl && downloadUrls?.find((d: any) => d.type === 'ARTWORK') && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Artwork</h4>
                    <img 
                      src={downloadUrls.find((d: any) => d.type === 'ARTWORK')?.url} 
                      alt="Album artwork" 
                      className="w-full max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Tracks ({selectedRelease.tracks?.length || 0})</h4>
              <div className="space-y-3">
                {selectedRelease.tracks?.map((track: any, index: number) => {
                  const audioUrl = getAudioUrl(track.id);
                  return (
                    <div key={track.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{index + 1}. {track.title}</h5>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <p><span className="font-medium">Duration:</span> {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</p>
                            {track.genre && <p><span className="font-medium">Genre:</span> {track.genre}</p>}
                            {track.language && <p><span className="font-medium">Language:</span> {track.language}</p>}
                            {track.isrc && <p><span className="font-medium">ISRC:</span> {track.isrc}</p>}
                            {(track.crbtStartTime || track.crbtEndTime) && (
                              <p><span className="font-medium">CRBT:</span> {track.crbtStartTime}s - {track.crbtEndTime}s</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTrack(track.id, track.title)}
                          className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Delete track"
                        >
                          Delete
                        </button>
                      </div>
                      
                      {audioUrl && (
                        <div className="mt-3">
                          <audio 
                            controls 
                            className="w-full"
                            onPlay={() => setPlayingTrackId(track.id)}
                            onPause={() => setPlayingTrackId(null)}
                          >
                            <source src={audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <a
                            href={audioUrl}
                            download={`${track.title}.mp3`}
                            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Download Audio
                          </a>
                        </div>
                      )}
                      
                      {!audioUrl && track.audioUrl && (
                        <p className="text-sm text-gray-500 mt-2">Audio file available but URL not loaded</p>
                      )}
                      
                      {!audioUrl && !track.audioUrl && (
                        <p className="text-sm text-gray-500 mt-2">No audio file uploaded</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
