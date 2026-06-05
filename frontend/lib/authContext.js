import Cookies from "js-cookie";

const TOKEN_KEY = "slice_profile_token";
const USER_KEY = "slice_profile_user";

export function setAuthSession(token, username) {
  // Store token for 7 days
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: false, sameSite: 'strict' });
  Cookies.set(USER_KEY, username, { expires: 7, secure: false, sameSite: 'strict' });
}

export function getAuthToken() {
  return Cookies.get(TOKEN_KEY);
}

export function getAuthUser() {
  return Cookies.get(USER_KEY);
}

export function clearAuthSession() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

export function isAuthenticated() {
  return !!getAuthToken();
}
