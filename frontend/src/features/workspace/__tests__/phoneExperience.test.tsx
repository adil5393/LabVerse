// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceShell } from '../WorkspaceShell';
import { SubjectExplorer } from '../../explorer/SubjectExplorer';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Phone-first navigation and laboratory interactions', () => {
  let host: HTMLDivElement;
  let root: Root;
  let resize: (() => void) | undefined;
  let matches = true;
  const originalWidth = window.innerWidth;
  beforeEach(() => {
    matches = true;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ get matches() { return matches; }, addEventListener: (_: string, fn: () => void) => { resize = fn; }, removeEventListener: vi.fn() }) as unknown as MediaQueryList);
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth }); });
  const button = (text: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.endsWith(text))!;

  it('exposes tools and results on phones while retaining the same live canvas', () => {
    act(() => root.render(<MemoryRouter><WorkspaceShell chapterId="coordinate-geometry" labTitle="Geometry" viewport={<div data-live-canvas>Canvas</div>} inspector={<label>Radius<input defaultValue="4" /></label>} outliner={<button>Place a point</button>} analysisDock={<div>Measured distance: 5 m</div>} /></MemoryRouter>));
    expect(host.querySelector('[data-testid="phone-workspace"]')).not.toBeNull();
    const canvas = host.querySelector('[data-live-canvas]');
    act(() => button('Results').click());
    expect(host.textContent).toContain('Measured distance: 5 m');
    expect(host.querySelector('[data-live-canvas]')).toBe(canvas);
    act(() => button('Tools').click());
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Place a point');
    expect(document.body.style.overflow).toBe('hidden');
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('responds to breakpoint changes without mounting both specialised canvases', () => {
    act(() => root.render(<MemoryRouter><WorkspaceShell chapterId="motion" labTitle="Motion" viewport={<div data-desktop-scene />} mobileLayout={<div data-phone-scene />} /></MemoryRouter>));
    expect(host.querySelector('[data-phone-scene]')).not.toBeNull();
    expect(host.querySelector('[data-desktop-scene]')).toBeNull();
    matches = false;
    act(() => resize?.());
    expect(host.querySelector('[data-phone-scene]')).toBeNull();
    expect(host.querySelector('[data-desktop-scene]')).not.toBeNull();
  });

  it('searches available chapters and provides a clear empty state', () => {
    act(() => root.render(<MemoryRouter><SubjectExplorer /></MemoryRouter>));
    const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
    const enter = (value: string) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); };
    act(() => enter('circles'));
    expect(host.querySelector('a[href="/mathematics/circles"]')).not.toBeNull();
    act(() => enter('no-such-chapter'));
    expect(host.querySelector('[role="status"]')?.textContent).toContain('No chapters match');
  });
});
