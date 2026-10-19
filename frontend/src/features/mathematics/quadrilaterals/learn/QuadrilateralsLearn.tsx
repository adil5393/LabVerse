import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { QUADRILATERALS_CHAPTER } from '../../../../engine/mathematics/quadrilaterals/learn/content';
import { lessonStatus, STATUS_LABEL } from '../../../../engine/education/progress';
import type { LearningStatus } from '../../../../engine/education/types';
import { useEducationStore } from '../../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../../education/Intro';
import { LearnLessonPage } from '../../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../../education/Prerequisites';
import { VisualRegistryProvider } from '../../../education/visuals';
import { QUAD_VISUALS } from './QuadVisual';

const CRUMB = 'Class 9 Quadrilaterals';

export const QuadrilateralsLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={QUADRILATERALS_CHAPTER} registry={QUAD_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

const TONE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400',
  in_progress: 'border-cyan-500/40 text-cyan-300',
  completed: 'border-emerald-500/40 text-emerald-300',
  demonstrated: 'border-violet-500/40 text-violet-300',
  mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/10',
  needs_review: 'border-amber-500/40 text-amber-300',
};

/**
 * The Learn lesson that teaches the same idea as each guided-workbench lesson,
 * so a workbench card can link across. The workbench lessons 12 and 13 are the
 * chapter revision and practice, which have no separate Learn lesson.
 */
export const LEARN_FOR_GUIDED: Record<string, string> = {
  'quad-l1': 'quad-l1', 'quad-l2': 'quad-l2', 'quad-l3': 'quad-l2', 'quad-l4': 'quad-l3', 'quad-l5': 'quad-l4', 'quad-l6': 'quad-l4',
  'quad-l7': 'quad-l5', 'quad-l8': 'quad-l6', 'quad-l9': 'quad-l6', 'quad-l10': 'quad-l7', 'quad-l11': 'quad-l8',
};

/**
 * "Learn the ideas" section of the Quadrilaterals hub: chapter introduction and
 * prerequisites, then each unit with its own prerequisites and the Learn
 * lessons with honest status. The Free Laboratory and the guided workbench are
 * separate and need none of this.
 */
export const QuadrilateralsLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = QUADRILATERALS_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  return (
    <VisualRegistryProvider value={QUAD_VISUALS}>
      <section aria-label="Learn the ideas" className="space-y-6" data-testid="quadrilaterals-learn-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Learn the ideas</h2>
            <p className="text-sm text-slate-300 max-w-3xl">Short explanations with figures you can move, a worked example, guided practice and problems of your own. You can skip ahead, or open the Free Laboratory, at any time.</p>
          </div>
          <Link data-testid="quadrilaterals-start-learning" to={ch.routes.learn(next.id)} className="min-h-[48px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm inline-flex items-center">
            {started ? `Continue Learn: Lesson ${next.number}` : 'Start Learn: Lesson 1'}
          </Link>
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
                const l = ch.lessons[id];
                const st = lessonStatus(l, records[id]);
                return (
                  <li key={id}>
                    <Link to={ch.routes.learn(id)} data-learn-link={id} className="block min-h-[64px] rounded-2xl border border-surface-border bg-surface-card hover:border-amber-400/60 p-4 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-slate-400">Learn · Lesson {l.number}</span>
                        <span data-status={st} className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${TONE[st]}`}>{STATUS_LABEL[st]}</span>
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
    </VisualRegistryProvider>
  );
};
