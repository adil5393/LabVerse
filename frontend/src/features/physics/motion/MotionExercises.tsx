/**
 * NCERT Exercises for Chapter 4 (foundation). All sixteen questions are listed in the textbook's
 * order. Only those supported by the opening unit have solutions; the rest are marked upcoming and have
 * no solution, hint or answer. Solutions follow Try yourself, Hint, Step-by-step reasoning, Final answer,
 * Explore in the lab. Nothing on this page is recorded or counts toward mastery.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { MOTION_EXERCISES, solvedExerciseNumbers, type MotionExercise } from '../../../engine/physics/motion/exercises';

type Stage = 0 | 1 | 2 | 3;

const Solution: React.FC<{ ex: MotionExercise }> = ({ ex }) => {
  const sol = ex.solution!;
  const [stage, setStage] = useState<Stage>(0);
  const btn = 'min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm font-bold';
  return (
    <div className="space-y-3 pt-3" data-solution={ex.number}>
      <p className="text-sm text-slate-200"><strong>Try yourself first.</strong> Work it out on paper, then reveal help one step at a time.</p>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5">{sol.given.map((g) => <li key={g}>{g}</li>)}</ul>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5">{sol.find.map((g) => <li key={g}><strong>Find: </strong>{g}</li>)}</ul>
      {sol.assumptions?.map((a) => <p key={a} className="text-xs text-amber-200">Assumption: {a}</p>)}
      {stage < 1 && <button type="button" className={btn} onClick={() => setStage(1)}>Show a hint</button>}
      {stage >= 1 && <p className="text-sm text-cyan-100 rounded-lg bg-cyan-950/30 border border-cyan-500/30 px-3 py-2" data-testid="hint"><strong>Hint: </strong>{sol.hint}</p>}
      {stage === 1 && <button type="button" className={btn} onClick={() => setStage(2)}>Show step-by-step reasoning</button>}
      {stage >= 2 && (
        <ol className="space-y-2" data-testid="steps">
          {sol.steps.map((s, i) => <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2 text-sm text-slate-200"><span className="font-mono text-amber-400 mr-2">{i + 1}.</span>{s.text}<div className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</div></li>)}
        </ol>
      )}
      {stage === 2 && <button type="button" className={btn} onClick={() => setStage(3)}>Show the final answer</button>}
      {stage >= 3 && (
        <div className="space-y-2" data-testid="answers">
          {sol.answers.map((a) => <p key={a.label} className="text-sm text-emerald-100 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2"><strong>{a.label}: </strong>{a.value}</p>)}
          <p className="text-[11px] text-slate-400">Verification: {sol.verification.method}</p>
          {sol.lab && <Link to={sol.lab.href} className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Explore in the lab: {sol.lab.label}</Link>}
        </div>
      )}
    </div>
  );
};

export const MotionExercises: React.FC = () => {
  const solved = solvedExerciseNumbers();
  const [open, setOpen] = useState<number | null>(null);
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
          <p className="text-sm text-slate-300">The chapter ends with sixteen questions (“Revise, Reflect, Refine”). They are listed here with their textbook numbers. The summaries are in our own words; open the textbook for the exact wording. {solved.length} of 16 have step-by-step solutions so far (questions {solved.join(', ')}); the others are upcoming and show no solution yet.</p>
          <p className="text-xs text-slate-400">Viewing a solution never counts toward mastery. Practise first, then check.</p>
        </header>
        <ol className="space-y-3">
          {MOTION_EXERCISES.map((ex) => (
            <li key={ex.number} data-exercise={ex.number} className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-mono text-slate-400">Question {ex.number} · {ex.topic} · Section {ex.sections.join(', ')}</div>
                  <p className="text-sm text-slate-100">{ex.summary}</p>
                  {ex.parts && <p className="text-[11px] text-slate-400">Parts: {ex.parts.map((p) => p.label).join('; ')}</p>}
                </div>
                {ex.status === 'solved'
                  ? <button type="button" aria-expanded={open === ex.number} onClick={() => setOpen(open === ex.number ? null : ex.number)} className="min-h-[44px] px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm" data-testid={`open-${ex.number}`}>{open === ex.number ? 'Close' : 'Open solution'}</button>
                  : <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-surface-border text-slate-400" data-status="upcoming">Upcoming</span>}
              </div>
              {ex.status === 'solved' && open === ex.number && <Solution ex={ex} />}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};
