import { describe, expect, it } from 'vitest';
import {
  classifyFrequency, echoVerdict, frequencyFromCount, frequencyOf, intensityAt, minimumEchoDistance, MEDIA, noteFrequencies,
  periodFromFrequency, reflectorDistance, roundTripTime, speedOf, travelTime, wavelengthOf,
} from '../characteristics';

describe('Sound characteristics: every worked example and exercise answer of the chapter (hand answers from the SND-0 spec)', () => {
  it('Example 10.1: 10 oscillations in 2 s give 5 Hz and 0.2 s; Exercise 3: 20 compressions in 4 s give 5 Hz', () => {
    expect(frequencyFromCount(10, 2)).toBe(5);
    expect(periodFromFrequency(5)).toBeCloseTo(0.2, 12);
    expect(frequencyFromCount(20, 4)).toBe(5);
  });
  it('Example 10.2: 20 Hz and 20 kHz at 344 m/s give 17.2 m and 0.0172 m', () => {
    expect(wavelengthOf(344, 20)).toBeCloseTo(17.2, 10);
    expect(wavelengthOf(344, 20000)).toBeCloseTo(0.0172, 10);
  });
  it('Example 10.3: thunder 5 s after the flash at 340 m/s is 1700 m away', () => expect(340 * 5).toBe(1700));
  it('Example 10.4: λ = 50 m at 5000 m/s gives 100 Hz and 0.01 s', () => {
    expect(frequencyOf(5000, 50)).toBe(100);
    expect(periodFromFrequency(frequencyOf(5000, 50))).toBeCloseTo(0.01, 12);
  });
  it('Example 10.5 (85 m), P&P 12 (34.3 m) and the 17 m minimum echo distance', () => {
    expect(reflectorDistance(340, 0.5)).toBe(85);
    expect(reflectorDistance(343, 0.2)).toBeCloseTo(34.3, 10);
    expect(minimumEchoDistance(340)).toBe(17);
  });
  it('Example 10.6 (688.5 m), P&P 13 (3000 m), Exercise 10 (3812.5 m), Exercise 11 (about 6.96 ms)', () => {
    expect(reflectorDistance(1530, 0.9)).toBeCloseTo(688.5, 9);
    expect(reflectorDistance(1500, 4)).toBe(3000);
    expect(reflectorDistance(1525, 5)).toBe(3812.5);
    expect(roundTripTime(1.2, 345)).toBeCloseTo(6.957e-3, 6);
  });
  it('Exercise 9: λ = 3.44 m at 344 m/s gives T = 0.01 s; Exercise 12: thunder 1720 m takes about 0.20 s longer at 331 m/s than at 344 m/s', () => {
    expect(periodFromFrequency(frequencyOf(344, 3.44))).toBeCloseTo(0.01, 12);
    expect(travelTime(1720, 331)).toBeCloseTo(5.196, 3);
    expect(travelTime(1720, 344)).toBeCloseTo(5, 12);
    expect(travelTime(1720, 331) - travelTime(1720, 344)).toBeCloseTo(0.196, 3);
  });
  it('Exercise 13: λ = 0.04 m at 340 m/s gives 8500 Hz; Exercise 14: 2.5 cm and 5.0 cm at 345 m/s give 13 800 Hz and 6900 Hz', () => {
    expect(frequencyOf(340, 0.04)).toBeCloseTo(8500, 9);
    expect(frequencyOf(345, 0.025)).toBeCloseTo(13800, 9);
    expect(frequencyOf(345, 0.05)).toBeCloseTo(6900, 9);
  });
  it('P&P 8: a 20 Hz piston makes 1200 oscillations in a minute; P&P 10 ratios 4.4 and 3.3; P&P 11 difference about 0.93 s', () => {
    expect(20 * 60).toBe(1200);
    expect(1500 / 340).toBeCloseTo(4.41, 2);
    expect(5000 / 1500).toBeCloseTo(3.33, 2);
    expect(travelTime(340, 340) - travelTime(340, 5000)).toBeCloseTo(0.932, 3);
  });
  it('Exercise 15: same distance, echo time in air 4.5 times that in water, so v_air : v_water = 1 : 4.5 = 2 : 9', () => {
    const d = 1000; const vWater = 1500; const tWater = roundTripTime(d, vWater); const tAir = 4.5 * tWater;
    expect((2 * d) / tAir / vWater).toBeCloseTo(2 / 9, 12);
  });
  it('v = ν λ round-trips and the speed does not depend on frequency', () => {
    for (const nu of [50, 256, 1000, 15000]) expect(speedOf(nu, wavelengthOf(343, nu))).toBeCloseTo(343, 9);
  });
});

describe('ranges, verdicts and models', () => {
  it('classifies frequencies with the chapter boundaries', () => {
    expect(classifyFrequency(10)).toBe('infrasonic');
    expect(classifyFrequency(20)).toBe('audible');
    expect(classifyFrequency(20000)).toBe('audible');
    expect(classifyFrequency(40000)).toBe('ultrasonic');
  });
  it('echo verdict has three zones; Exercise 4 (0.05 s) is not an echo', () => {
    expect(echoVerdict(0.03)).toBe('reverberation');
    expect(echoVerdict(0.05)).toBe('reverberation');
    expect(echoVerdict(0.07)).toBe('not-separate');
    expect(echoVerdict(0.1)).toBe('echo');
    expect(echoVerdict(0.5)).toBe('echo');
  });
  it('intensity falls with distance (inverse square, idealised); an octave doubles the frequency', () => {
    expect(intensityAt(1, 2)).toBeCloseTo(intensityAt(1, 1) / 4, 12);
    expect(intensityAt(1, 3)).toBeLessThan(intensityAt(1, 2));
    const notes = noteFrequencies(240);
    expect(notes[0].hz).toBe(240);
    expect(notes[7].hz).toBe(480);
  });
  it('every medium preset is labelled with its source and solids are fastest', () => {
    for (const m of MEDIA) expect(m.note).toMatch(/Section|Table|Example/);
    expect(MEDIA.find((m) => m.id === 'steel')!.speed).toBeGreaterThan(MEDIA.find((m) => m.id === 'water')!.speed);
    expect(MEDIA.find((m) => m.id === 'water')!.speed).toBeGreaterThan(MEDIA.find((m) => m.id === 'air-15')!.speed);
  });
  it('refuses impossible inputs instead of returning nonsense', () => {
    expect(() => periodFromFrequency(0)).toThrow(RangeError);
    expect(() => wavelengthOf(-340, 100)).toThrow(RangeError);
    expect(() => echoVerdict(-1)).toThrow(RangeError);
  });
});
