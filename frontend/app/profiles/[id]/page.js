"use client";

import { useEffect, useState, use } from "react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProfile } from "@/lib/api";
import { addRecentlyViewed } from '@/lib/recentlyViewed';

export default function ProfileDetailsPage({ params }) {
  const router = useRouter();
  
  // Unwrap the params Promise
  const unwrappedParams = use(params);
  const profileId = unwrappedParams.id;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Simulated layout data fetch
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

        <div>
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">G-Code / Slicer INI Content</h2>
          <pre className="p-4 rounded-xl bg-zinc-940 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-800 dark:text-zinc-300 max-h-96">
            {profile.config_content}
          </pre>
        </div>
      </div>
    </div>
  );
}
