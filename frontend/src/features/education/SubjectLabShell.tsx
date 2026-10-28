/**
 * A plain, phone-first laboratory page used by the Chemistry and Biology laboratories: header, a collapsible "how to use"
 * note, tabbed investigations with 48 px targets, and a list of what the laboratory assumes. The selected tab follows the
 * `?view=` query parameter so lessons can link straight to one investigation.
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { InteractiveActivity } from '../../components/InteractiveActivity';

export interface LabView { id: string; label: string; render: () => React.ReactNode }

export const SubjectLabShell: React.FC<{ title: string; testId: string; intro: string; back: { href: string; label: string }; views: LabView[]; assumptions: string[] }> = ({ title, testId, intro, back, views, assumptions }) => {
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const active = views.find((v) => v.id === requested) ?? views[0];
  const select = (id: string) => { const next = new URLSearchParams(params); next.set('view', id); setParams(next, { replace: true }); };
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 space-y-4" data-testid={testId}>
        <Link to={back.href} className="inline-flex items-center min-h-[44px] text-sm text-slate-300 hover:text-white">← {back.label}</Link>
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
          <details className="text-sm text-slate-300"><summary className="min-h-[44px] cursor-pointer py-3">How to use this laboratory</summary><p className="max-w-3xl pb-2">{intro}</p></details>
        </header>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Investigations">
          {views.map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={active.id === v.id} data-view={v.id} onClick={() => select(v.id)}
              className={`min-h-[48px] px-4 rounded-full text-sm font-semibold border touch-manipulation ${active.id === v.id ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-border text-slate-300'}`}>{v.label}</button>
          ))}
        </div>
        <InteractiveActivity>{active.render()}</InteractiveActivity>
        <section className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-2" aria-label="What this laboratory assumes" data-testid="lab-assumptions">
          <h2 className="text-base font-black text-white">What this laboratory assumes</h2>
          <ul className="list-disc pl-5 space-y-1 text-[13px] text-slate-300">{assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
        </section>
      </main>
    </div>
  );
};

/** Shared small controls for laboratory figures. */
export const fmtNum = (n: number, d = 2) => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString('en-IN') : String(Math.round(n * 10 ** d) / 10 ** d));
export const labCard = 'rounded-xl border border-surface-border bg-surface-lowest p-3 space-y-2';

export const LabSlider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }> = ({ id, label, value, min, max, step, unit, onChange }) => (
  <label htmlFor={id} className="block text-sm text-slate-200">
    <span className="flex justify-between gap-2"><span>{label}</span><strong className="font-mono text-white">{fmtNum(value)} {unit}</strong></span>
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
  <fieldset className="space-y-1">
    <legend className="text-sm text-slate-200">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} data-choice={`${name}:${o.id}`} onClick={() => onChange(o.id)}
          className={`min-h-[48px] px-3 rounded-xl text-sm border touch-manipulation ${value === o.id ? 'bg-teal-500/20 border-teal-400 text-white' : 'bg-surface border-surface-border text-slate-300'}`}>{o.label}</button>
      ))}
    </div>
  </fieldset>
);
