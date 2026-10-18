/**
 * Counterexample Workbench Component (Signature Feature of M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useState } from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  CANONICAL_PROPOSITIONS,
  getPropositionById,
  createConverse,
} from '../../../engine/mathematics/propositions/propositionEngine';
import {
  evaluateCounterexample,
  searchCounterexamplesInRange,
} from '../../../engine/mathematics/propositions/counterexampleEngine';

export const CounterexampleWorkbench: React.FC = () => {
  const {
    selectedPropositionId,
    setSelectedPropositionId,
    isConverseView,
    toggleConverseView,
    testedNumber,
    setTestedNumber,
    counterexampleSearchRange,
    setSearchRange,
  } = usePropositionsStore();

  const [customRangeStart, setCustomRangeStart] = useState(
    counterexampleSearchRange.start
  );
  const [customRangeEnd, setCustomRangeEnd] = useState(
    counterexampleSearchRange.end
  );
  const [searchResults, setSearchResults] = useState<ReturnType<
    typeof searchCounterexamplesInRange
  > | null>(null);

  const originalProp =
    getPropositionById(selectedPropositionId) || CANONICAL_PROPOSITIONS[0];
  const activeProp = isConverseView ? createConverse(originalProp) : originalProp;

  // Evaluate currently tested number
  const evaluation = evaluateCounterexample(activeProp, testedNumber);

  const handleRunSearch = () => {
    setSearchRange(customRangeStart, customRangeEnd);
    const result = searchCounterexamplesInRange(
      activeProp,
      customRangeStart,
      customRangeEnd,
      10
    );
    setSearchResults(result);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
      {/* 1. Proposition Header Card */}
      <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">search_check</span>
              <span>Counterexample Laboratory</span>
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              Testing: "{activeProp.naturalStatement}"
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleConverseView}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-slate-700 text-xs font-mono font-bold text-amber-400 border border-surface-border flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
              <span>{isConverseView ? 'Switch to Original' : 'Switch to Converse'}</span>
            </button>
          </div>
        </div>

        {/* Quick Statement Switcher */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-surface-border/60">
          {CANONICAL_PROPOSITIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPropositionId(p.id)}
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
                p.id === selectedPropositionId
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-surface-lowest/70 text-slate-400 border-surface-border/40 hover:text-white'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Number Testing Station */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Test Value (n)
            </span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={testedNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setTestedNumber(val);
                }}
                className="w-28 px-3 py-1.5 rounded-xl bg-surface-lowest border border-surface-border text-white font-mono font-bold text-lg text-center focus:border-amber-400 outline-none"
              />
              <span className="text-xs font-mono text-slate-400">
                in {activeProp.domainDescription}
              </span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400 mr-1">Quick Test:</span>
            {[2, 3, 4, 6, 8, 9, 12, 15, 18, 21, 24, 27].map((num) => (
              <button
                key={num}
                onClick={() => setTestedNumber(num)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                  testedNumber === num
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-surface-lowest text-slate-300 border border-surface-border hover:bg-surface-elevated hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider for Intuitive Exploration */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Slider Range: 1 to 50</span>
            <span className="text-amber-400 font-bold">Selected: n = {testedNumber}</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={Math.max(1, Math.min(50, testedNumber))}
            onChange={(e) => setTestedNumber(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-surface-lowest rounded-lg"
          />
        </div>

        {/* 3. Condition Evaluation Live Truth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Hypothesis Check Card */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition-all ${
              evaluation.hypothesisSatisfied
                ? 'bg-emerald-950/25 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/40 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                1. Hypothesis P(n)
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  evaluation.hypothesisSatisfied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {evaluation.hypothesisSatisfied ? 'TRUE (Satisfied)' : 'FALSE (Not Satisfied)'}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              "{activeProp.hypothesisText}"
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Evaluation for n = {testedNumber}:{' '}
              <span
                className={
                  evaluation.hypothesisSatisfied ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }
              >
                {evaluation.hypothesisSatisfied ? 'Condition Holds' : 'Condition Fails'}
              </span>
            </div>
          </div>

          {/* Conclusion Check Card */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition-all ${
              !evaluation.conclusionSatisfied && evaluation.hypothesisSatisfied
                ? 'bg-rose-950/25 border-rose-500/50 shadow-sm'
                : evaluation.conclusionSatisfied
                ? 'bg-emerald-950/25 border-emerald-500/40'
                : 'bg-slate-900/40 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                2. Conclusion Q(n)
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  evaluation.conclusionSatisfied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : evaluation.hypothesisSatisfied
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {evaluation.conclusionSatisfied ? 'TRUE (Holds)' : 'FALSE (Violated)'}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              "{activeProp.conclusionText}"
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Evaluation for n = {testedNumber}:{' '}
              <span
                className={
                  evaluation.conclusionSatisfied
                    ? 'text-emerald-400 font-bold'
                    : evaluation.hypothesisSatisfied
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-400'
                }
              >
                {evaluation.conclusionSatisfied ? 'Conclusion Holds' : 'Conclusion Fails'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Verdict Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            evaluation.isCounterexample
              ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
              : evaluation.isSupportingExample
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-200'
              : 'bg-surface-lowest border-surface-border text-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                evaluation.isCounterexample
                  ? 'bg-rose-500 text-slate-950 font-bold'
                  : evaluation.isSupportingExample
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-surface-elevated text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {evaluation.isCounterexample
                  ? 'close'
                  : evaluation.isSupportingExample
                  ? 'check'
                  : 'info'}
              </span>
            </span>
            <div>
              <h4 className="text-sm font-bold font-mono">
                {evaluation.diagnosticMessage}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {evaluation.detailedAnalysis}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bounded Range Automated Search Station */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            <span>Automated Counterexample Range Search</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Finite Search Tool</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Search Range: from</span>
          <input
            type="number"
            value={customRangeStart}
            onChange={(e) => setCustomRangeStart(parseInt(e.target.value, 10) || 1)}
            className="w-16 px-2 py-1 rounded bg-surface-lowest border border-surface-border text-white text-center"
          />
          <span className="text-slate-400">to</span>
          <input
            type="number"
            value={customRangeEnd}
            onChange={(e) => setCustomRangeEnd(parseInt(e.target.value, 10) || 50)}
            className="w-16 px-2 py-1 rounded bg-surface-lowest border border-surface-border text-white text-center"
          />
          <button
            onClick={handleRunSearch}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-md ml-auto"
          >
            Scan for Counterexamples
          </button>
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <div className="p-4 rounded-xl bg-surface-lowest/80 border border-surface-border space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{searchResults.searchedRangeDescription}</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  searchResults.hasCounterexample
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {searchResults.hasCounterexample
                  ? `${searchResults.counterexamplesFound.length} Found (Statement FALSE)`
                  : '0 Found in Tested Range'}
              </span>
            </div>

            <p className="text-slate-300">{searchResults.explanation}</p>

            {searchResults.hasCounterexample && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">Click to inspect:</span>
                {searchResults.counterexamplesFound.map((num) => (
                  <button
                    key={num}
                    onClick={() => setTestedNumber(num)}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 font-bold"
                  >
                    n = {num}
                  </button>
                ))}
              </div>
            )}

            {/* Critical Pedagogical Caveat */}
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] leading-snug flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-400 shrink-0 mt-0.5">
                verified_user
              </span>
              <span>{searchResults.universalProofCaveat}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
