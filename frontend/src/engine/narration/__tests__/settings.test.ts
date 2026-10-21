import { describe, it, expect } from 'vitest';
import reducedMotionSource from '../../../features/physics/motion/useReducedMotion.ts?raw';
import settingsSource from '../settings.ts?raw';
import { useNarrationSettings } from '../settings';

describe('narration settings', () => {
  it('work without browser storage (private windows, blocked site data): defaults apply and changes stay in memory', () => {
    expect(typeof localStorage).toBe('undefined'); // this test environment has no storage, like a blocked one
    expect(useNarrationSettings.getState().rate).toBe(1);
    expect(useNarrationSettings.getState().voiceURI).toBeNull();
    useNarrationSettings.getState().setRate(1.25);
    useNarrationSettings.getState().setVoiceURI('v1');
    expect(useNarrationSettings.getState()).toMatchObject({ rate: 1.25, voiceURI: 'v1' });
    useNarrationSettings.getState().setRate(99);
    expect(useNarrationSettings.getState().rate).toBe(2);
    useNarrationSettings.getState().setRate(1);
    useNarrationSettings.getState().setVoiceURI(null);
  });

  it('are separate from the reduced-motion preference', () => {
    expect(settingsSource).toContain("'labverse_narration_v1'");
    expect(settingsSource).not.toContain('useReducedMotion');
    expect(settingsSource).not.toContain('matchMedia');
    expect(reducedMotionSource.toLowerCase()).not.toContain('narration');
    expect(reducedMotionSource).toContain('prefers-reduced-motion');
  });
});
