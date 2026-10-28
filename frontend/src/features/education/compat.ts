/**
 * Temporary compatibility switches for older chapter paths kept during the migration to the unified framework. Each chapter
 * has its own flag in localStorage (`labverse.compat.legacy.<chapter>`), set by `?legacy=1` on that chapter's page and cleared
 * by `?legacy=0`. Off by default.
 */

export const legacyFlagKey = (chapterId: string): string => `labverse.compat.legacy.${chapterId}`;

export function legacyPathEnabled(chapterId: string, search: string = typeof window === 'undefined' ? '' : window.location.search, extraKeys: string[] = []): boolean {
  const q = new URLSearchParams(search).get('legacy');
  const key = legacyFlagKey(chapterId);
  try {
    if (q === '1') localStorage.setItem(key, 'on');
    if (q === '0') { localStorage.removeItem(key); for (const k of extraKeys) localStorage.removeItem(k); }
    return localStorage.getItem(key) === 'on' || extraKeys.some((k) => localStorage.getItem(k) === 'on');
  } catch {
    return q === '1';
  }
}
