/**
 * The phone-first laboratory page used by the Chemistry and Biology laboratories.
 *
 * - A compact header: the title with one way back (to the lesson when the laboratory was opened from one, otherwise to the
 *   chapter), so the experiment starts high on a phone screen.
 * - Investigations: a labelled drop-down on narrow screens and an ARIA tab list on wider ones (arrow keys, Home and End move
 *   between tabs; every tab is linked to its panel). The selection follows `?view=` so lessons can link to one investigation.
 * - Each investigation keeps its settings while the student switches between them: a panel is mounted the first time it is
 *   opened and then only hidden. “Reset” (in the activity toolbar) returns one investigation to its starting settings.
 * - Every investigation runs inside the same `InteractiveActivity` used by lessons, so focus mode behaves the same everywhere.
 * - A session notebook keeps the results the student chooses to record, per investigation, for comparison.
 * - “How to use” and “What this laboratory assumes” are folded away at the bottom.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { InteractiveActivity } from '../../components/InteractiveActivity';
import { LabTaskBanner, useLessonLabTask } from './LabTaskBridge';
import { LAB_TASK_PARAMS } from './labTaskLinks';
import { LabSessionProvider, type LabFinding, type LabSession } from './LabLayout';

export interface LabView { id: string; label: string; render: () => React.ReactNode }

const safeBack = (v: string | null): string | null => (v && v.startsWith('/') && !v.startsWith('//') ? v : null);

export const SubjectLabShell: React.FC<{ title: string; testId: string; intro: string; back: { href: string; label: string }; views: LabView[]; assumptions: string[] }> = ({ title, testId, intro, back, views, assumptions }) => {
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const active = views.find((v) => v.id === requested) ?? views[0];
  const bridge = useLessonLabTask();
  const lessonBack = safeBack(params.get(LAB_TASK_PARAMS.back));
  const [visited, setVisited] = useState<string[]>([active.id]);
  const [findings, setFindings] = useState<Record<string, LabFinding[]>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const baseId = testId;

  const select = useCallback((id: string) => {
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    const next = new URLSearchParams(params);
    next.set('view', id);
    setParams(next, { replace: true });
  }, [params, setParams]);
  // A view requested through the URL counts as visited too (for example after the back button).
  if (!visited.includes(active.id)) setVisited((v) => (v.includes(active.id) ? v : [...v, active.id]));

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = views.length - 1;
    const target = e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
        : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (target < 0) return;
    e.preventDefault();
    const id = views[target].id;
    select(id);
    tabRefs.current[id]?.focus();
  };

  const sessions = useMemo(() => Object.fromEntries(views.map((v): [string, LabSession] => [v.id, {
    findings: findings[v.id] ?? [],
    record: (f) => {
      setFindings((all) => ({ ...all, [v.id]: [...(all[v.id] ?? []), f] }));
      if (bridge.active) { bridge.observe(f.label, f.value); bridge.report('observation', v.id); }
    },
    clear: () => setFindings((all) => ({ ...all, [v.id]: [] })),
  }])), [views, findings, bridge]);

  const index = views.indexOf(active);
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans">
      <GlobalHeader />
      <main className="lab-shell flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-2 pb-6 space-y-3" data-testid={testId}>
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h1 className="text-xl md:text-3xl font-black text-white">{title}</h1>
          {lessonBack
            ? <Link to={lessonBack} data-testid="lab-back-to-lesson" className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl border border-cyan-500/60 text-sm font-semibold text-cyan-200"><span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>Back to the lesson</Link>
            : <Link to={back.href} aria-label={`Back to ${back.label}`} className="inline-flex items-center gap-1 min-h-[44px] px-2 text-sm text-slate-300 hover:text-white"><span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span><span className="sm:hidden">Chapter</span><span className="hidden sm:inline">{back.label}</span></Link>}
        </header>
        {bridge.active && <LabTaskBanner bridge={bridge} />}

        <label className="lab-shell-picker">
          <span className="text-sm font-semibold text-slate-300 shrink-0">Investigation</span>
          <select value={active.id} onChange={(e) => select(e.target.value)} aria-controls={`${baseId}-panel-${active.id}`} data-testid="lab-view-picker">
            {views.map((v, i) => <option key={v.id} value={v.id}>{i + 1}. {v.label}</option>)}
          </select>
          <span className="text-xs text-slate-400 shrink-0" aria-hidden>{index + 1}/{views.length}</span>
        </label>
        <div className="lab-shell-tabs" role="tablist" aria-label="Investigations">
          {views.map((v, i) => (
            <button key={v.id} ref={(el) => { tabRefs.current[v.id] = el; }} type="button" role="tab" id={`${baseId}-tab-${v.id}`} aria-controls={`${baseId}-panel-${v.id}`}
              aria-selected={active.id === v.id} tabIndex={active.id === v.id ? 0 : -1} data-view={v.id} onClick={() => select(v.id)} onKeyDown={(e) => onTabKey(e, i)}>{v.label}</button>
          ))}
        </div>

        {views.filter((v) => visited.includes(v.id)).map((v) => (
          <div key={v.id} role="tabpanel" id={`${baseId}-panel-${v.id}`} aria-labelledby={`${baseId}-tab-${v.id}`} hidden={v.id !== active.id} data-panel={v.id}>
            <LabSessionProvider value={sessions[v.id]}>
              <InteractiveActivity title={v.label} label={`${title}: ${v.label}`} closeLabel="Exit focus" resettable onReset={() => bridge.report('reset', v.id)}>
                {v.render()}
              </InteractiveActivity>
            </LabSessionProvider>
          </div>
        ))}

        <details className="rounded-2xl border border-surface-border bg-surface-card text-sm text-slate-300">
          <summary className="min-h-[44px] cursor-pointer px-4 py-3 font-semibold">How to use this laboratory</summary>
          <p className="max-w-3xl px-4 pb-4">{intro} Each investigation keeps its settings while you switch between them; “Reset” in the activity bar starts one again. “Record this result” keeps a result in your notebook for this visit so you can compare set-ups.</p>
        </details>
        <details className="rounded-2xl border border-surface-border bg-surface-card" data-testid="lab-assumptions">
          <summary className="min-h-[44px] cursor-pointer px-4 py-3 text-sm font-semibold text-white">What this laboratory assumes</summary>
          <ul className="list-disc pl-9 pr-4 pb-4 space-y-1 text-[13px] text-slate-300">{assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
        </details>
      </main>
    </div>
  );
};

/** Shared small controls for laboratory figures. */
export const fmtNum = (n: number, d = 2) => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString('en-IN') : String(Math.round(n * 10 ** d) / 10 ** d));

export const LabSlider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; format?: (v: number) => string }> = ({ id, label, value, min, max, step, unit, onChange, format }) => (
  <label htmlFor={id} className="block text-sm text-slate-200">
    <span className="flex justify-between gap-2"><span>{label}</span><strong className="font-mono text-white">{format ? format(value) : `${fmtNum(value)} ${unit}`}</strong></span>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full min-h-[44px] accent-teal-400" />
  </label>
);

export const LabSelect: React.FC<{ id: string; label: string; value: string; options: { id: string; label: string }[]; onChange: (id: string) => void }> = ({ id, label, value, options, onChange }) => (
  <label htmlFor={id} className="block text-sm text-slate-200">{label}
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface">
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </label>
);

export const LabChoice: React.FC<{ label: string; value: string; options: { id: string; label: string }[]; onChange: (id: string) => void; name: string }> = ({ label, value, options, onChange, name }) => (
  <fieldset className="space-y-1 min-w-0">
    <legend className="text-sm text-slate-200 mb-1">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} data-choice={`${name}:${o.id}`} onClick={() => onChange(o.id)}
          className={`min-h-[44px] px-3 rounded-xl text-sm border touch-manipulation ${value === o.id ? 'bg-teal-500/20 border-teal-400 text-white font-semibold' : 'bg-surface border-surface-border text-slate-300'}`}>{o.label}</button>
      ))}
    </div>
  </fieldset>
);
