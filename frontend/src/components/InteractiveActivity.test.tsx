// @vitest-environment happy-dom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';
import { InteractiveActivity } from './InteractiveActivity';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const host = document.createElement('div');
document.body.append(host);
const root = createRoot(host);
afterEach(() => { act(() => root.unmount()); host.remove(); });

it('preserves an experiment and restores focus, scrolling and background access after focus mode', () => {
  function Experiment() {
    const [moves, setMoves] = useState(0);
    return <button data-experiment onClick={() => setMoves(n => n + 1)}>Moves {moves}</button>;
  }
  act(() => root.render(<><aside>Lesson navigation</aside><InteractiveActivity><Experiment /></InteractiveActivity></>));
  const click = (selector: string) => act(() => host.querySelector<HTMLButtonElement>(selector)!.click());
  click('[data-experiment]');
  const experiment = host.querySelector('[data-experiment]');
  click('.activity-toolbar button');
  expect(host.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
  expect(host.querySelector('aside')!.inert).toBe(true);
  expect(document.body.style.overflow).toBe('hidden');
  expect(document.activeElement?.textContent).toContain('Back to lesson');
  click('[data-experiment]');
  act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(host.querySelector('[data-experiment]')).toBe(experiment);
  expect(experiment?.textContent).toBe('Moves 2');
  expect(host.querySelector('aside')!.inert).toBe(false);
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement?.textContent).toContain('Focus activity');
});
