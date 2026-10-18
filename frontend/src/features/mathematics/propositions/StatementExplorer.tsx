/**
 * Statement Explorer Component (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  CANONICAL_PROPOSITIONS,
  getPropositionById,
  createConverse,
} from '../../../engine/mathematics/propositions/propositionEngine';

export const StatementExplorer: React.FC = () => {
  const {
    selectedPropositionId,
    setSelectedPropositionId,
    isConverseView,
    toggleConverseView,
    setActiveTab,
    setTestedNumber,
  } = usePropositionsStore();

  const originalProp =
    getPropositionById(selectedPropositionId) || CANONICAL_PROPOSITIONS[0];
  const activeProp = isConverseView ? createConverse(originalProp) : originalProp;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'both_true':
        return {
          label: 'Both True (P ⇔ Q)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'original_true_converse_false':
        return {
          label: 'Original True, Converse False',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'original_false_converse_true':
        return {
          label: 'Original False, Converse True',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'both_false':
        return {
          label: 'Both False',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      default:
        return { label: 'General', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const badge = getCategoryBadge(originalProp.truthCategory);

  const handleTestInCounterexampleLab = () => {
    if (activeProp.knownOriginalCounterexamples && activeProp.knownOriginalCounterexamples.length > 0) {
      setTestedNumber(activeProp.knownOriginalCounterexamples[0]);
    } else if (originalProp.knownConverseCounterexamples && originalProp.knownConverseCounterexamples.length > 0) {
      setTestedNumber(originalProp.knownConverseCounterexamples[0]);
    }
    setActiveTab('counterexample_lab');
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
      {/* 1. Header & Proposition Selector */}
      <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Proposition Explorer</span>
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              {originalProp.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${badge.color}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Proposition Picker Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {CANONICAL_PROPOSITIONS.map((p) => {
            const isSelected = p.id === selectedPropositionId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPropositionId(p.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-md'
                    : 'bg-surface-lowest/70 border-surface-border/50 text-slate-300 hover:bg-surface-elevated hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{p.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {p.truthCategory === 'both_true' ? 'P ⇔ Q' : 'P ⇒ Q'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-1">
                  {p.naturalStatement}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Side-by-Side Statement Breakdown Card */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Declared Domain:</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {originalProp.domain.name} ({originalProp.domainDescription})
            </span>
          </div>

          {/* Swap Hypothesis and Conclusion (Form Converse) */}
          <button
            onClick={toggleConverseView}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              isConverseView
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>
              {isConverseView ? 'View Original Proposition (P ⇒ Q)' : 'Form Converse Statement (Q ⇒ P)'}
            </span>
          </button>
        </div>

        {/* Active Statement Display */}
        <div className="p-4 rounded-xl bg-surface-lowest/90 border border-surface-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {isConverseView ? 'Converse Statement (If Q, then P)' : 'Original Proposition (If P, then Q)'}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                activeProp.isOriginalTrue
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {activeProp.isOriginalTrue ? 'MATHEMATICALLY TRUE' : 'MATHEMATICALLY FALSE'}
            </span>
          </div>

          <div className="text-lg font-semibold text-white leading-relaxed">
            "{activeProp.naturalStatement}"
          </div>
        </div>

        {/* Hypothesis vs Conclusion Block Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hypothesis Block */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold">
                  {isConverseView ? 'Q' : 'P'}
                </span>
                <span>Hypothesis (Given Condition)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300/80">Premise</span>
            </div>
            <p className="text-sm text-slate-200 font-medium">
              "{activeProp.hypothesisText}"
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              This is the assumption. The proposition only makes an assertion when this condition holds true.
            </p>
          </div>

          {/* Conclusion Block */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-[11px] font-bold">
                  {isConverseView ? 'P' : 'Q'}
                </span>
                <span>Conclusion (Consequence)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300/80">Result</span>
            </div>
            <p className="text-sm text-slate-200 font-medium">
              "{activeProp.conclusionText}"
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              This is the claim that is guaranteed to follow whenever the hypothesis is satisfied.
            </p>
          </div>
        </div>

        {/* 3. Mathematical Explanation & Counterexample Pointer */}
        <div className="p-4 rounded-xl bg-surface-lowest/70 border border-surface-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-sky-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Deductive Explanation</span>
            </span>
            {!activeProp.isOriginalTrue && (
              <button
                onClick={handleTestInCounterexampleLab}
                className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
              >
                <span>Find Counterexample in Lab</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {activeProp.mathematicalExplanation}
          </p>

          {!activeProp.isOriginalTrue && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-rose-400">warning</span>
              <span>
                Disproof Hint: {activeProp.originalCounterexampleHint || 'Look for a number satisfying P where Q is false.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
