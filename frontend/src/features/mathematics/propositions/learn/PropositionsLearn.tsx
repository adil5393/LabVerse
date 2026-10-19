import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PROPOSITIONS_CHAPTER, PROP_JUDGES } from '../../../../engine/mathematics/propositions/learn/content';
import { lessonStatus, STATUS_LABEL } from '../../../../engine/education/progress';
import type { LearningStatus } from '../../../../engine/education/types';
import { useEducationStore } from '../../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../../education/Intro';
import { JudgeProvider } from '../../../education/judges';
import { LearnLessonPage } from '../../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../../education/Prerequisites';
import { VisualRegistryProvider } from '../../../education/visuals';
import { PROP_VISUALS } from './visuals';

const CRUMB = 'Class 9 Propositions';

export const PropositionsLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={PROPOSITIONS_CHAPTER} registry={PROP_VISUALS} judges={PROP_JUDGES} lessonId={lessonId} crumb={CRUMB} />;
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
 * "Learn the ideas" section of the Propositions hub: chapter introduction and
 * prerequisites, each unit with its own prerequisites, and the Learn lessons with
 * honest status. Explore (the free laboratory) and Investigate (the guided
 * workbench) stay exactly where they were and need none of this.
 */
export const PropositionsLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = PROPOSITIONS_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  return (
    <VisualRegistryProvider value={PROP_VISUALS}>
      <JudgeProvider value={PROP_JUDGES}>
        <section aria-label="Learn the ideas" className="space-y-6" data-testid="propositions-learn-section">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">Learn the ideas</h2>
              <p className="text-sm text-slate-300 max-w-3xl">Start from the beginning: short explanations with diagrams you can change, a worked example, guided practice and problems of your own. You can skip ahead, or open the Free Reasoning Lab, at any time.</p>
            </div>
            <Link data-testid="propositions-start-learning" to={ch.routes.learn(next.id)} className="min-h-[48px] px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm inline-flex items-center">
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
        </section>
      </JudgeProvider>
    </VisualRegistryProvider>
  );
};
