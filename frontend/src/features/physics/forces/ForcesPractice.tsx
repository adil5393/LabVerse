/**
 * Chapter Practice (/physics/forces/practice), PHY-2E. Original questions across the whole chapter, open to everyone: no
 * prerequisites, no login, no unlocking. Each question is shown once; the first answer is the one that counts toward the summary.
 * The summary is for the student only: practice results are not written to the learning-progress store, and neither practice nor
 * viewing a solution ever grants lesson mastery. Same architecture as the Chapter 4 and Chapter 7 practice pages.
 */

import React from 'react';
import { useEducationStore } from '../../../store/useEducationStore';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { FORCE_PRACTICE_CATEGORIES, FORCE_PRACTICE_ITEMS, forcePracticeByCategory } from '../../../engine/physics/forces/practice';
import { CalmVisualsProvider, VisualRegistryProvider } from '../../education/visuals';
import { PracticeDeck } from '../../education/PracticeDeck';
import { FORCE_VISUALS } from './ForcesPages';
import { ChapterWorkspaceNav } from '../../workspace';

export const ForcesPractice: React.FC = () => {
  // Saved in the shared learning store (chapter practice), so answers survive a refresh. "First try" means correct on the
  // first attempt with no help, exactly as in lesson practice; practice never changes lesson mastery.
  const records = useEducationStore((s) => s.practice['forces']);
  const submitPractice = useEducationStore((s) => s.submitPractice);
  const first: Record<string, boolean> = Object.fromEntries(Object.entries(records ?? {}).filter(([, r]) => r.attempts > 0).map(([id, r]) => [id, r.firstAttemptUnassisted === true]));
  const answered = Object.keys(first).length;
  const right = Object.values(first).filter(Boolean).length;
  const lessons = [...new Set(FORCE_PRACTICE_ITEMS.filter((i) => first[i.id] === false).map((m) => m.lessonId))];
  return (
    <div className="practice-page min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces-practice">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <ChapterWorkspaceNav chapterId="forces" currentPageTitle="Chapter Practice" currentMode="practice" showBackToLab={true} />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Chapter Practice</h1>
          <p className="text-base text-slate-300">Explore {FORCE_PRACTICE_ITEMS.length} questions, one at a time. Start anywhere.</p>
          <details className="text-sm text-slate-400"><summary className="cursor-pointer">How practice works</summary><p className="mt-2">Your first answer counts toward the summary. Feedback helps you learn; practice does not change your lesson mastery.</p></details>
        </header>

        <section aria-label="Your summary" className="rounded-xl border border-surface-border bg-surface p-3 space-y-1" data-testid="practice-summary" aria-live="polite">
          <h2 className="text-xs text-primary font-semibold">Your summary (first answers only)</h2>
          <p className="text-sm text-slate-100" data-testid="practice-score">{right} of {answered} answered correctly on the first try · {FORCE_PRACTICE_ITEMS.length - answered} not yet answered</p>
          {lessons.length > 0 && (
            <p className="text-xs text-slate-300" data-testid="practice-review">To review: {lessons.map((l, i) => <span key={l}>{i ? ', ' : ''}<Link className="underline hover:text-sky-300" to={`/physics/forces/learn/${l}`}>{l.replace('pf-l', 'Lesson ')}</Link></span>)}</p>
          )}
        </section>

        <CalmVisualsProvider value><VisualRegistryProvider value={FORCE_VISUALS}>
          <PracticeDeck groups={FORCE_PRACTICE_CATEGORIES.map((c) => ({ ...c, items: forcePracticeByCategory(c.id) }))} onAnswer={(it, ev) => submitPractice('forces', it.id, ev)} />
        </VisualRegistryProvider></CalmVisualsProvider>
      </main>
    </div>
  );
};
