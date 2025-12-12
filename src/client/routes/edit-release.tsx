import { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

type ReleaseFormData = {
  title: string;
  upc: string;
  originalReleaseDate: string;
  goLiveDate: string;
  subLabelId: string;
  albumCategoryId: string;
  contentTypeId: string;
  publisherId: string;
  primaryArtistName: string;
};

type TrackData = {
  id?: string;
  title: string;
  genre?: string;
  language?: string;
  isrc?: string;
  lyricist?: string;
  composer?: string;
  producer?: string;
  featuring?: string;
  singer?: string;
  crbtStartTime?: number;
  crbtEndTime?: number;
  audioFile?: File;
  existingAudioUrl?: string;
};

export const editReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/release/$releaseId/edit',
  component: EditReleaseComponent,
});

function EditReleaseComponent() {
  const { releaseId } = editReleaseRoute.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackData[]>([]);

  const { data: release, isLoading: loadingRelease } = useQuery({
    queryKey: ['release', releaseId],
    queryFn: () => api.releases.getById(releaseId),
  });

  const { user } = useAuth();

  const { data: subLabels } = useQuery({
    queryKey: ['subLabels', user?.id],
    queryFn: () => api.metadata.getSubLabels(),
  });

  const { data: publishers } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => api.metadata.getPublishers(),
  });

  const { data: albumCategories } = useQuery({
    queryKey: ['albumCategories'],
    queryFn: () => api.metadata.getAlbumCategories(),
  });

  const { data: contentTypes } = useQuery({
    queryKey: ['contentTypes'],
    queryFn: () => api.metadata.getContentTypes(),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReleaseFormData>();

  // Load existing data when release is fetched
  useEffect(() => {
    if (release) {
      reset({
        title: release.title,
        upc: release.upc,
        originalReleaseDate: release.originalReleaseDate,
        goLiveDate: release.goLiveDate,
        subLabelId: release.subLabelId,
        albumCategoryId: release.albumCategoryId,
        contentTypeId: release.contentTypeId,
        publisherId: release.publisherId,
        primaryArtistName: release.primaryArtistName,
      });

      // Load existing tracks
      if (release.tracks && release.tracks.length > 0) {
        setTracks(release.tracks.map((track: any) => ({
          id: track.id,
          title: track.title,
          genre: track.genre,
          language: track.language,
          isrc: track.isrc,
          lyricist: track.lyricist,
          composer: track.composer,
          producer: track.producer,
          featuring: track.featuring,
          singer: track.singer,
          crbtStartTime: track.crbtStartTime,
          crbtEndTime: track.crbtEndTime,
          existingAudioUrl: track.audioUrl,
        })));
      }

      // Set existing artwork preview
      if (release.artworkUrl) {
        setArtworkPreview(release.artworkUrl);
      }
    }
  }, [release, reset]);

  const updateTrack = (index: number, field: keyof TrackData, value: any) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setTracks(newTracks);
  };

  const addTrack = () => {
    setTracks([...tracks, { title: '', genre: '', language: '', isrc: '' }]);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtworkPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: ReleaseFormData) => api.releases.update(releaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      toast.success('Release updated successfully!');
      navigate({ to: '/release/$releaseId', params: { releaseId } });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update release');
    },
  });

  const onSubmit = async (data: ReleaseFormData) => {
    setIsLoading(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingRelease) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!release) {
    return <div className="text-center text-red-600">Release not found</div>;
  }

  // Check if user can edit
  const canEdit = release.status === 'DRAFT' ||
    release.status === 'UNDER_REVIEW' ||
    (release.status === 'REJECTED' && release.allowResubmission);

  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">This release cannot be edited.</p>
          <button
            onClick={() => navigate({ to: '/release/$releaseId', params: { releaseId } })}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Release
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate({ to: '/release/$releaseId', params: { releaseId } })}
        className="text-indigo-600 hover:text-indigo-800 mb-4"
      >
        ← Back to Release
      </button>

      <h1 className="text-3xl font-bold mb-6">Edit Release</h1>

      {release.status === 'REJECTED' && release.rejectionReason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
          <p className="text-sm text-red-700">{release.rejectionReason}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Release Title *
          </label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPC *
            </label>
            <input
              type="text"
              {...register('upc', { required: 'UPC is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.upc && <p className="text-red-500 text-sm mt-1">{errors.upc.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Artist Name *
            </label>
            <input
              type="text"
              {...register('primaryArtistName', { required: 'Artist name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.primaryArtistName && <p className="text-red-500 text-sm mt-1">{errors.primaryArtistName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Release Date *
            </label>
            <input
              type="date"
              {...register('originalReleaseDate', { required: 'Original release date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.originalReleaseDate && <p className="text-red-500 text-sm mt-1">{errors.originalReleaseDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Go Live Date *
            </label>
            <input
              type="date"
              {...register('goLiveDate', { required: 'Go live date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.goLiveDate && <p className="text-red-500 text-sm mt-1">{errors.goLiveDate.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Label *
            </label>
            <select
              {...register('subLabelId', { required: 'Sub-label is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Sub-Label</option>
              {subLabels?.map((label: any) => (
                <option key={label.id} value={label.id}>{label.name}</option>
              ))}
            </select>
            {errors.subLabelId && <p className="text-red-500 text-sm mt-1">{errors.subLabelId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publisher *
            </label>
            <select
              {...register('publisherId', { required: 'Publisher is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Publisher</option>
              {publishers?.map((publisher: any) => (
                <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
              ))}
            </select>
            {errors.publisherId && <p className="text-red-500 text-sm mt-1">{errors.publisherId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Album Category *
            </label>
            <select
              {...register('albumCategoryId', { required: 'Album category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {albumCategories?.map((category: any) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.albumCategoryId && <p className="text-red-500 text-sm mt-1">{errors.albumCategoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type *
            </label>
            <select
              {...register('contentTypeId', { required: 'Content type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Content Type</option>
              {contentTypes?.map((type: any) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {errors.contentTypeId && <p className="text-red-500 text-sm mt-1">{errors.contentTypeId.message}</p>}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/release/$releaseId', params: { releaseId } })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-800 mb-2">
          <strong>Important:</strong> This page only allows editing release-level metadata.
        </p>
        <p className="text-sm text-yellow-700 mb-2">
          To edit the following, please create a new release with the corrected information:
        </p>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Album artwork</li>
          <li>Track details (singer, composer, producer, lyricist, featuring)</li>
          <li>Audio files</li>
          <li>Track ISRC codes</li>
          <li>CRBT timings</li>
        </ul>
        <p className="text-xs text-yellow-600 mt-2">
          Recommendation: For rejected releases requiring extensive changes, create a new release to ensure all corrections are properly applied.
        </p>
      </div>
    </div>
  );
}
