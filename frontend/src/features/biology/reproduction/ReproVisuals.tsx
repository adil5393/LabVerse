/**
 * Figures and laboratory investigations for Chapter 11 (Reproduction): the bead model of meiosis, the parts of a flower, the
 * pea pollination experiment, pollination strategies (Table 11.3) and a cycle calendar, plus the shared virtual microscope.
 * Every number comes from `engine/biology/reproduction/model.ts`; every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  FLOWER_PARTS, HUMAN_PAIRS, PEA_TREATMENTS, POLLEN_STRATEGIES, TYPICAL_CYCLE_RANGE, addDays, allCombinations, cyclePhase, drawGamete, forecastCycle,
  gameteCombinations, peaPollinated, utcDate, type FlowerPartId,
} from '../../../engine/biology/reproduction/model';
import { MicroscopeVisual } from '../shared/Microscope';

// ---------- Bead model (Activity 11.4) ----------

const BEADS = [
  { name: 'green', light: '#86efac', dark: '#15803d' }, { name: 'blue', light: '#93c5fd', dark: '#1d4ed8' }, { name: 'red', light: '#fca5a5', dark: '#b91c1c' },
  { name: 'purple', light: '#d8b4fe', dark: '#7e22ce' }, { name: 'orange', light: '#fdba74', dark: '#c2410c' }, { name: 'teal', light: '#5eead4', dark: '#0f766e' },
];

function lcg(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

export const BeadCombosVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { pairs?: number; editable?: boolean };
  const [pairs, setPairs] = useState(q.pairs ?? 3);
  const [draws, setDraws] = useState<string[][]>([]);
  const beadPairs = BEADS.slice(0, pairs).map((b) => ({ light: `light ${b.name}`, dark: `dark ${b.name}` }));
  const total = gameteCombinations(pairs);
  const distinct = new Set(draws.map((d) => d.join())).size;
  const colourOf = (label: string) => { const b = BEADS.find((x) => label.endsWith(x.name))!; return label.startsWith('light') ? b.light : b.dark; };
  const draw = () => { const rand = lcg(draws.length * 7919 + pairs * 104729 + 17); setDraws((d) => [drawGamete(beadPairs, rand), ...d].slice(0, 40)); };
  const all = pairs <= 3 ? allCombinations(beadPairs) : [];
  return (
    <div className="space-y-3 p-3" data-testid="bead-combos" data-pairs={pairs} data-combinations={total} data-drawn={draws.length} data-distinct={distinct} aria-label={alt}>
      <div className={labCard}>
        <div className="flex flex-wrap gap-3" aria-hidden>{BEADS.slice(0, pairs).map((b) => <span key={b.name} className="flex gap-1"><span className="inline-block w-5 h-5 rounded-full" style={{ background: b.light }} /><span className="inline-block w-5 h-5 rounded-full" style={{ background: b.dark }} /></span>)}</div>
        <p className="text-sm text-white" data-testid="bead-total">{pairs} pair{pairs === 1 ? '' : 's'}: <strong>{total.toLocaleString('en-IN')} possible gametes</strong> ({Array(pairs).fill('2').join(' × ')}). With the {HUMAN_PAIRS} human pairs: {gameteCombinations(HUMAN_PAIRS).toLocaleString('en-IN')}.</p>
        {draws.length > 0 && (
          <div className="space-y-1" data-testid="bead-draws">
            <p className="text-sm text-slate-200">Latest gamete: {draws[0].join(', ')}.</p>
            <div className="flex flex-wrap gap-2">{draws.slice(0, 12).map((d, i) => <span key={i} className="flex gap-0.5 rounded-lg border border-surface-border p-1" aria-label={d.join(', ')}>{d.map((b, k) => <span key={k} className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: colourOf(b) }} />)}</span>)}</div>
            <p className="text-xs text-slate-400">{draws.length} drawn, {distinct} different so far, out of {total} possible.</p>
          </div>
        )}
        {all.length > 0 && <details className="text-sm text-slate-200"><summary className="min-h-[48px] flex items-center cursor-pointer">List every combination</summary><ol className="list-decimal pl-5" data-testid="bead-all">{all.map((c, i) => <li key={i}>{c.join(', ')}</li>)}</ol></details>}
        <p className="text-xs text-slate-400">Each pair of beads stands for one pair of chromosomes; a gamete gets one bead from every pair, chosen at random.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabSlider id="bead-pairs" label="Chromosome pairs" value={pairs} min={1} max={6} step={1} unit="" onChange={(v) => { setPairs(v); setDraws([]); }} />
          <button type="button" data-action="draw" onClick={draw} className="min-h-[48px] px-4 rounded-xl border border-teal-400 bg-teal-500/20 text-sm text-white">Draw a gamete</button>
        </div>
      )}
    </div>
  );
};

// ---------- Flower parts ----------

export const FlowerPartsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { part?: FlowerPartId; editable?: boolean };
  const [part, setPart] = useState<FlowerPartId>(q.part ?? 'anther');
  const p = FLOWER_PARTS[part];
  const hl = (id: FlowerPartId, base: string) => (id === part ? '#facc15' : base);
  return (
    <div className="space-y-3 p-3" data-testid="flower-parts" data-part={part} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 200" className="w-full max-w-[280px] mx-auto block" aria-hidden>
          <rect x="96" y="150" width="8" height="45" fill="#16a34a" />
          <path d="M100 150 C 60 150 45 130 40 115 C 60 120 80 135 100 140 C 120 135 140 120 160 115 C 155 130 140 150 100 150 Z" fill={hl('sepal', '#22c55e')} />
          <path d="M100 140 C 50 120 30 70 45 40 C 70 70 85 100 100 125 C 115 100 130 70 155 40 C 170 70 150 120 100 140 Z" fill={hl('petal', '#f9a8d4')} opacity="0.85" />
          <ellipse cx="100" cy="125" rx="16" ry="14" fill={hl('ovary', '#a3e635')} />
          {[[94, 122], [106, 122], [100, 130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={hl('ovule', '#fef9c3')} />)}
          <rect x="97" y="70" width="6" height="45" fill={hl('style', '#84cc16')} />
          <ellipse cx="100" cy="66" rx="10" ry="5" fill={hl('stigma', '#65a30d')} />
          {[-1, 1].map((s) => <g key={s}><line x1="100" y1="118" x2={100 + s * 32} y2="72" stroke={hl('filament', '#fde68a')} strokeWidth="2.5" /><ellipse cx={100 + s * 32} cy="68" rx="6" ry="9" fill={hl('anther', '#f59e0b')} /></g>)}
        </svg>
        <p className="text-base font-bold text-white" data-testid="flower-part-name">{p.name} <span className="text-sm font-normal text-slate-300">({p.whorl})</span></p>
        <p className="text-sm text-slate-200">{p.job}</p>
        <p className="text-xs text-slate-400">A longitudinal section of a simple complete flower; real flowers vary, and some have fused sepals or petals.</p>
      </div>
      {q.editable && <div className={labCard}><LabChoice name="flower-part" label="Part" value={part} options={(Object.keys(FLOWER_PARTS) as FlowerPartId[]).map((k) => ({ id: k, label: FLOWER_PARTS[k].name }))} onChange={(v) => setPart(v as FlowerPartId)} /></div>}
    </div>
  );
};

// ---------- Pea pollination experiment (Activity 11.6) ----------

export const PollinationTestVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { editable?: boolean; run?: boolean };
  const [run, setRun] = useState(Boolean(q.run));
  const results = PEA_TREATMENTS.map((t) => ({ t, r: peaPollinated(t) }));
  const fruits = results.filter((x) => x.r.pollinated).length;
  return (
    <div className="space-y-3 p-3" data-testid="pollination-test" data-run={run ? 'true' : 'false'} data-fruits={run ? fruits : ''} aria-label={alt}>
      <ul className="space-y-2">
        {results.map(({ t, r }) => (
          <li key={t.id} className={labCard} data-treatment={t.id} data-fruit={run ? (r.pollinated ? 'yes' : 'no') : ''}>
            <p className="text-sm font-bold text-white">{t.label}</p>
            <p className="text-xs text-slate-300">{t.stage === 'bud' ? 'Closed bud' : 'Freshly opened flower'} · stamens {t.stamensRemoved ? 'removed' : 'left in'} · {t.bagged ? 'muslin bag' : 'no bag'}</p>
            {run ? <p className="text-sm text-slate-200"><strong className={r.pollinated ? 'text-emerald-300' : 'text-rose-300'}>{r.pollinated ? 'Pod formed' : 'No pod'}</strong>: {r.why}</p> : <p className="text-sm text-slate-400">Prediction: will it form a pod?</p>}
          </li>
        ))}
      </ul>
      {run && <p className="text-sm text-white" data-testid="pollination-summary">{fruits} of {results.length} treatments formed pods. Only the bud whose stamens were removed and which was bagged received no pollen, so pollination is needed for fruit to form.</p>}
      {(q.editable || !run) && <button type="button" data-action="run" onClick={() => setRun((x) => !x)} className="min-h-[48px] px-4 rounded-xl border border-teal-400 bg-teal-500/20 text-sm text-white">{run ? 'Reset the experiment' : 'Wait two weeks and look'}</button>}
    </div>
  );
};

// ---------- Pollination strategies (Table 11.3) ----------

type StrategyId = keyof typeof POLLEN_STRATEGIES;

export const PollinationStrategyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { editable?: boolean };
  const [id, setId] = useState<StrategyId>('wind');
  const s = POLLEN_STRATEGIES[id];
  const [pollen, setPollen] = useState(750000);
  const [seeds, setSeeds] = useState(125);
  const pick = (next: StrategyId) => { const n = POLLEN_STRATEGIES[next]; setId(next); setPollen((n.pollen[0] + n.pollen[1]) / 2); setSeeds((n.seeds[0] + n.seeds[1]) / 2); };
  const ratio = pollen / seeds;
  const other: StrategyId = id === 'wind' ? 'insect' : 'wind';
  const o = POLLEN_STRATEGIES[other];
  const oRatio = ((o.pollen[0] + o.pollen[1]) / 2) / ((o.seeds[0] + o.seeds[1]) / 2);
  return (
    <div className="space-y-3 p-3" data-testid="pollination-strategy" data-strategy={id} data-ratio={Math.round(ratio)} aria-label={alt}>
      <div className={labCard}>
        <table className="w-full text-sm text-slate-200"><thead><tr><th className="text-left font-normal text-slate-400">Strategy</th><th className="font-normal text-slate-400">Pollen per flower</th><th className="font-normal text-slate-400">Seeds</th></tr></thead>
          <tbody>{(Object.keys(POLLEN_STRATEGIES) as StrategyId[]).map((k) => { const x = POLLEN_STRATEGIES[k]; return <tr key={k} className={k === id ? 'text-white font-bold' : ''}><td>{x.label}</td><td className="text-center">{x.pollen[0].toLocaleString('en-IN')} to {x.pollen[1].toLocaleString('en-IN')}</td><td className="text-center">{x.seeds[0]} to {x.seeds[1]}</td></tr>; })}</tbody></table>
        <p className="text-sm text-white" data-testid="strategy-result">{s.label}: {pollen.toLocaleString('en-IN')} grains ÷ {seeds} seeds ≈ <strong>{fmtNum(ratio, 0)} pollen grains per seed</strong>, against about {fmtNum(oRatio, 0)} for {other === 'wind' ? 'wind' : 'insect'} pollination.</p>
        <p className="text-xs text-slate-400">Approximate values from Table 11.3. Wind wastes most pollen, so plants that rely on it make enormous amounts.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="strategy" label="Strategy" value={id} options={[{ id: 'wind', label: 'Wind' }, { id: 'insect', label: 'Insect' }]} onChange={(v) => pick(v as StrategyId)} />
          <LabSlider id="strat-pollen" label="Pollen grains released" value={pollen} min={s.pollen[0]} max={s.pollen[1]} step={(s.pollen[1] - s.pollen[0]) / 20} unit="" onChange={setPollen} />
          <LabSlider id="strat-seeds" label="Seeds formed" value={seeds} min={s.seeds[0]} max={s.seeds[1]} step={10} unit="" onChange={setSeeds} />
        </div>
      )}
    </div>
  );
};

// ---------- Cycle calendar ----------

const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const iso = (d: Date) => d.toISOString().slice(0, 10);

export const CycleCalendarVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { cycleLength?: number; start?: string; editable?: boolean };
  const [start, setStart] = useState(q.start ?? '2026-03-05');
  const [length, setLength] = useState(q.cycleLength ?? 28);
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(start);
  const startDate = parsed ? utcDate(Number(parsed[1]), Number(parsed[2]), Number(parsed[3])) : utcDate(2026, 3, 5);
  const f = forecastCycle(startDate, length);
  const ovuDay = length - 14;
  return (
    <div className="space-y-3 p-3" data-testid="cycle-calendar" data-next={iso(f.nextPeriod)} data-ovulation={iso(f.ovulation)} data-length={length} aria-label={alt}>
      <div className={labCard}>
        <div className="grid grid-cols-7 gap-1" aria-hidden>
          {Array.from({ length }, (_, i) => {
            const day = i + 1;
            const phase = length === 28 ? cyclePhase(day) : day <= 5 ? 'menstruation' : day < ovuDay ? 'lining rebuilds' : day === ovuDay ? 'ovulation' : 'lining thickens';
            const bg = phase === 'menstruation' ? 'bg-rose-500/60' : phase === 'ovulation' ? 'bg-amber-400/80' : phase === 'lining rebuilds' ? 'bg-sky-500/30' : 'bg-violet-500/30';
            return <span key={day} className={`rounded text-center text-xs text-white py-1 ${bg}`}>{day}</span>;
          })}
        </div>
        <p className="text-sm text-white" data-testid="cycle-result">Period starting {fmtDate(startDate)}, {length}-day cycle: next period expected about <strong>{fmtDate(f.nextPeriod)}</strong>; ovulation most likely around <strong>{fmtDate(f.ovulation)}</strong> (cycle day {ovuDay}).</p>
        <p className="text-xs text-slate-400">Red: menstruation (about days 1 to 5). Blue: lining rebuilds. Yellow: likely ovulation. Purple: lining thickens. Cycles of {TYPICAL_CYCLE_RANGE[0]} to {TYPICAL_CYCLE_RANGE[1]} days are normal, and timing varies, so these are estimates only, not a method of contraception.</p>
        <p className="text-xs text-slate-400">Day {length + 1} = {fmtDate(addDays(startDate, length))} is day 1 of the next cycle.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <label htmlFor="cycle-start" className="block text-sm text-slate-200">First day of the last period
            <input id="cycle-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface" />
          </label>
          <LabSlider id="cycle-length" label="Cycle length" value={length} min={TYPICAL_CYCLE_RANGE[0]} max={TYPICAL_CYCLE_RANGE[1]} step={1} unit="days" onChange={setLength} />
        </div>
      )}
    </div>
  );
};

export const REPRO_VISUALS: VisualRegistry = { microscope: MicroscopeVisual, beadCombos: BeadCombosVisual, flowerParts: FlowerPartsVisual, pollinationTest: PollinationTestVisual, pollinationStrategy: PollinationStrategyVisual, cycleCalendar: CycleCalendarVisual };
