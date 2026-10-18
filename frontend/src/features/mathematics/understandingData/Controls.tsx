/**
 * Small shared controls for the Understanding Data laboratory (M6).
 */

import React, { useEffect, useRef, useState } from 'react';
import { type Q, parseQ, formatExact, formatDecimal } from '../../../engine/mathematics/understandingData/rational';
import { useUnderstandingDataStore } from '../../../store/useUnderstandingDataStore';

/** Shown value: exact when short, else a rounded decimal. Used only inside inputs. */
const inputText = (v: Q): string => (v.d === 1n || formatExact(v).length <= 8 ? formatExact(v) : formatDecimal(v, 4));

interface NumberFieldProps {
  value: Q | null;
  onCommit: (v: Q | null) => void;
  label: string;
  /** Reject values below zero (counts, sizes, weights, percentages). */
  nonNegative?: boolean;
  max?: Q;
  /** Let the student clear the box: reported as null (a MISSING value, not 0). */
  allowEmpty?: boolean;
  className?: string;
  width?: string;
}

/**
 * Text field that parses exact numbers ("12", "2.5", "1/3"). It applies valid
 * values after a short pause or on Enter/blur, and explains invalid input
 * without changing the data.
 */
export const NumberField: React.FC<NumberFieldProps> = ({ value, onCommit, label, nonNegative, max, allowEmpty, className = '', width = 'w-full' }) => {
  const [draft, setDraft] = useState(value ? inputText(value) : '');
  const [error, setError] = useState<string | null>(null);
  const focused = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!focused.current) {
      setDraft(value ? inputText(value) : '');
      setError(null);
    }
  }, [value]);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const apply = (text: string) => {
    if (text.trim() === '') {
      if (allowEmpty) { setError(null); onCommit(null); } else setError('Enter a number');
      return;
    }
    const v = parseQ(text);
    if (!v) return setError('Not a number. Use digits, a decimal point or a fraction like 3/2.');
    if (nonNegative && v.n < 0n) return setError('Must be 0 or more.');
    if (max && v.n * max.d > max.n * v.d) return setError(`Must be at most ${formatExact(max)}.`);
    setError(null);
    if (!value || v.n !== value.n || v.d !== value.d) onCommit(v);
  };

  return (
    <label className={`block ${width} ${className}`}>
      <span className="sr-only">{label}</span>
      <input
        value={draft}
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        aria-invalid={error !== null}
        placeholder={allowEmpty ? 'missing' : ''}
        onFocus={() => (focused.current = true)}
        onBlur={() => { focused.current = false; if (timer.current !== null) window.clearTimeout(timer.current); apply(draft); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { if (timer.current !== null) window.clearTimeout(timer.current); apply(draft); } }}
        onChange={(e) => {
          setDraft(e.target.value);
          if (timer.current !== null) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => apply(e.target.value), 600);
        }}
        className={`w-full h-11 px-2 rounded-lg bg-surface-lowest border text-white text-base font-mono outline-none focus:border-purple-400 ${error ? 'border-rose-500' : 'border-surface-border'}`}
      />
      {error && <span className="block mt-0.5 text-[11px] text-rose-300" role="alert">{error}</span>}
    </label>
  );
};

export const Card: React.FC<{ title: string; tone?: 'ok' | 'warn' | 'bad' | 'info' | 'plain'; children: React.ReactNode; className?: string }> = ({ title, tone = 'plain', children, className = '' }) => {
  const color = { ok: 'border-emerald-500/40 bg-emerald-950/20', warn: 'border-amber-500/40 bg-amber-950/20', bad: 'border-rose-500/40 bg-rose-950/20', info: 'border-sky-500/40 bg-sky-950/20', plain: 'border-surface-border bg-surface-card' }[tone];
  return (
    <section className={`m-3 p-3 rounded-xl border space-y-1.5 ${color} ${className}`}>
      <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </section>
  );
};

export const UndoRow: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const past = useUnderstandingDataStore((s) => s.past);
  const future = useUnderstandingDataStore((s) => s.future);
  const undo = useUnderstandingDataStore((s) => s.undo);
  const redo = useUnderstandingDataStore((s) => s.redo);
  const reset = useUnderstandingDataStore((s) => s.resetExperiment);
  const b = 'min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40 flex items-center gap-1.5';
  return (
    <div className="px-3 py-2 flex flex-wrap items-center gap-2 border-b border-surface-border/60">
      <button type="button" onClick={undo} disabled={past.length === 0} className={b}><span className="material-symbols-outlined text-[16px]">undo</span>Undo</button>
      <button type="button" onClick={redo} disabled={future.length === 0} className={b}><span className="material-symbols-outlined text-[16px]">redo</span>Redo</button>
      <button type="button" onClick={onReset ?? reset} className={b}><span className="material-symbols-outlined text-[16px]">restart_alt</span>Reset experiment</button>
    </div>
  );
};

export const Segmented = <T extends string>({ value, options, onChange, label, disabledValues = [] }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string; disabledValues?: T[] }) => (
  <div className="inline-flex flex-wrap items-center gap-0.5 sm:gap-1 bg-surface-lowest p-0.5 sm:p-1 rounded-xl border border-surface-border" role="group" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.id}
        type="button"
        aria-pressed={value === o.id}
        disabled={disabledValues.includes(o.id)}
        onClick={() => onChange(o.id)}
        className={`min-h-11 px-2 sm:px-3 rounded-lg text-xs font-mono font-bold disabled:opacity-40 ${value === o.id ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const LockedNotice: React.FC = () => (
  <div className="m-3 p-3 rounded-xl border border-purple-500/40 bg-purple-950/20 text-sm text-purple-100 flex items-start gap-2" role="status">
    <span className="material-symbols-outlined text-[18px] shrink-0">lock</span>
    <span>Results are hidden until you make your prediction in the Lesson panel. Look at the data first, then predict.</span>
  </div>
);

/** Width in CSS pixels of an element, kept up to date with a ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(initial = 560): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number) => w > 40 && setWidth((cur) => (Math.abs(cur - w) > 1 ? w : cur));
    apply(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((e) => apply(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
