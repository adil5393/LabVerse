/**
 * Figures and laboratory investigations for Chapter 11 (Reproduction): the bead model of meiosis, the parts of a flower, the
 * pea pollination experiment, pollination strategies (Table 11.3) and a cycle calendar, plus the shared virtual microscope.
 * Every number comes from `engine/biology/reproduction/model.ts`; every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum } from '../../education/SubjectLabShell';
import { LabButton, LabKey, LabStage, LabSteps } from '../../education/LabLayout';
import {
  FLOWER_PARTS, HUMAN_PAIRS, PEA_TREATMENTS, POLLEN_STRATEGIES, TYPICAL_CYCLE_RANGE, addDays, allCombinations, cyclePhase, drawGamete, forecastCycle,
  gameteCombinations, peaPollinated, utcDate, type FlowerPartId, type PeaTreatment,
} from '../../../engine/biology/reproduction/model';
import { Model3D, ViewModeSwitch, useViewMode } from '../three/ViewMode';
import { MicroscopeVisual } from '../shared/Microscope';
import { REPRO_DIAGRAMS } from './ReproDiagrams';

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
  const latest = draws[0];
  const scene = (
    <svg viewBox="0 0 320 170" role="img" aria-label={`${pairs} bead pairs. ${latest ? `Latest gamete: ${latest.join(', ')}.` : 'No gamete drawn yet.'}`}>
      <text x="8" y="18" fontSize="13" fill="#e2e8f0">Parent cell: {pairs} pair{pairs === 1 ? '' : 's'}</text>
      <rect x="6" y="26" width="140" height="130" rx="16" fill="#1e293b" stroke="#94a3b8" />
      {BEADS.slice(0, pairs).map((b, i) => <g key={b.name}><circle cx={44} cy={46 + i * 20} r="8" fill={b.light} /><circle cx={70} cy={46 + i * 20} r="8" fill={b.dark} /><text x={86} y={50 + i * 20} fontSize="11" fill="#94a3b8">{b.name}</text></g>)}
      <path d="M 152 90 L 176 90" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#bead-head)" />
      <defs><marker id="bead-head" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" /></marker></defs>
      <text x="184" y="18" fontSize="13" fill="#e2e8f0">Gamete: one from each pair</text>
      <circle cx="248" cy="90" r="62" fill="#1e293b" stroke="#94a3b8" />
      {latest ? latest.map((bead, i) => <circle key={i} cx={248} cy={90 - ((latest.length - 1) * 18) / 2 + i * 18} r="8" fill={colourOf(bead)} />) : <text x="248" y="94" fontSize="12" textAnchor="middle" fill="#94a3b8">draw one</text>}
    </svg>
  );
  return (
    <LabStage testId="bead-combos" alt={alt} data={{ 'data-pairs': pairs, 'data-combinations': total, 'data-drawn': draws.length, 'data-distinct': distinct }}
      question="How many different gametes can one parent make?"
      sceneNote="Model: each bead pair stands for one chromosome pair"
      scene={scene}
      actions={q.editable ? <LabButton primary icon="casino" data-action="draw" onClick={draw}>Draw a gamete</LabButton> : undefined}
      controls={q.editable ? <LabSlider id="bead-pairs" label="Chromosome pairs" value={pairs} min={1} max={6} step={1} unit="" onChange={(v) => { setPairs(v); setDraws([]); }} /> : undefined}
      observation={<>
        <p className="m-0" data-testid="bead-total">{pairs} pair{pairs === 1 ? '' : 's'}: <strong>{total.toLocaleString('en-IN')} possible gametes</strong> ({Array(pairs).fill('2').join(' × ')}). With the {HUMAN_PAIRS} human pairs: {gameteCombinations(HUMAN_PAIRS).toLocaleString('en-IN')}.</p>
        {draws.length > 0 && <div className="space-y-1" data-testid="bead-draws">
          <p className="m-0">Latest gamete: {draws[0].join(', ')}.</p>
          <div className="flex flex-wrap gap-2">{draws.slice(0, 12).map((d, i) => <span key={i} className="flex gap-0.5 rounded-lg border border-surface-border p-1" aria-label={d.join(', ')}>{d.map((b, k) => <span key={k} className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: colourOf(b) }} />)}</span>)}</div>
          <p className="m-0 text-slate-400">{draws.length} drawn, {distinct} different so far, out of {total} possible.</p>
        </div>}
      </>}
      explanation={<p className="m-0">A gamete gets one chromosome from every pair, chosen at random. Each pair doubles the number of possible mixes, so n pairs give 2ⁿ different gametes. That is one reason children of the same parents differ.</p>}
      extra={all.length > 0 ? <ol className="m-0 pl-5 list-decimal" data-testid="bead-all">{all.map((c, i) => <li key={i}>{c.join(', ')}</li>)}</ol> : undefined}
      extraTitle="List every combination"
      finding={draws.length ? { label: `${pairs} pairs, ${draws.length} draws`, value: `${distinct} different of ${total} possible` } : null}
    />
  );
};

// ---------- Flower parts ----------

const FLOWER_SPOTS: Record<FlowerPartId, [number, number]> = {
  sepal: [58, 142], petal: [50, 60], anther: [132, 66], filament: [79, 88], stigma: [100, 56], style: [102, 104], ovary: [122, 136], ovule: [92, 128],
};

export const FlowerPartsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { part?: FlowerPartId; editable?: boolean };
  const [part, setPart] = useState<FlowerPartId>(q.part ?? 'anther');
  const p = FLOWER_PARTS[part];
  const hl = (id: FlowerPartId, base: string) => (id === part ? '#facc15' : base);
  const ids = Object.keys(FLOWER_PARTS) as FlowerPartId[];
  const scene = (
    <svg viewBox="-4 -4 208 208" role="group" aria-label="Section of a flower with numbered parts">
      <rect x="96" y="150" width="8" height="45" fill="#16a34a" />
      <path d="M100 150 C 60 150 45 130 40 115 C 60 120 80 135 100 140 C 120 135 140 120 160 115 C 155 130 140 150 100 150 Z" fill={hl('sepal', '#22c55e')} />
      <path d="M100 140 C 50 120 30 70 45 40 C 70 70 85 100 100 125 C 115 100 130 70 155 40 C 170 70 150 120 100 140 Z" fill={hl('petal', '#f9a8d4')} opacity="0.85" />
      <ellipse cx="100" cy="125" rx="16" ry="14" fill={hl('ovary', '#a3e635')} />
      {[[94, 122], [106, 122], [100, 130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={hl('ovule', '#fef9c3')} />)}
      <rect x="97" y="70" width="6" height="45" fill={hl('style', '#84cc16')} />
      <ellipse cx="100" cy="66" rx="10" ry="5" fill={hl('stigma', '#65a30d')} />
      {[-1, 1].map((s) => <g key={s}><line x1="100" y1="118" x2={100 + s * 32} y2="72" stroke={hl('filament', '#fde68a')} strokeWidth="2.5" /><ellipse cx={100 + s * 32} cy="68" rx="6" ry="9" fill={hl('anther', '#f59e0b')} /></g>)}
      {ids.map((id, i) => {
        const [x, y] = FLOWER_SPOTS[id];
        const on = id === part;
        const pick = () => q.editable && setPart(id);
        return (
          <g key={id} role={q.editable ? 'button' : undefined} tabIndex={q.editable ? 0 : undefined} aria-label={q.editable ? `${i + 1}. ${FLOWER_PARTS[id].name}` : undefined} aria-pressed={q.editable ? on : undefined} data-hotspot={id}
            onClick={pick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }} className={q.editable ? 'lab-hotspot' : undefined}>
            <circle cx={x} cy={y} r="17" fill="transparent" />
            <circle cx={x} cy={y} r="7.5" fill={on ? '#facc15' : '#0f172a'} stroke={on ? '#fff' : '#facc15'} strokeWidth="1.5" />
            <text x={x} y={y + 3.5} fontSize="10" textAnchor="middle" fill={on ? '#0f172a' : '#fff'} fontWeight="700">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
  const [view, setView] = useViewMode();
  const in3D = view === '3d';
  return (
    <LabStage testId="flower-parts" alt={alt} data={{ 'data-part': part, 'data-view': view }}
      question="What does each part of a flower do in reproduction?"
      sceneNote={in3D ? 'Schematic 3D model of a generalised complete flower' : 'Schematic section of a complete flower · tap a number'}
      scene={<>
        <ViewModeSwitch mode={view} onChange={setView} what="flower" />
        {in3D
          ? <Model3D spec={{ kind: 'flower' }} title="3D model of a complete flower" parts={ids.map((k) => ({ id: k, name: FLOWER_PARTS[k].name }))} selected={part} onSelect={(id) => setPart(id as FlowerPartId)} onBack={() => setView('2d')} />
          : scene}
      </>}
      controls={q.editable ? <LabChoice name="flower-part" label="Part (same numbers as the diagram)" value={part} options={ids.map((k, i) => ({ id: k, label: `${i + 1}. ${FLOWER_PARTS[k].name}` }))} onChange={(v) => setPart(v as FlowerPartId)} /> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="flower-part-name">{p.name} <span className="text-sm font-normal text-slate-300">({p.whorl})</span></p>
        <p className="m-0">{p.job}</p>
      </>}
      explanation={<p className="m-0">Stamens (anther and filament) are the male parts; the pistil (stigma, style, ovary with ovules) is the female part. Real flowers vary, and some have fused sepals or petals.</p>}
      finding={{ label: p.name, value: p.job }}
    />
  );
};

// ---------- Pea pollination experiment (Activity 11.6) ----------

const TIMELINE = ['Set up', 'One week later', 'Two weeks later'];

/** A small drawing of one treatment at one point in the timeline. */
const PeaFlower: React.FC<{ t: PeaTreatment; stage: number; pod: boolean }> = ({ t, stage, pod }) => (
  <svg viewBox="0 0 80 80" className="w-16 h-16 shrink-0" aria-hidden>
    <line x1="40" y1="78" x2="40" y2="50" stroke="#16a34a" strokeWidth="3" />
    {stage === 2
      ? pod ? <g><path d="M 22 46 Q 40 30 60 40 Q 44 58 22 46 Z" fill="#4ade80" stroke="#15803d" />{[30, 40, 50].map((x) => <circle key={x} cx={x} cy={44 - (x - 30) / 5} r="3.2" fill="#bbf7d0" />)}</g>
        : <g><path d="M 40 50 L 36 40 M 40 50 L 45 41" stroke="#a16207" strokeWidth="2" /><text x="40" y="34" fontSize="9" textAnchor="middle" fill="#fca5a5">withered</text></g>
      : t.stage === 'bud' && stage === 0
        ? <path d="M 40 50 C 30 44 32 26 40 20 C 48 26 50 44 40 50 Z" fill="#f9a8d4" stroke="#be185d" />
        : <g opacity={stage === 1 ? 0.5 : 1}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={40 + 11 * Math.cos((a * Math.PI) / 180)} cy={36 + 11 * Math.sin((a * Math.PI) / 180)} rx="9" ry="6" fill="#f9a8d4" transform={`rotate(${a} ${40 + 11 * Math.cos((a * Math.PI) / 180)} ${36 + 11 * Math.sin((a * Math.PI) / 180)})`} />)}<circle cx="40" cy="36" r="4" fill="#65a30d" />{!t.stamensRemoved && [0, 120, 240].map((a) => <circle key={a} cx={40 + 6 * Math.cos((a * Math.PI) / 180)} cy={36 + 6 * Math.sin((a * Math.PI) / 180)} r="2" fill="#f59e0b" />)}</g>}
    {t.stamensRemoved && stage < 2 && <text x="62" y="70" fontSize="16" fill="#f8fafc">✂</text>}
    {t.bagged && <rect x="14" y="12" width="52" height="46" rx="14" fill="#f8fafc" fillOpacity="0.12" stroke="#f8fafc" strokeDasharray="3 2" />}
  </svg>
);

export const PollinationTestVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { editable?: boolean; run?: boolean };
  const [stage, setStage] = useState(q.run ? 2 : 0);
  const [predictions, setPredictions] = useState<Record<string, 'pod' | 'none'>>({});
  const results = PEA_TREATMENTS.map((t) => ({ t, r: peaPollinated(t) }));
  const fruits = results.filter((x) => x.r.pollinated).length;
  const revealed = stage === 2;
  const predicted = results.filter(({ t }) => predictions[t.id]);
  const right = predicted.filter(({ t, r }) => (predictions[t.id] === 'pod') === r.pollinated).length;
  const scene = (
    <ul className="m-0 p-1 list-none grid gap-2 sm:grid-cols-2" aria-label="Five treatments">
      {results.map(({ t, r }) => {
        const pr = predictions[t.id];
        return (
          <li key={t.id} className="flex items-start gap-2 rounded-xl border border-surface-border bg-surface-lowest p-2" data-treatment={t.id} data-fruit={revealed ? (r.pollinated ? 'yes' : 'no') : ''}>
            <PeaFlower t={t} stage={stage} pod={r.pollinated} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="m-0 text-sm font-bold text-white">{t.label}</p>
              <p className="m-0 text-xs text-slate-300">{t.stage === 'bud' ? 'Closed bud' : 'Freshly opened flower'} · stamens {t.stamensRemoved ? 'removed ✂' : 'left in'} · {t.bagged ? 'muslin bag' : 'no bag'}</p>
              {!revealed
                ? <div className="flex gap-1" role="group" aria-label={`Your prediction for: ${t.label}`}>
                  {(['pod', 'none'] as const).map((v) => <button key={v} type="button" className="lab-chip" aria-pressed={pr === v} data-predict={`${t.id}:${v}`} onClick={() => setPredictions((x) => ({ ...x, [t.id]: v }))}>{v === 'pod' ? 'Pod' : 'No pod'}</button>)}
                </div>
                : <p className="m-0 text-sm"><strong className={r.pollinated ? 'text-emerald-300' : 'text-rose-300'}>{r.pollinated ? '✓ Pod formed' : '✗ No pod'}</strong>{pr && <span className={(pr === 'pod') === r.pollinated ? 'text-emerald-300' : 'text-amber-300'}> · you said {pr === 'pod' ? 'pod' : 'no pod'}</span>}<span className="block text-slate-300">{r.why}</span></p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
  return (
    <LabStage testId="pollination-test" alt={alt} data={{ 'data-run': revealed ? 'true' : 'false', 'data-stage': stage, 'data-fruits': revealed ? fruits : '' }}
      question="Is pollination needed for a pea flower to form a pod?"
      sceneNote="Illustrative timeline · ✂ stamens removed · dashed outline: muslin bag"
      scene={scene}
      actions={<LabSteps step={stage} count={3} onStep={setStage} labels={TIMELINE} />}
      observation={<>
        <ol className="lab-timeline" aria-label="Timeline">{TIMELINE.map((label, i) => <li key={label} aria-current={i === stage ? 'step' : undefined}><span>{i === 0 ? 'Day 0' : i === 1 ? 'Week 1' : 'Week 2'}</span>{label}</li>)}</ol>
        {stage === 0 && <p className="m-0">Predict each treatment (optional), then step forward in time.</p>}
        {stage === 1 && <p className="m-0">One week later: the petals have faded. Pollinated ovaries are starting to swell; the others are beginning to wither.</p>}
        {revealed && <p className="m-0" data-testid="pollination-summary">{fruits} of {results.length} treatments formed pods. Only the bud whose stamens were removed and which was bagged received no pollen, so pollination is needed for fruit to form.{predicted.length > 0 ? ` Your predictions: ${right} of ${predicted.length} right.` : ''}</p>}
      </>}
      explanation={<p className="m-0">Pea flowers pollinate themselves as they open, so removing the stamens from an open flower is too late. Removing them from a closed bud and bagging it keeps out every source of pollen: that is the fair test, and only that flower forms no pod.</p>}
      finding={revealed ? { label: 'Pea experiment', value: `${fruits} of ${results.length} formed pods${predicted.length ? `; my predictions ${right}/${predicted.length}` : ''}` } : null}
    />
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
  const ratios: [string, number, string][] = [[id === 'wind' ? 'Wind (yours)' : 'Wind', id === 'wind' ? ratio : oRatio, '#7dd3fc'], [id === 'insect' ? 'Insect (yours)' : 'Insect', id === 'insect' ? ratio : oRatio, '#f9a8d4']];
  const L = (v: number) => (Math.log10(Math.max(1, v)) / 5) * 220;
  const scene = (
    <svg viewBox="0 0 320 120" role="img" aria-label={ratios.map(([n, v]) => `${n}: about ${fmtNum(v, 0)} pollen grains per seed`).join('; ')}>
      <text x="8" y="16" fontSize="13" fill="#e2e8f0">Pollen grains per seed (log scale)</text>
      {ratios.map(([name, v, col], i) => <g key={name}><text x="8" y={48 + i * 40} fontSize="13" fill="#e2e8f0">{name}</text><rect x="92" y={34 + i * 40} width={L(v)} height="20" rx="4" fill={col} className="lab-transition" /><text x={96 + L(v)} y={49 + i * 40} fontSize="13" fill="#fff">{fmtNum(v, 0)}</text></g>)}
      {[1, 10, 100, 1000, 10000].map((t) => <text key={t} x={92 + L(t)} y="116" fontSize="11" textAnchor="middle" fill="#94a3b8">{t.toLocaleString('en-IN')}</text>)}
    </svg>
  );
  return (
    <LabStage testId="pollination-strategy" alt={alt} data={{ 'data-strategy': id, 'data-ratio': Math.round(ratio) }}
      question="Why do wind-pollinated plants make so much more pollen?"
      sceneNote="Approximate values from Table 11.3"
      scene={scene}
      controls={q.editable ? <>
        <LabChoice name="strategy" label="Strategy" value={id} options={[{ id: 'wind', label: 'Wind' }, { id: 'insect', label: 'Insect' }]} onChange={(v) => pick(v as StrategyId)} />
        <LabSlider id="strat-pollen" label="Pollen grains released" value={pollen} min={s.pollen[0]} max={s.pollen[1]} step={(s.pollen[1] - s.pollen[0]) / 20} unit="" onChange={setPollen} />
        <LabSlider id="strat-seeds" label="Seeds formed" value={seeds} min={s.seeds[0]} max={s.seeds[1]} step={10} unit="" onChange={setSeeds} />
      </> : undefined}
      observation={<p className="m-0" data-testid="strategy-result">{s.label}: {pollen.toLocaleString('en-IN')} grains ÷ {seeds} seeds ≈ <strong>{fmtNum(ratio, 0)} pollen grains per seed</strong>, against about {fmtNum(oRatio, 0)} for {other === 'wind' ? 'wind' : 'insect'} pollination.</p>}
      explanation={<p className="m-0">Wind scatters pollen in every direction, so most of it never reaches a stigma; plants that rely on it make enormous amounts. Insects carry pollen from flower to flower, so far less is wasted.</p>}
      extra={<table className="lab-notebook__table"><thead><tr><th>Strategy</th><th>Pollen per flower</th><th>Seeds</th></tr></thead>
        <tbody>{(Object.keys(POLLEN_STRATEGIES) as StrategyId[]).map((k) => { const x = POLLEN_STRATEGIES[k]; return <tr key={k}><td>{x.label}</td><td>{x.pollen[0].toLocaleString('en-IN')} to {x.pollen[1].toLocaleString('en-IN')}</td><td>{x.seeds[0]} to {x.seeds[1]}</td></tr>; })}</tbody></table>}
      extraTitle="Table 11.3"
      finding={{ label: `${id === 'wind' ? 'Wind' : 'Insect'}: ${pollen.toLocaleString('en-IN')} grains, ${seeds} seeds`, value: `${fmtNum(ratio, 0)} grains per seed` }}
    />
  );
};

// ---------- Cycle calendar ----------

const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const iso = (d: Date) => d.toISOString().slice(0, 10);
const PHASE_STYLE: Record<string, { bg: string; mark: string }> = {
  menstruation: { bg: 'bg-rose-500/60', mark: '●' }, 'lining rebuilds': { bg: 'bg-sky-500/30', mark: '' }, ovulation: { bg: 'bg-amber-400/80', mark: '★' }, 'lining thickens': { bg: 'bg-violet-500/30', mark: '' },
};

export const CycleCalendarVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { cycleLength?: number; start?: string; editable?: boolean };
  const [start, setStart] = useState(q.start ?? '2026-03-05');
  const [length, setLength] = useState(q.cycleLength ?? 28);
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(start);
  const startDate = parsed ? utcDate(Number(parsed[1]), Number(parsed[2]), Number(parsed[3])) : utcDate(2026, 3, 5);
  const f = forecastCycle(startDate, length);
  const ovuDay = length - 14;
  const scene = (
    <div className="grid grid-cols-7 gap-1 p-1" role="img" aria-label={`A ${length}-day cycle: menstruation days 1 to 5, likely ovulation on day ${ovuDay}.`}>
      {Array.from({ length }, (_, i) => {
        const day = i + 1;
        const phase = length === 28 ? cyclePhase(day) : day <= 5 ? 'menstruation' : day < ovuDay ? 'lining rebuilds' : day === ovuDay ? 'ovulation' : 'lining thickens';
        const st = PHASE_STYLE[phase] ?? PHASE_STYLE['lining thickens'];
        return <span key={day} className={`rounded text-center text-xs text-white py-1 ${st.bg}`}>{day}{st.mark && <span aria-hidden className="block text-[10px] leading-none">{st.mark}</span>}</span>;
      })}
    </div>
  );
  return (
    <LabStage testId="cycle-calendar" alt={alt} data={{ 'data-next': iso(f.nextPeriod), 'data-ovulation': iso(f.ovulation), 'data-length': length }}
      question="When is the next period expected, and when is ovulation most likely?"
      sceneNote="Typical pattern · for learning, not medical advice"
      scene={<>{scene}<LabKey items={[{ colour: '#f43f5e', label: '● menstruation' }, { colour: '#0ea5e9', label: 'lining rebuilds' }, { colour: '#fbbf24', label: '★ likely ovulation' }, { colour: '#8b5cf6', label: 'lining thickens' }]} /></>}
      controls={q.editable ? <>
        <label htmlFor="cycle-start" className="block text-sm text-slate-200">First day of the last period
          <input id="cycle-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface" />
        </label>
        <LabSlider id="cycle-length" label="Cycle length" value={length} min={TYPICAL_CYCLE_RANGE[0]} max={TYPICAL_CYCLE_RANGE[1]} step={1} unit="days" onChange={setLength} />
      </> : undefined}
      observation={<p className="m-0" data-testid="cycle-result">Period starting {fmtDate(startDate)}, {length}-day cycle: next period expected about <strong>{fmtDate(f.nextPeriod)}</strong>; ovulation most likely around <strong>{fmtDate(f.ovulation)}</strong> (cycle day {ovuDay}).</p>}
      explanation={<p className="m-0">Ovulation happens about 14 days before the next period, so it moves with the cycle length. Cycles of {TYPICAL_CYCLE_RANGE[0]} to {TYPICAL_CYCLE_RANGE[1]} days are normal, and timing varies, so these are estimates only, not a method of contraception. Day {length + 1} = {fmtDate(addDays(startDate, length))} is day 1 of the next cycle.</p>}
    />
  );
};

export const REPRO_VISUALS: VisualRegistry = { ...REPRO_DIAGRAMS, microscope: MicroscopeVisual, beadCombos: BeadCombosVisual, flowerParts: FlowerPartsVisual, pollinationTest: PollinationTestVisual, pollinationStrategy: PollinationStrategyVisual, cycleCalendar: CycleCalendarVisual };
