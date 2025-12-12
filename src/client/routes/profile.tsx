import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { api } from '../api';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  legalName: string | null;
  mobile: string | null;
  address: string | null;
  entityName: string | null;
}

export default function ProfilePage() {
  const navigate = useNavigate({ from: '/profile' });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    mobile: '',
    address: '',
    entityName: ''
  });

  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate({ to: '/login' });
        return;
      }
    } catch (e) {
      // localStorage not available, redirect to login
      navigate({ to: '/login' });
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.profile.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        legalName: data.legalName || '',
        mobile: data.mobile || '',
        address: data.address || '',
        entityName: data.entityName || ''
      });
    } catch (err: any) {
      // If unauthorized, redirect to login
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        localStorage.removeItem('token');
        navigate({ to: '/login' });
        return;
      }
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.profile.updateProfile(formData);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your personal information and contact details
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile?.role || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    id="legalName"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full legal name"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Required for agreement generation
                  </p>
                </div>

                <div>
                  <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Name (Artist/Label Name)
                  </label>
                  <input
                    type="text"
                    id="entityName"
                    name="entityName"
                    value={formData.entityName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your artist or label name"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Required for agreement generation
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Required for agreement generation
                  </p>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address, City, State, ZIP Code, Country"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Required for agreement generation
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why do we need this information?
          </h3>
          <p className="text-sm text-blue-800">
            Your profile information is required to generate legal agreements and contracts.
            Fields marked as "Required for agreement generation" must be completed before you
            can request a new label partnership.
          </p>
        </div>
      </div>
    </div>
  );
}
