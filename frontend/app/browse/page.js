'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listProfiles } from '@/lib/api';

export default function BrowsePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listProfiles()
      .then(setProfiles)
      .catch((err) => setError(err.message || 'Failed to load profiles.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Browse profiles
          </h1>
          <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href="/compare"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Compare →
            </Link>
            <Link
              href="/upload"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Upload new →
            </Link>
          </div>
        </div>


        {loading && <p className="mt-8 text-sm text-zinc-500">Loading…</p>}

        {error && !loading && (
          <div className="mt-8 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <p className="mt-8 text-sm text-zinc-500">
            No profiles yet.{' '}
            <Link href="/upload" className="underline">
              Upload the first one
            </Link>
            .
          </p>
        )}

        {!loading && profiles.length > 0 && (
          <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800">
            {profiles.map((p) => {
              const id = p.id || p._id || p.profile_id;
              return (
                <li key={id}>
                  <Link
                    href={`/profiles/${id}`}
                    className="block py-5 -mx-3 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {p.name}
                      </h2>
                      <span className="text-xs text-zinc-500 shrink-0 font-mono">
                        {p.printer_type}
                      </span>
                    </div>
                    {p.description && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}