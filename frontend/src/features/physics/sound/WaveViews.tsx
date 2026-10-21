/**
 * Drawings of the longitudinal wave (SND-1): the tube of particles with its density strip, and the density graphs. Both are drawn
 * from the same wave model at the same physical time, and share their horizontal mapping so a compression in the tube sits
 * directly above the crest in the graph. Which part of the tube is in view, how many particles are drawn and how large the labels
 * are come from the presentation profile (mobile or desktop); the physics does not change.
 */

import React from 'react';
import {
  compressionCentres, density, densityAtPlace, particlePosition, PARTICLE_SPACING_M, rarefactionCentres, restPositions, type Wave,
} from '../../../engine/physics/sound/wave';
import { pxPerMetre, xToPx, type WavePresentation } from './soundViewport';

export const SOUND_COLORS = {
  particle: '#7dd3fc', marked: '#fbbf24', compression: '#f97316', rarefaction: '#a78bfa', curve: '#38bdf8', average: '#94a3b8', text: '#e2e8f0', muted: '#94a3b8', tube: '#334155', grid: '#1e293b',
} as const;

const f1 = (n: number): string => String(Math.round(n * 10) / 10);
const f2 = (n: number): string => String(Math.round(n * 100) / 100);

/** The rest position of the particle that is marked: near the middle of the view, in the middle row. */
export function markedRestPosition(p: WavePresentation): number {
  const mid = (p.camera[0] + p.camera[1]) / 2;
  const rows = p.rows, wantRow = Math.floor(rows / 2);
  const base = Math.round(mid / PARTICLE_SPACING_M);
  for (let d = 0; d < rows; d++) { const i = base + d; if (((i % rows) + rows) % rows === wantRow) return Math.round(i * PARTICLE_SPACING_M * 1e9) / 1e9; }
  return Math.round(base * PARTICLE_SPACING_M * 1e9) / 1e9;
}

/** The compression that is followed: the first one in view. */
export function followedCompression(w: Wave, tPhys: number, p: WavePresentation): number | null {
  const c = compressionCentres(w, tPhys, p.camera[0], p.camera[1]);
  return c.length ? c[0] : null;
}

export interface WaveSceneProps {
  wave: Wave;
  /** Physical seconds. */
  tPhys: number;
  presentation: WavePresentation;
  mark?: boolean;
  alt: string;
}

export const WaveScene: React.FC<WaveSceneProps> = ({ wave, tPhys, presentation: p, mark = true, alt }) => {
  const w = wave;
  const { sceneW: W, sceneH: H, marginL, marginR, radius, rows, font, small } = p;
  const [from, to] = p.camera;
  const tubeTop = 58, tubeBottom = H - 46, tubeH = tubeBottom - tubeTop;
  const ppm = pxPerMetre(p);
  const m0 = markedRestPosition(p);
  const rest = restPositions(from - 0.3, to + 0.3);
  const C = compressionCentres(w, tPhys, from, to);
  const R = rarefactionCentres(w, tPhys, from, to);
  const lambdaPx = wave.lambda * ppm;
  const showLetters = lambdaPx / 2 >= p.labelMinGapPx;
  const followed = followedCompression(w, tPhys, p);
  const cols = Math.max(24, Math.round((W - marginL - marginR) / 3));
  const strip = Array.from({ length: cols }, (_, i) => {
    const x = from + ((i + 0.5) / cols) * (to - from);
    const level = w.densityAmp > 0 ? (density(w, x, tPhys) - (1 - w.densityAmp)) / (2 * w.densityAmp) : 0.5;
    return { px: xToPx(p, from + (i / cols) * (to - from)), w: (W - marginL - marginR) / cols + 0.6, level };
  });
  const bracketA = C.length >= 2 ? C[0] : null;
  const bracket = bracketA !== null && bracketA + wave.lambda <= to + 1e-9 && lambdaPx >= 70 ? [bracketA, bracketA + wave.lambda] : null;
  const markedX = particlePosition(w, m0, tPhys);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={alt} data-testid="wave-scene" data-profile={p.markLabel === 'marked' ? 'mobile' : 'desktop'} style={{ maxWidth: Math.max(W, W < 400 ? 440 : W) }}>
      <title>{alt}</title>
      <rect x={marginL} y={tubeTop} width={W - marginL - marginR} height={tubeH} rx={6} fill="#0b1220" stroke={SOUND_COLORS.tube} strokeWidth={1.5} />
      {/* particles */}
      <g data-testid="wave-particles">
        {rest.map((x0, i) => {
          const row = ((Math.round(x0 / PARTICLE_SPACING_M) % rows) + rows) % rows;
          const isMarked = mark && Math.abs(x0 - m0) < 1e-6;
          const x = xToPx(p, particlePosition(w, x0, tPhys));
          const y = tubeTop + ((row + 0.5) * tubeH) / rows;
          if (x < marginL - 1 || x > W - marginR + 1) return null;
          if (isMarked) return null;
          return <circle key={i} cx={x} cy={y} r={radius} fill={SOUND_COLORS.particle} opacity={0.9} />;
        })}
      </g>
      {/* followed compression flag */}
      {mark && followed !== null && (
        <g data-testid="followed-compression">
          <line x1={xToPx(p, followed)} y1={tubeTop - 4} x2={xToPx(p, followed)} y2={tubeBottom} stroke={SOUND_COLORS.compression} strokeWidth={2} strokeDasharray="5 3" />
          <polygon points={`${xToPx(p, followed)},${tubeTop - 4} ${xToPx(p, followed) + 16},${tubeTop - 10} ${xToPx(p, followed)},${tubeTop - 16}`} fill={SOUND_COLORS.compression} />
        </g>
      )}
      {/* marked particle, its rest position and its ring */}
      {mark && (
        <g data-testid="marked-particle">
          <line x1={xToPx(p, m0)} y1={tubeBottom - 2} x2={xToPx(p, m0)} y2={tubeBottom + 10} stroke={SOUND_COLORS.marked} strokeWidth={2} />
          <circle cx={xToPx(p, markedX)} cy={tubeTop + ((Math.floor(rows / 2) + 0.5) * tubeH) / rows} r={radius + 2.5} fill={SOUND_COLORS.marked} stroke="#fff" strokeWidth={1.2} />
          <text x={xToPx(p, m0)} y={tubeBottom + 10 + small + 1} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.marked}>{p.restLabel}</text>
        </g>
      )}
      {/* density strip */}
      <g data-testid="density-strip" aria-hidden>
        {strip.map((s, i) => <rect key={i} x={s.px} y={tubeBottom - 8} width={s.w} height={8} fill={SOUND_COLORS.curve} opacity={0.1 + 0.8 * s.level} />)}
      </g>
      {/* compression and rarefaction letters */}
      {showLetters && (
        <g data-testid="cr-letters" fontSize={font} fontWeight={700}>
          {C.map((c, i) => <text key={`c${i}`} x={xToPx(p, c)} y={tubeTop - 24} textAnchor="middle" fill={SOUND_COLORS.compression}>C</text>)}
          {R.map((r, i) => <text key={`r${i}`} x={xToPx(p, r)} y={tubeTop - 24} textAnchor="middle" fill={SOUND_COLORS.rarefaction}>R</text>)}
        </g>
      )}
      {/* wavelength bracket */}
      {bracket && (
        <g data-testid="wavelength-bracket" stroke={SOUND_COLORS.text} strokeWidth={1.2}>
          <line x1={xToPx(p, bracket[0])} y1={22} x2={xToPx(p, bracket[1])} y2={22} />
          <line x1={xToPx(p, bracket[0])} y1={17} x2={xToPx(p, bracket[0])} y2={27} />
          <line x1={xToPx(p, bracket[1])} y1={17} x2={xToPx(p, bracket[1])} y2={27} />
          <text x={(xToPx(p, bracket[0]) + xToPx(p, bracket[1])) / 2} y={14} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.text} stroke="none">wavelength {f2(wave.lambda)} m</text>
        </g>
      )}
      {/* direction and scale */}
      <g fontSize={small} fill={SOUND_COLORS.muted}>
        <text x={W - marginR} y={H - 24} textAnchor="end">wave travels →</text>
        <line x1={marginL} y1={H - 10} x2={marginL + ppm} y2={H - 10} stroke={SOUND_COLORS.text} strokeWidth={2} />
        <text x={marginL + ppm + 6} y={H - 6}>1 m</text>
        <text x={W - marginR} y={H - 6} textAnchor="end">{from} to {f1(to)} m of the tube</text>
      </g>
    </svg>
  );
};

export type GraphMode = 'distance' | 'time';

export interface DensityGraphProps {
  wave: Wave;
  tPhys: number;
  presentation: WavePresentation;
  mode?: GraphMode;
  alt: string;
  /** Lettered points for questions. */
  marks?: { id: string; x: number; label: string }[];
}

const Y_MIN = 0.4, Y_MAX = 1.6;

export const DensityGraph: React.FC<DensityGraphProps> = ({ wave, tPhys, presentation: p, mode = 'distance', alt, marks }) => {
  const { sceneW: W, graphH: H, marginL, marginR, font, small } = p;
  const top = 18, bottom = H - 46;
  const yPx = (rho: number) => bottom - ((rho - Y_MIN) / (Y_MAX - Y_MIN)) * (bottom - top);
  const [from, to] = p.camera;
  const innerW = W - marginL - marginR;
  const m0 = markedRestPosition(p);

  let pts: { x: number; y: number }[] = [];
  let xTicks: { px: number; label: string }[] = [];
  let cursorPx: number | null = null;
  let crestMarks: { px: number; kind: 'crest' | 'trough' }[] = [];
  if (mode === 'distance') {
    const n = 260;
    pts = Array.from({ length: n }, (_, i) => { const x = from + ((to - from) * i) / (n - 1); return { x: xToPx(p, x), y: yPx(density(wave, x, tPhys)) }; });
    const step = to - from > 4 ? 1 : 0.5;
    for (let x = Math.ceil(from / step) * step; x <= to + 1e-9; x += step) xTicks.push({ px: xToPx(p, x), label: f1(x) });
    crestMarks = [
      ...compressionCentres(wave, tPhys, from, to).map((c) => ({ px: xToPx(p, c), kind: 'crest' as const })),
      ...rarefactionCentres(wave, tPhys, from, to).map((r) => ({ px: xToPx(p, r), kind: 'trough' as const })),
    ];
  } else {
    const span = 3 * wave.period, t0 = tPhys - 2.5 * wave.period;
    const series = densityAtPlace(wave, m0, t0, t0 + span, 260);
    pts = series.map((s) => ({ x: marginL + ((s.t - t0) / span) * innerW, y: yPx(s.rho) }));
    for (let k = 0; k <= 3; k++) { const t = t0 + (k * span) / 3; xTicks.push({ px: marginL + (k / 3) * innerW, label: f1(t * 1000) }); }
    cursorPx = marginL + ((2.5 * wave.period) / span) * innerW;
  }
  const path = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
  const lambdaPx = wave.lambda * pxPerMetre(p);
  const labelCrests = mode === 'distance' && lambdaPx >= 90;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={alt} data-testid="density-graph" data-mode={mode} style={{ maxWidth: Math.max(W, W < 400 ? 440 : W) }}>
      <title>{alt}</title>
      <rect x={marginL} y={top} width={innerW} height={bottom - top} fill="#0b1220" stroke={SOUND_COLORS.tube} />
      {[0.5, 1, 1.5].map((v) => (
        <g key={v}>
          <line x1={marginL - 4} y1={yPx(v)} x2={marginL} y2={yPx(v)} stroke={SOUND_COLORS.muted} />
          <text x={marginL - 7} y={yPx(v) + small / 3} textAnchor="end" fontSize={small} fill={SOUND_COLORS.muted}>{v === 1 ? '1.0' : f1(v)}</text>
        </g>
      ))}
      <line x1={marginL} y1={yPx(1)} x2={W - marginR} y2={yPx(1)} stroke={SOUND_COLORS.average} strokeDasharray="6 4" strokeWidth={1.4} data-testid="average-line" />
      <text x={W - marginR - 4} y={yPx(1) - 5} textAnchor="end" fontSize={small} fill={SOUND_COLORS.average}>average density</text>
      <path d={path} fill="none" stroke={SOUND_COLORS.curve} strokeWidth={2.4} data-testid="density-curve" />
      {labelCrests && crestMarks.slice(0, 8).map((m, i) => (
        <g key={i}>
          <circle cx={m.px} cy={yPx(m.kind === 'crest' ? 1 + wave.densityAmp : 1 - wave.densityAmp)} r={3.5} fill={m.kind === 'crest' ? SOUND_COLORS.compression : SOUND_COLORS.rarefaction} />
        </g>
      ))}
      {labelCrests && (() => {
        const c = crestMarks.find((m) => m.kind === 'crest'), tr = crestMarks.find((m) => m.kind === 'trough');
        return (
          <g fontSize={small} fontWeight={700}>
            {c && <text x={c.px} y={yPx(1 + wave.densityAmp) - 8} textAnchor="middle" fill={SOUND_COLORS.compression}>crest</text>}
            {tr && <text x={tr.px} y={yPx(1 - wave.densityAmp) + small + 6} textAnchor="middle" fill={SOUND_COLORS.rarefaction}>trough</text>}
          </g>
        );
      })()}
      {mode === 'distance' && marks?.map((m) => {
        const x = xToPx(p, m.x), y = yPx(density(wave, m.x, tPhys));
        return (<g key={m.id}><circle cx={x} cy={y} r={5} fill="#fff" stroke={SOUND_COLORS.curve} strokeWidth={2} /><text x={x} y={y - 10} textAnchor="middle" fontSize={font} fontWeight={700} fill={SOUND_COLORS.text}>{m.label}</text></g>);
      })}
      {cursorPx !== null && <line x1={cursorPx} y1={top} x2={cursorPx} y2={bottom} stroke={SOUND_COLORS.marked} strokeWidth={1.5} strokeDasharray="3 3" />}
      {xTicks.map((t, i) => (
        <g key={i}><line x1={t.px} y1={bottom} x2={t.px} y2={bottom + 4} stroke={SOUND_COLORS.muted} /><text x={t.px} y={bottom + 4 + small + 2} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.muted}>{t.label}</text></g>
      ))}
      <text x={marginL + innerW / 2} y={H - 6} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.text}>
        {mode === 'distance' ? 'Distance from the source (m)' : 'Time at the marked particle’s place (milliseconds, real time)'}
      </text>
      <text transform={`rotate(-90 12 ${(top + bottom) / 2})`} x={12} y={(top + bottom) / 2} textAnchor="middle" fontSize={small} fill={SOUND_COLORS.text}>density (average = 1)</text>
    </svg>
  );
};
