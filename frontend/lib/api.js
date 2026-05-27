const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadProfile({ name, printer, description, file }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('printer_type', printer);
  formData.append('description', description);
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/profiles/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'Upload failed');
  // Backend returns { status, message, profile_id, name }
  return { id: data.profile_id, name: data.name };
}

export async function listProfiles() {
  const res = await fetch(`${API_URL}/api/profiles`);
  if (!res.ok) throw new Error(`Failed to load profiles (${res.status})`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'Failed to load');
  // Backend returns { profiles: [...], count }
  return data.profiles || [];
}

export async function getProfile(id) {
  const res = await fetch(`${API_URL}/api/profiles/${id}`);
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'Profile not found');
  // Backend returns { profile: {...} }
  return data.profile;
}
