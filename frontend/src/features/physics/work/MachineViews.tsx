/**
 * The Simple Machines scenes (PHY-3D): the inclined plane, the pulley system and the lever. Each is drawn from its model in
 * engine/physics/work/machines.ts, so the geometry, the force arrows, the distances, the work bars and the text all agree.
 * Controls sit under the scene; secondary settings are collapsed. The scenes are schematic drawings of exact models: the rope
 * length constraint (rope pulled = strands x rise) and the lever geometry (arc = arm x angle) are computed, not animated separately.
 */

import React, { useState } from 'react';
import { computeLever, computePulley, computeRamp, LEVER_LIMITS, PULLEY_LIMITS, pulleyAt, RAMP_LIMITS, type LeverSetup, type PulleySetup, type RampSetup } from '../../../engine/physics/work/machines';
import { ENERGY, PHYS } from '../motion/physicsColors';
import type { VisualProps } from '../../education/visuals';
import { Field } from './Field';
import { Arrow, ProgressControl, WorkBars } from './MachineParts';
import { barColors, cellOf, f2 } from './MachineUtil';

const errBox = (msg: string, id: string) => <p role="alert" className="text-sm rounded-xl border px-3 py-3" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }} data-testid={id}>This setup cannot run: {msg}</p>;
const ctl = 'space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3';

// ----------------------------------------------------------------------------- inclined plane
export const RampView: React.FC<{ initial: RampSetup; editable?: boolean; alt?: string; startProgress?: number }> = ({ initial, editable = false, alt, startProgress = 0 }) => {
  const [setup, setSetup] = useState(initial);
  const [p, setP] = useState(startProgress);
  const r = computeRamp(setup);
  const change = (o: Partial<RampSetup>) => { setSetup((s) => ({ ...s, ...o })); };
  if (!r.valid) return <div className="space-y-3" data-visual="rampLab">{errBox(r.reason ?? '', 'ramp-error')}{editable && <RampControls setup={setup} change={change} />}</div>;
  const W = 440, H = 262, x0 = 56, ground = 190, k = Math.min(320 / Math.max(r.width, 1e-9), 150 / setup.height, 1e9);
  const wpx = r.width * k, hpx = setup.height * k;
  const top = { x: x0, y: ground - hpx }, bottom = { x: x0 + wpx, y: ground }; // the ramp descends to the right; the load goes UP towards the top-left
  const along = { x: -r.width / setup.length, y: -setup.height / setup.length }; // unit vector up the slope in screen-ish coords (x right, y up is negative)
  const pos = { x: bottom.x + along.x * setup.length * k * p, y: bottom.y + along.y * setup.length * k * p };
  const n = { x: -along.y, y: along.x }; // a normal pointing away from the slope (towards the upper right)
  const cx = pos.x + n.x * 14, cy = pos.y + n.y * 14;
  const scale = 60 / Math.max(r.load, 1);
  const bars = [
    { id: 'input', label: 'work you do: F′ × L', value: r.inputWork, color: barColors.input },
    { id: 'useful', label: 'useful work: m g h', value: r.outputWork, color: barColors.useful },
    { id: 'lost', label: 'thermal (friction)', value: r.lost, color: barColors.lost },
  ];
  const text = `Inclined plane: a ${f2(setup.massKg)} kg load (weight ${f2(r.load)} N) is pushed up a ramp ${f2(setup.length)} m long to a height of ${f2(setup.height)} m (width ${f2(r.width)} m, angle ${f2(r.angleDeg)}°)${setup.mu > 0 ? ` with friction (coefficient ${f2(setup.mu)})` : ' with no friction'}. The effort along the ramp is ${f2(r.effort)} N (${f2(r.idealEffort)} N if smooth), the mechanical advantage load ÷ effort = ${f2(r.actualMA)} (ideal L ÷ h = ${f2(r.idealMA)}). The work you do is ${f2(r.inputWork)} J, the useful work m g h is ${f2(r.outputWork)} J, and ${f2(r.lost)} J becomes thermal energy.`;
  return (
    <div className="space-y-3 min-w-0" data-visual="rampLab" data-testid="ramp-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={text} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="ramp-svg">
        <polygon points={`${top.x},${top.y} ${bottom.x},${bottom.y} ${x0},${ground}`} fill="#1e293b" opacity={0.75} />
        <line x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} stroke={PHYS.axis} strokeWidth={4} data-testid="slope" />
        <line x1={x0} y1={ground} x2={bottom.x + 20} y2={ground} stroke={PHYS.axis} strokeWidth={3} />
        <line x1={x0 - 12} y1={top.y} x2={x0 - 12} y2={ground} stroke={PHYS.displacement} strokeWidth={2} /><text x={x0 + 8} y={ground - 10} textAnchor="start" fontSize={12} fontWeight={700} fill={PHYS.displacement}>h = {f2(setup.height)} m</text>
        <text x={(x0 + bottom.x) / 2} y={ground + 50} textAnchor="middle" fontSize={11} fill="#94A3B8">width {f2(r.width)} m</text>
        <text x={(top.x + bottom.x) / 2 + 12} y={(top.y + bottom.y) / 2 - 8} fontSize={12} fontWeight={700} fill={PHYS.distance}>L = {f2(setup.length)} m</text>
        <rect x={cx - 11} y={cy - 11} width={22} height={22} rx={3} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} transform={`rotate(${-Math.atan2(along.y, along.x) * 180 / Math.PI + 180} ${cx} ${cy})`} />
        <g data-arrow="effort"><Arrow x1={cx} y1={cy} x2={cx + along.x * Math.max(24, r.effort * scale)} y2={cy + along.y * Math.max(24, r.effort * scale)} color={ENERGY.work} width={4} /><text x={cx + along.x * Math.max(24, r.effort * scale) + 4} y={cy + along.y * Math.max(24, r.effort * scale) - 6} fontSize={11} fontWeight={800} fill={ENERGY.work}>effort {f2(r.effort)} N</text></g>
        <g data-arrow="weight"><Arrow x1={cx} y1={cy} x2={cx} y2={cy + Math.min(46, Math.max(24, r.load * scale))} color={PHYS.vertical} /><text x={cx - 6} y={cy + Math.min(46, Math.max(24, r.load * scale)) + 14} textAnchor="end" fontSize={11} fontWeight={700} fill={PHYS.vertical}>weight {f2(r.load)} N</text></g>
        {setup.mu > 0 && <g data-arrow="friction"><Arrow x1={cx} y1={cy} x2={cx - along.x * Math.max(18, setup.mu * r.load * (r.width / setup.length) * scale)} y2={cy - along.y * Math.max(18, setup.mu * r.load * (r.width / setup.length) * scale)} color={PHYS.friction} /></g>}
      </svg>
      <div className="flex flex-wrap items-center gap-2"><ProgressControl value={p} onChange={setP} label="How far up the ramp" testid="ramp-progress" unit="along the ramp" /></div>
      <p className="text-xs text-slate-300" data-testid="ramp-now">Moved {f2(p * setup.length)} m along the ramp and risen {f2(p * setup.height)} m; work done by the effort so far {f2(p * r.inputWork)} J, useful work so far {f2(p * r.outputWork)} J.</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Key to the arrows"><li style={{ color: ENERGY.work }} className="font-bold">effort F′ along the ramp</li><li style={{ color: PHYS.vertical }} className="font-bold">weight (load) m g</li>{setup.mu > 0 && <li style={{ color: PHYS.friction }} className="font-bold">friction on the load (down the ramp)</li>}</ul>
      {editable && <RampControls setup={setup} change={change} />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="ramp-readout">
        {cellOf('effort', 'effort F′', `${f2(r.effort)} N`, ENERGY.work)}
        {cellOf('load', 'load m g', `${f2(r.load)} N`, PHYS.vertical)}
        {cellOf('ma', 'mechanical advantage = load ÷ effort', `${f2(r.actualMA)} (ideal L ÷ h = ${f2(r.idealMA)})`)}
        {cellOf('angle', 'angle of the ramp', `${f2(r.angleDeg)}°`, PHYS.position)}
        {cellOf('input', 'work you do F′ × L', `${f2(r.inputWork)} J`, barColors.input)}
        {cellOf('output', 'useful work m g h', `${f2(r.outputWork)} J`, barColors.useful)}
        {cellOf('lost', 'thermal energy', `${f2(r.lost)} J`, barColors.lost)}
        {cellOf('eff', 'useful ÷ input', `${f2(r.efficiency * 100)} %`)}
      </div>
      <WorkBars bars={bars} title="Work, same scale" alt={`Work bars: you do ${f2(r.inputWork)} J, the useful work is ${f2(r.outputWork)} J and ${f2(r.lost)} J becomes thermal energy.`} />
      <p className="text-sm rounded-xl border px-3 py-2 text-slate-100" style={{ borderColor: r.outputWork <= r.inputWork + 1e-9 ? PHYS.correct : PHYS.error }} data-testid="ramp-check">{r.outputWork <= r.inputWork + 1e-9 ? '✓ ' : '✗ '}Useful work {f2(r.outputWork)} J {r.lost < 1e-9 ? '=' : '≤'} work done {f2(r.inputWork)} J{r.lost > 1e-9 ? `; the difference ${f2(r.lost)} J is thermal energy` : ' (a smooth ramp is an ideal machine)'}. Lifting straight up takes {f2(r.directEffort)} N over {f2(setup.height)} m: the same {f2(r.directWork)} J.</p>
      {!alt && <p className="text-xs text-slate-300" data-testid="ramp-description">{text}</p>}
      <p className="text-[11px] text-slate-400">Assumptions: a rigid straight ramp, a steady push parallel to the slope at constant speed (no change of kinetic energy), constant kinetic friction coefficient; no efficiency is assumed: it follows from the friction. Mass {RAMP_LIMITS.massMin} to {RAMP_LIMITS.massMax} kg; height {RAMP_LIMITS.heightMin} to {RAMP_LIMITS.heightMax} m; length up to {RAMP_LIMITS.lengthMax} m.</p>
    </div>
  );
};

const RampControls: React.FC<{ setup: RampSetup; change: (o: Partial<RampSetup>) => void }> = ({ setup, change }) => (
  <div className={ctl} data-testid="ramp-controls">
    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the ramp</h3>
    <div className="flex flex-wrap gap-3 items-center">
      <Field id="mass" label="Load mass" unit="kg" value={setup.massKg} step={5} onChange={(v) => change({ massKg: v })} />
      <Field id="height" label="Height h" unit="m" value={setup.height} step={0.5} onChange={(v) => change({ height: v })} />
      <Field id="length" label="Ramp length L" unit="m" value={setup.length} step={1} onChange={(v) => change({ length: v })} />
      <Field id="mu" label="Friction coefficient" unit="(0 = smooth)" value={setup.mu} step={0.1} onChange={(v) => change({ mu: Math.round(v * 100) / 100 })} />
    </div>
    <details className="rounded-lg border border-surface-border px-3 py-1"><summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings (g)</summary><div className="py-2"><Field id="g" label="g" unit="m/s²" value={setup.g} step={1} onChange={(v) => change({ g: v })} /></div></details>
  </div>
);

// ----------------------------------------------------------------------------- pulley
export const PulleyView: React.FC<{ initial: PulleySetup; editable?: boolean; alt?: string; startProgress?: number }> = ({ initial, editable = false, alt, startProgress = 0 }) => {
  const [setup, setSetup] = useState(initial);
  const [p, setP] = useState(startProgress);
  const r = computePulley(setup);
  const change = (o: Partial<PulleySetup>) => setSetup((s) => ({ ...s, ...o }));
  if (!r.valid) return <div className="space-y-3" data-visual="pulleyLab">{errBox(r.reason ?? '', 'pulley-error')}{editable && <PulleyControls setup={setup} change={change} />}</div>;
  const at = pulleyAt(r, p);
  const n = setup.strands, W = 440, H = 270, topY = 24, travel = 80;
  const q = setup.lift > 0 ? at.rise / setup.lift : 0;            // fraction of the lift
  const left = 150, width = n === 1 ? 0 : Math.min(150, 30 * n);
  const mid = n === 1 ? left - 14 : left + width / 2;               // x of the load
  const highY = topY + 50, my = highY + (1 - q) * travel;         // top of the movable block (or of the load rope end for a fixed pulley)
  const xs = n === 1 ? [left - 14] : Array.from({ length: n }, (_, i) => left + (i * width) / (n - 1));
  const loadTop = n === 1 ? my + 24 : my + 18 + 26;                 // top of the load box
  const effX = left + width + 64, effEnd = topY + 44 + q * 40;      // the free end (not to scale)
  const bars = [
    { id: 'input', label: 'work you do: effort × rope', value: r.inputWork, color: barColors.input },
    { id: 'useful', label: 'useful work: m g h', value: r.outputWork, color: barColors.useful },
    { id: 'stored', label: 'stored in the pulley block', value: r.storedInBlock, color: barColors.stored },
  ];
  const text = `Pulley: a ${f2(setup.massKg)} kg load (${f2(r.load)} N) is raised ${f2(setup.lift)} m by a system with ${n} supporting strand${n > 1 ? 's' : ''}${n > 1 && setup.blockKg > 0 ? ` and a ${f2(setup.blockKg)} kg movable block` : ''}. The effort is ${f2(r.effort)} N (mechanical advantage ${f2(r.actualMA)}, ideal ${n}). The rope pulled is ${n} × ${f2(setup.lift)} = ${f2(r.ropePulled)} m. Work done by the effort ${f2(r.inputWork)} J; useful work ${f2(r.outputWork)} J${r.storedInBlock > 0 ? `; ${f2(r.storedInBlock)} J is stored in the lifted block` : ''}.${n === 1 ? ' A single fixed pulley only changes the direction of the effort.' : ''}`;
  return (
    <div className="space-y-3 min-w-0" data-visual="pulleyLab" data-testid="pulley-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={text} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="pulley-svg">
        <rect x={left - 44} y={topY - 10} width={Math.max(width, 0) + 150} height={10} fill={PHYS.axis} />
        {n === 1 ? (
          <g data-testid="strands">
            <circle cx={left} cy={topY + 14} r={14} fill="#1e293b" stroke={PHYS.axis} strokeWidth={3} />
            <line x1={left - 14} y1={topY + 14} x2={left - 14} y2={loadTop} stroke={PHYS.distance} strokeWidth={3} data-strand="1" />
            <line x1={left + 14} y1={topY + 14} x2={left + 14} y2={topY + 44 + q * travel} stroke={PHYS.distance} strokeWidth={3} data-strand="effort" />
          </g>
        ) : (
          <g data-testid="strands">
            {xs.map((x, i) => <line key={i} x1={x} y1={topY} x2={x} y2={my} stroke={PHYS.distance} strokeWidth={3} data-strand={i + 1} />)}
            <rect x={left - 22} y={my} width={width + 44} height={18} rx={4} fill="#1e293b" stroke={PHYS.axis} strokeWidth={2} />
            <line x1={mid} y1={my + 18} x2={mid} y2={loadTop} stroke={PHYS.distance} strokeWidth={3} />
            <line x1={effX} y1={topY} x2={effX} y2={effEnd} stroke={PHYS.distance} strokeWidth={3} strokeDasharray="6 4" />
          </g>
        )}
        <rect x={mid - 26} y={loadTop} width={52} height={36} rx={5} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
        <text x={mid} y={loadTop + 23} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0">{f2(setup.massKg)} kg</text>
        <g data-arrow="load"><Arrow x1={mid + 38} y1={loadTop + 4} x2={mid + 38} y2={loadTop + 44} color={PHYS.vertical} /><text x={mid + 46} y={loadTop + 40} fontSize={11} fontWeight={700} fill={PHYS.vertical}>load {f2(r.load)} N</text></g>
        <g data-arrow="effort"><Arrow x1={n === 1 ? left + 14 : effX} y1={(n === 1 ? topY + 44 + q * travel : effEnd)} x2={n === 1 ? left + 14 : effX} y2={(n === 1 ? topY + 44 + q * travel : effEnd) + 46} color={ENERGY.work} width={4} /><text x={(n === 1 ? left + 14 : effX) + 8} y={(n === 1 ? topY + 44 + q * travel : effEnd) + 40} fontSize={11} fontWeight={800} fill={ENERGY.work}>effort {f2(r.effort)} N</text></g>
        <text x={8} y={H - 36} fontSize={12} fontWeight={700} fill={PHYS.displacement}>load risen {f2(at.rise)} m</text>
        <text x={8} y={H - 18} fontSize={12} fontWeight={700} fill={PHYS.distance}>rope pulled {f2(at.rope)} m = {n} × {f2(at.rise)} m</text>
        <text x={W - 8} y={H - 8} textAnchor="end" fontSize={10} fill="#94A3B8">schematic: the free end of the rope leaves the top block</text>
      </svg>
      <div className="flex flex-wrap items-center gap-2"><ProgressControl value={p} onChange={setP} label="Pull the rope" testid="pulley-progress" unit="of the lift" /></div>
      <p className="text-xs text-slate-300" data-testid="pulley-now">Load risen {f2(at.rise)} m; rope pulled {f2(at.rope)} m (always {n} × the rise: the rope and the load are linked); work you have done {f2(at.inWork)} J; useful work so far {f2(at.outWork)} J.</p>
      {editable && <PulleyControls setup={setup} change={change} />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="pulley-readout">
        {cellOf('effort', 'effort', `${f2(r.effort)} N`, ENERGY.work)}
        {cellOf('load', 'load m g', `${f2(r.load)} N`, PHYS.vertical)}
        {cellOf('ma', 'mechanical advantage', `${f2(r.actualMA)} (ideal ${n})`)}
        {cellOf('rope', 'rope pulled', `${f2(r.ropePulled)} m`, PHYS.distance)}
        {cellOf('input', 'work you do', `${f2(r.inputWork)} J`, barColors.input)}
        {cellOf('output', 'useful work m g h', `${f2(r.outputWork)} J`, barColors.useful)}
        {cellOf('stored', 'stored in the block', `${f2(r.storedInBlock)} J`, barColors.stored)}
        {cellOf('eff', 'useful ÷ input', `${f2(r.efficiency * 100)} %`)}
      </div>
      <WorkBars bars={bars} title="Work, same scale" alt={`Work bars: you do ${f2(r.inputWork)} J, the useful work is ${f2(r.outputWork)} J and ${f2(r.storedInBlock)} J is stored in the movable block.`} />
      <p className="text-sm rounded-xl border px-3 py-2 text-slate-100" style={{ borderColor: r.outputWork <= r.inputWork + 1e-9 ? PHYS.correct : PHYS.error }} data-testid="pulley-check">{r.outputWork <= r.inputWork + 1e-9 ? '✓ ' : '✗ '}Useful work {f2(r.outputWork)} J {r.storedInBlock < 1e-9 ? '=' : '≤'} work done {f2(r.inputWork)} J: {n === 1 ? 'the fixed pulley changes the direction of the force, not its size, and the rope pulled equals the rise.' : `the effort is ${n === 1 ? '' : `1/${n} of the load`} but acts over ${n} times the distance.`}</p>
      {!alt && <p className="text-xs text-slate-300" data-testid="pulley-description">{text}</p>}
      <p className="text-[11px] text-slate-400">Assumptions: a light rope that does not stretch or slip, frictionless axles, the load and the movable block raised slowly (no change of kinetic energy). The only loss is the weight of the movable block, which is lifted too; no efficiency is assumed. Load {PULLEY_LIMITS.massMin} to {PULLEY_LIMITS.massMax} kg; up to {PULLEY_LIMITS.strandsMax} strands.</p>
    </div>
  );
};

const PulleyControls: React.FC<{ setup: PulleySetup; change: (o: Partial<PulleySetup>) => void }> = ({ setup, change }) => (
  <div className={ctl} data-testid="pulley-controls">
    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the pulley system</h3>
    <div className="flex flex-wrap gap-3 items-center">
      <Field id="mass" label="Load mass" unit="kg" value={setup.massKg} step={5} onChange={(v) => change({ massKg: v })} />
      <Field id="strands" label="Supporting strands" unit="(1 = fixed pulley)" value={setup.strands} step={1} onChange={(v) => change({ strands: v })} />
      <Field id="lift" label="Lift" unit="m" value={setup.lift} step={0.5} onChange={(v) => change({ lift: v })} />
    </div>
    <details className="rounded-lg border border-surface-border px-3 py-1"><summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings (movable block mass, g)</summary><div className="py-2 flex flex-wrap gap-3"><Field id="block" label="Movable block mass" unit="kg" value={setup.blockKg} step={1} onChange={(v) => change({ blockKg: v })} /><Field id="g" label="g" unit="m/s²" value={setup.g} step={1} onChange={(v) => change({ g: v })} /></div></details>
  </div>
);

// ----------------------------------------------------------------------------- lever
export const LeverView: React.FC<{ initial: LeverSetup; editable?: boolean; alt?: string; startProgress?: number }> = ({ initial, editable = false, alt, startProgress = 0 }) => {
  const [setup, setSetup] = useState(initial);
  const [p, setP] = useState(startProgress);
  const r = computeLever(setup);
  const change = (o: Partial<LeverSetup>) => setSetup((s) => ({ ...s, ...o }));
  if (!r.valid) return <div className="space-y-3" data-visual="leverLab">{errBox(r.reason ?? '', 'lever-error')}{editable && <LeverControls setup={setup} change={change} />}</div>;
  const W = 440, H = 262, cx = 220, cy = 120;
  const maxArm = Math.max(setup.loadArm, setup.effortArm);
  const k = 170 / maxArm;
  const lpos = setup.loadArm * k;           // the load is always on the right
  const epos = (setup.kind === 'I' ? -1 : 1) * setup.effortArm * k; // effort on the left (Class I) or the right (II, III)
  const sign = r.state === 'balanced' ? 0 : r.state === 'load rises' ? 1 : -1;
  const shown = r.state === 'balanced' ? p * setup.turnDeg : sign * setup.turnDeg; // degrees, load side up positive
  const a = (-shown * Math.PI) / 180; // screen rotation: load side (right) up means a negative screen angle
  const pt = (x: number) => ({ x: cx + x * Math.cos(a), y: cy + x * Math.sin(a) });
  const barL = pt(-175), barR = pt(175), L = pt(lpos), E = pt(epos);
  const loadPx = Math.max(24, Math.min(60, r.load * 0.3)), effPx = Math.max(24, Math.min(60, Math.max(r.balanceEffort, setup.effort) * 0.3));
  const eDown = setup.kind === 'I';
  const turnRad = (shown * Math.PI) / 180;
  const d1 = Math.abs(setup.effortArm * turnRad), d2 = Math.abs(setup.loadArm * turnRad);
  const text = `Lever, Class ${setup.kind}: a ${f2(setup.loadKg)} kg load (${f2(r.load)} N) at ${f2(setup.loadArm)} m from the fulcrum and an effort of ${f2(setup.effort)} N at ${f2(setup.effortArm)} m (${setup.kind === 'I' ? 'on the other side of the fulcrum' : setup.kind === 'II' ? 'beyond the load' : 'between the fulcrum and the load'}). The turning effects are effort × effort arm = ${f2(r.effortTorque)} N m and load × load arm = ${f2(r.loadTorque)} N m, so the lever ${r.state === 'balanced' ? 'is balanced' : r.state === 'load rises' ? 'turns so that the load rises' : 'turns so that the load falls'}. The balancing effort is ${f2(r.balanceEffort)} N (mechanical advantage L₁ ÷ L₂ = ${f2(r.mechanicalAdvantage)}). For a ${f2(setup.turnDeg)}° turn the effort end moves ${f2(r.effortDistance)} m and the load end ${f2(r.loadDistance)} m: work ${f2(r.effortWork)} J in and ${f2(r.loadWork)} J out.`;
  return (
    <div className="space-y-3 min-w-0" data-visual="leverLab" data-testid="lever-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={text} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="lever-svg">
        <polygon points={`${cx},${cy} ${cx - 16},${cy + 40} ${cx + 16},${cy + 40}`} fill="#334155" stroke={PHYS.axis} strokeWidth={2} data-testid="fulcrum" />
        <text x={cx} y={cy + 56} textAnchor="middle" fontSize={11} fill="#94A3B8">fulcrum</text>
        <line x1={barL.x} y1={barL.y} x2={barR.x} y2={barR.y} stroke="#cbd5e1" strokeWidth={7} strokeLinecap="round" data-testid="bar" />
        <g data-arrow="load"><Arrow x1={L.x} y1={L.y} x2={L.x} y2={L.y + loadPx} color={PHYS.vertical} width={4} /><text x={L.x} y={L.y + loadPx + 14} textAnchor="middle" fontSize={11} fontWeight={700} fill={PHYS.vertical}>load {f2(r.load)} N</text></g>
        <g data-arrow="effort">{eDown ? <><Arrow x1={E.x} y1={E.y} x2={E.x} y2={E.y + effPx} color={ENERGY.work} width={4} /><text x={E.x} y={E.y + effPx + 14} textAnchor="middle" fontSize={11} fontWeight={800} fill={ENERGY.work}>effort {f2(setup.effort)} N</text></> : <><Arrow x1={E.x} y1={E.y} x2={E.x} y2={E.y - effPx} color={ENERGY.work} width={4} /><text x={E.x} y={E.y - effPx - 6} textAnchor="middle" fontSize={11} fontWeight={800} fill={ENERGY.work}>effort {f2(setup.effort)} N</text></>}</g>
        <line x1={cx} y1={cy + 100} x2={cx + lpos} y2={cy + 100} stroke={PHYS.distance} strokeWidth={2} /><text x={cx + lpos / 2} y={cy + 116} textAnchor="middle" fontSize={11} fill={PHYS.distance}>load arm L₂ = {f2(setup.loadArm)} m</text>
        <line x1={cx} y1={cy + 124} x2={cx + epos} y2={cy + 124} stroke={PHYS.displacement} strokeWidth={2} /><text x={cx + epos / 2} y={cy + 140} textAnchor="middle" fontSize={11} fill={PHYS.displacement}>effort arm L₁ = {f2(setup.effortArm)} m</text>
      </svg>
      <div className="flex flex-wrap items-center gap-2"><ProgressControl value={p} onChange={setP} label="Turn the lever (balanced)" testid="lever-progress" unit="of the turn" /></div>
      <p className="text-xs text-slate-300" data-testid="lever-now">{r.state === 'balanced' ? `Turned ${f2(Math.abs(shown))}°: the effort end has moved ${f2(d1)} m and the load end ${f2(d2)} m (arc = arm × angle); work by the effort ${f2(r.balanceEffort * d1)} J, work on the load ${f2(r.load * d2)} J.` : `Not balanced: the lever turns so that the load ${r.state === 'load rises' ? 'rises' : 'falls'}. Set the effort to ${f2(r.balanceEffort)} N to balance it.`}</p>
      {editable && <LeverControls setup={setup} change={change} />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="lever-readout">
        {cellOf('balance', 'effort that balances', `${f2(r.balanceEffort)} N`, ENERGY.work)}
        {cellOf('ma', 'mechanical advantage = load ÷ effort', `${f2(r.mechanicalAdvantage)} (= L₁ ÷ L₂)`)}
        {cellOf('te', 'effort × effort arm', `${f2(r.effortTorque)} N m`, ENERGY.work)}
        {cellOf('tl', 'load × load arm', `${f2(r.loadTorque)} N m`, PHYS.vertical)}
        {cellOf('state', 'the lever', r.state)}
        {cellOf('d1', `effort end moves (${f2(setup.turnDeg)}° turn)`, `${f2(r.effortDistance)} m`, PHYS.displacement)}
        {cellOf('d2', 'load end moves', `${f2(r.loadDistance)} m`, PHYS.distance)}
        {cellOf('work', 'work in = work out', `${f2(r.effortWork)} J = ${f2(r.loadWork)} J`)}
      </div>
      <p className="text-sm rounded-xl border px-3 py-2 text-slate-100" style={{ borderColor: PHYS.correct }} data-testid="lever-check">{'✓ '}F₁ × L₁ = {f2(r.balanceEffort)} × {f2(setup.effortArm)} = {f2(r.balanceEffort * setup.effortArm)} N m = F₂ × L₂ = {f2(r.load)} × {f2(setup.loadArm)} = {f2(r.loadTorque)} N m. The effort end moves {f2(r.effortDistance / Math.max(r.loadDistance, 1e-12))} times as far as the load end: a smaller force over a longer distance, the same work. A lever does not create energy.</p>
      {!alt && <p className="text-xs text-slate-300" data-testid="lever-description">{text}</p>}
      <p className="text-[11px] text-slate-400">Assumptions: a rigid, light bar turning slowly about a frictionless fulcrum through a small angle (up to {LEVER_LIMITS.turnMax}°); the weights act downwards; the effort acts in the direction that raises the load. The turning effect (force × arm, N m) is used only to decide the balance and is marked as enrichment beyond the textbook's F₁ × L₁ = F₂ × L₂.</p>
    </div>
  );
};

const LeverControls: React.FC<{ setup: LeverSetup; change: (o: Partial<LeverSetup>) => void }> = ({ setup, change }) => (
  <div className={ctl} data-testid="lever-controls">
    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the lever</h3>
    <div className="flex flex-wrap gap-3 items-center">
      <Field id="load" label="Load" unit="kg" value={setup.loadKg} step={5} onChange={(v) => change({ loadKg: v })} />
      <Field id="loadArm" label="Load arm L₂" unit="m" value={setup.loadArm} step={0.1} onChange={(v) => change({ loadArm: Math.round(v * 100) / 100 })} />
      <Field id="effortArm" label="Effort arm L₁" unit="m" value={setup.effortArm} step={0.1} onChange={(v) => change({ effortArm: Math.round(v * 100) / 100 })} />
      <Field id="effort" label="Effort" unit="N" value={setup.effort} step={5} onChange={(v) => change({ effort: v })} />
    </div>
    <div role="group" aria-label="Class of lever" className="flex flex-wrap gap-2">
      {([['I', 'Class I: fulcrum between'], ['II', 'Class II: load between'], ['III', 'Class III: effort between']] as const).map(([k, label]) => <button key={k} type="button" aria-pressed={setup.kind === k} data-kind={k} onClick={() => change({ kind: k })} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: setup.kind === k ? PHYS.force : '#334155' }}>{setup.kind === k ? '✓ ' : ''}{label}</button>)}
    </div>
    <details className="rounded-lg border border-surface-border px-3 py-1"><summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings (turn angle, g)</summary><div className="py-2 flex flex-wrap gap-3"><Field id="turn" label="Turn" unit="degrees" value={setup.turnDeg} step={1} onChange={(v) => change({ turnDeg: v })} /><Field id="g" label="g" unit="m/s²" value={setup.g} step={1} onChange={(v) => change({ g: v })} /></div></details>
  </div>
);

export const RampVisual: React.FC<VisualProps> = ({ props, alt }) => { const p = props as { setup: RampSetup; editable?: boolean; progress?: number }; return <RampView initial={p.setup} editable={p.editable ?? false} alt={alt} startProgress={p.progress ?? 0} />; };
export const PulleyVisual: React.FC<VisualProps> = ({ props, alt }) => { const p = props as { setup: PulleySetup; editable?: boolean; progress?: number }; return <PulleyView initial={p.setup} editable={p.editable ?? false} alt={alt} startProgress={p.progress ?? 0} />; };
export const LeverVisual: React.FC<VisualProps> = ({ props, alt }) => { const p = props as { setup: LeverSetup; editable?: boolean; progress?: number }; return <LeverView initial={p.setup} editable={p.editable ?? false} alt={alt} startProgress={p.progress ?? 0} />; };
