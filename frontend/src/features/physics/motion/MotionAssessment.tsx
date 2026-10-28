/**
 * Chapter assessment page (/physics/motion/assessment), built with the shared chapter pages. Feedback appears only after submission,
 * and the attempt is saved as chapter assessment evidence; it never changes lesson mastery.
 */

import { makeChapterPages } from '../../education/chapterPages';
import { MOTION_CHAPTER } from '../../../engine/physics/motion/learn/content';

const PAGES = makeChapterPages(MOTION_CHAPTER, {}, { crumb: 'Physics', subtitle: '', labs: [] });
export const MotionAssessmentPage = PAGES.Assessment;
