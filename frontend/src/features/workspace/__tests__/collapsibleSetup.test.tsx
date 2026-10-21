// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ForceCartView } from '../../physics/forces/ForceCart';
import { MotionTrackView } from '../../physics/motion/MotionTrack';
import { TwoBodyView } from '../../physics/forces/TwoBody';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Collapsible experiment setup interaction tests', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
  });

  const q = <T extends Element = HTMLElement>(sel: string) => host.querySelector(sel) as T;
  const click = (sel: string) => {
    act(() => {
      q<HTMLElement>(sel)?.click();
    });
  };

  it('ForceCartView: toggles setup panel open and closed without altering simulation state', () => {
    act(() => {
      root.render(<ForceCartView editable graphs />);
    });

    const toggle = q('button[data-testid="force-setup-toggle"]');
    const panel = q('#force-cart-setup-panel');

    // Default: collapsed
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('force-cart-setup-panel');
    expect(panel.hasAttribute('hidden')).toBe(true);
    expect(panel.classList.contains('hidden')).toBe(true);

    // Click Setup toggle -> expands
    click('button[data-testid="force-setup-toggle"]');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);
    expect(panel.classList.contains('hidden')).toBe(false);

    // Play button can be clicked while Setup is open
    const playBtn = q<HTMLButtonElement>('[data-testid="force-play"]');
    expect(playBtn.getAttribute('aria-pressed')).toBe('false');
    click('[data-testid="force-play"]');
    expect(playBtn.getAttribute('aria-pressed')).toBe('true');

    // Toggling Setup closed does NOT affect the simulation running
    click('button[data-testid="force-setup-toggle"]');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hasAttribute('hidden')).toBe(true);
    expect(playBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('MotionTrackView: toggle opens and closes motion-setup-panel without resetting', () => {
    act(() => {
      root.render(
        <MotionTrackView
          range={[-50, 100]}
          start={0}
          moves={[10]}
          editable
          show={['position']}
          stepM={5}
          playback
          alt="track"
        />
      );
    });

    const toggle = q('button[data-testid="motion-setup-toggle"]');
    const panel = q('#motion-setup-panel');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hasAttribute('hidden')).toBe(true);

    // Open setup
    click('button[data-testid="motion-setup-toggle"]');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);

    // Close setup
    click('button[data-testid="motion-setup-toggle"]');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  it('TwoBodyView: toggles setup open/close seamlessly', () => {
    act(() => {
      root.render(<TwoBodyView editable />);
    });

    const toggle = q('button[data-testid="two-body-setup-toggle"]');
    const panel = q('#two-body-setup-panel');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hasAttribute('hidden')).toBe(true);

    click('button[data-testid="two-body-setup-toggle"]');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);
  });
});
