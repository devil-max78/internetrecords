import React, { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

type TrackFormData = {
  title: string;
  genre?: string;
  language?: string;
  isrc?: string;
  singer?: string;
  lyricist?: string;
  composer?: string;
  producer?: string;
  featuring?: string;
  crbtStartTime?: number;
  crbtEndTime?: number;
};

export const releaseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/release/$releaseId',
  component: ReleaseDetailComponent,
});

function ReleaseDetailComponent() {
  const { releaseId } = releaseDetailRoute.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TrackFormData>();
  
  const { data: release, isLoading, refetch } = useQuery({
    queryKey: ['release', releaseId],
    queryFn: () => api.releases.getById(releaseId),
  });
  
  const addTrackMutation = useMutation({
    mutationFn: (data: TrackFormData) => api.releases.addTrack(releaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      reset();
      toast.success('Track added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add track');
    },
  });
  
  const submitForReviewMutation = useMutation({
    mutationFn: () => api.releases.submitForReview(releaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      toast.success('Release submitted for review!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit release');
    },
  });

  const onAddTrack = async (data: TrackFormData) => {
    if (!audioFile) {
      toast.error('Audio file is required');
      return;
    }

    try {
      // First, add the track
      const createdTrack = await api.releases.addTrack(releaseId, data);

      // Then upload the audio file
      const audioUploadResponse = await api.upload.getPresignedUrl({
        fileType: 'AUDIO',
        fileName: audioFile.name,
        releaseId: releaseId,
      });

      await fetch(audioUploadResponse.uploadUrl, {
        method: 'PUT',
        body: audioFile,
        headers: {
          'Content-Type': audioFile.type,
        },
      });

      // Update track with audio URL
      await api.upload.updateTrackAudio({
        trackId: createdTrack.id,
        audioUrl: audioUploadResponse.fileUrl,
      });

      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      reset();
      setAudioFile(null);
      toast.success('Track added successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add track');
    }
  };

  const handleSubmitForReview = async () => {
    if (!release?.tracks || release.tracks.length === 0) {
      toast.error('Please add at least one track before submitting');
      return;
    }
    
    if (window.confirm('Are you sure you want to submit this release for review?')) {
      submitForReviewMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-indigo-600">Loading release...</div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="text-center text-red-600 p-4">
        Release not found
      </div>
    );
  }

  const canEdit = release.status === 'DRAFT';
  const canEditRejected = release.status === 'REJECTED' && release.allowResubmission;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="text-indigo-600 hover:text-indigo-800 mb-4"
        >
          ← Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{release.title}</h1>
            <p className="text-gray-600 mt-2">
              Created: {new Date(release.createdAt).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={release.status} />
        </div>

        {/* Show rejection reason and edit button */}
        {release.status === 'REJECTED' && release.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</p>
            <p className="text-sm text-red-700 mb-3">{release.rejectionReason}</p>
            {release.allowResubmission ? (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                  <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Limited Editing Available</p>
                  <p className="text-xs text-yellow-700 mb-2">
                    You can edit basic release metadata, but for comprehensive changes (artwork, track credits, audio files), we recommend creating a new release.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate({ to: '/release/$releaseId/edit', params: { releaseId: release.id } })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Edit Basic Metadata
                  </button>
                  <button
                    onClick={() => navigate({ to: '/upload' })}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Create New Release
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded">
                <p className="text-sm text-gray-700">
                  ✗ Resubmission not allowed. Please contact support or create a new release.
                </p>
                <button
                  onClick={() => navigate({ to: '/upload' })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Create New Release
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracks Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tracks</h2>
        
        {release.tracks && release.tracks.length > 0 ? (
          <div className="space-y-3 mb-6">
            {release.tracks.map((track: any, index: number) => (
              <div key={track.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {index + 1}. {track.title}
                    </h3>
                    {track.duration && (
                      <p className="text-sm text-gray-600">
                        Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                    {track.genre && (
                      <p className="text-sm text-gray-600">Genre: {track.genre}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-6">No tracks added yet.</p>
        )}

        {(canEdit || canEditRejected) && (
          <form onSubmit={handleSubmit(onAddTrack)} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Add New Track</h3>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Track Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter track title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="singer" className="block text-sm font-medium text-gray-700 mb-1">
                  Singer
                </label>
                <input
                  id="singer"
                  type="text"
                  {...register('singer')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Vocalist name"
                />
              </div>

              <div>
                <label htmlFor="lyricist" className="block text-sm font-medium text-gray-700 mb-1">
                  Lyricist
                </label>
                <input
                  id="lyricist"
                  type="text"
                  {...register('lyricist')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Lyrics writer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="composer" className="block text-sm font-medium text-gray-700 mb-1">
                  Composer
                </label>
                <input
                  id="composer"
                  type="text"
                  {...register('composer')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Music composer"
                />
              </div>

              <div>
                <label htmlFor="producer" className="block text-sm font-medium text-gray-700 mb-1">
                  Producer
                </label>
                <input
                  id="producer"
                  type="text"
                  {...register('producer')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Track producer"
                />
              </div>
            </div>

            <div>
              <label htmlFor="featuring" className="block text-sm font-medium text-gray-700 mb-1">
                Featuring
              </label>
              <input
                id="featuring"
                type="text"
                {...register('featuring')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Featured artists"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <input
                  id="genre"
                  type="text"
                  {...register('genre')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Pop, Rock, etc."
                />
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <input
                  id="language"
                  type="text"
                  {...register('language')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="English, Hindi, etc."
                />
              </div>
            </div>

            <div>
              <label htmlFor="isrc" className="block text-sm font-medium text-gray-700 mb-1">
                ISRC
              </label>
              <input
                id="isrc"
                type="text"
                {...register('isrc')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ISRC code"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="crbtStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                  CRBT Start (seconds)
                </label>
                <input
                  id="crbtStartTime"
                  type="number"
                  {...register('crbtStartTime', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label htmlFor="crbtEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                  CRBT End (seconds)
                </label>
                <input
                  id="crbtEndTime"
                  type="number"
                  {...register('crbtEndTime', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File (MP3 only) <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                accept=".mp3,audio/mpeg"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!file.name.toLowerCase().endsWith('.mp3') && file.type !== 'audio/mpeg') {
                      toast.error('Only MP3 files are allowed');
                      e.target.value = '';
                      return;
                    }
                    setAudioFile(file);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {audioFile && (
                <p className="text-sm text-green-600 mt-1">✓ {audioFile.name}</p>
              )}
              {!audioFile && (
                <p className="text-sm text-red-600 mt-1">Audio file is required</p>
              )}
            </div>

            <button
              type="submit"
              disabled={addTrackMutation.isPending || !audioFile}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {addTrackMutation.isPending ? 'Adding...' : 'Add Track'}
            </button>
          </form>
        )}
      </div>

      {/* Submit for Review */}
      {(canEdit || canEditRejected) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {canEditRejected ? 'Resubmit for Review' : 'Submit for Review'}
          </h2>
          <p className="text-gray-600 mb-4">
            {canEditRejected
              ? 'After making the necessary changes, resubmit your release for admin review.'
              : 'Once you\'re done adding tracks, submit your release for admin review.'}
          </p>
          <button
            onClick={handleSubmitForReview}
            disabled={submitForReviewMutation.isPending || !release.tracks || release.tracks.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70"
          >
            {submitForReviewMutation.isPending 
              ? (canEditRejected ? 'Resubmitting...' : 'Submitting...') 
              : (canEditRejected ? 'Resubmit for Review' : 'Submit for Review')}
          </button>
        </div>
      )}
    </div>
  );
}
