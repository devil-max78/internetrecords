import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../api';

interface CustomLabelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CustomLabelModal({ isOpen, onClose }: CustomLabelModalProps) {
    const [labelName, setLabelName] = useState('');
    const queryClient = useQueryClient();

    const requestLabelMutation = useMutation({
        mutationFn: (name: string) => api.customLabels.request(name),
        onSuccess: () => {
            toast.success('Label request submitted successfully!');
            setLabelName('');
            queryClient.invalidateQueries(['customLabelRequests']);
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to submit label request');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!labelName.trim()) {
            toast.error('Label name is required');
            return;
        }
        requestLabelMutation.mutate(labelName);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Request Custom Label</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Request a custom label to be added. Once approved by an admin, it will be available in your list.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label Name
                        </label>
                        <input
                            type="text"
                            value={labelName}
                            onChange={(e) => setLabelName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter label name"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={requestLabelMutation.isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70"
                        >
                            {requestLabelMutation.isLoading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
