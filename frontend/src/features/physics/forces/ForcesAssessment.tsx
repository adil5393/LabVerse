/**
 * Chapter assessment page (/physics/forces/assessment), built with the shared chapter pages. Feedback appears only after submission,
 * and the attempt is saved as chapter assessment evidence; it never changes lesson mastery.
 */

import { makeChapterPages } from '../../education/chapterPages';
import { FORCES_CHAPTER } from '../../../engine/physics/forces/learn/content';

const PAGES = makeChapterPages(FORCES_CHAPTER, {}, { crumb: 'Physics', subtitle: '', labs: [] });
export const ForcesAssessmentPage = PAGES.Assessment;
