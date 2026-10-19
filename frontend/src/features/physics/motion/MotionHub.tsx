/**
 * Physics hub (/physics) and the Motion chapter hub (/physics/motion).
 * The hub lists chapters; Electricity keeps its own routes, untouched. The Motion hub lists its destinations: Learn, the laboratories, NCERT Exercises and Chapter Practice.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { MOTION_MAP, MOTION_TEXTBOOK, motionCoverageCounts } from '../../../engine/physics/motion/curriculum';
import { solvedExerciseNumbers, MOTION_EXERCISES } from '../../../engine/physics/motion/exercises';
import { PRACTICE_ITEMS } from '../../../engine/physics/motion/practice';
import { MotionLearnSection } from './MotionLearn';

const Crumb: React.FC<{ last: string; middle?: { to: string; label: string } }> = ({ last, middle }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    {middle ? <><Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span><Link to={middle.to} className="inline-flex items-center min-h-[44px] hover:text-sky-400">{middle.label}</Link><span>/</span></> : null}
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

export const PhysicsHub: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="physics-hub">
    <GlobalHeader />
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <Crumb last="Physics" />
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-white">Physics</h1>
        <p className="text-sm text-slate-300 max-w-3xl">Choose a chapter. Every laboratory opens at once: no login, no unlocking.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/physics/motion" data-chapter-card="motion" className="block rounded-2xl border border-sky-500/40 bg-surface-card hover:border-sky-400 p-5 space-y-2 min-h-[120px]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">Class 9 · Chapter 4</span>
          <h2 className="text-xl font-black text-white">Describing Motion Around Us</h2>
          <p className="text-sm text-slate-300">Position, distance, displacement, speed and velocity, with a motion laboratory. Acceleration, graphs, equations of motion and circular motion, with four laboratories.</p>
        </Link>
        <Link to="/physics/electricity" data-chapter-card="electricity" className="block rounded-2xl border border-surface-border bg-surface-card hover:border-sky-400/60 p-5 space-y-2 min-h-[120px]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">Laboratory</span>
          <h2 className="text-xl font-black text-white">Electricity and DC circuits</h2>
          <p className="text-sm text-slate-300">The existing circuit workbench with a real DC solver.</p>
        </Link>
      </div>
    </main>
  </div>
);

export const MotionHub: React.FC = () => {
  const solved = solvedExerciseNumbers().length;
  const counts = motionCoverageCounts();
  const card = 'rounded-2xl border bg-surface-card p-5 space-y-2 flex flex-col justify-between min-h-[150px]';
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="motion">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        <Crumb last="Describing Motion" middle={{ to: '/physics', label: 'Class 9 chapters' }} />
        <header className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">{MOTION_TEXTBOOK.book} ({MOTION_TEXTBOOK.edition}) · Chapter {MOTION_TEXTBOOK.chapterNumber}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{MOTION_TEXTBOOK.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">Learn how to describe the motion of an object in a straight line. Start with position and reference points, then distance, displacement, speed, velocity, acceleration, graphs, the equations of motion and circular motion.</p>
        </header>

        <section aria-label="Ways to learn" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="motion-destinations">
          <div className={`${card} border-sky-500/40`} style={{ borderTop: "4px solid #38BDF8" }}>
            <div><h2 className="text-lg font-black text-white">Learn</h2><p className="text-xs text-slate-300">10 lessons in 5 units, with prerequisites, worked examples and practice.</p></div>
            <a href="#learn" data-destination="learn" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Start learning</a>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: "4px solid #F59E0B" }}>
            <div><h2 className="text-lg font-black text-white">Free Laboratory</h2><p className="text-xs text-slate-300">Move an object on a track and see distance and displacement. No gates.</p></div>
            <Link to="/physics/motion/lab" data-destination="lab" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border">Open the laboratory</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: "4px solid #F472B6" }}>
            <div><h2 className="text-lg font-black text-white">Motion Graph Studio</h2><p className="text-xs text-slate-300">Position–time, velocity–time and acceleration–time graphs drawn from one motion, with a time cursor and live numbers.</p></div>
            <Link to="/physics/motion/graphs" data-destination="graphs" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border">Open the Graph Studio</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: "4px solid #FB923C" }}>
            <div><h2 className="text-lg font-black text-white">Equation Laboratory</h2><p className="text-xs text-slate-300">v = u + at, s = ut + ½at² and v² = u² + 2as with your own numbers, signs and graphs.</p></div>
            <Link to="/physics/motion/equations" data-destination="equations" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border">Open the Equation Laboratory</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: "4px solid #2DD4BF" }}>
            <div><h2 className="text-lg font-black text-white">Circular Motion</h2><p className="text-xs text-slate-300">Constant speed on a circle: distance along the arc, the straight-line displacement and the turning velocity.</p></div>
            <Link to="/physics/motion/circular" data-destination="circular" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border">Open the circular motion lab</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: "4px solid #A78BFA" }}>
            <div><h2 className="text-lg font-black text-white">NCERT Exercises</h2><p className="text-xs text-slate-300">All {solved} of {MOTION_EXERCISES.length} questions, with every part, solved step by step.</p></div>
            <Link to="/physics/motion/exercises" data-destination="exercises" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border">Open the exercises</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: "4px solid #34D399" }}>
            <div><h2 className="text-lg font-black text-white">Chapter Practice</h2><p className="text-xs text-slate-300">{PRACTICE_ITEMS.length} original questions on the whole chapter. Open to everyone, in any order; no prerequisites, no login.</p></div>
            <Link to="/physics/motion/practice" data-destination="practice" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border">Open Chapter Practice</Link>
          </div>
        </section>

        <MotionLearnSection />

        <details aria-label="Chapter map" className="group rounded-2xl border border-surface-border bg-surface-card/50 p-4 space-y-3" data-testid="motion-map">
          <summary className="cursor-pointer min-h-[44px] flex flex-wrap items-center justify-between gap-2 list-none">
            <span className="text-xl font-black text-white">Chapter map <span className="text-xs font-mono font-normal text-slate-400">(optional reference: what is built and what is planned)</span></span>
            <span className="text-xs font-mono text-slate-300">{counts.available} available · {counts.planned} planned <span aria-hidden>{"\u25BE"}</span></span>
          </summary>
          <p className="text-xs text-slate-400">Checked against the textbook PDF. {counts.available} of {counts.total} items are available; {counts.planned} are planned. Rows marked enrichment are LabVerse additions that are not in the book.</p>
          <div className="overflow-x-auto rounded-xl border border-surface-border" role="region" aria-label="Chapter map table" tabIndex={0}>
            <table className="w-full text-xs">
              <caption className="sr-only">Chapter 4 topics, their sections, source and status in LabVerse.</caption>
              <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Section</th><th scope="col" className="p-2 text-left">Topic</th><th scope="col" className="p-2 text-left">Source</th><th scope="col" className="p-2 text-left">Status</th></tr></thead>
              <tbody>
                {MOTION_MAP.map((r) => (
                  <tr key={r.id} className="border-t border-surface-border align-top" data-map-row={r.id}>
                    <td className="p-2 font-mono text-slate-300 whitespace-nowrap">{r.section}</td>
                    <td className="p-2 text-slate-200">{r.topic}{r.note ? <span className="text-slate-400"> {r.note}</span> : null}</td>
                    <td className="p-2 text-slate-300">{r.kind === 'textbook' ? 'Textbook' : 'LabVerse enrichment'}</td>
                    <td className="p-2 font-mono font-bold" data-status={r.status} style={{ color: r.status === 'planned' ? '#94A3B8' : r.status === 'laboratory' ? '#38BDF8' : '#34D399' }}>{r.status === 'planned' ? '\u25CB Planned' : r.status === 'laboratory' ? '\u25C6 Laboratory' : '\u2713 Learn'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </main>
    </div>
  );
};
