import React, { useState } from 'react';

export interface NumberInputProps {
  id?: string;
  value: number;
  onCommit: (value: number) => void;
  disabled?: boolean;
  dataField?: string;
  testId?: string;
  ariaLabel?: string;
  className?: string;
}

const parse = (raw: string): number | null => {
  const t = raw.trim().replace('−', '-');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/**
 * A number field that keeps the text being typed apart from the committed value, so the field can be cleared,
 * a minus sign or decimal point can be typed, and a value the model rejects never snaps the field back mid-edit.
 * It commits only text that parses; leaving the field restores the last committed value.
 */
export const NumberInput: React.FC<NumberInputProps> = ({ id, value, onCommit, disabled, dataField, testId, ariaLabel, className }) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) {
    setLast(value);
    if (parse(text) !== value) setText(String(value));
  }
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      data-field={dataField}
      data-testid={testId}
      aria-label={ariaLabel}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = parse(e.target.value);
        if (n !== null) onCommit(n);
      }}
      onBlur={() => setText(String(value))}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
      className={className}
    />
  );
};
