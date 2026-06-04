'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { listProfiles } from '@/lib/api';
import { getRecentlyViewed, clearRecentlyViewed } from '@/lib/recentlyViewed';
import { isAuthenticated } from '@/lib/authContext';

export default function BrowsePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Determine user session status
    const authed = isAuthenticated();
    setIsLoggedIn(authed);

    if (!authed) {
      setLoading(false);
      return;
    }

    // Load the current user's profiles
    listProfiles()
      .then((liveProfiles) => {
        setProfiles(liveProfiles);

        // Filter deleted profiles
        const localHistory = getRecentlyViewed() || [];
        const validRecent = localHistory.filter((recentItem) =>
          liveProfiles.some((p) => (p.id || p._id) === recentItem.id)
        );

        setRecent(validRecent);

        // Sync the filtered, cleaned history array back to localStorage
        try {
          const STORAGE_KEY = 'slice-profiles:recently-viewed';
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validRecent));
          }
        } catch (e) {
          console.error("Failed to sync historical storage:", e);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load profiles.'))
      .finally(() => setLoading(false));
  }, []);

  function handleClearRecent() {
    clearRecentlyViewed();
    setRecent([]);
  }

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const fields = [p.name, p.printer_type, p.description]
        .filter(Boolean)
        .map((f) => String(f).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [profiles, query]);

  const inputClass =
    'block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100';

  if (!loading && !isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Authentication Required</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Please log in to manage, query, and search your secure 3D slicer profiles.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center h-10 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            My Profiles
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

        {/* Recently viewed carousel block */}
        {recent.length > 0 && (
          <section className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Recently viewed
              </h2>
              <button
                type="button"
                onClick={handleClearRecent}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <ul className="flex gap-2 overflow-x-auto pb-2">
              {recent.map((p) => (
                <li key={p.id} className="shrink-0">
                  <Link
                    href={`/profiles/${p.id}`}
                    className="block px-4 py-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors min-w-[180px]"
                  >
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {p.name}
                    </div>
                    {p.printer_type && (
                      <div className="text-xs text-zinc-500 font-mono mt-1 truncate">
                        {p.printer_type}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && !error && profiles.length > 0 && (
          <div className="mt-8 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, printer, or description…"
              className={inputClass}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {loading && <p className="mt-8 text-sm text-zinc-500">Loading…</p>}

        {error && !loading && (
          <div className="mt-8 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <p className="mt-8 text-sm text-zinc-500">
            You haven't uploaded any profiles yet.{' '}
            <Link href="/upload" className="underline">
              Upload your first one
            </Link>
            .
          </p>
        )}

        {!loading && !error && profiles.length > 0 && filteredProfiles.length === 0 && (
          <p className="mt-8 text-sm text-zinc-500">
            No profiles match &ldquo;{query}&rdquo;.{' '}
            <button
              type="button"
              onClick={() => setQuery('')}
              className="underline cursor-pointer"
            >
              Clear search
            </button>
          </p>
        )}

        {!loading && filteredProfiles.length > 0 && (
          <>
            {query && (
              <p className="mt-6 text-xs text-zinc-500">
                Showing {filteredProfiles.length} of {profiles.length}
              </p>
            )}
            <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800">
              {filteredProfiles.map((p) => {
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
          </>
        )}
      </div>
    </div>
  );
}
