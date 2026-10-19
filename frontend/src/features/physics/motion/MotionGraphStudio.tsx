/**
 * Motion Graph Studio page (/physics/motion/graphs): the free exploration of position–time and
 * velocity–time graphs (PHY-1C). Opens at once, no gates; the prediction is optional.
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { scenarioById } from '../../../engine/physics/motion/profile';
import { GraphStudioView } from './MotionGraphs';

export const MotionGraphStudio: React.FC = () => {
  const [params] = useSearchParams();
  const sc = scenarioById(params.get('scenario')) ?? scenarioById('uniform-acc')!;
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="motion-graphs">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
          <Link to="/physics/motion" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Describing Motion</Link><span>/</span>
          <span className="text-sky-300 font-bold">Motion Graph Studio</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Motion Graph Studio</h1>
          <p className="text-sm text-slate-300 max-w-3xl">The track, the position–time graph, the velocity–time graph and the acceleration–time graph are all drawn from one motion with constant acceleration. Pick a scenario, predict, then move the time cursor and read the numbers. Free exploration: nothing to unlock.</p>
        </header>
        <GraphStudioView key={sc.id} scenarioId={sc.id} editable withPrediction />
        <p className="text-xs text-slate-400">These are <em>model</em> graphs of an idealised motion with constant acceleration. A real experiment would give scattered measurements. The textbook draws motion in one direction only; the turning-back scenario is a LabVerse enrichment.</p>
      </main>
    </div>
  );
};
