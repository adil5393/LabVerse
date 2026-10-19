/**
 * NCERT Exercises for Chapter 4 (PHY-1E). All sixteen questions, with every part, have a verified solution that
 * follows: Try yourself, Hint, Step-by-step reasoning, Final answer, Explore in the lab. Illustrations appear
 * only after the final answer, so the student can try first. Nothing on this page is recorded or counts toward
 * mastery: viewing a solution never grants it.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { exerciseCoverage, MOTION_EXERCISES, type Illustration, type MotionExercise } from '../../../engine/physics/motion/exercises';
import { CircularMotionView } from './CircularMotion';
import { GraphStudioView } from './MotionGraphs';
import { MotionTrackView } from './MotionTrack';
import { PHYS } from './physicsColors';

type Stage = 0 | 1 | 2 | 3;

const IllustrationView: React.FC<{ ill: Illustration; id: string }> = ({ ill, id }) => (
  <figure className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-illustration={ill.kind} data-illustration-id={id}>
    <figcaption className="text-xs text-slate-300"><strong style={{ color: PHYS.prediction }}>Interactive illustration. </strong>{ill.caption}</figcaption>
    {ill.kind === 'graph' && <GraphStudioView profile={ill.profile} graphs={ill.graphs} shade={ill.shade} alt={ill.caption} />}
    {ill.kind === 'track' && <MotionTrackView range={ill.range} start={ill.start} moves={ill.moves} durations={ill.durations} editable={false} show={['position', 'distance', 'displacement', 'speed', 'velocity']} stepM={5} playback alt={ill.caption} />}
    {ill.kind === 'circle' && <CircularMotionView radiusM={ill.radiusM} periodS={ill.periodS} startTime={ill.startTime} editable={false} alt={ill.caption} />}
  </figure>
);

const Solution: React.FC<{ ex: MotionExercise }> = ({ ex }) => {
  const sol = ex.solution;
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
          {sol.formulas && (
            <ul className="text-xs text-slate-200 space-y-0.5" aria-label="Formulas chosen">
              {sol.formulas.map((f) => <li key={f.formula}><span className="font-mono font-bold" style={{ color: PHYS.acceleration }}>{f.formula}</span> <span className="text-slate-400">: {f.why}</span></li>)}
            </ul>
          )}
          <ol className="space-y-2">
            {sol.steps.map((s, i) => <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2 text-sm text-slate-200"><span className="font-mono mr-2" style={{ color: PHYS.distance }}>{i + 1}.</span>{s.text}<div className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</div></li>)}
          </ol>
        </div>
      )}
      {stage === 2 && <button type="button" className={btn} onClick={() => setStage(3)}>Show the final answer</button>}
      {stage >= 3 && (
        <div className="space-y-3" data-testid="answers">
          {sol.answers.map((a) => <p key={a.label} data-part={a.part ?? 'answer'} className="text-sm rounded-xl border px-3 py-2" style={{ color: '#d1fae5', borderColor: `${PHYS.correct}66`, background: `${PHYS.correct}0D` }}><strong>{'✓ '}{a.label}: </strong>{a.value}</p>)}
          <p className="text-sm text-slate-200" data-testid="explanation"><strong>What it means: </strong>{sol.explanation}</p>
          <p className="text-[11px] text-slate-400">Verification: {sol.verification.method}</p>
          {sol.illustrations && <div className="space-y-3" data-testid="illustrations">{sol.illustrations.map((ill, i) => <IllustrationView key={i} ill={ill} id={`${ex.number}-${i + 1}`} />)}</div>}
          <div className="flex flex-wrap gap-2" data-testid="exercise-labs">
            {sol.labs?.map((l) => <Link key={l.href} to={l.href} className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Explore in the lab: {l.label}</Link>)}
          </div>
          {sol.labNote && <p className="text-[11px] text-slate-400" data-testid="lab-note">Why no matching laboratory: {sol.labNote}</p>}
          <p className="text-[11px] text-slate-400">Lessons for this question: {ex.lessonIds.map((id, i) => <span key={id}>{i ? ', ' : ''}<Link className="underline hover:text-sky-300" to={`/physics/motion/learn/${id}`}>{id.replace('pm-l', 'Lesson ')}</Link></span>)}</p>
        </div>
      )}
    </div>
  );
};

export const MotionExercises: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const cov = exerciseCoverage();
  const partsTotal = cov.reduce((n, c) => n + Math.max(1, c.partIds.length), 0);
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="motion-exercises">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
          <Link to="/physics/motion" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Describing Motion</Link><span>/</span>
          <span className="text-sky-300 font-bold">NCERT Exercises</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">NCERT Exercises: Chapter 4</h1>
          <p className="text-sm text-slate-300">The chapter ends with sixteen questions (“Revise, Reflect, Refine”). They are listed here with their textbook numbers. The summaries are in our own words; open the textbook for the exact wording. All {MOTION_EXERCISES.length} questions, with every part, have a step-by-step solution ({partsTotal} answers in all). Where a graph is only printed in the book, the values are read from the figure and are labelled as such.</p>
          <p className="text-xs text-slate-400">Viewing a solution never counts toward mastery. Practise first, then check. For fresh questions try <Link className="underline hover:text-sky-300" to="/physics/motion/practice">Chapter Practice</Link>.</p>
        </header>
        <ol className="space-y-3">
          {MOTION_EXERCISES.map((ex) => (
            <li key={ex.number} data-exercise={ex.number} className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-mono text-slate-400">Question {ex.number} · {ex.topic} · Section {ex.sections.join(', ')} · {ex.solution.kind}</div>
                  <p className="text-sm text-slate-100">{ex.summary}</p>
                  {ex.parts && <p className="text-[11px] text-slate-400">Parts: {ex.parts.map((p) => p.label).join('; ')}</p>}
                </div>
                <button type="button" aria-expanded={open === ex.number} onClick={() => setOpen(open === ex.number ? null : ex.number)} className="min-h-[44px] px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm" data-testid={`open-${ex.number}`}>{open === ex.number ? 'Close' : 'Open solution'}</button>
              </div>
              {open === ex.number && <Solution ex={ex} />}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};
