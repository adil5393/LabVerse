/**
 * Substitution & Elimination Laboratory (M5).
 * Students choose from a closed set of mathematically checked operations;
 * the engine rejects invalid ones with an explanation. The final answer is
 * compared against the graphical intersection.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTwoVariablesStore } from '../../../store/useTwoVariablesStore';
import {
  startSubstitution,
  stepSubstitution,
  startElimination,
  stepElimination,
  suggestMultipliers,
  pairFromState,
  elimPair,
  formatExpression,
  formatReduced,
  type SubstitutionState,
  type EliminationState,
  type StepError,
  type Variable,
} from '../../../engine/mathematics/twoVariables/algebraSteps';
import { analyzeSystem } from '../../../engine/mathematics/twoVariables/system';
import { formatStandard, isLine } from '../../../engine/mathematics/twoVariables/linearEquation';
import { parseRational, formatRational, toNumber, eq as rEq } from '../../../engine/mathematics/twoVariables/rational';
import { interestingPoints } from '../../../engine/mathematics/twoVariables/graphMath';
import { GraphCanvas } from './GraphCanvas';
import { EquationEditor } from './EquationEditor';
import { WorkbenchShell } from './WorkbenchShell';
import { LINE_1_COLOR, LINE_2_COLOR } from './SystemExplorer';

type Method = 'substitution' | 'elimination';
const isErr = (r: unknown): r is StepError => typeof r === 'object' && r !== null && 'ok' in r && (r as StepError).ok === false;

interface Props {
  lesson?: React.ReactNode;
}

const btn = 'min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-100 hover:bg-surface-elevated disabled:opacity-40';
const primary = 'min-h-11 px-3 rounded-lg text-xs font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40';

export const AlgebraLab: React.FC<Props> = ({ lesson }) => {
  const eq1 = useTwoVariablesStore((s) => s.eq1);
  const eq2 = useTwoVariablesStore((s) => s.eq2);
  const experimentId = useTwoVariablesStore((s) => s.currentExperimentId);
  const recordInteraction = useTwoVariablesStore((s) => s.recordInteraction);

  const [method, setMethod] = useState<Method>(experimentId === 'tv-elimination' ? 'elimination' : 'substitution');
  const [sub, setSub] = useState<SubstitutionState>(() => startSubstitution(eq1, eq2));
  const [elim, setElim] = useState<EliminationState>(() => startElimination(eq1, eq2));
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState('');
  const [mult1, setMult1] = useState('1');
  const [mult2, setMult2] = useState('1');
  const [eliminateVar, setEliminateVar] = useState<Variable>('x');
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    setMethod(experimentId === 'tv-elimination' ? 'elimination' : 'substitution');
  }, [experimentId]);

  // Any edit to the equations starts the working over, so no stale step survives.
  const key = `${formatStandard(eq1)}|${formatStandard(eq2)}`;
  useEffect(() => {
    setSub(startSubstitution(eq1, eq2));
    setElim(startElimination(eq1, eq2));
    setError(null);
    setHint(null);
    setClaim('');
  }, [key, eq1, eq2]);

  const analysis = useMemo(() => analyzeSystem(eq1, eq2), [eq1, eq2]);

  const runSub = (action: Parameters<typeof stepSubstitution>[1]) => {
    const r = stepSubstitution(sub, action);
    if (isErr(r)) return setError(r.error);
    setError(null);
    setClaim('');
    setSub(r);
    recordInteraction('algebra_step', r.log[r.log.length - 1] ?? action.type, `sub-${r.log.length}-${r.log[r.log.length - 1]}`);
  };

  const runElim = (action: Parameters<typeof stepElimination>[1]) => {
    const r = stepElimination(elim, action);
    if (isErr(r)) return setError(r.error);
    setError(null);
    setHint(null);
    setElim(r);
    recordInteraction('algebra_step', r.log[r.log.length - 1] ?? action.type, `elim-${r.log.length}-${r.log[r.log.length - 1]}`);
  };

  const reset = () => {
    setSub(startSubstitution(eq1, eq2));
    setElim(startElimination(eq1, eq2));
    setError(null);
    setHint(null);
    setClaim('');
    setMult1('1');
    setMult2('1');
  };

  const pair = method === 'substitution' ? pairFromState(sub) : elimPair(elim);
  const finished = method === 'substitution' ? sub.phase === 'verified' : elim.phase === 'verified';
  const noUnique = method === 'substitution' ? sub.phase === 'finished_no_unique' : elim.phase === 'finished_no_unique';
  const outcome = method === 'substitution' ? sub.outcome : elim.outcome;
  const log = method === 'substitution' ? sub.log : elim.log;
  const matchesGraph = Boolean(pair && analysis.solution && rEq(pair.x, analysis.solution.x) && rEq(pair.y, analysis.solution.y));

  const intersection = pair && (finished || (method === 'substitution' ? sub.phase === 'back_substituted' : elim.phase === 'back_substituted'))
    ? { x: toNumber(pair.x), y: toNumber(pair.y), label: `(${formatRational(pair.x)}, ${formatRational(pair.y)})` }
    : null;

  const fitPoints = useMemo(() => [...interestingPoints(eq1), ...interestingPoints(eq2), ...(analysis.solution ? [{ x: toNumber(analysis.solution.x), y: toNumber(analysis.solution.y) }] : [])], [eq1, eq2, analysis.solution]);

  const lines = [
    ...(isLine(eq1) ? [{ eq: eq1, color: LINE_1_COLOR, label: '1' }] : []),
    ...(isLine(eq2) ? [{ eq: eq2, color: LINE_2_COLOR, dashed: true, label: '2' }] : []),
  ];

  const canvas = (
    <div className="absolute inset-0">
      <GraphCanvas lines={lines} intersection={intersection} fitPoints={fitPoints} fitSignal={[...experimentId].reduce((a, c) => a + c.charCodeAt(0), 0)} ariaLabel="Graph of the two equations being solved" />
      {intersection && (
        <div className="absolute left-2 bottom-2 right-16 sm:right-auto px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs font-mono text-emerald-200" role="status">
          {matchesGraph ? 'Your algebraic answer is the point where the two lines cross.' : 'Your answer does not match the graph intersection. Check your steps.'}
        </div>
      )}
    </div>
  );

  const stepBox = 'm-3 p-3 rounded-xl border border-surface-border bg-surface-card space-y-2.5';

  const substitutionUI = (
    <div className={stepBox}>
      <div className="text-xs font-mono font-bold text-purple-300">Substitution steps</div>
      {sub.phase === 'choose' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-300">Step 1 — Isolate one variable. Make it the subject of one equation:</p>
          <div className="grid grid-cols-2 gap-2">
            {([1, 2] as const).flatMap((n) => (['x', 'y'] as const).map((v) => (
              <button key={`${n}${v}`} type="button" className={btn} onClick={() => runSub({ type: 'isolate', source: n, variable: v })}>
                {v} from Eq {n}
              </button>
            )))}
          </div>
        </div>
      )}
      {sub.phase === 'isolated' && sub.expression && (
        <div className="space-y-2">
          <div className="font-mono text-white text-base">{formatExpression(sub.expression)}</div>
          <p className="text-xs text-slate-300">Step 2 — Substitute this expression into an equation:</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={btn} onClick={() => runSub({ type: 'substitute', into: 1 })}>Into Eq 1</button>
            <button type="button" className={btn} onClick={() => runSub({ type: 'substitute', into: 2 })}>Into Eq 2</button>
          </div>
        </div>
      )}
      {sub.phase === 'substituted' && sub.reduced && (
        <div className="space-y-2">
          <div className="font-mono text-white text-base">{formatReduced(sub.reduced)}</div>
          <p className="text-xs text-slate-300">Step 3 — Solve for {sub.reduced.variable}. Type your answer to have it checked:</p>
          <div className="flex gap-2">
            <input value={claim} onChange={(e) => setClaim(e.target.value)} inputMode="decimal" placeholder={`${sub.reduced.variable} = ?`} aria-label={`Value of ${sub.reduced.variable}`} className="flex-1 min-w-0 h-11 px-3 rounded-lg bg-surface-lowest border border-surface-border text-white outline-none focus:border-purple-400" />
            <button type="button" className={primary} onClick={() => { const v = parseRational(claim); if (!v) return setError('Type a number such as 2, -3 or 3/2.'); runSub({ type: 'simplify_solve', claimed: v }); }}>Check</button>
            <button type="button" className={btn} onClick={() => runSub({ type: 'simplify_solve' })}>Show me</button>
          </div>
        </div>
      )}
      {sub.phase === 'solved' && <button type="button" className={primary} onClick={() => runSub({ type: 'back_substitute' })}>Step 4 — Back-substitute to find the other variable</button>}
      {sub.phase === 'back_substituted' && <button type="button" className={primary} onClick={() => runSub({ type: 'verify' })}>Step 5 — Verify in both equations</button>}
      {sub.phase === 'verified' && pair && <div className="text-sm font-bold text-emerald-300">Verified: (x, y) = ({formatRational(pair.x)}, {formatRational(pair.y)})</div>}
    </div>
  );

  const eliminationUI = (
    <div className={stepBox}>
      <div className="text-xs font-mono font-bold text-purple-300">Elimination steps</div>
      <div className="text-xs font-mono text-slate-200 space-y-0.5">
        <div>Eq 1: {formatStandard(elim.work1)}</div>
        <div>Eq 2: {formatStandard(elim.work2)}</div>
      </div>

      {elim.phase === 'scale' && (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-300">Step 1 — Multiply every term of an equation by a number (not 0) so a variable has matching coefficients.</p>
          {([1, 2] as const).map((n) => {
            const val = n === 1 ? mult1 : mult2;
            const set = n === 1 ? setMult1 : setMult2;
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-300 w-24 shrink-0">Eq {n} ×</span>
                <input value={val} onChange={(e) => set(e.target.value)} inputMode="decimal" aria-label={`Multiplier for equation ${n}`} className="flex-1 min-w-0 h-11 px-3 rounded-lg bg-surface-lowest border border-surface-border text-white outline-none focus:border-purple-400" />
                <button type="button" className={btn} onClick={() => { const f = parseRational(val); if (!f) return setError('Type a number such as 2, -1 or 1/2.'); runElim({ type: 'multiply', target: n, factor: f }); }}>Apply</button>
              </div>
            );
          })}
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" className={btn} onClick={() => {
              const s = suggestMultipliers(elim.work1, elim.work2, eliminateVar);
              setHint(s ? `To match the ${eliminateVar}-coefficients, multiply Eq 1 by ${formatRational(s.m1)} and Eq 2 by ${formatRational(s.m2)}. Then subtract if the signs agree, or add if they differ.` : `${eliminateVar} does not appear in both equations; eliminate the other variable.`);
            }}>Hint</button>
            {hint && <span className="text-xs text-amber-200">{hint}</span>}
          </div>
          <p className="text-xs text-slate-300">Step 2 — Eliminate</p>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={eliminateVar} onChange={(e) => setEliminateVar(e.target.value as Variable)} aria-label="Variable to eliminate" className="h-11 px-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-sm">
              <option value="x">eliminate x</option>
              <option value="y">eliminate y</option>
            </select>
            <button type="button" className={primary} onClick={() => runElim({ type: 'combine', op: 'add', eliminate: eliminateVar })}>Add equations</button>
            <button type="button" className={primary} onClick={() => runElim({ type: 'combine', op: 'subtract', eliminate: eliminateVar })}>Subtract (1 − 2)</button>
          </div>
        </div>
      )}
      {elim.phase === 'combined' && elim.combined && (
        <div className="space-y-2">
          <div className="font-mono text-white text-base">{formatStandard(elim.combined)}</div>
          <button type="button" className={primary} onClick={() => runElim({ type: 'solve' })}>Step 3 — Solve for {elim.remaining}</button>
        </div>
      )}
      {elim.phase === 'solved' && <button type="button" className={primary} onClick={() => runElim({ type: 'back_substitute' })}>Step 4 — Back-substitute into an original equation</button>}
      {elim.phase === 'back_substituted' && <button type="button" className={primary} onClick={() => runElim({ type: 'verify' })}>Step 5 — Verify in both original equations</button>}
      {elim.phase === 'verified' && pair && <div className="text-sm font-bold text-emerald-300">Verified: (x, y) = ({formatRational(pair.x)}, {formatRational(pair.y)})</div>}
    </div>
  );

  const tools = (
    <div>
      <div className="flex p-2 gap-2 border-b border-surface-border/60" role="tablist" aria-label="Method">
        {(['substitution', 'elimination'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={method === m} onClick={() => { setMethod(m); reset(); }} className={`flex-1 h-11 rounded-lg text-xs font-mono font-bold border capitalize ${method === m ? 'bg-purple-600 border-purple-400 text-white' : 'bg-surface-card border-surface-border text-slate-300'}`}>
            {m}
          </button>
        ))}
      </div>

      <details className="border-b border-surface-border/60">
        <summary className="px-3 py-3 text-xs font-mono font-bold text-slate-300 cursor-pointer min-h-11">Change the equations ({formatStandard(eq1)} ; {formatStandard(eq2)})</summary>
        <EquationEditor which={1} color={LINE_1_COLOR} label="Equation 1" showDetails={false} showForms={false} />
        <EquationEditor which={2} color={LINE_2_COLOR} label="Equation 2" showDetails={false} showForms={false} />
      </details>

      {analysis.type === 'invalid' ? (
        <div className="m-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200" role="status">{analysis.reason}</div>
      ) : method === 'substitution' ? substitutionUI : eliminationUI}

      {error && <div className="mx-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200" role="alert">{error}</div>}

      {noUnique && (
        <div className="m-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-100" role="status">
          {outcome === 'parallel' ? 'The variables disappeared and the statement is false: no solution. The lines are parallel.' : 'The variables disappeared and the statement is always true: infinitely many solutions. The lines coincide.'}
        </div>
      )}

      {log.length > 0 && (
        <ol className="m-3 p-3 rounded-xl bg-surface-lowest border border-surface-border text-[12px] font-mono text-slate-200 space-y-1 list-decimal list-inside">
          {log.map((l, i) => <li key={i}>{l}</li>)}
        </ol>
      )}

      <div className="px-3 pb-4"><button type="button" className={btn} onClick={reset}>Start over</button></div>
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};
