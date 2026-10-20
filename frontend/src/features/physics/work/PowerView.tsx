/**
 * The Power Laboratory scene (PHY-3D): choose the work (directly, by lifting a load, or by speeding a car up) and the time taken,
 * and read the average power P = W / t in watts, kilowatts and horsepower, with a work-time graph whose slope is the power and the
 * same work done in half and in twice the time. Everything comes from `computePower`.
 */

import React, { useState } from 'react';
import { computePower, describePower, POWER_LIMITS, type PowerScenario, type PowerSetup } from '../../../engine/physics/work/power';
import { ENERGY, PHYS } from '../motion/physicsColors';
import type { VisualProps } from '../../education/visuals';
import { EnergyPlot } from './EnergyPlot';
import { Field } from './Field';
import { cellOf, f2 } from './MachineUtil';

/**
 * `setup` / `onSetupChange` let a lab own the setup (so its Inspector edits it); `part` splits the view into the work-time graph
 * ('scene', for the viewport) and the numbers ('readout', for the dock). Without them the view is self-contained (Learn visuals).
 */
export interface PowerViewControl {
  setup?: PowerSetup;
  onSetupChange?: (patch: Partial<PowerSetup>) => void;
  part?: 'all' | 'scene' | 'readout';
}

export const PowerView: React.FC<{ initial: PowerSetup; editable?: boolean; alt?: string } & PowerViewControl> = ({ initial, editable = false, alt, setup: controlled, onSetupChange, part = 'all' }) => {
  const [state, setState] = useState(initial);
  const setup = controlled ?? state;
  const r = computePower(setup);
  const change = (o: Partial<PowerSetup>) => { if (onSetupChange) onSetupChange(o); else setState((s) => ({ ...s, ...o })); };
  const showScene = part !== 'readout', showReadout = part !== 'scene';
  const btn = 'min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100';
  const t = setup.timeS;
  const line = (time: number) => [[0, 0], [2 * t, (r.work / time) * 2 * t]] as [number, number][];
  const ymax = r.valid ? Math.max(1, r.work * 4.2) : 1;
  return (
    <div className="space-y-3 min-w-0" data-visual="powerLab" data-testid="power-view">
      {editable && part === 'all' && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="power-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the situation</h3>
          <div role="group" aria-label="What does the work" className="flex flex-wrap gap-2">
            {([['lift', 'Lift a load'], ['accelerate', 'Speed up from rest'], ['work', 'Enter the work']] as [PowerScenario, string][]).map(([k, label]) => <button key={k} type="button" aria-pressed={setup.scenario === k} data-scenario={k} onClick={() => change({ scenario: k })} className={btn} style={{ borderColor: setup.scenario === k ? PHYS.force : '#334155' }}>{setup.scenario === k ? '✓ ' : ''}{label}</button>)}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {setup.scenario === 'work' && <Field id="work" label="Work" unit="J" value={setup.workJ} step={100} onChange={(v) => change({ workJ: v })} />}
            {setup.scenario !== 'work' && <Field id="mass" label="Mass" unit="kg" value={setup.massKg} step={10} onChange={(v) => change({ massKg: v })} />}
            {setup.scenario === 'lift' && <Field id="height" label="Height" unit="m" value={setup.height} step={1} onChange={(v) => change({ height: v })} />}
            {setup.scenario === 'accelerate' && <Field id="speed" label="Final speed" unit="m/s" value={setup.speed} step={5} onChange={(v) => change({ speed: v })} />}
            <Field id="time" label="Time" unit="s" value={setup.timeS} step={1} onChange={(v) => change({ timeS: v })} />
          </div>
          <p className="text-[11px] text-slate-400">Work 0 to {POWER_LIMITS.workMax} J; mass {POWER_LIMITS.massMin} to {POWER_LIMITS.massMax} kg; time {POWER_LIMITS.timeMin} to {POWER_LIMITS.timeMax} s. g = 10 m/s². Average power only: the work is assumed to be done at a steady rate.</p>
        </div>
      )}
      {!r.valid ? (showScene ? <p role="alert" className="text-sm rounded-xl border px-3 py-3" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }} data-testid="power-error">This setup cannot run: {r.reason}</p> : null) : (
        <>
          {showReadout && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="power-readout">
            {cellOf('work', 'work W', `${f2(r.work)} J`, ENERGY.work)}
            {cellOf('time', 'time t', `${f2(t)} s`, PHYS.time)}
            {cellOf('power', 'power P = W ÷ t', `${f2(r.power)} W`, ENERGY.total)}
            {cellOf('kw', 'in kilowatts', `${f2(r.kilowatts)} kW`)}
            {cellOf('hp', 'in horsepower (746 W)', `${f2(r.horsepower)} hp`)}
            {cellOf('half', 'same work in half the time', `${f2(r.powerHalfTime)} W`, PHYS.acceleration)}
            {cellOf('double', 'same work in twice the time', `${f2(r.powerDoubleTime)} W`, PHYS.speed)}
            {cellOf('persec', 'work done each second', `${f2(r.workPerSecond)} J`)}
          </div>}
          {showScene && <EnergyPlot id="power-graph" title="Work done against time" xName="time t" xUnit="s" yName="work W" yUnit="J" xr={[0, 2 * t]} yr={[0, ymax]}
            lines={[{ id: 'p', name: `this power ${f2(r.power)} W`, color: ENERGY.total, pts: line(t) }, { id: 'h', name: `double the power ${f2(r.powerHalfTime)} W`, color: PHYS.acceleration, pts: line(t / 2), dash: '6 4' }, { id: 'd', name: `half the power ${f2(r.powerDoubleTime)} W`, color: PHYS.speed, pts: line(2 * t), dash: '3 3' }]}
            points={[{ x: t, y: r.work, label: `${f2(r.work)} J in ${f2(t)} s`, color: '#e2e8f0' }]}
            caption={`The slope of each line is the power: a steeper line does the same work in less time. At ${f2(t)} s this power has done ${f2(r.work)} J.`}
            alt={`Work against time. The slope is the power: ${f2(r.power)} W. The same work ${f2(r.work)} J in half the time needs ${f2(r.powerHalfTime)} W and in twice the time ${f2(r.powerDoubleTime)} W.`} />}
          {showReadout && !alt && <p className="text-xs text-slate-300" data-testid="power-description">{describePower(r)}</p>}
          {showReadout && <p className="text-[11px] text-slate-400">Work is the energy transferred, in joules; power is how fast, in watts (1 W = 1 J/s). Lifting uses W = m g h; speeding up from rest uses W = ½ m v² (the work-energy theorem). A model of the average power, not of how the power varies during the motion.</p>}
        </>
      )}
    </div>
  );
};

export const PowerVisual: React.FC<VisualProps> = ({ props, alt }) => { const p = props as { setup: PowerSetup; editable?: boolean }; return <PowerView initial={p.setup} editable={p.editable ?? false} alt={alt} />; };
