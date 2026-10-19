/**
 * Chapter Practice (M6): Basic / Standard / Challenge question bank.
 */

import React from 'react';
import { useUnderstandingDataStore, hasAnswered, isIndependent } from '../../../store/useUnderstandingDataStore';
import { UNDERSTANDING_DATA_PRACTICE_BANK as BANK, getPracticeQuestionById } from '../../../engine/mathematics/understandingData/practiceBank';
import { QuestionCard } from './QuestionCard';

export const PracticePanel: React.FC = () => {
  const activeId = useUnderstandingDataStore((s) => s.activePracticeQuestionId);
  const select = useUnderstandingDataStore((s) => s.selectPracticeQuestion);
  const filter = useUnderstandingDataStore((s) => s.practiceDifficultyFilter);
  const setFilter = useUnderstandingDataStore((s) => s.setPracticeDifficultyFilter);
  const answers = useUnderstandingDataStore((s) => s.practiceAnswers);

  const list = filter === 'all' ? BANK : BANK.filter((x) => x.difficulty === filter);
  const shown = list.find((x) => x.id === activeId) ?? (getPracticeQuestionById(activeId) && list.includes(getPracticeQuestionById(activeId)!) ? getPracticeQuestionById(activeId)! : list[0]);
  const answered = list.filter((x) => hasAnswered(answers[x.id])).length;
  const firstTry = list.filter((x) => isIndependent(answers[x.id])).length;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4">
        <div className="bg-surface-card p-4 rounded-2xl border border-surface-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">Chapter Practice</span>
              <h2 className="text-lg font-bold text-white">How Quantities Combine: Understanding Data</h2>
            </div>
            <div className="flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs font-mono" role="tablist" aria-label="Difficulty">
              {(['all', 'basic', 'standard', 'challenge'] as const).map((d) => (
                <button key={d} type="button" role="tab" aria-selected={filter === d} onClick={() => setFilter(d)} className={`min-h-11 px-3 rounded-lg font-bold capitalize ${filter === d ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="text-xs font-mono flex justify-between text-slate-300"><span>{answered} of {list.length} answered</span><span className="text-emerald-400 font-bold">{firstTry} correct on first try</span></div>
          <div className="h-2 bg-surface-lowest rounded-full overflow-hidden border border-surface-border"><div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400" style={{ width: `${list.length ? (answered / list.length) * 100 : 0}%` }} /></div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Questions">
          {list.map((x, i) => {
            const a = answers[x.id];
            const done = hasAnswered(a);
            return (
              <button key={x.id} type="button" role="tab" aria-selected={x.id === shown?.id} aria-label={`Question ${i + 1}${done ? (a.isCorrect ? ', correct' : ', incorrect') : ''}`} onClick={() => select(x.id)} className={`w-11 h-11 rounded-xl font-mono text-xs font-bold shrink-0 border ${x.id === shown?.id ? 'bg-purple-600 text-white border-purple-300' : done && a.isCorrect ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : done ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-surface-card text-slate-400 border-surface-border'}`}>{i + 1}</button>
            );
          })}
        </div>

        {shown && <QuestionCard key={shown.id} question={shown} />}
      </div>
    </div>
  );
};
