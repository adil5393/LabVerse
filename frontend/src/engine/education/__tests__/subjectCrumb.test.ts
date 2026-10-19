import { describe, expect, it } from 'vitest';
import { subjectCrumb } from '../subjects';
import { MOTION_CHAPTER } from '../../physics/motion/learn/content';
import { CIRCLES_CHAPTER } from '../../mathematics/circles/learn/content';
import lessonPage from '../../../features/education/LearnLessonPage.tsx?raw';

describe('subject-aware lesson breadcrumbs', () => {
  it('Physics chapters start with Physics linking to /physics', () => { expect(subjectCrumb(MOTION_CHAPTER)).toEqual({ label: 'Physics', href: '/physics' }); });
  it('Mathematics chapters keep Mathematics linking to /mathematics', () => { expect(subjectCrumb(CIRCLES_CHAPTER)).toEqual({ label: 'Mathematics', href: '/mathematics' }); });
  it('Chemistry would get its own subject, and the page has no hardcoded subject label', () => {
    expect(subjectCrumb({ subject: 'chemistry' })).toEqual({ label: 'Chemistry', href: '/chemistry' });
    expect(lessonPage).not.toContain('>Mathematics</Link>');
  });
});
