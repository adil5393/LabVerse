/**
 * Tone engine: plays at most ONE synthesised sine tone, safely.
 *  - Nothing exists until `startTone` is called from a user action: no AudioContext is created at import, render or mount.
 *  - Level: gain = ceiling x volume x amplitude^2 (see safety.ts), always through a limiter; 30 ms fade in, 60 ms fade out.
 *  - A tone stops by itself after 20 s (scheduled on the audio clock AND by a timer), or when its decay has finished.
 *  - Infrasonic and ultrasonic requests are refused, never synthesised.
 *  - Starting a tone stops narration (and vice versa) through the audio session.
 *  - `stop` fades out, disconnects every node and suspends the context; `dispose` also closes it. A second `startTone` never
 *    leaves the first voice behind (at most one voice exists).
 * It does not decide WHEN to play; the page calls it from a click and stops it on reset, navigation, hidden tab and unmount.
 */

import { AUDIO, classifyFrequency, clamp, frequencyNote, isPlayableFrequency, toneGain } from './safety';
import { audioSession } from './session';
import { createBrowserBackend, type AContext, type AGain, type AOsc, type AudioBackend } from './backend';

export interface ToneRequest {
  hz: number;
  /** 0 to 1, a perceptual amplitude. */
  amplitude: number;
  /** When set the loudness dies away exponentially with this time constant in seconds (a struck fork or plucked string). */
  decayTau?: number;
  /** 0 to 1 volume setting; defaults to the conservative start. */
  volume?: number;
  /** End the tone after this many seconds (for example when the vibration has visibly died away); never more than 20. */
  stopAfterS?: number;
}

export type ToneResult = { ok: true } | { ok: false; reason: string };

export interface ToneSnapshot {
  playing: boolean;
  hz: number | null;
  /** Why the last tone ended or was refused (null while playing or before any tone). */
  message: string | null;
  supported: boolean;
}

interface Voice { osc: AOsc; gain: AGain; timers: ReturnType<typeof setTimeout>[]; hz: number; decay: boolean }

const MIN_AUDIBLE = 0.001;

export class ToneEngine {
  private backend: AudioBackend;
  private ctx: AContext | null = null;
  private master: AGain | null = null;
  private voice: Voice | null = null;
  private listeners = new Set<() => void>();
  private snap: ToneSnapshot;
  private message: string | null = null;
  private stopSelf = () => this.stop('Another sound started.');

  constructor(backend: AudioBackend = createBrowserBackend()) {
    this.backend = backend;
    this.snap = this.build();
  }

  subscribe = (fn: () => void): (() => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  getSnapshot = (): ToneSnapshot => this.snap;
  /** For tests and diagnostics: a context exists only after the first tone was started. */
  hasContext(): boolean { return this.ctx !== null; }

  startTone(req: ToneRequest): ToneResult {
    if (!this.backend.supported) return this.refuse('Sound is not available in this browser. Everything on the screen still works.');
    if (!isPlayableFrequency(req.hz)) return this.refuse(frequencyNote(req.hz) ?? 'That frequency cannot be played.');
    const nav = typeof navigator === 'undefined' ? undefined : (navigator as Navigator & { userActivation?: { isActive: boolean } });
    if (nav?.userActivation && !nav.userActivation.isActive) return this.refuse('Press the button to start the sound.');

    this.teardownVoice(true);
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return this.refuse('Sound could not be started on this device.');
    audioSession.claim('tone', this.stopSelf);

    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    const now = ctx.currentTime;
    const peak = toneGain(req.amplitude, req.volume ?? AUDIO.defaultVolume);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = req.hz;                // the starting pitch, set before the oscillator starts
    osc.frequency.setValueAtTime(req.hz, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + AUDIO.fadeInSeconds);
    const decay = req.decayTau !== undefined && req.decayTau > 0;
    if (decay) {
      gain.gain.setValueAtTime(peak, now + AUDIO.fadeInSeconds);
      gain.gain.setTargetAtTime(0, now + AUDIO.fadeInSeconds, req.decayTau!);
    }
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    // Backstop on the audio clock: the oscillator ends by itself even if every timer is lost.
    osc.stop(now + AUDIO.maxToneSeconds + AUDIO.fadeOutSeconds);

    const v: Voice = { osc, gain, timers: [], hz: req.hz, decay };
    osc.onended = () => { if (this.voice === v) this.teardownVoice(false); };
    v.timers.push(setTimeout(() => this.stop(`The tone stopped after ${AUDIO.maxToneSeconds} seconds. Press Play to hear it again.`), AUDIO.maxToneSeconds * 1000));
    if (decay) {
      const natural = Math.min(AUDIO.maxToneSeconds, req.stopAfterS ?? req.decayTau! * Math.log(peak / MIN_AUDIBLE) + AUDIO.fadeInSeconds);
      v.timers.push(setTimeout(() => this.stop('The sound has faded away.'), Math.max(natural, 0.1) * 1000));
    }
    this.voice = v;
    this.message = null;
    this.emit();
    return { ok: true };
  }

  /** Change the loudness of a steady (non-decaying) tone while it plays. */
  setAmplitude(amplitude: number, volume: number = AUDIO.defaultVolume): void {
    if (!this.voice || !this.ctx || this.voice.decay) return;
    this.voice.gain.gain.setTargetAtTime(toneGain(amplitude, volume), this.ctx.currentTime, 0.02);
  }

  /** Change the pitch of a steady tone while it plays; an unplayable frequency stops the tone instead. */
  setFrequency(hz: number): ToneResult {
    if (!this.voice || !this.ctx) return { ok: false, reason: 'No tone is playing.' };
    if (!isPlayableFrequency(hz)) { const note = frequencyNote(hz) ?? 'That frequency cannot be played.'; this.stop(note); return { ok: false, reason: note }; }
    this.voice.hz = hz;
    this.voice.osc.frequency.setTargetAtTime(clamp(hz, AUDIO.minHz, AUDIO.maxHz), this.ctx.currentTime, 0.01);
    this.emit();
    return { ok: true };
  }

  /** Stop the tone with a short fade, disconnect its nodes and suspend the context. Safe to call at any time. */
  stop(reason: string | null = null): void {
    if (!this.voice) { return; }
    this.message = reason;
    this.teardownVoice(true);
  }

  /** Stop and release the audio device completely (the context is closed). The engine can be used again afterwards. */
  dispose(): void {
    this.stop(null);
    const ctx = this.ctx;
    this.ctx = null; this.master = null;
    if (ctx) void ctx.close().catch(() => undefined);
    this.emit();
  }

  // ---- internals ----
  private ensureContext(): AContext | null {
    if (this.ctx && this.master) return this.ctx;
    const ctx = this.backend.create();
    if (!ctx) return null;
    const master = ctx.createGain();
    master.gain.setValueAtTime(1, ctx.currentTime);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-12, ctx.currentTime);
    limiter.knee.setValueAtTime(0, ctx.currentTime);
    limiter.ratio.setValueAtTime(20, ctx.currentTime);
    limiter.attack.setValueAtTime(0.003, ctx.currentTime);
    limiter.release.setValueAtTime(0.1, ctx.currentTime);
    master.connect(limiter);
    limiter.connect(ctx.destination);
    this.ctx = ctx; this.master = master;
    return ctx;
  }

  private refuse(reason: string): ToneResult {
    this.message = reason;
    this.emit();
    return { ok: false, reason };
  }

  /** Fade the current voice out (`fade`) or drop it at once, disconnect it, suspend the context, release the session. */
  private teardownVoice(fade: boolean): void {
    const v = this.voice;
    this.voice = null;
    audioSession.release(this.stopSelf);
    if (!v) { this.emit(); return; }
    for (const t of v.timers) clearTimeout(t);
    v.timers = [];
    v.osc.onended = null;
    const ctx = this.ctx;
    const finish = () => {
      try { v.osc.disconnect(); v.gain.disconnect(); } catch { /* already disconnected */ }
      if (this.voice === null && this.ctx) void this.ctx.suspend().catch(() => undefined);
    };
    if (ctx) {
      const now = ctx.currentTime;
      const out = fade ? AUDIO.fadeOutSeconds : 0.005;
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setTargetAtTime(0, now, out / 4);
      try { v.osc.stop(now + out); } catch { /* already stopped */ }
      setTimeout(finish, (out + 0.03) * 1000);
    } else finish();
    this.emit();
  }

  private build(): ToneSnapshot {
    return { playing: this.voice !== null, hz: this.voice?.hz ?? null, message: this.message, supported: this.backend.supported };
  }

  private emit(): void {
    this.snap = this.build();
    for (const l of [...this.listeners]) l();
  }
}

let shared: ToneEngine | null = null;
/** The engine used by the app (created on first use, still silent until a tone is started). */
export const getToneEngine = (): ToneEngine => (shared ??= new ToneEngine());
export const setToneEngine = (e: ToneEngine | null): void => { shared = e; };
export { classifyFrequency };
