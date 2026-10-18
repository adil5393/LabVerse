/**
 * Chart Laboratory (M6): stacked bars, 100% stacked bars, chart comparison,
 * dataset editor with CSV, and tap-to-answer interpretation challenges.
 * One authoritative dataset in the store feeds every chart on screen.
 */

import React, { useMemo, useRef, useState } from 'react';
import { useUnderstandingDataStore, type ChartView } from '../../../store/useUnderstandingDataStore';
import { getUDExperiment } from '../../../engine/mathematics/understandingData/experimentRegistry';
import {
  type ChartDataset,
  groupTotal, categoryTotal, grandTotal, groupShares, cell, buildOppositeCases, describeChart, missingCells, validateDataset,
  parseDatasetCsv, datasetToCsv, MAX_GROUPS, MAX_CATEGORIES,
} from '../../../engine/mathematics/understandingData/charts';
import { buildChallenges, type ChartChallenge } from '../../../engine/mathematics/understandingData/challenges';
import { formatSmart } from '../../../engine/mathematics/understandingData/rational';
import { NumberField, Card, UndoRow, Segmented, LockedNotice } from './Controls';
import { StackedChart, CATEGORY_COLORS, downloadChartPng } from './StackedChart';
import { WorkbenchShell } from './WorkbenchShell';

const f = (x: Parameters<typeof formatSmart>[0]) => formatSmart(x, 2);

interface Props {
  lesson?: React.ReactNode;
}

const DatasetEditor: React.FC<{ simple: boolean }> = ({ simple }) => {
  const ds = useUnderstandingDataStore((s) => s.dataset);
  const setCellV = useUnderstandingDataStore((s) => s.setChartCell);
  const addG = useUnderstandingDataStore((s) => s.addChartGroup);
  const rmG = useUnderstandingDataStore((s) => s.removeChartGroup);
  const addC = useUnderstandingDataStore((s) => s.addChartCategory);
  const rmC = useUnderstandingDataStore((s) => s.removeChartCategory);
  const renG = useUnderstandingDataStore((s) => s.renameChartGroup);
  const renC = useUnderstandingDataStore((s) => s.renameChartCategory);
  const [message, setMessage] = useState<string | null>(null);
  const run = (r: string | null) => setMessage(r);
  const issues = useMemo(() => validateDataset(ds), [ds]);
  const missing = useMemo(() => missingCells(ds), [ds]);
  const btn = 'min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40';

  return (
    <Card title={`Data table (${ds.unit})`}>
      {!simple && (
        <div className="flex flex-wrap gap-2 mb-2" aria-label="Categories">
          {ds.categories.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface-lowest pl-1.5" style={{ borderLeft: `4px solid ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}` }}>
              <input value={c.label} onChange={(e) => renC(c.id, e.target.value)} aria-label={`Name of category ${i + 1}`} className="w-24 h-10 px-1 bg-transparent text-white text-xs font-semibold outline-none" />
              {ds.categories.length > 1 && <button type="button" aria-label={`Remove category ${c.label}`} onClick={() => run(rmC(c.id))} className="w-9 h-10 text-slate-400 hover:text-rose-300">×</button>}
            </div>
          ))}
          <button type="button" className={btn} onClick={() => run(addC())} disabled={ds.categories.length >= MAX_CATEGORIES}>+ Category</button>
        </div>
      )}
      <div className="space-y-3">
        {ds.groups.map((g) => (
          <div key={g.id} className="rounded-xl border border-surface-border bg-surface-lowest p-2 space-y-2">
            <div className="flex items-center gap-2">
              {simple ? <div className="flex-1 text-sm font-bold text-white">{g.label}</div> : <input value={g.label} onChange={(e) => renG(g.id, e.target.value)} aria-label={`Name of ${g.label}`} className="flex-1 min-w-0 h-10 px-2 rounded-lg bg-surface-card border border-surface-border text-white text-sm font-semibold outline-none focus:border-purple-400" />}
              <span className="text-[11px] font-mono text-slate-400">total {f(groupTotal(ds, g.id))}</span>
              {!simple && ds.groups.length > 1 && <button type="button" aria-label={`Remove group ${g.label}`} onClick={() => run(rmG(g.id))} className="w-11 h-11 rounded-lg text-slate-400 hover:text-rose-300">×</button>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ds.categories.map((c, i) => (
                <div key={c.id}>
                  <div className="text-[11px] font-mono text-slate-400 mb-0.5 flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />{c.label}</div>
                  <NumberField value={cell(ds, g.id, c.id)} nonNegative allowEmpty label={`${g.label}, ${c.label}`} onCommit={(v) => run(setCellV(g.id, c.id, v))} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!simple && <button type="button" className={`${btn} mt-2`} onClick={() => run(addG())} disabled={ds.groups.length >= MAX_GROUPS}>+ Group</button>}
      {message && <p className="text-xs text-amber-300" role="alert">{message}</p>}
      {issues.map((i, k) => <p key={k} className="text-xs text-rose-300" role="alert">{i.message}</p>)}
      {missing.length > 0 && <p className="text-xs text-amber-200" role="status">{missing.length} cell(s) are empty and counted as MISSING, not 0.</p>}
    </Card>
  );
};

const DataIO: React.FC<{ chartRef: React.RefObject<HTMLDivElement | null> }> = ({ chartRef }) => {
  const ds = useUnderstandingDataStore((s) => s.dataset);
  const replace = useUnderstandingDataStore((s) => s.replaceDataset);
  const view = useUnderstandingDataStore((s) => s.chartView);
  const [paste, setPaste] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const btn = 'min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200';

  const importText = (text: string) => {
    const r = parseDatasetCsv(text, ds.title, ds.unit);
    if (!r.ok) {
      setErrors(r.errors.map((e) => `Line ${e.line}: ${e.message}`));
      setWarnings([]);
      return;
    }
    setErrors([]);
    setWarnings(r.warnings.slice(0, 5).map((w) => `Line ${w.line}: ${w.message}`));
    replace(r.dataset);
    setNote(`Imported ${r.dataset.groups.length} groups × ${r.dataset.categories.length} categories. The data stays in your browser.`);
  };

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([datasetToCsv(ds)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'labverse-chart-data.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <Card title="Import, export and save">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => fileRef.current?.click()}>Import CSV file</button>
        <button type="button" className={btn} onClick={exportCsv}>Export CSV</button>
        <button type="button" className={btn} onClick={async () => setNote((await downloadChartPng(chartRef.current, view === 'percent' ? 'percent' : 'absolute', 'labverse-chart.png')) ? 'Chart image saved.' : 'Could not create the image in this browser.')}>Download chart image</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" aria-label="Choose a CSV file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) importText(await file.text()); e.target.value = ''; }} />
      </div>
      <details>
        <summary className="min-h-11 flex items-center text-xs font-mono text-slate-300 cursor-pointer">Paste CSV text</summary>
        <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={5} aria-label="CSV text" placeholder={'Group,Boys,Girls\nHouse A,120,80\nHouse B,60,140'} className="w-full p-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-xs font-mono outline-none focus:border-purple-400" />
        <button type="button" className={`${btn} mt-1`} onClick={() => importText(paste)}>Use this data</button>
      </details>
      <p className="text-[11px] text-slate-500">First row: a name column, then category names. Empty cells are treated as missing. Nothing is uploaded.</p>
      {errors.length > 0 && <ul className="text-xs text-rose-300 space-y-0.5" role="alert">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
      {warnings.length > 0 && <ul className="text-xs text-amber-200 space-y-0.5" role="status">{warnings.map((e, i) => <li key={i}>{e}</li>)}</ul>}
      {note && <p className="text-xs text-emerald-300" role="status">{note}</p>}
    </Card>
  );
};

const Challenges: React.FC<{ onActive: (c: ChartChallenge | null) => void; setMarked: (m: { groupId: string; categoryId?: string; correct: boolean } | null) => void; pending: { g?: string; c?: string } | null; clearPending: () => void; armed: boolean; setArmed: (a: boolean) => void }> = ({ onActive, setMarked, pending, clearPending, armed, setArmed }) => {
  const ds = useUnderstandingDataStore((s) => s.dataset);
  const results = useUnderstandingDataStore((s) => s.challengeResults);
  const record = useUnderstandingDataStore((s) => s.recordChallenge);
  const challenges = useMemo(() => buildChallenges(ds), [ds]);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const cur = challenges.length ? challenges[Math.min(idx, challenges.length - 1)] : null;

  React.useEffect(() => { onActive(cur); }, [cur, onActive]);

  const answer = (correct: boolean, what: string, mark: { groupId: string; categoryId?: string } | null) => {
    if (!cur) return;
    setFeedback({ correct, text: cur.explanation });
    setArmed(false);
    if (mark) setMarked({ ...mark, correct });
    record(cur.id, correct, `${cur.prompt} You chose ${what}. ${cur.explanation}`);
  };

  // Chart taps arrive through `pending`.
  React.useEffect(() => {
    if (!cur || !pending || feedback) return;
    const ans = cur.answer;
    if (cur.input === 'bar' && pending.g && ans.kind === 'bar') {
      answer(pending.g === ans.groupId, ds.groups.find((g) => g.id === pending.g)?.label ?? pending.g, { groupId: pending.g });
      clearPending();
    } else if (cur.input === 'segment' && pending.g && pending.c && ans.kind === 'segment') {
      answer(pending.g === ans.groupId && pending.c === ans.categoryId, `${ds.groups.find((g) => g.id === pending.g)?.label} / ${ds.categories.find((c) => c.id === pending.c)?.label}`, { groupId: pending.g, categoryId: pending.c });
      clearPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  if (!cur) return <Card title="Challenges"><p className="text-xs text-slate-400">Add at least two groups and two categories to get interpretation challenges.</p></Card>;
  const done = challenges.filter((c) => results[c.id]?.answered).length;

  return (
    <Card title={`Chart challenge ${Math.min(idx, challenges.length - 1) + 1} of ${challenges.length} · ${done} answered`} tone="info">
      <p className="text-sm font-semibold text-white" aria-live="polite">{cur.prompt}</p>
      <p className="text-[11px] font-mono text-slate-400">{cur.concept === 'absolute' ? 'About actual amounts' : cur.concept === 'proportion' ? 'About proportions' : 'About choosing a chart'}{cur.mode === 'percent' ? ' · shown on the 100% chart' : ''}</p>
      {cur.input !== 'choice' && !feedback && (
        <div className="space-y-1">
          <button type="button" aria-pressed={armed} onClick={() => setArmed(!armed)} className={`min-h-11 px-3 rounded-lg text-xs font-mono font-bold border ${armed ? 'bg-sky-600 border-sky-300 text-white' : 'bg-surface-card border-surface-border text-slate-100'}`}>{armed ? 'Now tap your answer on the chart…' : 'Answer on the chart'}</button>
          <p className="text-[11px] text-slate-400">Until you press this, tapping the chart just shows a segment’s value.</p>
        </div>
      )}
      {cur.input === 'choice' && (
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {cur.options!.map((o, i) => (
            <button key={i} type="button" role="radio" aria-checked={false} disabled={Boolean(feedback)} onClick={() => answer(cur.answer.kind === 'choice' && cur.answer.index === i, `“${o}”`, null)} className="w-full min-h-12 p-3 rounded-xl border border-surface-border bg-surface-lowest text-left text-sm text-slate-100 hover:bg-surface-elevated disabled:opacity-60">{o}</button>
          ))}
        </div>
      )}
      {feedback && (
        <div className={`p-3 rounded-xl border text-xs space-y-1 ${feedback.correct ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-100' : 'border-amber-500/50 bg-amber-950/30 text-amber-100'}`} role="status">
          <div className="font-bold">{feedback.correct ? 'Correct!' : 'Not quite.'}</div>
          <div>{feedback.text}</div>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button type="button" disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFeedback(null); setMarked(null); setArmed(false); }} className="min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40">← Previous</button>
        <button type="button" onClick={() => { setIdx((idx + 1) % challenges.length); setFeedback(null); setMarked(null); setArmed(false); }} className="min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-purple-600 border-purple-400 text-white">{feedback ? 'Next challenge →' : 'Skip →'}</button>
        {feedback && <button type="button" onClick={() => { setFeedback(null); setMarked(null); setArmed(false); }} className="min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200">Try again</button>}
      </div>
    </Card>
  );
};

export const ChartLab: React.FC<Props> = ({ lesson }) => {
  const ds = useUnderstandingDataStore((s) => s.dataset);
  const view = useUnderstandingDataStore((s) => s.chartView);
  const setView = useUnderstandingDataStore((s) => s.setChartView);
  const selected = useUnderstandingDataStore((s) => s.selected);
  const select = useUnderstandingDataStore((s) => s.selectSegment);
  const locked = useUnderstandingDataStore((s) => s.isLocked());
  const experimentId = useUnderstandingDataStore((s) => s.currentExperimentId);
  const oppositeCase = useUnderstandingDataStore((s) => s.oppositeCase);
  const showOpposite = useUnderstandingDataStore((s) => s.showOppositeCase);
  const guided = useUnderstandingDataStore((s) => s.guidedActive);
  const simple = getUDExperiment(experimentId).simpleControls;

  const chartRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ChartChallenge | null>(null);
  const [marked, setMarked] = useState<{ groupId: string; categoryId?: string; correct: boolean } | null>(null);
  const [pending, setPending] = useState<{ g?: string; c?: string } | null>(null);
  const [armed, setArmed] = useState(false);
  const [oppMsg, setOppMsg] = useState<string | null>(null);
  const showChallenges = !guided || ['ud-choose', 'ud-claims'].includes(experimentId) || !simple;

  const effective: ChartView = active && active.mode === 'percent' && !locked ? 'percent' : view;
  const answerMode = active && armed && !marked ? (active.input === 'bar' ? 'bar' : active.input === 'segment' ? 'segment' : 'none') : 'none';

  const opp = useMemo(() => (ds.groups.length >= 2 && ds.categories.length >= 1 ? buildOppositeCases(ds, ds.groups[0].id, ds.groups[1].id, ds.categories[0].id) : null), [ds]);
  const oppDs: ChartDataset | null = opp && oppositeCase > 0 ? (oppositeCase === 1 ? opp.case1 : opp.case2) : null;

  const handleSelect = (g: string, c: string) => {
    if (answerMode === 'segment') setPending({ g, c });
    else select(g, c);
  };

  const sel = selected && ds.groups.some((g) => g.id === selected.groupId) && ds.categories.some((c) => c.id === selected.categoryId) ? selected : null;
  const selGroup = sel ? ds.groups.find((g) => g.id === sel.groupId)! : null;
  const selCat = sel ? ds.categories.find((c) => c.id === sel.categoryId)! : null;
  const selShare = sel ? groupShares(ds, sel.groupId) : null;
  const selPct = selShare && selShare.status === 'ok' ? selShare.rows.find((r) => r.categoryId === sel!.categoryId)?.text : null;
  const roundingNotes = useMemo(() => ds.groups.map((g) => ({ g, s: groupShares(ds, g.id) })).filter((x) => x.s.status === 'ok' && x.s.roundingNote), [ds]);
  const noData = ds.groups.filter((g) => groupShares(ds, g.id).status === 'no_data');

  const canvas = (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">{ds.title}</h2>
          <Segmented<ChartView> label="Chart type" value={view} onChange={setView} disabledValues={locked ? ['percent', 'both'] : []} options={[{ id: 'absolute', label: 'Stacked' }, { id: 'percent', label: '100%' }, { id: 'both', label: 'Both' }]} />
        </div>
        {locked && <LockedNotice />}

        <div ref={chartRef} className="space-y-4">
          {(effective === 'absolute' || effective === 'both') && (
            <div className="rounded-xl border border-surface-border bg-surface-lowest p-2 sm:p-3">
              <StackedChart dataset={ds} mode="absolute" selected={sel} onSelect={handleSelect} onSelectBar={(g) => setPending({ g })} answerMode={answerMode} marked={marked} title="Stacked bars: actual values" />
            </div>
          )}
          {(effective === 'percent' || effective === 'both') && (
            <div className="rounded-xl border border-surface-border bg-surface-lowest p-2 sm:p-3">
              <StackedChart dataset={ds} mode="percent" selected={sel} onSelect={handleSelect} onSelectBar={(g) => setPending({ g })} answerMode={answerMode} marked={marked} hidePercentText={locked} title="100% stacked bars: shares inside each group" />
              <p className="mt-2 text-[11px] text-slate-400">Every bar is stretched to the same length, so this chart cannot show which group is bigger. The totals are written beside the bars, not drawn in them.</p>
            </div>
          )}
        </div>

        {(effective !== 'absolute') && roundingNotes.map(({ g, s }) => s.status === 'ok' && (
          <p key={g.id} className="text-xs text-amber-200" role="note">{g.label}: {s.roundingNote}</p>
        ))}
        {effective !== 'absolute' && noData.map((g) => <p key={g.id} className="text-xs text-amber-200" role="note">{g.label} has a total of 0, so its percentages are undefined and nothing is drawn.</p>)}

        <div aria-live="polite">
          {sel && selGroup && selCat ? (
            <div className="rounded-xl border border-sky-500/40 bg-sky-950/20 p-3 text-sm text-slate-100" role="status">
              <strong>{selGroup.label} · {selCat.label}:</strong> {cell(ds, sel.groupId, sel.categoryId) ? f(cell(ds, sel.groupId, sel.categoryId)!) : 'missing'} {ds.unit}
              {!locked && selPct && <> = <strong>{selPct}%</strong> of {selGroup.label}’s total ({f(groupTotal(ds, sel.groupId))}).</>}
              {!locked && <> Across all groups, {selCat.label} totals {f(categoryTotal(ds, sel.categoryId))} {ds.unit}.</>}
              {locked && <> (Percentages stay hidden until you predict.)</>}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Tap or press a segment to read its exact value.</p>
          )}
        </div>

        {oppDs && opp && (
          <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-3 space-y-3" role="region" aria-label="Two raw datasets with the same 100% chart">
            <h3 className="text-sm font-bold text-purple-100">Dataset {oppositeCase}: a different set of actual numbers</h3>
            <p className="text-xs text-slate-200">{opp.summary}</p>
            <StackedChart dataset={oppDs} mode="absolute" title={`Dataset ${oppositeCase}: actual values`} />
            <StackedChart dataset={oppDs} mode="percent" title="Its 100% chart (identical in both datasets)" />
          </div>
        )}

        <details className="rounded-xl border border-surface-border bg-surface-card">
          <summary className="p-3 min-h-11 text-xs font-mono font-bold text-slate-300 cursor-pointer">Text description of the chart</summary>
          <div className="px-3 pb-3 space-y-2 text-xs text-slate-200">
            {(['absolute', 'percent'] as const).map((m) => <ul key={m} className="list-disc pl-4 space-y-1">{describeChart(ds, m).map((l, i) => <li key={i}>{l}</li>)}</ul>)}
            <table className="w-full text-[11px] font-mono mt-2">
              <caption className="sr-only">Data table</caption>
              <thead><tr className="text-left text-slate-400"><th scope="col" className="py-1 pr-2">Group</th>{ds.categories.map((c) => <th scope="col" key={c.id} className="pr-2">{c.label}</th>)}<th scope="col">Total</th></tr></thead>
              <tbody>
                {ds.groups.map((g) => <tr key={g.id} className="border-t border-surface-border/50"><th scope="row" className="py-1 pr-2 text-left font-semibold">{g.label}</th>{ds.categories.map((c) => <td key={c.id} className="pr-2">{cell(ds, g.id, c.id) ? f(cell(ds, g.id, c.id)!) : '—'}</td>)}<td>{f(groupTotal(ds, g.id))}</td></tr>)}
                <tr className="border-t border-surface-border"><th scope="row" className="py-1 pr-2 text-left">All groups</th>{ds.categories.map((c) => <td key={c.id}>{f(categoryTotal(ds, c.id))}</td>)}<td>{f(grandTotal(ds))}</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );

  const tools = (
    <div>
      <UndoRow />
      {!locked && (
        <Card title="Same 100% chart, different data">
          <p className="text-xs text-slate-300">See two different sets of actual numbers that produce exactly the same 100% chart for the first two groups.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-purple-600 border-purple-400 text-white" onClick={() => setOppMsg(showOpposite(oppositeCase === 1 ? 2 : 1))}>{oppositeCase === 0 ? 'Show a dataset' : 'Show another dataset'}</button>
          </div>
          {oppMsg && <p className="text-xs text-amber-300" role="alert">{oppMsg}</p>}
          {!opp && !oppMsg && <p className="text-[11px] text-slate-500">Needs two groups with different, non-zero shares in the first category.</p>}
        </Card>
      )}
      {showChallenges && !locked && (
        <Challenges onActive={setActive} setMarked={setMarked} pending={pending} clearPending={() => setPending(null)} armed={armed} setArmed={setArmed} />
      )}
      <DatasetEditor simple={simple} />
      {!simple && <DataIO chartRef={chartRef} />}
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};
