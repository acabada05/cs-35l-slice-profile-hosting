"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, signUpUser } from "@/lib/api";
import { setAuthSession } from "@/lib/authContext";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Status states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Handle User Registration
        await signUpUser({ username, email, password });
        // Automatically switch to sign-in view
        setIsSignUp(false);
        setPassword("");
        setError("Account created successfully! Please sign in.");
      } else {
        // Handle User Login
        const data = await loginUser({ username, password });
        // Save token & username to cookies
        setAuthSession(data.access_token, username);
        
        // 1. Move the user to their landing workspace first
        router.push("/browse");
        
        // 2. Clear Next.js client-side caches and force header layout re-verification
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 text-center">
          {isSignUp ? "Create an account" : "Sign in to Slice Profiles"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {isSignUp ? "Join to manage your 3D printer profiles" : "Access your private profile configurations"}
        </p>

        {error && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${
            error.includes("successfully") 
              ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400" 
              : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm"
              placeholder="johndoe"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
