/**
 * One audio source at a time. Narration (speech) and experimental sound (synthesised tones) must never compete: whoever starts
 * second stops the first. Each source claims the session with a function that stops it; claiming while another source holds the
 * session calls that source's stop function. Neither source ever starts the other.
 */

export type AudioOwner = 'narration' | 'tone';

interface Holder { owner: AudioOwner; stop: () => void }

let current: Holder | null = null;

export const audioSession = {
  /** Take the session. Anything else that holds it is stopped first. */
  claim(owner: AudioOwner, stop: () => void): void {
    const previous = current;
    current = { owner, stop };
    if (previous && previous.stop !== stop) previous.stop();
  },
  /** Give the session back (only if `stop` still holds it). */
  release(stop: () => void): void {
    if (current && current.stop === stop) current = null;
  },
  holder(): AudioOwner | null { return current?.owner ?? null; },
  /** For tests. */
  reset(): void { current = null; },
};
