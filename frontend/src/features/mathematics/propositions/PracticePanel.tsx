/**
 * Practice Engine Panel Component (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useState } from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  PROPOSITIONS_PRACTICE_BANK,
  getPracticeQuestionById,
} from '../../../engine/mathematics/propositions/practiceBank';

export const PracticePanel: React.FC = () => {
  const {
    activePracticeQuestionId,
    selectPracticeQuestion,
    practiceDifficultyFilter,
    setPracticeDifficultyFilter,
    practiceAnswers,
    submitPracticeAnswer,
    revealPracticeHint,
    togglePracticeSolution,
    retryPracticeQuestion,
  } = usePropositionsStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>('');

  const filteredQuestions =
    practiceDifficultyFilter === 'all'
      ? PROPOSITIONS_PRACTICE_BANK
      : PROPOSITIONS_PRACTICE_BANK.filter(
          (q) => q.difficulty === practiceDifficultyFilter
        );

  const activeQuestion =
    getPracticeQuestionById(activePracticeQuestionId) ||
    filteredQuestions[0] ||
    PROPOSITIONS_PRACTICE_BANK[0];

  const currentAttempt = practiceAnswers[activeQuestion.id];
  const isAnswered = currentAttempt !== undefined;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (activeQuestion.options && activeQuestion.options.length > 0) {
      if (selectedOption === null) return;
      const isCorrect = selectedOption === activeQuestion.correctAnswer;
      submitPracticeAnswer(activeQuestion.id, selectedOption, isCorrect);
    } else {
      const val = parseFloat(numericalInput);
      if (isNaN(val)) return;
      const target = Number(activeQuestion.correctAnswer);
      const tol = activeQuestion.acceptableTolerance || 0;
      const isCorrect = Math.abs(val - target) <= tol;
      submitPracticeAnswer(activeQuestion.id, val, isCorrect);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setNumericalInput('');
    retryPracticeQuestion(activeQuestion.id);
  };

  // Completion metrics
  const totalInFilter = filteredQuestions.length;
  const answeredInFilter = filteredQuestions.filter(
    (q) => practiceAnswers[q.id] !== undefined
  ).length;
  const correctInFilter = filteredQuestions.filter(
    (q) => practiceAnswers[q.id]?.isCorrect
  ).length;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full font-sans">
      {/* 1. Header & Difficulty Filter */}
      <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Chapter Practice Engine</span>
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Class 9 NCERT Ganita Manjari Assessment
            </h2>
          </div>

          {/* Difficulty Tiers Switcher */}
          <div className="flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs font-mono">
            {(['all', 'basic', 'standard', 'challenge'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setPracticeDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  practiceDifficultyFilter === diff
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-1.5 pt-2 border-t border-surface-border/60 text-xs font-mono">
          <div className="flex justify-between text-slate-300">
            <span>
              Progress: {answeredInFilter} of {totalInFilter} answered
            </span>
            <span className="text-emerald-400 font-bold">
              Score: {correctInFilter} Correct ({totalInFilter > 0 ? Math.round((correctInFilter / totalInFilter) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-2 bg-surface-lowest rounded-full overflow-hidden border border-surface-border">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
              style={{
                width: `${totalInFilter > 0 ? (answeredInFilter / totalInFilter) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Questions Carousel Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredQuestions.map((q, idx) => {
          const isSelected = q.id === activeQuestion.id;
          const status = practiceAnswers[q.id];
          return (
            <button
              key={q.id}
              onClick={() => {
                setSelectedOption(null);
                setNumericalInput('');
                selectPracticeQuestion(q.id);
              }}
              className={`w-9 h-9 rounded-xl font-mono text-xs font-bold shrink-0 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-lg border-2 border-purple-400'
                  : status?.isCorrect
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : status && !status.isCorrect
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-surface-card text-slate-400 border border-surface-border hover:bg-surface-elevated hover:text-white'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* 3. Active Question Card */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              {activeQuestion.difficulty}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeQuestion.ncertReference}
            </span>
          </div>

          <span className="text-xs font-mono text-amber-400 font-bold">
            Topic: {activeQuestion.topicId.replace('_', ' ')}
          </span>
        </div>

        {/* Question Statement */}
        <div className="text-base font-semibold text-white leading-relaxed">
          {activeQuestion.statement}
        </div>

        {/* Options / Input Station */}
        {activeQuestion.options && activeQuestion.options.length > 0 ? (
          <div className="space-y-2.5">
            {activeQuestion.options.map((opt, idx) => {
              const isPicked =
                currentAttempt?.userAnswer === idx || selectedOption === idx;
              const isCorrectOpt = idx === activeQuestion.correctAnswer;

              let btnClass = 'bg-surface-lowest border-surface-border text-slate-200 hover:bg-surface-elevated';
              if (isAnswered) {
                if (isPicked && currentAttempt.isCorrect) {
                  btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                } else if (isPicked && !currentAttempt.isCorrect) {
                  btnClass = 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold';
                } else if (isCorrectOpt && currentAttempt.showSolution) {
                  btnClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                }
              } else if (isPicked) {
                btnClass = 'bg-purple-600/30 border-purple-400 text-white font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${btnClass}`}
                >
                  <span className="w-5 h-5 rounded-full border border-surface-border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            <label className="text-slate-400 block font-bold">Enter Numerical Answer:</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                disabled={isAnswered}
                value={isAnswered ? String(currentAttempt.userAnswer) : numericalInput}
                onChange={(e) => setNumericalInput(e.target.value)}
                placeholder="Type number..."
                className="w-40 px-3 py-2 rounded-xl bg-surface-lowest border border-surface-border text-white text-base font-bold outline-none focus:border-purple-400"
              />
              {isAnswered && (
                <span
                  className={`px-3 py-1 rounded-lg font-bold ${
                    currentAttempt.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {currentAttempt.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Submit & Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border/60">
          <div className="flex items-center gap-2">
            {!isAnswered ? (
              <button
                onClick={handleSubmit}
                disabled={
                  activeQuestion.options
                    ? selectedOption === null
                    : numericalInput.trim() === ''
                }
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs disabled:opacity-40 transition-all shadow-md"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs border border-surface-border transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Retry</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeQuestion.hints.length > 0 && (
              <button
                onClick={() => revealPracticeHint(activeQuestion.id)}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
                <span>
                  Hint ({currentAttempt?.hintsRevealed || 0}/{activeQuestion.hints.length})
                </span>
              </button>
            )}

            <button
              onClick={() => togglePracticeSolution(activeQuestion.id)}
              className="text-xs font-mono text-slate-400 hover:text-white underline ml-2"
            >
              {currentAttempt?.showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          </div>
        </div>

        {/* Progressive Hints Accordion */}
        {currentAttempt && currentAttempt.hintsRevealed > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-2 text-xs font-mono">
            <span className="text-amber-300 font-bold block">Revealed Hints:</span>
            {activeQuestion.hints
              .slice(0, currentAttempt.hintsRevealed)
              .map((h, i) => (
                <div key={i} className="text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">{i + 1}.</span>
                  <span>{h}</span>
                </div>
              ))}
          </div>
        )}

        {/* Worked Solution Accordion */}
        {currentAttempt?.showSolution && (
          <div className="p-4 rounded-xl bg-surface-lowest border border-surface-border space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Step-by-Step Worked Solution:</span>
              <span className="text-[10px] text-slate-500">NCERT Deductive Rationale</span>
            </div>
            <ul className="space-y-1.5">
              {activeQuestion.workedSolution.map((s, i) => (
                <li key={i} className="text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">Step {i + 1}:</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-surface-border/40 font-sans">
              Takeaway: {activeQuestion.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
