/**
 * Chart Interpretation Challenges (M6).
 * Generated from the dataset currently on screen, so the question, the chart
 * and the feedback can never disagree. Answers are computed from the numbers,
 * never from bar positions. Challenges that would be ambiguous (ties) are
 * simply not generated.
 */

import {
  type ChartDataset,
  type ChartMode,
  groupTotal,
  cell,
  largestGroupTotal,
  largestSegmentInGroup,
  largestShareInCategory,
  largestAbsoluteInCategory,
  inferenceVerdict,
} from './charts';
import { formatDecimal, mul, div, HUNDRED } from './rational';

export type ChallengeAnswer =
  | { kind: 'bar'; groupId: string }
  | { kind: 'segment'; groupId: string; categoryId: string }
  | { kind: 'choice'; index: number };

export interface ChartChallenge {
  id: string;
  prompt: string;
  /** Only meaningful in this chart mode (some questions are about what a 100% chart hides). */
  mode: ChartMode | 'any';
  input: 'bar' | 'segment' | 'choice';
  options?: string[];
  answer: ChallengeAnswer;
  /** Feedback built from the dataset's own numbers. */
  explanation: string;
  /** Separates absolute and proportion reasoning for the student. */
  concept: 'absolute' | 'proportion' | 'chart_choice';
}

const fmt = (x: Parameters<typeof formatDecimal>[0]) => formatDecimal(x, 2);

export function buildChallenges(ds: ChartDataset): ChartChallenge[] {
  const out: ChartChallenge[] = [];
  const label = (id: string) => ds.groups.find((g) => g.id === id)?.label ?? id;
  const catLabel = (id: string) => ds.categories.find((c) => c.id === id)?.label ?? id;
  if (ds.groups.length < 2 || ds.categories.length < 2) return out;

  const lg = largestGroupTotal(ds);
  if (lg && !lg.tied) {
    out.push({
      id: 'largest-total',
      prompt: 'Which group has the largest TOTAL? Tap its bar.',
      mode: 'any',
      input: 'bar',
      answer: { kind: 'bar', groupId: lg.ids[0] },
      concept: 'absolute',
      explanation: `${label(lg.ids[0])} has the largest total: ${fmt(lg.value)} ${ds.unit}. Totals: ${ds.groups.map((g) => `${g.label} ${fmt(groupTotal(ds, g.id))}`).join(', ')}.`,
    });
  }

  const g0 = ds.groups.find((g) => {
    const m = largestSegmentInGroup(ds, g.id);
    return !!m && !m.tied && m.value.n > 0n;
  });
  if (g0) {
    const m = largestSegmentInGroup(ds, g0.id)!;
    out.push({
      id: `largest-segment-${g0.id}`,
      prompt: `In ${g0.label}, which category contributes the most? Tap that segment.`,
      mode: 'any',
      input: 'segment',
      answer: { kind: 'segment', groupId: g0.id, categoryId: m.ids[0] },
      concept: 'proportion',
      explanation: `In ${g0.label}, ${catLabel(m.ids[0])} is largest: ${fmt(m.value)} of ${fmt(groupTotal(ds, g0.id))} ${ds.unit} (${fmt(mul(div(m.value, groupTotal(ds, g0.id)), HUNDRED))}%).`,
    });
  }

  for (const c of ds.categories) {
    const share = largestShareInCategory(ds, c.id);
    const abs = largestAbsoluteInCategory(ds, c.id);
    if (!share || !abs || share.tied || abs.tied) continue;
    out.push({
      id: `largest-share-${c.id}`,
      prompt: `Which group has the largest PERCENTAGE share of ${c.label}? Tap its ${c.label} segment.`,
      mode: 'any',
      input: 'segment',
      answer: { kind: 'segment', groupId: share.ids[0], categoryId: c.id },
      concept: 'proportion',
      explanation: `${label(share.ids[0])} devotes ${fmt(share.value)}% to ${c.label}. ${share.ids[0] === abs.ids[0] ? `It also has the most in actual amount (${fmt(cell(ds, abs.ids[0], c.id)!)} ${ds.unit}).` : `But the largest ACTUAL amount of ${c.label} is in ${label(abs.ids[0])} (${fmt(cell(ds, abs.ids[0], c.id)!)} ${ds.unit}). A larger percentage is not a larger amount.`}`,
    });
    break; // one such question per dataset is enough; the prompt varies by dataset
  }

  const v1 = inferenceVerdict('actual_counts_from_percent');
  out.push({
    id: 'counts-from-percent',
    prompt: 'Using ONLY a 100% stacked chart, can you work out the actual counts?',
    mode: 'percent',
    input: 'choice',
    options: ['Yes, the segment lengths give the counts', 'No, the totals are hidden'],
    answer: { kind: 'choice', index: 1 },
    concept: 'proportion',
    explanation: `${v1.reason} Here the totals are ${ds.groups.map((g) => `${g.label}: ${fmt(groupTotal(ds, g.id))}`).join(', ')}, but the 100% bars do not show them.`,
  });

  const v2 = inferenceVerdict('equal_percent_means_equal_quantity');
  out.push({
    id: 'equal-percent',
    prompt: 'If two groups show the same percentage for a category, do they have the same quantity?',
    mode: 'any',
    input: 'choice',
    options: ['Yes, the same percentage means the same quantity', 'No, it depends on each group’s total'],
    answer: { kind: 'choice', index: 1 },
    concept: 'proportion',
    explanation: v2.reason,
  });

  out.push({
    id: 'choose-chart',
    prompt: 'You want to compare how big each group is AND what it is made of. Which chart fits?',
    mode: 'any',
    input: 'choice',
    options: ['100% stacked bar chart', 'Stacked bar chart of actual values'],
    answer: { kind: 'choice', index: 1 },
    concept: 'chart_choice',
    explanation: 'A stacked chart keeps the totals (bar lengths) and the parts. A 100% chart gives every bar the same length, so the totals disappear.',
  });
  return out;
}
