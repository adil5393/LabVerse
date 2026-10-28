/**
 * Chapter-neutral landing page. Learn is the recommended path; the Free
 * Laboratory and Chapter Practice are always one tap away and never gated.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { subjectCrumb } from '../../engine/education/subjects';
import { assessmentReadiness, lessonStatus, STATUS_LABEL, summarizePractice } from '../../engine/education/progress';
import { summarizeLegacy } from '../../engine/education/legacy';
import { ACTIVE_CURRICULUM, chapterById } from '../../engine/curriculum';
import type { EduChapter, JudgeRegistry, LearningStatus } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from './Intro';
import { ChapterPrerequisites, UnitPrerequisites } from './Prerequisites';
import { JudgeProvider } from './judges';
import { VisualRegistryProvider, type VisualRegistry } from './visuals';

const DONE: LearningStatus[] = ['completed', 'mastered'];
const STATUS_STYLE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400',
  in_progress: 'border-cyan-500/40 text-cyan-300',
  completed: 'border-emerald-500/40 text-emerald-300',
  demonstrated: 'border-violet-500/40 text-violet-300',
  mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/10',
  needs_review: 'border-amber-500/40 text-amber-300',
};

export interface ChapterLabLink { label: string; href: string; blurb: string }

/** Badge text from the curriculum registry: the textbook and chapter number. */
function textbookBadge(chapterId: string, classGrade: number): string {
  const c = chapterById(chapterId);
  const book = c?.textbook ? ACTIVE_CURRICULUM.textbooks.find((t) => t.id === c.textbook) : undefined;
  if (!c || !book) return `Class ${classGrade}`;
  return `NCERT ${book.title}${c.number ? ` · Chapter ${c.number}` : ''}`;
}

export const ChapterHub: React.FC<{ chapter: EduChapter; registry: VisualRegistry; judges?: JudgeRegistry; crumb: string; subtitle: string; labLabel: string; labBlurb: string; labs?: ChapterLabLink[]; illustration?: React.ReactNode }> = ({ chapter, registry, judges = {}, crumb, subtitle, labLabel, labBlurb, labs, illustration }) => {
  const lessons = useEducationStore((s) => s.lessons);
  const reset = useEducationStore((s) => s.resetChapter);
  const practiceRecs = useEducationStore((s) => s.practice[chapter.id]);
  const attempts = useEducationStore((s) => s.assessments[chapter.id]);
  const legacy = useEducationStore((s) => s.legacy[chapter.id]);
  const [confirm, setConfirm] = useState(false);
  const all = chapter.units.flatMap((u) => u.lessonIds.map((id) => chapter.lessons[id]));
  // Optional "Beyond Class 9" lessons are listed but never counted in completion or mastery.
  const ordered = all.filter((l) => !l.extension);
  const statuses = Object.fromEntries(all.map((l) => [l.id, lessonStatus(l, lessons[l.id])])) as Record<string, LearningStatus>;
  const next = ordered.find((l) => !DONE.includes(statuses[l.id])) ?? ordered[0];
  const started = ordered.some((l) => statuses[l.id] !== 'not_started');
  const doneCount = ordered.filter((l) => DONE.includes(statuses[l.id])).length;
  const masteredCount = ordered.filter((l) => statuses[l.id] === 'mastered').length;
  const nextStatus = statuses[next.id];

  return (
    <VisualRegistryProvider value={registry}>
    <JudgeProvider value={judges}>
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid" data-chapter={chapter.id}>
      <GlobalHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 space-y-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/" className="hover:text-amber-400">Subject Explorer</Link><span>/</span>
          <Link to={subjectCrumb(chapter).href} className="hover:text-amber-400">{subjectCrumb(chapter).label}</Link><span>/</span>
          <span className="text-amber-400 font-bold">{crumb}</span>
        </nav>

        <header className={illustration ? 'chapter-header chapter-header--art' : 'space-y-2'}>
          {illustration && <div className="chapter-header__art">{illustration}</div>}
          <div className="space-y-2 min-w-0">
          <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30" data-testid="chapter-badge">{textbookBadge(chapter.id, chapter.classGrade)}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{chapter.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">{subtitle}</p>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-12">
          <section className="lg:col-span-6 rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-surface-card to-surface-lowest p-5 md:p-7 space-y-4 shadow-lg shadow-amber-950/20 relative overflow-hidden" aria-label="Learn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">school</span>
                Guided learning path
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                {Math.round((doneCount / Math.max(ordered.length, 1)) * 100)}% Complete
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-white">{started ? 'Continue' : 'Start'}: Lesson {next.number}, {next.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300">{next.objective.charAt(0).toUpperCase() + next.objective.slice(1)}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-2 rounded-full bg-surface-lowest border border-surface-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                  style={{ width: `${Math.max(4, Math.round((doneCount / Math.max(ordered.length, 1)) * 100))}%` }}
                />
              </div>
              <p className="text-xs font-mono text-slate-400" data-testid="path-progress">{doneCount} of {ordered.length} lessons completed · {masteredCount} mastered · next lesson: {STATUS_LABEL[nextStatus]}</p>
            </div>

            <Link data-testid="start-learning" to={chapter.routes.learn(next.id)} className="min-h-[52px] w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-colors touch-manipulation">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>{started ? `Continue Lesson ${next.number}` : 'Start Lesson 1'}</span>
            </Link>
          </section>

          <section className="lg:col-span-3 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm" aria-label="Free laboratory">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">science</span>
                Open workbench
              </span>
              <h2 className="text-lg font-black text-white">{labLabel}</h2>
              <p className="text-xs sm:text-sm text-slate-300">{labBlurb}</p>
            </div>
            <Link data-testid="open-lab" to={chapter.routes.lab} className="min-h-[48px] rounded-xl border border-cyan-400/80 bg-cyan-500/10 text-cyan-200 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-cyan-500/20 transition-colors touch-manipulation">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Open laboratory</span>
            </Link>
          </section>

          <section className="lg:col-span-3 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm" aria-label="Chapter practice">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">task_alt</span>
                Practise
              </span>
              <h2 className="text-lg font-black text-white">Chapter practice</h2>
              <p className="text-xs sm:text-sm text-slate-300">Mixed problems from every lesson, in any order, with no need to finish lessons first.</p>
              {chapter.practice && <p className="text-xs font-mono text-emerald-200" data-testid="practice-summary-hub">{summarizePractice(chapter.practice, practiceRecs).unassisted} of {summarizePractice(chapter.practice, practiceRecs).total} right first try</p>}
            </div>
            {chapter.routes.practice
              ? <Link data-testid="open-practice" to={chapter.routes.practice} className="min-h-[48px] rounded-xl border border-emerald-400/80 bg-emerald-500/10 text-emerald-200 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-colors touch-manipulation">
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Start practising</span>
                </Link>
              : <span className="text-xs text-slate-500 p-2 block text-center">Available from the chapter hub.</span>}
          </section>
        </div>

        {(chapter.assessment && chapter.routes.assessment) || (labs && labs.length > 1) ? (
          <div className="grid gap-4 md:grid-cols-2">
            {chapter.assessment && chapter.routes.assessment && (
              <section className="rounded-3xl border border-violet-500/30 bg-surface-card p-5 space-y-2" aria-label="Chapter assessment" data-testid="assessment-card">
                <h2 className="text-lg font-black text-white">Chapter assessment</h2>
                <p className="text-xs sm:text-sm text-slate-300">Check your readiness across the whole chapter. Feedback and solutions appear after you submit.</p>
                <p className="text-xs font-mono text-violet-200" data-readiness={assessmentReadiness(chapter.assessment, attempts)}>{({ not_attempted: 'Not attempted yet', ready: 'Ready', review: 'Review suggested', demonstrated: 'Teacher demonstration only' } as const)[assessmentReadiness(chapter.assessment, attempts)]}</p>
                <Link to={chapter.routes.assessment} className="min-h-[48px] rounded-xl border border-violet-400/80 bg-violet-500/10 text-violet-100 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-violet-500/20 touch-manipulation">Open the assessment</Link>
              </section>
            )}
            {labs && labs.length > 1 && (
              <section className="rounded-3xl border border-cyan-500/30 bg-surface-card p-5 space-y-2" aria-label="All laboratories" data-testid="chapter-labs">
                <h2 className="text-lg font-black text-white">All laboratories</h2>
                <ul className="space-y-2">
                  {labs.map((l) => <li key={l.href}><Link to={l.href} className="block min-h-[48px] rounded-xl border border-surface-border px-3 py-2 hover:border-cyan-400/60"><strong className="text-white text-sm">{l.label}</strong><span className="block text-xs text-slate-400">{l.blurb}</span></Link></li>)}
                </ul>
              </section>
            )}
          </div>
        ) : null}

        {legacy && (() => { const sum = summarizeLegacy(legacy); return (
          <details className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-sm text-slate-300" data-testid="legacy-history">
            <summary className="cursor-pointer min-h-[44px] flex items-center font-semibold text-slate-200">Progress from the earlier version of this chapter</summary>
            <p className="mt-2">{sum.lessons} earlier lesson records were kept: {sum.completedClaims} marked complete, {sum.oldRuleMastery} met the earlier practice rule, {sum.unverified} could not be verified. They are shown for your information and do not count as mastery in the current lessons.</p>
          </details>
        ); })()}

        <ChapterIntroduction chapter={chapter} />
        <ChapterPrerequisites chapter={chapter} />

        <section aria-label="Units and lessons" className="space-y-8 sm:space-y-10 min-w-0 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-amber-400">format_list_bulleted</span>
              Lessons &amp; Modules
            </h2>
            <span className="text-xs font-mono text-slate-400">{ordered.length} total lessons</span>
          </div>

          {chapter.units.map((u) => (
            <section
              key={u.id}
              data-unit={u.id}
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
                    <UnitPrerequisites chapter={chapter} unitId={u.id} />
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
                    {u.lessonIds.filter((id) => statuses[id] === 'completed' || statuses[id] === 'mastered').length} of {u.lessonIds.filter((id) => !chapter.lessons[id].extension).length} done
                  </span>
                </div>

                <ol className="grid gap-2.5 sm:gap-3 md:grid-cols-2 min-w-0 w-full">
                  {u.lessonIds.map((id) => {
                    const l = chapter.lessons[id];
                    const st = statuses[id];
                    return (
                      <li key={id} className="min-w-0 w-full">
                        <Link
                          to={chapter.routes.learn(id)}
                          data-lesson-link={id}
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
                              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${STATUS_STYLE[st]}`}
                            >
                              <span className="text-[10px]">
                                {st === 'completed' || st === 'mastered' ? '✓' : st === 'in_progress' ? '▶' : '○'}
                              </span>
                              <span>{STATUS_LABEL[st]}</span>
                            </span>
                          </div>
                          <div className="font-bold text-white group-hover:text-amber-300 transition-colors text-sm sm:text-base break-words">
                            {l.title}
                          </div>
                          {l.extension && <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded-full border border-violet-400/50 text-violet-200">Beyond Class 9 (optional)</span>}
                          {l.objective && (
                            <p className="text-xs text-slate-400 truncate">{l.objective}</p>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          ))}
        </section>

        <footer className="pt-4 border-t border-surface-border text-xs text-slate-400 space-y-2">
          <p>Progress is saved only on this device. It records what you actually did: reading a lesson, skipping a check or clicking Next never counts as mastery.</p>
          {!confirm
            ? <button type="button" data-testid="reset-chapter" onClick={() => setConfirm(true)} className="min-h-[44px] px-3 rounded-lg border border-surface-border hover:border-red-400/50 hover:text-red-300">Reset this chapter's progress</button>
            : <span className="inline-flex items-center gap-2"><span className="text-red-300">Erase this chapter's progress on this device? Other chapters are not affected.</span><button type="button" data-testid="reset-chapter-confirm" onClick={() => { reset(chapter.id); setConfirm(false); }} className="min-h-[44px] px-3 rounded-lg bg-red-500 text-slate-950 font-bold">Yes, erase</button><button type="button" onClick={() => setConfirm(false)} className="min-h-[44px] px-3 rounded-lg border border-surface-border">Cancel</button></span>}
        </footer>
      </main>
    </div>
    </JudgeProvider>
    </VisualRegistryProvider>
  );
};
