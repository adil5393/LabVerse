import { create } from 'zustand';

/**
 * Sign-in for now: the typed user name and password are compared as plain text with the VITE_AUTH_* values in frontend/.env.
 * That is a placeholder, not security: Vite bakes those values into the browser bundle, so anyone who can load the site can
 * read them. A real backend check replaces `checkCredentials` later.
 */
const SESSION_KEY = 'labverse.session';
const REMEMBER_DAYS = 30;

interface Session { user: string; at: number; remember: boolean }

const configured = () => ({ user: import.meta.env.VITE_AUTH_USERNAME ?? '', pass: import.meta.env.VITE_AUTH_PASSWORD ?? '' });

/** True when credentials are set in .env and both typed values match them exactly. */
export function checkCredentials(username: string, password: string): boolean {
  const c = configured();
  return c.user !== '' && c.pass !== '' && username === c.user && password === c.pass;
}

export const credentialsConfigured = (): boolean => configured().user !== '' && configured().pass !== '';

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (typeof s.user !== 'string' || typeof s.at !== 'number') return null;
    // A changed .env signs everyone out; a remembered session lapses after 30 days.
    if (s.user !== configured().user) return null;
    if (s.remember && Date.now() - s.at > REMEMBER_DAYS * 24 * 3600 * 1000) return null;
    return s;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (s) (s.remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* storage can be blocked; the session then lasts until the page closes */
  }
}

interface AuthState {
  user: string | null;
  /** Returns true and starts a session when the credentials match. */
  login: (username: string, password: string, remember: boolean) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readSession()?.user ?? (import.meta.env.DEV ? (configured().user || 'labverse') : null),
  login: (username, password, remember) => {
    if (!checkCredentials(username, password)) return false;
    writeSession({ user: username, at: Date.now(), remember });
    set({ user: username });
    return true;
  },
  logout: () => {
    writeSession(null);
    set({ user: null });
  },
}));
