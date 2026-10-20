import React, { useState } from 'react';

export interface ParameterControlProps {
  id: string;
  label: string;
  unit: string;
  value: number;
  step: number;
  onChange: (val: number) => void;
  helperText?: string;
  symbol?: string;
  disabled?: boolean;
}

/**
 * ParameterControl: A cohesive, precision input control combining label,
 * numeric input, unit badge, and tactile decrement/increment buttons.
 * Guarantees comfortable touch targets (44px min), keyboard accessibility,
 * and seamless input parsing with sign handling.
 */
export const ParameterControl: React.FC<ParameterControlProps> = ({
  id,
  label,
  unit,
  value,
  step,
  onChange,
  helperText,
  symbol,
  disabled = false,
}) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);

  if (last !== value) {
    setLast(value);
    setText(String(value));
  }

  const handleStep = (direction: 1 | -1) => {
    if (disabled) return;
    const next = Math.round((value + direction * step) * 100) / 100;
    onChange(next);
  };

  const handleTextChange = (raw: string) => {
    setText(raw);
    const parsed = Number(raw.replace('−', '-'));
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={`field-${id}`} className="font-semibold text-slate-200 flex items-center gap-1.5">
          {symbol && (
            <span className="font-mono px-1.5 py-0.5 rounded text-[11px] font-bold bg-surface-elevated text-indigo-400 border border-surface-border">
              {symbol}
            </span>
          )}
          <span>{label}</span>
        </label>
        {helperText && (
          <span className="text-[11px] text-slate-400 font-mono">
            {helperText}
          </span>
        )}
      </div>

      <div className="flex items-center rounded-xl border border-surface-border bg-surface-lowest shadow-inner focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all overflow-hidden">
        <button
          type="button"
          aria-label={`Decrease ${label} by ${step}`}
          disabled={disabled}
          onClick={() => handleStep(-1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-card hover:bg-surface-elevated active:bg-surface-high text-slate-300 hover:text-white font-mono text-base border-r border-surface-border transition-colors disabled:opacity-40 disabled:pointer-events-none select-none"
        >
          −
        </button>

        <div className="flex-1 flex items-center px-3 gap-2">
          <input
            id={`field-${id}`}
            value={text}
            data-field={id}
            inputMode="decimal"
            disabled={disabled}
            aria-label={`${label} in ${unit}`}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full bg-transparent text-white font-mono text-sm font-semibold tracking-wide focus:outline-none disabled:opacity-50"
          />
          <span className="text-xs font-mono font-medium text-slate-400 bg-surface-container px-2 py-0.5 rounded border border-surface-border/60 select-none">
            {unit}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Increase ${label} by ${step}`}
          disabled={disabled}
          onClick={() => handleStep(1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-card hover:bg-surface-elevated active:bg-surface-high text-slate-300 hover:text-white font-mono text-base border-l border-surface-border transition-colors disabled:opacity-40 disabled:pointer-events-none select-none"
        >
          +
        </button>
      </div>
    </div>
  );
};
