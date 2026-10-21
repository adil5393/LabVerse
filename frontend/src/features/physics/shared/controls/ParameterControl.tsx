import React, { useState } from 'react';

export interface ParameterControlProps {
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
  showSlider?: boolean;
  sliderStep?: number;
  onChange: (val: number) => void;
  ariaLabel?: string;
  testId?: string;
}

/**
 * ParameterControl: Modern, tactile educational parameter input.
 * Combines direct numeric entry (with Unicode sign parsing), tactile steppers (>=44px touch targets),
 * and an optional continuous slider for fluid educational exploration.
 */
export const ParameterControl: React.FC<ParameterControlProps> = ({
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
  showSlider = false,
  sliderStep,
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

  const handleStep = (direction: 1 | -1) => {
    if (disabled) return;
    let next = Math.round((value + direction * step) * 1000) / 1000;
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
      setText(String(finalVal));
      onChange(finalVal);
    }
  };

  const btnH = compact ? 'min-h-[36px] min-w-[36px]' : 'min-h-[44px] min-w-[44px]';

  return (
    <div className="space-y-1.5 w-full" data-testid={testId}>
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={`field-${id}`} className="font-semibold text-slate-200 flex items-center gap-1.5">
          {symbol && (
            <span
              className="font-mono px-1.5 py-0.5 rounded text-[11px] font-bold bg-surface-container border border-surface-border"
              style={{ color: symbolColor ?? 'var(--primary, #38bdf8)' }}
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

      <div className="flex items-center rounded-xl border border-surface-border bg-surface-lowest shadow-inner focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 transition-all overflow-hidden">
        <button
          type="button"
          aria-label={`Decrease ${label} by ${step}`}
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={() => handleStep(-1)}
          className={`${btnH} flex items-center justify-center bg-surface-card hover:bg-surface-container active:bg-surface-high text-slate-300 hover:text-white font-mono text-base border-r border-surface-border transition-colors disabled:opacity-40 disabled:pointer-events-none select-none`}
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
            <span className="text-xs font-mono font-medium text-slate-400 bg-surface-container px-2 py-0.5 rounded border border-surface-border/60 select-none whitespace-nowrap">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={`Increase ${label} by ${step}`}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => handleStep(1)}
          className={`${btnH} flex items-center justify-center bg-surface-card hover:bg-surface-container active:bg-surface-high text-slate-300 hover:text-white font-mono text-base border-l border-surface-border transition-colors disabled:opacity-40 disabled:pointer-events-none select-none`}
        >
          +
        </button>
      </div>

      {showSlider && min !== undefined && max !== undefined && (
        <div className="pt-1 px-1">
          <input
            type="range"
            min={min}
            max={max}
            step={sliderStep ?? step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${label} slider`}
            className="w-full accent-sky-400 h-2 bg-surface-container rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
            <span>{min} {unit}</span>
            <span>{max} {unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};
