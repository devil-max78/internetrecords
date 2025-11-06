import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { api } from '../api';

export const labelPublisherSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/label-publisher-settings',
  component: LabelPublisherSettings,
});

interface GlobalDefaults {
  defaultPublisher: string;
  defaultLabel: string;
}

interface UserLabel {
  id: string;
  userId: string;
  labelName: string;
  createdAt: string;
}

interface UserPublisher {
  id: string;
  userId: string;
  publisherName: string;
  createdAt: string;
}

interface UserPreferences {
  customLabel: string | null;
  customPublisher: string | null;
}

function LabelPublisherSettings() {
  const queryClient = useQueryClient();
  const [newLabel, setNewLabel] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');

  // Fetch global defaults
  const { data: globalDefaults } = useQuery<GlobalDefaults>({
    queryKey: ['globalDefaults'],
    queryFn: () => api.labelPublisher.getGlobalDefaults()
  });

  // Fetch user labels
  const { data: userLabels = [] } = useQuery<UserLabel[]>({
    queryKey: ['userLabels'],
    queryFn: () => api.labelPublisher.getUserLabels()
  });

  // Fetch user publishers
  const { data: userPublishers = [] } = useQuery<UserPublisher[]>({
    queryKey: ['userPublishers'],
    queryFn: () => api.labelPublisher.getUserPublishers()
  });

  // Fetch user preferences
  useQuery<UserPreferences>({
    queryKey: ['userPreferences'],
    queryFn: () => api.labelPublisher.getUserPreferences(),
    onSuccess: (data) => {
      setSelectedLabel(data.customLabel || '');
      setSelectedPublisher(data.customPublisher || '');
    }
  });

  // Add label mutation
  const addLabelMutation = useMutation({
    mutationFn: (labelName: string) => api.labelPublisher.addUserLabel(labelName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLabels'] });
      setNewLabel('');
    }
  });

  // Add publisher mutation
  const addPublisherMutation = useMutation({
    mutationFn: (publisherName: string) => api.labelPublisher.addUserPublisher(publisherName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPublishers'] });
      setNewPublisher('');
    }
  });

  // Delete label mutation
  const deleteLabelMutation = useMutation({
    mutationFn: (id: string) => api.labelPublisher.deleteUserLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLabels'] });
    }
  });

  // Delete publisher mutation
  const deletePublisherMutation = useMutation({
    mutationFn: (id: string) => api.labelPublisher.deleteUserPublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPublishers'] });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: UserPreferences) => api.labelPublisher.updateUserPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    }
  });

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim()) {
      addLabelMutation.mutate(newLabel.trim());
    }
  };

  const handleAddPublisher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPublisher.trim()) {
      addPublisherMutation.mutate(newPublisher.trim());
    }
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate({
      customLabel: selectedLabel || null,
      customPublisher: selectedPublisher || null
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Label & Publisher Settings</h1>

      {/* Global Defaults */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Global Defaults</h2>
        <div className="space-y-2">
          <p><strong>Default Label:</strong> {globalDefaults?.defaultLabel}</p>
          <p><strong>Default Publisher:</strong> {globalDefaults?.defaultPublisher}</p>
        </div>
      </div>

      {/* User Custom Labels */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Custom Labels</h2>
        <form onSubmit={handleAddLabel} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter new label name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={addLabelMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Label
            </button>
          </div>
        </form>
        <div className="space-y-2">
          {userLabels.map((label) => (
            <div key={label.id} className="flex justify-between items-center p-2 border rounded">
              <span>{label.labelName}</span>
              <button
                onClick={() => deleteLabelMutation.mutate(label.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
          {userLabels.length === 0 && (
            <p className="text-gray-500">No custom labels yet</p>
          )}
        </div>
      </div>

      {/* User Custom Publishers */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Custom Publishers</h2>
        <form onSubmit={handleAddPublisher} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPublisher}
              onChange={(e) => setNewPublisher(e.target.value)}
              placeholder="Enter new publisher name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={addPublisherMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Publisher
            </button>
          </div>
        </form>
        <div className="space-y-2">
          {userPublishers.map((publisher) => (
            <div key={publisher.id} className="flex justify-between items-center p-2 border rounded">
              <span>{publisher.publisherName}</span>
              <button
                onClick={() => deletePublisherMutation.mutate(publisher.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
          {userPublishers.length === 0 && (
            <p className="text-gray-500">No custom publishers yet</p>
          )}
        </div>
      </div>

      {/* User Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Active Selection</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Active Label</label>
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Use Global Default ({globalDefaults?.defaultLabel})</option>
              {userLabels.map((label) => (
                <option key={label.id} value={label.labelName}>
                  {label.labelName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Active Publisher</label>
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Use Global Default ({globalDefaults?.defaultPublisher})</option>
              {userPublishers.map((publisher) => (
                <option key={publisher.id} value={publisher.publisherName}>
                  {publisher.publisherName}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSavePreferences}
            disabled={updatePreferencesMutation.isPending}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}