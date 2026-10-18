/**
 * Curriculum coverage matrix for NCERT Class 9 Ganita Manjari Part II,
 * Chapter 13: Two Variables, One Line.
 *
 * Verification honesty: only the chapter title and the headings
 * "13.1 Linear Equations in Two Variables" / "13.1.1 Standard Form of Linear
 * Equations in Two Variables" could be confirmed from the textbook preview.
 * The remaining topic list comes from secondary summaries of the chapter and
 * from the task brief, so those rows are marked accordingly. No official
 * exercise numbers or page references are claimed anywhere in LabVerse.
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
  { topic: 'Ordered-pair solutions', source: 'secondary_summary', lessonIds: ['tv-l3'], practiceTopics: ['check_solution'], labFeature: 'Solution checker' },
  { topic: 'Infinitely many solutions of one equation', source: 'secondary_summary', lessonIds: ['tv-l3', 'tv-l13'], practiceTopics: ['solution_table'], labFeature: 'Solution table, guided investigation' },
  { topic: 'Solution tables', source: 'secondary_summary', lessonIds: ['tv-l1', 'tv-l3', 'tv-l4'], practiceTopics: ['solution_table'], labFeature: 'Solution table' },
  { topic: 'Plotting solutions on the coordinate plane', source: 'secondary_summary', lessonIds: ['tv-l4'], practiceTopics: ['plot_line'], labFeature: 'Graph canvas' },
  { topic: 'Graphs are straight lines', source: 'secondary_summary', lessonIds: ['tv-l5'], practiceTopics: ['graph_reading'], labFeature: 'Constrained draggable point' },
  { topic: 'Horizontal and vertical lines', source: 'task_brief', lessonIds: ['tv-l6'], practiceTopics: ['special_lines'], labFeature: 'Vertical/horizontal handling' },
  { topic: 'Slope and slope-intercept form', source: 'secondary_summary', lessonIds: ['tv-l6'], practiceTopics: ['slope', 'intercepts'], labFeature: 'Slope and intercept display' },
  { topic: 'Linear equations from real-world problems', source: 'secondary_summary', lessonIds: ['tv-l12'], practiceTopics: ['word_problem'], labFeature: 'Real-world model preset' },
  { topic: 'Pairs of linear equations', source: 'secondary_summary', lessonIds: ['tv-l7'], practiceTopics: ['graphical_intersection'], labFeature: 'Two-Line System Explorer' },
  { topic: 'Graphical intersection', source: 'secondary_summary', lessonIds: ['tv-l8'], practiceTopics: ['graphical_intersection'], labFeature: 'Intersection marker with substitution check' },
  { topic: 'Unique, no and infinitely many solutions', source: 'secondary_summary', lessonIds: ['tv-l9'], practiceTopics: ['system_classification'], labFeature: 'Determinant classification' },
  { topic: 'Substitution method', source: 'secondary_summary', lessonIds: ['tv-l10'], practiceTopics: ['substitution'], labFeature: 'Substitution laboratory' },
  { topic: 'Elimination method', source: 'secondary_summary', lessonIds: ['tv-l11'], practiceTopics: ['elimination'], labFeature: 'Elimination laboratory' },
  { topic: 'Word problems', source: 'secondary_summary', lessonIds: ['tv-l12', 'tv-l14'], practiceTopics: ['word_problem'], labFeature: 'Chapter Practice' },
];
