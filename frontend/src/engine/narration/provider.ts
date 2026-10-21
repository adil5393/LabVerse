/**
 * The seam between the narration controller and whatever actually makes sound. The controller only knows this interface, so a
 * recorded-audio or cloud text-to-speech provider can replace the browser's SpeechSynthesis later without touching the controller,
 * the hook or the player. Nothing here starts speech by itself: speech only starts when `speak` is called, and the controller only
 * calls it in response to a user action.
 */

export interface VoiceInfo { uri: string; name: string; lang: string; local: boolean }

export interface SpeakRequest { text: string; rate: number; lang: string; voiceURI: string | null }

export interface SpeakCallbacks {
  onEnd: () => void;
  /** `reason` is the engine's reason; 'canceled' and 'interrupted' are expected after a cancel and must not be treated as failures. */
  onError: (reason: string) => void;
}

export interface SpeechProvider {
  readonly supported: boolean;
  /** Speak one short piece of text. Returns a function that cancels it (and detaches its callbacks). */
  speak(req: SpeakRequest, cb: SpeakCallbacks): () => void;
  cancel(): void;
  voices(): VoiceInfo[];
  /** Voices often load after the page; returns an unsubscribe. */
  onVoicesChanged(cb: () => void): () => void;
}

/** Pure voice choice, so it can be tested without a browser: the stored voice if it still exists, else the closest English voice. */
export function pickVoice(voices: VoiceInfo[], lang: string, preferredURI: string | null): VoiceInfo | null {
  if (preferredURI) {
    const exact = voices.find((v) => v.uri === preferredURI);
    if (exact) return exact;
  }
  if (!voices.length) return null;
  const norm = (l: string) => l.toLowerCase().replace('_', '-');
  const base = norm(lang).split('-')[0] || 'en';
  for (const want of [norm(lang), `${base}-in`, `${base}-gb`, `${base}-us`]) {
    const hit = voices.find((v) => norm(v.lang) === want);
    if (hit) return hit;
  }
  return voices.find((v) => norm(v.lang) === base || norm(v.lang).startsWith(`${base}-`)) ?? null;
}

const NONE: SpeechProvider = {
  supported: false,
  speak: () => () => {},
  cancel: () => {},
  voices: () => [],
  onVoicesChanged: () => () => {},
};

// Held at module level because some browsers garbage-collect an utterance mid-speech and then never fire `end`.
let live: SpeechSynthesisUtterance | null = null;

export function createBrowserSpeechProvider(): SpeechProvider {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return NONE;
  const synth = window.speechSynthesis;
  const toInfo = (v: SpeechSynthesisVoice): VoiceInfo => ({ uri: v.voiceURI, name: v.name, lang: v.lang, local: v.localService });
  return {
    supported: true,
    speak(req, cb) {
      const u = new SpeechSynthesisUtterance(req.text);
      const voice = pickVoice(synth.getVoices().map(toInfo), req.lang, req.voiceURI);
      const native = voice ? synth.getVoices().find((v) => v.voiceURI === voice.uri) : undefined;
      if (native) { u.voice = native; u.lang = native.lang; } else u.lang = req.lang;
      u.rate = req.rate;
      u.onend = () => cb.onEnd();
      u.onerror = (e) => cb.onError(e.error ?? 'unknown');
      live = u;
      synth.cancel();
      synth.speak(u);
      return () => { u.onend = null; u.onerror = null; if (live === u) live = null; synth.cancel(); };
    },
    cancel() { live = null; synth.cancel(); },
    voices: () => synth.getVoices().map(toInfo),
    onVoicesChanged(cb) {
      synth.addEventListener?.('voiceschanged', cb);
      return () => synth.removeEventListener?.('voiceschanged', cb);
    },
  };
}

let current: SpeechProvider | null = null;
/** The provider used by the app. Tests and a future TTS service replace it with `setSpeechProvider`. */
export const getSpeechProvider = (): SpeechProvider => (current ??= createBrowserSpeechProvider());
export const setSpeechProvider = (p: SpeechProvider | null): void => { current = p; };
