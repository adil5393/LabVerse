import { describe, expect, it } from 'vitest';
import { describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion } from '../../../education/types';
import { CELL_CHAPTER as CH } from '../learn/content';
import { CELL_ASSESSMENT, CELL_PRACTICE } from '../learn/practice';
import {
  CELL_PARTS, cellResponse, cellsAfterMitosis, classifyCell, divide, finalMass, partById, partsOf, partsWithDNA, percentChange, potatoMassChangePercent,
  presentInButNot, surfaceToVolume, tonicity, waterFlow, zygoteChromosomes,
} from '../model';
import {
  SPECIMENS, apparentSizeMm, cellsAcrossField, estimateCellSize, fieldDiameterMm, instrumentFor, mmToUm, specimenById, totalMagnification, visibility,
} from '../../microscope';

export const CELL_VISUAL_KINDS = ['microscope', 'osmosis', 'cellCompare', 'division', 'sizeLadder'];
describeChapterIntegrity('Cell', CH, CELL_VISUAL_KINDS);

describe('virtual microscope optics', () => {
  it('reproduces Activity 2.1: a 5 mm field with 25 onion cells gives 200 µm, and 10X × 10X is 100X', () => {
    expect(fieldDiameterMm(4)).toBe(5);
    expect(mmToUm(5)).toBe(5000);
    expect(estimateCellSize(5000, 25)).toBe(200);
    expect(totalMagnification(10, 10)).toBe(100);
    expect(cellsAcrossField(specimenById('onion')!, 4)).toBe(25);
    expect(cellsAcrossField(specimenById('onion')!, 10)).toBe(10);
    expect(estimateCellSize(1000, 0)).toBeNaN();
  });
  it('separates magnification from resolution', () => {
    expect(apparentSizeMm(200, 100)).toBe(20);
    expect(visibility(200, 40)).toBe('detail');
    expect(visibility(2, 40)).toBe('invisible');
    expect(visibility(2, 100)).toBe('dots');
    expect(visibility(2, 400)).toBe('dots');
    expect(visibility(2, 1000)).toBe('detail');
    expect(visibility(25, 400)).toBe('detail');
    expect(visibility(25, 40)).toBe('dots');
    expect(visibility(0.025, 1000)).toBe('invisible');
    expect(instrumentFor(400)).toBe('unaided eye');
    expect(instrumentFor(50)).toBe('light microscope');
    expect(instrumentFor(0.1)).toBe('electron microscope');
  });
  it('every specimen is well formed', () => {
    for (const s of SPECIMENS) { expect(s.sizeUm).toBeGreaterThan(0); expect(s.features.length).toBeGreaterThan(0); }
    expect(new Set(SPECIMENS.map((s) => s.id)).size).toBe(SPECIMENS.length);
  });
});

describe('Cell model', () => {
  it('names solutions by comparing outside with inside (Fig. 2.6)', () => {
    expect(tonicity(0, 3)).toBe('hypotonic');
    expect(tonicity(3, 3)).toBe('isotonic');
    expect(tonicity(20, 3)).toBe('hypertonic');
    expect(waterFlow(0, 3)).toBe('in');
    expect(waterFlow(20, 3)).toBe('out');
  });
  it('plant cells keep their size while animal cells swell or shrink', () => {
    expect(cellResponse('plant', 20, 3).state).toBe('plasmolysed');
    expect(cellResponse('plant', 20, 3).sizeChange).toBe('same');
    expect(cellResponse('animal', 20, 3).sizeChange).toBe('smaller');
    expect(cellResponse('animal', 0, 3).sizeChange).toBe('larger');
    expect(cellResponse('plant', 0, 3).state).toContain('turgid');
    expect(cellResponse('animal', 3, 3).state).toBe('unchanged');
  });
  it('the potato swells in water, shrinks in 20 % solution and a boiled potato does not change', () => {
    expect(potatoMassChangePercent(0)).toBeGreaterThan(0);
    expect(potatoMassChangePercent(20)).toBeLessThan(0);
    expect(potatoMassChangePercent(20, true)).toBe(0);
    expect(potatoMassChangePercent(3)).toBe(0);
    expect(finalMass(20, 12)).toBeCloseTo(22.4, 12);
    expect(percentChange(30, 24)).toBeCloseTo(-20, 12);
  });
  it('matches Tables 2.1 and 2.2 and the organelles that contain DNA', () => {
    expect(partsOf('bacterial').map((p) => p.id).sort()).toEqual(['cytoplasm', 'membrane', 'nucleoid', 'ribosome', 'wall']);
    expect(presentInButNot('plant', 'animal').map((p) => p.id).sort()).toEqual(['chloroplast', 'wall']);
    expect(partsWithDNA().map((p) => p.id).sort()).toEqual(['chloroplast', 'mitochondria', 'nucleoid', 'nucleus']);
    expect(partById('mitochondria')!.membranes).toBe(2);
    expect(classifyCell(false)).toBe('prokaryotic');
    expect(classifyCell(true)).toBe('eukaryotic');
    for (const p of CELL_PARTS) expect(p.job.length).toBeGreaterThan(20);
  });
  it('division keeps or halves the chromosome number, and fertilisation restores it', () => {
    expect(divide('mitosis', 46)).toMatchObject({ daughters: 2, chromosomesEach: 46, identical: true });
    expect(divide('meiosis', 46)).toMatchObject({ daughters: 4, chromosomesEach: 23, identical: false });
    expect(zygoteChromosomes(23, 23)).toBe(46);
    expect(cellsAfterMitosis(5)).toBe(32);
    expect(surfaceToVolume(1)).toBe(6);
    expect(surfaceToVolume(2)).toBe(3);
  });
});

describe('Cell practice and assessment', () => {
  const numeric = [...CELL_PRACTICE.groups.flatMap((g) => g.items.map((i) => i.question)), ...CELL_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.question))]
    .filter((q): q is NumericQuestion => q.kind === 'numeric');
  it('every numeric answer is accepted and its stored value is what the model gives', () => {
    for (const q of numeric) expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, q.id).toBe(true);
    const byId = Object.fromEntries(numeric.map((q) => [q.id, q.answer]));
    expect(byId['bcx-1q']).toBe(totalMagnification(10, 40));
    expect(byId['bcx-2q']).toBe(estimateCellSize(mmToUm(0.5), 25));
    expect(byId['bcx-3q']).toBe(apparentSizeMm(200, 100));
    expect(byId['bcx-5q']).toBeCloseTo(percentChange(25, 20), 12);
    expect(byId['bcx-12q']).toBe(cellsAfterMitosis(6));
    expect(byId['bcx-13q']).toBe(divide('meiosis', 24).chromosomesEach);
    expect(byId['bca-4q']).toBe(estimateCellSize(mmToUm(4), 16));
    expect(byId['bca-7q']).toBeCloseTo(percentChange(40, 44), 12);
  });
  it('has at least 12 practice items and a 10-item assessment', () => {
    expect(CELL_PRACTICE.groups.flatMap((g) => g.items).length).toBeGreaterThanOrEqual(12);
    expect(CELL_ASSESSMENT.sections.flatMap((s) => s.items).length).toBe(10);
  });
});
