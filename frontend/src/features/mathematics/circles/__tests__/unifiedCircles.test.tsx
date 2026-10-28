// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CircleWorkbenchPage } from '../CircleWorkbenchPage';
import { CirclesHub } from '../learn/CirclesHub';
import { useCircleStore } from '../../../../store/useCircleStore';
import { useEducationStore } from '../../../../store/useEducationStore';
import { emptyLearningState } from '../../../../engine/education/persistence';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }

let host: HTMLDivElement; let root: Root;
beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); useEducationStore.setState({ ...emptyLearningState(), teacherMode: false }); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

async function renderAt(path: string) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/mathematics/circles" element={<CirclesHub />} />
          <Route path="/mathematics/circles/workbench" element={<CircleWorkbenchPage />} />
          <Route path="/mathematics/circles/learn/:lessonId" element={<div data-testid="learn-page" />} />
          <Route path="/mathematics/circles/practice" element={<div data-testid="practice-page" />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe('Circles on the unified framework', { timeout: 20000 }, () => {
  it('the chapter page is the shared hub by default, with the assessment and the Beyond Class 9 lesson', async () => {
    await renderAt('/mathematics/circles');
    expect(host.querySelector('[data-chapter="circles"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="chapter-badge"]')!.textContent).toContain('Chapter 5');
    expect(host.querySelector('[data-testid="assessment-card"]')).not.toBeNull();
    expect(host.textContent).toContain('Beyond Class 9 (optional)');
    expect(host.querySelector('[data-testid="path-progress"]')!.textContent).toMatch(/of 11 lessons/);
  });

  it('old guided-workbench links redirect to the matching Learn lesson; the revision lesson goes to practice', async () => {
    await renderAt('/mathematics/circles/workbench?lesson=circles-l4');
    expect(host.querySelector('[data-testid="learn-page"]')).not.toBeNull();
    act(() => root.unmount()); root = createRoot(host);
    await renderAt('/mathematics/circles/workbench?lesson=circles-l12');
    expect(host.querySelector('[data-testid="practice-page"]')).not.toBeNull();
  });

  it('the compatibility switch brings back the older landing page and guided workbench unchanged', async () => {
    await renderAt('/mathematics/circles?legacy=1');
    expect(host.querySelector('[data-chapter="circles"]')).toBeNull();
    expect(host.textContent).toContain('Circles Laboratory');
    act(() => root.unmount()); root = createRoot(host);
    await renderAt('/mathematics/circles/workbench?lesson=circles-l4');
    expect(host.querySelector('[data-testid="learn-page"]')).toBeNull(); // switch remembered on this device: no redirect
    act(() => root.unmount()); root = createRoot(host);
    await renderAt('/mathematics/circles?legacy=0');
    expect(host.querySelector('[data-chapter="circles"]')).not.toBeNull();
  });

  it('a lesson investigation sets up the experiment, limits the tools, and reports one event per finished change', async () => {
    vi.useFakeTimers();
    await renderAt('/mathematics/circles/workbench?exp=understanding-circle&mode=explore&ltLesson=circles-l1&ltTask=lt-circles-l1&ltBack=%2Fmathematics%2Fcircles%2Flearn%2Fcircles-l1');
    expect(useCircleStore.getState().currentExperimentId).toBe('understanding-circle');
    expect(host.querySelector('[data-testid="lab-task-banner"]')).not.toBeNull();
    const point = Object.values(useCircleStore.getState().circumferencePoints)[0];
    expect(point).toBeDefined();
    // A drag is many small moves: it must count once, after the gesture ends.
    act(() => { for (let i = 1; i <= 5; i++) useCircleStore.setState((s) => ({ circumferencePoints: { ...s.circumferencePoints, [point.id]: { ...point, angleRad: point.angleRad + i * 0.05 } } })); });
    act(() => { vi.advanceTimersByTime(500); });
    expect(useEducationStore.getState().lessons['circles-l1'].labTasks!['lt-circles-l1'].events['figure-changed']).toBe(1);
    act(() => { useCircleStore.setState((s) => ({ circumferencePoints: { ...s.circumferencePoints, [point.id]: { ...point, angleRad: 2 } } })); });
    act(() => { vi.advanceTimersByTime(500); });
    const rec = useEducationStore.getState().lessons['circles-l1'].labTasks!['lt-circles-l1'];
    expect(rec.events['figure-changed']).toBe(2);
    expect(rec.goalsMet).toContain('explore');
    // Recording a live measurement is the observation goal.
    const recordBtn = host.querySelector('[data-record]') as HTMLButtonElement;
    expect(recordBtn).not.toBeNull();
    act(() => recordBtn.click());
    const after = useEducationStore.getState().lessons['circles-l1'].labTasks!['lt-circles-l1'];
    expect(after.observations.length).toBe(1);
    expect(after.goalsMet).toEqual(['explore', 'observe']);
  });
});
