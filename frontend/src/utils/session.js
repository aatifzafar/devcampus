// Signed-in session, calls to the backend, and each user's saved data.
//
// The sign-in token is kept per browser tab (sessionStorage), so a faculty
// member and a student can be signed in side by side in two tabs.
const API = '/api';
const TOKEN_KEY = 'alliance-token';
const USER_KEY = 'alliance-user';
export const AUTH_EVENT = 'alliance-auth-change';
export const SYNC_ERROR = 'alliance-sync-error';
export const STATE_EVENT = 'alliance-local-change';

const ss = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};

let token = ss.get(TOKEN_KEY);
let user = (() => { try { return JSON.parse(ss.get(USER_KEY) || 'null'); } catch { return null; } })();

export const getToken = () => token;
export const getUser = () => user;
export const isSignedIn = () => Boolean(token && user);

/* Requests ---------------------------------------------------------------- */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// fetch() with the sign-in token. Returns parsed JSON "data" (or the whole body).
export async function apiFetch(path, { method = 'GET', body, raw, headers = {}, blob = false } = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError('Can’t reach the server. Check that the backend is running (npm start in the backend folder).', 0);
  }
  if (res.status === 401 && token) {
    signOut();
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }
  if (blob) {
    if (!res.ok) throw new ApiError((await res.json().catch(() => ({}))).message || `Request failed (${res.status})`, res.status);
    return res;
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const proxyDown = res.status === 502 || res.status === 504 || (res.status === 500 && !json.message);
    throw new ApiError(proxyDown ? 'Can’t reach the server. Check that the backend is running (npm start in the backend folder).' : json.message || `Request failed (${res.status})`, res.status);
  }
  return 'data' in json ? json.data : json;
}

/* Sign in / out ------------------------------------------------------------ */

export async function signIn(email, password) {
  const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  token = res.token;
  user = res.user;
  ss.set(TOKEN_KEY, token);
  ss.set(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
  return user;
}

export function signOut() {
  token = null;
  user = null;
  state = {};
  ss.set(TOKEN_KEY, null);
  ss.set(USER_KEY, null);
  closeStream();
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function refreshUser() {
  user = await apiFetch('/auth/me');
  ss.set(USER_KEY, JSON.stringify(user));
  return user;
}

/* Saved data (user_state on the server) ------------------------------------ */

// Keys that only matter inside one tab stay in the browser.
const LOCAL_ONLY = new Set(['alliance-f-course', 'alliance-f-selection']);
export const isSyncedKey = (key) => key.startsWith('alliance-') && !LOCAL_ONLY.has(key);

let state = {};
const timers = {};

export async function loadState() {
  state = await apiFetch('/state');
  return state;
}
export const stateHas = (key) => Object.prototype.hasOwnProperty.call(state, key) && state[key] !== null;
export const stateGet = (key, fallback) => (stateHas(key) ? state[key] : fallback);

// Save a key: updates the local copy now, sends it to the server shortly after.
export function stateSet(key, value) {
  state[key] = value;
  clearTimeout(timers[key]);
  timers[key] = setTimeout(async () => {
    try {
      const fresh = await apiFetch(`/state/${key}`, { method: 'PUT', body: { value } });
      // Shared keys come back merged with other people's changes.
      if (fresh !== undefined && fresh !== null && typeof fresh === 'object' && !('success' in fresh)) {
        state[key] = fresh;
        window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: key }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent(SYNC_ERROR, { detail: err.message }));
    }
  }, 400);
}

// Read / write a saved key outside React: the server copy when signed in,
// this browser's localStorage otherwise.
export function readSaved(key, fallback) {
  if (isSignedIn() && isSyncedKey(key)) return stateGet(key, fallback);
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function writeSaved(key, value) {
  if (isSignedIn() && isSyncedKey(key)) stateSet(key, value);
  else {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }
  window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: key }));
}

async function reloadKey(key) {
  try {
    state[key] = await apiFetch(`/state/${key}`);
    window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: key }));
  } catch {
    /* ignore */
  }
}

/* Live updates ------------------------------------------------------------- */

let source = null;
const listeners = new Set();
export const onServerEvent = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function openStream() {
  if (source || !token) return;
  source = new EventSource(`${API}/stream?token=${encodeURIComponent(token)}`);
  source.onmessage = (e) => {
    let msg;
    try { msg = JSON.parse(e.data); } catch { return; }
    if (msg.kind?.startsWith('state:')) {
      const key = msg.kind.slice(6);
      if (!timers[key] || state[key] === undefined) reloadKey(key);
      else setTimeout(() => reloadKey(key), 600);
    }
    listeners.forEach((fn) => fn(msg));
  };
}

function closeStream() {
  source?.close();
  source = null;
}
