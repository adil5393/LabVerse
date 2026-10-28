import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion } from '../../../education/types';
import { DIVERSITY_CHAPTER as CH } from '../learn/content';
import { DIVERSITY_ASSESSMENT, DIVERSITY_PRACTICE } from '../learn/practice';
import {
  CLASSIFICATION_TIMELINE, ORGANISMS, PHYLA, RANKS, checkBinomial, classifyChordate, classifyInvertebrate, classifyKingdom, classifyPlant, isMoreSpecific,
  lowestSharedRank, organism,
} from '../model';

export const DIVERSITY_VISUAL_KINDS = ['microscope', 'kingdomKey', 'plantKey', 'animalPhyla', 'hierarchy', 'binomial', 'protists', 'fungusBody', 'simplePlants'];
describeChapterIntegrity('Diversity', CH, DIVERSITY_VISUAL_KINDS);

const inv = (o: Partial<Parameters<typeof classifyInvertebrate>[0]>) => classifyInvertebrate({ tissues: true, tentacles: false, flat: false, openings: 2, segmented: false, jointedLegs: false, softBodyFoot: false, spinySkin: false, ...o });

describe('Diversity model', () => {
  it('keys the case-study organisms of Revise, Reflect, Refine Q15 into Whittaker’s kingdoms', () => {
    expect(classifyKingdom({ cellular: true, nucleus: 'none', cells: 'uni', wall: 'other', nutrition: 'heterotrophic' }).kingdom).toBe('Monera');
    expect(classifyKingdom({ cellular: true, nucleus: 'true', cells: 'multi', wall: 'other', nutrition: 'heterotrophic' }).kingdom).toBe('Fungi');
    expect(classifyKingdom({ cellular: true, nucleus: 'true', cells: 'uni', wall: 'none', nutrition: 'both' }).kingdom).toBe('Protista');
    expect(classifyKingdom({ cellular: true, nucleus: 'true', cells: 'multi', wall: 'none', nutrition: 'heterotrophic' }).kingdom).toBe('Animalia');
    expect(classifyKingdom({ cellular: false, nucleus: 'none', cells: 'uni', wall: 'none', nutrition: 'heterotrophic' }).kingdom).toBeNull();
    expect(classifyKingdom({ cellular: true, nucleus: 'true', cells: 'uni', wall: 'chitin', nutrition: 'heterotrophic' }).kingdom).toBe('Fungi');
    expect(classifyKingdom({ cellular: true, nucleus: 'true', cells: 'multi', wall: 'cellulose', nutrition: 'autotrophic' }).kingdom).toBe('Plantae');
    expect(CLASSIFICATION_TIMELINE.map((t) => t.year)).toEqual(['4th century BCE', '1758', '1866', '1938', '1969']);
  });
  it('keys the five plant groups', () => {
    expect(classifyPlant({ body: 'thallus', vascular: false, seeds: false, fruits: false })).toBe('Thallophyta');
    expect(classifyPlant({ body: 'simple parts', vascular: false, seeds: false, fruits: false })).toBe('Bryophyta');
    expect(classifyPlant({ body: 'roots, stems and leaves', vascular: true, seeds: false, fruits: false })).toBe('Pteridophyta');
    expect(classifyPlant({ body: 'roots, stems and leaves', vascular: true, seeds: true, fruits: false })).toBe('Gymnosperm');
    expect(classifyPlant({ body: 'roots, stems and leaves', vascular: true, seeds: true, fruits: true })).toBe('Angiosperm');
  });
  it('keys the eight invertebrate phyla and the vertebrate groups', () => {
    expect(inv({ tissues: false })).toBe('Porifera');
    expect(inv({ tentacles: true, openings: 1 })).toBe('Cnidaria');
    expect(inv({ flat: true, openings: 1 })).toBe('Platyhelminthes');
    expect(inv({})).toBe('Nematoda');
    expect(inv({ segmented: true })).toBe('Annelida');
    expect(inv({ segmented: true, jointedLegs: true })).toBe('Arthropoda');
    expect(inv({ softBodyFoot: true })).toBe('Mollusca');
    expect(inv({ spinySkin: true })).toBe('Echinodermata');
    expect(Object.keys(PHYLA).length).toBe(8);
    expect(PHYLA.Echinodermata.skeleton).toBe('endoskeleton');
    expect(classifyChordate({ backbone: false, covering: 'hair' })).toBe('Protochordata');
    expect(classifyChordate({ backbone: true, covering: 'feathers' })).toBe('Birds');
  });
  it('the hierarchy (Fig. 12.17) and binomial rules', () => {
    expect(RANKS.length).toBe(7);
    expect(lowestSharedRank(organism('tiger')!, organism('lion')!)).toBe('genus');
    expect(lowestSharedRank(organism('tiger')!, organism('house cat')!)).toBe('family');
    expect(lowestSharedRank(organism('tiger')!, organism('dog')!)).toBe('order');
    expect(lowestSharedRank(organism('tiger')!, organism('human')!)).toBe('class');
    expect(lowestSharedRank(organism('pea')!, organism('mango')!)).toBe('class');
    expect(lowestSharedRank(organism('tiger')!, organism('pea')!)).toBeNull();
    for (const o of ORGANISMS) expect(checkBinomial(o.species).ok, o.species).toBe(true);
    expect(checkBinomial('panthera Tigris').problems.length).toBe(2);
    expect(checkBinomial('Panthera').ok).toBe(false);
    expect(checkBinomial('Homo Sapiens').ok).toBe(false);
    expect(isMoreSpecific('genus', 'class')).toBe(true);
  });
});

describe('Diversity practice and assessment', () => {
  const numeric = [...DIVERSITY_PRACTICE.groups.flatMap((g) => g.items.map((i) => i.question)), ...DIVERSITY_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.question))]
    .filter((q): q is NumericQuestion => q.kind === 'numeric');
  it('numeric answers agree with the model', () => {
    for (const q of numeric) expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, q.id).toBe(true);
    const byId = Object.fromEntries(numeric.map((q) => [q.id, q.answer]));
    expect(byId['bda-6q']).toBe(RANKS.indexOf(lowestSharedRank(organism('tiger')!, organism('lion')!)!) + 1);
    expect(byId['bdx-9q']).toBe(24000 * 0.5);
  });
  it('has at least 12 practice items and a 10-item assessment', () => {
    expect(DIVERSITY_PRACTICE.groups.flatMap((g) => g.items).length).toBeGreaterThanOrEqual(12);
    expect(DIVERSITY_ASSESSMENT.sections.flatMap((s) => s.items).length).toBe(10);
  });
});
