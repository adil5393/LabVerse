import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { ATOM_CHAPTER as CH } from '../learn/content';
import {
  ELEMENTS, MORE_SYMBOLS, averageAtomicMass, configuration, elementByZ, hasStableShell, isWellFormedSymbol, massNumber, netCharge, neutronsFrom,
  relation, scatterCounts, shellCapacity, simpleAverage, summarize, valenceElectrons, valencyOf,
} from '../model';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion, Question } from '../../../education/types';

export const ATOM_VISUAL_KINDS = ['atomModel', 'atomBuilder', 'goldFoil', 'isotopeMix'];
describeChapterIntegrity('Atom', CH, ATOM_VISUAL_KINDS);

/** The chapter's Table 8.4 configurations for Z = 1 to 18, written out independently of the model. */
const TABLE_8_4: Record<number, number[]> = {
  1: [1], 2: [2], 3: [2, 1], 4: [2, 2], 5: [2, 3], 6: [2, 4], 7: [2, 5], 8: [2, 6], 9: [2, 7], 10: [2, 8],
  11: [2, 8, 1], 12: [2, 8, 2], 13: [2, 8, 3], 14: [2, 8, 4], 15: [2, 8, 5], 16: [2, 8, 6], 17: [2, 8, 7], 18: [2, 8, 8],
};
const VALENCY: Record<number, number> = { 1: 1, 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 3, 8: 2, 9: 1, 10: 0, 11: 1, 12: 2, 13: 3, 14: 4, 15: 3, 16: 2, 17: 1, 18: 0, 19: 1, 20: 2 };

describe('Atom model', () => {
  it('matches Table 8.4 for the first eighteen elements, and K and Ca start the N shell', () => {
    for (const [z, shells] of Object.entries(TABLE_8_4)) expect(configuration(Number(z)), `Z=${z}`).toEqual(shells);
    expect(configuration(19)).toEqual([2, 8, 8, 1]);
    expect(configuration(20)).toEqual([2, 8, 8, 2]);
  });
  it('the 2n² rule and the element data', () => {
    expect([1, 2, 3, 4].map(shellCapacity)).toEqual([2, 8, 18, 32]);
    expect(ELEMENTS.length).toBe(20);
    for (const e of ELEMENTS) { expect(isWellFormedSymbol(e.symbol), e.symbol).toBe(true); expect(elementByZ(e.z)).toBe(e); }
    for (const s of MORE_SYMBOLS) expect(isWellFormedSymbol(s.symbol), s.symbol).toBe(true);
    expect(isWellFormedSymbol('CO')).toBe(false);
    expect(massNumber(elementByZ(3)!.z, elementByZ(3)!.neutrons)).toBe(7);
    expect(massNumber(18, elementByZ(18)!.neutrons)).toBe(40);
  });
  it('valency follows the chapter’s rule for Z = 1 to 20', () => {
    for (const [z, val] of Object.entries(VALENCY)) expect(valencyOf(configuration(Number(z))).value, `Z=${z}`).toBe(val);
    expect(valencyOf(configuration(6)).way).toBe('share');
    expect(valencyOf(configuration(8)).way).toBe('gain');
    expect(valencyOf(configuration(11)).way).toBe('lose');
    expect(hasStableShell([2])).toBe(true);
    expect(valenceElectrons([2, 8, 7])).toBe(7);
  });
  it('summarises particles into an element, a mass number and a charge', () => {
    const li = summarize(3, 4, 3);
    expect(li.element?.symbol).toBe('Li'); expect(li.massNumber).toBe(7); expect(li.kind).toBe('atom');
    expect(summarize(11, 12, 10).kind).toBe('positive ion');
    expect(summarize(17, 18, 18).kind).toBe('negative ion');
    expect(netCharge(7, 9)).toBe(-2);
    expect(neutronsFrom(238, 92)).toBe(146);
  });
  it('isotopes, isobars and the weighted average', () => {
    expect(relation({ z: 17, a: 35 }, { z: 17, a: 37 })).toBe('isotopes');
    expect(relation({ z: 18, a: 40 }, { z: 20, a: 40 })).toBe('isobars');
    expect(relation({ z: 6, a: 12 }, { z: 6, a: 12 })).toBe('same');
    expect(relation({ z: 6, a: 12 }, { z: 7, a: 14 })).toBe('unrelated');
    expect(averageAtomicMass([{ mass: 35, percent: 75 }, { mass: 37, percent: 25 }])).toBeCloseTo(35.5, 12);
    expect(simpleAverage([35, 37])).toBe(36);
    expect(averageAtomicMass([{ mass: 79, percent: 49.7 }, { mass: 81, percent: 50.3 }])).toBeCloseTo(80.006, 9);
  });
  it('the scattering sketch shows the book’s pattern, and Thomson’s model predicts no large deflections', () => {
    const r = scatterCounts('rutherford');
    expect(r.straight / r.total).toBeGreaterThan(0.85);
    expect(r.large + r.back).toBeGreaterThan(0);
    expect(r.back).toBeGreaterThan(0);
    expect(r.back).toBeLessThan(r.large);
    const t = scatterCounts('thomson');
    expect(t.large + t.back).toBe(0);
    const thick = scatterCounts('rutherford', 100000, 4);
    expect(thick.straight).toBeLessThan(r.straight);
  });
});

const numAnswer = (lessonId: string, id: string) => {
  const l = CH.lessons[lessonId];
  const all: Question[] = [...l.independent.map((i) => i.question), ...l.guided.steps.map((g) => g.question)];
  const q = all.find((x) => x.id === id);
  if (!q || q.kind !== 'numeric') throw new Error(`no numeric ${id}`);
  return (q as NumericQuestion).answer;
};

describe('Atom lessons, practice and assessment: numeric answers equal the model', () => {
  it('lessons', () => {
    expect(numAnswer('ca-l2', 'ca-g2-2')).toBe(Math.round(1e-10 / 1e-15));
    expect(numAnswer('ca-l4', 'ca-g4-1')).toBe(neutronsFrom(41, 20));
    expect(numAnswer('ca-l4', 'ca-l4-i2')).toBe(massNumber(17, 18));
    expect(numAnswer('ca-l4', 'ca-l4-i3')).toBe(neutronsFrom(70, 31));
    expect(numAnswer('ca-l5', 'ca-g5-2')).toBe(neutronsFrom(23, 11));
    expect(numAnswer('ca-l5', 'ca-l5-i3')).toBe(neutronsFrom(40, 20));
    expect(numAnswer('ca-l6', 'ca-g6-1')).toBe(configuration(13)[2]);
    expect(numAnswer('ca-l6', 'ca-g6-2')).toBe(shellCapacity(3));
    expect(numAnswer('ca-l6', 'ca-l6-i3')).toBe(valenceElectrons(configuration(14)));
    expect(numAnswer('ca-l7', 'ca-g7-1')).toBe(valenceElectrons(configuration(9)));
    expect(numAnswer('ca-l7', 'ca-g7-2')).toBe(valencyOf(configuration(9)).value);
    expect(numAnswer('ca-l7', 'ca-l7-i1')).toBe(valencyOf(configuration(3)).value);
    expect(numAnswer('ca-l7', 'ca-l7-i2')).toBe(valencyOf(configuration(7)).value);
    expect(numAnswer('ca-l7', 'ca-l7-i3')).toBe(valencyOf(configuration(18)).value);
    expect(numAnswer('ca-l8', 'ca-l8-i1')).toBeCloseTo(averageAtomicMass([{ mass: 20, percent: 90 }, { mass: 22, percent: 10 }]), 9);
  });
  it('practice and assessment', () => {
    const items = [...CH.practice!.groups.flatMap((g) => g.items), ...CH.assessment!.sections.flatMap((s) => s.items)];
    const a = (id: string) => (items.find((i) => i.id === id)!.question as NumericQuestion).answer;
    expect(a('ap-4')).toBe(netCharge(7, 9));
    expect(a('ap-5')).toBe(neutronsFrom(56, 26));
    expect(a('ap-11')).toBe(valencyOf(configuration(15)).value);
    expect(a('ap-12')).toBe(valenceElectrons(configuration(35 - 18)));
    expect(a('ap-13')).toBe(shellCapacity(4));
    expect(a('ap-14')).toBeCloseTo(averageAtomicMass([{ mass: 79, percent: 49.7 }, { mass: 81, percent: 50.3 }]), 1);
    expect(a('ta-4')).toBe(neutronsFrom(197, 79));
    expect(a('ta-6')).toBe(valencyOf(configuration(13)).value);
    expect(a('ta-7')).toBeCloseTo(averageAtomicMass([{ mass: 35, percent: 75 }, { mass: 37, percent: 25 }]), 12);
    for (const it of items) {
      const q = it.question;
      const input = q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : null;
      expect(evaluateAnswer(q, input!).correct, it.id).toBe(true);
    }
  });
});
