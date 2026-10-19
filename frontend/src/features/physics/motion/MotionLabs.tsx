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

export const EquationLab: React.FC = () => {
  const [params] = useSearchParams();
  const named = EQUATION_PRESETS.find((p) => p.id === params.get('preset')) ?? EQUATION_PRESETS[0];
  const num = (k: string) => (params.get(k) === null || params.get(k) === '' ? NaN : Number(params.get(k)));
  const typed: Profile | null = [num('u'), num('a'), num('d')].every(Number.isFinite) ? { x0: Number.isFinite(num('x0')) ? num('x0') : 0, v0: num('u'), segments: [{ durationS: num('d'), a: num('a') }] } : null;
  const preset = typed && validateProfile(typed) === null ? { ...named, id: `typed-${params.toString()}`, profile: typed } : named;
  return (
    <Shell testid="motion-equations" last="Equation Laboratory" title="Equation Laboratory" intro="Set the start position, initial velocity, acceleration and elapsed time. The three equations of motion, the numbers and both graphs come from one motion with constant acceleration. Free exploration: nothing to unlock.">
      <GraphStudioView key={preset.id} profile={preset.profile} editable equations graphs={['xt', 'vt']} presets={EQUATION_PRESETS} />
      <p className="text-xs text-slate-400">These are <em>model</em> values for an idealised straight-line motion with a constant acceleration. The textbook equations (Eqs. 4.4a to 4.4c in the chapter) are only valid for that case.</p>
    </Shell>
  );
};

export const CircularLab: React.FC = () => (
  <Shell testid="motion-circular" last="Uniform Circular Motion" title="Uniform circular motion" intro="An object goes round a circle at a constant speed. Change the radius, the period and the direction, then move the time and compare the distance along the circle with the straight-line displacement. Free exploration: nothing to unlock, and nothing needs dragging.">
    <CircularMotionView editable />
    <p className="text-xs text-slate-400">This is a <em>model</em> with an exactly constant speed. Section 4.4.1 of the chapter treats motion in a circle qualitatively; the acceleration towards the centre is shown only as an idea, without a formula.</p>
  </Shell>
);
