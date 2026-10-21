import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MOTION_CHAPTER } from '../../../engine/physics/motion/learn/content';
import { lessonStatus, STATUS_LABEL } from '../../../engine/education/progress';
import type { LearningStatus } from '../../../engine/education/types';
import { useEducationStore } from '../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../education/Intro';
import { LearnLessonPage } from '../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../education/Prerequisites';
import { VisualRegistryProvider } from '../../education/visuals';
import { MOTION_VISUALS } from './MotionTrack';

const CRUMB = 'Describing Motion Around Us';

export const MotionLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={MOTION_CHAPTER} registry={MOTION_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

const TONE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400 bg-surface-lowest/50',
  in_progress: 'border-sky-500/50 text-sky-300 bg-sky-500/10 shadow-xs',
  completed: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10 shadow-xs',
  demonstrated: 'border-violet-500/50 text-violet-300 bg-violet-500/10 shadow-xs',
  mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/15 font-bold shadow-xs',
  needs_review: 'border-amber-500/50 text-amber-300 bg-amber-500/10 shadow-xs',
};

/** The Learn destination of the Motion chapter hub: chapter and unit introductions, prerequisites and the lessons with honest status. */
export const MotionLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = MOTION_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  const doneCount = all.filter((l) => { const st = lessonStatus(l, records[l.id]); return st === 'completed' || st === 'mastered'; }).length;
  const percentDone = Math.round((doneCount / Math.max(all.length, 1)) * 100);

  return (
    <VisualRegistryProvider value={MOTION_VISUALS}>
      <section id="learn" aria-label="Learn" className="space-y-6" data-testid="motion-learn-section">
        {/* Hero Guided Learning Banner */}
        <div className="rounded-3xl border-2 border-sky-500/50 bg-gradient-to-br from-sky-950/40 via-surface-card to-surface-lowest p-5 md:p-6 space-y-4 shadow-lg shadow-sky-950/20 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">school</span>
              Guided Learning Path · Class 9 Physics
            </span>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">
              {percentDone}% Complete
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-white">Learn: Describing motion</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Start from the beginning: where is an object, how far did it travel, and how did its position change? Short explanations, interactive tracks, worked examples and practice problems. Skip ahead or open the laboratory at any time.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-surface-lowest border border-surface-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(4, percentDone)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{doneCount} of {all.length} lessons completed</span>
              <span className="text-sky-300">Next: Lesson {next.number} ({next.title})</span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              data-testid="motion-start-learning"
              to={ch.routes.learn(next.id)}
              className="min-h-[50px] w-full sm:w-auto px-6 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all touch-manipulation"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>{started ? `Continue Learn: Lesson ${next.number} (${next.title})` : 'Start Learn: Lesson 1'}</span>
            </Link>
          </div>
        </div>

        <ChapterIntroduction chapter={ch} />
        <ChapterPrerequisites chapter={ch} />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-sky-400">format_list_bulleted</span>
              Curriculum Units & Lessons
            </h3>
            <span className="text-xs font-mono text-slate-400">{ch.units.length} units · {all.length} lessons</span>
          </div>

          <div className="space-y-8 sm:space-y-10 min-w-0 w-full">
            {ch.units.map((u) => (
              <section
                key={u.id}
                data-learn-unit={u.id}
                className="rounded-3xl border border-surface-border/80 bg-gradient-to-b from-[#131923] to-[#0f131c] p-4 sm:p-6 md:p-7 space-y-5 shadow-md shadow-black/20 min-w-0 w-full overflow-hidden"
              >
                <UnitIntroduction unit={u} narrate />

                {/* Optional Preparation: Subordinate drawer */}
                {u.prerequisiteIds && u.prerequisiteIds.length > 0 && (
                  <details className="rounded-xl border border-surface-border/50 bg-surface-lowest/50 px-3.5 sm:px-4 py-2 overflow-hidden group">
                    <summary className="cursor-pointer min-h-[42px] flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium hover:text-white transition-colors select-none">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-sky-400/90 shrink-0">psychology</span>
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
                    <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
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
                            className="block min-w-0 w-full min-h-[72px] rounded-2xl border border-surface-border bg-[#18202e] hover:bg-[#1e2738] hover:border-sky-400/60 active:scale-[0.99] p-3.5 sm:p-4 space-y-1.5 transition-colors shadow-xs touch-manipulation group overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5 min-w-0 shrink">
                                <span className="px-1.5 py-0.5 rounded bg-surface-lowest text-[10px] text-sky-400 border border-sky-500/20 font-bold shrink-0">
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
                            <div className="font-bold text-white group-hover:text-sky-300 transition-colors text-sm sm:text-base break-words">
                              {l.title}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{l.objective}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Every unit of Chapter 4 is available. The prerequisite refreshers are optional and never block a lesson.
        </p>
      </section>
    </VisualRegistryProvider>
  );
};
