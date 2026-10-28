import { describe, expect, it } from 'vitest';
import { toSpeech } from '../speechText';

describe('chemistry is read the way students say it', () => {
  it('formulae are spelled symbol by symbol', () => {
    expect(toSpeech('H₂O')).toBe('H 2 O');
    expect(toSpeech('CaCl₂')).toBe('C A C L 2');
    expect(toSpeech('Al₂(SO₄)₃')).toBe('A L 2 S O 4 taken 3 times');
  });
  it('ion charges become words', () => {
    expect(toSpeech('Na⁺')).toBe('N A plus');
    expect(toSpeech('Cl⁻')).toBe('C L minus');
    expect(toSpeech('Mg²⁺')).toBe('M G two plus');
    expect(toSpeech('SO₄²⁻')).toBe('S O 4 two minus');
  });
  it('a hyphen before a word ending is not a minus sign, and ordinary words are untouched', () => {
    expect(toSpeech('Simple anions end in -ide.')).toBe('Simple anions end in ide.');
    expect(toSpeech('v = -5 m/s')).toContain('negative 5');
    expect(toSpeech('NCERT Chapter 5')).toBe('NCERT Chapter 5');
    expect(toSpeech('Chlorine and Sodium')).toBe('Chlorine and Sodium');
  });
});
