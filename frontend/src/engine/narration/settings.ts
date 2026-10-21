/**
 * Narration preferences (reading speed and chosen voice). Kept in their own store and storage key, separate from the
 * reduced-motion preference and from learning progress: changing the narration voice never affects either. Storage can be
 * unavailable (private windows, blocked site data), so every access is guarded and the defaults always work.
 */

import { create } from 'zustand';
import { clampRate } from './controller';

const KEY = 'labverse_narration_v1';

export interface NarrationSettings { rate: number; voiceURI: string | null }
interface NarrationSettingsStore extends NarrationSettings {
  setRate: (rate: number) => void;
  setVoiceURI: (uri: string | null) => void;
}

function load(): NarrationSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { rate: 1, voiceURI: null };
    const p = JSON.parse(raw) as Partial<NarrationSettings>;
    return { rate: clampRate(typeof p.rate === 'number' ? p.rate : 1), voiceURI: typeof p.voiceURI === 'string' ? p.voiceURI : null };
  } catch {
    return { rate: 1, voiceURI: null };
  }
}

function save(s: NarrationSettings): void {
  try { localStorage.setItem(KEY, JSON.stringify({ rate: s.rate, voiceURI: s.voiceURI })); } catch { /* storage unavailable: keep working in memory */ }
}

export const useNarrationSettings = create<NarrationSettingsStore>((set, get) => ({
  ...load(),
  setRate: (rate) => { set({ rate: clampRate(rate) }); save(get()); },
  setVoiceURI: (voiceURI) => { set({ voiceURI }); save(get()); },
}));
