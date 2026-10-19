/**
 * Chapter-neutral landing page. Learn is the recommended path; the Free
 * Laboratory and Chapter Practice are always one tap away and never gated.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { lessonStatus, STATUS_LABEL } from '../../engine/education/progress';
import type { EduChapter, JudgeRegistry, LearningStatus } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from './Intro';
import { ChapterPrerequisites, UnitPrerequisites } from './Prerequisites';
import { JudgeProvider } from './judges';
import { VisualRegistryProvider, type VisualRegistry } from './visuals';

const DONE: LearningStatus[] = ['completed', 'mastered'];
const STATUS_STYLE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400',
  in_progress: 'border-cyan-500/40 text-cyan-300',
  completed: 'border-emerald-500/40 text-emerald-300',
  demonstrated: 'border-violet-500/40 text-violet-300',
  mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/10',
  needs_review: 'border-amber-500/40 text-amber-300',
};

export const ChapterHub: React.FC<{ chapter: EduChapter; registry: VisualRegistry; judges?: JudgeRegistry; crumb: string; subtitle: string; labLabel: string; labBlurb: string }> = ({ chapter, registry, judges = {}, crumb, subtitle, labLabel, labBlurb }) => {
  const lessons = useEducationStore((s) => s.lessons);
  const reset = useEducationStore((s) => s.resetEducation);
  const [confirm, setConfirm] = useState(false);
  const ordered = chapter.units.flatMap((u) => u.lessonIds.map((id) => chapter.lessons[id]));
  const statuses = Object.fromEntries(ordered.map((l) => [l.id, lessonStatus(l, lessons[l.id])])) as Record<string, LearningStatus>;
  const next = ordered.find((l) => !DONE.includes(statuses[l.id])) ?? ordered[0];
  const started = ordered.some((l) => statuses[l.id] !== 'not_started');
  const doneCount = ordered.filter((l) => DONE.includes(statuses[l.id])).length;
  const masteredCount = ordered.filter((l) => statuses[l.id] === 'mastered').length;
  const nextStatus = statuses[next.id];

  return (
    <VisualRegistryProvider value={registry}>
    <JudgeProvider value={judges}>
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid" data-chapter={chapter.id}>
      <GlobalHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 space-y-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/" className="hover:text-amber-400">Subject Explorer</Link><span>/</span>
          <Link to="/mathematics" className="hover:text-amber-400">Mathematics</Link><span>/</span>
          <span className="text-amber-400 font-bold">{crumb}</span>
        </nav>

        <header className="space-y-2">
          <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">NCERT Ganita Manjari · Class {chapter.classGrade}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{chapter.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">{subtitle}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-12">
          <section className="lg:col-span-6 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-surface-card to-surface-lowest p-5 md:p-7 space-y-3" aria-label="Learn">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">Guided learning path</span>
            <h2 className="text-xl md:text-2xl font-black text-white">{started ? 'Continue' : 'Start'}: Lesson {next.number}, {next.title}</h2>
            <p className="text-sm text-slate-300">{next.objective.charAt(0).toUpperCase() + next.objective.slice(1)}</p>
            <p className="text-xs font-mono text-slate-400" data-testid="path-progress">{doneCount} of {ordered.length} lessons completed · {masteredCount} mastered · next lesson: {STATUS_LABEL[nextStatus]}</p>
            <Link data-testid="start-learning" to={chapter.routes.learn(next.id)} className="min-h-[52px] w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
              {started ? `Continue Lesson ${next.number}` : 'Start Lesson 1'}
            </Link>
          </section>

          <section className="lg:col-span-3 rounded-3xl border border-surface-border bg-surface-card p-5 space-y-3 flex flex-col" aria-label="Free laboratory">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Open workbench</span>
            <h2 className="text-lg font-black text-white">{labLabel}</h2>
            <p className="text-sm text-slate-300 flex-1">{labBlurb}</p>
            <Link data-testid="open-lab" to={chapter.routes.lab} className="min-h-[48px] rounded-xl border border-cyan-400 text-cyan-200 font-bold text-sm flex items-center justify-center hover:bg-cyan-500/10">Open laboratory</Link>
          </section>

          <section className="lg:col-span-3 rounded-3xl border border-surface-border bg-surface-card p-5 space-y-3 flex flex-col" aria-label="Chapter practice">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Practise</span>
            <h2 className="text-lg font-black text-white">Chapter practice</h2>
            <p className="text-sm text-slate-300 flex-1">Mixed problems from every lesson, in any order, with no need to finish lessons first.</p>
            {chapter.routes.practice
              ? <Link data-testid="open-practice" to={chapter.routes.practice} className="min-h-[48px] rounded-xl border border-emerald-400 text-emerald-200 font-bold text-sm flex items-center justify-center hover:bg-emerald-500/10">Start practising</Link>
              : <span className="text-xs text-slate-500">Available from the chapter hub.</span>}
          </section>
        </div>

        <ChapterIntroduction chapter={chapter} />
        <ChapterPrerequisites chapter={chapter} />

        <section aria-label="Units and lessons" className="space-y-6">
          <h2 className="text-xl font-black text-white">Lessons</h2>
          {chapter.units.map((u) => (
            <div key={u.id} className="space-y-3" data-unit={u.id}>
              <UnitIntroduction unit={u} />
              <details className="rounded-xl border border-surface-border bg-surface-card px-4 py-2">
                <summary className="cursor-pointer min-h-[44px] flex items-center text-sm text-slate-200 font-medium">Before Unit {u.number}: ideas this unit uses (optional)</summary>
                <div className="pt-3"><UnitPrerequisites chapter={chapter} unitId={u.id} /></div>
              </details>
              <ol className="grid gap-2 md:grid-cols-2">
                {u.lessonIds.map((id) => {
                  const l = chapter.lessons[id];
                  const st = statuses[id];
                  return (
                    <li key={id}>
                      <Link to={chapter.routes.learn(id)} data-lesson-link={id} className="block min-h-[64px] rounded-2xl border border-surface-border bg-surface-card hover:border-amber-400/60 p-4 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-slate-400">Lesson {l.number}</span>
                          <span data-status={st} className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLE[st]}`}>{STATUS_LABEL[st]}</span>
                        </div>
                        <div className="font-bold text-white">{l.title}</div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </section>

        <footer className="pt-4 border-t border-surface-border text-xs text-slate-400 space-y-2">
          <p>Progress is saved only on this device. It records what you actually did: reading a lesson, skipping a check or clicking Next never counts as mastery.</p>
          {!confirm
            ? <button type="button" onClick={() => setConfirm(true)} className="min-h-[44px] px-3 rounded-lg border border-surface-border hover:border-red-400/50 hover:text-red-300">Reset all learning progress</button>
            : <span className="inline-flex items-center gap-2"><span className="text-red-300">Erase progress on this device?</span><button type="button" onClick={() => { reset(); setConfirm(false); }} className="min-h-[44px] px-3 rounded-lg bg-red-500 text-slate-950 font-bold">Yes, erase</button><button type="button" onClick={() => setConfirm(false)} className="min-h-[44px] px-3 rounded-lg border border-surface-border">Cancel</button></span>}
        </footer>
      </main>
    </div>
    </JudgeProvider>
    </VisualRegistryProvider>
  );
};
