/**
 * Chapter assessment and chapter practice bank, for every subject (data only: a chapter supplies `assessment` and `practice`).
 *
 * Assessment: answers are saved without feedback until the student submits the whole assessment; then each item shows whether it
 * was right, the misconception feedback and the worked solution, the score, a readiness indicator and targeted revision links.
 * No hints during an attempt. An attempt in teacher demonstration mode is recorded as a demonstration and never as the student's
 * result. Practice bank: the same independent-problem cards as lessons, filed as chapter practice.
 */

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { assessmentMaxScore, assessmentReadiness, assessmentRevision, scoreAssessment, summarizePractice } from '../../engine/education/progress';
import type { ChapterAssessment as AssessmentData, Competency, EduChapter, Evaluation, PracticeSet } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { MisconceptionFeedback, QuestionView } from './QuestionView';
import { VisualHost } from './visuals';
import { IndependentCard } from './LessonParts';

const COMPETENCY: Record<Competency, string> = { knowledge: 'Knowledge and understanding', application: 'Application', analysis: 'Analyse, evaluate, create' };
const READINESS_TEXT = { not_attempted: 'Not attempted yet', ready: 'Ready: you met the readiness mark', review: 'Review suggested before moving on', demonstrated: 'Only a teacher demonstration so far (not your result)' } as const;

export const ChapterAssessmentView: React.FC<{ chapter: EduChapter; assessment: AssessmentData }> = ({ chapter, assessment }) => {
  const attempts = useEducationStore((s) => s.assessments[chapter.id]);
  const record = useEducationStore((s) => s.recordAssessmentAttempt);
  const teacherMode = useEducationStore((s) => s.teacherMode);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, Evaluation>>({});
  const [submitted, setSubmitted] = useState<Record<string, Evaluation> | null>(null);
  const items = useMemo(() => assessment.sections.flatMap((s) => s.items), [assessment]);
  const readiness = assessmentReadiness(assessment, attempts);
  const own = (attempts ?? []).filter((a) => a.assessmentId === assessment.id && !a.demonstrated);
  const last = own[own.length - 1];
  const revision = assessmentRevision(assessment, submitted ? undefined : last);
  const max = assessmentMaxScore(assessment);

  const submit = () => {
    const sc = scoreAssessment(assessment, answers);
    record(chapter.id, { id: `att-${Date.now()}`, assessmentId: assessment.id, startedAt: startedAt ?? Date.now(), submittedAt: Date.now(), ...sc });
    setSubmitted(answers);
  };

  if (startedAt === null && !submitted) {
    return (
      <section className="rounded-2xl border border-surface-border bg-surface-card p-5 space-y-3" data-testid="assessment-start">
        <h2 className="text-xl font-black text-white">{assessment.title}</h2>
        <p className="text-sm text-slate-300">{assessment.instructions}</p>
        <p className="text-sm text-slate-300">{items.length} questions · {max} marks · no hints during the assessment; feedback and solutions appear when you submit.</p>
        <p className="text-sm" data-testid="assessment-readiness" data-readiness={readiness}><strong className="text-white">Readiness: </strong>{READINESS_TEXT[readiness]}{last ? ` (last score ${last.score} of ${last.maxScore})` : ''}</p>
        {revision.length > 0 && <RevisionList chapter={chapter} items={revision} />}
        {teacherMode && <p className="text-xs text-violet-200">Teacher demonstration mode is on: this attempt will be recorded as a demonstration.</p>}
        <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={() => { setStartedAt(Date.now()); setAnswers({}); }}>{own.length ? 'Start a new attempt' : 'Start the assessment'}</button>
      </section>
    );
  }

  const answered = Object.values(answers).filter((a) => !a.invalid).length;
  const result = submitted ? scoreAssessment(assessment, submitted) : null;
  return (
    <section className="space-y-4" data-testid="assessment" data-submitted={submitted ? 'true' : 'false'}>
      {result && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2" data-testid="assessment-result">
          <h2 className="text-lg font-black text-white">Your score: {result.score} of {result.maxScore}</h2>
          <p className="text-sm text-emerald-100" data-readiness={readiness}>{READINESS_TEXT[readiness]}</p>
          <RevisionList chapter={chapter} items={assessmentRevision(assessment, { id: '', assessmentId: assessment.id, startedAt: 0, submittedAt: 0, demonstrated: false, ...result })} />
          <button type="button" className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm" onClick={() => { setSubmitted(null); setStartedAt(null); }}>Back to the assessment overview</button>
        </div>
      )}
      {assessment.sections.map((sec) => (
        <div key={sec.id} className="space-y-3">
          <h3 className="text-base font-bold text-white">{sec.title}</h3>
          {sec.items.map((it, i) => {
            const ev = submitted?.[it.id];
            return (
              <article key={it.id} className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-3" data-assessment-item={it.id} data-correct={submitted ? String(Boolean(ev?.correct)) : undefined}>
                <div className="text-xs font-mono text-slate-400">Question {i + 1} · {it.marks} mark{it.marks === 1 ? '' : 's'} · {COMPETENCY[it.competency]}</div>
                <p className="text-sm text-slate-200">{it.prompt}</p>
                {it.visual && <VisualHost visual={it.visual} />}
                {!submitted ? (
                  <QuestionView key={it.id} question={it.question} hideFeedback lockOnCorrect={false} submitLabel="Save answer"
                    onSubmit={(e) => setAnswers((m) => ({ ...m, [it.id]: e }))} />
                ) : (
                  <>
                    {ev ? <MisconceptionFeedback evaluation={ev} /> : <p className="text-sm text-amber-200" role="status">Not answered.</p>}
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-200 rounded-lg bg-surface-lowest px-4 py-3" data-testid="assessment-solution">
                      {it.solution.map((l, k) => <li key={k}>{l}</li>)}
                    </ol>
                  </>
                )}
              </article>
            );
          })}
        </div>
      ))}
      {!submitted && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={submit} data-testid="assessment-submit">Submit the assessment</button>
          <span className="text-sm text-slate-400">{answered} of {items.length} answered</span>
        </div>
      )}
    </section>
  );
};

const RevisionList: React.FC<{ chapter: EduChapter; items: { topic: string; lessonId?: string }[] }> = ({ chapter, items }) =>
  items.length ? (
    <div className="text-sm text-amber-100" data-testid="assessment-revision">
      <strong>Revise next: </strong>
      {items.map((r, i) => <span key={r.topic}>{i ? ' · ' : ''}{r.lessonId && chapter.lessons[r.lessonId] ? <Link className="underline" to={chapter.routes.learn(r.lessonId)}>{r.topic}</Link> : r.topic}</span>)}
    </div>
  ) : null;

export const ChapterPracticeSet: React.FC<{ chapter: EduChapter; set: PracticeSet }> = ({ chapter, set }) => {
  const recs = useEducationStore((s) => s.practice[chapter.id]);
  const retry = useEducationStore((s) => s.retryPracticeAssisted);
  const sum = summarizePractice(set, recs);
  const [group, setGroup] = useState(set.groups[0]?.id ?? '');
  const g = set.groups.find((x) => x.id === group) ?? set.groups[0];
  return (
    <section className="space-y-4" data-testid="practice-set">
      <p className="text-sm text-slate-200" data-testid="practice-set-summary">{sum.unassisted} of {sum.total} right on the first try without help · {sum.attempted} attempted. Practice never changes lesson mastery.</p>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Practice groups">
        {set.groups.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={x.id === g?.id} onClick={() => setGroup(x.id)} data-practice-group={x.id}
            className={`min-h-[44px] px-4 rounded-full text-sm font-semibold border ${x.id === g?.id ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-border text-slate-300'}`}>
            {x.title} ({sum.byGroup[x.id]?.unassisted ?? 0}/{x.items.length})
          </button>
        ))}
      </div>
      {g && <p className="text-sm text-slate-300">{g.blurb}</p>}
      {g?.items.map((it, i) => <IndependentCard key={it.id} item={it} lessonId="" index={i} practiceChapterId={chapter.id} />)}
      {Object.values(recs ?? {}).some((r) => r.firstAttemptUnassisted !== true) && (
        <button type="button" className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm" onClick={() => retry(chapter.id)}>Retry the problems where I needed help</button>
      )}
    </section>
  );
};
