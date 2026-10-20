/**
 * Interactions page (/physics/forces/interactions): the two-body laboratory and the force-pair activities (PHY-2D).
 * Investigations P and Q use the two-body model (Predict → Experiment → Observe → Explain); R, S and T work with force pairs.
 * The Free Laboratory (two carts, all settings) is always available above the investigations. No gates.
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAIR_EXPERIMENTS, TB_EXPERIMENTS, tbExperimentById, tbOutcome, type TbExperiment, type TbRoute } from '../../../engine/physics/forces/twoBodyExperiments';
import { DEFAULT_TWO_BODY, type TwoBodySetup } from '../../../engine/physics/forces/twoBody';
import { PairIdentifyView } from './TwoBody';
import { PHYS } from '../motion/physicsColors';
import { TwoBodyMobileLab } from './TwoBodyMobileLab';

const RoutePanel: React.FC<{ route: TbRoute; onRun: (s: TwoBodySetup) => void }> = ({ route, onRun }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const out = tbOutcome(route);
  const right = choice !== null && choice === out.holdsIndex;
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-route={route.id}>
      <p className="text-sm text-slate-100 font-medium">{route.label}</p>
      <fieldset className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>{'★'} 1 · Predict</legend>
        <p className="text-sm text-slate-100">{route.prompt}</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
          {route.options.map((o, i) => <button key={o.label} type="button" role="radio" aria-checked={choice === i} data-option={`${route.id}-${i}`} onClick={() => { setChoice(i); setChecked(false); }} className="min-h-[44px] px-3 rounded-lg border-2 text-sm text-left" style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}>{choice === i ? '● ' : '○ '}{o.label}</button>)}
        </div>
      </fieldset>
      <div className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}>
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>{'▶'} 2 · Experiment</h4>
        <button type="button" onClick={() => onRun(route.setup)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.position }} data-testid={`run-${route.id}`}>Set up this experiment</button>
        <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40 ml-2" style={{ background: PHYS.prediction }} data-testid={`check-${route.id}`}>Check my prediction</button>
      </div>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid="tb-feedback" className="rounded-lg p-3 text-xs text-slate-100 space-y-1" style={{ border: `1px solid ${right ? PHYS.correct : PHYS.error}`, background: `${right ? PHYS.correct : PHYS.error}14` }}>
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>{right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}</h4>
          <p><strong>Model result: </strong>{route.explain(out.start, out.end, route.setup)}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>4 · Explain</h4>
          <p>{right ? route.options[choice].why : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}</p>
        </div>
      )}
    </section>
  );
};

const ComparePredict: React.FC = () => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const opts = [
    { label: 'Yes: they are equal and opposite, so they are an action–reaction pair', right: false, why: 'They are equal and opposite, but both act on the SAME object (the book). A third-law pair always acts on two different objects and is the same kind of force. These two balance each other on the book.' },
    { label: 'No: they are balanced forces on the book; each has a different partner on another object', right: true, why: 'The weight is exerted by the Earth and the normal force by the table. The partner of the weight is the book pulling the Earth; the partner of the normal force is the book pressing the table.' },
  ];
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-route="s1">
      <fieldset className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>{'★'} 1 · Predict</legend>
        <p className="text-sm text-slate-100">A book rests on a table. Its weight (down) and the normal force from the table (up) are equal and opposite. Are they an action–reaction pair?</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
          {opts.map((o, i) => <button key={o.label} type="button" role="radio" aria-checked={choice === i} data-option={`s1-${i}`} onClick={() => { setChoice(i); setChecked(false); }} className="min-h-[44px] px-3 rounded-lg border-2 text-sm text-left" style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}>{choice === i ? '● ' : '○ '}{o.label}</button>)}
        </div>
        <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40" style={{ background: PHYS.prediction }} data-testid="check-s1">Check my prediction</button>
      </fieldset>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid="tb-feedback" className="rounded-lg p-3 text-xs text-slate-100" style={{ border: `1px solid ${opts[choice].right ? PHYS.correct : PHYS.error}`, background: `${opts[choice].right ? PHYS.correct : PHYS.error}14` }}>
          <strong style={{ color: opts[choice].right ? PHYS.correct : PHYS.error }}>{opts[choice].right ? '✓ ' : '✗ '}</strong>{opts[choice].why}
        </div>
      )}
      <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>{'▶'} 2 · Experiment: compare the free-body diagrams side by side</h4>
      <PairIdentifyView mode="compare" />
    </section>
  );
};

import { DockTabs, LabOutliner, ViewportFrame, WorkspaceShell, useModelHistory, useSceneState, type DockTab, type SceneObject } from '../../workspace';
import { LabButton, LabInspectorSection, LabParameterField, LabSegmentedControl, LabSelect } from '../../workspace/controls';
import { TwoBodyReadout, TwoBodyScene, useTwoBody } from './TwoBody';

const ICON = (name: string) => <span className="material-symbols-outlined text-[15px]">{name}</span>;
const t1 = (n: number) => String(Math.round(n * 10) / 10);
const TB_OBJECTS: SceneObject[] = [
  { id: 'A', name: 'CART_A', category: 'Object / Dynamics', icon: 'directions_car' },
  { id: 'B', name: 'CART_B', category: 'Object / Dynamics', icon: 'directions_car' },
  { id: 'link', name: 'STRING', category: 'Constraint / Link', icon: 'link' },
];

export const ForcesInteractions: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const id = params.get('experiment');
  const tb: TbExperiment | undefined = tbExperimentById(id);
  const pairExp = PAIR_EXPERIMENTS.find((e) => e.id === id);
  const tow: TwoBodySetup = { mode: 'tow', massA: 2, massB: 3, force: 10, uA: 0, uB: 0, durationS: 3 };
  const [load, setLoad] = useState<{ setup: TwoBodySetup; key: number }>({ setup: tb ? tb.routes[0].setup : params.get('arrangement') === 'tow' ? tow : DEFAULT_TWO_BODY, key: 0 });
  const m = useTwoBody({ initial: load.setup, resetToken: load.key });
  const scene = useSceneState(TB_OBJECTS.map((o) => o.id));
  const [beginnerMode, setBeginnerMode] = useState(false);
  const hist = useModelHistory<TwoBodySetup>(m.setup, (full) => m.change(full));
  const edit = (patch: Partial<TwoBodySetup>) => { hist.record(); m.change(patch); };
  const select = (x: string | null) => { const e = tbExperimentById(x); setParams(x ? { experiment: x } : {}); hist.clear(); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_TWO_BODY, key: l.key + 1 })); };
  const all = [...TB_EXPERIMENTS.map((e) => ({ id: e.id, title: e.title, goal: e.goal })), ...PAIR_EXPERIMENTS.map((e) => ({ id: e.id, title: e.title, goal: e.goal }))];
  const sel = (k: string) => scene.selectedId === k;
  const s = m.setup;
  const spaceless = Boolean(pairExp);

  const outlinerContent = (
    <LabOutliner
      investigations={all}
      activeInvestigationId={id}
      onSelectInvestigation={select}
      objects={spaceless ? [] : TB_OBJECTS.filter((o) => o.id !== 'link' || s.mode === 'tow')}
      selectedId={scene.selectedId}
      onSelect={scene.select}
      visibility={scene.visibility}
      onToggleVisibility={scene.toggleVisibility}
      lockMap={scene.lockMap}
      onToggleLock={scene.toggleLock}
    />
  );

  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="two-body-controls">
      {!pairExp && (
        <>
          <LabInspectorSection title="Arrangement" icon={ICON('compare_arrows')} locked={scene.isLocked('link')}>
            <LabSegmentedControl<'push' | 'tow'> size="sm" columns={2} ariaLabel="Arrangement" disabled={scene.isLocked('link')} value={s.mode} onChange={(mode) => edit({ mode, uA: 0, uB: 0 })}
              options={[{ value: 'push', label: 'Push apart' }, { value: 'tow', label: 'String' }]} />
            <LabParameterField id="force" label={s.mode === 'push' ? 'Interaction force' : 'Pull on A'} symbol="F" unit="N" compact step={1} min={0} max={1000} value={s.force} disabled={scene.isLocked('link')} onChange={(v) => edit({ force: v })} />
            <LabParameterField id="duration" label="Lasts" symbol="t" unit="s" compact step={0.5} min={0.5} max={10} value={s.durationS} disabled={scene.isLocked('link')} onChange={(v) => edit({ durationS: v })} />
          </LabInspectorSection>
          <LabInspectorSection title="Object · CART_A" icon={ICON('directions_car')} selected={sel('A')} locked={scene.isLocked('A')}>
            <LabParameterField id="massA" label="Mass of A" symbol="mₐ" unit="kg" compact step={1} min={0.1} max={100} value={s.massA} disabled={scene.isLocked('A')} onChange={(v) => edit({ massA: v })} />
            {!beginnerMode && <LabParameterField id="uA" label="Start velocity of A" symbol="uₐ" unit="m/s" compact step={1} min={-20} max={20} value={s.uA} disabled={scene.isLocked('A')} onChange={(v) => edit(s.mode === 'tow' ? { uA: v, uB: v } : { uA: v })} />}
          </LabInspectorSection>
          <LabInspectorSection title="Object · CART_B" icon={ICON('directions_car')} selected={sel('B')} locked={scene.isLocked('B')}>
            <LabParameterField id="massB" label="Mass of B" symbol="m_b" unit="kg" compact step={1} min={0.1} max={100} value={s.massB} disabled={scene.isLocked('B')} onChange={(v) => edit({ massB: v })} />
            {!beginnerMode && <LabParameterField id="uB" label="Start velocity of B" symbol="u_b" unit="m/s" compact step={1} min={-20} max={20} value={s.uB} disabled={scene.isLocked('B')} onChange={(v) => edit(s.mode === 'tow' ? { uA: v, uB: v } : { uB: v })} />}
          </LabInspectorSection>
          {m.err && <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="two-body-error"><span aria-hidden>{'✗ '}</span>{m.err}</p>}
          <p className="text-[11px] text-slate-400">A frictionless horizontal track, right positive. The two interaction forces are always equal and opposite and act on different carts.</p>
        </>
      )}
      <LabInspectorSection title="Newton's third law" icon={ICON('balance')}>
        <div className="space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Action &amp; reaction</p><p>F<sub>A on B</sub> = &minus;F<sub>B on A</sub></p></div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Two different bodies</p><p className="text-[10px] leading-relaxed">Action and reaction forces never act on the same object, so they never cancel each other out.</p></div>
        </div>
      </LabInspectorSection>
      {tb && (
        <LabInspectorSection title={`Investigation ${tb.id}: ${tb.title}`} icon={ICON('school')}>
          <p className="text-[11px] text-slate-300 leading-relaxed">{tb.goal}</p>
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300"><strong>Notice:</strong> {tb.lesson}</div>
        </LabInspectorSection>
      )}
      {pairExp && (
        <LabInspectorSection title={`Pair study ${pairExp.id}: ${pairExp.title}`} icon={ICON('school')}>
          <p className="text-[11px] text-slate-300 leading-relaxed">{pairExp.goal}</p>
        </LabInspectorSection>
      )}
    </div>
  );

  const transport = !pairExp ? (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Time controls" data-testid="two-body-time">
      <LabButton type="button" size="sm" variant="primary" onClick={m.togglePlay} aria-pressed={m.playing} className="font-semibold" icon={ICON(m.playing ? 'pause' : m.tt >= m.tMax ? 'replay' : 'play_arrow')}>{m.playing ? 'Pause' : m.tt >= m.tMax ? 'Replay' : 'Play'}</LabButton>
      <LabButton type="button" size="sm" onClick={m.stepBack} aria-label="Step back 1 second of simulated time" icon={ICON('skip_previous')}>−1 s</LabButton>
      <LabButton type="button" size="sm" onClick={m.stepForward} aria-label="Step forward 1 second of simulated time" icon={ICON('skip_next')}>+1 s</LabButton>
      <LabButton type="button" size="sm" onClick={m.rewind} icon={ICON('restart_alt')}>Back to 0 s</LabButton>
      <label className="flex items-center gap-2 text-xs text-slate-300 min-w-[160px] grow max-w-md">Time
        <input type="range" min={0} max={m.tMax} step={0.05} value={m.tt} onChange={(e) => m.scrub(Number(e.target.value))} aria-label="Simulated time" aria-valuetext={`${t1(m.tt)} seconds`} className="flex-1 min-w-[90px] accent-primary" />
        <span className="font-mono text-[11px] w-20 text-right">{t1(m.tt)} / {t1(m.tMax)} s</span>
      </label>
      {!beginnerMode && <LabSelect compact aria-label="Replay speed on screen. This does not change the motion." value={m.rate} onChange={(e) => m.setRate(Number(e.target.value))} options={[{ value: 0.25, label: '0.25×' }, { value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]} />}
    </div>
  ) : undefined;

  const viewportContent = (
    <ViewportFrame toolbar={transport} footnote={pairExp ? 'Look at the forces on each object and check that third-law pairs act on two different objects.' : 'Two idealised carts on a frictionless track. Each cart has its own free-body diagram.'}>
      <div className="w-full max-h-full overflow-y-auto space-y-3 px-1" data-no-pan data-chapter="forces-interactions">
        {!pairExp && (
          <div data-visual="twoBody" data-testid="two-body" className="space-y-3">
            <TwoBodyScene m={m} hidden={{ A: !scene.isVisible('A'), B: !scene.isVisible('B'), link: !scene.isVisible('link') }} />
          </div>
        )}
        {pairExp && id === 'S' && <ComparePredict />}
        {pairExp && id !== 'S' && <PairIdentifyView key={pairExp.id} scenarioId={pairExp.scenarios[0]} />}
      </div>
    </ViewportFrame>
  );

  const investigation = tb ? (
    <div className="space-y-3" data-testid="tb-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Experiment {tb.id}: {tb.title}</span>
        <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
      </div>
      {tb.routes.map((r) => <RoutePanel key={`${tb.id}-${r.id}`} route={r} onRun={(setup) => { hist.clear(); setLoad((l) => ({ setup, key: l.key + 1 })); }} />)}
      <p className="text-xs text-slate-400">Model results for idealised carts on a frictionless track; equal mutual forces with accelerations inversely proportional to masses.</p>
    </div>
  ) : pairExp ? (
    <div className="space-y-2" data-testid="pair-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Experiment {pairExp.id}: {pairExp.title}</span>
        <span className="text-outline">Free-body diagram analysis</span>
      </div>
      <p className="text-slate-300 text-xs">Look at the forces on each object, verify that third-law pairs are equal in magnitude, opposite in direction, and act on separate entities.</p>
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300">
      <p className="font-mono">Free Exploration: two interacting carts on a frictionless horizontal track.</p>
      <p className="text-outline">Choose an investigation in the Explorer to test predictions against Newton&apos;s third law.</p>
    </div>
  );

  const tabs: DockTab[] = [
    ...(!pairExp ? [{ id: 'measurements', label: 'Measurements', content: <TwoBodyReadout m={m} /> }] : []),
    { id: 'investigation', label: id ? `Investigation ${id}` : 'Investigation', content: investigation },
  ];

  const mobileLayoutContent = (
    <TwoBodyMobileLab
      m={m}
      scene={scene}
      pairExp={pairExp}
      id={id}
      tabs={tabs}
      inspector={inspectorContent}
      onReset={!pairExp ? m.rewind : undefined}
      comparePredict={<ComparePredict />}
    />
  );

  return (
    <WorkspaceShell
      chapterId="forces"
      labTitle="Two-Body Interactions"
      outlinerTitle="Interactions & Pairs"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Interaction Inspector"
      inspector={inspectorContent}
      analysisDock={<DockTabs key={id ?? 'free'} tabs={tabs} initial={id ? 'investigation' : 'measurements'} />}
      mobileLayout={mobileLayoutContent}
      playing={!pairExp ? m.playing : undefined}
      onTogglePlay={!pairExp ? m.togglePlay : undefined}
      onReset={!pairExp ? m.rewind : undefined}
      onUndo={!pairExp ? hist.undo : undefined}
      onRedo={!pairExp ? hist.redo : undefined}
      canUndo={hist.canUndo}
      canRedo={hist.canRedo}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};
