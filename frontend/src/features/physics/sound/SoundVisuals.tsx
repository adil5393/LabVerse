/**
 * Visuals the Sound lessons place beside their text (the lesson components look them up by `VisualRef.kind`). Each is one of the
 * laboratory components, so a lesson figure and the laboratory can never disagree: they are the same model drawn by the same code.
 */

import React, { useEffect, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { computeWave, DEFAULT_WAVE, type WaveSetup } from '../../../engine/physics/sound/wave';
import { clampPressure, describeBellJar, heardLoudness, NEAR_VACUUM } from '../../../engine/physics/sound/medium';
import { computeFork, computeString } from '../../../engine/physics/sound/vibration';
import type { DensityGraphProps, VibrationVisualProps, WaveVisualProps } from '../../../engine/physics/sound/learn/questions';
import { useReducedMotion } from '../motion/useReducedMotion';
import { RangeField } from './SoundControls';
import { VibrationPanel } from './VibrationLab';
import { WavePanel } from './WaveLab';
import { EnvelopeGraph, VibrationScene } from './VibrationViews';
import { DensityGraph, SOUND_COLORS } from './WaveViews';
import { TUBE_LENGTH_M } from '../../../engine/physics/sound/wave';
import { useContainerPresentation } from './soundViewport';

export const SoundVibrationVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as VibrationVisualProps;
  const { ref, pres } = useContainerPresentation();
  if (p.editable) {
    return <VibrationPanel initialKind={p.kind} initialHz={p.hz} initialString={p.string} initialStrike={p.strike} initialT={p.t} editable />;
  }
  const vib = p.kind === 'fork' ? computeFork({ hz: p.hz ?? 256, strike: p.strike ?? 1 }) : computeString({ tension: 1, lengthCm: 40, thickness: 1, strike: p.strike ?? 0.8, ...p.string });
  const t = p.t ?? 0;
  return (
    <div ref={ref} className="space-y-2" data-testid="vibration-snapshot">
      <VibrationScene vib={vib} tS={t} struck animate={false} lengthCm={p.string?.lengthCm ?? 40} thickness={p.string?.thickness ?? 1} presentation={pres.vib} alt={alt} />
      <EnvelopeGraph vib={vib} tS={t} struck tEnd={Math.max(3, Math.ceil((vib.valid ? vib.restAfterS : 2) + 1))} presentation={pres.vib} alt="Loudness against real time after the strike." />
    </div>
  );
};

export const SoundWaveVisual: React.FC<VisualProps> = ({ props }) => {
  const p = props as unknown as WaveVisualProps;
  return <WavePanel initialSetup={p.setup} initialT={p.t} initialGraph={p.graph ?? false} initialMark={p.mark ?? false} controls={p.editable ? 'basic' : 'none'} />;
};

export const SoundGraphVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as DensityGraphProps;
  const { ref, pres } = useContainerPresentation();
  const wave = computeWave({ ...DEFAULT_WAVE, ...(p.setup as Partial<WaveSetup>) });
  return <div ref={ref}><DensityGraph wave={wave} tPhys={(p.t ?? 0) / wave.slow} presentation={{ ...pres.wave, camera: [0, TUBE_LENGTH_M] }} alt={alt} marks={p.marks} /></div>;
};

/** Seeded positions so the air particles do not jump around when the slider moves. */
const airDots = Array.from({ length: 90 }, (_, i) => { const a = Math.sin(i * 12.9898) * 43758.5453; const b = Math.sin(i * 78.233) * 12345.6789; return { x: a - Math.floor(a), y: b - Math.floor(b) }; });

export const SoundBellJarVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as { pressure: number; editable?: boolean };
  const [pressure, setPressure] = useState(clampPressure(p.pressure));
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0; const start = performance.now();
    const loop = (now: number) => { setTick(((now - start) / 1000) % 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  const loud = heardLoudness(pressure);
  const clapper = reduced ? 6 : Math.sin(tick * 2 * Math.PI * 3) * 8;       // the clapper always moves: the bell is always ringing
  const n = Math.round(airDots.length * pressure);
  const W = 360, H = 226;
  return (
    <div className="space-y-2" data-testid="bell-jar">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" style={{ maxWidth: 440 }} role="img" aria-label={describeBellJar(pressure)} data-pressure={pressure.toFixed(2)}>
        <title>{alt}</title>
        <rect x={24} y={18} width={140} height={150} rx={22} fill="#0b1220" stroke="#93c5fd" strokeWidth={3} />
        <rect x={14} y={168} width={160} height={12} rx={4} fill="#475569" />
        {airDots.slice(0, n).map((d, i) => <circle key={i} cx={36 + d.x * 116} cy={30 + d.y * 126} r={2.4} fill="#7dd3fc" opacity={0.85} />)}
        <g data-testid="bell">
          <path d="M70 120 Q70 80 94 80 Q118 80 118 120 Z" fill="#fbbf24" stroke="#fde68a" />
          <line x1={94} y1={120} x2={94 + clapper} y2={140} stroke="#fde68a" strokeWidth={3} data-testid="clapper" />
          <circle cx={94 + clapper} cy={142} r={5} fill="#fde68a" />
        </g>
        <text x={94} y={200} textAnchor="middle" fontSize={15} fill={SOUND_COLORS.muted}>{pressure <= NEAR_VACUUM ? 'almost no air' : `${Math.round(pressure * 100)} % of normal air`}</text>
        <g data-testid="heard-loudness">
          <text x={192} y={40} fontSize={15} fill={SOUND_COLORS.text}>heard outside</text>
          <rect x={192} y={50} width={150} height={14} rx={7} fill="#1e293b" />
          <rect x={192} y={50} width={150 * loud} height={14} rx={7} fill="#f59e0b" />
          <text x={192} y={86} fontSize={15} fill={SOUND_COLORS.muted}>{Math.round(loud * 100)} % of full</text>
        </g>
        <text x={192} y={124} fontSize={15} fill="#fde68a">the bell is</text>
        <text x={192} y={144} fontSize={15} fill="#fde68a">still ringing</text>
        <g stroke="#94a3b8" strokeWidth={1.5} fill="none"><path d="M164 150 H200 Q212 150 212 162 V196" /></g>
        <text x={192} y={216} fontSize={15} fill="#94a3b8">to the pump</text>
      </svg>
      {p.editable && <RangeField id="bell-air" label="Air in the jar" value={Math.round(pressure * 100)} min={0} max={100} step={1} unit="% of normal" onChange={(v) => setPressure(v / 100)} hint="Pump air out (to the left) and let it back in (to the right). The bell keeps ringing; only the amount of air changes." />}
      <p className="text-[13px] text-slate-300" data-testid="bell-text">{describeBellJar(pressure)}</p>
    </div>
  );
};

export const SOUND_VISUALS: VisualRegistry = {
  soundVibration: SoundVibrationVisual,
  soundWave: SoundWaveVisual,
  soundGraph: SoundGraphVisual,
  soundBellJar: SoundBellJarVisual,
};
