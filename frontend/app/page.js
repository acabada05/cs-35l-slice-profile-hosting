import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center py-24">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          3D Printer Slicer Profile Hosting
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
          Upload, share, compare, and edit your tuned slicer profiles in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            Upload a profile
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Browse profiles
          </Link>
        </div>
      </div>
    </div>
  );
}