/**
 * Chapter Practice (/physics/motion/practice), PHY-1E. Original questions across the whole chapter, open to
 * everyone: no prerequisites, no login, no unlocking. Each question is shown once; the first answer is the
 * one that counts toward the summary. The summary is for the student only: practice results are saved as chapter
 * practice in the learning store (never as lesson evidence), and neither practice nor viewing a solution ever grants lesson mastery.
 */

import React from 'react';
import { useEducationStore } from '../../../store/useEducationStore';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { PRACTICE_CATEGORIES, PRACTICE_ITEMS, practiceByCategory } from '../../../engine/physics/motion/practice';
import { VisualRegistryProvider } from '../../education/visuals';
import { PracticeDeck } from '../../education/PracticeDeck';
import { MOTION_VISUALS } from './MotionTrack';

export const MotionPractice: React.FC = () => {
  // Saved in the shared learning store (chapter practice), so answers survive a refresh. "First try" means correct on the
  // first attempt with no help, exactly as in lesson practice; practice never changes lesson mastery.
  const records = useEducationStore((s) => s.practice['motion']);
  const submitPractice = useEducationStore((s) => s.submitPractice);
  const first: Record<string, boolean> = Object.fromEntries(Object.entries(records ?? {}).filter(([, r]) => r.attempts > 0).map(([id, r]) => [id, r.firstAttemptUnassisted === true]));
  const answered = Object.keys(first).length;
  const right = Object.values(first).filter(Boolean).length;
  const missed = PRACTICE_ITEMS.filter((i) => first[i.id] === false);
  return (
    <div className="practice-page min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="motion-practice">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
          <Link to="/physics/motion" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Describing Motion</Link><span>/</span>
          <span className="text-sky-300 font-bold">Chapter Practice</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Chapter Practice</h1>
          <p className="text-base text-slate-300">Explore {PRACTICE_ITEMS.length} questions, one at a time. Start anywhere.</p>
          <details className="text-sm text-slate-400"><summary className="cursor-pointer">How practice works</summary><p className="mt-2">Your first answer counts toward the summary. Feedback helps you learn; practice does not change your lesson mastery.</p></details>
        </header>

        <section aria-label="Your summary" className="rounded-xl border border-surface-border bg-surface p-3 space-y-1" data-testid="practice-summary" aria-live="polite">
          <h2 className="text-xs text-primary font-semibold">Your summary (first answers only)</h2>
          <p className="text-sm text-slate-100" data-testid="practice-score">{right} of {answered} answered correctly on the first try · {PRACTICE_ITEMS.length - answered} not yet answered</p>
          {missed.length > 0 && (
            <p className="text-xs text-slate-300">To review: {missed.map((m, i) => <span key={m.id}>{i ? ', ' : ''}<Link className="underline hover:text-sky-300" to={`/physics/motion/learn/${m.lessonId}`}>{m.lessonId.replace('pm-l', 'Lesson ')}</Link></span>)}</p>
          )}
        </section>

        <VisualRegistryProvider value={MOTION_VISUALS}>
          <PracticeDeck groups={PRACTICE_CATEGORIES.map((c) => ({ ...c, items: practiceByCategory(c.id) }))} onAnswer={(it, ev) => submitPractice('motion', it.id, ev)} />
        </VisualRegistryProvider>
      </main>
    </div>
  );
};
