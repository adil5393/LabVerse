import React, { useState } from 'react';
import { evaluateAnswer } from '../../engine/education/evaluate';
import type { AnswerInput, Evaluation, Question } from '../../engine/education/types';
import { useJudges } from './judges';
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
  savedAttempt?: { input: AnswerInput; evaluation: Evaluation };
}

export const QuestionView: React.FC<QuestionViewProps> = ({ question, onSubmit, onRefresher, lockOnCorrect = true, disabled, submitLabel = 'Check answer', savedAttempt }) => {
  const previousInput = savedAttempt?.input;
  const [selected, setSelected] = useState<string | null>(previousInput && (previousInput.kind === 'choice' || previousInput.kind === 'visual') ? previousInput.id : null);
  const [text, setText] = useState(previousInput?.kind === 'numeric' ? previousInput.text : '');
  const [result, setResult] = useState<Evaluation | null>(savedAttempt?.evaluation ?? null);
  const judges = useJudges();
  const [order, setOrder] = useState<string[]>(() => previousInput?.kind === 'order' ? previousInput.ids : question.kind === 'order' ? question.items.map((i) => i.id) : []);
  const done = result?.correct === true && lockOnCorrect;
  const inputId = `q-${question.id}`;

  const submit = (input: AnswerInput) => {
    const ev = evaluateAnswer(question, input, judges);
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

      {question.kind === 'order' && (
        <div className="space-y-2">
          <ol className="space-y-2" aria-label="Steps. Use the arrow buttons to move a step up or down.">
            {order.map((id, i) => {
              const item = question.items.find((x) => x.id === id)!;
              const move = (d: number) => {
                const j = i + d;
                if (j < 0 || j >= order.length) return;
                const next = [...order];
                [next[i], next[j]] = [next[j], next[i]];
                setOrder(next);
                setResult(null);
              };
              return (
                <li key={id} data-order-item={id} className="flex items-stretch gap-2 rounded-xl border border-surface-border bg-surface-card">
                  <span className="font-mono text-amber-400 px-3 flex items-center text-sm" aria-hidden>{i + 1}</span>
                  <span className="flex-1 py-3 text-sm text-slate-100">{item.text}</span>
                  <span className="flex flex-col">
                    <button type="button" disabled={done || disabled || i === 0} onClick={() => move(-1)} aria-label={`Move step ${i + 1} up`} className="min-w-[48px] min-h-[44px] flex-1 text-slate-200 hover:text-white disabled:opacity-30">{'\u25B2'}</button>
                    <button type="button" disabled={done || disabled || i === order.length - 1} onClick={() => move(1)} aria-label={`Move step ${i + 1} down`} className="min-w-[48px] min-h-[44px] flex-1 text-slate-200 hover:text-white disabled:opacity-30">{'\u25BC'}</button>
                  </span>
                </li>
              );
            })}
          </ol>
          <button type="button" disabled={done || disabled} onClick={() => submit({ kind: 'order', ids: order })} className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40">
            {submitLabel === 'Check answer' ? 'Check the order' : submitLabel}
          </button>
        </div>
      )}

      {(question.kind === 'numeric' || question.kind === 'judged') && (
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
          {question.kind === 'numeric' && question.unit && <span className="text-sm text-slate-300">{question.unit}</span>}
          <button type="submit" disabled={done || disabled || text.trim() === ''} className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40">
            {submitLabel}
          </button>
        </form>
      )}

      {result && <MisconceptionFeedback evaluation={result} onRefresher={onRefresher} />}
    </div>
  );
};
