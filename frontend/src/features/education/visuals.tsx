/**
 * The clean interface between the shared lesson components and a chapter's
 * own visuals. A chapter registers components by `VisualRef.kind`; the shared
 * components never import chapter code.
 */

import React, { createContext, useContext } from 'react';
import type { VisualRef } from '../../engine/education/types';

export interface VisualProps {
  props: Record<string, unknown>;
  /** Accessible text alternative (also shown to everyone as the caption). */
  alt: string;
  /** Interactive visuals report the student's choice here (visual questions). */
  onAnswer?: (answerId: string) => void;
  /** Interactive visuals lock after a correct answer. */
  locked?: boolean;
}

export type VisualRegistry = Record<string, React.ComponentType<VisualProps>>;

const RegistryContext = createContext<VisualRegistry>({});
export const VisualRegistryProvider = RegistryContext.Provider;

export const VisualHost: React.FC<{ visual: VisualRef; onAnswer?: (id: string) => void; locked?: boolean }> = ({ visual, onAnswer, locked }) => {
  const registry = useContext(RegistryContext);
  const Visual = registry[visual.kind];
  if (!Visual) {
    // A missing visual must never hide the lesson: fall back to the text alternative.
    return <p className="text-xs text-slate-400 border border-dashed border-surface-border rounded-lg p-3">{visual.alt}</p>;
  }
  return (
    <figure className="m-0 min-w-0">
      <div className="science-surface rounded-xl overflow-hidden"><Visual props={visual.props ?? {}} alt={visual.alt} onAnswer={onAnswer} locked={locked} /></div>
      <figcaption className="mt-2 text-xs text-slate-400 leading-relaxed">{visual.alt}</figcaption>
    </figure>
  );
};
