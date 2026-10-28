// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ExplainerStep, LabTask } from '../../../engine/education/types';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }

let host: HTMLDivElement; let root: Root;
beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

const click = (el: Element | null) => act(() => { (el as HTMLElement).click(); });
const q = (sel: string) => host.querySelector(sel);

const TASK: LabTask = { id: 'chords', title: 'Equal chords', instruction: 'Drag the chords until they are equal.', href: '/lab?exp=equal', requiredForMastery: true,
  goals: [{ id: 'move', label: 'Move a chord twice', events: ['chord-moved'], count: 2 }, { id: 'measure', label: 'Open the measurements', view: 'measure' }], expectedPattern: 'Equal chords are the same distance from the centre.' };

const STEP: ExplainerStep = {
  id: 'st', title: 'Equal chords', paragraphs: ['Explanation paragraph.'],
  prediction: { id: 'pred', prompt: 'What will you see?', options: [{ id: 'a', text: 'Same distance' }, { id: 'b', text: 'Different distance' }], expectedId: 'a', reveal: 'Now investigate.' },
  proof: [{ claim: 'OA = OB', reason: 'Radii of one circle', reasonChoices: ['Radii of one circle', 'Vertical angles'] }, { claim: 'So the triangles match', reason: 'SSS' }],
  labTaskId: 'chords',
};

describe('shared lesson interactions', () => {
  it('hides the explanation until a prediction is committed, records it, and never scores it', async () => {
    const { ConceptExplainer } = await import('../LessonParts');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    act(() => root.render(<MemoryRouter><ConceptExplainer step={STEP} lessonId="circles-l5" labTask={TASK} backHref="/m/learn/circles-l5" /></MemoryRouter>));
    expect(host.textContent).not.toContain('Explanation paragraph.');
    expect(q('[data-prediction="pred"]')!.getAttribute('data-committed')).toBe('false');
    click(q('[data-prediction-option="b"]'));
    click([...host.querySelectorAll('button')].find((b) => b.textContent === 'Lock in my prediction')!);
    expect(host.textContent).toContain('Explanation paragraph.');
    expect(q('[data-testid="prediction-reveal"]')!.textContent).toContain('Different distance');
    expect(useEducationStore.getState().lessons['circles-l5'].predictions?.pred.choiceId).toBe('b');
    expect(useEducationStore.getState().lessons['circles-l5'].checks).toEqual({});
  });

  it('a proof line with reason choices hides its reason until the right one is chosen, and records the attempt as a check', async () => {
    const { ConceptExplainer } = await import('../LessonParts');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    useEducationStore.getState().recordPrediction('circles-l5', 'pred', 'a');
    act(() => root.render(<MemoryRouter><ConceptExplainer step={STEP} lessonId="circles-l5" /></MemoryRouter>));
    expect(q('[data-proof-reasons="1"]')).not.toBeNull();
    expect(host.textContent).not.toContain('Because: Radii of one circle');
    expect(host.textContent).toContain('Because: SSS'); // lines without choices show their reason
    click([...q('[data-proof-reasons="1"]')!.querySelectorAll('button')].find((b) => b.textContent === 'Vertical angles')!);
    expect(useEducationStore.getState().lessons['circles-l5'].checks['st:proof0']).toBe(false);
    click([...q('[data-proof-reasons="1"]')!.querySelectorAll('button')].find((b) => b.textContent === 'Radii of one circle')!);
    expect(host.textContent).toContain('Because: Radii of one circle');
    expect(useEducationStore.getState().lessons['circles-l5'].checks['st:proof0']).toBe(true);
  });

  it('the lab task card links to the laboratory with the task, and goals tick only from laboratory events', async () => {
    const { ConceptExplainer } = await import('../LessonParts');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    useEducationStore.getState().recordPrediction('circles-l5', 'pred', 'a');
    act(() => root.render(<MemoryRouter><ConceptExplainer step={STEP} lessonId="circles-l5" labTask={TASK} backHref="/m/learn/circles-l5" /></MemoryRouter>));
    const link = q('[data-lab-task="chords"] a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/lab?exp=equal&ltLesson=circles-l5&ltTask=chords&ltBack=%2Fm%2Flearn%2Fcircles-l5');
    expect(q('[data-lab-task="chords"]')!.getAttribute('data-complete')).toBe('false');
    act(() => { useEducationStore.getState().recordLabEvent('circles-l5', 'chords', { name: 'chord-moved' }, TASK); useEducationStore.getState().recordLabEvent('circles-l5', 'chords', { name: 'chord-moved' }, TASK); });
    expect(q('[data-goal="move"]')!.getAttribute('data-met')).toBe('true');
    expect(q('[data-goal="measure"]')!.getAttribute('data-met')).toBe('false');
    act(() => useEducationStore.getState().recordLabEvent('circles-l5', 'chords', { name: 'view', view: 'measure' }, TASK));
    expect(q('[data-lab-task="chords"]')!.getAttribute('data-complete')).toBe('true');
    expect(q('[data-testid="lab-pattern"]')!.textContent).toContain('Equal chords are the same distance');
  });

  it('the laboratory bridge reports events and observations only while a lesson task is open, and only to safe return paths', async () => {
    const { useLessonLabTask, LabTaskBanner } = await import('../LabTaskBridge');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    let bridge: ReturnType<typeof useLessonLabTask> | undefined;
    const Lab: React.FC = () => { bridge = useLessonLabTask(TASK); return <LabTaskBanner bridge={bridge} task={TASK} measurements={[{ label: 'OM', value: '3.0 cm' }]} />; };
    act(() => root.render(<MemoryRouter initialEntries={['/lab?ltLesson=circles-l5&ltTask=chords&ltBack=//evil.example']}><Routes><Route path="/lab" element={<Lab />} /></Routes></MemoryRouter>));
    expect(bridge!.active).toBe(true);
    expect(bridge!.backHref).toBe('/');
    act(() => bridge!.report('chord-moved'));
    click(q('[data-record="OM"]'));
    const rec = useEducationStore.getState().lessons['circles-l5'].labTasks!.chords;
    expect(rec.events['chord-moved']).toBe(1);
    expect(rec.observations[0]).toMatchObject({ label: 'OM', value: '3.0 cm' });
    act(() => root.unmount());
    root = createRoot(host);
    act(() => root.render(<MemoryRouter initialEntries={['/lab']}><Routes><Route path="/lab" element={<Lab />} /></Routes></MemoryRouter>));
    expect(bridge!.active).toBe(false);
    act(() => bridge!.report('chord-moved'));
    expect(useEducationStore.getState().lessons['circles-l5'].labTasks!.chords.events['chord-moved']).toBe(1);
    expect(q('[data-testid="lab-task-banner"]')).toBeNull();
  });
});
