/**
 * Chapter assessment page (/physics/work/assessment), built with the shared chapter pages. Feedback appears only after submission,
 * and the attempt is saved as chapter assessment evidence; it never changes lesson mastery.
 */

import { makeChapterPages } from '../../education/chapterPages';
import { WORK_CHAPTER } from '../../../engine/physics/work/learn/content';

const PAGES = makeChapterPages(WORK_CHAPTER, {}, { crumb: 'Physics', subtitle: '', labs: [] });
export const WorkAssessmentPage = PAGES.Assessment;
