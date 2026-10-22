import { useRef } from 'react';
import { fmt, fmtSigned, TRACK_LENGTH, workAtProgress, type WorkResult, type WorkSetup } from '../../../../engine/physics/work/workModel';
import { useDiagramLayout } from '../../shared/viewportProfiles';
import { PHYS } from '../../motion/physicsColors';

/** A phone-sized schematic with native text, rather than a zoomed desktop camera. */
export function MobileWorkScene({ result: r, progress, showVertical, alt, selectedObjectId, onSelectObject, onSetupChange, lockMap = {}, showCart = true, showTrack = true, showVectors = true, showCaliper = true }: {
  result: WorkResult; progress: number; showVertical: boolean; alt: string;
  selectedObjectId?: string | null; onSelectObject?: (id: string | null) => void;
  onSetupChange?: (patch: Partial<WorkSetup>) => void; lockMap?: Record<string, boolean>;
  showCart?: boolean; showTrack?: boolean; showVectors?: boolean; showCaliper?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: W } = useDiagramLayout(ref, 440, 280);
  const horizontal = r.setup.axis === 'horizontal';
  const position = workAtProgress(r, progress).position;
  const X = (metres: number) => 36 + metres / TRACK_LENGTH * (W - 72);
  const Y = (metres: number) => 220 - metres / TRACK_LENGTH * 180;
  const cx = horizontal ? X(position) : W / 2, cy = horizontal ? 145 : Y(position);
  const start = horizontal ? X(r.setup.startPos) : Y(r.setup.startPos);
  const end = horizontal ? X(r.endPos) : Y(r.endPos);
  const dragging = useRef(false);
  const colors = { applied: PHYS.force, friction: PHYS.friction, weight: PHYS.vertical, normal: PHYS.vertical };
  const tags = { applied: 'F', friction: 'f', weight: 'W', normal: 'N' };
  const forces = r.forces.filter(f => f.magnitude > 0 && (showVertical || (f.id !== 'weight' && f.id !== 'normal')));
  const maxForce = Math.max(1, ...forces.map(f => f.magnitude));
  return <div className="w-full min-w-0" data-testid="mobile-work-scene">
    <svg ref={ref} viewBox={`0 0 ${W} 280`} className="w-full h-full max-h-[300px]" role="group" aria-label={alt}>
      <title>{alt}</title>
      {showTrack && <g stroke={PHYS.axis} fill="#94a3b8">
        <line x1={horizontal ? 24 : W / 2 - 42} y1={horizontal ? 170 : 24} x2={horizontal ? W - 24 : W / 2 - 42} y2={horizontal ? 170 : 230} strokeWidth={3} />
        {[0, 4, 8, 12].map(m => <text key={m} x={horizontal ? X(m) : W / 2 - 50} y={horizontal ? 192 : Y(m) + 4} textAnchor={horizontal ? 'middle' : 'end'} stroke="none" fontSize={12}>{m} m</text>)}
      </g>}
      {showCaliper && <g strokeDasharray="4 4" strokeWidth={1.5}>
        <line x1={horizontal ? start : W / 2 - 26} x2={horizontal ? start : W / 2 + 26} y1={horizontal ? 88 : start} y2={horizontal ? 170 : start} stroke={PHYS.time} />
        <line x1={horizontal ? end : W / 2 - 26} x2={horizontal ? end : W / 2 + 26} y1={horizontal ? 88 : end} y2={horizontal ? 170 : end} stroke={PHYS.displacement} />
      </g>}
      {showVectors && forces.map(f => {
        const length = 24 + f.magnitude / maxForce * Math.min(45, W / 7);
        const dx = f.fx / f.magnitude, dy = -f.fy / f.magnitude;
        const y = cy + (f.id === 'friction' ? 17 : f.id === 'applied' ? -32 : 0);
        const tx = Math.max(12, Math.min(W - 12, cx + dx * length)), ty = Math.max(14, Math.min(235, y + dy * length));
        const angle = Math.atan2(ty - y, tx - cx), a = angle - .45, b = angle + .45;
        return <g key={f.id} data-arrow={f.id} data-magnitude={f.magnitude} data-work={f.work} stroke={colors[f.id]} fill={colors[f.id]} onClick={() => onSelectObject?.('force')}>
          <line x1={cx} y1={y} x2={tx} y2={ty} strokeWidth={3} />
          <path d={`M${tx},${ty} L${tx - 9 * Math.cos(a)},${ty - 9 * Math.sin(a)} L${tx - 9 * Math.cos(b)},${ty - 9 * Math.sin(b)} Z`} />
          <text x={Math.max(18, Math.min(W - 18, tx))} y={ty - 10} textAnchor="middle" stroke="none" fontSize={13} fontWeight={700}>{tags[f.id]}</text>
        </g>;
      })}
      {showCart && <g role="button" tabIndex={0} aria-label={`Cart, ${fmt(r.setup.massKg)} kg. Select to edit its properties.`}
        style={{ touchAction: onSetupChange && !lockMap.cart ? 'none' : 'auto', cursor: 'pointer' }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectObject?.('cart'); } }}
        onPointerDown={e => { onSelectObject?.('cart'); if (!onSetupChange || lockMap.cart) return; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => {
          if (!dragging.current || !ref.current) return;
          const matrix = ref.current.getScreenCTM(); if (!matrix) return;
          const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
          const next = horizontal ? (point.x - 36) / (W - 72) * TRACK_LENGTH : (220 - point.y) / 180 * TRACK_LENGTH;
          onSetupChange?.({ startPos: Math.max(0, Math.min(TRACK_LENGTH, Math.round(next * 10) / 10)) });
        }} onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
        <rect x={cx - 24} y={cy - 24} width={48} height={48} rx={7} fill="#1e293b" stroke={selectedObjectId === 'cart' ? '#00d4ff' : PHYS.position} strokeWidth={2} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#e2e8f0" fontSize={12}>{fmt(r.setup.massKg)} kg</text>
      </g>}
      {showCaliper && <text x={12} y={256} fill={PHYS.displacement} fontSize={13}>Displacement {fmtSigned(r.setup.displacement)} m</text>}
      <text x={12} y={274} fill="#cbd5e1" fontSize={12}>Net work {fmtSigned(r.netWork)} J</text>
    </svg>
    <ul className="flex flex-wrap gap-x-3 gap-y-1 px-3 pb-2 text-xs" aria-label="Key to the arrows">
      {showVectors && forces.map(f => <li key={f.id} style={{ color: colors[f.id] }}>{tags[f.id]} · {f.label} {fmt(f.magnitude)} N</li>)}
    </ul>
  </div>;
}
