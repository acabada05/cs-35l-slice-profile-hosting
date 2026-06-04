"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getAuthUser, clearAuthSession, isAuthenticated } from "@/lib/authContext";

export default function AuthNavLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getAuthUser());
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleSignOut = () => {
    clearAuthSession();
    setUser(null);
    router.refresh();
    router.push("/login");
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/stl"
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          STL Files
        </Link>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {user}
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      Sign In
    </Link>
  );
}