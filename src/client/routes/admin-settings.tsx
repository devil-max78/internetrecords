import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rootRoute } from './root';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: AdminSettingsComponent,
});

function AdminSettingsComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newSubLabel, setNewSubLabel] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newAlbumCategory, setNewAlbumCategory] = useState('');
  const [newContentType, setNewContentType] = useState('');

  // Fetch all dropdown data
  const { data: subLabels } = useQuery({
    queryKey: ['subLabels'],
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

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.admin.getAllUsers(),
  });

  // Mutations
  const createSubLabelMutation = useMutation({
    mutationFn: (name: string) => api.admin.createSubLabel(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subLabels'] });
      setNewSubLabel('');
      toast.success('Sub-label added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add sub-label');
    },
  });

  const createPublisherMutation = useMutation({
    mutationFn: (name: string) => api.admin.createPublisher(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      setNewPublisher('');
      toast.success('Publisher added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add publisher');
    },
  });

  const createAlbumCategoryMutation = useMutation({
    mutationFn: (name: string) => api.admin.createAlbumCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albumCategories'] });
      setNewAlbumCategory('');
      toast.success('Album category added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add album category');
    },
  });

  const createContentTypeMutation = useMutation({
    mutationFn: (name: string) => api.admin.createContentType(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTypes'] });
      setNewContentType('');
      toast.success('Content type added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add content type');
    },
  });

  // Delete mutations
  const deleteSubLabelMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteSubLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subLabels'] });
      toast.success('Sub-label deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete sub-label');
    },
  });

  const deletePublisherMutation = useMutation({
    mutationFn: (id: string) => api.admin.deletePublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      toast.success('Publisher deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete publisher');
    },
  });

  const deleteAlbumCategoryMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteAlbumCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albumCategories'] });
      toast.success('Album category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete album category');
    },
  });

  const deleteContentTypeMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteContentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTypes'] });
      toast.success('Content type deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete content type');
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.admin.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
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

  const handleAddSubLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubLabel.trim()) {
      createSubLabelMutation.mutate(newSubLabel.trim());
    }
  };

  const handleAddPublisher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPublisher.trim()) {
      createPublisherMutation.mutate(newPublisher.trim());
    }
  };

  const handleAddAlbumCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAlbumCategory.trim()) {
      createAlbumCategoryMutation.mutate(newAlbumCategory.trim());
    }
  };

  const handleAddContentType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContentType.trim()) {
      createContentTypeMutation.mutate(newContentType.trim());
    }
  };

  const handleRoleChange = (userId: string, currentRole: string, userName: string) => {
    const roles = ['ARTIST', 'LABEL', 'ADMIN'];
    const newRole = window.prompt(
      `Change role for ${userName}\nCurrent: ${currentRole}\n\nEnter new role (ARTIST, LABEL, or ADMIN):`,
      currentRole
    );

    if (newRole && roles.includes(newRole.toUpperCase())) {
      updateUserRoleMutation.mutate({ id: userId, role: newRole.toUpperCase() });
    } else if (newRole) {
      toast.error('Invalid role. Must be ARTIST, LABEL, or ADMIN');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-indigo-800">Admin Settings</h1>
      <p className="text-gray-600">Manage global dropdown options and users</p>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <p className="text-sm text-gray-600 mb-4">
          Total Users: <strong>{users?.length || 0}</strong> | 
          Admins: <strong>{users?.filter((u: any) => u.role === 'ADMIN').length || 0}</strong> | 
          Artists: <strong>{users?.filter((u: any) => u.role === 'ARTIST').length || 0}</strong> | 
          Labels: <strong>{users?.filter((u: any) => u.role === 'LABEL').length || 0}</strong>
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'LABEL' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleRoleChange(u.id, u.role, u.name)}
                      disabled={u.id === user?.id}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sub-Labels */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sub-Labels</h2>
          
          <form onSubmit={handleAddSubLabel} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubLabel}
                onChange={(e) => setNewSubLabel(e.target.value)}
                placeholder="Enter new sub-label"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newSubLabel.trim() || createSubLabelMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Current Sub-Labels:</p>
            <ul className="space-y-1">
              {subLabels?.map((label: any) => (
                <li key={label.id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm">
                  <span>{label.name}</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${label.name}"?`)) {
                        deleteSubLabelMutation.mutate(label.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Publishers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Publishers</h2>
          
          <form onSubmit={handleAddPublisher} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPublisher}
                onChange={(e) => setNewPublisher(e.target.value)}
                placeholder="Enter new publisher"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newPublisher.trim() || createPublisherMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Current Publishers:</p>
            <ul className="space-y-1">
              {publishers?.map((pub: any) => (
                <li key={pub.id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm">
                  <span>{pub.name}</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${pub.name}"?`)) {
                        deletePublisherMutation.mutate(pub.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Album Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Album Categories</h2>
          
          <form onSubmit={handleAddAlbumCategory} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAlbumCategory}
                onChange={(e) => setNewAlbumCategory(e.target.value)}
                placeholder="Enter new category"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newAlbumCategory.trim() || createAlbumCategoryMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Current Categories:</p>
            <ul className="space-y-1">
              {albumCategories?.map((cat: any) => (
                <li key={cat.id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm">
                  <span>{cat.name}</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${cat.name}"?`)) {
                        deleteAlbumCategoryMutation.mutate(cat.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Content Types</h2>
          
          <form onSubmit={handleAddContentType} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newContentType}
                onChange={(e) => setNewContentType(e.target.value)}
                placeholder="Enter new content type"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newContentType.trim() || createContentTypeMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Current Types:</p>
            <ul className="space-y-1">
              {contentTypes?.map((type: any) => (
                <li key={type.id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm">
                  <span>{type.name}</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${type.name}"?`)) {
                        deleteContentTypeMutation.mutate(type.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
