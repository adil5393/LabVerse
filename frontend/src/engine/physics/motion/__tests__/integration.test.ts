import { describe, it, expect, vi } from 'vitest';
import appSource from '../../../../App.tsx?raw';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { SubjectExplorer } from '../../../../features/explorer/SubjectExplorer';
import electricitySource from '../../../../features/electricity/ElectricityLab.tsx?raw';
import trackSource from '../../../../features/physics/motion/MotionTrack.tsx?raw';
import graphsSource from '../../../../features/physics/motion/MotionGraphs.tsx?raw';
import reducedSource from '../../../../features/physics/motion/useReducedMotion.ts?raw';
import { getSubjectById, LABVERSE_SUBJECTS } from '../../../../types/subjectRegistry';
import { MOTION_CHAPTER as CH } from '../learn/content';
import { MOTION_EXPERIMENTS, comparePrediction, routeValues } from '../experiments';
import { lessonStatus } from '../../../education/progress';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
async function fresh() {
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  return (await import('../../../../store/useEducationStore')).useEducationStore;
}

describe('Physics route integration: Motion is added, Electricity is preserved in the Robotics section', () => {
  it('Electricity is served from the Robotics section, and the old Physics addresses redirect there', () => {
    expect(appSource).toContain('<Route path="/robotics" element={<RoboticsHub />} />');
    expect(appSource).toContain('<Route path="/robotics/electricity" element={<ElectricityLab />} />');
    expect(appSource).toContain('<Route path="/robotics/electricity/workbench" element={<WorkbenchPage />} />');
    expect(appSource).toContain('<Route path="/physics/electricity" element={<MovedToRobotics to="/robotics/electricity" />} />');
    expect(appSource).toContain('<Route path="/physics/electricity/workbench" element={<MovedToRobotics to="/robotics/electricity/workbench" />} />');
  });
  it('the Physics hub and the four Motion destinations are registered', () => {
    for (const r of ['/physics', '/physics/motion', '/physics/motion/lab', '/physics/motion/exercises', '/physics/motion/learn/:lessonId']) expect(appSource, r).toContain(`path="${r}"`);
  });
  it('the phone-first subject card opens all Physics chapters and keeps Electricity available', () => {
    expect(getSubjectById('physics')!.route).toBe('/physics');
    expect(getSubjectById('robotics')!.route).toBe('/robotics');
    expect(LABVERSE_SUBJECTS.map((s) => s.id)).toEqual(['physics', 'chemistry', 'mathematics', 'biology', 'robotics']);
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SubjectExplorer)));
    expect(html).toContain('href="/physics"');
    expect(html).toContain('href="/robotics"');
    expect(html).not.toContain('href="/physics/electricity"');
    expect(electricitySource).toContain('<Link to="/robotics"');
    expect(electricitySource).not.toContain('/physics/electricity');
  });
  it('Chapter routes agree with the chapter data', () => {
    expect(CH.routes.landing).toBe('/physics/motion'); expect(CH.routes.learn('pm-l1')).toBe('/physics/motion/learn/pm-l1'); expect(CH.routes.lab).toBe('/physics/motion/lab');
  });
  it('the figure respects reduced motion and does not use frame counts as physics', () => {
    expect(reducedSource).toContain('prefers-reduced-motion');
    expect(trackSource).toContain('useReducedMotion');
    expect(graphsSource).toContain('useReducedMotion');
    expect(trackSource).toMatch(/tickClock/);
    expect(graphsSource).toMatch(/tickClock/);
    expect(graphsSource).not.toMatch(/frameCount|frames\s*\+\+/);
    expect(trackSource).not.toMatch(/frameCount|frames\s*\+\+|requestAnimationFrame\([^)]*\)\s*;\s*\n\s*position/);
  });
});

describe('Motion mastery and prerequisites use the shared evidence model', () => {
  const lesson = CH.lessons['pm-l2'];
  it('a hint before a correct first answer is assisted, not independent evidence', async () => {
    const store = await fresh();
    const s = store.getState();
    s.recordIndependentHint(lesson.id, 'i1');
    s.submitIndependent(lesson.id, 'i1', { correct: true });
    expect(store.getState().lessons[lesson.id].independent.i1).toMatchObject({ correct: true, assisted: true, firstAttemptUnassisted: false });
  });
  it('a viewed solution, a wrong-then-right answer and a repeated question are not independent evidence', async () => {
    const store = await fresh();
    const s = store.getState();
    s.revealIndependentSolution(lesson.id, 'i2'); s.submitIndependent(lesson.id, 'i2', { correct: true });
    s.submitIndependent(lesson.id, 'i3', { correct: false }); s.submitIndependent(lesson.id, 'i3', { correct: true });
    for (let k = 0; k < 4; k++) s.submitIndependent(lesson.id, 'i1', { correct: true });
    const l = store.getState().lessons[lesson.id].independent;
    expect(l.i2.firstAttemptUnassisted).toBe(false); expect(l.i3.firstAttemptUnassisted).toBe(false);
    expect(l.i1.attempts).toBe(4); // one item, however often repeated
    expect(lessonStatus(lesson, store.getState().lessons[lesson.id])).not.toBe('mastered');
  });
  it('navigation alone (every step seen, worked example seen, reflected) is never mastery', async () => {
    const store = await fresh();
    const s = store.getState();
    for (const st of lesson.steps) s.markStepSeen(lesson.id, st.id);
    s.markWorkedSeen(lesson.id); s.markReflected(lesson.id);
    expect(lessonStatus(lesson, store.getState().lessons[lesson.id])).not.toBe('mastered');
  });
  it('skipping a prerequisite is recorded as bypassed, never passed, and blocks nothing', async () => {
    const store = await fresh();
    store.getState().bypassReadiness('pmp-signed');
    expect(store.getState().readiness['pmp-signed'].status).toBe('bypassed');
    store.getState().markStepSeen('pm-l1', 'm1-ref'); // a lesson can still be started
    expect(store.getState().lessons['pm-l1'].stepsSeen).toContain('m1-ref');
  });
});

describe('Motion guided investigations compare predictions with the model', () => {
  it('model values for the four experiments match independent arithmetic', () => {
    const by = Object.fromEntries(MOTION_EXPERIMENTS.map((e) => [e.id, e]));
    expect(routeValues(by.A, by.A.routes[0])).toEqual({ distanceM: 50, displacementM: 50 });
    expect(routeValues(by.B, by.B.routes[0])).toEqual({ distanceM: 80, displacementM: 0 });
    expect(routeValues(by.C, by.C.routes[0])).toEqual({ distanceM: 40 + 30 + 50, displacementM: 60 });
    expect(routeValues(by.D, by.D.routes[0])).toEqual({ distanceM: 30, displacementM: 30 });
    expect(routeValues(by.D, by.D.routes[1])).toEqual({ distanceM: 70, displacementM: 30 });
  });
  it('experiment D really has the same displacement and different distances', () => {
    const d = MOTION_EXPERIMENTS.find((e) => e.id === 'D')!;
    const [a, b] = d.routes.map((r) => routeValues(d, r));
    expect(a.displacementM).toBe(b.displacementM); expect(a.distanceM).not.toBe(b.distanceM);
  });
  it('feedback names the specific confusion: displacement given for distance, distance given for displacement, sign error', () => {
    const actual = { distanceM: 80, displacementM: 0 };
    expect(comparePrediction(actual, { distanceM: 80, displacementM: 0 }).messages[0]).toMatch(/matches/);
    expect(comparePrediction(actual, { distanceM: 0, displacementM: 0 }).messages.join(' ')).toMatch(/size of the displacement/);
    expect(comparePrediction({ distanceM: 70, displacementM: 30 }, { distanceM: 70, displacementM: 70 }).messages.join(' ')).toMatch(/You gave the distance/);
    expect(comparePrediction({ distanceM: 30, displacementM: -30 }, { distanceM: 30, displacementM: 30 }).messages.join(' ')).toMatch(/sign/);
    expect(comparePrediction(actual, { distanceM: -80, displacementM: 0 }).messages.join(' ')).toMatch(/cannot be negative/);
  });
});
