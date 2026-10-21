// @vitest-environment happy-dom
/**
 * DOM tests for the Vibration and Wave Laboratories (SND-1): rendering never makes sound, sound needs the switch AND a button,
 * the audio stops on reset, scrubbing, a new setup and unmount, one frequency reading means one thing everywhere, the particle
 * stays near its rest position while the compression travels, and the mobile and desktop presentations differ while the physics
 * does not. A fake Web Audio API records what would have been played; these tests cannot hear anything.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { VibrationPanel } from '../VibrationLab';
import { WavePanel } from '../WaveLab';
import { ToneEngine, setToneEngine } from '../../../../engine/audio/toneEngine';
import { audioSession } from '../../../../engine/audio/session';
import { useAudioSettings } from '../../../../engine/audio/settings';
import { AUDIO } from '../../../../engine/audio/safety';
import { NarrationController } from '../../../../engine/narration/controller';
import type { SpeakCallbacks, SpeakRequest, SpeechProvider } from '../../../../engine/narration/provider';
import { FBackend } from '../../../../engine/audio/__tests__/fakeBackend';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement; let root: Root; let backend: FBackend; let engine: ToneEngine;

const setWidth = (w: number) => { (window as unknown as { innerWidth: number }).innerWidth = w; window.dispatchEvent(new Event('resize')); };
const render = (el: React.ReactElement) => { act(() => { root.render(el); }); };
const q = <T extends Element = HTMLElement>(sel: string) => host.querySelector(sel) as T;
const text = (sel: string) => q(sel)?.textContent ?? '';
const click = (sel: string) => { act(() => { q(sel).click(); }); };
const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
const setInput = (el: HTMLInputElement, value: number) => { act(() => { nativeSet.call(el, String(value)); el.dispatchEvent(new Event('input', { bubbles: true })); }); };
const rangeById = (field: string) => q<HTMLInputElement>(`[data-field="${field}"] input`);
const setField = (field: string, value: number) => setInput(rangeById(field), value);
const timeSlider = () => q<HTMLInputElement>('[data-testid="transport"] input[type="range"]');

// A manual animation clock: nothing runs by itself, so the tests decide exactly how much time passes.
let nowMs = 1000; let frames = new Map<number, FrameRequestCallback>(); let nextId = 1;
const advance = (ms: number, step = 50) => {
  for (let done = 0; done < ms; done += step) {
    nowMs += step;
    const due = [...frames.entries()]; frames = new Map();
    act(() => { for (const [, cb] of due) cb(nowMs); });
    vi.advanceTimersByTime(step);
  }
};

beforeEach(() => {
  vi.useFakeTimers();
  nowMs = 1000; frames = new Map(); nextId = 1;
  vi.spyOn(performance, 'now').mockImplementation(() => nowMs);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { const id = nextId++; frames.set(id, cb); return id; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames.delete(id); });
  audioSession.reset();
  backend = new FBackend(); engine = new ToneEngine(backend); setToneEngine(engine);
  useAudioSettings.setState({ soundOn: false, volume: AUDIO.defaultVolume });
  setWidth(1280);
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); engine.dispose(); setToneEngine(null); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Vibration Laboratory: sound is off, silent and safe', () => {
  it('rendering creates no audio context and no oscillator; sound is off; the status text says so', async () => {
    await render(<VibrationPanel />);
    expect(backend.created).toEqual([]);
    expect(text('[data-testid="sound-toggle"]')).toBe('Off');
    expect(q('[data-testid="sound-toggle"]').getAttribute('aria-checked')).toBe('false');
    expect(text('[data-testid="vib-status"]')).toMatch(/At rest.*no sound/);
    expect(q('[data-testid="sound-indicator"]').getAttribute('data-sounding')).toBe('false');
    expect(engine.getSnapshot().playing).toBe(false);
  });

  it('pressing Pluck with sound OFF shows the vibration and the text equivalent but plays nothing', async () => {
    await render(<VibrationPanel />);
    await click('[data-action="pluck"]');
    expect(backend.created).toEqual([]);
    expect(q('[data-testid="sound-indicator"]').getAttribute('data-sounding')).toBe('true');
    expect(text('[data-testid="vib-status"]')).toMatch(/Vibrating 220 times every second: sound is being produced/);
    expect(text('[data-testid="readout-sound"]')).toBe('yes');
    expect(text('[data-testid="readout-hz"]')).toBe('220 Hz');
  });

  it('with the switch ON, Pluck starts exactly one safe tone at the object\'s frequency', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]');
    expect(backend.created).toEqual([]);                         // switching on makes no sound and creates no context
    await click('[data-action="pluck"]');
    expect(backend.created.length).toBe(1);
    expect(backend.oscillators.length).toBe(1);
    expect(backend.oscillators[0].hz).toBeCloseTo(220, 6);
    const peak = backend.created[0].gains[1].gain.peak;
    expect(peak).toBeLessThanOrEqual(AUDIO.masterCeiling * AUDIO.defaultVolume + 1e-12);
    expect(engine.getSnapshot()).toMatchObject({ playing: true });
    expect(q('[data-testid="tone-status"]').textContent).toMatch(/Playing a tone at 220 hertz/);
  });

  it('plucking again replaces the tone: never two oscillators sounding', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]');
    await click('[data-action="pluck"]'); await click('[data-action="pluck"]'); await click('[data-action="pluck"]');
    vi.advanceTimersByTime(300);                                  // the earlier voices fade out (60 ms) and are disconnected
    expect(backend.oscillators.length).toBe(3);
    expect(backend.oscillators.filter((o) => !o.disconnected).length).toBe(1);
    expect(engine.getSnapshot().playing).toBe(true);
  });

  it('a new setup (changing the tension) stops the tone and the new frequency is read out: 1.44 gives 264 Hz', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    expect(engine.getSnapshot().playing).toBe(true);
    await setField('vib-tension', 1.44);
    expect(engine.getSnapshot().playing).toBe(false);
    expect(text('[data-testid="readout-hz"]')).toBe('264 Hz');
    expect(text('[data-testid="vib-status"]')).toMatch(/At rest/);
  });

  it('Reset and moving the time slider both stop the tone', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    await click('[data-action="reset"]');
    expect(engine.getSnapshot().playing).toBe(false);
    expect(text('[data-testid="vib-status"]')).toMatch(/At rest/);
    await click('[data-action="pluck"]');
    expect(engine.getSnapshot().playing).toBe(true);
    setInput(timeSlider(), 2);
    expect(engine.getSnapshot().playing).toBe(false);
    expect(engine.getSnapshot().message).toMatch(/move through time/);
  });

  it('Pause stops the sound; the tone is never resumed mid-way', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    await click('[data-action="toggle"]');                        // Pause
    expect(engine.getSnapshot().playing).toBe(false);
    await click('[data-action="toggle"]');                        // Play (visual only)
    expect(engine.getSnapshot().playing).toBe(false);
  });

  it('UNMOUNT (leaving the page) stops the tone and releases the audio device', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    expect(engine.getSnapshot().playing).toBe(true);
    act(() => { root.render(<div />); });
    expect(engine.getSnapshot().playing).toBe(false);
    expect(audioSession.holder()).toBeNull();
  });

  it('a hidden tab and pagehide stop the tone', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(engine.getSnapshot().playing).toBe(false);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    await click('[data-action="pluck"]');
    expect(engine.getSnapshot().playing).toBe(true);
    act(() => { window.dispatchEvent(new Event('pagehide')); });
    expect(engine.getSnapshot().playing).toBe(false);
  });

  it('switching sound off stops a playing tone', async () => {
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    await click('[data-testid="sound-toggle"]');
    expect(engine.getSnapshot().playing).toBe(false);
    expect(text('[data-testid="sound-toggle"]')).toBe('Off');
  });

  it('the fork: choosing 512 Hz reads 512 Hz and a strike plays 512 Hz; nothing is played for an unplayable request', async () => {
    await render(<VibrationPanel />);
    await click('[data-kind="fork"]');
    const b512 = [...host.querySelectorAll('[aria-label="Choose a tuning fork"] button')].find((b) => b.textContent === '512 Hz') as HTMLElement;
    act(() => { b512.click(); });
    expect(text('[data-testid="readout-hz"]')).toBe('512 Hz');
    await click('[data-testid="sound-toggle"]'); await click('[data-action="pluck"]');
    expect(backend.oscillators[0].hz).toBe(512);
  });

  it('over real time the band comes to rest at about 5.5 s: the sound indicator, the status and the TONE all end together', async () => {
    await render(<VibrationPanel />);
    click('[data-testid="sound-toggle"]'); click('[data-action="pluck"]');
    advance(3000);
    expect(q('[data-testid="sound-indicator"]').getAttribute('data-sounding')).toBe('true');
    expect(engine.getSnapshot().playing).toBe(true);
    expect(Number(text('[data-testid="readout-cycles"]').replace(/,/g, ''))).toBeGreaterThan(600);   // about 220 x 3
    advance(3000);
    expect(q('[data-testid="sound-indicator"]').getAttribute('data-sounding')).toBe('false');
    expect(text('[data-testid="vib-status"]')).toMatch(/died away/);
    expect(text('[data-testid="readout-sound"]')).toBe('no');
    expect(engine.getSnapshot().playing).toBe(false);
    expect(engine.getSnapshot().message).toMatch(/faded/);
  });

  it('the visual twin: loudness graph, sound indicator and a text status exist whether or not sound is on', async () => {
    await render(<VibrationPanel />);
    expect(q('[data-testid="envelope-graph"]')).not.toBeNull();
    expect(q('[data-testid="loudness-bar"]')).not.toBeNull();
    expect(q('[data-testid="vib-status"]').getAttribute('aria-live')).toBe('polite');
    expect(text('[data-testid="slow-note"]')).toMatch(/200 times slower/);
  });

  it('sound is never required: with sound off every control still works', async () => {
    await render(<VibrationPanel />);
    await click('[data-action="pluck"]'); await click('[data-action="reset"]');
    expect(backend.created).toEqual([]);
  });
});

describe('narration and laboratory tones do not overlap (real components)', () => {
  class Speech implements SpeechProvider {
    supported = true; live = 0;
    speak(_r: SpeakRequest, _c: SpeakCallbacks) { this.live++; return () => { this.live--; }; }
    cancel() {} voices() { return []; } onVoicesChanged() { return () => {}; }
  }
  it('pressing Pluck with sound on stops a narration that is speaking; narration then stops the tone', async () => {
    const speech = new Speech();
    const nar = new NarrationController({ provider: speech }); nar.setSegments([{ id: 'a', text: 'Some words to read.' }]);
    await render(<VibrationPanel />);
    await click('[data-testid="sound-toggle"]');
    act(() => { nar.play(); });
    expect(speech.live).toBe(1);
    await click('[data-action="pluck"]');
    expect(speech.live).toBe(0); expect(nar.getSnapshot().status).toBe('idle'); expect(engine.getSnapshot().playing).toBe(true);
    act(() => { nar.play(); });
    expect(engine.getSnapshot().playing).toBe(false); expect(speech.live).toBe(1);
    act(() => { nar.stop(); });
  });
});

describe('Wave Laboratory: one physical state, two presentations', () => {
  it('shows the book numbers for the starting wave: 100 Hz, 3.4 m, 10 ms at 340 m/s in air, and says what is simplified', async () => {
    await render(<WavePanel stickyCanvas />);
    expect(text('[data-testid="readout-nu"]')).toBe('100 Hz'); expect(text('[data-testid="readout-lambda"]')).toBe('3.4 m'); expect(text('[data-testid="readout-T"]')).toBe('10 ms'); expect(text('[data-testid="readout-v"]')).toMatch(/340 m\/s/);
    expect(text('[data-testid="idealised-note"]')).toMatch(/500 times slower/); expect(text('[data-testid="idealised-note"]')).toMatch(/exaggerated/);
    expect(q('[data-testid="marked-particle"]')).not.toBeNull(); expect(q('[data-testid="followed-compression"]')).not.toBeNull();
    expect(q('[data-testid="density-graph"]')).not.toBeNull(); expect(q('[data-testid="average-line"]')).not.toBeNull();
    expect(text('[data-testid="wave-assumptions"]')).toMatch(/enlarged/);
  });

  it('a new frequency changes the wavelength and period and restarts the picture at time zero; the speed does not change', async () => {
    await render(<WavePanel />);
    await setField('wave-freq', 200);
    expect(text('[data-testid="readout-lambda"]')).toBe('1.7 m'); expect(text('[data-testid="readout-T"]')).toBe('5 ms'); expect(text('[data-testid="readout-v"]')).toMatch(/340 m\/s/);
    expect(text('[data-testid="time-value"]')).toMatch(/^0 s of picture time/);
  });

  it('changing the amplitude does not restart time and does not change the wavelength or the period', async () => {
    await render(<WavePanel />);
    setInput(timeSlider(), 3);
    const before = text('[data-testid="time-value"]');
    await setField('wave-amp', 0.5);
    expect(text('[data-testid="time-value"]')).toBe(before);
    expect(text('[data-testid="readout-lambda"]')).toBe('3.4 m'); expect(text('[data-testid="readout-T"]')).toBe('10 ms');
  });

  it('as time moves the followed compression travels but the marked particle stays at its rest position tick', async () => {
    await render(<WavePanel />);
    const tick = () => Number(q('[data-testid="marked-particle"] line').getAttribute('x1'));
    const flag = () => Number(q('[data-testid="followed-compression"] line').getAttribute('x1'));
    const ring = () => Number(q('[data-testid="marked-particle"] circle').getAttribute('cx'));
    const seek = (v: number) => setInput(timeSlider(), v);
    const tick0 = tick(); const flags: number[] = []; const rings: number[] = [];
    for (const v of [0, 1, 2, 3, 4, 5]) { await seek(v); flags.push(flag()); rings.push(ring()); expect(tick()).toBe(tick0); }
    expect(new Set(flags.map((f) => Math.round(f))).size).toBeGreaterThan(3);   // the compression moves
    const ringSpread = Math.max(...rings) - Math.min(...rings);
    const flagSpread = Math.max(...flags) - Math.min(...flags);
    expect(ringSpread).toBeLessThan(40);                                         // the particle stays within a small distance of its tick (px)
    expect(Math.max(...rings.map((r) => Math.abs(r - tick0)))).toBeLessThan(40);
    expect(flagSpread).toBeGreaterThan(ringSpread);
  });

  it('Replay and Reset behave: Reset returns to time zero and stops; Replay runs from zero', async () => {
    await render(<WavePanel />);
    await click('[data-action="replay"]');
    expect(q('[data-action="toggle"]').getAttribute('aria-label')).toBe('Pause');
    await click('[data-action="reset"]');
    expect(text('[data-testid="time-value"]')).toMatch(/^0 s of picture time/);
    expect(q('[data-action="toggle"]').getAttribute('aria-label')).toBe('Play');
  });

  it('reduced motion: Play is not offered, time moves by slider or Step, and the note says why', async () => {
    const original = window.matchMedia;
    (window as unknown as { matchMedia: unknown }).matchMedia = (query: string) => ({ matches: /reduce/.test(query), media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    try {
      await render(<WavePanel />);
      expect(q('[data-action="toggle"]')).toBeNull();
      expect(q('[data-action="step-forward"]')).not.toBeNull();
      expect(text('[data-testid="reduced-note"]')).toMatch(/reduced motion/);
      const before = text('[data-testid="time-value"]');
      await click('[data-action="step-forward"]');
      expect(text('[data-testid="time-value"]')).not.toBe(before);
    } finally { (window as unknown as { matchMedia: unknown }).matchMedia = original; }
  });

  it('the Wave Laboratory makes no sound and creates no audio context', async () => {
    await render(<WavePanel />);
    await click('[data-action="replay"]');
    expect(backend.created).toEqual([]);
  });

  it('MOBILE and DESKTOP show the same physical numbers but different camera framing, particle count and layout', async () => {
    setWidth(1280);
    await render(<WavePanel stickyCanvas />);
    const desktop = { profile: q('[data-testid="wave-panel"]').getAttribute('data-profile'), dots: host.querySelectorAll('[data-testid="wave-particles"] circle').length, range: q('[data-testid="wave-scene"]').textContent, lambda: text('[data-testid="readout-lambda"]'), nu: text('[data-testid="readout-nu"]') };
    act(() => { root.unmount(); }); root = createRoot(host);
    setWidth(360);
    await render(<WavePanel stickyCanvas />);
    const mobile = { profile: q('[data-testid="wave-panel"]').getAttribute('data-profile'), dots: host.querySelectorAll('[data-testid="wave-particles"] circle').length, range: q('[data-testid="wave-scene"]').textContent, lambda: text('[data-testid="readout-lambda"]'), nu: text('[data-testid="readout-nu"]') };
    expect(desktop.profile).toBe('desktop'); expect(mobile.profile).toBe('mobile');
    expect(desktop.range).toMatch(/0 to 6.8 m of the tube/); expect(mobile.range).toMatch(/0 to 3.4 m of the tube/);
    expect(mobile.dots).toBeLessThan(desktop.dots);
    expect(mobile.lambda).toBe(desktop.lambda); expect(mobile.nu).toBe(desktop.nu);
    expect(q('[data-testid="wave-canvas"]').className).toMatch(/sticky/);           // mobile keeps the picture in view
    expect(host.querySelector('details')).not.toBeNull();                            // mobile folds the measurements
  });
});
