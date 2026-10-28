import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLabEvent, assessmentReadiness, assessmentRevision, labTaskComplete, lessonStatus, requiredLabTasksMet, scoreAssessment, summarizePractice } from '../progress';
import { loadLearning, serialize, STORAGE_KEY_V1, STORAGE_KEY_V2, UNSCOPED, type ScopeResolver } from '../persistence';
import { importLegacyProgress, legacyFor, legacyPracticeRecords, summarizeLegacy } from '../legacy';
import type { ChapterAssessment, EduLesson, LabTask, LessonRecord } from '../types';

class MemoryStorage {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

const SCOPE: ScopeResolver = {
  lesson: (id) => (id.startsWith('pm-') ? 'motion' : id.startsWith('circles-') ? 'circles' : undefined),
  prereq: (id) => (id.startsWith('pmp-') ? 'motion' : undefined),
};

const rec = (over: Partial<LessonRecord> = {}): LessonRecord => ({ stepsSeen: ['a'], checks: {}, workedSeen: true, guided: {}, independent: {}, reflected: false, investigated: false, teacherDemo: false, updatedAt: 5, ...over });

describe('schema v2: namespacing, migration from v1, idempotency', () => {
  it('migrates version 1 records without changing them and leaves the version 1 key alone', () => {
    const v1 = { version: 1, lessons: { 'pm-l1': rec(), 'circles-l2': rec({ reflected: true }), 'mystery-l9': rec() }, readiness: { 'pmp-units': { status: 'passed', attempts: 1, correct: ['q'], missed: [], updatedAt: 1 } } };
    const store = new MemoryStorage();
    store.setItem(STORAGE_KEY_V1, JSON.stringify(v1));
    const r = loadLearning((k) => store.getItem(k), 'cbse-9-2026-27', 100);
    expect(r.source).toBe('v1');
    expect(Object.keys(r.state.lessons).sort()).toEqual(['circles-l2', 'mystery-l9', 'pm-l1']);
    expect(r.state.readiness['pmp-units'].status).toBe('passed');
    expect(r.state.migrations['edu-v1-to-v2'].at).toBe(100);
    const doc = serialize(r.state, 'cbse-9-2026-27', SCOPE, null);
    const chapters = doc.curricula['cbse-9-2026-27'].chapters;
    expect(Object.keys(chapters.motion.lessons)).toEqual(['pm-l1']);
    expect(Object.keys(chapters.circles.lessons)).toEqual(['circles-l2']);
    expect(Object.keys(chapters[UNSCOPED].lessons)).toEqual(['mystery-l9']); // unknown ids are kept, never dropped
    expect(chapters.motion.readiness['pmp-units'].status).toBe('passed');
    expect(store.getItem(STORAGE_KEY_V1)).toBe(JSON.stringify(v1));
  });

  it('is idempotent: load → save → load gives the same state, and v2 wins over v1 afterwards', () => {
    const store = new MemoryStorage();
    store.setItem(STORAGE_KEY_V1, JSON.stringify({ lessons: { 'pm-l1': rec() } }));
    const a = loadLearning((k) => store.getItem(k), 'c', 1);
    store.setItem(STORAGE_KEY_V2, JSON.stringify(serialize(a.state, 'c', SCOPE, null)));
    const b = loadLearning((k) => store.getItem(k), 'c', 2);
    expect(b.source).toBe('v2');
    expect(b.state.lessons).toEqual(a.state.lessons);
    store.setItem(STORAGE_KEY_V2, JSON.stringify(serialize(b.state, 'c', SCOPE, b.document)));
    const c = loadLearning((k) => store.getItem(k), 'c', 3);
    expect(c.state).toEqual(b.state);
    // Changing v1 after migration has no effect: the v1 key is a frozen backup.
    store.setItem(STORAGE_KEY_V1, JSON.stringify({ lessons: { 'pm-l9': rec() } }));
    expect(loadLearning((k) => store.getItem(k), 'c').state.lessons['pm-l9']).toBeUndefined();
  });

  it('keeps other curricula untouched when saving the active one', () => {
    const other = { version: 2, curricula: { 'cbse-9-2027-28': { chapters: { motion: { lessons: { 'pm-l1': rec({ reflected: true }) }, readiness: {}, practice: {}, assessments: [] } } } }, migrations: {} };
    const store = new MemoryStorage();
    store.setItem(STORAGE_KEY_V2, JSON.stringify(other));
    const r = loadLearning((k) => store.getItem(k), 'cbse-9-2026-27');
    expect(r.state.lessons).toEqual({});
    const doc = serialize(r.state, 'cbse-9-2026-27', SCOPE, r.document);
    expect(doc.curricula['cbse-9-2027-28'].chapters.motion.lessons['pm-l1'].reflected).toBe(true);
  });

  it('a version 0 boolean is never upgraded to unassisted success', () => {
    const store = new MemoryStorage();
    store.setItem(STORAGE_KEY_V1, JSON.stringify({ lessons: { 'pm-l1': { stepsSeen: [], independent: { i1: true } } } }));
    const r = loadLearning((k) => store.getItem(k), 'c');
    expect(r.state.lessons['pm-l1'].independent.i1).toMatchObject({ correct: true, firstAttemptUnassisted: false, assisted: true });
  });

  it('corrupt v2 is reported, and v1 is still read so nothing is lost', () => {
    const store = new MemoryStorage();
    store.setItem(STORAGE_KEY_V2, '{oops');
    store.setItem(STORAGE_KEY_V1, JSON.stringify({ lessons: { 'pm-l1': rec() } }));
    const r = loadLearning((k) => store.getItem(k), 'c');
    expect(r.source).toBe('corrupt-v2');
    expect(r.state.lessons['pm-l1']).toBeDefined();
  });
});

describe('the store on v2', () => {
  beforeEach(() => vi.stubGlobal('localStorage', new MemoryStorage()));
  const fresh = async () => { vi.resetModules(); return (await import('../../../store/useEducationStore')).useEducationStore; };

  it('imports v1 once, files lessons under their chapters and keeps a backup of an unreadable v2 document', async () => {
    localStorage.setItem(STORAGE_KEY_V1, JSON.stringify({ lessons: { 'pm-l1': rec(), 'circles-l3': rec() } }));
    const st = await fresh();
    expect(Object.keys(st.getState().lessons).sort()).toEqual(['circles-l3', 'pm-l1']);
    const doc = JSON.parse(localStorage.getItem(STORAGE_KEY_V2)!);
    expect(Object.keys(doc.curricula['cbse-9-2026-27'].chapters.motion.lessons)).toEqual(['pm-l1']);
    expect(Object.keys(doc.curricula['cbse-9-2026-27'].chapters.circles.lessons)).toEqual(['circles-l3']);
    localStorage.setItem(STORAGE_KEY_V2, 'garbage');
    await fresh();
    expect(localStorage.getItem(`${STORAGE_KEY_V2}_unreadable_backup`)).toBe('garbage');
  });

  it('chapter practice persists with the same first-attempt and help rules as lesson practice', async () => {
    const st = await fresh();
    st.getState().submitPractice('motion', 'q1', { correct: true });
    st.getState().recordPracticeHint('motion', 'q2');
    st.getState().submitPractice('motion', 'q2', { correct: true });
    st.getState().submitPractice('motion', 'q3', { correct: false, invalid: true });
    const again = await fresh();
    const p = again.getState().practice.motion;
    expect(p.q1.firstAttemptUnassisted).toBe(true);
    expect(p.q2).toMatchObject({ assisted: true, firstAttemptUnassisted: false });
    expect(p.q3).toBeUndefined();
    again.getState().retryPracticeAssisted('motion');
    expect(Object.keys(again.getState().practice.motion)).toEqual(['q1']);
  });

  it('teacher mode: chapter practice and assessments are recorded as demonstrations', async () => {
    const st = await fresh();
    st.getState().setTeacherMode(true);
    st.getState().submitPractice('motion', 'q1', { correct: true });
    st.getState().recordAssessmentAttempt('motion', { id: 'a', assessmentId: 'x', startedAt: 0, submittedAt: 1, answers: {}, score: 10, maxScore: 10 });
    expect(st.getState().practice.motion.q1.firstAttemptUnassisted).toBe(false);
    expect(st.getState().assessments.motion[0].demonstrated).toBe(true);
  });

  it('predictions keep the first commitment; lab events and observations persist', async () => {
    const task: LabTask = { id: 't', title: 'T', instruction: '', href: '/x', goals: [{ id: 'g', label: 'move twice', events: ['moved'], count: 2 }] };
    const st = await fresh();
    st.getState().recordPrediction('pm-l1', 'p1', 'a');
    st.getState().recordPrediction('pm-l1', 'p1', 'b');
    st.getState().recordLabEvent('pm-l1', 't', { name: 'moved' }, task);
    st.getState().recordLabEvent('pm-l1', 't', { name: 'moved' }, task);
    st.getState().addLabObservation('pm-l1', 't', { label: 'OA', value: '5 cm' });
    const again = await fresh();
    const r = again.getState().lessons['pm-l1'];
    expect(r.predictions?.p1.choiceId).toBe('a');
    expect(r.labTasks?.t.goalsMet).toEqual(['g']);
    expect(r.labTasks?.t.observations[0]).toMatchObject({ label: 'OA', value: '5 cm' });
  });

  it('resetChapter clears only that chapter and keeps imported earlier-version history', async () => {
    const st = await fresh();
    st.getState().markStepSeen('pm-l1', 's');
    st.getState().markStepSeen('circles-l1', 's');
    st.getState().bypassReadiness('pmp-units');
    st.getState().submitPractice('motion', 'q', { correct: true });
    st.getState().importLegacyChapter('circles', { sourceKey: 'k', importedAt: 1, raw: '{}', lessons: { a: { legacyLessonId: 'a', completedClaim: true, masteryClaim: 'none', teacherBypassed: false, practice: {}, interactions: 0, observations: 0 } } });
    st.getState().resetChapter('motion');
    expect(st.getState().lessons['pm-l1']).toBeUndefined();
    expect(st.getState().readiness['pmp-units']).toBeUndefined();
    expect(st.getState().practice.motion).toBeUndefined();
    expect(st.getState().lessons['circles-l1']).toBeDefined();
    st.getState().resetChapter('circles');
    expect(st.getState().legacy.circles.sourceKey).toBe('k');
  });

  it('importing the same legacy source twice changes nothing; practice records never overwrite newer ones', async () => {
    const st = await fresh();
    st.getState().submitPractice('circles', 'q_a', { correct: false });
    const imp = { sourceKey: 'labverse_circles_progress_v1', importedAt: 1, raw: '{}', lessons: {} };
    st.getState().importLegacyChapter('circles', imp, { q_a: { attempts: 1, firstAttemptUnassisted: true, correct: true, hintsUsed: 0, solutionShown: false, assisted: false, misconceptions: [] }, q_b: { attempts: 1, firstAttemptUnassisted: true, correct: true, hintsUsed: 0, solutionShown: false, assisted: false, misconceptions: [] } });
    expect(st.getState().practice.circles.q_a.firstAttemptUnassisted).toBe(false);
    expect(st.getState().practice.circles.q_b.firstAttemptUnassisted).toBe(true);
    st.getState().importLegacyChapter('circles', { ...imp, importedAt: 2 }, { q_c: st.getState().practice.circles.q_b });
    expect(st.getState().legacy.circles.importedAt).toBe(1);
    expect(st.getState().practice.circles.q_c).toBeUndefined();
  });
});

describe('legacy import', () => {
  const old = JSON.stringify({
    chapterId: 'circles-class-9', lastVisitedLessonId: 'circles-l4', completedLessonIds: ['circles-l1', 'circles-l2', 'circles-l12'],
    lessons: {
      'circles-l1': { completed: true, practiceMastered: true, practiceAnswered: { q1: { attempts: 1, correct: true, firstAttemptCorrect: true, assisted: false } }, predictionAnswer: 'equal', predictionCorrect: true, interactionsRecorded: 3, observationsCaptured: 2 },
      'circles-l2': { completed: true, practiceMastered: true },
      'circles-l3': { legacyMasteryUnverified: true, practiceMastered: false, teacherBypassed: true, practiceAnswered: { q9: { attempts: 2, correct: true, firstAttemptCorrect: false, assisted: true } } },
    },
  });
  const MAP = { 'circles-l1': 'circles-l1', 'circles-l2': 'circles-l2', 'circles-l3': 'circles-l3', 'circles-l12': null };

  it('separates completion claims and older mastery from verified mastery; maps only through the table', () => {
    const imp = importLegacyProgress(old, 'labverse_circles_progress_v1', MAP, {}, 9)!;
    expect(imp.lessons['circles-l1']).toMatchObject({ completedClaim: true, masteryClaim: 'old-rule', mappedLessonId: 'circles-l1', interactions: 3, observations: 2, prediction: { answer: 'equal', correct: true } });
    expect(imp.lessons['circles-l2'].masteryClaim).toBe('unverified'); // mastered flag without per-question evidence
    expect(imp.lessons['circles-l3']).toMatchObject({ masteryClaim: 'unverified', teacherBypassed: true });
    expect(imp.lessons['circles-l12'].mappedLessonId).toBeUndefined();
    expect(imp.raw).toBe(old);
    expect(summarizeLegacy(imp)).toMatchObject({ lessons: 4, completedClaims: 3, oldRuleMastery: 1, unverified: 2, unmapped: ['circles-l12'] });
    expect(legacyFor(imp, 'circles-l1')).toHaveLength(1);
  });

  it('never invents a mapping from look-alike ids', () => {
    const imp = importLegacyProgress(JSON.stringify({ lessons: { 'quad-l4': { completed: true } } }), 'k', {})!;
    expect(imp.lessons['quad-l4'].mappedLessonId).toBeUndefined();
  });

  it('preserves first-attempt and assisted evidence into chapter practice, without promoting anything', () => {
    const imp = importLegacyProgress(old, 'k', MAP)!;
    const recs = legacyPracticeRecords(imp, { q1: 'cp-q1', q9: 'cp-q9' });
    expect(recs['cp-q1']).toMatchObject({ firstAttemptUnassisted: true, assisted: false, correct: true });
    expect(recs['cp-q9']).toMatchObject({ firstAttemptUnassisted: false, assisted: true }); // teacher-bypassed lesson: assisted
  });

  it('missing, empty or corrupt older data imports nothing', () => {
    expect(importLegacyProgress(null, 'k', {})).toBeNull();
    expect(importLegacyProgress('{not json', 'k', {})).toBeNull();
    expect(importLegacyProgress('{"lessons":{}}', 'k', {})).toBeNull();
  });

  it('imported history never makes a current lesson mastered', () => {
    const lesson = { id: 'circles-l1', steps: [{ id: 'a' }], guided: { steps: [] }, independent: [{ id: 'i', topic: 't' }] } as unknown as EduLesson;
    expect(lessonStatus(lesson, undefined)).toBe('not_started');
  });
});

describe('lab tasks, chapter practice and assessment rules', () => {
  const task: LabTask = { id: 't1', title: 'Equal chords', instruction: '', href: '/lab', requiredForMastery: true, goals: [{ id: 'g1', label: 'Move a chord', events: ['chord-moved'], count: 2 }, { id: 'g2', label: 'Open the measure view', view: 'measure' }] };
  it('goals are met only by events and views, never by a button press', () => {
    let r = applyLabEvent(task, undefined, { name: 'chord-moved' });
    expect(labTaskComplete(task, r)).toBe(false);
    r = applyLabEvent(task, r, { name: 'chord-moved' });
    r = applyLabEvent(task, r, { name: 'view', view: 'measure' });
    expect(r.goalsMet).toEqual(['g1', 'g2']);
    expect(labTaskComplete(task, r)).toBe(true);
  });
  it('a required task blocks completion and mastery until it is done', () => {
    const lesson = { id: 'l', steps: [{ id: 's' }], worked: {}, guided: { steps: [] }, independent: [{ id: 'i', topic: 't' }], labTasks: [task] } as unknown as EduLesson;
    const base = rec({ stepsSeen: ['s'], independent: { i: { attempts: 1, firstAttemptUnassisted: true, correct: true, hintsUsed: 0, solutionShown: false, assisted: false, misconceptions: [] } } });
    expect(requiredLabTasksMet(lesson, base)).toBe(false);
    expect(lessonStatus(lesson, base)).toBe('in_progress');
    let t = applyLabEvent(task, undefined, { name: 'chord-moved' });
    t = applyLabEvent(task, t, { name: 'chord-moved' });
    t = applyLabEvent(task, t, { name: 'v', view: 'measure' });
    expect(lessonStatus(lesson, { ...base, labTasks: { t1: t } })).toBe('mastered');
  });
  it('practice summary counts unassisted first-try successes per group', () => {
    const set = { id: 's', title: 'S', groups: [{ id: 'g', title: 'G', blurb: '', items: [{ id: 'a' }, { id: 'b' }] }] } as never;
    const s = summarizePractice(set, { a: { attempts: 1, firstAttemptUnassisted: true, correct: true, hintsUsed: 0, solutionShown: false, assisted: false, misconceptions: [] } });
    expect(s).toMatchObject({ total: 2, attempted: 1, unassisted: 1, byGroup: { g: { total: 2, unassisted: 1 } } });
  });
  it('assessment scoring, readiness and revision; demonstrations never count', () => {
    const a: ChapterAssessment = { id: 'A', title: '', instructions: '', sections: [{ id: 's', title: '', items: [
      { id: 'x', topic: 'Speed', lessonId: 'pm-l3', competency: 'knowledge', marks: 2, prompt: '', question: {} as never, solution: [] },
      { id: 'y', topic: 'Graphs', lessonId: 'pm-l6', competency: 'analysis', marks: 3, prompt: '', question: {} as never, solution: [] },
    ] }] };
    const sc = scoreAssessment(a, { x: { correct: true }, y: { correct: false, misconception: 'slope' } });
    expect(sc).toMatchObject({ score: 2, maxScore: 5 });
    const attempt = { id: '1', assessmentId: 'A', startedAt: 0, submittedAt: 1, demonstrated: false, ...sc };
    expect(assessmentReadiness(a, [attempt])).toBe('review');
    expect(assessmentRevision(a, attempt)).toEqual([{ topic: 'Graphs', lessonId: 'pm-l6', misconceptions: ['slope'] }]);
    expect(assessmentReadiness(a, [{ ...attempt, score: 5, demonstrated: true }])).toBe('demonstrated');
    expect(assessmentReadiness(a, [{ ...attempt, score: 4 }])).toBe('ready');
  });
});
