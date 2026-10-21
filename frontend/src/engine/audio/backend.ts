/**
 * The slice of the Web Audio API the tone engine uses, as plain interfaces, so tests can supply a recording fake and a future
 * engine can replace the browser one. Only nodes the engine needs are described.
 */

export interface AParam {
  value: number;
  setValueAtTime(v: number, t: number): unknown;
  linearRampToValueAtTime(v: number, t: number): unknown;
  setTargetAtTime(v: number, t: number, timeConstant: number): unknown;
  cancelScheduledValues(t: number): unknown;
}
export interface ANode { connect(to: ANode): unknown; disconnect(): unknown }
export interface AGain extends ANode { gain: AParam }
export interface AOsc extends ANode { type: string; frequency: AParam; onended: (() => void) | null; start(t?: number): void; stop(t?: number): void }
export interface ACompressor extends ANode { threshold: AParam; knee: AParam; ratio: AParam; attack: AParam; release: AParam }
export interface AContext {
  readonly currentTime: number;
  readonly state: string;
  readonly destination: ANode;
  createGain(): AGain;
  createOscillator(): AOsc;
  createDynamicsCompressor(): ACompressor;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  close(): Promise<void>;
}
export interface AudioBackend {
  readonly supported: boolean;
  /** Create the one audio context. Called only from inside a user action. */
  create(): AContext | null;
}

export function createBrowserBackend(): AudioBackend {
  const Ctor = typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  return {
    supported: Boolean(Ctor),
    create: () => (Ctor ? (new Ctor({ latencyHint: 'interactive' }) as unknown as AContext) : null),
  };
}
