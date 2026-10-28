import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion } from '../../../education/types';
import { TISSUES_CHAPTER as CH } from '../learn/content';
import { TISSUES_ASSESSMENT, TISSUES_PRACTICE } from '../learn/practice';
import {
  BODY_JOINT, CONNECTIVE, EPITHELIA, MUSCLES, PLANT_TISSUES, TEAK_DATA, canMove, connectorFor, growthRate, identifyMuscle, isComplex, meristemFor,
  partMass, plantTissue, ringsForAge, rootLength,
} from '../model';

export const TISSUE_VISUAL_KINDS = ['rootGrowth', 'treeRings', 'plantTissues', 'animalTissues', 'joints'];
describeChapterIntegrity('Tissues', CH, TISSUE_VISUAL_KINDS);

describe('Tissues model', () => {
  it('roots keep growing with their tips and stop when the tips are cut (Activity 3.1)', () => {
    expect(rootLength(1, null)).toBeCloseTo(0.5, 12);
    expect(rootLength(7, null)).toBeCloseTo(5.9, 12);
    expect(rootLength(2, 3)).toBeCloseTo(rootLength(2, null), 12);
    expect(rootLength(3, 3)).toBeCloseTo(rootLength(3, null) - 1, 12);
    expect(rootLength(7, 3)).toBe(rootLength(4, 3));
    expect(rootLength(7, 3)).toBeLessThan(rootLength(7, null));
  });
  it('meristems, simple and complex tissues', () => {
    expect(meristemFor('length')).toBe('apical');
    expect(meristemFor('girth')).toBe('lateral');
    expect(meristemFor('regrowth')).toBe('intercalary');
    expect(PLANT_TISSUES.filter(isComplex).map((t) => t.id).sort()).toEqual(['phloem', 'xylem']);
    expect(plantTissue('sclerenchyma').living).toBe('mostly dead');
    expect(plantTissue('collenchyma').wall).toContain('pectin');
    expect(plantTissue('sclerenchyma').wall).toContain('lignin');
  });
  it('animal tissue tables, connectors and muscle identification', () => {
    expect(EPITHELIA.length).toBe(5);
    expect(CONNECTIVE.map((c) => c.id)).toEqual(['blood', 'bone', 'cartilage', 'tendon', 'ligament']);
    expect(connectorFor('muscle', 'bone')).toBe('tendon');
    expect(connectorFor('bone', 'bone')).toBe('ligament');
    for (const m of Object.values(MUSCLES)) expect(identifyMuscle(m), m.id).toBe(m.id);
    expect(MUSCLES.skeletal.control).toBe('voluntary');
  });
  it('joints allow only their own movements (Table 3.5)', () => {
    expect(canMove('ball-socket', 'circle')).toBe(true);
    expect(canMove('hinge', 'circle')).toBe(false);
    expect(canMove('hinge', 'bend')).toBe(true);
    expect(canMove('pivot', 'turn')).toBe(true);
    expect(canMove('fixed', 'bend')).toBe(false);
    expect(BODY_JOINT.elbow).toBe('hinge');
    expect(BODY_JOINT.shoulder).toBe('ball-socket');
  });
  it('tree rings and body composition', () => {
    for (const r of TEAK_DATA) expect(ringsForAge(r.age)).toBe(r.rings);
    expect(growthRate(TEAK_DATA[1], TEAK_DATA[2])).toBeCloseTo(1.6, 12);
    expect(growthRate(TEAK_DATA[4], TEAK_DATA[5])).toBeCloseTo(0.8, 12);
    expect(partMass(50, 12)).toBe(6);
    expect(partMass(45, 14)).toBeCloseTo(6.3, 12);
  });
});

describe('Tissues practice and assessment', () => {
  const numeric = [...TISSUES_PRACTICE.groups.flatMap((g) => g.items.map((i) => i.question)), ...TISSUES_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.question))]
    .filter((q): q is NumericQuestion => q.kind === 'numeric');
  it('numeric answers agree with the model', () => {
    for (const q of numeric) expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, q.id).toBe(true);
    const byId = Object.fromEntries(numeric.map((q) => [q.id, q.answer]));
    expect(byId['btx-3q']).toBeCloseTo(growthRate(TEAK_DATA[1], TEAK_DATA[2]), 12);
    expect(byId['btx-8q']).toBeCloseTo(partMass(5, 45), 12);
    expect(byId['btx-11q']).toBeCloseTo(partMass(45, 14), 12);
    expect(byId['bta-4q']).toBe(ringsForAge(25));
    expect(byId['bta-6q']).toBeCloseTo(partMass(6, 55), 12);
  });
  it('has at least 12 practice items and a 10-item assessment', () => {
    expect(TISSUES_PRACTICE.groups.flatMap((g) => g.items).length).toBeGreaterThanOrEqual(12);
    expect(TISSUES_ASSESSMENT.sections.flatMap((s) => s.items).length).toBe(10);
  });
});
