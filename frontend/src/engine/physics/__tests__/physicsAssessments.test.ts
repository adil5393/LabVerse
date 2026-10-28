import { describe, expect, it } from 'vitest';
import { MOTION_CHAPTER } from '../motion/learn/content';
import { FORCES_CHAPTER } from '../forces/learn/content';
import { WORK_CHAPTER } from '../work/learn/content';
import { stoppingDistance } from '../motion/equations';
import type { ChapterAssessment, NumericQuestion } from '../../education/types';

const answer = (a: ChapterAssessment, id: string) => {
  const q = a.sections.flatMap((s) => s.items).find((i) => i.id === id)!.question;
  if (q.kind !== 'numeric') throw new Error(`${id} is not numeric`);
  return (q as NumericQuestion).answer;
};
const g = 10;

describe('Physics chapter assessments: every numeric answer equals the physics', () => {
  it('Motion', () => {
    const a = MOTION_CHAPTER.assessment!;
    expect(answer(a, 'ma-4')).toBe(90 / 1.5);
    expect(answer(a, 'ma-5')).toBe((400 - 100) / 100);
    expect(answer(a, 'ma-6')).toBe((8 - 20) / 4);
    expect(answer(a, 'ma-7')).toBe(0.5 * 2 * 5 ** 2);
    expect(answer(a, 'ma-9')).toBe(0.5 * 6 * 12);
    const decel = (10 * 10) / (2 * 10);
    expect(answer(a, 'ma-10')).toBe(stoppingDistance(20, decel));
  });
  it('Forces', () => {
    const a = FORCES_CHAPTER.assessment!;
    expect(answer(a, 'fa-4')).toBe(1200 * 1.5);
    expect(answer(a, 'fa-5')).toBeCloseTo(0.4 * 15, 12);
    expect(answer(a, 'fa-6')).toBe((2 * (7 - 3)) / 0.5);
    expect(answer(a, 'fa-7')).toBe((50 - 30) / 10);
    expect(answer(a, 'fa-9')).toBe((50 * 2) / 100);
    expect(answer(a, 'fa-10')).toBe(2 * (30 / (4 + 2)));
  });
  it('Work', () => {
    const a = WORK_CHAPTER.assessment!;
    expect(answer(a, 'wa-4')).toBe(40 * 5);
    expect(answer(a, 'wa-5')).toBe(0.5 * 60 * 5 ** 2);
    expect(answer(a, 'wa-6')).toBe(12 * g * 1.5);
    expect(answer(a, 'wa-7')).toBe((50 * g * 6) / 12);
    expect(answer(a, 'wa-8')).toBe(Math.sqrt(2 * g * 5));
    expect(answer(a, 'wa-9')).toBe((300 * 0.5) / 1.5);
  });
  it('each chapter links its assessment route', () => {
    expect(MOTION_CHAPTER.routes.assessment).toBe('/physics/motion/assessment');
    expect(FORCES_CHAPTER.routes.assessment).toBe('/physics/forces/assessment');
    expect(WORK_CHAPTER.routes.assessment).toBe('/physics/work/assessment');
  });
});
