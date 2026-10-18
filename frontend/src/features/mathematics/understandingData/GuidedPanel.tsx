/**
 * Guided lesson panel (M6). Reuses the chapter-neutral stage ids and lesson
 * shape from the Guided Learning framework. Gates depend on real recorded
 * student actions. A teacher demonstration passes gates but is recorded as
 * "demonstrated", never as mastery.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnderstandingDataStore, lessonStatus } from '../../../store/useUnderstandingDataStore';
import { UD_GUIDED_LESSONS, UD_LESSON_ORDER, UD_OPTIONAL_LESSON_IDS } from '../../../engine/mathematics/understandingData/curriculumPath';
import { getPracticeQuestionById } from '../../../engine/mathematics/understandingData/practiceBank';
import { formatSmart } from '../../../engine/mathematics/understandingData/rational';
import type { GuidedStageId } from '../../../engine/mathematics/guidedLearning/types';
import { QuestionCard } from './QuestionCard';

const STAGE_LABEL: Record<GuidedStageId, string> = { understand: 'Understand', predict: 'Predict', experiment: 'Experiment', observe: 'Observe', explain: 'Explain', practice: 'Practise' };

const STATUS_TEXT = {
  not_started: 'Not started',
  attempted: 'Attempted',
  completed: 'Completed',
  demonstrated: 'Demonstrated (no mastery)',
  mastered: 'Mastered',
} as const;

export const GuidedPanel: React.FC = () => {
  const navigate = useNavigate();
  const lessonId = useUnderstandingDataStore((s) => s.activeLessonId);
  const stage = useUnderstandingDataStore((s) => s.activeStage);
  const progress = useUnderstandingDataStore((s) => s.lessons[s.activeLessonId]);
  const teacherMode = useUnderstandingDataStore((s) => s.teacherMode);
  const setTeacherMode = useUnderstandingDataStore((s) => s.setTeacherMode);
  const setStage = useUnderstandingDataStore((s) => s.setStage);
  const recordPrediction = useUnderstandingDataStore((s) => s.recordPrediction);
  const recordNumeric = useUnderstandingDataStore((s) => s.recordNumericPrediction);
  const advance = useUnderstandingDataStore((s) => s.advanceToNextStage);
  const canAdvance = useUnderstandingDataStore((s) => s.canAdvance);
  useUnderstandingDataStore((s) => s.practiceAnswers); // keeps the gate message live

  const [practiceIndex, setPracticeIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [guessError, setGuessError] = useState<string | null>(null);

  const lesson = UD_GUIDED_LESSONS[lessonId];
  if (!lesson) return <div className="p-4 text-sm text-slate-400">Choose a lesson from the chapter page.</div>;

  const idx = lesson.stages.indexOf(stage);
  const gate = canAdvance();
  const isLast = idx === lesson.stages.length - 1;
  const done = Boolean(progress?.completed) && isLast;
  const sequence = lesson.isOptionalExtension ? UD_OPTIONAL_LESSON_IDS : UD_LESSON_ORDER;
  const nextId = sequence[sequence.indexOf(lessonId) + 1];
  const need = lesson.experimentGuide.minInteractionsNeeded ?? 0;
  const count = progress?.interactionsRecorded ?? 0;
  const np = lesson.numericPrediction;
  const status = lessonStatus(progress);
  const sec = 'p-4 space-y-3';

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-3 sm:p-4 border-b border-surface-border space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-mono font-bold text-amber-400">Lesson {lesson.lessonNumber}{lesson.isOptionalExtension ? ' (optional)' : ''} · {lesson.unitTitle}</div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-surface-border text-slate-300" data-status={status}>{STATUS_TEXT[status]}</span>
        </div>
        <h2 className="text-base font-bold text-white leading-snug">{lesson.title}</h2>
        <p className="text-xs text-slate-400 hidden sm:block">{lesson.learningObjective}</p>
        <ol className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1" aria-label="Lesson stages">
          {lesson.stages.map((st, i) => {
            const completed = progress?.stagesCompleted[st];
            return (
              <li key={st} className="shrink-0">
                <button type="button" disabled={!(i <= idx || completed)} aria-current={st === stage ? 'step' : undefined} onClick={() => setStage(st)} className={`min-h-11 px-2.5 rounded-lg text-[11px] font-mono font-bold border ${st === stage ? 'bg-purple-600 text-white border-purple-300' : completed ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-surface-card text-slate-400 border-surface-border'} disabled:opacity-40`}>{completed && st !== stage ? '✓ ' : ''}{STAGE_LABEL[st]}</button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex-1">
        {stage === 'understand' && (
          <div className={sec}>
            <p className="text-sm text-slate-100 leading-relaxed">{lesson.concept.summary}</p>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">{lesson.concept.detailedPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            {lesson.concept.keyTerms?.map((t) => <div key={t.term} className="text-xs p-2.5 rounded-lg bg-surface-card border border-surface-border"><span className="font-bold text-amber-300">{t.term}</span>: <span className="text-slate-300">{t.definition}</span></div>)}
          </div>
        )}

        {stage === 'predict' && np && (
          <div className={sec}>
            <p className="text-sm font-semibold text-white">{np.prompt}</p>
            <p className="text-xs text-slate-400">Commit to a number first. The lab will show nothing until you do.</p>
            {!progress?.predictionMade ? (
              <div className="flex gap-2">
                <input value={guess} onChange={(e) => { setGuess(e.target.value); setGuessError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') { if (recordNumeric(guess) === null) setGuessError('Type a number such as 60 or 57.5.'); } }} inputMode="decimal" aria-label="Your predicted value" placeholder="my prediction" className="flex-1 min-w-0 h-12 px-3 rounded-xl bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" />
                <button type="button" onClick={() => { if (recordNumeric(guess) === null) setGuessError('Type a number such as 60 or 57.5.'); }} className="min-h-12 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs">Lock in</button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border text-xs text-slate-200 space-y-1" role="status">
                <div className="font-mono text-slate-400">Your prediction: <span className="text-white font-bold">{progress.predictionText} {np.unit}</span></div>
                <div className={`font-bold ${progress.predictionVerdict === 'exact' ? 'text-emerald-300' : progress.predictionVerdict === 'close' ? 'text-sky-300' : 'text-amber-300'}`}>
                  {progress.predictionVerdict === 'exact' && `Exactly right: ${formatSmart(np.correct, 3)} ${np.unit}.`}
                  {progress.predictionVerdict === 'close' && `Very close! The true value is ${formatSmart(np.correct, 3)} ${np.unit}.`}
                  {progress.predictionVerdict === 'naive' && `That is the plain average of the two averages. The true combined average is ${formatSmart(np.correct, 3)} ${np.unit}, so let’s find out why they differ.`}
                  {progress.predictionVerdict === 'other' && `The true value is ${formatSmart(np.correct, 3)} ${np.unit}. Let’s see why in the experiment.`}
                </div>
                <div>{np.explanation}</div>
              </div>
            )}
            {guessError && <div className="text-xs text-amber-300" role="alert">{guessError}</div>}
          </div>
        )}

        {stage === 'predict' && lesson.predictionQuestion && (
          <div className={sec}>
            <p className="text-sm font-semibold text-white">{lesson.predictionQuestion.question}</p>
            <p className="text-xs text-slate-400">Make your best prediction first. Nothing is revealed until you choose.</p>
            <div className="space-y-2" role="radiogroup" aria-label="Prediction options">
              {lesson.predictionQuestion.options.map((o, i) => {
                const chosen = progress?.predictionOption;
                const locked = progress?.predictionMade;
                const right = lesson.predictionQuestion!.correctIndex === i;
                let cls = 'bg-surface-card border-surface-border text-slate-200 hover:bg-surface-elevated';
                if (locked && chosen === i) cls = right ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-amber-500/15 border-amber-500 text-amber-100';
                else if (locked && right) cls = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200';
                return <button key={i} type="button" role="radio" aria-checked={chosen === i} disabled={locked} onClick={() => recordPrediction(i, i === lesson.predictionQuestion!.correctIndex)} className={`w-full min-h-12 p-3 rounded-xl border text-left text-sm ${cls}`}>{o}</button>;
              })}
            </div>
            {progress?.predictionMade && (
              <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border text-xs text-slate-200 space-y-1" role="status">
                <div className={`font-bold ${progress.predictionIsCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>{progress.predictionIsCorrect ? 'Your prediction matches. Now test it yourself.' : 'Interesting! Your prediction differs. The experiment will show what happens.'}</div>
                <div>{lesson.predictionQuestion.explanation}</div>
              </div>
            )}
          </div>
        )}

        {stage === 'experiment' && (
          <div className={sec}>
            <p className="text-sm text-white font-semibold">{lesson.experimentGuide.instruction}</p>
            {lesson.experimentGuide.actionHint && <p className="text-xs text-slate-400">Tip: {lesson.experimentGuide.actionHint}</p>}
            {need > 0 && (
              <div className="space-y-1" role="status" aria-live="polite">
                <div className="flex justify-between text-xs font-mono text-slate-300"><span>{lesson.experimentGuide.targetActionDescription}</span><span className={count >= need ? 'text-emerald-300 font-bold' : ''}>{Math.min(count, need)} / {need}</span></div>
                <div className="h-2 rounded-full bg-surface-lowest border border-surface-border overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all" style={{ width: `${Math.min(100, (count / need) * 100)}%` }} /></div>
              </div>
            )}
          </div>
        )}

        {stage === 'observe' && (
          <div className={sec}>
            <p className="text-sm text-white font-semibold">{lesson.observeGuide.prompt}</p>
            <div className="text-[11px] font-mono font-bold text-slate-400">What you found ({progress?.observations.length ?? 0})</div>
            <ul className="space-y-1 max-h-52 overflow-y-auto text-xs font-mono text-slate-200">
              {(progress?.observations ?? []).slice(-10).map((o, i) => <li key={i} className="p-2 rounded-lg bg-surface-card border border-surface-border">{o.text}</li>)}
              {(progress?.observations.length ?? 0) === 0 && <li className="text-slate-500">Nothing recorded yet. Go back to the Experiment stage.</li>}
            </ul>
            {(progress?.observations.length ?? 0) > 0 && (
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs text-slate-200 space-y-1">
                <div><span className="font-bold text-sky-300">Pattern: </span>{lesson.observeGuide.expectedPattern}</div>
                <div><span className="font-bold text-sky-300">What stays the same: </span>{lesson.observeGuide.invariantsDescription}</div>
              </div>
            )}
          </div>
        )}

        {stage === 'explain' && (
          <div className={sec}>
            <p className="text-sm text-slate-100 leading-relaxed">{lesson.whyGuide.explanation}</p>
            <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs text-emerald-100"><span className="font-bold">Takeaway: </span>{lesson.whyGuide.deductiveTakeaway}</div>
          </div>
        )}

        {stage === 'practice' && (
          <div className={sec}>
            <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Practice questions">
              {lesson.practiceQuestionIds.map((id, i) => <button key={id} type="button" role="tab" aria-selected={practiceIndex === i} onClick={() => setPracticeIndex(i)} className={`w-10 h-10 rounded-lg text-xs font-mono font-bold border ${practiceIndex === i ? 'bg-purple-600 text-white border-purple-300' : 'bg-surface-card text-slate-300 border-surface-border'}`}>{i + 1}</button>)}
            </div>
            {(() => {
              const qn = getPracticeQuestionById(lesson.practiceQuestionIds[Math.min(practiceIndex, lesson.practiceQuestionIds.length - 1)]);
              return qn ? <QuestionCard key={qn.id} question={qn} compact /> : null;
            })()}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 p-2.5 sm:p-3 border-t border-surface-border bg-surface-low space-y-2">
        {done ? (
          <div className="space-y-2" role="status">
            <div className={`p-3 rounded-xl text-xs font-bold border ${status === 'mastered' ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200' : 'bg-amber-500/10 border-amber-500/40 text-amber-200'}`}>
              {status === 'mastered' ? 'Lesson complete: mastery earned from your own prediction, experiments and practice.' : status === 'demonstrated' ? 'Shown as a teacher demonstration. Marked complete but NOT as mastery.' : 'Lesson complete. Mastery needs most practice questions right on the first try.'}
            </div>
            {nextId ? <button type="button" onClick={() => navigate(`/mathematics/understanding-data/workbench?lesson=${nextId}`)} className="w-full min-h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs">Next lesson: {UD_GUIDED_LESSONS[nextId].title} →</button>
              : <button type="button" onClick={() => navigate('/mathematics/understanding-data')} className="w-full min-h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs">Back to the chapter →</button>}
          </div>
        ) : (
          <>
            {gate.reason && <div className={`text-xs ${teacherMode ? 'text-sky-300' : 'text-amber-300'}`} role="status">{gate.reason}</div>}
            <div className="flex gap-2">
              <button type="button" disabled={idx <= 0} onClick={() => setStage(lesson.stages[idx - 1])} className="min-h-11 px-4 rounded-xl bg-surface-card border border-surface-border text-slate-200 font-mono font-bold text-xs disabled:opacity-40">← Back</button>
              <button type="button" disabled={!gate.ok && !teacherMode} onClick={advance} className="flex-1 min-h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs disabled:opacity-40">{isLast ? 'Finish lesson' : `Next: ${STAGE_LABEL[lesson.stages[idx + 1]]} →`}</button>
            </div>
          </>
        )}
        <label className="flex items-center gap-2 text-[11px] font-mono text-slate-400 min-h-11">
          <input type="checkbox" title="Teacher demonstration: skips the gates and is never recorded as mastery" checked={teacherMode} onChange={(e) => setTeacherMode(e.target.checked)} className="w-4 h-4" />
          Teacher demo (skips gates, no mastery)
        </label>
      </div>
    </div>
  );
};
