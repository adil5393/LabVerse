/**
 * Curriculum coverage matrix for NCERT Class 9 Ganita Manjari Part II,
 * Chapter 13: Two Variables, One Line.
 *
 * Verification (EDU-1M5): checked against the chapter PDF. The chapter has
 * 13.1 Linear equations in two variables (13.1.1 Standard form), 13.2 Solution
 * of a linear equation (13.2.1 Algebraic meaning, 13.2.2 Geometric
 * visualisation), 13.3 Slope-intercept form (13.3.1, 13.3.2), 13.4 Pair of
 * linear equations, 13.5 Finding solutions (13.5.1 Algebraic methods:
 * substitution and elimination) and 13.6 Graphical method. Rows marked
 * 'textbook_heading' are confirmed there; 'task_brief' rows go beyond the
 * headings. No exercise numbers are claimed anywhere in LabVerse.
 */

import type { PracticeTopic } from './types';

export type VerificationSource = 'textbook_heading' | 'secondary_summary' | 'task_brief';

export interface CoverageRow {
  topic: string;
  source: VerificationSource;
  lessonIds: string[];
  practiceTopics: PracticeTopic[];
  labFeature: string;
}

export const TV_COVERAGE_MATRIX: CoverageRow[] = [
  { topic: 'Linear equations in two variables', source: 'textbook_heading', lessonIds: ['tv-l1', 'tv-l2'], practiceTopics: ['identify_linear'], labFeature: 'Equation editor and table' },
  { topic: 'Standard form ax + by + c = 0', source: 'textbook_heading', lessonIds: ['tv-l2'], practiceTopics: ['standard_form'], labFeature: 'a, b, c controls' },
  { topic: 'Ordered-pair solutions', source: 'textbook_heading', lessonIds: ['tv-l3'], practiceTopics: ['check_solution'], labFeature: 'Solution checker' },
  { topic: 'Infinitely many solutions of one equation', source: 'textbook_heading', lessonIds: ['tv-l3', 'tv-l13'], practiceTopics: ['solution_table'], labFeature: 'Solution table, guided investigation' },
  { topic: 'Solution tables', source: 'secondary_summary', lessonIds: ['tv-l1', 'tv-l3', 'tv-l4'], practiceTopics: ['solution_table'], labFeature: 'Solution table' },
  { topic: 'Plotting solutions on the coordinate plane', source: 'textbook_heading', lessonIds: ['tv-l4'], practiceTopics: ['plot_line'], labFeature: 'Graph canvas' },
  { topic: 'Graphs are straight lines', source: 'textbook_heading', lessonIds: ['tv-l5'], practiceTopics: ['graph_reading'], labFeature: 'Constrained draggable point' },
  { topic: 'Horizontal and vertical lines', source: 'task_brief', lessonIds: ['tv-l6'], practiceTopics: ['special_lines'], labFeature: 'Vertical/horizontal handling' },
  { topic: 'Slope and slope-intercept form', source: 'textbook_heading', lessonIds: ['tv-l6'], practiceTopics: ['slope', 'intercepts'], labFeature: 'Slope and intercept display' },
  { topic: 'Linear equations from real-world problems', source: 'textbook_heading', lessonIds: ['tv-l12'], practiceTopics: ['word_problem'], labFeature: 'Real-world model preset' },
  { topic: 'Pairs of linear equations', source: 'textbook_heading', lessonIds: ['tv-l7'], practiceTopics: ['graphical_intersection'], labFeature: 'Two-Line System Explorer' },
  { topic: 'Graphical intersection', source: 'textbook_heading', lessonIds: ['tv-l8'], practiceTopics: ['graphical_intersection'], labFeature: 'Intersection marker with substitution check' },
  { topic: 'Unique, no and infinitely many solutions', source: 'textbook_heading', lessonIds: ['tv-l9'], practiceTopics: ['system_classification'], labFeature: 'Determinant classification' },
  { topic: 'Substitution method', source: 'textbook_heading', lessonIds: ['tv-l10'], practiceTopics: ['substitution'], labFeature: 'Substitution laboratory' },
  { topic: 'Elimination method', source: 'textbook_heading', lessonIds: ['tv-l11'], practiceTopics: ['elimination'], labFeature: 'Elimination laboratory' },
  { topic: 'Word problems', source: 'textbook_heading', lessonIds: ['tv-l12', 'tv-l14'], practiceTopics: ['word_problem'], labFeature: 'Chapter Practice' },
];
