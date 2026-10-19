/**
 * Chapter 6 hub (/physics/forces), lesson page and NCERT Exercises page (PHY-2A). The hub lists the four established
 * destinations; Chapter Practice and the later units are marked Upcoming and are not links.
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { FORCES_CHAPTER } from '../../../engine/physics/forces/learn/content';
import { FORCES_MAP, FORCES_TEXTBOOK, forcesCoverageCounts } from '../../../engine/physics/forces/curriculum';
import { FORCE_EXERCISES, solvedForceExerciseNumbers, type ForceExercise, type Illustration } from '../../../engine/physics/forces/exercises';
import { lessonStatus, STATUS_LABEL } from '../../../engine/education/progress';
import type { LearningStatus } from '../../../engine/education/types';
import { useEducationStore } from '../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../education/Intro';
import { LearnLessonPage } from '../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../education/Prerequisites';
import { VisualRegistryProvider, type VisualRegistry } from '../../education/visuals';
import { ForceArrowsVisual, ForceCartView, ForceCartVisual } from './ForceCart';
import { ForceFigure } from './ForceFigure';
import { PHYS } from '../motion/physicsColors';
import { netArrow } from '../../../engine/physics/forces/forceDiagram';
import { toArrows } from '../../../engine/physics/forces/learn/questions';

export const FORCE_VISUALS: VisualRegistry = { forceCart: ForceCartVisual, forceArrows: ForceArrowsVisual };

const CRUMB = 'How Forces Affect Motion';

export const ForcesLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={FORCES_CHAPTER} registry={FORCE_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

const TONE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400', in_progress: 'border-cyan-500/40 text-cyan-300', completed: 'border-emerald-500/40 text-emerald-300',
  demonstrated: 'border-violet-500/40 text-violet-300', mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/10', needs_review: 'border-amber-500/40 text-amber-300',
};

const ForcesLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = FORCES_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  return (
    <VisualRegistryProvider value={FORCE_VISUALS}>
      <section id="learn" aria-label="Learn" className="space-y-6" data-testid="forces-learn-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Learn: Forces and friction</h2>
            <p className="text-sm text-slate-300 max-w-3xl">What is a force, how do forces add up, why do balanced forces not change velocity, and what does friction do? Short explanations, a cart you can push, worked examples and problems of your own. You can skip any prerequisite refresher and still start any lesson.</p>
          </div>
          <Link data-testid="forces-start-learning" to={ch.routes.learn(next.id)} className="min-h-[48px] px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm inline-flex items-center">{started ? `Continue Learn: Lesson ${next.number}` : 'Start Learn: Lesson 1'}</Link>
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
        <div className="rounded-2xl border border-dashed border-surface-border p-4 space-y-1" data-testid="forces-upcoming-units">
          <h3 className="text-sm font-black text-slate-300">Upcoming units</h3>
          <p className="text-xs text-slate-400">Newton&apos;s first law (Section 6.4), Newton&apos;s second law (6.5), Newton&apos;s third law (6.6) and forces on a system of objects (6.7) are upcoming. They are not available yet.</p>
        </div>
      </section>
    </VisualRegistryProvider>
  );
};

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    {last === 'How Forces Affect Motion' ? null : <><Link to="/physics/forces" className="inline-flex items-center min-h-[44px] hover:text-sky-400">How Forces Affect Motion</Link><span>/</span></>}
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

export const ForcesHub: React.FC = () => {
  const solved = solvedForceExerciseNumbers().length;
  const counts = forcesCoverageCounts();
  const card = 'rounded-2xl border bg-surface-card p-5 space-y-2 flex flex-col justify-between min-h-[150px]';
  const btn = 'min-h-[44px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-bold text-sm border border-surface-border';
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        <Crumb last="How Forces Affect Motion" />
        <header className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">{FORCES_TEXTBOOK.book} ({FORCES_TEXTBOOK.edition}) · Chapter {FORCES_TEXTBOOK.chapterNumber}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{FORCES_TEXTBOOK.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">Learn what a force is, how forces add up, why balanced forces do not change velocity, and what friction does. Newton&apos;s three laws are upcoming.</p>
        </header>

        <section aria-label="Ways to learn" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="forces-destinations">
          <div className={`${card} border-sky-500/40`} style={{ borderTop: '4px solid #38BDF8' }}>
            <div><h2 className="text-lg font-black text-white">Learn</h2><p className="text-xs text-slate-300">3 lessons in 2 units, with prerequisites, worked examples and practice.</p></div>
            <a href="#learn" data-destination="learn" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Start learning</a>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: '4px solid #818CF8' }}>
            <div><h2 className="text-lg font-black text-white">Free Laboratory</h2><p className="text-xs text-slate-300">Push a cart, change the mass and the surface, and see the force arrows. Five optional investigations. No gates.</p></div>
            <Link to="/physics/forces/lab" data-destination="lab" className={btn}>Open the laboratory</Link>
          </div>
          <div className={`${card} border-surface-border`} style={{ borderTop: '4px solid #A78BFA' }}>
            <div><h2 className="text-lg font-black text-white">NCERT Exercises</h2><p className="text-xs text-slate-300">{solved} of {FORCE_EXERCISES.length} questions solved step by step; the rest are upcoming.</p></div>
            <Link to="/physics/forces/exercises" data-destination="exercises" className={btn}>Open the exercises</Link>
          </div>
          <div className={`${card} border-dashed border-surface-border opacity-80`} aria-disabled="true" data-destination="practice">
            <div><h2 className="text-lg font-black text-slate-300">Chapter Practice</h2><p className="text-xs text-slate-400">Upcoming. Chapter-wide practice will arrive once Newton&apos;s laws are built. Each lesson already has its own independent practice.</p></div>
            <span className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-surface-border text-slate-400 font-bold text-sm">Upcoming</span>
          </div>
        </section>

        <ForcesLearnSection />

        <details aria-label="Chapter map" className="group rounded-2xl border border-surface-border bg-surface-card/50 p-4 space-y-3" data-testid="forces-map">
          <summary className="cursor-pointer min-h-[44px] flex flex-wrap items-center justify-between gap-2 list-none">
            <span className="text-xl font-black text-white">Chapter map <span className="text-xs font-mono font-normal text-slate-400">(optional reference: what is built and what is upcoming)</span></span>
            <span className="text-xs font-mono text-slate-300">{counts.available} available · {counts.planned} upcoming <span aria-hidden>{'▾'}</span></span>
          </summary>
          <p className="text-xs text-slate-400">Checked against the textbook PDF. Rows marked enrichment are LabVerse additions that are not in the book. Upcoming rows are not built yet.</p>
          <div className="overflow-x-auto rounded-xl border border-surface-border" role="region" aria-label="Chapter map table" tabIndex={0}>
            <table className="w-full text-xs">
              <caption className="sr-only">Chapter 6 topics, their sections, source and status in LabVerse.</caption>
              <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Section</th><th scope="col" className="p-2 text-left">Topic</th><th scope="col" className="p-2 text-left">Source</th><th scope="col" className="p-2 text-left">Status</th></tr></thead>
              <tbody>
                {FORCES_MAP.map((r) => (
                  <tr key={r.id} className="border-t border-surface-border align-top" data-map-row={r.id}>
                    <td className="p-2 font-mono text-slate-300 whitespace-nowrap">{r.section}</td>
                    <td className="p-2 text-slate-200">{r.topic}{r.note ? <span className="text-slate-400"> {r.note}</span> : null}</td>
                    <td className="p-2 text-slate-300">{r.kind === 'textbook' ? 'Textbook' : 'LabVerse enrichment'}</td>
                    <td className="p-2 font-mono font-bold" data-status={r.status} style={{ color: r.status === 'planned' ? '#94A3B8' : r.status === 'laboratory' ? '#38BDF8' : '#34D399' }}>{r.status === 'planned' ? `○ Upcoming${r.milestone ? ` (${r.milestone})` : ''}` : r.status === 'laboratory' ? '◆ Laboratory' : '✓ Learn'}</td>
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

const IllustrationView: React.FC<{ ill: Illustration; id: string }> = ({ ill, id }) => {
  const arrows = ill.kind === 'arrows' ? toArrows(ill.object, ill.forces) : [];
  return (
    <figure className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-illustration={ill.kind} data-illustration-id={id}>
      <figcaption className="text-xs text-slate-300"><strong style={{ color: PHYS.prediction }}>Interactive illustration. </strong>{ill.caption}</figcaption>
      {ill.kind === 'arrows' && <ForceFigure object={ill.object} arrows={arrows} net={netArrow(arrows)} showIndividual showNet={ill.showNet} alt={ill.caption} />}
      {ill.kind === 'cart' && <ForceCartView initial={ill.setup} editable={false} startTime={ill.t} alt={ill.caption} />}
    </figure>
  );
};

type Stage = 0 | 1 | 2 | 3;

const Solution: React.FC<{ ex: ForceExercise }> = ({ ex }) => {
  const sol = ex.solution!;
  const [stage, setStage] = useState<Stage>(0);
  const btn = 'min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm font-bold';
  return (
    <div className="space-y-3 pt-3" data-solution={ex.number}>
      <p className="text-sm text-slate-200"><strong>Try yourself first.</strong> Work it out on paper, then reveal help one step at a time.</p>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5" aria-label="Given">{sol.given.map((g) => <li key={g}>{g}</li>)}</ul>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5" aria-label="To find">{sol.find.map((g) => <li key={g}><strong>Find: </strong>{g}</li>)}</ul>
      {sol.assumptions?.map((a) => <p key={a} className="text-xs" style={{ color: PHYS.distance }}>Assumption: {a}</p>)}
      {stage < 1 && <button type="button" className={btn} onClick={() => setStage(1)}>Show a hint</button>}
      {stage >= 1 && <p className="text-sm rounded-lg px-3 py-2 border" style={{ color: '#fef9c3', borderColor: `${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }} data-testid="hint"><strong>Hint: </strong>{sol.hint}</p>}
      {stage === 1 && <button type="button" className={btn} onClick={() => setStage(2)}>Show step-by-step reasoning</button>}
      {stage >= 2 && (
        <div className="space-y-2" data-testid="steps">
          <p className="text-sm text-slate-100"><strong>Principle: </strong>{sol.principle}</p>
          {sol.formulas && <ul className="text-xs text-slate-200 space-y-0.5" aria-label="Formulas chosen">{sol.formulas.map((f) => <li key={f.formula}><span className="font-mono font-bold" style={{ color: PHYS.acceleration }}>{f.formula}</span> <span className="text-slate-400">: {f.why}</span></li>)}</ul>}
          <ol className="space-y-2">{sol.steps.map((s, i) => <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2 text-sm text-slate-200"><span className="font-mono mr-2" style={{ color: PHYS.distance }}>{i + 1}.</span>{s.text}<div className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</div></li>)}</ol>
        </div>
      )}
      {stage === 2 && <button type="button" className={btn} onClick={() => setStage(3)}>Show the final answer</button>}
      {stage >= 3 && (
        <div className="space-y-3" data-testid="answers">
          {sol.answers.map((a) => <p key={a.label} data-part={a.part ?? 'answer'} className="text-sm rounded-xl border px-3 py-2" style={{ color: '#d1fae5', borderColor: `${PHYS.correct}66`, background: `${PHYS.correct}0D` }}><strong>{'✓ '}{a.label}: </strong>{a.value}</p>)}
          <p className="text-sm text-slate-200" data-testid="explanation"><strong>What it means: </strong>{sol.explanation}</p>
          <div className="text-xs text-slate-300 space-y-1" data-testid="common-mistakes"><strong style={{ color: PHYS.error }}>Common mistakes</strong><ul className="list-disc pl-5">{sol.commonMistakes.map((m) => <li key={m.mistake}>{m.mistake} <span className="text-slate-400">{m.fix}</span></li>)}</ul></div>
          <p className="text-[11px] text-slate-400">Verification: {sol.verification.method}</p>
          {sol.illustrations && <div className="space-y-3" data-testid="illustrations">{sol.illustrations.map((ill, i) => <IllustrationView key={i} ill={ill} id={`${ex.number}-${i + 1}`} />)}</div>}
          <div className="flex flex-wrap gap-2" data-testid="exercise-labs">{sol.labs?.map((l) => <Link key={l.href} to={l.href} className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Explore in the lab: {l.label}</Link>)}</div>
          {sol.labNote && <p className="text-[11px] text-slate-400" data-testid="lab-note">Why no matching laboratory: {sol.labNote}</p>}
          <p className="text-[11px] text-slate-400">Lessons for this question: {ex.lessonIds.map((id, i) => <span key={id}>{i ? ', ' : ''}<Link className="underline hover:text-sky-300" to={`/physics/forces/learn/${id}`}>{id.replace('pf-l', 'Lesson ')}</Link></span>)}</p>
        </div>
      )}
    </div>
  );
};

export const ForcesExercises: React.FC = () => {
  const solved = solvedForceExerciseNumbers();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces-exercises">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Crumb last="NCERT Exercises" />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">NCERT Exercises: Chapter 6</h1>
          <p className="text-sm text-slate-300">The chapter ends with sixteen questions (“Revise, Reflect, Refine”), listed here with their textbook numbers. The summaries are in our own words; open the textbook for the exact wording. {solved.length} of 16 have step-by-step solutions so far (questions {solved.join(', ')}); the others are upcoming, with the milestone that will cover them, and show no solution.</p>
          <p className="text-xs text-slate-400">Viewing a solution never counts toward mastery. Practise first, then check.</p>
        </header>
        <ol className="space-y-3">
          {FORCE_EXERCISES.map((ex) => (
            <li key={ex.number} data-exercise={ex.number} className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-mono text-slate-400">Question {ex.number} · {ex.topic} · Section {ex.sections.join(', ')}</div>
                  <p className="text-sm text-slate-100">{ex.summary}</p>
                  {ex.parts && <p className="text-[11px] text-slate-400">Parts: {ex.parts.map((p) => p.label).join('; ')}</p>}
                </div>
                {ex.status === 'solved'
                  ? <button type="button" aria-expanded={open === ex.number} onClick={() => setOpen(open === ex.number ? null : ex.number)} className="min-h-[44px] px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm" data-testid={`open-${ex.number}`}>{open === ex.number ? 'Close' : 'Open solution'}</button>
                  : <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-surface-border text-slate-400" data-status="upcoming">Upcoming ({ex.milestone})</span>}
              </div>
              {ex.status === 'solved' && open === ex.number && <Solution ex={ex} />}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};
