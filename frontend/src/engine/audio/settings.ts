/**
 * Sound preferences: the volume only. Whether sound is switched on is NOT stored: every visit starts with sound off and
 * silent, and nothing here ever starts a sound. Separate from reduced motion and from narration (own storage key).
 * Storage can be unavailable (private windows, blocked site data), so every access is guarded.
 */

import { create } from 'zustand';
import { AUDIO, clamp } from './safety';

const KEY = 'labverse_audio_v1';

interface AudioSettings {
  /** Fraction of the safe ceiling, 0 to 1. */
  volume: number;
  /** Session only: a visitor must switch sound on in each visit. */
  soundOn: boolean;
  setVolume: (v: number) => void;
  setSoundOn: (on: boolean) => void;
}

function loadVolume(): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return AUDIO.defaultVolume;
    const v = (JSON.parse(raw) as { volume?: unknown }).volume;
    return typeof v === 'number' ? clamp(v, 0, 1) : AUDIO.defaultVolume;
  } catch {
    return AUDIO.defaultVolume;
  }
}

export const useAudioSettings = create<AudioSettings>((set, get) => ({
  volume: loadVolume(),
  soundOn: false,
  setVolume: (v) => {
    set({ volume: clamp(v, 0, 1) });
    try { localStorage.setItem(KEY, JSON.stringify({ volume: get().volume })); } catch { /* keep working in memory */ }
  },
  setSoundOn: (on) => set({ soundOn: on }),
}));
