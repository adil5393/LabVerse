import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { checkCredentials, credentialsConfigured, useAuthStore } from '../../../store/useAuthStore';

describe('sign-in', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AUTH_USERNAME', 'labverse');
    vi.stubEnv('VITE_AUTH_PASSWORD', 'Lab@2026!');
    useAuthStore.setState({ user: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  it('matches the typed credentials with the .env values exactly', () => {
    expect(checkCredentials('labverse', 'Lab@2026!')).toBe(true);
    expect(checkCredentials('labverse', 'lab@2026!')).toBe(false);
    expect(checkCredentials('Labverse', 'Lab@2026!')).toBe(false);
    expect(checkCredentials('', '')).toBe(false);
  });

  it('refuses everything when no credentials are configured', () => {
    vi.stubEnv('VITE_AUTH_USERNAME', '');
    vi.stubEnv('VITE_AUTH_PASSWORD', '');
    expect(credentialsConfigured()).toBe(false);
    expect(checkCredentials('', '')).toBe(false);
    expect(useAuthStore.getState().login('', '', true)).toBe(false);
  });

  it('login starts a session only for good credentials, and logout ends it', () => {
    expect(useAuthStore.getState().login('labverse', 'wrong', false)).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().login('labverse', 'Lab@2026!', false)).toBe(true);
    expect(useAuthStore.getState().user).toBe('labverse');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });

  // The store starts signed in under `vite dev` (a development shortcut), so these two load it as a production build would.
  const freshPages = async () => {
    vi.stubEnv('DEV', false);
    vi.resetModules();
    const [{ LoginPage }, { RequireAuth }] = await Promise.all([import('../LoginPage'), import('../RequireAuth')]);
    return { LoginPage, RequireAuth };
  };

  it('renders the sign-in form with both fields, the remember option and a disabled submit', async () => {
    const { LoginPage } = await freshPages();
    const html = renderToStaticMarkup(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(html).toContain('data-testid="login-form"');
    expect(html).toContain('id="username"');
    expect(html).toContain('type="password"');
    expect(html).toContain('Remember this device');
    expect(html).toContain('Sign In to LabVerse');
    expect(html).toMatch(/data-testid="login-submit"[^>]*disabled|disabled=""[^>]*data-testid="login-submit"/);
  });

  it('keeps signed-out visitors out of the app', async () => {
    const { RequireAuth } = await freshPages();
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/physics']}><RequireAuth /></MemoryRouter>);
    expect(html).toBe('');
  });
});
