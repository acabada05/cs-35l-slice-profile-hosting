'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProfile } from '@/lib/api';
import { addRecentlyViewed } from '@/lib/recentlyViewed';

export default function ProfileDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProfile(id)
      .then((p) => {
      setProfile(p);
      addRecentlyViewed(p);
      })
      .catch((err) => setError(err.message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex-1 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between">
          <Link
            href="/browse"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to browse
          </Link>
          <Link
            href="/compare"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Compare profiles →
          </Link>
        </div>

        {loading && <p className="mt-8 text-sm text-zinc-500">Loading…</p>}

        {error && !loading && (
          <div className="mt-8 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
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