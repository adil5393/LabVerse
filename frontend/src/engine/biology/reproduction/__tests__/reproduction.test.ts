import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion } from '../../../education/types';
import { REPRODUCTION_CHAPTER as CH } from '../learn/content';
import { REPRO_ASSESSMENT, REPRO_PRACTICE } from '../learn/practice';
import {
  AFTER_FERTILISATION, HUMAN_PAIRS, PEA_TREATMENTS, POLLEN_STRATEGIES, addDays, allCombinations, babySex, cyclePhase, drawGamete, forecastCycle, formsFruit,
  gameteCombinations, haploid, likelyAgent, pollenPerSeed, pollinationKind, stageName, survivors, trimester, utcDate,
} from '../model';

export const REPRO_VISUAL_KINDS = ['microscope', 'beadCombos', 'flowerParts', 'pollinationTest', 'pollinationStrategy', 'cycleCalendar'];
describeChapterIntegrity('Reproduction', CH, REPRO_VISUAL_KINDS);

const day = (d: Date) => d.toISOString().slice(0, 10);

describe('Reproduction model', () => {
  it('meiosis halves and combinations double for each pair (Activity 11.4)', () => {
    expect(gameteCombinations(3)).toBe(8);
    expect(gameteCombinations(HUMAN_PAIRS)).toBe(8388608);
    expect(haploid(46)).toBe(23);
    const pairs = [{ light: 'lg', dark: 'dg' }, { light: 'lb', dark: 'db' }, { light: 'lr', dark: 'dr' }];
    const all = allCombinations(pairs);
    expect(all.length).toBe(8);
    expect(new Set(all.map((c) => c.join())).size).toBe(8);
    expect(drawGamete(pairs, () => 0.1)).toEqual(['lg', 'lb', 'lr']);
    expect(drawGamete(pairs, () => 0.9)).toEqual(['dg', 'db', 'dr']);
  });
  it('the pea experiment: only the bagged bud without stamens forms no fruit (Table 11.2)', () => {
    const result = Object.fromEntries(PEA_TREATMENTS.map((t) => [t.id, formsFruit(t)]));
    expect(result).toEqual({ 'bud-bag': true, 'bud-cut-bag': false, 'flower-cut-bag': true, 'flower-bag': true, 'flower-open': true });
    expect(formsFruit({ stage: 'bud', stamensRemoved: true, bagged: false })).toBe(true);
  });
  it('pollinators, pollination kinds and what follows fertilisation', () => {
    expect(likelyAgent({ showy: false, nectarOrScent: false, pollen: 'light', stigma: 'feathery', aquatic: false })).toBe('wind');
    expect(likelyAgent({ showy: true, nectarOrScent: true, pollen: 'sticky', stigma: 'sticky', aquatic: false })).toBe('insect');
    expect(likelyAgent({ showy: true, nectarOrScent: false, pollen: 'sticky', stigma: 'sticky', aquatic: false })).toBe('bird');
    expect(likelyAgent({ showy: false, nectarOrScent: false, pollen: 'light', stigma: 'feathery', aquatic: true })).toBe('water');
    expect(pollinationKind(true)).toBe('self');
    expect(pollinationKind(false)).toBe('cross');
    expect(AFTER_FERTILISATION).toEqual({ ovary: 'fruit', ovule: 'seed', zygote: 'embryo' });
  });
  it('Table 11.3 ratios: wind needs about 6000 grains per seed, insects about 33', () => {
    expect(pollenPerSeed(POLLEN_STRATEGIES.wind)).toBe(6000);
    expect(pollenPerSeed(POLLEN_STRATEGIES.insect)).toBeCloseTo(33.33, 1);
    expect(survivors(20000, 1 / 1000)).toBe(20);
  });
  it('the cycle calendar reproduces Pause and Ponder 7 (5 March + 28 days = 2 April)', () => {
    const f = forecastCycle(utcDate(2026, 3, 5), 28);
    expect(day(f.nextPeriod)).toBe('2026-04-02');
    expect(day(f.ovulation)).toBe('2026-03-19');
    expect(day(forecastCycle(utcDate(2026, 6, 10), 30).nextPeriod)).toBe('2026-07-10');
    expect(day(addDays(utcDate(2026, 1, 3), 28))).toBe('2026-01-31');
    expect([1, 5, 6, 14, 15, 28].map(cyclePhase)).toEqual(['menstruation', 'menstruation', 'lining rebuilds', 'ovulation', 'lining thickens', 'lining thickens']);
  });
  it('sex determination and pregnancy stages', () => {
    expect(babySex('X')).toBe('female (XX)');
    expect(babySex('Y')).toBe('male (XY)');
    expect(stageName(8)).toBe('embryo');
    expect(stageName(9)).toBe('foetus');
    expect([4, 20, 35].map(trimester)).toEqual([1, 2, 3]);
  });
});

describe('Reproduction practice and assessment', () => {
  const numeric = [...REPRO_PRACTICE.groups.flatMap((g) => g.items.map((i) => i.question)), ...REPRO_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.question))]
    .filter((q): q is NumericQuestion => q.kind === 'numeric');
  it('numeric answers agree with the model', () => {
    for (const q of numeric) expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, q.id).toBe(true);
    const byId = Object.fromEntries(numeric.map((q) => [q.id, q.answer]));
    expect(byId['brx-3q']).toBe(gameteCombinations(10));
    expect(byId['brx-4q']).toBe(haploid(24));
    expect(byId['brx-7q']).toBe(24000 / 800);
    expect(byId['brx-11q']).toBe(forecastCycle(utcDate(2026, 6, 10), 30).nextPeriod.getUTCDate());
    expect(byId['bra-4q']).toBe(gameteCombinations(5));
    expect(byId['bra-7q']).toBe(forecastCycle(utcDate(2026, 1, 3), 28).nextPeriod.getUTCDate());
  });
  it('has at least 12 practice items and a 10-item assessment', () => {
    expect(REPRO_PRACTICE.groups.flatMap((g) => g.items).length).toBeGreaterThanOrEqual(12);
    expect(REPRO_ASSESSMENT.sections.flatMap((s) => s.items).length).toBe(10);
  });
});
