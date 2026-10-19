/**
 * Number Experiment Workbench Component (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useState } from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  isDivisible,
  isEven,
  isPrime,
  isPerfectSquare,
  getFactors,
  getUnitsDigit,
  evaluateEulerPolynomial,
} from '../../../engine/mathematics/propositions/numberPredicates';

export const NumberExperiment: React.FC = () => {
  const { numberPropertyInput, setNumberPropertyInput } = usePropositionsStore();
  const [eulerN, setEulerN] = useState<number>(38);

  const n = numberPropertyInput;
  const factors = getFactors(n);
  const unitsDigit = getUnitsDigit(n);
  const perfectSquare = isPerfectSquare(n);
  const primeStatus = isPrime(n);

  const eulerResult = evaluateEulerPolynomial(eulerN);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
      {/* 1. Header & Input Station */}
      <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">calculate</span>
              <span>Number Property Laboratory</span>
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              Integer Exploration & Invariant Testing
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Test Integer:</span>
            <input
              type="number"
              aria-label="Integer to test"
              value={numberPropertyInput}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setNumberPropertyInput(val);
              }}
              className="w-24 px-3 py-1.5 rounded-xl bg-surface-lowest border border-surface-border text-white font-mono font-bold text-center focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Preset integer chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-surface-border/60">
          <span className="text-xs font-mono text-slate-400 mr-1">Presets:</span>
          {[2, 3, 4, 6, 8, 9, 12, 15, 16, 24, 25, 36, 40, 41, 49, 64].map((num) => (
            <button
              key={num}
              onClick={() => setNumberPropertyInput(num)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                numberPropertyInput === num
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-surface-lowest text-slate-300 border border-surface-border hover:bg-surface-elevated hover:text-white'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Divisibility & Factor Matrix */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-cyan-400">grid_on</span>
          <span>Divisibility Checks for n = {n}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[2, 3, 4, 5, 6, 8, 9, 10].map((d) => {
            const divides = isDivisible(n, d);
            return (
              <div
                key={d}
                className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                  divides
                    ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                    : 'bg-surface-lowest/70 border-surface-border/50 text-slate-400'
                }`}
              >
                <span>Divisible by {d}?</span>
                <span className="font-bold">{divides ? 'YES' : 'NO'}</span>
              </div>
            );
          })}
        </div>

        {/* Factors & Parity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/60 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Parity Status</span>
            <span className="text-sm font-bold text-white">
              {isEven(n) ? 'Even Number (2k)' : 'Odd Number (2k + 1)'}
            </span>
            <p className="text-[10px] text-slate-400">
              Units digit: <span className="text-amber-400 font-bold">{unitsDigit}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/60 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Prime / Composite</span>
            <span className="text-sm font-bold text-white">
              {primeStatus ? 'Prime Number' : n === 1 ? 'Neither Prime Nor Composite' : 'Composite Number'}
            </span>
            <p className="text-[10px] text-slate-400">
              {primeStatus ? 'Only divisible by 1 and itself' : `${factors.length} total factors`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/60 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Perfect Square</span>
            <span className="text-sm font-bold text-white">
              {perfectSquare ? `Yes: ${Math.round(Math.sqrt(n))}² = ${n}` : 'Not a Perfect Square'}
            </span>
            <p className="text-[10px] text-slate-400">
              {perfectSquare ? 'Integer square root' : 'Ends in valid square digit?'}
            </p>
          </div>
        </div>

        {/* Factor list */}
        <div className="p-3 rounded-xl bg-surface-lowest/80 border border-surface-border/60 text-xs font-mono">
          <span className="text-slate-400">All Factors of {n}: </span>
          <span className="text-cyan-300 font-bold">
            {factors.length > 0 ? factors.join(', ') : 'None'}
          </span>
        </div>
      </div>

      {/* 3. Euler’s Prime Polynomial (Limits of Empirical Verification) */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-border/60">
          <div>
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Euler’s Polynomial: f(n) = n² + n + 41</span>
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Why 40 Consecutive Verified Examples Do NOT Equal a Proof
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
            Empirical Limits
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Leonhard Euler investigated the formula <code className="text-amber-300 font-mono">f(n) = n² + n + 41</code>.
          For <code className="font-mono text-cyan-300">n = 0, 1, 2, ..., 39</code>, it generates 40 consecutive prime numbers without a single exception!
          However, at <code className="font-mono text-rose-400 font-bold">n = 40</code>, the formula collapses to a composite number:
          <code className="text-rose-300 font-mono block mt-1">f(40) = 40² + 40 + 41 = 40(41) + 41 = 41 × 41 = 1681 (Composite!)</code>
        </p>

        {/* Interactive Euler Slider */}
        <div className="p-4 rounded-xl bg-surface-lowest/90 border border-surface-border space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Test Euler Input: n = {eulerN}</span>
            <span
              className={`px-2.5 py-0.5 rounded font-bold ${
                eulerResult.isPrime
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}
            >
              {eulerResult.isPrime ? 'PRIME NUMBER' : 'COMPOSITE (Counterexample!)'}
            </span>
          </div>

          <input
            type="range"
            aria-label="Largest n tested for the polynomial, from 30 to 45"
            min="30"
            max="45"
            value={eulerN}
            onChange={(e) => setEulerN(parseInt(e.target.value, 10))}
            className="w-full accent-purple-400 cursor-pointer"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="bg-surface-card p-2 rounded border border-surface-border">
              <span className="text-slate-400 block text-[10px]">Formula:</span>
              <span className="text-white font-bold">{eulerN}² + {eulerN} + 41</span>
            </div>
            <div className="bg-surface-card p-2 rounded border border-surface-border">
              <span className="text-slate-400 block text-[10px]">Computed Value:</span>
              <span className="text-amber-400 font-bold">{eulerResult.value}</span>
            </div>
            <div className="bg-surface-card p-2 rounded border border-surface-border col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px]">Factorization:</span>
              <span className="text-rose-300 font-bold">{eulerResult.factorization || 'Prime (1 and itself)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
