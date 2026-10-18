/**
 * Two-Line System Explorer (M5 core feature).
 * Classification is exact (determinant on rationals). The intersection marker
 * is rendered only when the system has exactly one solution.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTwoVariablesStore } from '../../../store/useTwoVariablesStore';
import { analyzeSystem, verifyPair } from '../../../engine/mathematics/twoVariables/system';
import {
  formatStandard,
  slope,
  isLine,
  lineKind,
} from '../../../engine/mathematics/twoVariables/linearEquation';
import { interestingPoints, describeTranslation, type LineDragEffect } from '../../../engine/mathematics/twoVariables/graphMath';
import { formatRational, toNumber, sub, neg } from '../../../engine/mathematics/twoVariables/rational';
import { GraphCanvas, type DragMode } from './GraphCanvas';
import { EquationEditor } from './EquationEditor';
import { WorkbenchShell } from './WorkbenchShell';
import { ReadoutCard, UndoRedoRow } from './GraphWorkbench';

export const LINE_1_COLOR = '#38bdf8';
export const LINE_2_COLOR = '#fbbf24';

interface Props {
  lesson?: React.ReactNode;
}

const typeBadge = {
  unique: { text: 'Intersecting lines — exactly one solution', cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50' },
  parallel: { text: 'Parallel lines — no solution', cls: 'bg-rose-500/20 text-rose-200 border-rose-500/50' },
  coincident: { text: 'Coincident lines — infinitely many solutions', cls: 'bg-amber-500/20 text-amber-200 border-amber-500/50' },
  invalid: { text: 'One equation is not a line', cls: 'bg-slate-500/20 text-slate-200 border-slate-500/50' },
} as const;

export const slopeText = (e: Parameters<typeof slope>[0]): string => {
  if (!isLine(e)) return 'no line';
  const m = slope(e);
  return m === null ? 'undefined (vertical)' : formatRational(m);
};

export const SystemExplorer: React.FC<Props> = ({ lesson }) => {
  const eq1 = useTwoVariablesStore((s) => s.eq1);
  const eq2 = useTwoVariablesStore((s) => s.eq2);
  const setEquationLive = useTwoVariablesStore((s) => s.setEquationLive);
  const experimentId = useTwoVariablesStore((s) => s.currentExperimentId);

  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragLine, setDragLine] = useState<0 | 1>(0);
  const [note, setNote] = useState<string | null>(null);
  const [activeEq, setActiveEq] = useState<1 | 2>(1);
  const [fitSignal, setFitSignal] = useState(0);
  const dragStart = useRef<typeof eq1 | null>(null);

  useEffect(() => {
    setFitSignal((n) => n + 1);
    setNote(null);
  }, [experimentId]);

  const analysis = useMemo(() => analyzeSystem(eq1, eq2), [eq1, eq2]);
  const check = analysis.type === 'unique' && analysis.solution ? verifyPair(eq1, eq2, analysis.solution.x, analysis.solution.y) : null;

  const intersection =
    analysis.type === 'unique' && analysis.solution
      ? { x: toNumber(analysis.solution.x), y: toNumber(analysis.solution.y), label: `(${formatRational(analysis.solution.x)}, ${formatRational(analysis.solution.y)})` }
      : null;

  const lines = useMemo(
    () => [
      ...(isLine(eq1) ? [{ eq: eq1, color: LINE_1_COLOR, label: '1' }] : []),
      ...(isLine(eq2) ? [{ eq: eq2, color: LINE_2_COLOR, dashed: true, label: '2' }] : []),
    ],
    [eq1, eq2]
  );
  // dragLineIndex indexes into `lines`; map the chosen equation to its position there.
  const dragIndex = dragLine === 0 ? 0 : isLine(eq1) ? 1 : 0;
  // Never drag a line that is not drawn (a degenerate equation has no line).
  const effectiveMode: DragMode = dragMode === 'line' && !isLine(dragLine === 0 ? eq1 : eq2) ? 'none' : dragMode;

  const fitPoints = useMemo(() => [...interestingPoints(eq1), ...interestingPoints(eq2), ...(intersection ? [intersection] : [])], [eq1, eq2, intersection]);

  const onLineDrag = (effect: LineDragEffect, final: boolean) => {
    if (!dragStart.current) dragStart.current = dragLine === 0 ? eq1 : eq2;
    setNote(`Line ${dragLine + 1}: ${describeTranslation(dragStart.current, effect.after)}`);
    if (final) dragStart.current = null;
    setEquationLive(dragLine === 0 ? 1 : 2, effect.after, final);
  };

  const canvas = (
    <div className="absolute inset-0 flex flex-col">
      <div className="shrink-0 flex flex-wrap items-center gap-1.5 px-2 py-1.5 bg-surface-low/90 border-b border-surface-border" role="toolbar" aria-label="Line dragging">
        {[
          { label: 'Pan only', mode: 'none' as DragMode, line: 0 as 0 | 1 },
          { label: 'Move line 1', mode: 'line' as DragMode, line: 0 as 0 | 1 },
          { label: 'Move line 2', mode: 'line' as DragMode, line: 1 as 0 | 1 },
        ].map((b) => {
          const on = dragMode === b.mode && (b.mode === 'none' || dragLine === b.line);
          return (
            <button
              key={b.label}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setDragMode(b.mode);
                setDragLine(b.line);
              }}
              className={`h-10 px-3 rounded-lg text-xs font-mono font-bold border ${on ? 'bg-purple-600 border-purple-400 text-white' : 'bg-surface-card border-surface-border text-slate-300'}`}
            >
              {b.label}
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-3 text-[11px] font-mono">
          <span style={{ color: LINE_1_COLOR }}>━ Line 1</span>
          <span style={{ color: LINE_2_COLOR }}>╍ Line 2</span>
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <GraphCanvas
          lines={lines}
          intersection={intersection}
          dragMode={effectiveMode}
          dragLineIndex={dragIndex}
          onLineDrag={onLineDrag}
          fitPoints={fitPoints}
          fitSignal={fitSignal}
          ariaLabel={`Graph of ${formatStandard(eq1)} and ${formatStandard(eq2)}`}
        />
      </div>
    </div>
  );

  const badge = typeBadge[analysis.type];

  const tools = (
    <div>
      {/* Compact selector on small screens: one editor at a time */}
      <div className="lg:hidden flex p-2 gap-2 border-b border-surface-border/60" role="tablist" aria-label="Choose equation to edit">
        {[1, 2].map((n) => (
          <button key={n} type="button" role="tab" aria-selected={activeEq === n} onClick={() => setActiveEq(n as 1 | 2)} className={`flex-1 h-11 rounded-lg text-xs font-mono font-bold border ${activeEq === n ? 'bg-purple-600 border-purple-400 text-white' : 'bg-surface-card border-surface-border text-slate-300'}`}>
            Equation {n}
          </button>
        ))}
      </div>
      <div className={activeEq === 1 ? 'block' : 'hidden lg:block'}>
        <EquationEditor which={1} color={LINE_1_COLOR} label="Equation 1 (solid)" showDetails={false} showForms={false} />
      </div>
      <div className={activeEq === 2 ? 'block' : 'hidden lg:block'}>
        <EquationEditor which={2} color={LINE_2_COLOR} label="Equation 2 (dashed)" showDetails={false} showForms={false} />
      </div>

      <UndoRedoRow />

      <div className={`m-3 p-3 rounded-xl border text-sm font-bold ${badge.cls}`} role="status" aria-live="polite">{badge.text}</div>

      <div className="mx-3 mb-3 p-3 rounded-xl bg-surface-card border border-surface-border space-y-1.5 text-xs font-mono">
        <div className="flex justify-between"><span className="text-slate-400">Slope of 1</span><span className="text-white">{slopeText(eq1)}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Slope of 2</span><span className="text-white">{slopeText(eq2)}</span></div>
        {analysis.determinant && <div className="flex justify-between"><span className="text-slate-400">a₁b₂ − a₂b₁</span><span className="text-white">{formatRational(analysis.determinant)}</span></div>}
        <p className="text-slate-300 leading-snug pt-1 font-sans">{analysis.reason}</p>
        {isLine(eq1) && isLine(eq2) && (lineKind(eq1) === 'vertical' || lineKind(eq2) === 'vertical') && (
          <p className="text-slate-400 font-sans">A vertical line has no slope; the lab compares the coefficients a and b instead.</p>
        )}
      </div>

      {analysis.type === 'unique' && analysis.solution && check && (
        <ReadoutCard title="Intersection and substitution check" tone="ok">
          <div className="font-mono text-white text-base">Intersection: ({formatRational(analysis.solution.x)}, {formatRational(analysis.solution.y)})</div>
          <div className="text-xs font-mono text-slate-200 space-y-0.5">
            <div>Eq 1: {formatRational(eq1.a)}({formatRational(analysis.solution.x)}) + {formatRational(eq1.b)}({formatRational(analysis.solution.y)}) = {formatRational(sub(check.eq1Value, eq1.c))} {check.eq1Holds ? '✓' : '✗'} (right side {formatRational(neg(eq1.c))})</div>
            <div>Eq 2: {formatRational(eq2.a)}({formatRational(analysis.solution.x)}) + {formatRational(eq2.b)}({formatRational(analysis.solution.y)}) = {formatRational(sub(check.eq2Value, eq2.c))} {check.eq2Holds ? '✓' : '✗'} (right side {formatRational(neg(eq2.c))})</div>
          </div>
        </ReadoutCard>
      )}
      {analysis.type === 'parallel' && (
        <ReadoutCard title="No intersection" tone="bad"><div className="text-xs text-slate-200">The lines never meet, so no ordered pair satisfies both equations. No intersection point is marked.</div></ReadoutCard>
      )}
      {analysis.type === 'coincident' && (
        <ReadoutCard title="Same line" tone="warn"><div className="text-xs text-slate-200">Every point of the line satisfies both equations. There is no single intersection point, so none is marked.</div></ReadoutCard>
      )}
      {note && dragMode === 'line' && <ReadoutCard title="Moving a line" tone="info"><div className="text-xs text-slate-300">{note}</div></ReadoutCard>}
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};
