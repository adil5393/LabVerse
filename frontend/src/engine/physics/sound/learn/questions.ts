/** Visual references for the Sound lessons. Every text alternative is generated from the same model that is drawn. */

import type { VisualRef } from '../../../education/types';
import { computeFork, computeString, describeVibration, type StringSetup } from '../vibration';
import { computeWave, describeWave, DEFAULT_WAVE, type WaveSetup } from '../wave';
import { describeBellJar } from '../medium';

export { ind, num as numQ, pick, ord } from '../../../education/builders';

export interface VibrationVisualProps {
  kind: 'string' | 'fork';
  /** Fork frequency (256, 320 or 512 Hz). */
  hz?: number;
  string?: Partial<StringSetup>;
  strike?: number;
  /** Seconds after the strike at which the scene is first drawn. */
  t?: number;
  /** Show the controls and the sound button. */
  editable?: boolean;
}

export const vibVisual = (p: VibrationVisualProps, intro: string): VisualRef => {
  const v = p.kind === 'fork' ? computeFork({ hz: p.hz ?? 256, strike: p.strike ?? 1 }) : computeString({ tension: 1, lengthCm: 40, thickness: 1, strike: p.strike ?? 0.8, ...p.string });
  return { kind: 'soundVibration', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describeVibration(v, p.t ?? 0)}` };
};

export interface WaveVisualProps {
  setup?: Partial<WaveSetup>;
  /** Seconds of the slowed picture at which the scene is first drawn. */
  t?: number;
  graph?: boolean;
  /** Mark one particle and follow one compression. */
  mark?: boolean;
  /** Show the frequency, amplitude and play controls. */
  editable?: boolean;
}

export const waveVisual = (p: WaveVisualProps, intro: string): VisualRef => ({
  kind: 'soundWave', props: p as unknown as Record<string, unknown>,
  alt: `${intro} ${describeWave(computeWave({ ...DEFAULT_WAVE, ...p.setup }))}`,
});

export interface GraphMark { id: string; /** position in metres */ x: number; label: string }
export interface DensityGraphProps { setup?: Partial<WaveSetup>; t?: number; marks?: GraphMark[] }

/** The density-against-distance graph on its own, with lettered points a question can refer to. */
export const graphVisual = (p: DensityGraphProps, intro: string): VisualRef => ({
  kind: 'soundGraph', props: p as unknown as Record<string, unknown>,
  alt: `${intro} A graph of density against distance for a sound wave, with a dashed line for the average density. ${describeWave(computeWave({ ...DEFAULT_WAVE, ...p.setup }))}${p.marks?.length ? ` Marked points: ${p.marks.map((m) => `${m.label} at ${Math.round(m.x * 100) / 100} metres`).join(', ')}.` : ''}`,
});

export const bellVisual = (p: { pressure: number; editable?: boolean }, intro: string): VisualRef => ({
  kind: 'soundBellJar', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describeBellJar(p.pressure)}`,
});
