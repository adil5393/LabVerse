import React, { useState } from 'react';
import { evaluateAnswer } from '../../engine/education/evaluate';
import type { AnswerInput, Evaluation, Question } from '../../engine/education/types';
import { VisualHost } from './visuals';

/** Feedback panel: says what is wrong and what to think about, never a bare "Incorrect". */
export const MisconceptionFeedback: React.FC<{ evaluation: Evaluation; onRefresher?: (id: string) => void }> = ({ evaluation, onRefresher }) => (
  <div
    role="status"
    aria-live="polite"
    data-testid="feedback"
    data-correct={evaluation.correct}
    className={`rounded-xl border p-3 text-sm leading-relaxed ${evaluation.correct ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-100' : 'border-amber-500/40 bg-amber-950/30 text-amber-100'}`}
  >
    <div className="font-bold flex items-center gap-1.5 mb-1">
      <span className="material-symbols-outlined text-[18px]" aria-hidden>{evaluation.correct ? 'check_circle' : 'lightbulb'}</span>
      {evaluation.correct ? 'Yes, that works' : evaluation.invalid ? 'Check your answer' : 'Not quite, here is why'}
    </div>
    <p>{evaluation.message}</p>
    {!evaluation.correct && evaluation.refresherId && onRefresher && (
      <button type="button" onClick={() => onRefresher(evaluation.refresherId!)} className="mt-2 min-h-[44px] px-3 rounded-lg border border-amber-400/50 text-amber-200 text-xs font-bold hover:bg-amber-500/10">
        Review the idea behind this
      </button>
    )}
  </div>
);

export interface QuestionViewProps {
  question: Question;
  /** Called for every readable submission. */
  onSubmit?: (evaluation: Evaluation, question: Question, input: AnswerInput) => void;
  onRefresher?: (id: string) => void;
  /** Stop accepting answers after the first correct one. Default true. */
  lockOnCorrect?: boolean;
  disabled?: boolean;
  submitLabel?: string;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ question, onSubmit, onRefresher, lockOnCorrect = true, disabled, submitLabel = 'Check answer' }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<Evaluation | null>(null);
  const done = result?.correct === true && lockOnCorrect;
  const inputId = `q-${question.id}`;

  const submit = (input: AnswerInput) => {
    const ev = evaluateAnswer(question, input);
    setResult(ev);
    onSubmit?.(ev, question, input);
  };

  return (
    <div className="space-y-3" data-question={question.id}>
      <p id={`${inputId}-p`} className="text-sm md:text-base text-white font-medium leading-relaxed">{question.prompt}</p>
      {question.kind !== 'visual' && question.visual && <VisualHost visual={question.visual} />}

      {question.kind === 'visual' && (
        <VisualHost
          visual={question.visual}
          locked={done || disabled}
          onAnswer={(id) => {
            if (done || disabled) return;
            setSelected(id);
            submit({ kind: 'visual', id });
          }}
        />
      )}

      {question.kind === 'choice' && (
        <div role="radiogroup" aria-labelledby={`${inputId}-p`} className="grid gap-2">
          {question.options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected === o.id}
              disabled={done || disabled}
              data-option={o.id}
              onClick={() => { setSelected(o.id); setResult(null); }}
              className={`text-left min-h-[48px] px-4 py-2 rounded-xl border text-sm transition-colors ${selected === o.id ? 'border-cyan-400 bg-cyan-500/15 text-white' : 'border-surface-border bg-surface-card text-slate-200 hover:border-slate-500'} disabled:opacity-70`}
            >
              {o.text}
            </button>
          ))}
          <button
            type="button"
            disabled={selected === null || done || disabled}
            onClick={() => selected && submit({ kind: 'choice', id: selected })}
            className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40"
          >
            {submitLabel}
          </button>
        </div>
      )}

      {question.kind === 'numeric' && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); if (!done && !disabled) submit({ kind: 'numeric', text }); }}
        >
          <label htmlFor={inputId} className="sr-only">Your answer</label>
          <input
            id={inputId}
            inputMode="decimal"
            autoComplete="off"
            value={text}
            disabled={done || disabled}
            onChange={(e) => { setText(e.target.value); setResult(null); }}
            className="w-32 min-h-[48px] px-3 rounded-xl bg-surface-lowest border border-surface-border text-white font-mono text-base focus:border-cyan-400 outline-none"
          />
          {question.unit && <span className="text-sm text-slate-300">{question.unit}</span>}
          <button type="submit" disabled={done || disabled || text.trim() === ''} className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40">
            {submitLabel}
          </button>
        </form>
      )}

      {result && <MisconceptionFeedback evaluation={result} onRefresher={onRefresher} />}
    </div>
  );
};
