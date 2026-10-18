/**
 * Practice question card (M6). The table, chart, answer, hints and worked
 * solution all come from the same data (see practiceBank.ts).
 */

import React, { useState } from 'react';
import { useUnderstandingDataStore, hasAnswered } from '../../../store/useUnderstandingDataStore';
import { checkPracticeAnswer } from '../../../engine/mathematics/understandingData/practiceBank';
import type { UDPracticeQuestion, UserAnswer } from '../../../engine/mathematics/understandingData/types';
import { StackedChart } from './StackedChart';
import { ClusteredChart } from './ClusteredChart';
import { PieChart } from './PieChart';

const diff = { basic: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', standard: 'bg-sky-500/20 text-sky-300 border-sky-500/40', challenge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };

export const QuestionCard: React.FC<{ question: UDPracticeQuestion; compact?: boolean }> = ({ question: qn, compact = false }) => {
  const attempt = useUnderstandingDataStore((s) => s.practiceAnswers[qn.id]);
  const submit = useUnderstandingDataStore((s) => s.submitPracticeAnswer);
  const reveal = useUnderstandingDataStore((s) => s.revealPracticeHint);
  const toggleSolution = useUnderstandingDataStore((s) => s.togglePracticeSolution);
  const retry = useUnderstandingDataStore((s) => s.retryPracticeQuestion);

  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<{ groupId: string; categoryId?: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const answered = hasAnswered(attempt) && attempt!.userAnswerText !== '';
  const correct = answered && attempt!.isCorrect;

  const build = (): UserAnswer | null => {
    switch (qn.inputType) {
      case 'multiple_choice': return choice === null ? null : { kind: 'choice', index: choice };
      case 'numeric': return text.trim() === '' ? null : { kind: 'number', text };
      case 'chart_select':
        if (!picked) return null;
        return qn.answer.kind === 'bar' ? { kind: 'bar', groupId: picked.groupId } : picked.categoryId ? { kind: 'segment', groupId: picked.groupId, categoryId: picked.categoryId } : null;
    }
  };
  const label = (a: UserAnswer): string => (a.kind === 'choice' ? `option ${String.fromCharCode(65 + a.index)}` : a.kind === 'number' ? a.text : a.kind === 'bar' ? `bar ${a.groupId}` : `${a.groupId}/${a.categoryId}`);

  const onSubmit = () => {
    const a = build();
    if (!a) return setMessage(qn.inputType === 'chart_select' ? 'Tap an answer on the chart first.' : 'Choose or enter an answer first.');
    const res = checkPracticeAnswer(qn, a);
    if (res.invalid) return setMessage('That is not a number. Use digits, decimals or fractions like 3/2.');
    setMessage(null);
    submit(qn.id, label(a), res.correct);
  };
  const onRetry = () => { setChoice(null); setText(''); setPicked(null); setMessage(null); retry(qn.id); };

  const answerMode = qn.inputType === 'chart_select' && !answered ? (qn.answer.kind === 'bar' ? 'bar' : 'segment') : 'none';
  const marked = qn.inputType === 'chart_select' && picked ? { groupId: picked.groupId, categoryId: qn.answer.kind === 'bar' ? undefined : picked.categoryId, correct: answered ? correct : null } : null;

  return (
    <article className={`bg-surface-card rounded-2xl border border-surface-border ${compact ? 'p-3.5 space-y-3.5' : 'p-5 sm:p-6 space-y-5'}`} aria-label={qn.title}>
      <header className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${diff[qn.difficulty]}`}>{qn.difficulty}</span>
        <span className="text-[11px] font-mono text-slate-400">{qn.title}</span>
      </header>
      <p className="text-base font-semibold text-white leading-relaxed">{qn.statement}</p>

      {qn.givens && (
        <div className="rounded-xl border border-surface-border bg-surface-lowest p-2">
          <table className="w-full text-xs font-mono text-slate-100">
            <thead><tr className="text-slate-400 text-left">{qn.givens.headers.map((h, i) => <th key={i} scope="col" className="py-1 pr-3">{h}</th>)}</tr></thead>
            <tbody>{qn.givens.rows.map((r, i) => <tr key={i} className="border-t border-surface-border/50">{r.map((c, j) => <td key={j} className="py-1 pr-3">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}

      {qn.chart && (
        <div className="rounded-xl border border-surface-border bg-surface-lowest p-2">
          {qn.chart.mode === 'clustered' ? (
            <ClusteredChart
              dataset={qn.chart.dataset}
              by={qn.chart.clusterBy ?? 'group'}
              answerMode={answerMode}
              onSelect={answerMode === 'segment' ? (g, c) => setPicked({ groupId: g, categoryId: c }) : undefined}
              onSelectBar={answerMode === 'bar' ? (g) => setPicked({ groupId: g }) : undefined}
              marked={marked}
            />
          ) : qn.chart.mode === 'pie' ? (
            <PieChart
              dataset={qn.chart.dataset}
              groupId={qn.chart.pieGroupId ?? qn.chart.dataset.groups[0].id}
              answerMode={answerMode === 'segment' ? 'segment' : 'none'}
              onSelect={answerMode === 'segment' ? (g, c) => setPicked({ groupId: g, categoryId: c }) : undefined}
              marked={marked}
            />
          ) : (
            <StackedChart
              dataset={qn.chart.dataset}
              mode={qn.chart.mode}
              answerMode={answerMode}
              onSelect={answerMode === 'segment' ? (g, c) => setPicked({ groupId: g, categoryId: c }) : undefined}
              onSelectBar={answerMode === 'bar' ? (g) => setPicked({ groupId: g }) : undefined}
              marked={marked}
            />
          )}
        </div>
      )}
      {qn.inputType === 'chart_select' && !answered && <p className="text-xs font-mono text-slate-400">{picked ? 'Your choice is outlined. Press Submit to check it.' : 'Tap or press a segment or bar on the chart to choose it.'}</p>}

      {qn.inputType === 'multiple_choice' && qn.options && (
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {qn.options.map((o, i) => {
            const isPicked = answered ? attempt!.userAnswerText === `option ${String.fromCharCode(65 + i)}` : choice === i;
            const right = qn.answer.kind === 'choice' && qn.answer.index === i;
            let cls = 'bg-surface-lowest border-surface-border text-slate-200 hover:bg-surface-elevated';
            if (answered && isPicked) cls = correct ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-rose-500/20 border-rose-500 text-rose-100';
            else if (answered && right && attempt!.showSolution) cls = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200';
            else if (!answered && isPicked) cls = 'bg-purple-600/30 border-purple-400 text-white';
            return (
              <button key={i} type="button" role="radio" aria-checked={isPicked} disabled={answered} onClick={() => setChoice(i)} className={`w-full min-h-12 p-3 rounded-xl border text-left text-sm flex items-start gap-3 ${cls}`}>
                <span className="w-6 h-6 rounded-full border border-surface-border flex items-center justify-center text-[11px] font-mono font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                <span className="leading-snug">{o}</span>
              </button>
            );
          })}
        </div>
      )}

      {qn.inputType === 'numeric' && (
        <label className="block text-xs font-mono text-slate-400">
          Your answer{qn.unit ? ` (${qn.unit})` : ''}
          <input value={answered ? attempt!.userAnswerText : text} disabled={answered} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !answered && onSubmit()} inputMode="decimal" placeholder="e.g. 62, 3/2, 4.75" className="mt-1 block w-full max-w-xs h-12 px-3 rounded-xl bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" />
        </label>
      )}

      {answered && <div className={`text-sm font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`} role="status" aria-live="polite">{correct ? 'Correct!' : 'Not quite. Try a hint, or retry.'}</div>}
      {message && <div className="text-xs text-amber-300" role="alert">{message}</div>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!answered ? (
          <button type="button" onClick={onSubmit} className="min-h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs">Submit answer</button>
        ) : (
          <button type="button" onClick={onRetry} className="min-h-11 px-4 rounded-xl bg-surface-elevated border border-surface-border text-slate-200 font-mono font-bold text-xs">Retry</button>
        )}
        {qn.hints.length > 0 && (
          <button type="button" onClick={() => reveal(qn.id)} disabled={(attempt?.hintsRevealed ?? 0) >= qn.hints.length} className="min-h-11 px-3 text-xs font-mono text-amber-300 hover:text-amber-200 disabled:opacity-40">Hint ({attempt?.hintsRevealed ?? 0}/{qn.hints.length})</button>
        )}
        <button type="button" onClick={() => toggleSolution(qn.id)} className="min-h-11 px-3 text-xs font-mono text-slate-400 hover:text-white underline">{attempt?.showSolution ? 'Hide solution' : 'Show solution'}</button>
      </div>

      {attempt && attempt.hintsRevealed > 0 && (
        <ul className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-1.5 text-xs text-slate-200">
          {qn.hints.slice(0, attempt.hintsRevealed).map((h, i) => <li key={i}><span className="text-amber-400 font-bold">{i + 1}. </span>{h}</li>)}
        </ul>
      )}
      {attempt?.showSolution && (
        <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border space-y-2 text-xs">
          <div className="font-mono font-bold text-emerald-400">Worked solution</div>
          <ol className="space-y-1 text-slate-300 list-decimal list-inside">{qn.workedSolution.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <p className="text-slate-400 pt-1 border-t border-surface-border/40">Takeaway: {qn.explanation}</p>
        </div>
      )}
    </article>
  );
};
