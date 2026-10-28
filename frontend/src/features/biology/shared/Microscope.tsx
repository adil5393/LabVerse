/**
 * The virtual light microscope shared by every Biology chapter, plus the size ladder of Fig. 2.1. All optics come from
 * `engine/biology/microscope.ts`: total magnification, field of view, what can be resolved, and the Activity 2.1 estimate.
 * Pictures are drawn to the true scale of the field; colours stand for stains, and every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { LabChoice, LabSelect, LabSlider, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  OBJECTIVES, SIZE_LADDER, SPECIMENS, apparentSizeMm, estimateCellSize, fieldDiameterMm, instrumentFor, mmToUm, specimenById, totalMagnification, visibility,
  type Specimen,
} from '../../../engine/biology/microscope';

/** Small deterministic random sequence so the field looks the same every time it is drawn. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const R = 95; // radius of the field in SVG units
const C = 100;

const CellShape: React.FC<{ sp: Specimen; x: number; y: number; px: number; i: number; stained: boolean }> = ({ sp, x, y, px, i, stained }) => {
  const fill = stained ? sp.colour : '#e2e8f0';
  const op = stained ? 0.55 : 0.18;
  const nucleus = px >= 10;
  const nr = Math.max(1.2, px * 0.12);
  switch (sp.shape) {
    case 'box': {
      const w = px * 0.96, h = px * 0.62;
      const inner = sp.plasmolysed ? 0.62 : 0.92;
      return (
        <g>
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="none" stroke={stained ? sp.colour : '#94a3b8'} strokeWidth={Math.max(0.4, px * 0.04)} />
          <rect x={x - (w * inner) / 2} y={y - (h * inner) / 2} width={w * inner} height={h * inner} rx={sp.plasmolysed ? px * 0.15 : 0} fill={fill} opacity={op} />
          {nucleus && (sp.dividing && i % 3 === 0
            ? <g>{[-1, 0, 1].map((k) => <rect key={k} x={x - nr * 1.5 + k * nr * 1.2} y={y - nr * 1.6} width={nr * 0.5} height={nr * 3.2} fill="#7f1d1d" />)}</g>
            : <circle cx={x + (i % 2 ? w * 0.2 : -w * 0.2)} cy={y} r={nr} fill="#7f1d1d" opacity={stained ? 0.9 : 0.3} />)}
        </g>
      );
    }
    case 'irregular': {
      const pts = Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * 2 * Math.PI, rr = (px / 2) * (0.75 + 0.25 * Math.sin(k * 2.3 + i)); return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`; }).join(' ');
      return <g><polygon points={pts} fill={fill} opacity={op} stroke={stained ? sp.colour : '#94a3b8'} strokeWidth={Math.max(0.3, px * 0.02)} />{nucleus && <circle cx={x} cy={y} r={nr} fill="#1e3a8a" opacity={stained ? 0.9 : 0.3} />}</g>;
    }
    case 'rod': return <rect x={x - px / 2} y={y - px / 6} width={px} height={px / 3} rx={px / 6} fill={fill} opacity={stained ? 0.9 : 0.3} transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />;
    case 'oval': return <g><ellipse cx={x} cy={y} rx={px / 2} ry={px / 2.6} fill={fill} opacity={0.75} />{sp.budding && i % 3 === 0 && <circle cx={x + px * 0.55} cy={y - px * 0.1} r={px / 5} fill={fill} opacity={0.75} />}</g>;
    case 'slipper': return <g><ellipse cx={x} cy={y} rx={px / 2} ry={px / 4.5} fill={fill} opacity={0.5} stroke={fill} strokeDasharray="1 1.5" transform={`rotate(${(i * 61) % 180} ${x} ${y})`} />{nucleus && <circle cx={x} cy={y} r={nr} fill="#166534" />}</g>;
    case 'blob': { const pts = Array.from({ length: 9 }, (_, k) => { const a = (k / 9) * 2 * Math.PI, rr = (px / 2) * (0.55 + 0.45 * Math.abs(Math.sin(k * 1.7 + i))); return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`; }).join(' '); return <g><polygon points={pts} fill={fill} opacity={0.4} />{nucleus && <circle cx={x} cy={y} r={nr} fill="#475569" />}</g>; }
    case 'sporangium': return <g><line x1={x} y1={y + px} x2={x} y2={y} stroke={fill} strokeWidth={Math.max(0.4, px * 0.06)} /><circle cx={x} cy={y} r={px / 2.2} fill={fill} opacity={0.6} />{px >= 10 && Array.from({ length: 6 }, (_, k) => <circle key={k} cx={x + (px / 4) * Math.cos(k)} cy={y + (px / 4) * Math.sin(k)} r={Math.max(0.5, px * 0.04)} fill="#0c4a6e" />)}</g>;
    case 'filament': return <g><rect x={x - px / 2} y={y - px / 4} width={px} height={px / 2} fill="none" stroke={fill} strokeWidth={Math.max(0.4, px * 0.03)} />{px >= 10 && <path d={`M ${x - px / 2} ${y} q ${px / 4} ${-px / 5} ${px / 2} 0 t ${px / 2} 0`} stroke="#15803d" fill="none" strokeWidth={Math.max(0.5, px * 0.05)} />}</g>;
    default: return <circle cx={x} cy={y} r={px / 2} fill={fill} opacity={op} />;
  }
};

/** Cells or specks to draw in the field, at the true scale of the field. */
function layout(sp: Specimen, fieldUm: number, seed: number): { mode: 'shapes' | 'specks' | 'haze'; items: { x: number; y: number; px: number }[] } {
  const across = fieldUm / sp.sizeUm;
  const px = (2 * R) / across;
  const rand = seeded(seed);
  if (across > 70) return { mode: 'specks', items: Array.from({ length: 260 }, () => { const a = rand() * 2 * Math.PI, r = Math.sqrt(rand()) * R; return { x: C + r * Math.cos(a), y: C + r * Math.sin(a), px: Math.max(1.2, px) }; }) };
  if (sp.arrangement === 'regular') {
    const items: { x: number; y: number; px: number }[] = [];
    const rowH = px * 0.66;
    for (let row = -Math.ceil(R / rowH); row <= Math.ceil(R / rowH); row++) {
      const off = row % 2 ? px / 2 : 0;
      for (let col = -Math.ceil(across / 2) - 1; col <= Math.ceil(across / 2) + 1; col++) items.push({ x: C + col * px + off, y: C + row * rowH, px });
    }
    return { mode: 'shapes', items };
  }
  if (sp.arrangement === 'chain') {
    const items: { x: number; y: number; px: number }[] = [];
    for (const y of [C - R * 0.45, C + R * 0.1, C + R * 0.6]) for (let k = -Math.ceil(across / 2); k <= Math.ceil(across / 2); k++) items.push({ x: C + k * px, y, px });
    return { mode: 'shapes', items };
  }
  const count = Math.max(3, Math.min(60, Math.round(across * across * (sp.arrangement === 'irregular' ? 0.35 : 0.12))));
  return { mode: 'shapes', items: Array.from({ length: count }, () => { const a = rand() * 2 * Math.PI, r = Math.sqrt(rand()) * (R - px / 2); return { x: C + r * Math.cos(a), y: C + r * Math.sin(a), px }; }) };
}

export const MicroscopeVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { specimen?: string; objective?: number; editable?: boolean; specimens?: string[] };
  const choices = q.specimens?.length ? q.specimens.map((id) => specimenById(id)).filter(Boolean) as Specimen[] : SPECIMENS;
  const [specId, setSpecId] = useState(q.specimen ?? choices[0].id);
  const [objective, setObjective] = useState<number>(q.objective ?? 10);
  const [eyepiece, setEyepiece] = useState(10);
  const [focus, setFocus] = useState(50);
  const [stained, setStained] = useState(true);
  const [ruler, setRuler] = useState(false);
  const [count, setCount] = useState('');
  const sp = specimenById(specId) ?? choices[0];
  const mag = totalMagnification(eyepiece, objective);
  const fieldMm = fieldDiameterMm(objective);
  const fieldUm = mmToUm(fieldMm);
  const vis = visibility(sp.sizeUm, mag);
  const blur = Math.abs(focus - 50) / 9;
  const focused = Math.abs(focus - 50) <= 10;
  const lay = layout(sp, fieldUm, sp.id.length * 97 + objective);
  const across = Math.floor(fieldUm / sp.sizeUm);
  const n = Number(count);
  const estimate = count.trim() !== '' && Number.isFinite(n) && n > 0 ? estimateCellSize(fieldUm, n) : null;
  const tick = fieldMm >= 2 ? 1 : 0.1;
  const visText = vis === 'invisible' ? 'Too small to make out at this magnification.' : vis === 'dots' ? 'Visible only as tiny specks: increase the magnification to see their shape.' : 'Shapes are clear enough to make out.';
  const filterId = `mf-${specId}-${objective}`;

  return (
    <div className="space-y-3 p-3" data-testid="microscope" data-specimen={sp.id} data-objective={objective} data-magnification={mag} data-field-um={fieldUm}
      data-visibility={vis} data-focused={focused ? 'true' : 'false'} data-cells-across={across} data-estimate={estimate === null ? '' : String(Math.round(estimate * 100) / 100)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 200" className="w-full max-w-[320px] mx-auto block" role="img" aria-label={`${sp.label} at ${mag} times. ${visText}`}>
          <defs>
            <clipPath id={`clip-${filterId}`}><circle cx={C} cy={C} r={R} /></clipPath>
            <filter id={filterId}><feGaussianBlur stdDeviation={blur} /></filter>
          </defs>
          <circle cx={C} cy={C} r={R + 3} fill="#0f172a" />
          <circle cx={C} cy={C} r={R} fill="#f8fafc" />
          <g clipPath={`url(#clip-${filterId})`} filter={blur > 0.05 ? `url(#${filterId})` : undefined}>
            {ruler ? (
              <g>
                <rect x={C - R} y={C - 8} width={2 * R} height={16} fill="#fef9c3" opacity="0.8" />
                {Array.from({ length: Math.floor(fieldMm / tick) + 1 }, (_, k) => { const x = C - R + (k * tick * 2 * R) / fieldMm; const major = Math.abs((k * tick) % 1) < 1e-9 || tick === 1; return <line key={k} x1={x} y1={C - 8} x2={x} y2={C - (major ? 0 : 3)} stroke="#334155" strokeWidth={major ? 0.9 : 0.5} />; })}
                <text x={C} y={C + 20} fontSize="8" textAnchor="middle" fill="#334155">{tick === 1 ? 'marks every 1 mm' : 'marks every 0.1 mm'}</text>
              </g>
            ) : lay.mode === 'specks' && vis === 'detail' ? (
              lay.items.slice(0, 160).map((it, i) => <CellShape key={i} sp={sp} x={it.x} y={it.y} px={Math.max(3.5, it.px)} i={i} stained={stained} />)
            ) : lay.mode === 'specks' || vis === 'dots' ? (
              lay.items.slice(0, 260).map((it, i) => <circle key={i} cx={it.x} cy={it.y} r={vis === 'invisible' ? 0 : Math.min(1.6, Math.max(0.8, it.px / 2))} fill={stained ? sp.colour : '#94a3b8'} opacity={stained ? 0.9 : 0.35} />)
            ) : vis === 'invisible' ? null : (
              lay.items.map((it, i) => <CellShape key={i} sp={sp} x={it.x} y={it.y} px={it.px} i={i} stained={stained} />)
            )}
            {!ruler && sp.arrangement === 'regular' && <line x1={C - R} y1={C} x2={C + R} y2={C} stroke="#0f766e" strokeWidth="0.8" strokeDasharray="3 2" />}
          </g>
        </svg>
        <p className="text-sm text-white" data-testid="microscope-readout">{sp.label}: {eyepiece}X eyepiece × {objective}X objective = <strong>{mag}X</strong>. Field of view {fmtNum(fieldMm, 2)} mm ({fieldUm.toLocaleString('en-IN')} µm) across.</p>
        <p className="text-sm text-slate-200" data-testid="microscope-visibility">{ruler ? 'The ruler is on the stage: read the width of the field from its marks.' : visText} {!ruler && !focused && <strong className="text-amber-300">The image is blurred: turn the focus knob.</strong>}</p>
        {!ruler && vis !== 'invisible' && <p className="text-xs text-slate-400">{sp.note} Seen: {sp.features.join(', ')}.</p>}
      </div>
      {q.editable && (
        <div className={labCard}>
          {choices.length > 1 && choices.length <= 4 && <LabChoice name="specimen" label="Slide" value={sp.id} options={choices.map((s) => ({ id: s.id, label: s.label }))} onChange={(id) => { setSpecId(id); setCount(''); }} />}
          {choices.length > 4 && <LabSelect id="ms-specimen" label="Slide" value={sp.id} options={choices.map((s) => ({ id: s.id, label: s.label }))} onChange={(id) => { setSpecId(id); setCount(''); }} />}
          <LabChoice name="objective" label="Objective lens" value={String(objective)} options={OBJECTIVES.map((o) => ({ id: String(o), label: o === 100 ? '100X (oil)' : `${o}X` }))} onChange={(id) => { setObjective(Number(id)); setCount(''); }} />
          <LabChoice name="eyepiece" label="Eyepiece" value={String(eyepiece)} options={[{ id: '10', label: '10X' }, { id: '15', label: '15X' }]} onChange={(id) => setEyepiece(Number(id))} />
          <LabSlider id="ms-focus" label="Fine focus" value={focus} min={0} max={100} step={1} unit="" onChange={setFocus} />
          <div className="flex flex-wrap gap-2">
            <button type="button" data-action="stain" aria-pressed={stained} onClick={() => setStained((s) => !s)} className="min-h-[48px] px-3 rounded-xl border border-surface-border bg-surface text-sm text-white">{stained ? 'Remove stain' : 'Add stain'}</button>
            <button type="button" data-action="ruler" aria-pressed={ruler} onClick={() => setRuler((r) => !r)} className="min-h-[48px] px-3 rounded-xl border border-surface-border bg-surface text-sm text-white">{ruler ? 'Remove the ruler' : 'Place a ruler on the stage'}</button>
          </div>
          {!stained && <p className="text-xs text-slate-400">Unstained cells have little contrast: most are almost transparent.</p>}
          {sp.arrangement === 'regular' && !ruler && (
            <div className="space-y-1">
              <label htmlFor="ms-count" className="block text-sm text-slate-200">Cells counted along the dashed line
                <input id="ms-count" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface" />
              </label>
              {estimate !== null && <p className="text-sm text-white" data-testid="microscope-estimate">Estimated cell size = {fieldUm.toLocaleString('en-IN')} µm ÷ {n} = <strong>{fmtNum(estimate, 1)} µm</strong>. {Math.abs(estimate - sp.sizeUm) <= sp.sizeUm * 0.15 ? 'That matches a typical cell of this kind.' : `A typical cell here is about ${sp.sizeUm} µm; count again along the line.`}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SizeLadderVisual: React.FC<VisualProps> = ({ alt }) => (
  <div className="space-y-2 p-3" data-testid="size-ladder" aria-label={alt}>
    <ul className={labCard}>
      {SIZE_LADDER.map((row) => {
        const tool = instrumentFor(row.sizeUm);
        const width = Math.max(4, Math.min(100, ((Math.log10(row.sizeUm) + 2.5) / 7.3) * 100));
        return (
          <li key={row.label} className="text-sm text-slate-200" data-instrument={tool}>
            <span className="flex justify-between gap-2"><span>{row.label}</span><span className="font-mono text-white">{row.sizeUm >= 1000 ? `${fmtNum(row.sizeUm / 1000, 1)} mm` : `${row.sizeUm} µm`}</span></span>
            <span className="block h-2 rounded bg-surface"><span className={`block h-2 rounded ${tool === 'unaided eye' ? 'bg-emerald-400' : tool === 'light microscope' ? 'bg-sky-400' : 'bg-fuchsia-400'}`} style={{ width: `${width}%` }} /></span>
            <span className="text-xs text-slate-400">{tool}{tool !== 'unaided eye' ? ` (looks ${fmtNum(apparentSizeMm(row.sizeUm, 400), 2)} mm at 400X)` : ''}</span>
          </li>
        );
      })}
    </ul>
    <p className="text-xs text-slate-400">Bar lengths use a logarithmic scale: each step along is ten times larger. Green: unaided eye; blue: light microscope; purple: electron microscope only.</p>
  </div>
);
