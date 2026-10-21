import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import appSource from '../../../App.tsx?raw';
import { ForcesPractice } from '../forces/ForcesPractice';
import { ForcesHub } from '../forces/ForcesPages';
import { WorkHub } from '../work/WorkPages';
import { MotionHub, PhysicsHub } from '../motion/MotionHub';
import { physicsChapterSummaries } from '../../../engine/physics/chapterSummary';
import { FORCE_PRACTICE_CATEGORIES, FORCE_PRACTICE_ITEMS } from '../../../engine/physics/forces/practice';
import { WORK_MAP, workCoverageCounts } from '../../../engine/physics/work/curriculum';
import { CHAPTER_REGISTRY } from '../../workspace/chapterNavigation';

const at = (el: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>);

describe('Milestone A: Forces Chapter Practice is reachable', () => {
  it('has a registered route', () => {
    expect(appSource).toContain('path="/physics/forces/practice"');
    expect(appSource).toContain('ForcesPractice');
  });
    it('offers every question once in the topic picker while showing one question at a time', () => {
    expect(FORCE_PRACTICE_ITEMS.length).toBe(29);
    const html = at(<ForcesPractice />);
      for (const it of FORCE_PRACTICE_ITEMS) expect(html.split(`data-practice-option="${it.id}"`).length - 1, it.id).toBe(1);
      expect(html.split('data-practice-item=').length - 1).toBe(1);
    for (const c of FORCE_PRACTICE_CATEGORIES) expect(html).toContain(`data-practice-category="${c.id}"`);
    expect(html).toContain('0 of 0 answered correctly');
  });
  it('the Forces hub links to it and no longer shows a disabled Upcoming card', () => {
    const html = at(<ForcesHub />);
    expect(html).toContain('href="/physics/forces/practice"');
    expect(html).not.toContain('aria-disabled="true" data-destination="practice"');
  });
  it('the chapter navigation points at the practice route and numbers the chapter 6', () => {
    const f = Object.values(CHAPTER_REGISTRY).find((m) => m.id === 'forces')!;
    expect(f.defaultPracticeUrl).toBe('/physics/forces/practice');
    expect(f.title).toContain('Ch. 6');
  });
  it('practice routes exist for all three chapters', () => {
    for (const p of ['/physics/motion/practice', '/physics/forces/practice', '/physics/work/practice']) expect(appSource).toContain(`path="${p}"`);
  });
});

describe('Milestone A: Work map', () => {
  it('splits the watermill (taught) from the chapter summary (not built)', () => {
    expect(WORK_MAP.find((r) => r.id === 'w-bridge')).toBeUndefined();
    const wm = WORK_MAP.find((r) => r.id === 'w-watermill')!;
    expect(wm.status).toBe('learn');
    expect(wm.lessonIds).toEqual(['pw-l4']);
    expect(WORK_MAP.find((r) => r.id === 'w-glance')!.status).toBe('planned');
    const c = workCoverageCounts(); expect(c.planned).toBe(2);
  });
});

describe('Milestone A: hubs are derived from curriculum data', () => {
  it('summaries match the chapters and say nothing is upcoming that exists', () => {
    const s = Object.fromEntries(physicsChapterSummaries().map((x) => [x.id, x]));
    expect(s.forces.practiceQuestions).toBe(29);
    expect(s.work.practiceQuestions).toBe(33);
    expect(s.forces.exercisesSolved).toBe(s.forces.exercisesTotal);
    expect(s.work.exercisesSolved).toBe(s.work.exercisesTotal);
    expect(s.motion.exercisesSolved).toBe(s.motion.exercisesTotal);
    expect(s.forces.lessons).toBe(10);
    expect(s.work.lessons).toBe(10);
  });
  it('the Physics hub shows those numbers and has no stale "upcoming" claims', () => {
    const html = at(<PhysicsHub />);
    for (const s of physicsChapterSummaries()) expect(html).toContain(s.line.replace(/&/g, '&amp;'));
    expect(html).not.toContain('the third law is upcoming');
    expect(html).not.toContain('Energy, power and simple machines are upcoming');
  });
  it('chapter hubs render with a Chapter Practice link', () => {
    expect(at(<MotionHub />)).toContain('href="/physics/motion/practice"');
    expect(at(<WorkHub />)).toContain('href="/physics/work/practice"');
  });
});
