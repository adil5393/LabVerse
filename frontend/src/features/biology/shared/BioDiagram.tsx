/**
 * Diagram building blocks for Biology lessons, practice solutions and laboratories.
 *
 *  - `BioDiagram`: a labelled anatomical diagram or cross-section. Numbered markers sit on the drawing instead of crowded text
 *    labels; tapping (or focusing and pressing Enter) a marker shows that part's name, structure and function below the drawing.
 *    Every part is also listed in words, so nothing depends on seeing the picture.
 *  - `BioSequence`: a process shown one stage at a time, with the stages also listed in words.
 *  - `BioCompare`: before/after or side-by-side panels, each captioned in words.
 *
 * Each block states what kind of picture it is (`DiagramKind`): a simplified schematic, a model, or a realistic view of what
 * is actually observed, so students never mistake a schematic for a photograph.
 */

import React, { useId, useState } from 'react';
import { LabKey, LabSteps } from '../../education/LabLayout';
import { SELECTED } from './bioPalette';

export type DiagramKind = 'schematic' | 'model' | 'observation';

const KIND: Record<DiagramKind, { icon: string; label: string }> = {
  schematic: { icon: 'schema', label: 'Schematic diagram' },
  model: { icon: 'view_in_ar', label: 'Simplified model' },
  observation: { icon: 'visibility', label: 'Realistic view' },
};

/** “Schematic diagram · not to scale”: what kind of picture this is, said in words with an icon (not colour alone). */
export const DiagramBadge: React.FC<{ kind: DiagramKind; note?: string }> = ({ kind, note }) => (
  <p className={`bio-badge bio-badge--${kind}`} data-diagram-kind={kind}>
    <span aria-hidden className="material-symbols-outlined text-[15px]">{KIND[kind].icon}</span>
    <span><strong>{KIND[kind].label}</strong>{note ? ` · ${note}` : ''}</span>
  </p>
);

export interface DiagramPart {
  id: string;
  name: string;
  /** Marker position in the diagram's own units. */
  at: [number, number];
  /** One or two sentences: what it is like and what it does. */
  detail: string;
}

export interface LegendItem { colour: string; label: string; shape?: 'dot' | 'line' | 'dash' }

/** A numbered, focusable marker. The invisible circle gives a 44 px touch target at phone widths. */
export const Hotspot: React.FC<{ n: number; at: [number, number]; on: boolean; label: string; id: string; onPick: () => void; hit?: number }> = ({ n, at, on, label, id, onPick, hit = 17 }) => (
  <g role="button" tabIndex={0} aria-label={`${n}. ${label}`} aria-pressed={on} data-hotspot={id} className="lab-hotspot"
    onClick={onPick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(); } }}>
    <circle cx={at[0]} cy={at[1]} r={hit} fill="transparent" />
    <circle cx={at[0]} cy={at[1]} r="8" fill={on ? SELECTED : '#0f172a'} stroke={on ? '#fff' : SELECTED} strokeWidth="1.5" />
    <text x={at[0]} y={at[1] + 3.5} fontSize="10" textAnchor="middle" fill={on ? '#0f172a' : '#fff'} fontWeight="700">{n}</text>
  </g>
);

export interface BioDiagramProps {
  testId: string;
  /** Accessible name of the drawing, for example “Section through a nucleus”. */
  title: string;
  kind: DiagramKind;
  note?: string;
  viewBox: string;
  /** The drawing. Receives the selected part so it can be highlighted in the drawing as well as at its marker. */
  art: (selected: string | null) => React.ReactNode;
  parts: DiagramPart[];
  legend?: LegendItem[];
  /** Part selected at first (none by default). */
  initial?: string | null;
  /** A sentence under the drawing that ties the parts together. */
  summary?: React.ReactNode;
  /** Optional controls shown above the drawing (for example a 2D / 3D switch). */
  toolbar?: React.ReactNode;
}

export const BioDiagram: React.FC<BioDiagramProps> = ({ testId, title, kind, note, viewBox, art, parts, legend, initial = null, summary, toolbar }) => {
  const [selected, setSelected] = useState<string | null>(initial);
  const part = parts.find((p) => p.id === selected) ?? null;
  const n = part ? parts.indexOf(part) + 1 : 0;
  const listId = useId();
  // Touch targets scale with the drawing: about 8.5 % of its width keeps each marker at least 44 px across on a 320 px phone.
  const hit = Math.max(17, Number(viewBox.split(/\s+/)[2]) * 0.085);
  return (
    <div className="bio-diagram" data-testid={testId} data-selected={selected ?? ''}>
      <DiagramBadge kind={kind} note={note} />
      {toolbar}
      <svg viewBox={viewBox} role="group" aria-label={`${title}, with ${parts.length} numbered parts`}>
        {art(selected)}
        {parts.map((p, i) => <Hotspot key={p.id} n={i + 1} at={p.at} id={p.id} label={p.name} on={p.id === selected} hit={hit} onPick={() => setSelected(p.id === selected ? null : p.id)} />)}
      </svg>
      {legend && <LabKey items={legend} />}
      <div className="bio-inspect" aria-live="polite" data-testid={`${testId}-inspect`}>
        {part
          ? <><p className="bio-inspect__name">{n}. {part.name}</p><p className="m-0">{part.detail}</p></>
          : <p className="m-0 text-slate-400">Tap a number to find out what that part is and what it does.</p>}
      </div>
      {summary && <p className="bio-diagram__summary">{summary}</p>}
      <details className="lab-fold">
        <summary aria-controls={listId}>All {parts.length} labelled parts in words</summary>
        <ol className="lab-fold__body bio-parts" id={listId}>
          {parts.map((p) => <li key={p.id}><strong>{p.name}:</strong> {p.detail}</li>)}
        </ol>
      </details>
    </div>
  );
};

export interface SequenceFrame { title: string; caption: string; art: React.ReactNode }

/** A process, one stage at a time. On wide screens all stages can be seen at once with “Show all stages”. */
export const BioSequence: React.FC<{ testId: string; title: string; kind: DiagramKind; note?: string; viewBox: string; frames: SequenceFrame[]; initial?: number; legend?: LegendItem[] }> = ({ testId, title, kind, note, viewBox, frames, initial = 0, legend }) => {
  const [step, setStep] = useState(Math.min(initial, frames.length - 1));
  const [all, setAll] = useState(false);
  const f = frames[step];
  return (
    <div className="bio-diagram" data-testid={testId} data-step={step}>
      <DiagramBadge kind={kind} note={note} />
      {all
        ? <ol className="bio-sequence-all">{frames.map((fr, i) => (
          <li key={fr.title}><svg viewBox={viewBox} role="img" aria-label={`${title}, stage ${i + 1}: ${fr.title}. ${fr.caption}`}>{fr.art}</svg><p className="m-0"><strong>{i + 1}. {fr.title}.</strong> {fr.caption}</p></li>
        ))}</ol>
        : <>
          <svg viewBox={viewBox} role="img" aria-label={`${title}, stage ${step + 1} of ${frames.length}: ${f.title}. ${f.caption}`}>{f.art}</svg>
          {legend && <LabKey items={legend} />}
          <LabSteps step={step} count={frames.length} onStep={setStep} labels={frames.map((x) => x.title)} />
          <p className="bio-inspect m-0" data-testid={`${testId}-caption`}>{f.caption}</p>
        </>}
      <button type="button" className="lab-btn lab-btn--quiet" aria-pressed={all} data-action="show-all-stages" onClick={() => setAll(!all)}>
        <span aria-hidden className="material-symbols-outlined text-[18px]">{all ? 'view_carousel' : 'view_agenda'}</span>{all ? 'One stage at a time' : 'Show all stages'}
      </button>
    </div>
  );
};

export interface ComparePanel { label: string; title: string; caption: string; art: React.ReactNode }

/** Before/after or side-by-side comparison. Panels sit side by side when there is room and stack on narrow phones. */
export const BioCompare: React.FC<{ testId: string; title: string; kind: DiagramKind; note?: string; viewBox: string; panels: ComparePanel[]; legend?: LegendItem[]; summary?: React.ReactNode }> = ({ testId, title, kind, note, viewBox, panels, legend, summary }) => (
  <div className="bio-diagram" data-testid={testId}>
    <DiagramBadge kind={kind} note={note} />
    <ul className={`bio-compare bio-compare--${panels.length}`} aria-label={title}>
      {panels.map((p) => (
        <li key={p.label}>
          <span className="bio-compare__label">{p.label}</span>
          <svg viewBox={viewBox} role="img" aria-label={`${p.label}: ${p.title}. ${p.caption}`}>{p.art}</svg>
          <p className="m-0 font-semibold">{p.title}</p>
          <p className="m-0 text-slate-300">{p.caption}</p>
        </li>
      ))}
    </ul>
    {legend && <LabKey items={legend} />}
    {summary && <p className="bio-diagram__summary">{summary}</p>}
  </div>
);
