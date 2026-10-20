import React from 'react';
import { fmt, fmtSigned, TRACK_LENGTH, workAtProgress, type ForceKind, type WorkResult } from '../../../../engine/physics/work/workModel';
import { PHYS } from '../../motion/physicsColors';
import { ExperimentToolbar } from './ExperimentToolbar';

const W = 440, H = 284;
const COLOR: Record<ForceKind, string> = {
  applied: PHYS.force,
  friction: PHYS.friction,
  weight: PHYS.vertical,
  normal: PHYS.vertical,
};
const TAG: Record<ForceKind, string> = { applied: 'F', friction: 'f', weight: 'W', normal: 'N' };
const DISPLACEMENT_COLOR = PHYS.displacement;

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; width?: number; dash?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 3,
  dash,
}) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const s = 10;
  const p1 = `${x2 - s * Math.cos(a - 0.45)},${y2 - s * Math.sin(a - 0.45)}`;
  const p2 = `${x2 - s * Math.cos(a + 0.45)},${y2 - s * Math.sin(a + 0.45)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${p1} ${p2}`} fill={color} />
    </g>
  );
};

export const Scene: React.FC<{ r: WorkResult; progress: number; showVertical: boolean; alt: string }> = ({
  r,
  progress,
  showVertical,
  alt,
}) => {
  const horizontal = r.setup.axis === 'horizontal';
  const pos = workAtProgress(r, progress).position;
  const biggest = Math.max(1, ...r.forces.map((f) => f.magnitude));
  const k = 80 / biggest; // pixels per newton: largest force is 80 px
  const len = (m: number) => Math.max(20, m * k);
  const x0 = 24, trackW = W - 48, ground = 178;
  const px = (m: number) => x0 + (m / TRACK_LENGTH) * trackW;
  const vBase = 224, vTop = 18;
  const py = (m: number) => vBase - (m / TRACK_LENGTH) * (vBase - vTop);
  const BW = 60, BH = 48;
  const cx = horizontal ? px(pos) : 190, cy = horizontal ? ground - BH / 2 : py(pos) - BH / 2;
  const s = r.setup.displacement;
  const startX = horizontal ? px(r.setup.startPos) : 190, endX = horizontal ? px(r.endPos) : 190;
  const startY = horizontal ? ground : py(r.setup.startPos), endY = horizontal ? ground : py(r.endPos);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={alt}
      className="w-full h-auto block rounded-xl bg-surface-lowest border border-surface-border shadow-inner"
      data-testid="work-svg"
    >
      {horizontal ? (
        <g>
          <line x1={x0} y1={ground} x2={x0 + trackW} y2={ground} stroke={PHYS.axis} strokeWidth={4} />
          {[0, 4, 8, 12].map((m) => (
            <g key={m}>
              <line x1={px(m)} y1={ground} x2={px(m)} y2={ground + 7} stroke={PHYS.axis} strokeWidth={2} />
              <text x={px(m)} y={ground + 21} textAnchor="middle" fontSize={12} fill="#94A3B8" fontFamily="sans-serif">
                {m} m
              </text>
            </g>
          ))}
        </g>
      ) : (
        <g>
          <line x1={110} y1={vBase} x2={110} y2={vTop} stroke={PHYS.axis} strokeWidth={4} />
          {[0, 4, 8, 12].map((m) => (
            <g key={m}>
              <line x1={104} y1={py(m)} x2={110} y2={py(m)} stroke={PHYS.axis} strokeWidth={2} />
              <text x={98} y={py(m) + 4} textAnchor="end" fontSize={12} fill="#94A3B8" fontFamily="sans-serif">
                {m} m
              </text>
            </g>
          ))}
        </g>
      )}

      {s !== 0 && (horizontal ? (
        <g data-testid="start-end-markers">
          <line x1={startX} y1={ground - 112} x2={startX} y2={ground} stroke={PHYS.time} strokeDasharray="4 3" />
          <text x={startX} y={ground - 118} textAnchor={startX < endX ? 'end' : 'start'} fontSize={12} fill={PHYS.time} fontFamily="sans-serif">
            start {fmt(r.setup.startPos)} m
          </text>
          <line x1={endX} y1={ground - 112} x2={endX} y2={ground} stroke={DISPLACEMENT_COLOR} strokeDasharray="4 3" />
          <text x={endX} y={ground - 118} textAnchor={startX < endX ? 'start' : 'end'} fontSize={12} fill={DISPLACEMENT_COLOR} fontFamily="sans-serif">
            end {fmt(r.endPos)} m
          </text>
        </g>
      ) : (
        <g data-testid="start-end-markers">
          <line x1={110} y1={startY} x2={250} y2={startY} stroke={PHYS.time} strokeDasharray="4 3" />
          <text x={256} y={startY + 4} fontSize={12} fill={PHYS.time} fontFamily="sans-serif">
            start {fmt(r.setup.startPos)} m
          </text>
          <line x1={110} y1={endY} x2={250} y2={endY} stroke={DISPLACEMENT_COLOR} strokeDasharray="4 3" />
          <text x={256} y={endY + 4} fontSize={12} fill={DISPLACEMENT_COLOR} fontFamily="sans-serif">
            end {fmt(r.endPos)} m
          </text>
        </g>
      ))}

      {s !== 0 && (horizontal ? (
        <g data-testid="displacement-arrow">
          <Arrow x1={startX} y1={ground + 44} x2={endX} y2={ground + 44} color={DISPLACEMENT_COLOR} />
          <text
            x={Math.min(W - 6, Math.max(6, (startX + endX) / 2))}
            y={ground + 66}
            textAnchor={(startX + endX) / 2 < 100 ? 'start' : (startX + endX) / 2 > W - 100 ? 'end' : 'middle'}
            fontSize={13}
            fontWeight={700}
            fill={DISPLACEMENT_COLOR}
            fontFamily="sans-serif"
          >
            displacement s = {fmtSigned(s)} m
          </text>
        </g>
      ) : (
        <g data-testid="displacement-arrow">
          <Arrow x1={400} y1={startY} x2={400} y2={endY} color={DISPLACEMENT_COLOR} />
          <text x={390} y={(startY + endY) / 2 + 4} textAnchor="end" fontSize={13} fontWeight={700} fill={DISPLACEMENT_COLOR} fontFamily="sans-serif">
            s = {fmtSigned(s)} m
          </text>
        </g>
      ))}

      <rect x={cx - BW / 2} y={cy - BH / 2} width={BW} height={BH} rx={6} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
      <text x={cx - BW / 2 + 6} y={cy - BH / 2 + 15} textAnchor="start" fontSize={12} fontWeight={700} fill="#e2e8f0" fontFamily="sans-serif">
        {fmt(r.setup.massKg)} kg
      </text>

      {r.forces.filter((f) => f.magnitude > 0).map((f) => {
        if (!showVertical && (f.id === 'weight' || f.id === 'normal')) return null;
        const cap = f.id === 'weight' || f.id === 'normal' ? 44 : 1000;
        const L = Math.min(cap, len(f.magnitude));
        const ux = f.fx / f.magnitude, uy = -f.fy / f.magnitude; // screen y is down
        let ox = cx, oy = cy + 8;
        if (f.id === 'weight') { ox = cx - 14; oy = cy + BH / 2; }
        else if (f.id === 'normal') { ox = cx + 14; oy = cy - BH / 2; }
        else if (f.id === 'friction') { oy = cy + BH / 2 - 4; }
        const x2 = ox + ux * L, y2 = oy + uy * L;
        const tx = x2 + (ux > 0.3 ? 8 : ux < -0.3 ? -8 : uy === 0 ? 0 : 10);
        const ty = y2 + (uy > 0.3 ? 14 : uy < -0.3 ? -6 : 4);
        return (
          <g key={f.id} data-arrow={f.id} data-magnitude={f.magnitude} data-work={f.work}>
            <Arrow x1={ox} y1={oy} x2={x2} y2={y2} color={COLOR[f.id]} width={f.id === 'applied' ? 4 : 3} />
            <text
              x={Math.min(W - 8, Math.max(8, tx))}
              y={Math.max(14, Math.min(H - 6, ty))}
              textAnchor={ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'start'}
              fontSize={14}
              fontWeight={800}
              fill={COLOR[f.id]}
              fontFamily="sans-serif"
            >
              {TAG[f.id]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export interface LaboratoryCanvasProps {
  result: WorkResult;
  progress: number;
  showVertical: boolean;
  alt: string;
  playing: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onProgressChange: (p: number) => void;
}

/**
 * LaboratoryCanvas: Primary visual workstation stage.
 * Houses the physics scene illustration, coordinate axis, interactive force vector overlays,
 * live semantic legend, and simulation playback controls.
 */
export const LaboratoryCanvas: React.FC<LaboratoryCanvasProps> = ({
  result: r,
  progress,
  showVertical,
  alt,
  playing,
  onTogglePlay,
  onReset,
  onProgressChange,
}) => {
  const horizontal = r.setup.axis === 'horizontal';
  const here = workAtProgress(r, progress);

  return (
    <div className="space-y-4">
      {/* Instrument Stage Container */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Simulation Stage
            </span>
            <span className="text-slate-500 font-mono text-xs">/</span>
            <span className="text-xs font-mono text-slate-400">
              {horizontal ? 'Horizontal Track' : 'Vertical Rail'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
              Mass: {fmt(r.setup.massKg)} kg
            </span>
            <span className="bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
              Track: {TRACK_LENGTH} m
            </span>
          </div>
        </div>

        {/* SVG Simulation Scene */}
        <div className="relative">
          <Scene r={r} progress={progress} showVertical={showVertical} alt={alt} />
        </div>

        {/* Semantic Arrow Legend */}
        <div className="pt-1">
          <ul
            className="flex flex-wrap items-center gap-2 text-xs font-mono"
            aria-label="Key to the arrows"
            data-testid="work-legend"
          >
            {r.forces
              .filter((f) => f.magnitude > 0 && (showVertical || (f.id !== 'weight' && f.id !== 'normal')))
              .map((f) => (
                <li
                  key={f.id}
                  style={{ color: COLOR[f.id] }}
                  className="font-bold bg-surface-lowest px-2.5 py-1 rounded-lg border border-surface-border/70 flex items-center gap-1.5"
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: COLOR[f.id] }}
                  />
                  <span>
                    {TAG[f.id]} = {f.label.toLowerCase()} {fmt(f.magnitude)} N{' '}
                    {f.fy === 0 ? (f.fx > 0 ? '→' : '←') : f.fx === 0 ? (f.fy > 0 ? '↑' : '↓') : '↗'}
                  </span>
                </li>
              ))}
            <li
              style={{ color: DISPLACEMENT_COLOR }}
              className="font-bold bg-surface-lowest px-2.5 py-1 rounded-lg border border-surface-border/70 flex items-center gap-1.5"
            >
              <span className="border-b-2 border-dashed w-3 inline-block" style={{ borderColor: DISPLACEMENT_COLOR }} />
              <span>dashed lines = start and end positions</span>
            </li>
          </ul>
        </div>

        {/* Simulation Playback & Scrubbing Toolbar */}
        <ExperimentToolbar
          playing={playing}
          progress={progress}
          onTogglePlay={onTogglePlay}
          onReset={onReset}
          onProgressChange={onProgressChange}
          positionNow={here.position}
          workDoneSoFar={here.byForce.applied}
          valid={r.valid}
          displacement={r.setup.displacement}
        />
      </div>
    </div>
  );
};
