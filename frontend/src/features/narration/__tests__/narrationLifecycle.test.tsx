// @vitest-environment happy-dom
/**
 * React lifecycle tests for lesson narration, in a DOM (happy-dom) with a scripted speech engine. They prove the wiring: Listen starts
 * speech, and unmount, a new segment list, a new resetKey, a hidden tab and pagehide all cancel it, with no stale speech left.
 * They cannot prove that sound is audible; that was checked separately in a real browser (see SOUND_SND0_READINESS_REPORT.md).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { NarrationEnabledProvider, NarrationRegion, Nar } from '../NarrationRegion';
import { NarrationPlayer } from '../NarrationPlayer';
import { setSpeechProvider, type SpeakCallbacks, type SpeakRequest, type SpeechProvider } from '../../../engine/narration/provider';
import { useNarrationSettings } from '../../../engine/narration/settings';
import type { NarrationSegment } from '../../../engine/narration/controller';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class Fake implements SpeechProvider {
  supported = true;
  spoken: SpeakRequest[] = [];
  live: { cb: SpeakCallbacks; cancelled: boolean }[] = [];
  speak(req: SpeakRequest, cb: SpeakCallbacks) { const u = { cb, cancelled: false }; this.spoken.push(req); this.live.push(u); return () => { u.cancelled = true; }; }
  cancel() {}
  voices() { return []; }
  onVoicesChanged() { return () => {}; }
  get active() { return this.live.filter((u) => !u.cancelled).length; }
  endCurrent() { [...this.live].reverse().find((u) => !u.cancelled)?.cb.onEnd(); }
}

const SEGS: NarrationSegment[] = [{ id: 's1', text: 'First sentence.' }, { id: 's2', text: 'Second sentence.' }];
let fake: Fake; let host: HTMLDivElement; let root: Root;

const View: React.FC<{ segs?: NarrationSegment[]; resetKey?: string }> = ({ segs = SEGS, resetKey = 'a' }) => (
  <NarrationEnabledProvider enabled>
    <NarrationRegion segments={segs} resetKey={resetKey}>
      <NarrationPlayer label="this test" />
      {segs.map((s) => <Nar key={s.id} id={s.id}>{s.text}</Nar>)}
    </NarrationRegion>
  </NarrationEnabledProvider>
);

const render = (el: React.ReactElement) => act(() => { root.render(el); });
const click = (sel: string) => act(() => { (host.querySelector(sel) as HTMLElement).click(); });
const state = () => host.querySelector('[data-testid="narration-player"]')?.getAttribute('data-state');
const highlighted = () => [...host.querySelectorAll('[data-narrating="true"]')].map((e) => e.getAttribute('data-narration-id'));

beforeEach(() => { fake = new Fake(); setSpeechProvider(fake); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); useNarrationSettings.setState({ rate: 1, voiceURI: null }); });
afterEach(() => { act(() => root.unmount()); host.remove(); setSpeechProvider(null); });

describe('narration lifecycle in the DOM', () => {
  it('renders idle and never speaks by itself', async () => {
    await render(<View />);
    expect(state()).toBe('idle');
    expect(fake.spoken).toEqual([]);
  });

  it('Listen starts speech, highlights the sentence being read, and the controls appear', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    expect(fake.spoken[0].text).toBe('First sentence.');
    expect(state()).toBe('playing');
    expect(highlighted()).toEqual(['s1']);
    await act(() => fake.endCurrent());
    expect(highlighted()).toEqual(['s2']);
    expect(host.querySelector('[data-testid="narration-progress"]')?.textContent).toBe('2 of 2');
  });

  it('pause then resume repeats the sentence; Stop clears the highlight', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    await click('[data-narration-action="pause"]');
    expect(state()).toBe('paused'); expect(fake.active).toBe(0);
    await click('[data-narration-action="resume"]');
    expect(fake.spoken.map((r) => r.text)).toEqual(['First sentence.', 'First sentence.']);
    await click('[data-narration-action="stop"]');
    expect(state()).toBe('idle'); expect(highlighted()).toEqual([]); expect(fake.active).toBe(0);
  });

  it('UNMOUNT (leaving the page) cancels speech', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    expect(fake.active).toBe(1);
    await act(() => root.render(<div />));
    expect(fake.active).toBe(0);
  });

  it('a new resetKey (new step or lesson) stops speech', async () => {
    await render(<View resetKey="step-1" />);
    await click('[data-narration-action="play"]');
    await render(<View resetKey="step-2" />);
    expect(fake.active).toBe(0); expect(state()).toBe('idle'); expect(highlighted()).toEqual([]);
  });

  it('a different segment list (changed content) stops speech; an identical list does not', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    await render(<View segs={SEGS.map((s) => ({ ...s }))} />);
    expect(fake.active).toBe(1);
    await render(<View segs={[{ id: 'x', text: 'Different content.' }]} />);
    expect(fake.active).toBe(0);
  });

  it('a hidden tab and pagehide both stop speech', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    await act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(fake.active).toBe(0);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    await click('[data-narration-action="play"]');
    expect(fake.active).toBe(1);
    await act(() => { window.dispatchEvent(new Event('pagehide')); });
    expect(fake.active).toBe(0);
  });

  it('25 rapid Play/Stop cycles leave no live utterance and never two at once', async () => {
    await render(<View />);
    let maxActive = 0;
    for (let i = 0; i < 25; i++) {
      await click('[data-narration-action="play"]');
      maxActive = Math.max(maxActive, fake.active);
      await click('[data-narration-action="stop"]');
    }
    expect(maxActive).toBe(1);
    expect(fake.active).toBe(0);
    expect(state()).toBe('idle');
  });

  it('a late end from a cancelled utterance cannot restart or advance the new one', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    const old = fake.live[0];
    await click('[data-narration-action="replay"]');
    const n = fake.spoken.length;
    await act(() => old.cb.onEnd());
    expect(fake.spoken.length).toBe(n);
    expect(highlighted()).toEqual(['s1']);
  });

  it('changing the speed setting while playing restarts the sentence at the new speed', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    await act(() => { useNarrationSettings.getState().setRate(1.5); });
    expect(fake.spoken[fake.spoken.length - 1]).toMatchObject({ text: 'First sentence.', rate: 1.5 });
    expect(fake.active).toBe(1);
  });

  it('Escape in the controls stops narration', async () => {
    await render(<View />);
    await click('[data-narration-action="play"]');
    await act(() => { host.querySelector('[data-testid="narration-player"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(state()).toBe('idle'); expect(fake.active).toBe(0);
  });


  it('keeps keyboard focus on one stable button through play, pause and stop', async () => {
    await render(<View />);
    const main = host.querySelector('[data-testid="narration-player"] button') as HTMLButtonElement;
    main.focus();
    await click('[data-narration-action="play"]');
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('data-narration-action')).toBe('pause');
    await click('[data-narration-action="stop"]');
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('data-narration-action')).toBe('play');
  });

  it('is absent where narration is not enabled', async () => {
    await render(<NarrationEnabledProvider enabled={false}><NarrationRegion segments={SEGS}><NarrationPlayer /></NarrationRegion></NarrationEnabledProvider>);
    expect(host.querySelector('[data-testid="narration-player"]')).toBeNull();
  });
});
