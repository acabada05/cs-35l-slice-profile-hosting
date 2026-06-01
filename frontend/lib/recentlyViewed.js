const STORAGE_KEY = 'slice-profiles:recently-viewed';
const MAX_ITEMS = 4;

function safeGetStorage() {
  // localStorage isn't available during SSR — return null and let callers no-op.
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getRecentlyViewed() {
  const storage = safeGetStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function addRecentlyViewed(profile) {
  const storage = safeGetStorage();
  if (!storage || !profile) return;

  const id = profile.id || profile._id || profile.profile_id;
  if (!id) return;

  const entry = {
    id,
    name: profile.name || 'Untitled',
    printer_type: profile.printer_type || '',
  };

  try {
    const current = getRecentlyViewed();
    // Remove existing entry for this id so it bubbles to the top.
    const filtered = current.filter((p) => p.id !== id);
    const next = [entry, ...filtered].slice(0, MAX_ITEMS);
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded or other storage error — silently ignore.
  }
}

export function clearRecentlyViewed() {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}