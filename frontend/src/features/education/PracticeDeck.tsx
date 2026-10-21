import { useRef, useState } from 'react';
import type { AnswerInput, Evaluation, Question } from '../../engine/education/types';
import { QuestionView } from './QuestionView';

interface Item { id: string; question: Question }
interface Group { id: string; title: string; blurb: string; items: Item[] }

/** Render one question at a time and restore submitted work when revisiting it. */
export function PracticeDeck({ groups, onAnswer }: { groups: Group[]; onAnswer: (item: Item, evaluation: Evaluation) => void }) {
  const items = groups.flatMap((group) => group.items.map((item) => ({ ...item, group })));
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, { input: AnswerInput; evaluation: Evaluation }>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const current = items[index];
  if (!current) return <p>No questions are available yet.</p>;
  const go = (next: number) => { setIndex(next); heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  return <section aria-label="Practice questions" className="space-y-4" data-testid="practice-deck">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 ref={heading} tabIndex={-1} className="text-lg font-bold outline-none scroll-mt-32" aria-live="polite">Question {index + 1} of {items.length}</h2>
      <label className="flex items-center gap-2 text-sm text-slate-400">Jump to
        <select aria-label="Choose a practice question" className="min-h-11 max-w-[200px] bg-surface border border-surface-border rounded-xl px-3 text-on-surface" value={index} onChange={(e) => go(Number(e.target.value))}>
          {groups.map((group) => <optgroup key={group.id} label={group.title} data-practice-category={group.id}>{items.map((item, i) => item.group.id === group.id && <option key={item.id} value={i} data-practice-option={item.id}>Question {i + 1}{attempts[item.id] ? ' · answered' : ''}</option>)}</optgroup>)}
        </select>
      </label>
    </div>
    <div className="h-1.5 rounded-full bg-surface-high overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(index + 1) / items.length * 100}%` }} /></div>
    <article className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6 space-y-4" data-practice-item={current.id}>
      <p className="text-sm font-semibold text-primary">{current.group.title}</p>
      <QuestionView key={current.id} question={current.question} savedAttempt={attempts[current.id]} onSubmit={(evaluation, _question, input) => {
        if (!evaluation.invalid) setAttempts((previous) => ({ ...previous, [current.id]: { input, evaluation } }));
        onAnswer(current, evaluation);
      }} />
    </article>
    <div className="flex items-center justify-between gap-3">
      <button type="button" className="min-h-12 px-4 rounded-xl border border-surface-border bg-surface font-semibold text-sm disabled:opacity-40" disabled={index === 0} onClick={() => go(index - 1)}>Previous</button>
      <button type="button" className="experience-primary disabled:opacity-40" disabled={index === items.length - 1} onClick={() => go(index + 1)}>Next question<span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_forward</span></button>
    </div>
    <p className="text-xs text-slate-400">Move at your own pace. You can return to any question.</p>
  </section>;
}
