"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProfile } from '@/lib/api';
import { updateProfile } from '@/lib/api';
import { addRecentlyViewed } from '@/lib/recentlyViewed';

export default function ProfileDetailsPage({ params }) {
  const router = useRouter();
  
  // Unwrap the params Promise
  const unwrappedParams = use(params);
  const profileId = unwrappedParams.id;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    description: '',
    printer_type: '',
    file: null,  
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  useEffect(() => {
    async function fetchProfileDetails() {
      try {
        const res = await fetch(`http://localhost:8000/api/profiles/${profileId}`, {
          headers: {
            // Include your cookie/token parsing logic if route is protected
            Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("slice_profile_token="))?.split("=")[1]}`
          }
        });
        if (!res.ok) throw new Error("Could not find this profile.");
        const data = await res.json();
        setProfile(data.profile);
        addRecentlyViewed(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileDetails();
  }, [profileId]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this profile?");
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteProfile(profileId);
      
      // Clear Next.js dynamic client caches
      router.refresh();
      
      router.push("/browse");
    } catch (err) {
      setError(err.message || "Failed to remove the profile configuration.");
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-zinc-500">Loading profile configurations…</div>;
  if (error && !profile) return <div className="p-8 text-sm text-red-500">{error}</div>;

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', updateForm.name || profile.name);
      formData.append('description', updateForm.description || profile.description);
      formData.append('printer_type', updateForm.printer_type || profile.printer_type);

      if (updateForm.file) {
        formData.append('file', updateForm.file);
      } else {
        const blob = new Blob([profile.config_content], { type: 'text/plain' });
        formData.append('file', blob, profile.file_name);
      }

      const response = await updateProfile(id, formData);
      
      setUpdateSuccess('Profile updated successfully!');
      setIsEditing(false);
      setUpdateForm({ name: '', description: '', printer_type: '', file: null });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back button */}
      <Link href="/browse" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        ← Back to profiles
      </Link>

      {/* Profile Header Block */}
      <div className="mt-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {profile.name}
        </h1>
        
        {/* Delete Button */}
        <div className="mt-3 flex items-center gap-4">
          <p className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {profile.printer_type || "Universal Slicer Profile"}
          </p>
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {deleting ? "Deleting…" : "Delete Profile"}
          </button>
        </div>
      </div>

      {/* Profile Description & Configuration Details Code Mirror / Text area view below */}
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Description</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {profile.description || "No description provided for this profile."}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {profile && !loading && (
          <article className="mt-6">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {profile.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 font-mono">
              {profile.printer_type}
            </p>
            {profile.description && (
              <p className="mt-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {profile.description}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <Link
                href="/compare"
                className="text-sm px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Compare →
              </Link>
            </div>

            {/* EDIT FORM - ONLY SHOWS WHEN EDITING */}
            {isEditing && (
              <form onSubmit={handleUpdateSubmit} className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Update Profile
                </h2>

                {updateSuccess && (
                  <div className="mb-4 rounded-md border border-green-300 dark:border-green-900 bg-green-50 dark:bg-green-950/40 px-4 py-3 text-sm text-green-800 dark:text-green-300">
                    {updateSuccess}
                  </div>
                )}

                {updateError && (
                  <div className="mb-4 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
                    {updateError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      placeholder={profile.name}
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder={profile.description || 'Enter description...'}
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      Printer Type
                    </label>
                    <input
                      type="text"
                      placeholder={profile.printer_type || 'Enter printer type...'}
                      value={updateForm.printer_type}
                      onChange={(e) => setUpdateForm({ ...updateForm, printer_type: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      Configuration File (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setUpdateForm({ ...updateForm, file: e.target.files?.[0] || null })}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Leave empty to keep the current configuration file
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
            {profile.config_content && (
              <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Configuration File: {profile.file_name}
                </h2>
                <pre className="p-4 rounded-md bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-800 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                  {profile.config_content}
                </pre>
              </div>
            )}
            <div className="mt-10 text-xs text-zinc-500">
              Profile ID:{' '}
              <span className="font-mono">
                {profile.id || profile._id || profile.profile_id}
              </span>
            </div>
           </article>
          )}
      </div>
    </div>
  );
}
