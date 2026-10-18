/**
 * Practice question card (M5). Renders every question type from its data:
 * the diagram is drawn from the same equations that produced the answer.
 */

import React, { useState } from 'react';
import { useTwoVariablesStore, hasAnswered } from '../../../store/useTwoVariablesStore';
import { checkPracticeAnswer } from '../../../engine/mathematics/twoVariables/practiceBank';
import type { TVPracticeQuestion, UserAnswer } from '../../../engine/mathematics/twoVariables/types';
import { GraphCanvas } from './GraphCanvas';
import { LINE_1_COLOR, LINE_2_COLOR } from './SystemExplorer';

interface Props {
  question: TVPracticeQuestion;
  compact?: boolean;
}

const diffStyle = { basic: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', standard: 'bg-sky-500/20 text-sky-300 border-sky-500/40', challenge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };

export const QuestionCard: React.FC<Props> = ({ question: q, compact = false }) => {
  const attempt = useTwoVariablesStore((s) => s.practiceAnswers[q.id]);
  const submit = useTwoVariablesStore((s) => s.submitPracticeAnswer);
  const reveal = useTwoVariablesStore((s) => s.revealPracticeHint);
  const toggleSolution = useTwoVariablesStore((s) => s.togglePracticeSolution);
  const retry = useTwoVariablesStore((s) => s.retryPracticeQuestion);

  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [xText, setXText] = useState('');
  const [yText, setYText] = useState('');
  const [clicked, setClicked] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const answered = hasAnswered(attempt) && attempt!.userAnswerText !== '';
  const correct = answered && attempt!.isCorrect;

  const buildAnswer = (): UserAnswer | null => {
    switch (q.questionType) {
      case 'multiple_choice':
        return choice === null ? null : { kind: 'choice', index: choice };
      case 'numeric':
        return text.trim() === '' ? null : { kind: 'number', text };
      case 'ordered_pair':
        return xText.trim() === '' || yText.trim() === '' ? null : { kind: 'pair', xText, yText };
      case 'graph_point':
        return clicked ? { kind: 'graph_point', x: clicked.x, y: clicked.y } : null;
    }
  };

  const answerLabel = (a: UserAnswer): string => {
    switch (a.kind) {
      case 'choice': return `option ${String.fromCharCode(65 + a.index)}`;
      case 'number': return a.text;
      case 'pair': return `(${a.xText}, ${a.yText})`;
      case 'graph_point': return `(${a.x}, ${a.y})`;
    }
  };

  const onSubmit = () => {
    const a = buildAnswer();
    if (!a) return setMessage('Choose or enter an answer first.');
    const res = checkPracticeAnswer(q, a);
    if (res.invalid) return setMessage('That is not a number. Use digits, decimals or fractions like 3/2.');
    setMessage(null);
    submit(q.id, answerLabel(a), res.correct);
  };

  const onRetry = () => {
    setChoice(null);
    setText('');
    setXText('');
    setYText('');
    setClicked(null);
    setMessage(null);
    retry(q.id);
  };

  const d = q.diagram;
  const linesVisible = d ? d.showLines || answered : false;
  const interactive = q.questionType === 'graph_point' && !answered;

  return (
    <article className={`bg-surface-card rounded-2xl border border-surface-border ${compact ? 'p-3.5 space-y-3.5' : 'p-5 sm:p-6 space-y-5'}`} aria-label={q.title}>
      <header className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${diffStyle[q.difficulty]}`}>{q.difficulty}</span>
        <span className="text-[11px] font-mono text-slate-400">{q.title}</span>
      </header>

      <p className="text-base font-semibold text-white leading-relaxed">{q.statement}</p>

      {d && (
        <div className={`rounded-xl overflow-hidden border border-surface-border ${compact ? 'h-56' : 'h-64 sm:h-80'}`}>
          <GraphCanvas
            lines={linesVisible ? d.lines.map((l) => ({ eq: l.eq, color: l.colorIndex === 0 ? LINE_1_COLOR : LINE_2_COLOR, dashed: l.colorIndex === 1, label: l.label })) : []}
            extent={d.extent}
            onWorldClick={interactive ? (x, y) => setClicked({ x: Math.round(x), y: Math.round(y) }) : undefined}
            clickMarker={clicked ? { ...clicked, correct: answered ? correct : undefined } : null}
            ariaLabel={`Diagram for: ${q.title}`}
          />
        </div>
      )}
      {q.questionType === 'graph_point' && !answered && (
        <p className="text-xs font-mono text-slate-400">{clicked ? `Selected point: (${clicked.x}, ${clicked.y})` : 'Tap or click a grid point to choose it.'}</p>
      )}

      {q.questionType === 'multiple_choice' && q.options && (
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {q.options.map((opt, i) => {
            const picked = answered ? attempt!.userAnswerText === `option ${String.fromCharCode(65 + i)}` : choice === i;
            const isRight = q.answer.kind === 'choice' && q.answer.index === i;
            let cls = 'bg-surface-lowest border-surface-border text-slate-200 hover:bg-surface-elevated';
            if (answered && picked) cls = correct ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-rose-500/20 border-rose-500 text-rose-100';
            else if (answered && isRight && attempt!.showSolution) cls = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200';
            else if (!answered && picked) cls = 'bg-purple-600/30 border-purple-400 text-white';
            return (
              <button key={i} type="button" role="radio" aria-checked={picked} disabled={answered} onClick={() => setChoice(i)} className={`w-full min-h-12 p-3 rounded-xl border text-left text-sm flex items-start gap-3 ${cls}`}>
                <span className="w-6 h-6 rounded-full border border-surface-border flex items-center justify-center text-[11px] font-mono font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                <span className="leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {q.questionType === 'numeric' && (
        <label className="block text-xs font-mono text-slate-400">
          Your answer
          <input value={answered ? attempt!.userAnswerText : text} disabled={answered} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !answered && onSubmit()} inputMode="decimal" placeholder="e.g. 4, -2/3, 1.5" className="mt-1 block w-full max-w-xs h-12 px-3 rounded-xl bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" />
        </label>
      )}

      {q.questionType === 'ordered_pair' && (
        <div className="flex items-end gap-2 text-xs font-mono text-slate-400">
          <span className="pb-3 text-lg text-white">(</span>
          <label>x<input value={answered ? attempt!.userAnswerText.replace(/[()]/g, '').split(',')[0]?.trim() ?? '' : xText} disabled={answered} onChange={(e) => setXText(e.target.value)} inputMode="decimal" aria-label="x value" className="mt-1 block w-24 h-12 px-3 rounded-xl bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" /></label>
          <span className="pb-3 text-lg text-white">,</span>
          <label>y<input value={answered ? attempt!.userAnswerText.replace(/[()]/g, '').split(',')[1]?.trim() ?? '' : yText} disabled={answered} onChange={(e) => setYText(e.target.value)} inputMode="decimal" aria-label="y value" className="mt-1 block w-24 h-12 px-3 rounded-xl bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" /></label>
          <span className="pb-3 text-lg text-white">)</span>
        </div>
      )}

      {answered && (
        <div className={`text-sm font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`} role="status" aria-live="polite">
          {correct ? 'Correct!' : 'Not quite. Try a hint, or retry.'}
        </div>
      )}
      {message && <div className="text-xs text-amber-300" role="alert">{message}</div>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!answered ? (
          <button type="button" onClick={onSubmit} className="min-h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs">Submit answer</button>
        ) : (
          <button type="button" onClick={onRetry} className="min-h-11 px-4 rounded-xl bg-surface-elevated border border-surface-border text-slate-200 font-mono font-bold text-xs">Retry</button>
        )}
        {q.hints.length > 0 && (
          <button type="button" onClick={() => reveal(q.id)} disabled={(attempt?.hintsRevealed ?? 0) >= q.hints.length} className="min-h-11 px-3 text-xs font-mono text-amber-300 hover:text-amber-200 disabled:opacity-40">
            Hint ({attempt?.hintsRevealed ?? 0}/{q.hints.length})
          </button>
        )}
        <button type="button" onClick={() => toggleSolution(q.id)} className="min-h-11 px-3 text-xs font-mono text-slate-400 hover:text-white underline">
          {attempt?.showSolution ? 'Hide solution' : 'Show solution'}
        </button>
      </div>

      {attempt && attempt.hintsRevealed > 0 && (
        <ul className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-1.5 text-xs text-slate-200">
          {q.hints.slice(0, attempt.hintsRevealed).map((h, i) => <li key={i}><span className="text-amber-400 font-bold">{i + 1}. </span>{h}</li>)}
        </ul>
      )}

      {attempt?.showSolution && (
        <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border space-y-2 text-xs">
          <div className="font-mono font-bold text-emerald-400">Worked solution</div>
          <ol className="space-y-1 text-slate-300 list-decimal list-inside">{q.workedSolution.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <p className="text-slate-400 pt-1 border-t border-surface-border/40">Takeaway: {q.explanation}</p>
        </div>
      )}
    </article>
  );
};
