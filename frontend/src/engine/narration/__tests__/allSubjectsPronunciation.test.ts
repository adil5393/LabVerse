import { describe, expect, it } from 'vitest';
import { BUILT_CHAPTERS } from '../../curriculum/__tests__/builtChapters';
import { explainerSegments, guidedSegments, independentSegments, reflectionSegments, workedSegments } from '../segments';
import type { NarrationSegment } from '../controller';
import { toSpeech } from '../speechText';

/** Characters a speech engine would skip or misread, for every subject (Physics notation plus geometry and logic). */
const LEFTOVER = /[²³⁰¹⁴-⁹⁻₀-₉½¼¾×÷−≈≠≤≥∝√±∴∞→⇒·⋅ΔΣα-ωΩΦΘ★✓✗^_{}∠△≅∥⊥⟂∼≡⇔∈∉∩∪⌢∵]/;

function segmentsOf(): NarrationSegment[] {
  const out: NarrationSegment[] = [];
  for (const c of BUILT_CHAPTERS) for (const l of Object.values(c.lessons)) {
    out.push(...l.steps.flatMap(explainerSegments), ...workedSegments(l.worked, l.worked.steps.length), ...guidedSegments(l.guided, l.guided.steps.length, true),
      ...independentSegments(l.independent), ...reflectionSegments(l.id, l.reflection));
  }
  return out;
}

describe('spoken form of all narrated lesson text, every subject', () => {
  const segs = segmentsOf();
  it('covers every built chapter', () => expect(segs.length).toBeGreaterThan(4000));
  it('leaves no symbol unconverted in any subject', () => {
    const bad = segs.map((s) => ({ id: s.id, said: toSpeech(s.speak ?? s.text) })).filter((x) => LEFTOVER.test(x.said));
    expect(bad.slice(0, 8)).toEqual([]);
  });
  it('reads geometry as a student would say it', () => {
    expect(toSpeech('∠AOB = 2∠ACB')).toBe('angle A O B equals 2 angle A C B');
    expect(toSpeech('△ABC ≅ △PQR')).toBe('triangle A B C is congruent to triangle P Q R');
    expect(toSpeech('AB ∥ CD and OM ⊥ AB')).toBe('A B is parallel to C D and O M is perpendicular to A B');
    expect(toSpeech('∠A + ∠C = 180°')).toBe('angle A plus angle C equals 180 degrees');
    expect(toSpeech('NCERT Chapter 5')).toBe('NCERT Chapter 5');
  });
});
