import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AUDIO, classifyFrequency, frequencyNote, isPlayableFrequency, toneGain } from '../safety';
import { audioSession } from '../session';
import { ToneEngine } from '../toneEngine';
import type { AContext, AGain, AOsc, AParam, AudioBackend, ACompressor, ANode } from '../backend';
import { NarrationController } from '../../narration/controller';
import type { SpeakCallbacks, SpeakRequest, SpeechProvider } from '../../narration/provider';

// ---- a recording fake of the Web Audio API ----
class FParam implements AParam {
  value = 0; calls: string[] = []; peak = 0;
  setValueAtTime(v: number, t: number) { this.calls.push(`set ${v} @${t.toFixed(3)}`); this.peak = Math.max(this.peak, v); }
  linearRampToValueAtTime(v: number, t: number) { this.calls.push(`ramp ${v} @${t.toFixed(3)}`); this.peak = Math.max(this.peak, v); }
  setTargetAtTime(v: number, t: number, tc: number) { this.calls.push(`target ${v} @${t.toFixed(3)} tc${tc}`); }
  cancelScheduledValues(t: number) { this.calls.push(`cancel @${t.toFixed(3)}`); }
}
class FNode implements ANode { connected: ANode[] = []; disconnected = false; connect(n: ANode) { this.connected.push(n); } disconnect() { this.disconnected = true; } }
class FGain extends FNode implements AGain { gain = new FParam(); }
class FOsc extends FNode implements AOsc {
  type = ''; frequency = new FParam(); onended: (() => void) | null = null; started: number | null = null; stoppedAt: number[] = [];
  start(t = 0) { this.started = t; } stop(t = 0) { this.stoppedAt.push(t); }
}
class FComp extends FNode implements ACompressor { threshold = new FParam(); knee = new FParam(); ratio = new FParam(); attack = new FParam(); release = new FParam(); }
class FCtx implements AContext {
  currentTime = 1; state = 'running'; destination = new FNode(); oscs: FOsc[] = []; gains: FGain[] = []; comps: FComp[] = [];
  suspended = 0; resumed = 0; closed = 0;
  createGain() { const g = new FGain(); this.gains.push(g); return g; }
  createOscillator() { const o = new FOsc(); this.oscs.push(o); return o; }
  createDynamicsCompressor() { const c = new FComp(); this.comps.push(c); return c; }
  async resume() { this.resumed++; this.state = 'running'; }
  async suspend() { this.suspended++; this.state = 'suspended'; }
  async close() { this.closed++; this.state = 'closed'; }
}
class FBackend implements AudioBackend {
  supported = true; created: FCtx[] = [];
  create() { const c = new FCtx(); this.created.push(c); return c; }
}

let backend: FBackend; let engine: ToneEngine;
beforeEach(() => { vi.useFakeTimers(); audioSession.reset(); backend = new FBackend(); engine = new ToneEngine(backend); });
afterEach(() => { engine.dispose(); vi.useRealTimers(); });

describe('frequency safety', () => {
  it('classifies the boundaries exactly as specified (lower bound inclusive)', () => {
    expect(classifyFrequency(19.99)).toBe('infrasonic');
    expect(classifyFrequency(20)).toBe('very-low');
    expect(classifyFrequency(99.9)).toBe('very-low');
    expect(classifyFrequency(100)).toBe('reliable');
    expect(classifyFrequency(7999)).toBe('reliable');
    expect(classifyFrequency(8000)).toBe('high');
    expect(classifyFrequency(16000)).toBe('very-high');
    expect(classifyFrequency(20000)).toBe('very-high');
    expect(classifyFrequency(20001)).toBe('ultrasonic');
    expect(classifyFrequency(Number.NaN)).toBe('infrasonic');
  });
  it('never plays infrasonic or ultrasonic, and says why', () => {
    for (const hz of [0, 5, 19, 20001, 40000]) { expect(isPlayableFrequency(hz)).toBe(false); expect(frequencyNote(hz)).toMatch(/never played/); }
    for (const hz of [20, 256, 5000, 20000]) expect(isPlayableFrequency(hz)).toBe(true);
  });
  it('warns about speakers at the very low and very high ends and says nothing in the reliable band', () => {
    expect(frequencyNote(50)).toMatch(/speaker/i);
    expect(frequencyNote(18000)).toMatch(/phone speakers/i);
    expect(frequencyNote(440)).toBeNull();
  });
  it('gain is never above the ceiling and is zero for zero amplitude or zero volume', () => {
    for (const a of [0, 0.01, 0.5, 1, 7, -3, Number.NaN]) for (const v of [0, 0.4, 1, 9]) {
      const g = toneGain(a, v); expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(AUDIO.masterCeiling);
    }
    expect(toneGain(0, 1)).toBe(0); expect(toneGain(1, 0)).toBe(0);
    expect(toneGain(1, 1)).toBeCloseTo(AUDIO.masterCeiling, 10);
    expect(toneGain(0.5, 0.4)).toBeLessThan(toneGain(1, 0.4));
  });
});

describe('ToneEngine: nothing happens until a tone is started', () => {
  it('creating the engine and subscribing creates no context, oscillator or sound', () => {
    engine.subscribe(() => {});
    expect(backend.created).toEqual([]);
    expect(engine.hasContext()).toBe(false);
    expect(engine.getSnapshot()).toMatchObject({ playing: false, hz: null });
  });
});

describe('ToneEngine: safe playback', () => {
  it('builds oscillator -> gain -> master -> limiter -> destination with a fade in and a peak at or under the ceiling', () => {
    expect(engine.startTone({ hz: 256, amplitude: 1 })).toEqual({ ok: true });
    const ctx = backend.created[0];
    expect(backend.created.length).toBe(1);
    expect(ctx.oscs[0].frequency.calls[0]).toContain('set 256');
    expect(ctx.oscs[0].started).toBe(1);
    const voiceGain = ctx.gains[1];
    expect(voiceGain.gain.calls[0]).toMatch(/^set 0 /);          // starts silent
    expect(voiceGain.gain.calls[1]).toMatch(/^ramp .* @1\.030/);   // 30 ms fade in
    expect(voiceGain.gain.peak).toBeLessThanOrEqual(AUDIO.masterCeiling * AUDIO.defaultVolume + 1e-12);
    expect(ctx.comps[0].ratio.calls[0]).toContain('20');           // limiter present
    expect(ctx.comps[0].connected).toContain(ctx.destination);
    expect(engine.getSnapshot()).toMatchObject({ playing: true, hz: 256 });
  });

  it('refuses infrasonic and ultrasonic requests without creating any audio object', () => {
    for (const hz of [10, 25000]) {
      const r = engine.startTone({ hz, amplitude: 1 });
      expect(r.ok).toBe(false);
    }
    expect(backend.created).toEqual([]);
    expect(engine.getSnapshot().message).toMatch(/never played/);
  });

  it('refuses politely when the browser has no Web Audio', () => {
    const none = new ToneEngine({ supported: false, create: () => null });
    expect(none.startTone({ hz: 440, amplitude: 1 })).toMatchObject({ ok: false });
  });

  it('a continuous tone stops by itself after 20 seconds, with a message', () => {
    engine.startTone({ hz: 440, amplitude: 1 });
    const osc = backend.created[0].oscs[0];
    expect(osc.stoppedAt[0]).toBeCloseTo(1 + AUDIO.maxToneSeconds + AUDIO.fadeOutSeconds, 6); // audio-clock backstop
    vi.advanceTimersByTime(19_900);
    expect(engine.getSnapshot().playing).toBe(true);
    vi.advanceTimersByTime(200);
    expect(engine.getSnapshot().playing).toBe(false);
    expect(engine.getSnapshot().message).toMatch(/20 seconds/);
  });

  it('a decaying tone (struck fork) ends by itself when it has faded, before the 20 s limit', () => {
    engine.startTone({ hz: 256, amplitude: 0.8, decayTau: 2 });
    vi.advanceTimersByTime(20_000);
    expect(engine.getSnapshot().playing).toBe(false);
    expect(engine.getSnapshot().message).toMatch(/faded/);
    const g = backend.created[0].gains[1].gain.calls.join('|');
    expect(g).toContain('target 0');
  });

  it('stop fades out, disconnects every node and suspends the context', async () => {
    engine.startTone({ hz: 330, amplitude: 1 });
    const ctx = backend.created[0]; const osc = ctx.oscs[0]; const gain = ctx.gains[1];
    engine.stop('Stopped.');
    expect(engine.getSnapshot()).toMatchObject({ playing: false, message: 'Stopped.' });
    expect(gain.gain.calls.some((c) => c.startsWith('target 0'))).toBe(true);
    expect(osc.stoppedAt.length).toBeGreaterThan(1);
    vi.advanceTimersByTime(200);
    expect(osc.disconnected && gain.disconnected).toBe(true);
    expect(ctx.suspended).toBe(1);
  });

  it('starting a second tone never leaves the first behind (one voice at a time)', () => {
    engine.startTone({ hz: 256, amplitude: 1 });
    engine.startTone({ hz: 384, amplitude: 1 });
    const ctx = backend.created[0];
    expect(backend.created.length).toBe(1);                      // one context reused
    expect(ctx.oscs.length).toBe(2);
    vi.advanceTimersByTime(300);
    expect(ctx.oscs[0].disconnected).toBe(true);
    expect(ctx.oscs[1].disconnected).toBe(false);
    expect(engine.getSnapshot().hz).toBe(384);
  });

  it('timers of a stopped tone do not stop its replacement', () => {
    engine.startTone({ hz: 256, amplitude: 1 });
    vi.advanceTimersByTime(15_000);
    engine.startTone({ hz: 384, amplitude: 1 });
    vi.advanceTimersByTime(10_000);                               // the first tone's 20 s mark passes
    expect(engine.getSnapshot()).toMatchObject({ playing: true, hz: 384 });
  });

  it('live changes: amplitude is smoothed, an unplayable frequency stops the tone', () => {
    engine.startTone({ hz: 440, amplitude: 0.5 });
    engine.setAmplitude(1);
    expect(backend.created[0].gains[1].gain.calls.some((c) => c.startsWith('target'))).toBe(true);
    expect(engine.setFrequency(500)).toEqual({ ok: true });
    expect(engine.setFrequency(30000)).toMatchObject({ ok: false });
    expect(engine.getSnapshot().playing).toBe(false);
  });

  it('dispose closes the context and the engine can be used again', () => {
    engine.startTone({ hz: 440, amplitude: 1 });
    engine.dispose();
    expect(backend.created[0].closed).toBe(1);
    expect(engine.hasContext()).toBe(false);
    expect(engine.startTone({ hz: 440, amplitude: 1 })).toEqual({ ok: true });
    expect(backend.created.length).toBe(2);
  });

  it('stop with nothing playing is harmless', () => {
    expect(() => { engine.stop('x'); engine.stop(null); engine.dispose(); }).not.toThrow();
  });
});

// ---- narration and tones never overlap ----
class FakeSpeech implements SpeechProvider {
  supported = true; live = 0;
  speak(_r: SpeakRequest, _cb: SpeakCallbacks) { this.live++; return () => { this.live--; }; }
  cancel() {}
  voices() { return []; }
  onVoicesChanged() { return () => {}; }
}

describe('narration and laboratory tones are mutually exclusive', () => {
  it('starting a tone stops narration; starting narration stops the tone; neither starts the other', () => {
    const speech = new FakeSpeech();
    const nar = new NarrationController({ provider: speech });
    nar.setSegments([{ id: 'a', text: 'Hello there.' }]);
    nar.play();
    expect(nar.getSnapshot().status).toBe('playing');
    engine.startTone({ hz: 440, amplitude: 1 });
    expect(nar.getSnapshot().status).toBe('idle');
    expect(speech.live).toBe(0);
    expect(engine.getSnapshot().playing).toBe(true);
    nar.play();
    expect(engine.getSnapshot().playing).toBe(false);
    expect(nar.getSnapshot().status).toBe('playing');
    expect(speech.live).toBe(1);
  });

  it('a paused narration also gives way to a tone, and a stopped tone leaves narration alone', () => {
    const nar = new NarrationController({ provider: new FakeSpeech() });
    nar.setSegments([{ id: 'a', text: 'Hello there.' }]);
    nar.play(); nar.pause();
    engine.startTone({ hz: 440, amplitude: 1 });
    expect(nar.getSnapshot().status).toBe('idle');
    engine.stop(null);
    expect(nar.getSnapshot().status).toBe('idle');
    expect(audioSession.holder()).toBeNull();
  });

  it('two narrations also stop each other', () => {
    const a = new NarrationController({ provider: new FakeSpeech() }); a.setSegments([{ id: 'a', text: 'One.' }]);
    const b = new NarrationController({ provider: new FakeSpeech() }); b.setSegments([{ id: 'b', text: 'Two.' }]);
    a.play(); b.play();
    expect(a.getSnapshot().status).toBe('idle');
    expect(b.getSnapshot().status).toBe('playing');
  });
});
