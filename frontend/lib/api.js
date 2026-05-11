// All backend calls live here. If the API contract changes,
// only this file needs to update.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadProfile({ name, printer, description, file }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('printer', printer);
  formData.append('description', description);
  formData.append('file', file);

  const res = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json();
}

export async function listProfiles() {
  const res = await fetch(`${API_URL}/profiles`);
  if (!res.ok) throw new Error(`Failed to load profiles (${res.status})`);
  return res.json();
}

export async function getProfile(id) {
  const res = await fetch(`${API_URL}/profiles/${id}`);
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  return res.json();
}