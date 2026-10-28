import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { MIXTURES_CHAPTER as CH } from '../learn/content';
import {
  BOILING_POINTS, MIXTURE_CASES, SALTS, SAMPLE_MIXTURES, caseById, chooseMethod, componentMass, crystalYield, describeBeam, massByMass, massByVolume,
  mixtureTypeFromSize, propertiesOf, saltById, saturatedMass, solubilityAt, solutionState, spotDistance, suitableConcentration, volumeByVolume,
} from '../model';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion, Question } from '../../../education/types';

export const MIX_VISUAL_KINDS = ['mixBeam', 'mixConcentration', 'mixSolubility', 'mixSeparation', 'mixChromatography'];
describeChapterIntegrity('Mixtures', CH, MIX_VISUAL_KINDS);

const kno3 = saltById('kno3'), nacl = saltById('nacl'), kcl = saltById('kcl'), nh4cl = saltById('nh4cl');

describe('Mixtures model', () => {
  it('reproduces the book’s worked examples (Eqs 5.1 to 5.3)', () => {
    expect(massByMass(10, 90)).toBe(10);
    expect(massByVolume(5, 100)).toBe(5);
    expect(volumeByVolume(1, 100)).toBe(1);
    expect(componentMass(4, 300)).toBe(12);
  });
  it('chooses the suitable concentration', () => {
    expect(suitableConcentration('liquid', 'volume')).toBe('v/v');
    expect(suitableConcentration('solid', 'volume')).toBe('m/v');
    expect(suitableConcentration('solid', 'mass')).toBe('m/m');
  });
  it('reads the solubility table exactly at its temperatures and interpolates between them', () => {
    expect(solubilityAt(kno3, 40)).toBe(62);
    expect(solubilityAt(nacl, 80)).toBe(37);
    expect(solubilityAt(kcl, 25)).toBeCloseTo(36.2, 9);
    expect(solubilityAt(kno3, 5)).toBe(21);
    expect(saturatedMass(kno3, 40, 50)).toBe(31);
    for (const s of SALTS) for (let i = 1; i < s.g100.length; i++) expect(s.g100[i], s.id).toBeGreaterThanOrEqual(s.g100[i - 1]);
  });
  it('calculates crystal yields and saturation states', () => {
    expect(crystalYield(kno3, 60, 20, 100)).toBe(74);
    expect(crystalYield(kcl, 80, 20, 200)).toBe(38);
    expect(crystalYield(kno3, 20, 60, 100)).toBe(0);
    expect(solutionState(kcl, 40, 50, 25)).toBe('excess');
    expect(solutionState(kcl, 40, 50, 20)).toBe('saturated');
    expect(solutionState(kcl, 40, 50, 10)).toBe('unsaturated');
  });
  it('sorts particle sizes into the book’s three bands and fills Table 5.1', () => {
    expect(mixtureTypeFromSize(0.5)).toBe('solution');
    expect(mixtureTypeFromSize(1)).toBe('colloid');
    expect(mixtureTypeFromSize(1000)).toBe('colloid');
    expect(mixtureTypeFromSize(1001)).toBe('suspension');
    expect(propertiesOf('solution').tyndall).toBe(false);
    expect(propertiesOf('colloid')).toMatchObject({ tyndall: true, settles: false, filterable: false, nature: 'heterogeneous' });
    expect(propertiesOf('suspension')).toMatchObject({ tyndall: true, settles: true, filterable: true, visible: true });
    for (const m of SAMPLE_MIXTURES) { expect(mixtureTypeFromSize(m.diameterNm), m.id).toBe(m.type); expect(describeBeam(m).length).toBeGreaterThan(30); }
  });
  it('chooses separation methods from properties, matching the book', () => {
    const m = (id: string) => chooseMethod(caseById(id)).method;
    expect(m('acetone-water')).toBe('distillation');
    expect(m('alcohol-benzene')).toBe('fractional-distillation');
    expect(m('oil-water')).toBe('separating-funnel');
    expect(m('salt-from-water')).toBe('evaporation');
    expect(m('water-from-salt')).toBe('distillation');
    expect(m('copper-sulfate')).toBe('crystallization');
    expect(m('blood')).toBe('centrifugation');
    expect(m('muddy-water')).toBe('coagulation');
    expect(m('camphor-sand')).toBe('sublimation');
    expect(m('chalk-salt')).toBe('dissolve-filter-evaporate');
    expect(m('ink')).toBe('chromatography');
    expect(m('brass')).toBe('none');
    expect(chooseMethod({ id: 'x', name: 'x', kind: 'two-miscible-liquids', boilingPoints: [BOILING_POINTS.alcohol, BOILING_POINTS.water] }).method).toBe('fractional-distillation');
    expect(chooseMethod({ id: 'y', name: 'y', kind: 'two-miscible-liquids', boilingPoints: [60, 90] }).method).toBe('distillation');
    for (const c of MIXTURE_CASES) expect(chooseMethod(c).reason.length, c.id).toBeGreaterThan(20);
  });
  it('moves chromatography spots in proportion to the solvent front', () => {
    expect(spotDistance(0.5, 6)).toBe(3);
  });
});

const numAnswer = (lessonId: string, id: string) => {
  const l = CH.lessons[lessonId];
  const all: Question[] = [...l.independent.map((i) => i.question), ...l.guided.steps.map((g) => g.question)];
  const q = all.find((x) => x.id === id);
  if (!q || q.kind !== 'numeric') throw new Error(`no numeric ${id}`);
  return (q as NumericQuestion).answer;
};

describe('Mixtures lessons, practice and assessment: numeric answers equal the model', () => {
  it('lessons', () => {
    expect(numAnswer('cm-l2', 'cm-g2-1')).toBe(componentMass(70, 120));
    expect(numAnswer('cm-l2', 'cm-g2-2')).toBe(120 - componentMass(70, 120));
    expect(numAnswer('cm-l2', 'cm-l2-i1')).toBe(massByMass(25, 225));
    expect(numAnswer('cm-l2', 'cm-l2-i2')).toBe(massByVolume(12.5, 250));
    expect(numAnswer('cm-l2', 'cm-l2-i3')).toBe(volumeByVolume(30, 150));
    expect(numAnswer('cm-l2', 'cm-l2-i4')).toBe(componentMass(5, 400));
    expect(numAnswer('cm-l3', 'cm-g3-1')).toBe(saturatedMass(kno3, 40, 50));
    expect(numAnswer('cm-l3', 'cm-l3-i2')).toBeCloseTo(saturatedMass(nacl, 40, 300), 9);
    expect(numAnswer('cm-l4', 'cm-g4-1')).toBe(crystalYield(nh4cl, 80, 20, 100));
    expect(numAnswer('cm-l4', 'cm-l4-i1')).toBe(crystalYield(kno3, 80, 60, 100));
    expect(numAnswer('cm-l5', 'cm-g5-1')).toBe(BOILING_POINTS.chloroform - BOILING_POINTS.acetone);
    expect(numAnswer('cm-l7', 'cm-l7-i3')).toBe(componentMass(20, 250));
  });
  it('practice and assessment', () => {
    const items = [...CH.practice!.groups.flatMap((g) => g.items), ...CH.assessment!.sections.flatMap((s) => s.items)];
    const a = (id: string) => (items.find((i) => i.id === id)!.question as NumericQuestion).answer;
    expect(a('mp-2')).toBeCloseTo(massByMass(30, 80), 1);
    expect(a('mp-3')).toBe(massByMass(75, 425));
    expect(a('mp-5')).toBeCloseTo(componentMass(0.9, 2000), 9);
    expect(a('mp-8')).toBe(crystalYield(kno3, 60, 30, 100));
    expect(a('xa-4')).toBe(massByMass(18, 162));
    expect(a('xa-5')).toBe(componentMass(1, 5000));
    expect(a('xa-6')).toBe(crystalYield(nh4cl, 60, 20, 200));
    for (const it of items) {
      const q = it.question;
      const input = q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : null;
      expect(input, it.id).not.toBeNull();
      expect(evaluateAnswer(q, input!).correct, it.id).toBe(true);
    }
  });
});
