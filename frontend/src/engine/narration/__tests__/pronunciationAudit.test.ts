import { describe, it, expect } from 'vitest';
import { MOTION_CHAPTER } from '../../physics/motion/learn/content';
import { FORCES_CHAPTER } from '../../physics/forces/learn/content';
import { WORK_CHAPTER } from '../../physics/work/learn/content';
import { SOUND_CHAPTER } from '../../physics/sound/learn/content';
import { DERIVATIONS as MOTION_DERIVATIONS } from '../../physics/motion/derivations';
import { DERIVATIONS as WORK_DERIVATIONS } from '../../physics/work/derivations';
import { SECOND_LAW_DERIVATIONS } from '../../physics/forces/secondLawDerivations';
import { derivationSegments } from '../derivationSegments';
import { explainerSegments, guidedSegments, independentSegments, reflectionSegments, workedSegments } from '../segments';
import type { NarrationSegment } from '../controller';
import { toSpeech } from '../speechText';

const lessons = [MOTION_CHAPTER, FORCES_CHAPTER, WORK_CHAPTER, SOUND_CHAPTER].flatMap((c) => Object.values(c.lessons));

function everySegment(): NarrationSegment[] {
  const out: NarrationSegment[] = [];
  for (const l of lessons) {
    out.push(...l.steps.flatMap(explainerSegments), ...workedSegments(l.worked, l.worked.steps.length), ...guidedSegments(l.guided, l.guided.steps.length, true),
      ...independentSegments(l.independent), ...reflectionSegments(l.id, l.reflection));
  }
  for (const list of [MOTION_DERIVATIONS, SECOND_LAW_DERIVATIONS, WORK_DERIVATIONS] as { title: string; assumptions: string[]; steps: { title: string; math: string[]; why: string }[]; summary: string[] }[][]) {
    for (const d of list) d.steps.forEach((_, index) => out.push(...derivationSegments({ title: d.title, assumptions: d.assumptions, steps: d.steps, index, gated: false, summary: d.summary })));
  }
  return out;
}

/** Characters a speech engine would skip, spell out badly, or read as "unknown": none may survive conversion. */
const LEFTOVER = /[²³⁰¹⁴-⁹⁻₀-₉½¼¾×÷−≈≠≤≥∝√±∴∞→⇒·⋅ΔΣα-ωΩΦΘ°★✓✗^_{}]/;

describe('spoken form of all narrated physics text', () => {
  const segs = everySegment();

  it('covers a large amount of text', () => expect(segs.length).toBeGreaterThan(1500));

  it('leaves no mathematical symbol, subscript, superscript or Greek letter unconverted', () => {
    const bad = segs.map((s) => ({ id: s.id, said: toSpeech(s.speak ?? s.text) })).filter((x) => LEFTOVER.test(x.said));
    expect(bad.slice(0, 5)).toEqual([]);
  });

  it('never produces empty speech for a non-empty segment', () => {
    expect(segs.filter((s) => toSpeech(s.text).length === 0).map((s) => s.id).slice(0, 5)).toEqual([]);
  });

  it('reads representative Motion, Forces and Work expressions as a student would say them', () => {
    const says = (t: string) => toSpeech(t);
    expect(says('v = u + at')).toBe('v equals u plus a t');
    expect(says('a = (v − u) ÷ t')).toContain('v minus u');
    expect(says('s = ut + ½at²')).toBe('s equals u t plus one half a t squared');
    expect(says('F = ma, so a = F ÷ m = 10 N ÷ 2 kg = 5 m/s²')).toBe('F equals m a, so a equals F divided by m equals 10 newtons divided by 2 kilograms equals 5 metres per second squared');
    expect(says('W = F s cos θ')).toBe('W equals F s cos theta');
    expect(says('K = ½mv²')).toBe('K equals one half m v squared');
    expect(says('U = mgh = 2 kg × 10 m/s² × 3 m = 60 J')).toBe('U equals m g h equals 2 kilograms times 10 metres per second squared times 3 metres equals 60 joules');
    expect(says('P = W ÷ t = 600 J ÷ 5 s = 120 W')).toBe('P equals W divided by t equals 600 joules divided by 5 seconds equals 120 watts');
    expect(says('ΔK = K₂ − K₁')).toBe('change in K equals K 2 minus K 1');
    expect(says('v = −4 m/s (to the left)')).toBe('v equals negative 4 metres per second (to the left)');
    expect(says('μ = 0.5')).toBe('mu equals 0.5');
    expect(says('The ball arrives at 3 m')).toBe('The ball arrives at 3 metres');
    expect(says('1 N = 1 kg m/s²')).toBe('1 newton equals 1 kilogram metres per second squared');
  });
});
