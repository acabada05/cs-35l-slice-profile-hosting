import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import AuthNavLinks from "./components/AuthNavLinks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Slice Profile Hosting",
  description: "Upload, share, and compare 3D printer slicer profiles",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Slice Profiles
            </Link>
            <div className="flex gap-6 text-sm items-center text-zinc-600 dark:text-zinc-400">
              <Link href="/browse" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Browse
              </Link>
              <Link href="/upload" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Upload
              </Link>
              <Link href="/compare" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Compare
              </Link>
              {/* This component displays Sign In / Sign Out dynamically */}
              <AuthNavLinks />
            </div>
          </div>
        </nav>
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
