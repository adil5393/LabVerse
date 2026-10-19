import React, { useState } from 'react';
import { evaluateAnswer } from '../../engine/education/evaluate';
import { readinessLabel } from '../../engine/education/progress';
import type { AnswerInput, EduChapter, Prerequisite, Question } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { ConceptExplainer } from './LessonParts';
import { QuestionView } from './QuestionView';

const ghostBtn = 'min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm hover:border-slate-400 disabled:opacity-40';
const primaryBtn = 'min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40';

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

const STATUS_STYLE: Record<string, string> = {
  passed: 'text-emerald-300 border-emerald-500/40',
  needs_review: 'text-amber-300 border-amber-500/40',
  bypassed: 'text-slate-300 border-slate-500/40',
};

/**
 * One prerequisite: why it matters, a short refresher, and a readiness check.
 * Nothing here blocks the student; skipping is recorded as "not assessed".
 */
export const PrerequisiteCard: React.FC<{ prereq: Prerequisite; defaultOpen?: boolean; focusStepId?: string; id?: string }> = ({ prereq, defaultOpen = false, focusStepId, id }) => {
  const rec = useEducationStore((s) => s.readiness[prereq.id]);
  const submitReadiness = useEducationStore((s) => s.submitReadiness);
  const bypass = useEducationStore((s) => s.bypassReadiness);
  const [open, setOpen] = useState(defaultOpen || focusStepId !== undefined);
  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({});
  const [showChecks, setShowChecks] = useState(false);

  // A student is never asked again what they already showed: after a partial result only the missed
  // questions come back. An explicit "Check again" on a passed or skipped card asks everything.
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
  return (
    <section id={id} data-prerequisite={prereq.id} data-readiness={status ?? 'unchecked'} className="rounded-2xl border border-surface-border bg-surface-card p-4 md:p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base md:text-lg font-black text-white">{prereq.title}</h3>
          {prereq.connection && <p className="text-xs font-mono text-slate-400">{prereq.connection}</p>}
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${status ? STATUS_STYLE[status] : 'text-slate-400 border-surface-border'}`} data-testid="readiness-label">{readinessLabel(rec)}</span>
      </div>
      <p className="text-sm text-slate-300">{prereq.why}</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={ghostBtn} aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? 'Hide refresher' : 'Show quick refresher'}</button>
        <button type="button" className={primaryBtn} onClick={() => { setShowChecks(true); setAnswers({}); }}>{status === 'needs_review' ? 'Check the ones I missed' : status ? 'Check again' : 'Check my readiness'}</button>
        {status !== 'passed' && status !== 'bypassed' && <button type="button" className={ghostBtn} onClick={() => bypass(prereq.id)}>Skip this for now</button>}
      </div>

      {status === 'bypassed' && <p className="text-xs text-slate-400">You skipped this. It is recorded as not assessed, not as passed. You can open the refresher or check yourself any time.</p>}

      {open && (
        <div className="space-y-3">
          {prereq.refresher.map((s) => (
            <div key={s.id} id={`refresher-${s.id}`} className={focusStepId === s.id ? 'ring-2 ring-amber-400 rounded-2xl' : ''}>
              <ConceptExplainer step={s} />
            </div>
          ))}
        </div>
      )}

      {showChecks && (
        <div className="space-y-4 border-t border-surface-border pt-4" data-testid="readiness-checks">
          {pending.length < prereq.checks.length && <p className="text-xs text-slate-400" data-testid="readiness-partial">You already answered {prereq.checks.length - pending.length} of {prereq.checks.length} correctly, so only the rest are asked again.</p>}
          {pending.map((q) => (
            <div key={q.id} className="rounded-xl border border-surface-border p-3">
              <QuestionView question={q} lockOnCorrect={false} onSubmit={(ev, _q, input) => { if (!ev.invalid) record(q, input); }} submitLabel="Save my answer" />
            </div>
          ))}
          <p className="text-xs text-slate-400">Answer each question, then finish. Wrong answers explain what to revisit; nothing here is a test you can fail.</p>
          <button type="button" className={primaryBtn} disabled={!allAnswered} onClick={finish}>Finish readiness check</button>
        </div>
      )}

      {rec && status === 'needs_review' && rec.missed.length > 0 && !showChecks && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-100 space-y-1" data-testid="readiness-recs">
          <strong>Worth a look:</strong>
          <ul className="list-disc pl-5">
            {rec.missed.map((m) => {
              const step = prereq.refresher.find((s) => s.id === m.refresherId);
              return <li key={m.questionId}>{step ? <>Review “{step.title}”.</> : <>Open the refresher above and revisit the question you missed.</>}</li>;
            })}
          </ul>
        </div>
      )}
    </section>
  );
};

export const PrerequisiteSet: React.FC<{ chapter: EduChapter; ids: string[]; heading: string; intro: string; focusId?: string }> = ({ chapter, ids, heading, intro, focusId }) => {
  const list = ids.map((i) => chapter.prerequisites[i]).filter((p): p is Prerequisite => Boolean(p));
  return (
    <section aria-label={heading} className="space-y-3">
      <div>
        <h2 className="text-xl font-black text-white">{heading}</h2>
        <p className="text-sm text-slate-300 max-w-3xl">{intro}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((p) => <PrerequisiteCard key={p.id} prereq={p} focusStepId={focusId && p.refresher.some((s) => s.id === focusId) ? focusId : undefined} />)}
      </div>
    </section>
  );
};

export const ChapterPrerequisites: React.FC<{ chapter: EduChapter }> = ({ chapter }) => (
  <PrerequisiteSet chapter={chapter} ids={chapter.prerequisiteIds} heading="Before you begin" intro="A few ideas this chapter builds on. Check what you already know, or skip. You can always begin the lessons or open the laboratory right away." />
);

export const UnitPrerequisites: React.FC<{ chapter: EduChapter; unitId: string }> = ({ chapter, unitId }) => {
  const unit = chapter.units.find((u) => u.id === unitId);
  if (!unit) return null;
  return <PrerequisiteSet chapter={chapter} ids={unit.prerequisiteIds} heading={`Before Unit ${unit.number}`} intro="Ideas this unit uses. These are suggestions, not gates." />;
};
