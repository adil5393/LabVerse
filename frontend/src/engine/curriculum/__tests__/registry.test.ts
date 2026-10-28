import { describe, expect, it } from 'vitest';
import { ACTIVE_CURRICULUM, chapterById, chapterOfLesson, chapterOfPrerequisite, chaptersFor, subjectSummary } from '..';
import type { EduChapter } from '../../education/types';
import { BUILT_CHAPTERS } from './builtChapters';

const C = ACTIVE_CURRICULUM;

describe('curriculum registry: CBSE Class 9 2026-27', () => {
  it('lists every NCERT Exploration chapter 1 to 13 exactly once, with the printed titles', () => {
    const sci = C.chapters.filter((c) => c.textbook === 'ncert-exploration-9').sort((a, b) => a.number! - b.number!);
    expect(sci.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(sci.map((c) => c.title)).toEqual([
      'Exploration: Entering the World of Secondary Science', 'Cell: The Building Block of Life', 'Tissues in Action',
      'Describing Motion Around Us', 'Exploring Mixtures and their Separation', 'How Forces Affect Motion',
      'Work, Energy, and Simple Machines', 'Journey Inside the Atom', 'Atomic Foundations of Matter',
      'Sound Waves: Characteristics and Applications', 'Reproduction: How Life Continues',
      'Patterns in Life: Diversity and Classification', 'Earth as a System: Energy, Matter, and Life',
    ]);
  });

  it('lists every Ganita Manjari chapter 1 to 14 exactly once (Part I 1-8, Part II 9-14)', () => {
    const m = C.chapters.filter((c) => c.textbook?.startsWith('ncert-ganita')).sort((a, b) => a.number! - b.number!);
    expect(m.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(m.filter((c) => c.textbook === 'ncert-ganita-manjari-9-1').map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('maps Science chapters to the CBSE units exactly as the course structure does', () => {
    const unit = (u: string) => C.chapters.filter((c) => c.boardUnit === u).map((c) => c.number).sort((a, b) => a! - b!);
    expect(unit('I World of Living')).toEqual([2, 3, 11, 12]);
    expect(unit('II Matter - Its Nature and Behaviour')).toEqual([5, 8, 9]);
    expect(unit('III Motion, Force, Work and Sound')).toEqual([4, 6, 7, 10]);
    expect(unit('IV Earth as a System')).toEqual([13]);
  });

  it('shows no Science chapter only under "Integrated Science" unless it is genuinely cross-disciplinary', () => {
    const integrated = chaptersFor('integrated-science').map((c) => c.number);
    expect(integrated).toEqual([1, 13]);
    for (const c of chaptersFor('integrated-science')) expect(c.connects?.length).toBeGreaterThanOrEqual(2);
  });

  it('has unique chapter ids and non-overlapping progress prefixes', () => {
    const ids = C.chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const prefixes = C.chapters.flatMap((c) => [...(c.scope?.lessonPrefixes ?? []), ...(c.scope?.prereqPrefixes ?? [])].map((p) => [p, c.id] as const));
    for (const [p, owner] of prefixes) {
      for (const [q, other] of prefixes) {
        if (owner === other && p === q) continue;
        // No prefix may be a prefix of another chapter's prefix, or ids could be filed under the wrong chapter.
        if (owner !== other) expect(q.startsWith(p), `${p} (${owner}) vs ${q} (${other})`).toBe(false);
      }
    }
  });

  it('every built chapter: id is registered, counts match the content, and every lesson and prerequisite id files under it', () => {
    const allLessonIds: string[] = [];
    for (const ch of BUILT_CHAPTERS as EduChapter[]) {
      const reg = chapterById(ch.id);
      expect(reg, ch.id).toBeDefined();
      expect(Object.keys(ch.lessons).length, `${ch.id} lesson count`).toBe(reg!.implementation.lessons);
      for (const id of Object.keys(ch.lessons)) {
        expect(chapterOfLesson(id), `lesson ${id}`).toBe(ch.id);
        allLessonIds.push(id);
      }
      for (const id of Object.keys(ch.prerequisites)) expect(chapterOfPrerequisite(id), `prerequisite ${id}`).toBe(ch.id);
      expect(reg!.implementation.status === 'not-started').toBe(false);
      expect(reg!.route ?? ch.routes.landing).toBe(ch.routes.landing);
    }
    expect(new Set(allLessonIds).size).toBe(allLessonIds.length);
  });

  it('no chapter claims to be complete without lessons, practice and an assessment', () => {
    for (const c of C.chapters) {
      if (c.implementation.status !== 'complete') continue;
      expect(c.implementation.lessons, c.id).toBe(c.implementation.plannedLessons);
      expect(c.implementation.practice && c.implementation.assessment, c.id).toBe(true);
    }
  });

  it('a chapter with no content is "not-started" and has no route', () => {
    const built = new Set((BUILT_CHAPTERS as EduChapter[]).map((c) => c.id));
    for (const c of C.chapters) {
      if (built.has(c.id)) continue;
      expect(c.implementation.status, c.id).toBe('not-started');
      expect(c.implementation.lessons, c.id).toBe(0);
    }
  });

  it('subject summaries add up', () => {
    const s = subjectSummary('physics');
    expect(s.chapters).toBe(4);
    expect(s.complete + s.partial + s.notStarted).toBe(s.chapters);
    expect(subjectSummary('biology').chapters).toBe(4);
    expect(subjectSummary('chemistry').chapters).toBe(3);
  });

  it('records the official sources and the known contradictions', () => {
    expect(C.sources.some((s) => s.url.includes('ScienceSt_SecP1_2026-27'))).toBe(true);
    expect(C.contradictions.map((x) => x.id)).toContain('maths-geometry-chapters');
    expect(C.chapters.filter((c) => c.source === 'cbse-only').map((c) => c.id)).toEqual(['euclid-geometry', 'lines-angles', 'triangles-congruence']);
  });
});
