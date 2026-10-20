/**
 * Chapter 7 hub (/physics/work), lesson page and NCERT Exercises page (PHY-3A). The hub lists the destinations that work
 * (Learn, Free Laboratory, NCERT Exercises); Chapter Practice and the later units are marked Upcoming and are not links.
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { WORK_CHAPTER } from '../../../engine/physics/work/learn/content';
import { WORK_MAP, WORK_TEXTBOOK, workCoverageCounts } from '../../../engine/physics/work/curriculum';
import { WORK_PRACTICE_ITEMS } from '../../../engine/physics/work/practice';
import { WORK_EXERCISES, exerciseSolved, workExerciseCounts, type WorkExercisePart } from '../../../engine/physics/work/exercises';
import { lessonStatus, STATUS_LABEL } from '../../../engine/education/progress';
import type { LearningStatus } from '../../../engine/education/types';
import { useEducationStore } from '../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../education/Intro';
import { LearnLessonPage } from '../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../education/Prerequisites';
import { VisualRegistryProvider } from '../../education/visuals';
import { PHYS } from '../motion/physicsColors';
import { ExerciseIllustrationView } from './ExerciseIllustration';
import { WORK_VISUALS } from './visuals';

const CRUMB = 'Work, Energy, and Simple Machines';

export const WorkLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={WORK_CHAPTER} registry={WORK_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

const TONE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400', in_progress: 'border-cyan-500/40 text-cyan-300', completed: 'border-emerald-500/40 text-emerald-300',
  demonstrated: 'border-violet-500/40 text-violet-300', mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/10', needs_review: 'border-amber-500/40 text-amber-300',
};

const WorkLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = WORK_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  return (
    <VisualRegistryProvider value={WORK_VISUALS}>
      <section id="learn" aria-label="Learn" className="space-y-6" data-testid="work-learn-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Learn: Work, energy, power and machines</h2>
            <p className="text-sm text-slate-300 max-w-3xl">When does a force really do work in physics, and how does work change energy, and why is the mechanical energy conserved? Why is the kinetic energy one half the mass times the speed squared, and the potential energy mgh? Short explanations, a scene you can change, worked examples and problems of your own. You can skip any prerequisite refresher and still start any lesson.</p>
          </div>
          <Link data-testid="work-start-learning" to={ch.routes.learn(next.id)} className="min-h-[48px] px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm inline-flex items-center">{started ? `Continue Learn: Lesson ${next.number}` : 'Start Learn: Lesson 1'}</Link>
        </div>
        <ChapterIntroduction chapter={ch} />
        <ChapterPrerequisites chapter={ch} />
        {ch.units.map((u) => (
          <div key={u.id} className="space-y-3" data-learn-unit={u.id}>
            <UnitIntroduction unit={u} />
            <details className="rounded-xl border border-surface-border bg-surface-card px-4 py-2">
              <summary className="cursor-pointer min-h-[44px] flex items-center text-sm text-slate-200 font-medium">Before Unit {u.number}: ideas this unit uses (optional)</summary>
              <div className="pt-3"><UnitPrerequisites chapter={ch} unitId={u.id} /></div>
            </details>
            <ol className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {u.lessonIds.map((id) => {
                const l = ch.lessons[id]; const st = lessonStatus(l, records[id]);
                return (
                  <li key={id}>
                    <Link to={ch.routes.learn(id)} data-learn-link={id} className="block min-h-[64px] rounded-2xl border border-surface-border bg-surface-card hover:border-sky-400/60 p-4 space-y-1">
                      <div className="flex items-center justify-between gap-2"><span className="text-xs font-mono text-slate-400">Learn · Lesson {l.number}</span><span data-status={st} className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${TONE[st]}`}>{STATUS_LABEL[st]}</span></div>
                      <div className="font-bold text-white">{l.title}</div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
              </section>
    </VisualRegistryProvider>
  );
};

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    {last === CRUMB ? null : <><Link to="/physics/work" className="inline-flex items-center min-h-[44px] hover:text-sky-400">{CRUMB}</Link><span>/</span></>}
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

export const WorkHub: React.FC = () => {
  const counts = workCoverageCounts();
  const ex = workExerciseCounts();
  const card = 'rounded-2xl border bg-surface-card p-5 space-y-2 flex flex-col justify-between min-h-[150px]';
  const btn = 'min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border';
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="work">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        <Crumb last={CRUMB} />
        <header className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">{WORK_TEXTBOOK.book} ({WORK_TEXTBOOK.edition}) · Chapter {WORK_TEXTBOOK.chapterNumber}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{WORK_TEXTBOOK.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">Work and energy: when a force really does work in physics, how to calculate it in joules, how work changes energy, kinetic and potential energy, why the mechanical energy is conserved, power, and how pulleys, ramps and levers make tasks easier without reducing the work.</p>
        </header>

        <section aria-label="Ways to learn" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="work-destinations">
          <div className={`${card} border-sky-500/40`} style={{ borderTop: '4px solid #38BDF8' }}>
            <div><h2 className="text-lg font-black text-white">Learn</h2><p className="text-xs text-slate-300">{WORK_CHAPTER.units.length} units and {Object.keys(WORK_CHAPTER.lessons).length} lessons so far, with prerequisites, worked examples and practice.</p></div>
            <a href="#learn" data-destination="learn" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Start learning</a>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: '4px solid #818CF8' }}>
            <div><h2 className="text-lg font-black text-white">Free Laboratory</h2><p className="text-xs text-slate-300">Work Laboratory: choose a force, its direction and a displacement, and see the signed work of each force. Five optional investigations (A to E). No gates.</p></div>
            <Link to="/physics/work/lab" data-destination="lab" className={btn}>Open the laboratory</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: '4px solid #A78BFA' }}>
            <div><h2 className="text-lg font-black text-white">NCERT Exercises</h2><p className="text-xs text-slate-300">All {ex.questions} questions, with every part ({ex.parts} in all), solved step by step.</p></div>
            <Link to="/physics/work/exercises" data-destination="exercises" className={btn}>Open the exercises</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: '4px solid #34D399' }}>
            <div><h2 className="text-lg font-black text-white">Chapter Practice</h2><p className="text-xs text-slate-300">{WORK_PRACTICE_ITEMS.length} original questions on the whole chapter. Open to everyone, in any order; no prerequisites, no login.</p></div>
            <Link to="/physics/work/practice" data-destination="practice" className={btn}>Open Chapter Practice</Link>
          </div>
        </section>

        <section aria-label="Laboratories" className="space-y-3" data-testid="work-labs">
          <h2 className="text-xl font-black text-white">Laboratories</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[{ to: '/physics/work/lab', d: 'work-lab', t: 'Work Laboratory', x: 'Force, direction and displacement: the signed work of each force.' }, { to: '/physics/work/kinetic', d: 'kinetic-lab', t: 'Work-Energy Laboratory', x: 'A cart under a net force: the area under the force graph is the change in kinetic energy.' }, { to: '/physics/work/energy', d: 'energy-lab', t: 'Energy Laboratory', x: 'Release an object on a ramp or drop it: kinetic, potential and thermal energy, with and without friction.' }, { to: '/physics/work/power', d: 'power-lab', t: 'Power Laboratory', x: 'Change the work and the time: the power P = W \u00F7 t in watts, with a work-time graph.' }, { to: '/physics/work/machines', d: 'machines-lab', t: 'Simple Machines Laboratory', x: 'An inclined plane, a pulley system and a lever, each with its forces, distances and work.' }, { to: '/physics/work/derivations', d: 'derivations', t: 'Derivations', x: 'Step-by-step derivations with your own numbers and missing-step questions.' }].map((l) => (
              <Link key={l.d} to={l.to} data-destination={l.d} className="block rounded-2xl border border-surface-border bg-surface-card hover:border-sky-400/60 p-4 space-y-1 min-h-[96px]"><div className="font-bold text-white">{l.t}</div><p className="text-xs text-slate-300">{l.x}</p></Link>
            ))}
          </div>
        </section>

        <WorkLearnSection />

        <details aria-label="Chapter map" className="group rounded-2xl border border-surface-border bg-surface-card/50 p-4 space-y-3" data-testid="work-map">
          <summary className="cursor-pointer min-h-[44px] flex flex-wrap items-center justify-between gap-2 list-none">
            <span className="text-xl font-black text-white">Chapter map <span className="text-xs font-mono font-normal text-slate-400">(optional reference: what is built and what is upcoming)</span></span>
            <span className="text-xs font-mono text-slate-300">{counts.available} available · {counts.planned} upcoming <span aria-hidden>{'▾'}</span></span>
          </summary>
          <p className="text-xs text-slate-400">Checked against the textbook PDF. Rows marked enrichment are LabVerse additions that are not in the book. Upcoming rows are not built yet.</p>
          <div className="overflow-x-auto rounded-xl border border-surface-border" role="region" aria-label="Chapter map table" tabIndex={0}>
            <table className="w-full text-xs">
              <caption className="sr-only">Chapter 7 topics, their sections, source and status in LabVerse.</caption>
              <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Section</th><th scope="col" className="p-2 text-left">Topic</th><th scope="col" className="p-2 text-left">Source</th><th scope="col" className="p-2 text-left">Status</th></tr></thead>
              <tbody>
                {WORK_MAP.map((r) => (
                  <tr key={r.id} className="border-t border-surface-border align-top" data-map-row={r.id}>
                    <td className="p-2 font-mono text-slate-300 whitespace-nowrap">{r.section}</td>
                    <td className="p-2 text-slate-200">{r.topic}{r.note ? <span className="text-slate-400"> {r.note}</span> : null}</td>
                    <td className="p-2 text-slate-300">{r.kind === 'textbook' ? 'Textbook' : 'LabVerse enrichment'}</td>
                    <td className="p-2 font-mono font-bold" data-status={r.status} style={{ color: r.status === 'planned' ? '#94A3B8' : r.status === 'laboratory' ? '#38BDF8' : '#34D399' }}>{r.status === 'planned' ? '○ Upcoming' : r.status === 'laboratory' ? '◆ Laboratory' : '✓ Learn'}</td>
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

// ---------------------------------------------------------------------------
// NCERT exercises
// ---------------------------------------------------------------------------

type Stage = 0 | 1 | 2 | 3;

const Solution: React.FC<{ qn: number; part: WorkExercisePart }> = ({ qn, part }) => {
  const sol = part.solution!;
  const [stage, setStage] = useState<Stage>(0);
  const btn = 'min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm font-bold';
  return (
    <div className="space-y-3 pt-3" data-solution={`${qn}-${part.id}`}>
      <p className="text-sm text-slate-200"><strong>Try yourself first.</strong> Work it out on paper, then reveal help one step at a time.</p>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5" aria-label="Given">{sol.given.map((g) => <li key={g}>{g}</li>)}</ul>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5" aria-label="To find">{sol.find.map((g) => <li key={g}><strong>Find: </strong>{g}</li>)}</ul>
      {sol.assumptions?.map((a) => <p key={a} className="text-xs" style={{ color: PHYS.distance }}>Assumption: {a}</p>)}
      {stage < 1 && <button type="button" className={btn} onClick={() => setStage(1)}>Show a hint</button>}
      {stage >= 1 && <p className="text-sm rounded-lg px-3 py-2 border" style={{ color: '#fef9c3', borderColor: `${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }} data-testid="hint"><strong>Hint: </strong>{sol.hint}</p>}
      {stage === 1 && <button type="button" className={btn} onClick={() => setStage(2)}>Show the reasoning and the calculation</button>}
      {stage >= 2 && (
        <div className="space-y-2" data-testid="steps">
          <p className="text-sm text-slate-100" data-testid="principle"><strong>Principle: </strong>{sol.principle}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">Reasoning</h4>
          <ol className="space-y-2">{sol.reasoning.map((s, i) => <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2 text-sm text-slate-200"><span className="font-mono mr-2" style={{ color: PHYS.distance }}>{i + 1}.</span>{s.text}<div className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</div></li>)}</ol>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">Calculation</h4>
          <ul className="space-y-1" data-testid="calculation">{sol.calculation.map((c) => <li key={c} className="rounded-lg bg-surface-lowest px-3 py-2 text-sm font-mono text-slate-100">{c}</li>)}</ul>
        </div>
      )}
      {stage === 2 && <button type="button" className={btn} onClick={() => setStage(3)}>Show the final answer</button>}
      {stage >= 3 && (
        <div className="space-y-3" data-testid="answers">
          <p data-part={part.id} className="text-sm rounded-xl border px-3 py-2" style={{ color: '#d1fae5', borderColor: `${PHYS.correct}66`, background: `${PHYS.correct}0D` }}><strong>{'✓ '}Final answer: </strong>{sol.finalAnswer}</p>
          <p className="text-sm text-slate-200" data-testid="meaning"><strong>What it means: </strong>{sol.meaning}</p>
          <p className="text-xs text-slate-300" data-testid="common-mistakes"><strong style={{ color: PHYS.error }}>Common mistake: </strong>{sol.commonMistake}</p>
          <p className="text-[11px] text-slate-400">Verification: {sol.verification}</p>
          {sol.illustrations && <div className="space-y-3" data-testid="illustrations">{sol.illustrations.map((ill, i) => <ExerciseIllustrationView key={i} ill={ill} id={`${qn}-${part.id}-${i + 1}`} />)}</div>}
          <div className="flex flex-wrap gap-2" data-testid="exercise-labs">{sol.lab && <Link to={sol.lab.href} className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Explore in the lab: {sol.lab.label}</Link>}</div>
          {sol.labNote && <p className="text-[11px] text-slate-400" data-testid="lab-note">Why no matching laboratory: {sol.labNote}</p>}
        </div>
      )}
    </div>
  );
};

export const WorkExercises: React.FC = () => {
  const counts = workExerciseCounts();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="work-exercises">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Crumb last="NCERT Exercises" />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">NCERT Exercises: Chapter 7</h1>
          <p className="text-sm text-slate-300">The chapter ends with fifteen questions (&ldquo;Revise, Reflect, Refine&rdquo;), listed here with their textbook numbers and subparts. The summaries are in our own words; open the textbook for the exact wording. All {counts.parts} parts of all {counts.questions} questions have step-by-step solutions.</p>
          <p className="text-xs text-slate-400">Viewing a solution never counts toward mastery. Practise first, then check.</p>
        </header>
        <ol className="space-y-3">
          {WORK_EXERCISES.map((ex) => (
            <li key={ex.number} data-exercise={ex.number} data-complete={exerciseSolved(ex)} className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-3">
              <div className="space-y-1 min-w-0">
                <div className="text-xs font-mono text-slate-400">Question {ex.number} · {ex.topic} · Section {ex.sections.join(', ')}</div>
                <p className="text-sm text-slate-100">{ex.summary}</p>
              </div>
              <ul className="space-y-2">
                {ex.parts.map((p) => {
                  const key = `${ex.number}-${p.id}`;
                  return (
                    <li key={key} data-part-row={key} className="rounded-xl border border-surface-border bg-surface-lowest px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-200 min-w-0">{p.label}</span>
                        {p.status === 'solved'
                          ? <button type="button" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)} className="min-h-[44px] px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm" data-testid={`open-${key}`}>{open === key ? 'Close' : 'Open solution'}</button>
                          : <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-surface-border text-slate-400" data-status="upcoming">Upcoming: needs {p.needs}</span>}
                      </div>
                      {p.status === 'solved' && open === key && <Solution qn={ex.number} part={p} />}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};
