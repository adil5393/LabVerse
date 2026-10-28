import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { FOUNDATIONS_CHAPTER as CH } from '../learn/content';
import {
  ANIONS, CATIONS, IONS, SAMPLES, balanceReading, bondBetween, covalentFormula, covalentName, formulaMass, ionById, ionicFormula, ionicName,
  massConserved, parseFormula, partnerMass, pretty, productFrom, sameRatio,
} from '../model';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion, Question } from '../../../education/types';

export const FOUND_VISUAL_KINDS = ['massBalance', 'bondBuilder', 'formulaBuilder', 'formulaMass', 'propertiesTest'];
describeChapterIntegrity('Atomic foundations', CH, FOUND_VISUAL_KINDS);

describe('Foundations model', () => {
  it('reproduces the book’s worked examples for the two laws', () => {
    expect(massConserved([4.0, 2.92], [1.76, 0.72, 4.44])).toBe(true);
    expect(productFrom(2.4, 12, 44)).toBeCloseTo(8.8, 12);
    expect(partnerMass(46, 23, 35.5)).toBe(71);
    expect(sameRatio(4, 1, 8, 2)).toBe(true);
    expect(sameRatio(4, 1, 8, 3)).toBe(false);
    expect(balanceReading(120, 1.5, false)).toBe(118.5);
    expect(balanceReading(120, 1.5, true)).toBe(120);
  });
  it('writes the book’s formulae by criss-crossing', () => {
    const f = (c: string, a: string) => ionicFormula(ionById(c), ionById(a)).formula;
    expect(f('ca', 'cl')).toBe('CaCl2');
    expect(f('al', 'o')).toBe('Al2O3');
    expect(f('mg', 'o')).toBe('MgO');
    expect(f('mg', 'oh')).toBe('Mg(OH)2');
    expect(f('ca', 'co3')).toBe('CaCO3');
    expect(f('al', 'oh')).toBe('Al(OH)3');
    expect(f('al', 'so4')).toBe('Al2(SO4)3');
    expect(f('fe3', 'oh')).toBe('Fe(OH)3');
    expect(f('k', 'co3')).toBe('K2CO3');
    expect(f('nh4', 'so4')).toBe('(NH4)2SO4');
    expect(f('cu1', 'o')).toBe('Cu2O');
    expect(f('na', 'hco3')).toBe('NaHCO3');
    expect(covalentFormula('H', 1, 'Cl', 1).formula).toBe('HCl');
    expect(covalentFormula('H', 1, 'S', 2).formula).toBe('H2S');
    expect(covalentFormula('C', 4, 'Cl', 1).formula).toBe('CCl4');
    for (const c of CATIONS) for (const a of ANIONS) {
      const r = ionicFormula(c, a);
      expect(r.reduced[0] * c.charge + r.reduced[1] * a.charge, `${c.id}+${a.id}`).toBe(0);
    }
  });
  it('names compounds', () => {
    expect(covalentName('C', 1, 'O', 1)).toBe('carbon monoxide');
    expect(covalentName('C', 1, 'O', 2)).toBe('carbon dioxide');
    expect(covalentName('C', 1, 'S', 2)).toBe('carbon disulfide');
    expect(covalentName('P', 1, 'Cl', 3)).toBe('phosphorus trichloride');
    expect(covalentName('S', 1, 'F', 6)).toBe('sulfur hexafluoride');
    expect(covalentName('N', 2, 'O', 4)).toBe('dinitrogen tetroxide');
    expect(covalentName('N', 2, 'O', 5)).toBe('dinitrogen pentoxide');
    expect(covalentName('H', 2, 'S', 1)).toBe('hydrogen sulfide');
    expect(covalentName('H', 2, 'O', 1)).toBe('water');
    expect(covalentName('N', 1, 'H', 3)).toBe('ammonia');
    expect(ionicName(ionById('fe3'), ionById('cl'))).toBe('Ferric chloride');
    expect(ionicName(ionById('na'), ionById('cl'))).toBe('Sodium chloride');
    expect(IONS.length).toBe(25);
  });
  it('parses formulae and adds atomic masses (book Examples 9.4 to 9.7)', () => {
    expect(parseFormula('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 });
    expect(parseFormula('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 });
    expect(formulaMass('H2O')).toBe(18);
    expect(formulaMass('CO2')).toBe(44);
    expect(formulaMass('Na2O')).toBe(62);
    expect(formulaMass('Ca(NO3)2')).toBe(164);
    expect(formulaMass('KCl')).toBe(74.5);
    expect(formulaMass('Mg(OH)2')).toBe(58);
    expect(() => parseFormula('Ca(NO3')).toThrow();
    expect(pretty('Al2(SO4)3')).toBe('Al₂(SO₄)₃');
  });
  it('decides bond types for pairs of the first twenty elements', () => {
    expect(bondBetween('H', 'H')).toMatchObject({ kind: 'covalent', formula: 'H2', bondOrder: 1 });
    expect(bondBetween('O', 'O')).toMatchObject({ kind: 'covalent', bondOrder: 2 });
    expect(bondBetween('N', 'N')).toMatchObject({ kind: 'covalent', bondOrder: 3 });
    expect(bondBetween('Na', 'Cl')).toMatchObject({ kind: 'ionic', formula: 'NaCl' });
    expect(bondBetween('Cl', 'Mg')).toMatchObject({ kind: 'ionic', formula: 'MgCl2' });
    expect(bondBetween('Al', 'O').formula).toBe('Al2O3');
    expect(bondBetween('H', 'O').formula).toBe('H2O');
    expect(bondBetween('N', 'H').formula).toBe('NH3');
    expect(bondBetween('H', 'C').formula).toBe('CH4');
    expect(bondBetween('C', 'O').formula).toBe('CO2');
    expect(bondBetween('Ne', 'Cl').kind).toBe('none');
    expect(bondBetween('Na', 'Mg').kind).toBe('none');
  });
  it('the property samples follow the chapter: only ionic compounds conduct in water', () => {
    for (const s of SAMPLES) expect(s.conductsInWater, s.id).toBe(s.kind === 'ionic');
  });
});

const numAnswer = (lessonId: string, id: string) => {
  const l = CH.lessons[lessonId];
  const all: Question[] = [...l.independent.map((i) => i.question), ...l.guided.steps.map((g) => g.question)];
  const q = all.find((x) => x.id === id);
  if (!q || q.kind !== 'numeric') throw new Error(`no numeric ${id}`);
  return (q as NumericQuestion).answer;
};

describe('Foundations lessons, practice and assessment: numeric answers equal the model', () => {
  it('lessons', () => {
    expect(numAnswer('cf-l1', 'cf-g1-2')).toBeCloseTo(productFrom(2.4, 12, 44), 12);
    expect(numAnswer('cf-l2', 'cf-l2-i1')).toBe(partnerMass(11.5, 23, 35.5));
    expect(numAnswer('cf-l2', 'cf-g2-1')).toBe(partnerMass(12, 3, 2));
    expect(numAnswer('cf-l6', 'cf-g6-1')).toBe(ionicFormula(ionById('fe3'), ionById('oh')).reduced[1]);
    expect(numAnswer('cf-l8', 'cf-g8-1')).toBe(formulaMass('KCl'));
    expect(numAnswer('cf-l8', 'cf-l8-i1')).toBe(formulaMass('NH3'));
    expect(numAnswer('cf-l8', 'cf-l8-i2')).toBe(formulaMass('CaCO3'));
    expect(numAnswer('cf-l8', 'cf-l8-i3')).toBe(formulaMass('Al2(SO4)3'));
    expect(numAnswer('cf-l8', 'cf-l8-i4')).toBe(formulaMass('H2SO4'));
  });
  it('practice and assessment', () => {
    const items = [...CH.practice!.groups.flatMap((g) => g.items), ...CH.assessment!.sections.flatMap((s) => s.items)];
    const a = (id: string) => (items.find((i) => i.id === id)!.question as NumericQuestion).answer;
    expect(a('fp-1')).toBeCloseTo(6.0 + 7.3 - 0.2, 9);
    expect(a('fp-2')).toBe(partnerMass(20, 4, 3));
    expect(a('fp-13')).toBe(formulaMass('HNO3'));
    expect(a('fp-14')).toBe(formulaMass('Ca(NO3)2'));
    expect(a('fp-15')).toBe(formulaMass('Mg(OH)2'));
    expect(a('fp-16')).toBe(formulaMass('C6H12O6'));
    expect(a('fa9-4')).toBe(productFrom(6, 12, 44));
    expect(a('fa9-6')).toBe(formulaMass('Na2O'));
    expect(a('fa9-10')).toBe(formulaMass(ionicFormula(ionById('ca'), ionById('oh')).formula));
    for (const it of items) {
      const q = it.question;
      const input = q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : null;
      expect(evaluateAnswer(q, input!).correct, it.id).toBe(true);
    }
  });
});
