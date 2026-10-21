import { describe, it, expect } from 'vitest';
import { toSpeech, chunkForSpeech } from '../speechText';

const cases: [string, string][] = [
  ['a = 9.8 m/s²', 'a equals 9.8 metres per second squared'],
  ['K = ½mv²', 'K equals one half m v squared'],
  ['v = −5 m/s', 'v equals negative 5 metres per second'],
  ['ΔK = K₂ − K₁', 'change in K equals K 2 minus K 1'],
  ['W = F × s', 'W equals F times s'],
  ['A force of 10 N moves a box 3 m.', 'A force of 10 newtons moves a box 3 metres.'],
  ['A force of 1 N.', 'A force of 1 newton.'],
  ['s = ut + ½at²', 's equals u t plus one half a t squared'],
  ['U = mgh', 'U equals m g h'],
  ['v² = u² + 2as', 'v squared equals u squared plus 2as'],
  ['The speed is 5 m s–1 and the mass 2 kg', 'The speed is 5 metres per second and the mass 2 kilograms'],
  ['1 J = 1 N × 1 m = 1 kg m² s⁻²', '1 joule equals 1 newton times 1 metre equals 1 kilogram metres squared per second squared'],
  ['P = W ÷ t = 600 W', 'P equals W divided by t equals 600 watts'],
  ['θ = 30°', 'theta equals 30 degrees'],
  ['μ = 0.4', 'mu equals 0.4'],
  ['an area of 4 m²', 'an area of 4 square metres'],
  ['Human hearing spans 20 Hz–20 kHz', 'Human hearing spans 20 hertz to 20 kilohertz'],
  ['F ∝ 1/m', 'F is proportional to 1/m'],
  ['See Fig. 7.4 and Eq. 7.12, e.g. a lever', 'See Figure 7.4 and Equation 7.12, for example a lever'],
  ['T = 25 °C', 'T equals 25 degrees Celsius'],
  ['W_net = ΔK', 'W net equals change in K'],
  ['x = +3 m, then x = −2 m', 'x equals positive 3 metres, then x equals negative 2 metres'],
];

describe('toSpeech: physics notation', () => {
  for (const [input, expected] of cases) it(input, () => expect(toSpeech(input)).toBe(expected));

  it('keeps one-letter variables as variables unless a number and a space precede them', () => {
    expect(toSpeech('s = 2s')).toBe('s equals 2s');
    expect(toSpeech('after 2 s')).toBe('after 2 seconds');
    expect(toSpeech('m g h')).toBe('m g h');
  });
  it('never returns control or marker characters', () => {
    expect(toSpeech('★ Supply the missing reasoning ✓')).not.toMatch(/[★✓]/);
  });
  it('is empty for empty input', () => expect(toSpeech('')).toBe(''));
});

describe('chunkForSpeech', () => {
  it('splits into sentences and caps the length', () => {
    const long = 'One short sentence. ' + 'word '.repeat(120).trim() + '. Last one!';
    const chunks = chunkForSpeech(long, 200);
    expect(chunks.length).toBeGreaterThan(3);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(200);
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(long.replace(/\s+/g, ' '));
  });
  it('returns nothing for blank text', () => expect(chunkForSpeech('   ')).toEqual([]));
});
