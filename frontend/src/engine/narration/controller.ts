/**
 * Narration controller: a small state machine over a list of narration segments, independent of React and of any particular
 * speech engine. It owns three guarantees:
 *   1. Nothing is spoken until `play()` (or `resume()`/`replay()`) is called; there is no autoplay path.
 *   2. At most one utterance exists at a time. Every utterance carries a token; events from a cancelled or replaced utterance
 *      (the browser fires 'canceled' / 'end' late) are ignored, so they can never advance, restart or stop the current one.
 *   3. `stop()` (also used on unmount, navigation and when the segments change) cancels speech and clears the highlight.
 * Pause is "stop speaking, remember the sentence"; resume speaks that sentence again from its start. That behaves the same in
 * every browser, including mobile browsers where a native pause is unreliable.
 */

import { chunkForSpeech, toSpeech } from './speechText';
import type { SpeechProvider } from './provider';
import { audioSession } from '../audio/session';

export interface NarrationSegment {
  /** Stable id; also the id the page uses to highlight the matching text. */
  id: string;
  /** The text as shown on the page (kept so the narration can always be read). */
  text: string;
  /** Spoken form, when it should differ from `text`. Defaults to `toSpeech(text)`. */
  speak?: string;
}

export type NarrationStatus = 'idle' | 'playing' | 'paused';

export interface NarrationSnapshot {
  status: NarrationStatus;
  supported: boolean;
  activeId: string | null;
  /** The sentence being spoken, as shown (for the caption). */
  activeText: string | null;
  /** 1-based segment number and total, for "3 of 8". */
  segmentNumber: number;
  segmentCount: number;
  rate: number;
  voiceURI: string | null;
  /** A user-readable message when the engine refused or failed; cleared on the next play. */
  error: string | null;
}

interface Unit { segId: string; shown: string; spoken: string }

export interface ControllerOptions {
  provider: SpeechProvider;
  lang?: string;
  rate?: number;
  voiceURI?: string | null;
}

const MIN_RATE = 0.5, MAX_RATE = 2;

export class NarrationController {
  private provider: SpeechProvider;
  private lang: string;
  private rate: number;
  private voiceURI: string | null;
  private segments: NarrationSegment[] = [];
  private units: Unit[] = [];
  private pos = 0;
  private token = 0;
  private cancelCurrent: (() => void) | null = null;
  private status: NarrationStatus = 'idle';
  private error: string | null = null;
  private listeners = new Set<() => void>();
  private snap: NarrationSnapshot;
  /** Stops this controller; held by the audio session while it speaks so a laboratory tone and narration never overlap. */
  private sessionStop = () => this.stop();

  constructor(opts: ControllerOptions) {
    this.provider = opts.provider;
    this.lang = opts.lang ?? 'en';
    this.rate = clampRate(opts.rate ?? 1);
    this.voiceURI = opts.voiceURI ?? null;
    this.snap = this.build();
  }

  // ---- subscription (useSyncExternalStore) ----
  subscribe = (fn: () => void): (() => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  getSnapshot = (): NarrationSnapshot => this.snap;

  // ---- content ----
  /** Replace the content. Playback stops if the text actually changed; an identical list is a no-op. */
  setSegments(next: NarrationSegment[]): void {
    const same = next.length === this.segments.length && next.every((s, i) => s.id === this.segments[i].id && s.text === this.segments[i].text && s.speak === this.segments[i].speak);
    if (same) return;
    this.halt();
    this.segments = next;
    this.units = next.flatMap((seg) => {
      const spoken = seg.speak ?? toSpeech(seg.text);
      const shown = chunkForSpeech(seg.text);
      const pieces = chunkForSpeech(spoken);
      // Speak chunk by chunk; the caption shows the matching shown sentence when the counts agree, else the whole segment text.
      return pieces.map((p, i) => ({ segId: seg.id, shown: shown.length === pieces.length ? shown[i] : seg.text, spoken: p }));
    });
    this.pos = 0;
    this.status = 'idle';
    audioSession.release(this.sessionStop);
    this.error = null;
    this.emit();
  }

  getSegments(): NarrationSegment[] { return this.segments; }

  // ---- transport ----
  play(): void {
    if (!this.provider.supported || !this.units.length) return;
    if (this.status === 'paused') { this.resume(); return; }
    this.error = null;
    this.pos = 0;
    this.status = 'playing';
    audioSession.claim('narration', this.sessionStop);
    this.speakCurrent();
  }

  pause(): void {
    if (this.status !== 'playing') return;
    this.halt();
    this.status = 'paused';
    this.emit();
  }

  resume(): void {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    audioSession.claim('narration', this.sessionStop);
    this.speakCurrent();
  }

  stop(): void {
    this.halt();
    this.pos = 0;
    this.status = 'idle';
    audioSession.release(this.sessionStop);
    this.emit();
  }

  replay(): void {
    this.stop();
    this.play();
  }

  setRate(rate: number): void {
    const r = clampRate(rate);
    if (r === this.rate) return;
    this.rate = r;
    if (this.status === 'playing') this.speakCurrent(); else this.emit();
  }

  setVoice(uri: string | null): void {
    if (uri === this.voiceURI) return;
    this.voiceURI = uri;
    if (this.status === 'playing') this.speakCurrent(); else this.emit();
  }

  setLang(lang: string): void { this.lang = lang; }

  /** Cancel everything this controller started. Safe to call repeatedly; the controller can be used again afterwards. */
  dispose(): void { this.stop(); }

  // ---- internals ----
  /** Invalidate and cancel the current utterance without touching the status. */
  private halt(): void {
    this.token++;
    const c = this.cancelCurrent;
    this.cancelCurrent = null;
    if (c) c();
  }

  private speakCurrent(): void {
    this.halt();
    const unit = this.units[this.pos];
    if (!unit) { this.finish(); return; }
    const mine = this.token;
    this.cancelCurrent = this.provider.speak({ text: unit.spoken, rate: this.rate, lang: this.lang, voiceURI: this.voiceURI }, {
      onEnd: () => {
        if (mine !== this.token || this.status !== 'playing') return;
        this.pos++;
        if (this.pos >= this.units.length) this.finish(); else this.speakCurrent();
      },
      onError: (reason) => {
        if (mine !== this.token) return;
        if (reason === 'canceled' || reason === 'interrupted') return;
        this.halt();
        this.status = 'idle';
        this.pos = 0;
        audioSession.release(this.sessionStop);
        this.error = reason === 'not-allowed' ? 'The browser blocked sound. Press Listen again.' : 'The browser could not play this narration. The text is on the page.';
        this.emit();
      },
    });
    this.emit();
  }

  private finish(): void {
    this.halt();
    this.status = 'idle';
    this.pos = 0;
    audioSession.release(this.sessionStop);
    this.emit();
  }

  private build(): NarrationSnapshot {
    const unit = this.status === 'idle' ? undefined : this.units[this.pos];
    const idx = unit ? this.segments.findIndex((s) => s.id === unit.segId) : -1;
    return {
      status: this.status,
      supported: this.provider.supported,
      activeId: unit?.segId ?? null,
      activeText: unit?.shown ?? null,
      segmentNumber: idx + 1,
      segmentCount: this.segments.length,
      rate: this.rate,
      voiceURI: this.voiceURI,
      error: this.error,
    };
  }

  private emit(): void {
    this.snap = this.build();
    for (const l of [...this.listeners]) l();
  }
}

export const clampRate = (r: number): number => (Number.isFinite(r) ? Math.min(MAX_RATE, Math.max(MIN_RATE, r)) : 1);
