'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProfile } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [printer, setPrinter] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a configuration file.');
      return;
    }
    setSubmitting(true);
    try {
      const profile = await uploadProfile({ name, printer, description, file });
      router.push(`/profiles/${profile.id}`);
    } catch (err) {
      setError(err.message || 'Upload failed. Is the backend running?');
      setSubmitting(false);
    }
  }

  const inputClass =
    'mt-2 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100';

  return (
    <div className="flex-1 px-6 py-16">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Upload a slicer profile
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Share your tuned printer settings with the community.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Profile name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="PLA — 0.2mm fast draft"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="printer" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Printer model
            </label>
            <input
              id="printer"
              type="text"
              required
              value={printer}
              onChange={(e) => setPrinter(e.target.value)}
              placeholder="Bambu Lab P1S"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this profile good for?"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Configuration file
            </label>
            <input
              id="file"
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-zinc-700 dark:text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-black file:text-sm file:font-medium hover:file:bg-zinc-800 dark:hover:file:bg-zinc-200 file:cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-xs text-zinc-500">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Uploading…' : 'Upload profile'}
          </button>
        </form>
      </div>
    </div>
  );
}