// Access token lives in memory only - never in localStorage/sessionStorage.
// This is intentional: localStorage is readable by any injected script
// (XSS), while an in-memory value disappears on tab close/reload. The
// httpOnly refresh-token cookie (set by the server) is what survives a
// reload; AuthContext calls /auth/refresh on app start to get a fresh
// access token back into memory. See context/AuthContext.jsx.

let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}
