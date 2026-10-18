/**
 * Equation editor: free-text entry plus large a / b / c steppers.
 * All changes go through the store so undo/redo and lesson tracking work.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTwoVariablesStore } from '../../../store/useTwoVariablesStore';
import {
  parseEquation,
  formatStandard,
  formatGeneral,
  formatSlopeIntercept,
  validateEquation,
  isLine,
  slope,
  xIntercept,
  yIntercept,
  lineKind,
  type Intercept,
} from '../../../engine/mathematics/twoVariables/linearEquation';
import { rat, formatRational, formatDecimal, type Rational } from '../../../engine/mathematics/twoVariables/rational';

interface Props {
  which: 1 | 2;
  color: string;
  label: string;
  /** Hide the coefficient steppers and free-text box for the very first lessons. */
  simple?: boolean;
  showForms?: boolean;
  showDetails?: boolean;
}

const interceptText = (i: Intercept, axis: 'x' | 'y'): string => {
  if (i.kind === 'point') return axis === 'x' ? `(${formatRational(i.value)}, 0)` : `(0, ${formatRational(i.value)})`;
  if (i.kind === 'whole_axis') return `the whole ${axis}-axis`;
  return 'none';
};

export const EquationEditor: React.FC<Props> = ({ which, color, label, simple = false, showForms = true, showDetails = true }) => {
  const eq = useTwoVariablesStore((s) => (which === 1 ? s.eq1 : s.eq2));
  const setEquation = useTwoVariablesStore((s) => s.setEquation);
  const nudge = useTwoVariablesStore((s) => s.nudgeCoefficient);
  const activeTab = useTwoVariablesStore((s) => s.activeTab);

  const [draft, setDraft] = useState(formatStandard(eq));
  const [error, setError] = useState<string | null>(null);
  const focused = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!focused.current) {
      setDraft(formatStandard(eq));
      setError(null);
    }
  }, [eq]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const commit = (text: string) => {
    const r = parseEquation(text);
    if (!r.ok || !r.equation) {
      setError(r.error ?? 'Could not read the equation.');
      return;
    }
    setError(null);
    const same = formatStandard(r.equation) === formatStandard(eq);
    if (!same) setEquation(which, r.equation, activeTab === 'system' ? 'system_edit' : 'coefficient_change');
  };

  const onChange = (text: string) => {
    setDraft(text);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => commit(text), 600);
  };

  const validity = validateEquation(eq);
  const m = slope(eq);
  const kind = lineKind(eq);
  const rows: { key: 'a' | 'b' | 'c'; value: Rational }[] = [
    { key: 'a', value: eq.a },
    { key: 'b', value: eq.b },
    { key: 'c', value: eq.c },
  ];

  return (
    <div className="p-3 space-y-3 border-b border-surface-border/60" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold" style={{ color }}>{label}</span>
        <span className="text-lg font-bold text-white font-mono" aria-live="polite">{formatStandard(eq)}</span>
      </div>

      {!simple && (
        <label className="block">
          <span className="sr-only">Type an equation</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            placeholder="e.g. 2x + 3y = 12 or x = 4"
            onFocus={() => (focused.current = true)}
            onBlur={() => {
              focused.current = false;
              if (timer.current !== null) window.clearTimeout(timer.current);
              commit(draft);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (timer.current !== null) window.clearTimeout(timer.current);
                commit(draft);
              }
            }}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-surface-lowest border border-surface-border text-white font-mono text-base outline-none focus:border-purple-400"
            aria-invalid={error !== null}
          />
          {error && <span className="block mt-1 text-xs text-rose-300" role="alert">{error}</span>}
        </label>
      )}

      {!simple && (
        <div className="grid grid-cols-3 gap-2" role="group" aria-label={`Coefficients of ${label}`}>
          {rows.map(({ key, value }) => (
            <div key={key} className="rounded-xl bg-surface-lowest border border-surface-border p-1.5 text-center">
              <div className="text-[11px] font-mono text-slate-400">{key}</div>
              <div className="text-base font-mono font-bold text-white truncate" aria-live="polite">{formatRational(value)}</div>
              <div className="flex gap-1 mt-1">
                <button type="button" aria-label={`Decrease ${key}`} onClick={() => nudge(which, key, rat(-1))} className="flex-1 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold hover:bg-surface-elevated">−</button>
                <button type="button" aria-label={`Increase ${key}`} onClick={() => nudge(which, key, rat(1))} className="flex-1 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold hover:bg-surface-elevated">+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!validity.valid && (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200" role="status">
          {validity.message} The graph is not drawn.
        </div>
      )}

      {showForms && isLine(eq) && (
        <div className="text-[12px] font-mono text-slate-300 space-y-0.5">
          <div>General: <span className="text-white">{formatGeneral(eq)}</span></div>
          <div>Solved for {kind === 'vertical' ? 'x' : 'y'}: <span className="text-white">{formatSlopeIntercept(eq)}</span></div>
        </div>
      )}

      {showDetails && isLine(eq) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12px] font-mono">
          <dt className="text-slate-400">Type</dt>
          <dd className="text-white">{kind === 'vertical' ? 'Vertical line' : kind === 'horizontal' ? 'Horizontal line' : 'Slanted line'}</dd>
          <dt className="text-slate-400">Slope</dt>
          <dd className="text-white">{m === null ? 'undefined (vertical)' : `${formatRational(m)}${m.d !== 1 ? ` ≈ ${formatDecimal(m, 3)}` : ''}`}</dd>
          <dt className="text-slate-400">x-intercept</dt>
          <dd className="text-white">{interceptText(xIntercept(eq), 'x')}</dd>
          <dt className="text-slate-400">y-intercept</dt>
          <dd className="text-white">{interceptText(yIntercept(eq), 'y')}</dd>
        </dl>
      )}
    </div>
  );
};
