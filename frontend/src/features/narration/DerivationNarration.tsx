/**
 * Narration region for the derivation views. Derivations are physics-only, so narration is on here without needing the lesson
 * page's subject switch. The region is reset when the derivation, the step or the gate state changes, so narration never reads
 * a step the student has left or mathematics that is still locked.
 */

import React, { useMemo } from 'react';
import type { Question } from '../../engine/education/types';
import { derivationSegments } from '../../engine/narration/derivationSegments';
import { NarrationRegion } from './NarrationRegion';

interface DerivationLike {
  id: string;
  title: string;
  assumptions: string[];
  steps: { id: string; title: string; math: string[]; why: string; check?: Question }[];
  summary: string[];
}

export const DerivationNarration: React.FC<{ d: DerivationLike; index: number; gated: boolean; children: React.ReactNode }> = ({ d, index, gated, children }) => {
  const segments = useMemo(() => derivationSegments({ title: d.title, assumptions: d.assumptions, steps: d.steps, index, gated, summary: d.summary }), [d, index, gated]);
  return <NarrationRegion enabled segments={segments} resetKey={`${d.id}:${index}:${gated}`}>{children}</NarrationRegion>;
};
