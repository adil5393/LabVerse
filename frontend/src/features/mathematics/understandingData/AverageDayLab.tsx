/**
 * "What an average hides" investigation (M6.1), after the textbook's Example 9
 * (A Typical Day): the average day of a population is a weighted mean of its
 * groups' days, yet it can describe none of them. Only means and the raw
 * distributions are used; no variance or standard deviation.
 */

import React, { useMemo, useState } from 'react';
import { useUnderstandingDataStore } from '../../../store/useUnderstandingDataStore';
import { withAverageRow, closestGroup, meanPerActivity, hoursBudgetIssues, AVERAGE_ROW_ID } from '../../../engine/mathematics/understandingData/averageDay';
import { cell, groupTotal } from '../../../engine/mathematics/understandingData/charts';
import { formatSmart, q } from '../../../engine/mathematics/understandingData/rational';
import { Card, NumberField, UndoRow, LockedNotice } from './Controls';
import { StackedChart } from './StackedChart';
import { WorkbenchShell } from './WorkbenchShell';
import { DatasetEditor } from './ChartLab';

const f = (x: Parameters<typeof formatSmart>[0]) => formatSmart(x, 2);

interface Props {
  lesson?: React.ReactNode;
}

export const AverageDayLab: React.FC<Props> = ({ lesson }) => {
  const ds = useUnderstandingDataStore((s) => s.dataset);
  const weights = useUnderstandingDataStore((s) => s.popWeights);
  const setWeight = useUnderstandingDataStore((s) => s.setPopWeight);
  const locked = useUnderstandingDataStore((s) => s.isLocked());
  const [sel, setSel] = useState<{ g: string; c: string } | null>(null);

  const { dataset: withAvg, result } = useMemo(() => withAverageRow(ds, weights), [ds, weights]);
  const closest = useMemo(() => (result.ok ? closestGroup(ds, result.rows) : null), [ds, result]);
  const budget = useMemo(() => hoursBudgetIssues(ds), [ds]);
  const label = (id: string) => ds.groups.find((g) => g.id === id)?.label ?? id;
  const catLabel = (id: string) => ds.categories.find((c) => c.id === id)?.label ?? id;
  const shown = locked || !result.ok ? ds : withAvg;

  const selGroup = sel ? (sel.g === AVERAGE_ROW_ID ? 'Average day' : label(sel.g)) : null;
  const selValue = sel ? cell(shown, sel.g, sel.c) : null;

  const canvas = (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">How the groups spend a day</h2>
          <p className="text-xs text-slate-400">Each bar is one group’s 24-hour day.{!locked && result.ok ? ' The last bar is the average day of the whole population.' : ''}</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-lowest p-2 sm:p-3">
          <StackedChart dataset={shown} mode="absolute" selected={sel ? { groupId: sel.g, categoryId: sel.c } : null} onSelect={(g, c) => setSel({ g, c })} title="Hours per day by activity" />
        </div>
        {locked && <LockedNotice />}
        <div aria-live="polite">
          {sel && selGroup ? (
            <div className="rounded-xl border border-sky-500/40 bg-sky-950/20 p-3 text-sm text-slate-100" role="status"><strong>{selGroup} · {catLabel(sel.c)}:</strong> {selValue ? f(selValue) : 'missing'} hours</div>
          ) : (
            <p className="text-xs text-slate-500">Tap or press a segment to read its hours.</p>
          )}
        </div>

        {!locked && result.ok && closest && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 text-sm text-slate-100 space-y-1" role="status">
            <div className="font-bold text-amber-200">Does anyone live the average day?</div>
            <p>
              The average day is {result.rows.map((r) => `${catLabel(r.categoryId)} ${f(r.mean)} h`).join(', ')}. The closest real group is <strong>{label(closest.groupId)}</strong>, and even it would have to spend <strong>{f(closest.hoursToShift)} hours</strong> of its day differently to match.
              {closest.hoursToShift.n === 0n && ' (Here one group happens to live exactly the average day.)'}
            </p>
          </div>
        )}
        {!result.ok && <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-100" role="alert">{result.error}</div>}

        {!locked && (
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-300">Same average per activity, different days</div>
            <table className="w-full text-xs font-mono">
              <caption className="sr-only">Mean hours per activity for each group</caption>
              <thead><tr className="text-left text-slate-400"><th scope="col" className="py-1">Group</th><th scope="col">Total hours</th><th scope="col">Mean per activity</th><th scope="col">Lowest – highest</th></tr></thead>
              <tbody>
                {ds.groups.map((g) => {
                  const vals = ds.categories.map((c) => cell(ds, g.id, c.id)).filter((v): v is NonNullable<typeof v> => v !== null);
                  const lo = vals.reduce((a, b) => (a.n * b.d <= b.n * a.d ? a : b), vals[0]);
                  const hi = vals.reduce((a, b) => (a.n * b.d >= b.n * a.d ? a : b), vals[0]);
                  return <tr key={g.id} className="border-t border-surface-border/50 text-slate-100"><th scope="row" className="py-1 text-left font-semibold">{g.label}</th><td>{f(groupTotal(ds, g.id))}</td><td>{f(meanPerActivity(ds, g.id) ?? q(0))}</td><td>{vals.length ? `${f(lo)} – ${f(hi)}` : '—'}</td></tr>;
                })}
              </tbody>
            </table>
            <p className="text-[11px] text-slate-400">When every day has 24 hours spread over the same number of activities, every group has the same mean per activity. The means are equal, but the days are not: a mean cannot show how the hours are spread.</p>
          </div>
        )}
      </div>
    </div>
  );

  const tools = (
    <div>
      <UndoRow />
      <Card title="Population of each group (the weights)">
        <div className="grid grid-cols-2 gap-2">
          {ds.groups.map((g) => (
            <div key={g.id}>
              <div className="text-[11px] font-mono text-slate-400 mb-0.5">{g.label}</div>
              <NumberField value={weights[g.id] ?? q(1)} nonNegative label={`Population of ${g.label}`} onCommit={(v) => v && setWeight(g.id, v)} />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">The average day counts each group in proportion to its population: a weighted mean.</p>
      </Card>
      {budget.length > 0 && (
        <Card title="Check the hours" tone="warn">
          {budget.map((b) => <p key={b.groupId} className="text-xs text-amber-100" role="alert">{label(b.groupId)}’s hours add up to {f(b.total)}, not 24.</p>)}
        </Card>
      )}
      <DatasetEditor simple />
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};
