"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProfile } from "@/lib/api";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { getAuthToken, isAuthenticated } from "@/lib/authContext";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Edit Drawer
// ---------------------------------------------------------------------------
function EditDrawer({ profile, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    printer_type: "",
    config_content: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const drawerRef = useRef(null);

  // Sync form when drawer opens / profile changes
  useEffect(() => {
    if (open && profile) {
      setForm({
        name: profile.name ?? "",
        description: profile.description ?? "",
        printer_type: profile.printer_type ?? "",
        config_content: profile.config_content ?? "",
      });
      setError("");
    }
  }, [open, profile]);

  // Trap focus & close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Profile name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = getAuthToken();
      console.log("submitting body:", JSON.stringify(form));

      const res = await fetch(
        `${baseUrl}/api/profiles/${profile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // FastAPI validation errors come back as { detail: [...] } or { detail: "string" }
        const detail = body.detail;
        if (Array.isArray(detail)) {
          throw new Error(detail.map((e) => e.msg).join("; "));
        }
        throw new Error(typeof detail === "string" ? detail : body.message || "Failed to save changes.");
      }

      const { profile: updated } = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Edit profile"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Name */}
          <Field label="Profile Name" required>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g. PLA Fine Detail 0.2mm"
              className={inputCls}
            />
          </Field>

          {/* Printer Type */}
          <Field label="Printer Type">
            <input
              type="text"
              value={form.printer_type}
              onChange={handleChange("printer_type")}
              placeholder="e.g. Bambu X1C, Prusa MK4"
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Describe what this profile is optimised for…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* G-Code / INI */}
          <Field label="G-Code / Slicer INI Content">
            <textarea
              value={form.config_content}
              onChange={handleChange("config_content")}
              placeholder="; Paste your slicer config here"
              rows={14}
              spellCheck={false}
              className={`${inputCls} resize-y font-mono text-xs`}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------
const inputCls =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition";

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ProfileDetailsPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const profileId = unwrappedParams.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    async function fetchProfileDetails() {
      try {
        const res = await fetch(
          `${baseUrl}/api/profiles/${profileId}`,
          { headers: { Authorization: `Bearer ${getAuthToken()}` } }
        );
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
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this profile?"
    );
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    try {
      await deleteProfile(profileId);
      router.refresh();
      router.push("/browse");
    } catch (err) {
      setError(err.message || "Failed to remove the profile configuration.");
      setDeleting(false);
    }
  };

  // Called by EditDrawer after a successful save
  const handleSaved = (updated) => {
    setProfile(updated);
    addRecentlyViewed(updated);
    router.refresh(); // revalidate any server-cached pages
  };

  if (loading)
    return (
      <div className="p-8 text-sm text-zinc-500">
        Loading profile configurations…
      </div>
    );
  if (error && !profile)
    return <div className="p-8 text-sm text-red-500">{error}</div>;

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          href="/browse"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to profiles
        </Link>

        {/* Header */}
        <div className="mt-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {profile.name}
          </h1>

          <div className="mt-3 flex items-center gap-4">
            <p className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {profile.printer_type || "Universal Slicer Profile"}
            </p>

            {/* Edit */}
            <button
              onClick={() => setEditOpen(true)}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Edit Profile
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {deleting ? "Deleting…" : "Delete Profile"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Description
            </h2>
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
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              G-Code / Slicer INI Content
            </h2>
            <pre className="p-4 rounded-xl bg-zinc-940 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-800 dark:text-zinc-300 max-h-96">
              {profile.config_content}
            </pre>
          </div>
        </div>
      </div>

      {/* Edit drawer — rendered outside the content flow so it overlays everything */}
      <EditDrawer
        profile={profile}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
