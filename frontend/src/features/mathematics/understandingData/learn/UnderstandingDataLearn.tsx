import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { UNDERSTANDING_DATA_CHAPTER } from '../../../../engine/mathematics/understandingData/learn/content';
import { lessonStatus, STATUS_LABEL } from '../../../../engine/education/progress';
import type { LearningStatus } from '../../../../engine/education/types';
import { useEducationStore } from '../../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../../education/Intro';
import { LearnLessonPage } from '../../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../../education/Prerequisites';
import { VisualRegistryProvider } from '../../../education/visuals';
import { UD_VISUALS } from './UdVisual';

const CRUMB = 'Class 9 Understanding Data';

export const UnderstandingDataLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={UNDERSTANDING_DATA_CHAPTER} registry={UD_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

const TONE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400',
  in_progress: 'border-cyan-500/40 text-cyan-300',
  completed: 'border-emerald-500/40 text-emerald-300',
  demonstrated: 'border-violet-500/40 text-violet-300',
  mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/10',
  needs_review: 'border-amber-500/40 text-amber-300',
};

/** The Learn lesson that teaches the same idea as a guided-workbench lesson (lesson 13 is chapter practice). */
export const LEARN_FOR_GUIDED: Record<string, string> = {
  'ud-l1': 'ud-l1', 'ud-l2': 'ud-l1', 'ud-l3': 'ud-l2', 'ud-l4': 'ud-l3', 'ud-l5': 'ud-l2', 'ud-l6': 'ud-l2',
  'ud-l7': 'ud-l4', 'ud-l8': 'ud-l4', 'ud-l9': 'ud-l5', 'ud-l10': 'ud-l5', 'ud-l11': 'ud-l5', 'ud-l12': 'ud-l5', 'ud-l14': 'ud-l5', 'ud-l15': 'ud-l6',
};

/**
 * "Learn the ideas" section of the hub: chapter introduction and prerequisites, then each unit with
 * its own prerequisites and the Learn lessons with honest status. The Free Data Laboratory and the
 * guided workbench are separate and need none of this.
 */
export const UnderstandingDataLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = UNDERSTANDING_DATA_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  return (
    <VisualRegistryProvider value={UD_VISUALS}>
      <section aria-label="Learn the ideas" className="space-y-6" data-testid="understanding-data-learn-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Learn the ideas</h2>
            <p className="text-sm text-slate-300 max-w-3xl">Edit the numbers and watch the averages, tables and charts change together. Worked examples, guided practice and problems of your own. You can skip ahead, or open the Free Laboratory, at any time.</p>
          </div>
          <Link data-testid="understanding-data-start-learning" to={ch.routes.learn(next.id)} className="min-h-[48px] px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm inline-flex items-center">
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
                    <Link to={ch.routes.learn(id)} data-learn-link={id} className="block min-h-[64px] rounded-2xl border border-surface-border bg-surface-card hover:border-purple-400/60 p-4 space-y-1">
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
        <p className="text-xs text-slate-400">Median, mode and histograms are not part of this chapter. The guided lessons below also cover the optional gold-purity extension.</p>
      </section>
    </VisualRegistryProvider>
  );
};
