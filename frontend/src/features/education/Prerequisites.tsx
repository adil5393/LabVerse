import React, { useState } from 'react';
import { evaluateAnswer } from '../../engine/education/evaluate';
import { readinessLabel } from '../../engine/education/progress';
import type { AnswerInput, EduChapter, Prerequisite, Question } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { ConceptExplainer } from './LessonParts';
import { NarrationEnabledProvider } from '../narration/NarrationRegion';
import { QuestionView } from './QuestionView';

/** Find the prerequisite owning a refresher step id (or the prerequisite id itself). */
export function findRefresher(chapter: EduChapter, id: string): Prerequisite | undefined {
  return Object.values(chapter.prerequisites).find((p) => p.id === id || p.refresher.some((s) => s.id === id));
}

/** A refresher id may also name a lesson's own explainer step. */
export function findLessonStep(chapter: EduChapter, id: string) {
  for (const lesson of Object.values(chapter.lessons)) {
    const index = lesson.steps.findIndex((st) => st.id === id);
    if (index >= 0) return { lesson, step: lesson.steps[index], index };
  }
  return undefined;
}

const STATUS_CONFIG: Record<
  string,
  {
    borderBg: string;
    badgeStyle: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    dot: string;
  }
> = {
  passed: {
    borderBg: 'border-emerald-500/30 bg-surface-card hover:border-emerald-500/50',
    badgeStyle: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40',
    icon: 'check_circle',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    dot: '✓',
  },
  needs_review: {
    borderBg: 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50',
    badgeStyle: 'text-amber-300 border-amber-500/40 bg-amber-950/40',
    icon: 'warning',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    dot: '⚠',
  },
  bypassed: {
    borderBg: 'border-surface-border/60 bg-surface-card/60 hover:border-surface-border',
    badgeStyle: 'text-slate-300 border-slate-500/40 bg-slate-800/40',
    icon: 'redo',
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/10 border-slate-500/20',
    dot: '○',
  },
};

const UNCHECKED_CONFIG = {
  borderBg: 'border-surface-border bg-surface-card hover:border-surface-bright',
  badgeStyle: 'text-slate-400 border-surface-border bg-surface-lowest/50',
  icon: 'psychology',
  iconColor: 'text-primary-light',
  iconBg: 'bg-primary/10 border-primary/20',
  dot: '○',
};

/**
 * Compact reusable prerequisite card:
 * - Default collapsed state: icon, concise title, actual readiness status, disclosure control.
 * - Expanded state: full original explanation, curriculum reference, quick refresher, readiness check, optional skip.
 * - Non-gated: students may check readiness, view refresher, or skip without blocking any lessons.
 */
export const PrerequisiteCard: React.FC<{
  prereq: Prerequisite;
  defaultOpen?: boolean;
  focusStepId?: string;
  id?: string;
}> = ({ prereq, defaultOpen = false, focusStepId, id }) => {
  const storeRec = useEducationStore((s) => s.readiness[prereq.id]);
  const rec = storeRec ?? (typeof window === 'undefined' ? useEducationStore.getState().readiness[prereq.id] : undefined);
  const submitReadiness = useEducationStore((s) => s.submitReadiness);
  const bypass = useEducationStore((s) => s.bypassReadiness);

  const [expanded, setExpanded] = useState(defaultOpen || focusStepId !== undefined);
  const [refresherOpen, setRefresherOpen] = useState(defaultOpen || focusStepId !== undefined);
  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({});
  const [showChecks, setShowChecks] = useState(false);

  // Partial retry: after a partial result only the missed questions come back.
  const pending = rec?.status === 'needs_review' ? prereq.checks.filter((q) => !rec.correct.includes(q.id)) : prereq.checks;
  const record = (q: Question, input: AnswerInput) => setAnswers((a) => ({ ...a, [q.id]: input }));
  const allAnswered = pending.every((q) => answers[q.id]);

  const finish = () => {
    const results = pending.map((q) => {
      const ev = evaluateAnswer(q, answers[q.id]);
      return { questionId: q.id, correct: ev.correct, refresherId: ev.refresherId, misconception: ev.misconception };
    });
    submitReadiness(prereq.id, prereq.checks.length, results);
    setAnswers({});
    setShowChecks(false);
  };

  const status = rec?.status;
  const cfg = status ? STATUS_CONFIG[status] ?? UNCHECKED_CONFIG : UNCHECKED_CONFIG;

  return (
    <section
      id={id}
      data-prerequisite={prereq.id}
      data-readiness={status ?? 'unchecked'}
      className={`rounded-2xl border p-3 sm:p-4 min-w-0 w-full overflow-hidden ${cfg.borderBg}`}
    >
      {/* Collapsed Header / Disclosure Button */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((o) => !o)}
        className="w-full min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl cursor-pointer group select-none"
      >
        <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.iconBg}`}>
              <span className={`material-symbols-outlined text-[17px] sm:text-[19px] ${cfg.iconColor}`} aria-hidden="true">
                {cfg.icon}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                {prereq.title}
              </h3>
              {prereq.connection && (
                <p className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                  {prereq.connection}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span
              className={`text-[10px] sm:text-[11px] font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border flex items-center gap-1 shrink-0 max-w-[125px] xs:max-w-none ${cfg.badgeStyle}`}
              data-testid="readiness-label"
            >
              <span className="text-[9px] sm:text-[10px] leading-none shrink-0" aria-hidden="true">{cfg.dot}</span>
              <span className="truncate">{readinessLabel(rec)}</span>
            </span>
            <span
              className={`material-symbols-outlined text-[18px] sm:text-[20px] shrink-0 ${
                expanded ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
              }`}
              aria-hidden="true"
            >
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Region */}
      {expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-surface-border/70 space-y-3.5 min-w-0">
          {/* Full original explanation */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
            {prereq.why}
          </p>

          {/* Curriculum connection if present */}
          {prereq.connection && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-mono bg-surface-lowest/70 border border-surface-border/80 rounded-lg px-2.5 py-1.5 w-fit max-w-full min-w-0 overflow-hidden">
              <span className="material-symbols-outlined text-[14px] text-amber-400/80 shrink-0">link</span>
              <span className="truncate">{prereq.connection}</span>
            </div>
          )}

          {/* Action buttons hierarchy */}
          <div className="flex flex-wrap items-center gap-2 pt-1 min-w-0">
            {/* Primary Action */}
            <button
              type="button"
              className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20 transition-colors touch-manipulation disabled:opacity-40"
              onClick={() => {
                setShowChecks(true);
                setAnswers({});
              }}
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                {status === 'passed' ? 'replay' : 'quiz'}
              </span>
              <span>
                {status === 'needs_review'
                  ? 'Check the ones I missed'
                  : status
                  ? 'Check again'
                  : 'Check my readiness'}
              </span>
            </button>

            {/* Subordinate Secondary Action: Quick refresher */}
            <button
              type="button"
              className="min-h-[40px] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-surface-border hover:border-slate-400 hover:bg-surface-bright/20 active:scale-95 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors touch-manipulation"
              aria-expanded={refresherOpen}
              onClick={() => setRefresherOpen((o) => !o)}
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-slate-400">
                {refresherOpen ? 'visibility_off' : 'menu_book'}
              </span>
              <span>{refresherOpen ? 'Hide refresher' : 'Show quick refresher'}</span>
            </button>

            {/* Subordinate Action: Skip for now */}
            {status !== 'passed' && status !== 'bypassed' && (
              <button
                type="button"
                className="min-h-[36px] px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1 transition-colors touch-manipulation ml-auto sm:ml-0"
                onClick={() => bypass(prereq.id)}
              >
                <span>Skip this for now</span>
              </button>
            )}
          </div>

          {/* Skipped informational note */}
          {status === 'bypassed' && (
            <div className="rounded-xl border border-surface-border/60 bg-surface-lowest/50 p-2.5 text-xs text-slate-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0 mt-0.5">info</span>
              <span>You skipped this. It is recorded as not assessed, not as passed. You can open the refresher or check yourself any time.</span>
            </div>
          )}

          {/* Quick refresher content */}
          {refresherOpen && (
            <div className="space-y-3 pt-1 min-w-0">
              {prereq.refresher.map((s) => (
                <div key={s.id} id={`refresher-${s.id}`} className={focusStepId === s.id ? 'ring-2 ring-amber-400 rounded-2xl' : ''}>
                  <ConceptExplainer step={s} />
                </div>
              ))}
            </div>
          )}

          {/* Readiness check view */}
          {showChecks && (
            <div className="space-y-4 border-t border-surface-border pt-4 min-w-0" data-testid="readiness-checks">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">quiz</span>
                  Readiness Check
                </span>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded"
                  onClick={() => setShowChecks(false)}
                >
                  Cancel
                </button>
              </div>

              {pending.length < prereq.checks.length && (
                <p className="text-xs text-slate-400" data-testid="readiness-partial">
                  You already answered {prereq.checks.length - pending.length} of {prereq.checks.length} correctly, so only the rest are asked again.
                </p>
              )}

              {pending.map((q) => (
                <div key={q.id} className="rounded-xl border border-surface-border p-3 min-w-0">
                  <QuestionView
                    question={q}
                    lockOnCorrect={false}
                    onSubmit={(ev, _q, input) => {
                      if (!ev.invalid) record(q, input);
                    }}
                    submitLabel="Save my answer"
                  />
                </div>
              ))}

              <p className="text-xs text-slate-400">
                Answer each question, then finish. Wrong answers explain what to revisit; nothing here is a test you can fail.
              </p>

              <button
                type="button"
                className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm disabled:opacity-40 transition-colors shadow-sm"
                disabled={!allAnswered}
                onClick={finish}
              >
                Finish readiness check
              </button>
            </div>
          )}

          {/* Recommendation callout on needs_review */}
          {rec && status === 'needs_review' && rec.missed.length > 0 && !showChecks && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs sm:text-sm text-amber-100 space-y-1 min-w-0" data-testid="readiness-recs">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                Worth a look:
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {rec.missed.map((m) => {
                  const step = prereq.refresher.find((s) => s.id === m.refresherId);
                  return (
                    <li key={m.questionId}>
                      {step ? <>Review “{step.title}”.</> : <>Open the refresher above and revisit the question you missed.</>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export const PrerequisiteSet: React.FC<{
  chapter: EduChapter;
  ids: string[];
  heading: string;
  intro: string;
  focusId?: string;
}> = ({ chapter, ids, heading, intro, focusId }) => {
  const list = ids.map((i) => chapter.prerequisites[i]).filter((p): p is Prerequisite => Boolean(p));
  if (list.length === 0) return null;
  return (
    <section aria-label={heading} className="space-y-3 min-w-0 w-full overflow-hidden">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white">{heading}</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{intro}</p>
      </div>
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-2 min-w-0 w-full">
        {list.map((p) => (
          <PrerequisiteCard
            key={p.id}
            prereq={p}
            focusStepId={focusId && p.refresher.some((s) => s.id === focusId) ? focusId : undefined}
          />
        ))}
      </div>
    </section>
  );
};

export const ChapterPrerequisites: React.FC<{ chapter: EduChapter }> = ({ chapter }) => (
  <NarrationEnabledProvider enabled>
  <div className="rounded-3xl border border-surface-border/80 bg-surface-lowest/70 p-4 sm:p-5 md:p-6 min-w-0 w-full overflow-hidden shadow-xs" data-testid="chapter-prerequisites">
    <PrerequisiteSet
      chapter={chapter}
      ids={chapter.prerequisiteIds}
      heading="Before you begin"
      intro="A few ideas this chapter builds on. Check what you already know, or skip. You can always begin the lessons or open the laboratory right away."
    />
  </div>
  </NarrationEnabledProvider>
);

export const UnitPrerequisites: React.FC<{ chapter: EduChapter; unitId: string }> = ({ chapter, unitId }) => {
  const unit = chapter.units.find((u) => u.id === unitId);
  if (!unit) return null;
  return (
    <NarrationEnabledProvider enabled>
      <PrerequisiteSet
        chapter={chapter}
        ids={unit.prerequisiteIds}
        heading={`Before Unit ${unit.number}`}
        intro="Ideas this unit uses. These are suggestions, not gates."
      />
    </NarrationEnabledProvider>
  );
};
