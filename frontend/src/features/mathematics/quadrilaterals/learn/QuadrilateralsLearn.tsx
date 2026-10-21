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
  const doneCount = all.filter((l) => { const st = lessonStatus(l, records[l.id]); return st === 'completed' || st === 'mastered'; }).length;
  const masteredCount = all.filter((l) => lessonStatus(l, records[l.id]) === 'mastered').length;
  const progressPct = Math.round((doneCount / Math.max(all.length, 1)) * 100);

  return (
    <VisualRegistryProvider value={QUAD_VISUALS}>
      <section aria-label="Learn the ideas" className="space-y-6" data-testid="quadrilaterals-learn-section">
        {/* Modern Learning Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-surface-card to-surface-card p-5 sm:p-6 shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase">
                  Class 9 Mathematics · Geometry
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  {doneCount}/{all.length} completed
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Learn the ideas
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore angle sum property, parallelogram theorems, midpoint theorem, and special quadrilaterals with interactive figures.
              </p>

              {/* Progress bar */}
              <div className="pt-2 space-y-1.5">
                <div className="w-full h-2 rounded-full bg-surface-lowest border border-surface-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                    style={{ width: `${Math.max(4, progressPct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{doneCount} of {all.length} lessons completed</span>
                  <span className="text-amber-300 font-semibold">{masteredCount} mastered</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <Link
                data-testid="quadrilaterals-start-learning"
                to={ch.routes.learn(next.id)}
                className="min-h-[48px] px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-colors touch-manipulation"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>{started ? `Continue: Lesson ${next.number}` : 'Start: Lesson 1'}</span>
              </Link>
            </div>
          </div>
        </div>

        <ChapterIntroduction chapter={ch} />
        <ChapterPrerequisites chapter={ch} />

        <div className="space-y-8 sm:space-y-10 min-w-0 w-full">
          {ch.units.map((u) => (
            <section
              key={u.id}
              data-learn-unit={u.id}
              className="rounded-3xl border border-surface-border/80 bg-gradient-to-b from-surface-card to-surface-lowest p-4 sm:p-6 md:p-7 space-y-5 shadow-md shadow-black/20 min-w-0 w-full overflow-hidden"
            >
              <UnitIntroduction unit={u} />

              {/* Optional Preparation: Subordinate drawer */}
              {u.prerequisiteIds && u.prerequisiteIds.length > 0 && (
                <details className="rounded-xl border border-surface-border/50 bg-surface-lowest/50 px-3.5 sm:px-4 py-2 overflow-hidden group">
                  <summary className="cursor-pointer min-h-[42px] flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium hover:text-white transition-colors select-none">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-amber-400/90 shrink-0">psychology</span>
                      <span className="truncate">Before Unit {u.number}: ideas this unit uses</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 bg-surface-lowest px-1.5 py-0.5 rounded border border-surface-border/40">optional</span>
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-open:rotate-180 transition-colors shrink-0">expand_more</span>
                  </summary>
                  <div className="pt-3 pb-1 border-t border-surface-border/50 min-w-0">
                    <UnitPrerequisites chapter={ch} unitId={u.id} />
                  </div>
                </details>
              )}

              {/* Active Lesson Cards Section: Primary visual emphasis */}
              <div className="space-y-3 pt-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    Lessons in Unit {u.number}
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    {u.lessonIds.filter((id) => records[id] && (lessonStatus(ch.lessons[id], records[id]) === 'completed' || lessonStatus(ch.lessons[id], records[id]) === 'mastered')).length} of {u.lessonIds.length} done
                  </span>
                </div>

                <ol className="grid gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 min-w-0 w-full">
                  {u.lessonIds.map((id) => {
                    const l = ch.lessons[id];
                    const st = lessonStatus(l, records[id]);
                    return (
                      <li key={id} className="min-w-0 w-full">
                        <Link
                          to={ch.routes.learn(id)}
                          data-learn-link={id}
                          className="block min-w-0 w-full min-h-[72px] rounded-2xl border border-surface-border bg-surface-card hover:bg-surface-high hover:border-amber-400/60 active:scale-[0.99] p-3.5 sm:p-4 space-y-1.5 transition-colors shadow-xs touch-manipulation group overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5 min-w-0 shrink">
                              <span className="px-1.5 py-0.5 rounded bg-surface-lowest text-[10px] text-amber-400 border border-amber-500/20 font-bold shrink-0">
                                L{l.number}
                              </span>
                              <span className="truncate">Lesson {l.number}</span>
                            </span>
                            <span
                              data-status={st}
                              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${TONE[st]}`}
                            >
                              <span className="text-[10px]">
                                {st === 'completed' || st === 'mastered' ? '✓' : st === 'in_progress' ? '▶' : '○'}
                              </span>
                              <span>{STATUS_LABEL[st]}</span>
                            </span>
                          </div>
                          <div className="font-bold text-white group-hover:text-amber-300 transition-colors text-sm sm:text-base leading-snug break-words">
                            {l.title}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          ))}
        </div>
      </section>
    </VisualRegistryProvider>
  );
};
