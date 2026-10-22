import React, { useId, useState } from 'react';

/** A number field with decrement and increment buttons (44 px targets); invalid text is ignored until it parses. */
export const Field: React.FC<{ id: string; label: string; unit: string; value: number; step: number; onChange: (v: number) => void }> = ({ id, label, unit, value, step, onChange }) => {
  const inputId = useId();
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) { setLast(value); setText(String(value)); }
  return (
    <div className="grid grid-cols-[minmax(64px,1fr)_44px_44px] gap-1 text-xs text-slate-300 w-full sm:w-auto sm:min-w-[190px]">
      <label htmlFor={inputId} className="col-span-3 pb-1">{label} <span className="text-slate-400">({unit})</span></label>
        <input id={inputId} value={text} data-field={id} inputMode="decimal" aria-label={`${label} in ${unit}`} onChange={(e) => { setText(e.target.value); const n = Number(e.target.value.replace('−', '-')); if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n); }}
          className="w-full min-w-0 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" />
      <button type="button" aria-label={`Decrease ${label} by ${step}`} onClick={() => onChange(Math.round((value - step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">{'−'}</button>
      <button type="button" aria-label={`Increase ${label} by ${step}`} onClick={() => onChange(Math.round((value + step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">+</button>
    </div>
  );
};

