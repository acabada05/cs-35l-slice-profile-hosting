import { getAuthToken } from "./authContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Auto-append Authorization header if user is logged in
function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function signUpUser({ username, email, password }) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Signup failed');
  return data;
}

export async function loginUser({ username, password }) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  // Returns { access_token, token_type }
  return data;
}

export async function uploadProfile({ name, printer, description, file }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('printer_type', printer);
  formData.append('description', description);
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/profiles/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  return { id: data.profile_id, name: data.name };
}

export async function listProfiles() {
  const res = await fetch(`${API_URL}/api/profiles`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load profiles (${res.status})`);
  const data = await res.json();
  return data.profiles || [];
}

export async function getProfile(id) {
  const res = await fetch(`${API_URL}/api/profiles/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  const data = await res.json();
  return data.profile;
}

export async function deleteProfile(profileId) {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("slice_profile_token="))
    ?.split("=")[1];

  const res = await fetch(`${API_URL}/api/profiles/${profileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete profile");
  }

  return await res.json();
}
