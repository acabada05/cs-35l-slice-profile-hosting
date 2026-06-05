"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, isAuthenticated } from "@/lib/authContext";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function STLPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/stl`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".stl")) {
      setError("Only .stl files are accepted.");
      return;
    }
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${baseUrl}/api/stl/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: form,
      });
      if (!res.ok) throw new Error();
      await fetchFiles();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await fetch(`${baseUrl}/api/stl/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setFiles((prev) => prev.filter((f) => f.file_id !== fileId));
    } catch {
      setError("Delete failed.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8">
        STL Files
      </h1>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors mb-8 ${
          dragOver
            ? "border-zinc-500 bg-zinc-100 dark:bg-zinc-800"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files[0])}
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {uploading ? "Uploading…" : "Drop an STL file here or click to browse"}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-6">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No files uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {files.map((f) => (
            <li key={f.file_id} className="flex items-center justify-between py-3">
              <button
                onClick={() => router.push(`/stl/${f.file_id}`)}
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-500 dark:hover:text-zinc-400 text-left truncate max-w-xs"
              >
                {f.original_name}
              </button>
              <div className="flex items-center gap-4 ml-4 shrink-0">
                <button
                onClick={() => {
                    fetch(`${baseUrl}/api/stl/${f.file_id}/download`, {
                    headers: { Authorization: `Bearer ${getAuthToken()}` },
                    })
                    .then((r) => r.blob())
                    .then((blob) => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = f.original_name;
                        a.click();
                        URL.revokeObjectURL(url);
                    });
                }}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                Download
                </button>
                <button
                  onClick={() => handleDelete(f.file_id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
