import React, { useState } from 'react';

export interface LabParameterFieldProps {
  id: string;
  label: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  symbol?: string;
  symbolColor?: string;
  helperText?: string;
  disabled?: boolean;
  compact?: boolean;
  onChange: (val: number) => void;
  ariaLabel?: string;
  testId?: string;
}

/**
 * LabParameterField: Unified numeric parameter input with tactile steppers and unit badge.
 * Extracted from the approved Work Laboratory ParameterControl standard.
 * Features:
 * - Touch friendly stepper buttons (44px min in normal mode, 32px in compact)
 * - Sign parsing (handles unicode minus '−' and standard '-')
 * - Unit pill badge
 * - Focus-within ring with LabVerse primary accent
 * - Optional mathematical symbol tag
 */
export const LabParameterField: React.FC<LabParameterFieldProps> = ({
  id,
  label,
  value,
  unit,
  step = 1,
  min,
  max,
  symbol,
  symbolColor,
  helperText,
  disabled = false,
  compact = false,
  onChange,
  ariaLabel,
  testId,
}) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);

  if (last !== value) {
    setLast(value);
    setText(String(value));
  }

  const handleStep = (dir: 1 | -1) => {
    if (disabled) return;
    let next = Math.round((value + dir * step) * 100) / 100;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange(next);
  };

  const handleTextChange = (raw: string) => {
    setText(raw);
    const parsed = Number(raw.replace('−', '-'));
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      if (min !== undefined && parsed < min) return;
      if (max !== undefined && parsed > max) return;
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = Number(text.replace('−', '-'));
    if (text.trim() === '' || !Number.isFinite(parsed)) {
      setText(String(value));
    } else {
      let finalVal = parsed;
      if (min !== undefined && finalVal < min) finalVal = min;
      if (max !== undefined && finalVal > max) finalVal = max;
      onChange(finalVal);
      setText(String(finalVal));
    }
  };

  const hClass = compact ? 'min-h-[32px]' : 'min-h-[44px]';
  const btnW = compact ? 'w-8' : 'w-10';

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 py-0.5" data-testid={testId}>
        <label htmlFor={`field-${id}`} className="text-on-surface-variant text-[11px] font-mono flex items-center gap-1.5 truncate">
          {symbol && (
            <span
              className="px-1 py-0.2 rounded text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: symbolColor ?? '#4d8eff' }}
            >
              {symbol}
            </span>
          )}
          <span className="truncate">{label}</span>
        </label>

        <div className={`flex items-center rounded-lg border border-surface-border bg-surface-lowest shadow-inner focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all overflow-hidden ${hClass}`}>
          <button
            type="button"
            aria-label={`Decrease ${label} by ${step}`}
            disabled={disabled || (min !== undefined && value <= min)}
            onClick={() => handleStep(-1)}
            className={`${btnW} h-full flex items-center justify-center bg-surface-card hover:bg-surface-elevated text-slate-300 hover:text-white font-mono text-sm border-r border-surface-border transition-colors disabled:opacity-30 disabled:pointer-events-none select-none`}
          >
            −
          </button>

          <div className="flex items-center px-1.5 gap-1 min-w-[70px]">
            <input
              id={`field-${id}`}
              value={text}
              data-field={id}
              inputMode="decimal"
              disabled={disabled}
              aria-label={ariaLabel ?? `${label}${unit ? ` in ${unit}` : ''}`}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-white font-mono text-xs font-semibold focus:outline-none text-right disabled:opacity-50"
            />
            {unit && (
              <span className="text-[10px] font-mono font-medium text-slate-400 select-none">
                {unit}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={`Increase ${label} by ${step}`}
            disabled={disabled || (max !== undefined && value >= max)}
            onClick={() => handleStep(1)}
            className={`${btnW} h-full flex items-center justify-center bg-surface-card hover:bg-surface-elevated text-slate-300 hover:text-white font-mono text-sm border-l border-surface-border transition-colors disabled:opacity-30 disabled:pointer-events-none select-none`}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 w-full" data-testid={testId}>
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={`field-${id}`} className="font-semibold text-slate-200 flex items-center gap-1.5">
          {symbol && (
            <span
              className="font-mono px-1.5 py-0.5 rounded text-[11px] font-bold text-white border border-surface-border"
              style={{ backgroundColor: symbolColor ?? '#3b78e7' }}
            >
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

      <div className={`flex items-center rounded-xl border border-surface-border bg-surface-lowest shadow-inner focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden ${hClass}`}>
        <button
          type="button"
          aria-label={`Decrease ${label} by ${step}`}
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={() => handleStep(-1)}
          className={`${btnW} h-full flex items-center justify-center bg-surface-card hover:bg-surface-elevated active:bg-surface-high text-slate-300 hover:text-white font-mono text-base border-r border-surface-border transition-colors disabled:opacity-40 disabled:pointer-events-none select-none`}
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
            aria-label={ariaLabel ?? `${label}${unit ? ` in ${unit}` : ''}`}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-transparent text-white font-mono text-sm font-semibold tracking-wide focus:outline-none disabled:opacity-50"
          />
          {unit && (
            <span className="text-xs font-mono font-medium text-slate-400 bg-surface-container px-2 py-0.5 rounded border border-surface-border/60 select-none">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={`Increase ${label} by ${step}`}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => handleStep(1)}
          className={`${btnW} h-full flex items-center justify-center bg-surface-card hover:bg-surface-elevated active:bg-surface-high text-slate-300 hover:text-white font-mono text-base border-l border-surface-border transition-colors disabled:opacity-40 disabled:pointer-events-none select-none`}
        >
          +
        </button>
      </div>
    </div>
  );
};
