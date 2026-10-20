/**
 * Two more free laboratories of the Motion chapter (PHY-1D): the Equation Laboratory (/physics/motion/equations)
 * and the Uniform Circular Motion experiment (/physics/motion/circular). Both open at once, no gates.
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { EQUATION_PRESETS } from '../../../engine/physics/motion/equations';
import { validateProfile, type Profile } from '../../../engine/physics/motion/profile';
import { CircularMotionView } from './CircularMotion';
import { DerivationView } from './DerivationView';
import { GraphStudioView } from './MotionGraphs';

const Shell: React.FC<{ last: string; title: string; intro: string; testid: string; children: React.ReactNode }> = ({ last, title, intro, testid, children }) => (
  <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter={testid}>
    <GlobalHeader />
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
        <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
        <Link to="/physics/motion" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Describing Motion</Link><span>/</span>
        <span className="text-sky-300 font-bold">{last}</span>
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-white">{title}</h1>
        <p className="text-sm text-slate-300 max-w-3xl">{intro}</p>
      </header>
      {children}
    </main>
  </div>
);

import { WorkspaceShell } from '../../workspace';

export const EquationLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const currentPresetId = params.get('preset') ?? EQUATION_PRESETS[0].id;
  const named = EQUATION_PRESETS.find((p) => p.id === currentPresetId) ?? EQUATION_PRESETS[0];
  const num = (k: string) => (params.get(k) === null || params.get(k) === '' ? NaN : Number(params.get(k)));
  const typed: Profile | null = [num('u'), num('a'), num('d')].every(Number.isFinite) ? { x0: Number.isFinite(num('x0')) ? num('x0') : 0, v0: num('u'), segments: [{ durationS: num('d'), a: num('a') }] } : null;
  const preset = typed && validateProfile(typed) === null ? { ...named, id: `typed-${params.toString()}`, profile: typed } : named;

  const selectPreset = (id: string) => {
    setParams({ preset: id });
  };

  // Outliner: Presets
  const outlinerContent = (
    <div className="p-3 space-y-3 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Kinematics Presets</span>
        <span className="text-[11px] font-mono text-primary font-bold">{EQUATION_PRESETS.length} Total</span>
      </div>
      <div role="group" aria-label="Choose an equation preset" className="flex flex-col gap-1.5">
        {EQUATION_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            data-preset={p.id}
            aria-pressed={preset.id === p.id}
            onClick={() => selectPreset(p.id)}
            className={`min-h-[38px] w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              preset.id === p.id
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{p.title}</span>
              {preset.id === p.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              u={p.profile.v0}m/s, a={p.profile.segments[0]?.a ?? 0}m/s&sup2;
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Inspector: Equations & Derivations
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Equations of Motion</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Velocity–Time Relation</p>
            <p>v = u + at</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Position–Time Relation</p>
            <p>s = ut + &frac12;at&sup2;</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Velocity–Displacement Relation</p>
            <p>v&sup2; = u&sup2; + 2as</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Reference Derivations</span>
        <div className="space-y-1 text-xs text-slate-300" data-testid="derivation-links">
          <p>
            <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/motion/derivations?d=A">
              Derive v = u + at &rarr;
            </Link>
          </p>
          <p>
            <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/motion/derivations?d=B">
              Derive s = ut + &frac12;at&sup2; &rarr;
            </Link>
          </p>
          <p>
            <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/motion/derivations?d=C">
              Derive v&sup2; = u&sup2; + 2as &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  // Viewport: GraphStudioView with equations
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="motion-equations">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        <GraphStudioView key={preset.id} profile={preset.profile} editable equations graphs={['xt', 'vt']} presets={EQUATION_PRESETS} />
      </div>
    </div>
  );

  // Analysis Dock: Theory and applicability notes
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-sans">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Kinematic Model Applicability</span>
        <span className="text-outline">Constant Acceleration Only</span>
      </div>
      <p className="text-slate-300 leading-relaxed">
        These equations are valid strictly when acceleration is uniform along a straight line. If acceleration varies over time,
        the relations require calculus integration rather than algebraic formulas.
      </p>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="motion"
      labTitle="Equation Laboratory"
      outlinerTitle="Presets"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Equations Inspector"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & Theory"
      analysisDock={analysisDockContent}
    />
  );
};

export const CircularLab: React.FC = () => {
  // Outliner: Modes
  const outlinerContent = (
    <div className="p-3 space-y-3 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Exploration Modes</span>
      </div>
      <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
        <div className="p-2.5 rounded bg-surface-card border border-surface-border">
          <p className="font-bold text-white mb-1">Arc Distance vs Chord</p>
          <p className="text-[10px] text-slate-400">Observe how straight-line displacement differs from circular path distance.</p>
        </div>
        <div className="p-2.5 rounded bg-surface-card border border-surface-border">
          <p className="font-bold text-white mb-1">Direction of Velocity</p>
          <p className="text-[10px] text-slate-400">Velocity is tangential at every point along the circular trajectory.</p>
        </div>
      </div>
    </div>
  );

  // Inspector: Circular motion principles
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Circular Kinematics</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Constant Tangential Speed</p>
            <p>v = 2&pi;r &divide; T</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Centripetal Acceleration</p>
            <p>a<sub>c</sub> directed towards centre</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Viewport: CircularMotionView
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="motion-circular">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        <CircularMotionView editable />
      </div>
    </div>
  );

  // Analysis Dock
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-sans">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Circular Motion Observations</span>
        <span className="text-outline">Non-Zero Acceleration</span>
      </div>
      <p className="text-slate-300 leading-relaxed">
        Although the speed is constant, the velocity vector continuously changes direction. Therefore, uniform circular motion
        is always an accelerated motion.
      </p>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="motion"
      labTitle="Uniform Circular Motion"
      outlinerTitle="Motion Modes"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Circular Parameters"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & Insight"
      analysisDock={analysisDockContent}
    />
  );
};

export const DerivationPage: React.FC = () => {
  const [params] = useSearchParams();
  return (
    <Shell testid="motion-derivations" last="Understand the Derivation" title="Understand the Derivation" intro="Follow how the three equations of motion (Eqs. 4.4a, 4.4b and 4.4c of the chapter) are built from the definition of acceleration and the velocity–time graph. Some steps ask you to supply the missing reasoning first. Free exploration: nothing to unlock, and reading a derivation never counts as mastery.">
      <DerivationView key={params.get('d') ?? 'A'} id={params.get('d') ?? 'A'} />
      <p className="text-sm text-slate-300">Try the numbers yourself in the <Link className="underline hover:text-sky-300" to="/physics/motion/equations">Equation Laboratory</Link>, or see the derivations in <Link className="underline hover:text-sky-300" to="/physics/motion/learn/pm-l9">Lesson 9</Link>.</p>
    </Shell>
  );
};
