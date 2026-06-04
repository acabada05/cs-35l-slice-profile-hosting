'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { listProfiles, getProfile } from '@/lib/api';
import { isAuthenticated } from '@/lib/authContext';

// react-diff-viewer-continued uses browser APIs, load client-side only
const ReactDiffViewer = dynamic(
  () => import('react-diff-viewer-continued'),
  { ssr: false }
);

export default function ComparePage() {
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState('');

  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

  const [leftProfile, setLeftProfile] = useState(null);
  const [rightProfile, setRightProfile] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  const [splitView, setSplitView] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Determine user session status
    const authed = isAuthenticated();
    setIsLoggedIn(authed);

    if (!authed) {
      setProfilesLoading(false);
      return;
    }

    // Load current user's profiles
    listProfiles()
      .then(setProfiles)
      .catch((err) => setProfilesError(err.message || 'Failed to load profiles.'))
      .finally(() => setProfilesLoading(false));
  }, []);

  useEffect(() => {
    if (!leftId || !rightId) {
      setLeftProfile(null);
      setRightProfile(null);
      setCompareError('');
      return;
    }
    if (leftId === rightId) {
      setCompareError('Please select two different profiles to compare.');
      setLeftProfile(null);
      setRightProfile(null);
      return;
    }

    setComparing(true);
    setCompareError('');
    
    Promise.all([getProfile(leftId), getProfile(rightId)])
      .then(([left, right]) => {
        setLeftProfile(left);
        setRightProfile(right);
      })
      .catch((err) => {
        setCompareError(err.message || 'Failed to load profiles for comparison.');
        setLeftProfile(null);
        setRightProfile(null);
      })
      .finally(() => setComparing(false));
  }, [leftId, rightId]);

  const selectClass =
    'block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100';

  // Authentication Guard
  if (!profilesLoading && !isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Authentication Required</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Please log in to compare differences between your personal slicer profiles side-by-side.
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Compare profiles
          </h1>
          <Link
            href="/browse"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to browse
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Select two profiles to see their configuration differences side by side.
        </p>

        {profilesLoading && (
          <p className="mt-8 text-sm text-zinc-500">Loading profile list…</p>
        )}

        {profilesError && !profilesLoading && (
          <div className="mt-8 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            {profilesError}
          </div>
        )}

        {!profilesLoading && !profilesError && profiles.length < 2 && (
          <p className="mt-8 text-sm text-zinc-500">
            You need at least two uploaded profiles to compare.{' '}
            <Link href="/upload" className="underline">
              Upload one
            </Link>
            .
          </p>
        )}

        {!profilesLoading && !profilesError && profiles.length >= 2 && (
          <>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="left"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                >
                  Profile A
                </label>
                <select
                  id="left"
                  value={leftId}
                  onChange={(e) => setLeftId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a profile…</option>
                  {profiles.map((p) => {
                    const id = p.id || p._id || p.profile_id;
                    return (
                      <option key={id} value={id}>
                        {p.name} {p.printer_type ? `(${p.printer_type})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor="right"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                >
                  Profile B
                </label>
                <select
                  id="right"
                  value={rightId}
                  onChange={(e) => setRightId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a profile…</option>
                  {profiles.map((p) => {
                    const id = p.id || p._id || p.profile_id;
                    return (
                      <option key={id} value={id}>
                        {p.name} {p.printer_type ? `(${p.printer_type})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {comparing && (
              <p className="mt-8 text-sm text-zinc-500">Loading comparison…</p>
            )}

            {compareError && !comparing && (
              <div className="mt-8 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
                {compareError}
              </div>
            )}

            {leftProfile && rightProfile && !comparing && (
              <section className="mt-12">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Comparing{' '}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {leftProfile.name}
                    </span>{' '}
                    →{' '}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {rightProfile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSplitView((v) => !v)}
                    className="text-xs px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    {splitView ? 'Unified view' : 'Side-by-side view'}
                  </button>
                </div>

                <div className="rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <ReactDiffViewer
                    oldValue={leftProfile.config_content || ''}
                    newValue={rightProfile.config_content || ''}
                    splitView={splitView}
                    leftTitle={leftProfile.file_name || leftProfile.name}
                    rightTitle={rightProfile.file_name || rightProfile.name}
                  />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
