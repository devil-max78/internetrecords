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
  duration?: number;
  genre?: string;
  language?: string;
  isrc?: string;
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
    addTrackMutation.mutate(data);
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

        {canEdit && (
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
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (seconds)
                </label>
                <input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="180"
                />
              </div>

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
            </div>

            <button
              type="submit"
              disabled={addTrackMutation.isPending}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {addTrackMutation.isPending ? 'Adding...' : 'Add Track'}
            </button>
          </form>
        )}
      </div>

      {/* Submit for Review */}
      {canEdit && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit for Review</h2>
          <p className="text-gray-600 mb-4">
            Once you're done adding tracks, submit your release for admin review.
          </p>
          <button
            onClick={handleSubmitForReview}
            disabled={submitForReviewMutation.isPending || !release.tracks || release.tracks.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70"
          >
            {submitForReviewMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}
    </div>
  );
}
