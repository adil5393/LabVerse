/**
 * Drawings for the Vibration Laboratory (SND-1): the plucked band or struck fork, and the loudness-against-time graph that is the
 * visual equivalent of the sound. Honest about time scales: the to-and-fro wiggle is far too fast to see, so it is drawn SLOWED by
 * `SLOW_VIBRATION` times, while the size of the vibration (the envelope), the loudness bar, the graph and the sound itself run in
 * real time. The size of the displacement is a drawing scale, not a length.
 */

import React from 'react';
import { amplitudeAt, isVibrating, REST_AMPLITUDE, type Vibration } from '../../../engine/physics/sound/vibration';
import { SOUND_COLORS } from './WaveViews';
import type { VibrationPresentation } from './soundViewport';

/** The wiggle in the picture is this many times slower than the real vibration. */
export const SLOW_VIBRATION = 200;

/** The displacement drawn at real time t seconds after the strike, slowed. 0 once the object is at rest. */
export function shownDisplacement(v: Vibration, tS: number, animate: boolean): number {
  if (!v.valid || !isVibrating(v, tS)) return 0;
  const a = amplitudeAt(v, tS);
  return animate ? a * Math.cos(2 * Math.PI * (v.hz / SLOW_VIBRATION) * tS) : a;
}

export interface VibrationSceneProps {
  vib: Vibration;
  /** Seconds after the strike (real time). */
  tS: number;
  struck: boolean;
  animate: boolean;
  lengthCm?: number;
  thickness?: number;
  presentation: VibrationPresentation;
  alt: string;
}

export const VibrationScene: React.FC<VibrationSceneProps> = ({ vib, tS, struck, animate, lengthCm = 40, thickness = 1, presentation: p, alt }) => {
  const { w: W, h: H, font, small } = p;
  const amp = struck ? amplitudeAt(vib, tS) : 0;
  const vibrating = struck && vib.valid && isVibrating(vib, tS);
  const d = struck ? shownDisplacement(vib, tS, animate) : 0;
  const maxPx = H * 0.22;
  const midY = H * 0.42;
  const sounding = vibrating;
  const barW = W - 2 * 24;

  const stringScene = () => {
    const len = ((lengthCm - 30) / 30) * 0.25 + 0.62;          // 30..60 cm -> 62..87 % of the box
    const xL = W / 2 - (W * len) / 2, xR = W / 2 + (W * len) / 2;
    const n = 40;
    const pts = Array.from({ length: n + 1 }, (_, i) => { const s = i / n; return `${(xL + s * (xR - xL)).toFixed(1)},${(midY + d * maxPx * Math.sin(Math.PI * s)).toFixed(1)}`; }).join(' ');
    return (
      <g data-testid="string-scene">
        <rect x={W * 0.08} y={midY + 4} width={W * 0.84} height={H * 0.3} rx={4} fill="#1e293b" stroke={SOUND_COLORS.tube} />
        <text x={W / 2} y={midY + 4 + H * 0.3 - 8} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.muted}>open box</text>
        <circle cx={xL} cy={midY} r={5} fill="#94a3b8" /><circle cx={xR} cy={midY} r={5} fill="#94a3b8" />
        {struck && amp > REST_AMPLITUDE && (
          <g stroke={SOUND_COLORS.marked} strokeDasharray="4 3" strokeWidth={1}>
            <path d={`M${xL} ${midY} Q${(xL + xR) / 2} ${midY - 2 * amp * maxPx} ${xR} ${midY}`} fill="none" />
            <path d={`M${xL} ${midY} Q${(xL + xR) / 2} ${midY + 2 * amp * maxPx} ${xR} ${midY}`} fill="none" />
          </g>
        )}
        <line x1={xL} y1={midY} x2={xR} y2={midY} stroke={SOUND_COLORS.muted} strokeDasharray="2 4" strokeWidth={1} />
        <polyline points={pts} fill="none" stroke="#fb7185" strokeWidth={1.5 + thickness * 1.5} strokeLinecap="round" data-testid="band" />
        <text x={(xL + xR) / 2} y={midY - maxPx - 10} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.marked}>{struck ? 'dashed: how far it swings' : 'at rest'}</text>
      </g>
    );
  };

  const forkScene = () => {
    const cx = W / 2, baseY = H * 0.78, top = H * 0.16, gap = 22;
    const left = cx - gap - d * maxPx * 0.5, right = cx + gap + d * maxPx * 0.5;
    return (
      <g data-testid="fork-scene" stroke="#cbd5e1" strokeWidth={9} strokeLinecap="round" fill="none">
        <line x1={cx} y1={baseY} x2={cx} y2={baseY + 28} />
        <path d={`M${cx - gap} ${top + 40} L${cx - gap} ${baseY - 6} Q${cx - gap} ${baseY} ${cx} ${baseY} Q${cx + gap} ${baseY} ${cx + gap} ${baseY - 6} L${cx + gap} ${top + 40}`} strokeWidth={9} opacity={0.35} />
        <line x1={left} y1={baseY - 4} x2={left} y2={top} data-testid="prong-left" />
        <line x1={right} y1={baseY - 4} x2={right} y2={top} data-testid="prong-right" />
        <text x={cx} y={H - 4} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.muted} stroke="none" strokeWidth={0}>the prongs move in opposite directions</text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={alt} data-testid="vibration-scene" style={{ maxWidth: Math.max(W, W < 400 ? 440 : W) }}>
      <title>{alt}</title>
      {vib.kind === 'string' ? stringScene() : forkScene()}
      {/* sound indicator and loudness bar: real time */}
      <g data-testid="sound-indicator" data-sounding={sounding ? 'true' : 'false'}>
        <rect x={W - 150} y={6} width={144} height={font + 14} rx={8} fill={sounding ? '#f59e0b' : '#1e293b'} stroke={sounding ? '#fde68a' : SOUND_COLORS.tube} />
        <text x={W - 78} y={6 + font + 4} textAnchor="middle" fontSize={font} fontWeight={800} fill={sounding ? '#0f172a' : SOUND_COLORS.muted}>{sounding ? 'sound: ON' : 'sound: off'}</text>
      </g>
      <g data-testid="loudness-bar">
        <text x={24} y={H - 24} fontSize={small} fill={SOUND_COLORS.muted}>vibration size = loudness (real time)</text>
        <rect x={24} y={H - 18} width={barW} height={10} rx={5} fill="#1e293b" />
        <rect x={24} y={H - 18} width={Math.max(0, Math.min(1, amp)) * barW} height={10} rx={5} fill="#f59e0b" />
      </g>
    </svg>
  );
};

export interface EnvelopeGraphProps { vib: Vibration; tS: number; struck: boolean; tEnd: number; presentation: VibrationPresentation; alt: string }

/** Loudness (the size of the vibration) against real time: the sound drawn as a picture. */
export const EnvelopeGraph: React.FC<EnvelopeGraphProps> = ({ vib, tS, struck, tEnd, presentation: p, alt }) => {
  const W = p.w, H = p.envelopeH, small = p.small;
  const ml = 46, mr = 12, top = 14, bottom = H - 40;
  const xPx = (t: number) => ml + (t / tEnd) * (W - ml - mr);
  const yPx = (a: number) => bottom - Math.min(1, Math.max(0, a)) * (bottom - top);
  const strike = vib.valid ? vib.strike : 0;
  const n = 120;
  const pts = Array.from({ length: n + 1 }, (_, i) => { const t = (tEnd * i) / n; return `${xPx(t).toFixed(1)},${yPx(vib.valid ? amplitudeAt(vib, t) : 0).toFixed(1)}`; }).join(' ');
  const rest = vib.valid ? vib.restAfterS : 0;
  const step = tEnd > 12 ? 4 : tEnd > 6 ? 2 : 1;
  const ticks: number[] = []; for (let t = 0; t <= tEnd + 1e-9; t += step) ticks.push(t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={alt} data-testid="envelope-graph" style={{ maxWidth: Math.max(W, W < 400 ? 440 : W) }}>
      <title>{alt}</title>
      <rect x={ml} y={top} width={W - ml - mr} height={bottom - top} fill="#0b1220" stroke={SOUND_COLORS.tube} />
      {rest > 0 && rest < tEnd && <rect x={xPx(rest)} y={top} width={xPx(tEnd) - xPx(rest)} height={bottom - top} fill="#334155" opacity={0.45} data-testid="silent-region" />}
      <line x1={ml} y1={yPx(REST_AMPLITUDE)} x2={W - mr} y2={yPx(REST_AMPLITUDE)} stroke={SOUND_COLORS.average} strokeDasharray="5 4" />
      <text x={W - mr - 4} y={yPx(REST_AMPLITUDE) - 5} textAnchor="end" fontSize={small} fill={SOUND_COLORS.average}>at rest below this line</text>
      <polyline points={pts} fill="none" stroke="#38bdf8" strokeWidth={2.4} opacity={strike > 0 ? 1 : 0.3} data-testid="envelope-curve" />
      {rest > 0 && rest < tEnd && <text x={rest > tEnd * 0.45 ? xPx(rest) - 6 : xPx(rest) + 6} y={top + small + 4} textAnchor={rest > tEnd * 0.45 ? 'end' : 'start'} fontSize={small} fill={SOUND_COLORS.text}>silent after {Math.round(rest * 10) / 10} s</text>}
      {struck && <line x1={xPx(Math.min(tS, tEnd))} y1={top} x2={xPx(Math.min(tS, tEnd))} y2={bottom} stroke="#fbbf24" strokeWidth={2} data-testid="envelope-cursor" />}
      {ticks.map((t) => (<g key={t}><line x1={xPx(t)} y1={bottom} x2={xPx(t)} y2={bottom + 4} stroke={SOUND_COLORS.muted} /><text x={xPx(t)} y={bottom + 4 + small + 2} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.muted}>{t}</text></g>))}
      <text x={ml + (W - ml - mr) / 2} y={H - 6} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.text}>Time since the strike (seconds, real time)</text>
      <text transform={`rotate(-90 12 ${(top + bottom) / 2})`} x={12} y={(top + bottom) / 2} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.text}>loudness (size)</text>
    </svg>
  );
};
