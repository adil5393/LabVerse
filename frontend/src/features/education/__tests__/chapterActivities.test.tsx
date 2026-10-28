// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import type { EduChapter, Question } from '../../../engine/education/types';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }

let host: HTMLDivElement; let root: Root;
beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const q = (sel: string) => host.querySelector(sel);
const btn = (scope: Element, text: string) => [...scope.querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(text)) as HTMLButtonElement;
const click = (el: Element | null | undefined) => act(() => { (el as HTMLElement).click(); });

const choice = (id: string, correct: string, wrong: string): Question => ({ kind: 'choice', id, prompt: `Pick ${id}`, options: [{ id: 'r', text: correct }, { id: 'w', text: wrong }], correctId: 'r', feedback: { w: { message: 'Not that one.', misconception: `${id}-mix` } }, explanation: 'Because.' });

const CHAPTER: EduChapter = {
  id: 'motion', title: 'Test chapter', classGrade: 9, subject: 'physics', ncertNote: '', purpose: 'p', learn: [], realWorld: [], outcomes: [], prerequisiteIds: [],
  units: [{ id: 'u', number: 1, title: 'U', centralIdea: '', connection: '', vocabulary: [], discover: [], prerequisiteIds: [], lessonIds: ['pm-l1', 'pm-x'] }],
  lessons: {
    'pm-l1': { id: 'pm-l1', unitId: 'u', number: 1, title: 'One', objective: 'o', prerequisiteIds: [], steps: [{ id: 's', title: 'S', paragraphs: ['x'] }], worked: { id: 'w', title: '', given: [], ask: '', steps: [], verify: '' }, guided: { id: 'g', prompt: '', steps: [], conclusion: '' }, independent: [], reflection: { discover: '', evidence: '', stillConfusing: [] } },
    'pm-x': { id: 'pm-x', unitId: 'u', number: 2, title: 'Extension', objective: 'o', prerequisiteIds: [], extension: true, steps: [{ id: 's2', title: 'S', paragraphs: ['x'] }], worked: { id: 'w2', title: '', given: [], ask: '', steps: [], verify: '' }, guided: { id: 'g2', prompt: '', steps: [], conclusion: '' }, independent: [], reflection: { discover: '', evidence: '', stillConfusing: [] } },
  },
  prerequisites: {},
  practice: { id: 'ps', title: 'P', groups: [{ id: 'g1', title: 'Group one', blurb: 'b', items: [{ id: 'cp1', topic: 'T', prompt: 'p', question: choice('cp1', 'yes', 'no'), hints: ['h'], solution: ['s'], difficulty: 'basic', marks: 1 }] }] },
  assessment: { id: 'A', title: 'Chapter test', instructions: 'Answer all.', sections: [{ id: 'sec', title: 'Section A', items: [
    { id: 'a1', topic: 'Speed', lessonId: 'pm-l1', competency: 'knowledge', marks: 2, prompt: 'One', question: choice('a1', 'right', 'wrong'), solution: ['Solution one'] },
    { id: 'a2', topic: 'Graphs', lessonId: 'pm-l1', competency: 'analysis', marks: 3, prompt: 'Two', question: choice('a2', 'right', 'wrong'), solution: ['Solution two'] },
  ] }] },
  routes: { landing: '/physics/motion', learn: (id) => `/physics/motion/learn/${id}`, prerequisites: () => '', lab: '/physics/motion/lab', practice: '/physics/motion/practice', assessment: '/physics/motion/assessment' },
};

describe('chapter assessment', () => {
  it('saves answers without feedback, scores on submit, shows solutions, readiness and targeted revision', async () => {
    const { ChapterAssessmentView } = await import('../ChapterAssessment');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    act(() => root.render(<MemoryRouter><ChapterAssessmentView chapter={CHAPTER} assessment={CHAPTER.assessment!} /></MemoryRouter>));
    expect(q('[data-testid="assessment-readiness"]')!.getAttribute('data-readiness')).toBe('not_attempted');
    click(btn(host, 'Start the assessment'));
    const a1 = q('[data-assessment-item="a1"]')!; const a2 = q('[data-assessment-item="a2"]')!;
    click([...a1.querySelectorAll('button')].find((b) => b.textContent === 'right'));
    click(btn(a1, 'Save answer'));
    expect(a1.querySelector('[data-testid="answer-saved"]')).not.toBeNull();
    expect(a1.querySelector('[data-testid="feedback"]')).toBeNull(); // no feedback during the attempt
    click([...a2.querySelectorAll('button')].find((b) => b.textContent === 'wrong'));
    click(btn(a2, 'Save answer'));
    expect(host.textContent).not.toContain('Solution one');
    click(q('[data-testid="assessment-submit"]'));
    expect(q('[data-testid="assessment-result"]')!.textContent).toContain('2 of 5');
    expect(q('[data-assessment-item="a2"]')!.getAttribute('data-correct')).toBe('false');
    expect(host.textContent).toContain('Solution two');
    expect(q('[data-testid="assessment-revision"]')!.textContent).toContain('Graphs');
    const saved = useEducationStore.getState().assessments.motion[0];
    expect(saved).toMatchObject({ score: 2, maxScore: 5, demonstrated: false });
    expect(saved.answers.a2.misconception).toBe('a2-mix');
  });

  it('a teacher-mode attempt is a demonstration, not the student’s readiness', async () => {
    const { ChapterAssessmentView } = await import('../ChapterAssessment');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    useEducationStore.getState().setTeacherMode(true);
    act(() => root.render(<MemoryRouter><ChapterAssessmentView chapter={CHAPTER} assessment={CHAPTER.assessment!} /></MemoryRouter>));
    click(btn(host, 'Start the assessment'));
    click(q('[data-testid="assessment-submit"]'));
    expect(useEducationStore.getState().assessments.motion[0].demonstrated).toBe(true);
    expect(q('[data-testid="assessment-result"] [data-readiness]')!.getAttribute('data-readiness')).toBe('demonstrated');
  });
});

describe('chapter practice bank and chapter hub', () => {
  it('practice persists per chapter with the shared help rules and shows difficulty and marks', async () => {
    const { ChapterPracticeSet } = await import('../ChapterAssessment');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    act(() => root.render(<MemoryRouter><ChapterPracticeSet chapter={CHAPTER} set={CHAPTER.practice!} /></MemoryRouter>));
    expect(host.textContent).toContain('Basic');
    expect(host.textContent).toContain('1 mark');
    const card = q('[data-independent="cp1"]')!;
    click(btn(card, 'Hint'));
    click([...card.querySelectorAll('button')].find((b) => b.textContent === 'yes'));
    click(btn(card, 'Check answer'));
    expect(useEducationStore.getState().practice.motion.cp1).toMatchObject({ correct: true, assisted: true, firstAttemptUnassisted: false });
    expect(q('[data-testid="practice-set-summary"]')!.textContent).toContain('0 of 1');
  });

  it('the hub shows the textbook badge, the assessment card and the extension label; reset clears only this chapter', async () => {
    const { ChapterHub } = await import('../ChapterHub');
    const { useEducationStore } = await import('../../../store/useEducationStore');
    useEducationStore.getState().markStepSeen('pm-l1', 's');
    useEducationStore.getState().markStepSeen('circles-l1', 'x');
    act(() => root.render(<MemoryRouter><ChapterHub chapter={CHAPTER} registry={{}} crumb="Test" subtitle="" labLabel="Lab" labBlurb="" /></MemoryRouter>));
    expect(q('[data-testid="chapter-badge"]')!.textContent).toBe('NCERT Exploration (Science, Class 9) · Chapter 4');
    expect(q('[data-testid="assessment-card"]')).not.toBeNull();
    expect(q('[data-testid="path-progress"]')!.textContent).toMatch(/of 1 lessons/); // the extension is not counted
    expect(host.textContent).toContain('Beyond Class 9 (optional)');
    click(q('[data-testid="reset-chapter"]'));
    click(q('[data-testid="reset-chapter-confirm"]'));
    expect(useEducationStore.getState().lessons['pm-l1']).toBeUndefined();
    expect(useEducationStore.getState().lessons['circles-l1']).toBeDefined();
  });
});
