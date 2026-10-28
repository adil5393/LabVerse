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
import { physicsChapterSummaries } from '../../../engine/physics/chapterSummary';

const Crumb: React.FC<{ last: string; middle?: { to: string; label: string } }> = ({ last, middle }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    {middle ? <><Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span><Link to={middle.to} className="inline-flex items-center min-h-[44px] hover:text-sky-400">{middle.label}</Link><span>/</span></> : null}
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

export const PhysicsHub: React.FC = () => {
  const sum = Object.fromEntries(physicsChapterSummaries().map((x) => [x.id, x.line]));
  return (
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
          <p className="text-sm text-slate-300">Position, displacement, speed and velocity, acceleration, graphs, equations of motion and circular motion, with four laboratories. {sum.motion}</p>
        </Link>
        <Link to="/physics/forces" data-chapter-card="forces" className="block rounded-2xl border border-indigo-400/40 bg-surface-card hover:border-indigo-300 p-5 space-y-2 min-h-[120px]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">Class 9 · Chapter 6</span>
          <h2 className="text-xl font-black text-white">How Forces Affect Motion</h2>
          <p className="text-sm text-slate-300">Forces, friction and Newton&apos;s three laws, with a Force Laboratory and momentum. {sum.forces}</p>
        </Link>
        <Link to="/physics/work" data-chapter-card="work" className="block rounded-2xl border border-amber-400/40 bg-surface-card hover:border-amber-300 p-5 space-y-2 min-h-[120px]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">Class 9 · Chapter 7</span>
          <h2 className="text-xl font-black text-white">Work, Energy, and Simple Machines</h2>
          <p className="text-sm text-slate-300">Work, energy, power and simple machines, with five laboratories. {sum.work}</p>
        </Link>
        <Link to="/physics/sound" data-chapter-card="sound" className="block rounded-2xl border border-teal-400/40 bg-surface-card hover:border-teal-300 p-5 space-y-2 min-h-[120px]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-bold">Class 9 · Chapter 10</span>
          <h2 className="text-xl font-black text-white">Sound Waves</h2>
          <p className="text-sm text-slate-300">Vibration, how sound travels, compressions and rarefactions, with a Vibration Laboratory and a Wave Laboratory. {sum.sound}</p>
        </Link>
      </div>
    </main>
  </div>
  );
};

export const MotionHub: React.FC = () => {
  const solved = solvedExerciseNumbers().length;
  const counts = motionCoverageCounts();
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

        <section aria-label="Ways to learn" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="motion-destinations">
          <div className="rounded-2xl border border-sky-500/50 bg-gradient-to-b from-sky-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #38BDF8" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-sky-400">school</span>
                <h2 className="text-lg font-black text-white">Learn</h2>
              </div>
              <p className="text-xs text-slate-300">10 lessons in 5 units, with prerequisites, worked examples and practice.</p>
            </div>
            <a href="#learn" data-destination="learn" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-slate-950 font-black text-sm shadow-sm transition-all touch-manipulation">Start learning</a>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #F59E0B" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400">science</span>
                <h2 className="text-lg font-black text-white">Free Laboratory</h2>
              </div>
              <p className="text-xs text-slate-300">Move an object on a track and see distance and displacement. No gates.</p>
            </div>
            <Link to="/physics/motion/lab" data-destination="lab" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the laboratory</Link>
          </div>

          <div className="rounded-2xl border border-pink-500/40 bg-gradient-to-b from-pink-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #F472B6" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-pink-400">show_chart</span>
                <h2 className="text-lg font-black text-white">Motion Graph Studio</h2>
              </div>
              <p className="text-xs text-slate-300">Position–time, velocity–time and acceleration–time graphs drawn from one motion, with a time cursor and live numbers.</p>
            </div>
            <Link to="/physics/motion/graphs" data-destination="graphs" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the Graph Studio</Link>
          </div>

          <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-b from-orange-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #FB923C" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-orange-400">functions</span>
                <h2 className="text-lg font-black text-white">Equation Laboratory</h2>
              </div>
              <p className="text-xs text-slate-300">v = u + at, s = ut + ½at² and v² = u² + 2as with your own numbers, signs and graphs.</p>
            </div>
            <Link to="/physics/motion/equations" data-destination="equations" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the Equation Laboratory</Link>
          </div>

          <div className="rounded-2xl border border-teal-500/40 bg-gradient-to-b from-teal-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #2DD4BF" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-teal-400">refresh</span>
                <h2 className="text-lg font-black text-white">Circular Motion</h2>
              </div>
              <p className="text-xs text-slate-300">Constant speed on a circle: distance along the arc, the straight-line displacement and the turning velocity.</p>
            </div>
            <Link to="/physics/motion/circular" data-destination="circular" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the circular motion lab</Link>
          </div>

          <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-b from-violet-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #A78BFA" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-violet-400">assignment</span>
                <h2 className="text-lg font-black text-white">NCERT Exercises</h2>
              </div>
              <p className="text-xs text-slate-300">All {solved} of {MOTION_EXERCISES.length} questions, with every part, solved step by step.</p>
            </div>
            <Link to="/physics/motion/exercises" data-destination="exercises" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the exercises</Link>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: "4px solid #34D399" }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">task_alt</span>
                <h2 className="text-lg font-black text-white">Chapter Practice</h2>
              </div>
              <p className="text-xs text-slate-300">{PRACTICE_ITEMS.length} original questions on the whole chapter. Open to everyone, in any order; no prerequisites, no login.</p>
            </div>
            <Link to="/physics/motion/practice" data-destination="practice" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open Chapter Practice</Link>
            <Link to="/physics/motion/assessment" data-destination="assessment" className="min-h-[46px] inline-flex items-center justify-center rounded-xl border border-emerald-500/50 text-emerald-200 hover:bg-emerald-950/40 font-bold text-sm transition-colors touch-manipulation">Take the chapter assessment</Link>
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
