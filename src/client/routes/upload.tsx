import React, { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { rootRoute } from './root';
import { api } from '../api';

type UploadFormData = {
  title: string;
};

export const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadComponent,
});

function UploadComponent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UploadFormData>();

  const onSubmit = async (data: UploadFormData) => {
    try {
      setIsLoading(true);
      
      const release = await api.releases.create({
        title: data.title,
      });
      
      toast.success('Release created successfully!');
      navigate({ to: '/release/$releaseId', params: { releaseId: release.id } });
    } catch (error: any) {
      console.error('Create release error:', error);
      toast.error(error.message || 'Failed to create release');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Release</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Release Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter release title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-70"
          >
            {isLoading ? 'Creating...' : 'Create Release'}
          </button>
        </form>
      </div>
    </div>
  );
}
