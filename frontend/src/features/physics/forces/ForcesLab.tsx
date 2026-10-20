/**
 * Force Laboratory page (/physics/forces/lab): Free Laboratory with guided investigations.
 * Full integration with the Blender-inspired scientific workstation (Workspace V3).
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FORCE_EXPERIMENTS,
  forceExperimentById,
  routeOutcome,
  type ForceExperiment,
  type ForceRoute,
} from '../../../engine/physics/forces/experiments';
import {
  BRAKING_ROUTES,
  brakingOutcome,
  FIRST_LAW_EXPERIMENTS,
  firstLawExperimentById,
  type BrakingRoute,
  type FirstLawExperiment,
} from '../../../engine/physics/forces/firstLaw';
import { DEFAULT_BRAKING, type BrakingSetup } from '../../../engine/physics/forces/vehicle';
import {
  SECOND_LAW_EXPERIMENTS,
  secondLawExperimentById,
  type SecondLawExperiment,
} from '../../../engine/physics/forces/secondLawExperiments';
import {
  BrakingLiveStatus,
  BrakingReadout,
  BrakingScene,
  BrakingSetupFields,
  BrakingTimeControls,
  useBrakingDemo,
} from './BrakingDemo';
import { DEFAULT_SETUP, G, surfaceById } from '../../../engine/physics/forces/forceModel';
import { netWorking } from '../../../engine/physics/forces/forceDiagram';
import { ForceDataTable, ForceLive, ForceMomentum, ForceReadout, ForceSetupFields, ForceTimeControls, ForceToggles, r2, Track, useForceCart } from './ForceCart';
import { ForceFigure } from './ForceFigure';
import { ForceGraphs } from './ForceGraphs';
import { PHYS } from '../motion/physicsColors';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { SecondLawDerivationView } from './SecondLawDerivation';
import { DockTabs, ViewportFrame, WorkspaceShell, type DockTab } from '../../workspace';

const RoutePanel: React.FC<{ route: ForceRoute; onRun: (r: ForceRoute) => void }> = ({
  route,
  onRun,
}) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [ran, setRan] = useState(false);
  const out = routeOutcome(route);
  const right = choice !== null && choice === out.holdsIndex;
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-route={route.id}>
      <p className="text-sm text-slate-100 font-medium">{route.label}</p>
      <fieldset
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}
      >
        <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>
          ★ 1 · Predict
        </legend>
        <p className="text-sm text-slate-100">{route.prompt}</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
          {route.options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={choice === i}
              data-option={`${route.id}-${i}`}
              onClick={() => {
                setChoice(i);
                setChecked(false);
              }}
              className="min-h-[36px] px-3 rounded-lg border-2 text-xs text-left"
              style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}
            >
              {choice === i ? '● ' : '○ '}
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}
      >
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>
          ▶ 2 · Experiment
        </h4>
        <button
          type="button"
          onClick={() => {
            onRun(route);
            setRan(true);
          }}
          className="min-h-[36px] px-4 rounded-lg font-bold text-xs text-slate-950"
          style={{ background: PHYS.position }}
          data-testid={`run-${route.id}`}
        >
          Set up this experiment in the cart
        </button>
        <button
          type="button"
          disabled={choice === null}
          onClick={() => setChecked(true)}
          className="min-h-[36px] px-4 rounded-lg font-bold text-xs text-slate-950 disabled:opacity-40 ml-2"
          style={{ background: PHYS.prediction }}
          data-testid={`check-${route.id}`}
        >
          Check my prediction
        </button>
        {ran && (
          <p className="text-[11px] text-slate-300">
            The cart above is set up. Press Play, or drag the time slider, then compare.
          </p>
        )}
      </div>
      {checked && choice !== null && (
        <div
          role="status"
          aria-live="polite"
          data-testid="force-feedback"
          className="rounded-lg p-3 text-xs text-slate-100 space-y-1"
          style={{
            border: `1px solid ${right ? PHYS.correct : PHYS.error}`,
            background: `${right ? PHYS.correct : PHYS.error}14`,
          }}
        >
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>
            {right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}
          </h4>
          <p>
            <strong>Model result after {route.tEnd} s: </strong>
            {route.explain(out.end, out.start)}
          </p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>
            4 · Explain
          </h4>
          <p>
            {right
              ? route.options[choice].why
              : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}
          </p>
        </div>
      )}
    </section>
  );
};

const BrakingPanel: React.FC<{ route: BrakingRoute; onRun: (s: BrakingSetup) => void }> = ({
  route,
  onRun,
}) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const out = brakingOutcome(route);
  const right = choice !== null && choice === out.holdsIndex;
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-route={route.id}>
      <p className="text-sm text-slate-100 font-medium">{route.label}</p>
      <fieldset
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}
      >
        <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>
          ★ 1 · Predict
        </legend>
        <p className="text-sm text-slate-100">{route.prompt}</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
          {route.options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={choice === i}
              data-option={`${route.id}-${i}`}
              onClick={() => {
                setChoice(i);
                setChecked(false);
              }}
              className="min-h-[36px] px-3 rounded-lg border-2 text-xs text-left"
              style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}
            >
              {choice === i ? '● ' : '○ '}
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}
      >
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>
          ▶ 2 · Experiment
        </h4>
        <button
          type="button"
          onClick={() => onRun(route.setup)}
          className="min-h-[36px] px-4 rounded-lg font-bold text-xs text-slate-950"
          style={{ background: PHYS.position }}
          data-testid={`run-${route.id}`}
        >
          Set up this demonstration
        </button>
        <button
          type="button"
          disabled={choice === null}
          onClick={() => setChecked(true)}
          className="min-h-[36px] px-4 rounded-lg font-bold text-xs text-slate-950 disabled:opacity-40 ml-2"
          style={{ background: PHYS.prediction }}
          data-testid={`check-${route.id}`}
        >
          Check my prediction
        </button>
      </div>
      {checked && choice !== null && (
        <div
          role="status"
          aria-live="polite"
          data-testid="force-feedback"
          className="rounded-lg p-3 text-xs text-slate-100 space-y-1"
          style={{
            border: `1px solid ${right ? PHYS.correct : PHYS.error}`,
            background: `${right ? PHYS.correct : PHYS.error}14`,
          }}
        >
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>
            {right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}
          </h4>
          <p>
            <strong>Model result: </strong>
            {route.explain(out.end, route.setup)}
          </p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>
            4 · Explain
          </h4>
          <p>
            {right
              ? route.options[choice].why
              : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}
          </p>
        </div>
      )}
    </section>
  );
};

export const ForcesLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const byId = (
    id: string | null | undefined
  ): ForceExperiment | FirstLawExperiment | SecondLawExperiment | undefined =>
    forceExperimentById(id) ?? firstLawExperimentById(id) ?? secondLawExperimentById(id);
  const exp = byId(params.get('experiment'));
  const [load, setLoad] = useState<{ setup: typeof DEFAULT_SETUP; key: number }>({
    setup: exp && exp.routes[0] ? exp.routes[0].setup : DEFAULT_SETUP,
    key: 0,
  });
  const [braking, setBraking] = useState<{ setup: BrakingSetup; key: number }>({
    setup: DEFAULT_BRAKING,
    key: 0,
  });
  const select = (id: string | null) => {
    const e = byId(id);
    setParams(id ? { experiment: id } : {});
    setLoad((l) => ({ setup: e && e.routes[0] ? e.routes[0].setup : DEFAULT_SETUP, key: l.key + 1 }));
  };
  const m = useForceCart({ initial: load.setup, resetToken: load.key, showNet: true });
  const isBraking = exp?.id === 'J';
  const b = useBrakingDemo({ initial: braking.setup, resetToken: braking.key });

  const outlinerContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigations</span>
        <div className="mt-1.5 space-y-1">
          <button type="button" aria-pressed={!exp} onClick={() => select(null)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${!exp ? 'bg-surface-variant text-primary font-bold border border-primary/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'}`}>
            <span>Free Exploration</span>{!exp && <span className="text-primary text-[11px]">✓</span>}
          </button>
          {[...FORCE_EXPERIMENTS, ...FIRST_LAW_EXPERIMENTS, ...SECOND_LAW_EXPERIMENTS].map((x) => (
            <button key={x.id} type="button" aria-pressed={exp?.id === x.id} data-experiment={x.id} onClick={() => select(x.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${exp?.id === x.id ? 'bg-surface-variant text-primary font-bold border border-primary/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'}`}>
              <span className="truncate">{x.id}. {x.title}</span>{exp?.id === x.id && <span className="text-primary text-[11px]">✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Apparatus Hierarchy</span>
        {isBraking ? (
          <div className="mt-1.5 space-y-1 font-mono text-[11px]">
            <div className="flex items-center space-x-2 px-2 py-1 rounded bg-surface-lowest/50 text-slate-300"><span className="material-symbols-outlined text-[14px] text-amber-400">directions_car</span><span>Vehicle ({b.setup.speed} m/s)</span></div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded bg-surface-lowest/50 text-slate-300"><span className="material-symbols-outlined text-[14px] text-emerald-400">person</span><span>Passenger ({b.setup.passengerMassKg} kg)</span></div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded bg-surface-lowest/50 text-slate-300"><span className="material-symbols-outlined text-[14px] text-cyan-400">airline_seat_recline_normal</span><span>Restraint: {b.setup.restrained ? 'Belt On' : 'No Belt'}</span></div>
          </div>
        ) : (
          <div className="mt-1.5 space-y-1 font-mono text-[11px]">
            <div className="flex items-center space-x-2 px-2 py-1 rounded bg-surface-lowest/50 text-slate-300"><span className="material-symbols-outlined text-[14px] text-violet-400">directions_car</span><span>Force_Cart ({m.setup.massKg} kg)</span></div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded bg-surface-lowest/50 text-slate-300"><span className="material-symbols-outlined text-[14px] text-cyan-400">arrow_right_alt</span><span>Pushes A / B</span></div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded bg-surface-lowest/50 text-slate-300"><span className="material-symbols-outlined text-[14px] text-rose-400">drag_handle</span><span>Surface: {surfaceById(m.setup.surfaceId).label}</span></div>
          </div>
        )}
      </div>
    </div>
  );

  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans" data-testid="forces-inspector">
      {isBraking ? (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Vehicle & Passenger Properties</span>
          <div className="mt-2"><BrakingSetupFields b={b} /></div>
        </div>
      ) : (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Cart and forces</span>
          <div className="mt-2"><ForceSetupFields m={m} stacked /></div>
        </div>
      )}
      <div className="pt-2 border-t border-outline-variant space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Curriculum Links</span>
        <Link to="/physics/forces/interactions" data-testid="interactions-link" className="block w-full py-1.5 px-2.5 rounded bg-surface-lowest hover:bg-surface-variant text-[11px] text-cyan-300 border border-outline-variant transition-colors">Interactions Lab (Two Carts) →</Link>
        <Link to="/physics/forces/derivations?d=A" data-testid="sl-derivation-links" className="block w-full py-1.5 px-2.5 rounded bg-surface-lowest hover:bg-surface-variant text-[11px] text-amber-300 border border-outline-variant transition-colors">Derivation: F = ma →</Link>
      </div>
      {exp && (
        <div className="pt-2 border-t border-outline-variant space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigation Concept</span>
          <p className="text-xs text-slate-300 leading-relaxed">{exp.goal}</p>
          <div className="p-2 rounded bg-surface-lowest text-[11px] text-emerald-300 border border-emerald-500/20"><strong>Observation:</strong> {exp.lesson}</div>
        </div>
      )}
    </div>
  );

  const viewportContent = isBraking ? (
    <ViewportFrame
      toolbar={<BrakingTimeControls b={b} compact />}
      footnote={<>Simulated time t = {r2(b.tt)} s · braking deceleration {r2(b.setup.decel)} m/s² · passenger inertia model</>}
    >
      <div className="w-full h-full min-h-0 flex flex-col gap-3 p-3 overflow-y-auto" data-visual="brakingDemo" data-testid="braking-viewport">
        <div className="shrink-0" data-no-pan><BrakingScene b={b} /></div>
        <div className="shrink-0 max-h-[170px]" data-no-pan>
          <ForceFigure
            object="passenger"
            arrows={b.arrows}
            net={b.net}
            showIndividual
            showNet
            alt={`Forces on the passenger: ${b.setup.restrained && b.s.passengerForce !== 0 ? `belt ${r2(Math.abs(b.s.passengerForce))} N backward; ` : 'no horizontal force; '}weight and normal force ${r2(b.setup.passengerMassKg * G)} N each, vertical.`}
            listing={false}
            fill
          />
        </div>
      </div>
    </ViewportFrame>
  ) : (
    <ViewportFrame toolbar={<><ForceToggles m={m} compact /><ForceTimeControls m={m} compact /></>} footnote={<>Simulated time t = {r2(m.tt)} s · right is positive · arrow lengths scale with the force</>}>
      <div className="w-full h-full min-h-0 flex flex-col gap-2" data-visual="forceCart" data-testid="force-cart">
        <div className="shrink-0" data-no-pan><Track setup={m.setup} tMax={m.tMax} t={m.tt} /></div>
        <div className="flex-1 min-h-0" data-no-pan><ForceFigure object="cart" arrows={m.d.arrows} net={m.d.net} showIndividual={m.showIndividual} showNet={m.showNetForce} alt={m.figureAlt} listing={false} fill /></div>
      </div>
    </ViewportFrame>
  );

  const explanation = (
    <div className="space-y-2 text-xs text-slate-200 max-w-3xl" data-testid="force-explanation">
      <ForceLive m={m} />
      <ul className="list-disc pl-5" aria-label="Forces on the cart" data-testid="force-listing">
        {m.d.arrows.map((a) => <li key={a.id}>{a.label}: {Math.round(a.magnitude * 100) / 100} N {a.direction}, exerted by {a.by} on the {a.on}</li>)}
      </ul>
      <p data-testid="net-working"><strong style={{ color: PHYS.netForce }}>Net horizontal force: </strong>{netWorking(m.d.arrows)}</p>
      <p>Newton&apos;s second law: a = F<sub>net</sub> ÷ m. <Link className="underline text-amber-300" to="/physics/forces/derivations?d=A">See the derivation of F = ma</Link>.</p>
    </div>
  );

  const investigation = exp ? (
    <div className="space-y-3" data-testid="force-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-primary font-bold">Investigation {exp.id}: {exp.title}</span>
        <span className="text-outline">Predict → Experiment → Observe → Explain</span>
      </div>
      {isBraking
        ? BRAKING_ROUTES.map((r) => <BrakingPanel key={r.id} route={r} onRun={(s) => setBraking((bb) => ({ setup: s, key: bb.key + 1 }))} />)
        : exp.routes.map((r) => <RoutePanel key={`${exp.id}-${r.id}`} route={r as ForceRoute} onRun={(rr) => setLoad((l) => ({ setup: rr.setup, key: l.key + 1 }))} />)}
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300" data-testid="force-experiment-panel">
      <p className="font-mono">Free Exploration: change mass, friction and the pushes in the Inspector, then read the measurements and graphs.</p>
      <p className="text-outline">Choose an investigation from the Explorer to predict outcomes and verify against Newton&apos;s laws.</p>
    </div>
  );

  const tabs: DockTab[] = isBraking ? [
    { id: 'measurements', label: 'Measurements', content: <div className="space-y-2"><BrakingReadout b={b} /></div> },
    { id: 'graphs', label: 'Graphs', content: <div className="p-4 text-xs font-mono text-slate-300">Live vehicle speed: <span className="text-amber-400 font-bold">{r2(b.s.vehicleV)} m/s</span> · Passenger speed: <span className="text-cyan-400 font-bold">{r2(b.s.passengerV)} m/s</span> · Relative displacement: <span className="text-emerald-400 font-bold">{r2(b.s.relative)} m</span></div> },
    { id: 'data', label: 'Data', content: (
      <div className="p-3 font-mono text-xs space-y-1.5 text-slate-300">
        <div className="text-slate-400 font-semibold tracking-wider text-[11px]">BRAKING SCENARIO PARAMETERS</div>
        <div>Initial Speed: {b.setup.speed} m/s ({Math.round(b.setup.speed * 3.6)} km/h)</div>
        <div>Deceleration: {b.setup.decel} m/s²</div>
        <div>Passenger Mass: {b.setup.passengerMassKg} kg</div>
        <div>Restraint: {b.setup.restrained ? 'Seat belt engaged' : 'None (inertia free forward motion)'}</div>
        <div>Current Phase: {b.s.state}</div>
      </div>
    ) },
    { id: 'explanation', label: 'Explanation', content: <BrakingLiveStatus b={b} /> },
    { id: 'investigation', label: 'Investigation J', content: investigation },
  ] : [
    { id: 'measurements', label: 'Measurements', content: <div className="space-y-2"><ForceReadout m={m} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2" /><ForceMomentum m={m} /></div> },
    { id: 'graphs', label: 'Graphs', content: <ForceGraphs setup={m.setup} tMax={m.tMax} t={m.tt} /> },
    { id: 'data', label: 'Data', content: <ForceDataTable m={m} /> },
    { id: 'explanation', label: 'Explanation', content: explanation },
    { id: 'investigation', label: exp ? `Investigation ${exp.id}` : 'Investigation', content: investigation },
  ];

  return (
    <WorkspaceShell
      chapterId="forces"
      labTitle="Force Laboratory"
      outliner={outlinerContent}
      outlinerTitle="Investigations"
      viewport={viewportContent}
      inspector={inspectorContent}
      inspectorTitle="Forces Inspector"
      analysisDock={<DockTabs key={exp?.id ?? 'free'} tabs={tabs} initial={exp ? 'investigation' : 'measurements'} />}
      experimentSetupSnapshot={load.setup}
    />
  );
};

export const ForcesDerivation: React.FC = () => {
  const [params] = useSearchParams();
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces-derivations">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
          <Link to="/physics/forces" className="inline-flex items-center min-h-[44px] hover:text-sky-400">How Forces Affect Motion</Link><span>/</span>
          <span className="text-sky-300 font-bold">Derive F = ma</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Derive Newton&apos;s second law</h1>
          <p className="text-sm text-slate-300 max-w-3xl">Follow the textbook&apos;s argument from the cart experiments (Eqs. 6.1 and 6.2), or derive F = ma from momentum. Some steps ask you to supply the missing reasoning first. Free exploration: reading a derivation never counts as mastery.</p>
        </header>
        <SecondLawDerivationView key={params.get('d') ?? 'A'} id={params.get('d') ?? 'A'} />
        <p className="text-sm text-slate-300">Try the numbers in the <Link className="underline hover:text-sky-300" to="/physics/forces/lab?experiment=K">Force Laboratory</Link>, or see the derivations in <Link className="underline hover:text-sky-300" to="/physics/forces/learn/pf-l6">Lesson 6</Link> and <Link className="underline hover:text-sky-300" to="/physics/forces/learn/pf-l7">Lesson 7</Link>.</p>
      </main>
    </div>
  );
};
