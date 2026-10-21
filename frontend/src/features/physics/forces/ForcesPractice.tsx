/**
 * Chapter Practice (/physics/forces/practice), PHY-2E. Original questions across the whole chapter, open to everyone: no
 * prerequisites, no login, no unlocking. Each question is shown once; the first answer is the one that counts toward the summary.
 * The summary is for the student only: practice results are not written to the learning-progress store, and neither practice nor
 * viewing a solution ever grants lesson mastery. Same architecture as the Chapter 4 and Chapter 7 practice pages.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { FORCE_PRACTICE_CATEGORIES, FORCE_PRACTICE_ITEMS, forcePracticeByCategory } from '../../../engine/physics/forces/practice';
import { VisualRegistryProvider } from '../../education/visuals';
import { QuestionView } from '../../education/QuestionView';
import { PHYS } from '../motion/physicsColors';
import { FORCE_VISUALS } from './ForcesPages';
import { ChapterWorkspaceNav } from '../../workspace';

export const ForcesPractice: React.FC = () => {
  const [first, setFirst] = useState<Record<string, boolean>>({});
  const answered = Object.keys(first).length;
  const right = Object.values(first).filter(Boolean).length;
  const lessons = [...new Set(FORCE_PRACTICE_ITEMS.filter((i) => first[i.id] === false).map((m) => m.lessonId))];
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces-practice">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <ChapterWorkspaceNav chapterId="forces" currentPageTitle="Chapter Practice" currentMode="practice" showBackToLab={true} />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Chapter Practice</h1>
          <p className="text-sm text-slate-300 max-w-3xl">{FORCE_PRACTICE_ITEMS.length} original questions across the whole chapter: balanced and unbalanced forces, friction, Newton&apos;s three laws, momentum and connected objects. Open to everyone, in any order. Each question appears once, and your first answer is the one that counts in the summary.</p>
          <p className="text-xs text-slate-400">This page is for checking yourself. It does not change your lesson progress, and looking at feedback never counts as mastery.</p>
        </header>

        <section aria-label="Your summary" className="rounded-xl border p-3 space-y-1" style={{ borderColor: `${PHYS.time}80` }} data-testid="practice-summary" aria-live="polite">
          <h2 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.time }}>Your summary (first answers only)</h2>
          <p className="text-sm text-slate-100" data-testid="practice-score">{right} of {answered} answered correctly on the first try · {FORCE_PRACTICE_ITEMS.length - answered} not yet answered</p>
          {lessons.length > 0 && (
            <p className="text-xs text-slate-300" data-testid="practice-review">To review: {lessons.map((l, i) => <span key={l}>{i ? ', ' : ''}<Link className="underline hover:text-sky-300" to={`/physics/forces/learn/${l}`}>{l.replace('pf-l', 'Lesson ')}</Link></span>)}</p>
          )}
        </section>

        <VisualRegistryProvider value={FORCE_VISUALS}>
          {FORCE_PRACTICE_CATEGORIES.map((c) => (
            <section key={c.id} aria-label={c.title} className="space-y-3" data-practice-category={c.id}>
              <div><h2 className="text-xl font-black text-white">{c.title}</h2><p className="text-xs text-slate-400">{c.blurb}</p></div>
              <ol className="space-y-4">
                {forcePracticeByCategory(c.id).map((it, i) => (
                  <li key={it.id} className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-2" data-practice-item={it.id}>
                    <div className="text-[11px] font-mono text-slate-400">{c.title} · question {i + 1}</div>
                    <QuestionView question={it.question} onSubmit={(ev) => { if (ev.invalid) return; setFirst((f) => (it.id in f ? f : { ...f, [it.id]: ev.correct })); }} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </VisualRegistryProvider>
      </main>
    </div>
  );
};
