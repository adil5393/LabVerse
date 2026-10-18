/**
 * Chapter Practice (M5): Basic / Standard / Challenge question bank.
 */

import React from 'react';
import { useTwoVariablesStore, hasAnswered } from '../../../store/useTwoVariablesStore';
import { TWO_VARIABLES_PRACTICE_BANK, getPracticeQuestionById } from '../../../engine/mathematics/twoVariables/practiceBank';
import { QuestionCard } from './QuestionCard';

export const PracticePanel: React.FC = () => {
  const activeId = useTwoVariablesStore((s) => s.activePracticeQuestionId);
  const select = useTwoVariablesStore((s) => s.selectPracticeQuestion);
  const filter = useTwoVariablesStore((s) => s.practiceDifficultyFilter);
  const setFilter = useTwoVariablesStore((s) => s.setPracticeDifficultyFilter);
  const answers = useTwoVariablesStore((s) => s.practiceAnswers);

  const list = filter === 'all' ? TWO_VARIABLES_PRACTICE_BANK : TWO_VARIABLES_PRACTICE_BANK.filter((q) => q.difficulty === filter);
  const active = list.find((q) => q.id === activeId) ?? getPracticeQuestionById(activeId) ?? list[0];
  const shown = list.includes(active) ? active : list[0];

  const answeredCount = list.filter((q) => hasAnswered(answers[q.id])).length;
  const correctCount = list.filter((q) => answers[q.id]?.firstAttemptCorrect && hasAnswered(answers[q.id])).length;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4">
        <div className="bg-surface-card p-4 rounded-2xl border border-surface-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">Chapter Practice</span>
              <h2 className="text-lg font-bold text-white">Two Variables, One Line</h2>
            </div>
            <div className="flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs font-mono" role="tablist" aria-label="Difficulty">
              {(['all', 'basic', 'standard', 'challenge'] as const).map((d) => (
                <button key={d} type="button" role="tab" aria-selected={filter === d} onClick={() => setFilter(d)} className={`min-h-10 px-3 rounded-lg font-bold capitalize ${filter === d ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="text-xs font-mono flex justify-between text-slate-300">
            <span>{answeredCount} of {list.length} answered</span>
            <span className="text-emerald-400 font-bold">{correctCount} correct on first try</span>
          </div>
          <div className="h-2 bg-surface-lowest rounded-full overflow-hidden border border-surface-border">
            <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400" style={{ width: `${list.length ? (answeredCount / list.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Questions">
          {list.map((q, i) => {
            const a = answers[q.id];
            const done = hasAnswered(a);
            return (
              <button
                key={q.id}
                type="button"
                role="tab"
                aria-selected={q.id === shown.id}
                aria-label={`Question ${i + 1}${done ? (a.isCorrect ? ', correct' : ', incorrect') : ''}`}
                onClick={() => select(q.id)}
                className={`w-11 h-11 rounded-xl font-mono text-xs font-bold shrink-0 border ${q.id === shown.id ? 'bg-purple-600 text-white border-purple-300' : done && a.isCorrect ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : done ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-surface-card text-slate-400 border-surface-border'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {shown && <QuestionCard key={shown.id} question={shown} />}
      </div>
    </div>
  );
};
