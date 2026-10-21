/**
 * Narration for the step-by-step derivation views (Chapters 4, 6 and 7 share one shape: title, assumptions, steps with math and
 * a reason, an optional gating question, and a revision summary). It narrates what the student can currently see:
 *  - a step guarded by a question is announced with its question only; its mathematics is not read until it has been unlocked;
 *  - the "numerical check for this case" line and the figure readouts are never read, because they change as the student
 *    moves the sliders and would otherwise talk continuously.
 */

import type { Question } from '../education/types';
import type { NarrationSegment } from './controller';
import { questionSegments } from './segments';

export interface DerivationNarrationInput {
  title: string;
  assumptions: string[];
  steps: { title: string; math: string[]; why: string; check?: Question }[];
  index: number;
  gated: boolean;
  summary: string[];
}

export const dnid = {
  title: 'deriv:title',
  assume: (i: number) => `deriv:assume${i}`,
  stepTitle: 'deriv:step-title',
  gate: 'deriv:gate',
  math: (i: number) => `deriv:math${i}`,
  why: 'deriv:why',
  summary: (i: number) => `deriv:sum${i}`,
};

export function derivationSegments(d: DerivationNarrationInput): NarrationSegment[] {
  const step = d.steps[d.index];
  const out: NarrationSegment[] = [{ id: dnid.title, text: d.title }];
  d.assumptions.forEach((a, i) => out.push({ id: dnid.assume(i), text: i === 0 ? `Assumptions. ${a}` : a }));
  if (!step) return out;
  out.push({ id: dnid.stepTitle, text: `Step ${d.index + 1} of ${d.steps.length}. ${step.title}` });
  if (d.gated && step.check) {
    out.push({ id: dnid.gate, text: 'Supply the missing reasoning first. The mathematics of this step appears after your answer.' });
    out.push(...questionSegments('deriv:check', step.check));
    return out;
  }
  step.math.forEach((l, i) => out.push({ id: dnid.math(i), text: l }));
  out.push({ id: dnid.why, text: `Why this is valid: ${step.why}` });
  if (d.index === d.steps.length - 1) d.summary.forEach((l, i) => out.push({ id: dnid.summary(i), text: i === 0 ? `Derivation in brief. ${l}` : l }));
  return out;
}
