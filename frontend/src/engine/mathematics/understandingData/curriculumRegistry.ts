/**
 * Curriculum coverage registry for NCERT Class 9 Ganita Manjari Part II,
 * Chapter 10: How Quantities Combine: Understanding Data.
 *
 * Evidence levels
 *  - verified_textbook : confirmed by reading the chapter text published by NCERT
 *                        (https://ncert.nic.in/textbook/pdf/iemh202.pdf, 29 pages).
 *  - secondary_reference: described by third-party study sites only.
 *  - labverse_extension : added by LabVerse; not in the textbook.
 *
 * Section and example numbers below were read from that text. LabVerse does
 * not reproduce the textbook's questions or official solutions, and every
 * LabVerse question uses original numbers.
 */

export type EvidenceLevel = 'verified_textbook' | 'secondary_reference' | 'labverse_extension';
export type CoverageStatus = 'covered' | 'partial' | 'not_covered';

export interface CoverageRow {
  topic: string;
  evidence: EvidenceLevel;
  /** Where in the chapter (only for verified_textbook). */
  textbookRef?: string;
  status: CoverageStatus;
  lessonIds: string[];
  labFeature: string;
  note?: string;
}

export const UD_COVERAGE: CoverageRow[] = [
  { topic: 'An average of averages is not the average of everything', evidence: 'verified_textbook', textbookRef: '§10.1.1 Average of Averages, Example 1', status: 'covered', lessonIds: ['ud-l1'], labFeature: 'Weighted Average Explorer: plain vs true average' },
  { topic: 'Combined mean = (an + bm) ÷ (n + m)', evidence: 'verified_textbook', textbookRef: '§10.1.1 (generalisation after Example 1)', status: 'covered', lessonIds: ['ud-l1', 'ud-l3'], labFeature: 'Calculation panel with exact steps' },
  { topic: 'Equal group sizes: plain average of averages works', evidence: 'verified_textbook', textbookRef: '§10.1.1, Example 2 (cycling)', status: 'covered', lessonIds: ['ud-l2'], labFeature: 'Explorer with equal-size groups' },
  { topic: 'Mixtures and concentration', evidence: 'verified_textbook', textbookRef: '§10.1.2 Mixtures, Examples 3–4', status: 'covered', lessonIds: ['ud-l4'], labFeature: 'Mixture Laboratory with beaker' },
  { topic: 'Unknown quantity in a mixture', evidence: 'verified_textbook', textbookRef: '§10.1.2, Example 5', status: 'covered', lessonIds: ['ud-l4', 'ud-l13'], labFeature: 'Practice: unknown batch, dilution' },
  { topic: 'Weighted mean formula Σwx ÷ Σw', evidence: 'verified_textbook', textbookRef: '§10.1.2 (formula and Brahmagupta note)', status: 'covered', lessonIds: ['ud-l3'], labFeature: 'Weighted Average Explorer' },
  { topic: 'Custom importance weights (ratios such as 3 : 2 : 5)', evidence: 'verified_textbook', textbookRef: '§10.1.3 Custom Weights, Example 6', status: 'covered', lessonIds: ['ud-l5'], labFeature: 'Explorer in importance mode' },
  { topic: 'Ratings of a hotel or product', evidence: 'verified_textbook', textbookRef: '§10.1.3 (rating situations after Exercise Set 10.2)', status: 'covered', lessonIds: ['ud-l5'], labFeature: 'Ratings preset and practice' },
  { topic: 'Mean after adding or removing a value', evidence: 'verified_textbook', textbookRef: 'Chapter Summary; Exercise Set 10.3 themes', status: 'covered', lessonIds: ['ud-l6'], labFeature: 'Practice questions; weighted-mean engine' },
  { topic: 'Effect of doubling or shifting all weights', evidence: 'verified_textbook', textbookRef: 'End-of-chapter exercises (scaling and starred shifting questions)', status: 'covered', lessonIds: ['ud-l6'], labFeature: 'Scale and Shift weight buttons' },
  { topic: 'Stacked bar charts versus cluster charts', evidence: 'verified_textbook', textbookRef: '§10.2.1 Stacking Columns', status: 'partial', lessonIds: ['ud-l7'], labFeature: 'Stacked Bar Explorer', note: 'Interactive cluster-column charts are not built; only stacked bars are.' },
  { topic: 'Totals and components in stacked bars', evidence: 'verified_textbook', textbookRef: '§10.2.1; Exercise Set 10.4 themes', status: 'covered', lessonIds: ['ud-l7', 'ud-l8'], labFeature: 'Editable stacked chart' },
  { topic: '100% stacked bar charts', evidence: 'verified_textbook', textbookRef: '§10.2.2 An Alternative to Pie Chart', status: 'covered', lessonIds: ['ud-l9'], labFeature: '100% Stacked Chart Explorer' },
  { topic: 'Pie charts as proportion displays', evidence: 'verified_textbook', textbookRef: '§10.2.2 (Fig. 10.3)', status: 'not_covered', lessonIds: [], labFeature: '—', note: 'Pie charts are mentioned only for comparison; LabVerse does not draw them.' },
  { topic: 'What a 100% chart can and cannot tell you', evidence: 'verified_textbook', textbookRef: '§10.2.2 Example 8 (What Can We Infer?)', status: 'covered', lessonIds: ['ud-l10', 'ud-l12'], labFeature: 'Two datasets for one 100% chart; challenges' },
  { topic: 'A 100% chart can be made from a stacked chart, not the reverse', evidence: 'verified_textbook', textbookRef: 'Chapter Summary', status: 'covered', lessonIds: ['ud-l9', 'ud-l11'], labFeature: 'Chart comparison panel; practice' },
  { topic: 'Choosing a suitable representation', evidence: 'verified_textbook', textbookRef: 'End-of-chapter exercises (choosing stacked or 100% stacked)', status: 'covered', lessonIds: ['ud-l11'], labFeature: 'Chart interpretation challenges' },
  { topic: 'Averages of diverse data can hide differences', evidence: 'verified_textbook', textbookRef: '§10.2.2 Example 9 (A Typical Day)', status: 'partial', lessonIds: ['ud-l12'], labFeature: 'Age-group time-use preset', note: 'Covered through the age-group chart; there is no separate "typical day" activity.' },
  { topic: 'Gold purity (varṇa) as a weighted mean', evidence: 'verified_textbook', textbookRef: '§10.1.2 (Śrīdharācārya note); Exercise Set 10.1', status: 'partial', lessonIds: ['ud-l4'], labFeature: 'Mixture model on a mass basis', note: 'Handled by the general mixture model; no varṇa-specific tool.' },
  { topic: 'Mixture assumptions: additive quantities, consistent basis', evidence: 'labverse_extension', status: 'covered', lessonIds: ['ud-l4'], labFeature: 'Assumptions panel; rejects volume + mass mixing' },
  { topic: 'Estimates from rounded group means', evidence: 'labverse_extension', status: 'covered', lessonIds: ['ud-l1'], labFeature: 'Results labelled as estimates' },
  { topic: 'Exact rational arithmetic; honest rounding of percentages', evidence: 'labverse_extension', status: 'covered', lessonIds: ['ud-l9'], labFeature: 'Rounding note; no-data state for empty groups' },
  { topic: 'CSV import and export of chart data', evidence: 'labverse_extension', status: 'covered', lessonIds: [], labFeature: 'Free Data Laboratory' },
  { topic: 'Mean, median and mode', evidence: 'secondary_reference', status: 'not_covered', lessonIds: [], labFeature: '—', note: 'The chapter builds on earlier-grade averages and does not teach median or mode, so M6 does not either.' },
];

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  verified_textbook: 'Verified in textbook',
  secondary_reference: 'Secondary reference',
  labverse_extension: 'LabVerse extension',
};
