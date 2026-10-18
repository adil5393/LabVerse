/**
 * Interactive Equation Graph workbench (single equation) — M5 signature feature.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTwoVariablesStore } from '../../../store/useTwoVariablesStore';
import { getTVExperiment } from '../../../engine/mathematics/twoVariables/experimentRegistry';
import {
  evaluate,
  isLine,
  isExactSolution,
  formatStandard,
  solveForX,
  solveForY,
  classifyDecimalPoint,
  validateEquation,
} from '../../../engine/mathematics/twoVariables/linearEquation';
import { constrainToLine, interestingPoints, describeTranslation, type ExactPoint, type LineDragEffect } from '../../../engine/mathematics/twoVariables/graphMath';
import { parseRational, formatRational, toNumber, sub, neg, type Rational } from '../../../engine/mathematics/twoVariables/rational';
import { GraphCanvas, type DragMode } from './GraphCanvas';
import { EquationEditor } from './EquationEditor';
import { WorkbenchShell } from './WorkbenchShell';

const COLOR_1 = '#38bdf8';

interface Props {
  lesson?: React.ReactNode;
}

const substitutionText = (eq: ReturnType<typeof useTwoVariablesStore.getState>['eq1'], x: Rational, y: Rational): string => {
  const lhs = sub(evaluate(eq, x, y), eq.c);
  return `${formatRational(eq.a)}(${formatRational(x)}) + ${formatRational(eq.b)}(${formatRational(y)}) = ${formatRational(lhs)}, and the right side is ${formatRational(neg(eq.c))}`;
};

export const GraphWorkbench: React.FC<Props> = ({ lesson }) => {
  const eq = useTwoVariablesStore((s) => s.eq1);
  const setEquationLive = useTwoVariablesStore((s) => s.setEquationLive);
  const experimentId = useTwoVariablesStore((s) => s.currentExperimentId);
  const tableRows = useTwoVariablesStore((s) => s.tableRows);
  const addTableRow = useTwoVariablesStore((s) => s.addTableRow);
  const removeTableRow = useTwoVariablesStore((s) => s.removeTableRow);
  const clearTable = useTwoVariablesStore((s) => s.clearTable);
  const recordInteraction = useTwoVariablesStore((s) => s.recordInteraction);

  const exp = getTVExperiment(experimentId);
  const [showTable, setShowTable] = useState(exp.showTable);
  const [showSlope, setShowSlope] = useState(exp.showSlope);
  const [showIntercepts, setShowIntercepts] = useState(exp.showIntercepts);
  const [dragMode, setDragMode] = useState<DragMode>('point');
  const [point, setPoint] = useState<ExactPoint | null>(null);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>({ x: 1, y: 1 });
  const [lineNote, setLineNote] = useState<string | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const userMoved = useRef(false);
  const dragStart = useRef<typeof eq | null>(null);

  useEffect(() => {
    setShowTable(exp.showTable);
    setShowSlope(exp.showSlope);
    setShowIntercepts(exp.showIntercepts);
    setFitSignal((n) => n + 1);
    setLineNote(null);
  }, [experimentId, exp.showTable, exp.showSlope, exp.showIntercepts]);

  // Keep the constrained point exactly on the (possibly changed) line.
  useEffect(() => {
    if (!isLine(eq)) {
      setPoint(null);
      return;
    }
    setPoint((p) => constrainToLine(eq, p ? toNumber(p.x) : 0, p ? toNumber(p.y) : 0) ?? null);
  }, [eq]);

  // Record a "point drag" only after the point settles, and only for real user movement.
  useEffect(() => {
    if (!point || !userMoved.current) return;
    const id = window.setTimeout(() => {
      userMoved.current = false;
      recordInteraction('point_drag', `(${formatRational(point.x)}, ${formatRational(point.y)}) is a solution of ${formatStandard(eq)}`);
    }, 350);
    return () => window.clearTimeout(id);
  }, [point, eq, recordInteraction]);

  const onPointDrag = (p: ExactPoint) => {
    userMoved.current = true;
    setPoint(p);
  };

  const onLineDrag = (effect: LineDragEffect, final: boolean) => {
    // Describe the move since the gesture began, not just the last frame.
    if (!dragStart.current) dragStart.current = eq;
    setLineNote(describeTranslation(dragStart.current, effect.after));
    if (final) dragStart.current = null;
    // Live update so the graph follows the finger; the whole gesture is one undo step.
    setEquationLive(1, effect.after, final);
  };

  const tablePoints = useMemo(() => tableRows.map((r) => ({ x: toNumber(r.x), y: toNumber(r.y) })), [tableRows]);
  const fitPoints = useMemo(() => [...interestingPoints(eq), ...tablePoints, ...(point ? [{ x: toNumber(point.x), y: toNumber(point.y) }] : [])], [eq, tablePoints, point]);

  const probeCheck = probe && isLine(eq) ? classifyDecimalPoint(eq, probe.x, probe.y, 1) : null;

  const modeButtons: { id: DragMode; label: string; icon: string }[] = [
    { id: 'point', label: 'Point on line', icon: 'adjust' },
    { id: 'probe', label: 'Free point', icon: 'my_location' },
    ...(exp.simpleControls ? [] : [{ id: 'line' as DragMode, label: 'Move line', icon: 'open_with' }]),
    { id: 'none', label: 'Pan only', icon: 'pan_tool' },
  ];

  const canvas = (
    <div className="absolute inset-0 flex flex-col">
      <div className="shrink-0 flex flex-wrap items-center gap-1.5 px-2 py-1.5 bg-surface-low/90 border-b border-surface-border z-10" role="toolbar" aria-label="Drag mode">
        {modeButtons.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setDragMode(m.id)}
            aria-pressed={dragMode === m.id}
            className={`h-10 px-3 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${dragMode === m.id ? 'bg-purple-600 border-purple-400 text-white' : 'bg-surface-card border-surface-border text-slate-300 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
        <span className="hidden md:inline ml-auto text-[11px] font-mono text-slate-500">Drag empty space to pan · wheel or pinch to zoom</span>
      </div>
      <div className="flex-1 min-h-0">
        <GraphCanvas
          lines={isLine(eq) ? [{ eq, color: COLOR_1, label: formatStandard(eq) }] : []}
          tablePoints={showTable ? tablePoints : []}
          interceptsOf={showIntercepts ? eq : null}
          slopeOf={showSlope ? eq : null}
          dragMode={dragMode}
          point={point}
          probe={probe && probeCheck ? { ...probe, status: probeCheck.status } : null}
          onPointDrag={onPointDrag}
          onProbeDrag={setProbe}
          onLineDrag={onLineDrag}
          fitPoints={fitPoints}
          fitSignal={fitSignal}
          ariaLabel={`Graph of ${formatStandard(eq)}`}
        />
      </div>
    </div>
  );

  const tools = (
    <div>
      <EquationEditor which={1} color={COLOR_1} label="Equation" simple={exp.simpleControls} showDetails={!exp.simpleControls || showIntercepts || showSlope} />

      <div className="p-3 flex flex-wrap gap-1.5 border-b border-surface-border/60" role="group" aria-label="Display options">
        {[
          { label: 'Table', on: showTable, set: setShowTable },
          { label: 'Slope', on: showSlope, set: setShowSlope },
          { label: 'Intercepts', on: showIntercepts, set: setShowIntercepts },
        ].map((o) => (
          <button key={o.label} type="button" onClick={() => o.set(!o.on)} aria-pressed={o.on} className={`h-10 px-3 rounded-lg text-xs font-mono font-bold border ${o.on ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200' : 'bg-surface-card border-surface-border text-slate-300'}`}>
            {o.label}
          </button>
        ))}
        <button type="button" onClick={() => setFitSignal((n) => n + 1)} className="h-10 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-300">Fit graph</button>
      </div>

      <UndoRedoRow />

      {isLine(eq) && dragMode === 'point' && point && (
        <ReadoutCard title="Point on the line" tone="ok">
          <div className="font-mono text-white text-base">({formatRational(point.x)}, {formatRational(point.y)})</div>
          <div className="text-xs text-slate-300">{substitutionText(eq, point.x, point.y)}.</div>
          <div className="text-xs text-emerald-300">Exact solution ✓ — the lab computed the second coordinate from the equation.</div>
        </ReadoutCard>
      )}

      {isLine(eq) && dragMode === 'probe' && probeCheck && probe && (
        <ReadoutCard title="Free point test" tone={probeCheck.status === 'exact' ? 'ok' : probeCheck.status === 'approximate' ? 'warn' : 'bad'}>
          <div className="font-mono text-white text-base">({formatRational(probeCheck.x)}, {formatRational(probeCheck.y)})</div>
          <div className="text-xs text-slate-300">a·x + b·y = {formatRational(sub(evaluate(eq, probeCheck.x, probeCheck.y), eq.c))}, right side = {formatRational(neg(eq.c))}. Difference: {formatRational(probeCheck.residual)}.</div>
          <div className={`text-xs font-bold ${probeCheck.status === 'exact' ? 'text-emerald-300' : probeCheck.status === 'approximate' ? 'text-amber-300' : 'text-rose-300'}`}>
            {probeCheck.status === 'exact' && 'Exact solution: both sides are equal.'}
            {probeCheck.status === 'approximate' && `Close to the line (${probeCheck.distance.toFixed(2)} units away) but NOT a solution: the sides are not equal.`}
            {probeCheck.status === 'not_solution' && 'Not a solution: the point is off the line.'}
          </div>
        </ReadoutCard>
      )}

      {dragMode === 'line' && (
        <ReadoutCard title="Moving the line" tone="info">
          <div className="text-xs text-slate-300">{lineNote ?? 'Drag the line. The lab slides it without turning it, so only c changes and a, b stay the same. You can undo each move.'}</div>
        </ReadoutCard>
      )}

      {!validateEquation(eq).valid && <ReadoutCard title="No line to graph" tone="warn"><div className="text-xs text-amber-200">{validateEquation(eq).message}</div></ReadoutCard>}

      {showTable && <SolutionTable rows={tableRows} onAdd={addTableRow} onRemove={removeTableRow} onClear={clearTable} />}
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};

// ---------------------------------------------------------------------------

export const ReadoutCard: React.FC<{ title: string; tone: 'ok' | 'warn' | 'bad' | 'info'; children: React.ReactNode }> = ({ title, tone, children }) => {
  const color = { ok: 'border-emerald-500/40 bg-emerald-950/20', warn: 'border-amber-500/40 bg-amber-950/20', bad: 'border-rose-500/40 bg-rose-950/20', info: 'border-sky-500/40 bg-sky-950/20' }[tone];
  return (
    <div className={`m-3 p-3 rounded-xl border space-y-1.5 ${color}`} role="status">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{title}</div>
      {children}
    </div>
  );
};

export const UndoRedoRow: React.FC = () => {
  const { undo, redo, past, future } = useTwoVariablesStore();
  return (
    <div className="px-3 py-2 flex items-center gap-2 border-b border-surface-border/60">
      <button type="button" onClick={undo} disabled={past.length === 0} className="h-10 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">undo</span>Undo
      </button>
      <button type="button" onClick={redo} disabled={future.length === 0} className="h-10 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">redo</span>Redo
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------

interface TableProps {
  rows: { x: Rational; y: Rational }[];
  onAdd: (x: Rational, y: Rational) => boolean;
  onRemove: (i: number) => void;
  onClear: () => void;
}

const SolutionTable: React.FC<TableProps> = ({ rows, onAdd, onRemove, onClear }) => {
  const eq = useTwoVariablesStore((s) => s.eq1);
  const recordInteraction = useTwoVariablesStore((s) => s.recordInteraction);
  const [given, setGiven] = useState<'x' | 'y'>('x');
  const [givenText, setGivenText] = useState('');
  const [otherText, setOtherText] = useState('');
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);

  const other = given === 'x' ? 'y' : 'x';
  const gv = parseRational(givenText);

  const add = (x: Rational, y: Rational, kind: 'table_row' | 'solution_found') => {
    const added = onAdd(x, y);
    if (!added) {
      setMessage({ tone: 'bad', text: `There is already a row with x = ${formatRational(x)}.` });
      return;
    }
    recordInteraction(kind, `(${formatRational(x)}, ${formatRational(y)}) satisfies ${formatStandard(eq)}`, `${formatRational(x)},${formatRational(y)}`);
    setMessage({ tone: 'ok', text: `Added (${formatRational(x)}, ${formatRational(y)}).` });
    setGivenText('');
    setOtherText('');
  };

  const fillForMe = () => {
    if (!isLine(eq)) return setMessage({ tone: 'bad', text: 'This equation has no line, so there is nothing to tabulate.' });
    if (!gv) return setMessage({ tone: 'bad', text: `Type a number for ${given}, like 2, -3 or 1/2.` });
    const r = given === 'x' ? solveForY(eq, gv) : solveForX(eq, gv);
    if (r.kind === 'unique') return add(given === 'x' ? gv : r.value, given === 'x' ? r.value : gv, 'table_row');
    if (r.kind === 'any') return setMessage({ tone: 'ok', text: `For this line, ${other} can be any number when ${given} = ${formatRational(gv)}. Type your own ${other} and press Check.` });
    setMessage({ tone: 'bad', text: `No ${other} makes the equation true when ${given} = ${formatRational(gv)}.` });
  };

  const check = () => {
    if (!isLine(eq)) return setMessage({ tone: 'bad', text: 'This equation has no line.' });
    const ov = parseRational(otherText);
    if (!gv || !ov) return setMessage({ tone: 'bad', text: 'Type numbers in both boxes (decimals and fractions like 3/2 are fine).' });
    const x = given === 'x' ? gv : ov;
    const y = given === 'x' ? ov : gv;
    if (isExactSolution(eq, x, y)) add(x, y, 'solution_found');
    else setMessage({ tone: 'bad', text: `Not yet: ${substitutionText(eq, x, y)}. They are different, so (${formatRational(x)}, ${formatRational(y)}) is not a solution. Try again.` });
  };

  return (
    <div className="m-3 p-3 rounded-xl border border-surface-border bg-surface-card space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-amber-300">Solution table</span>
        {rows.length > 0 && <button type="button" onClick={onClear} className="text-[11px] font-mono text-slate-400 hover:text-white underline">Clear</button>}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
        <span>I choose</span>
        <select value={given} onChange={(e) => { setGiven(e.target.value as 'x' | 'y'); setMessage(null); }} className="h-10 px-2 rounded-lg bg-surface-lowest border border-surface-border text-white" aria-label="Which variable you choose">
          <option value="x">x</option>
          <option value="y">y</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] font-mono text-slate-400">
          {given} =
          <input value={givenText} onChange={(e) => setGivenText(e.target.value)} inputMode="decimal" className="mt-1 w-full h-11 px-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" />
        </label>
        <label className="text-[11px] font-mono text-slate-400">
          {other} = (my answer)
          <input value={otherText} onChange={(e) => setOtherText(e.target.value)} inputMode="decimal" className="mt-1 w-full h-11 px-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" />
        </label>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={check} className="flex-1 h-11 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold">Check my answer</button>
        <button type="button" onClick={fillForMe} className="flex-1 h-11 rounded-lg bg-surface-elevated border border-surface-border text-slate-200 text-xs font-mono font-bold">Fill {other} for me</button>
      </div>

      {message && <div className={`text-xs ${message.tone === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`} role="status">{message.text}</div>}

      {rows.length > 0 && (
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-slate-400 text-left"><th className="py-1">x</th><th>y</th><th>check</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const ok = isExactSolution(eq, r.x, r.y);
              return (
                <tr key={`${r.x.n}/${r.x.d}`} className="border-t border-surface-border/50 text-white">
                  <td className="py-1.5">{formatRational(r.x)}</td>
                  <td>{formatRational(r.y)}</td>
                  <td className={ok ? 'text-emerald-300' : 'text-amber-300'}>{ok ? '✓' : 'old eq.'}</td>
                  <td className="text-right"><button type="button" aria-label={`Remove row ${i + 1}`} onClick={() => onRemove(i)} className="w-9 h-9 text-slate-400 hover:text-white">×</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
