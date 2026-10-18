/**
 * Stacked and 100% stacked bar chart model (M6).
 *
 * ONE authoritative raw dataset drives both chart types. Percentages are
 * always recomputed from the raw values and never stored back, so switching
 * chart type cannot corrupt the data.
 */

import {
  type Q,
  ZERO,
  HUNDRED,
  add,
  mul,
  div,
  eq,
  cmp,
  isNeg,
  isZero,
  sum,
  q,
  parseQ,
  toNumber,
  formatDecimal,
  formatExact,
  floorQ,
} from './rational';

export interface ChartGroup {
  id: string;
  label: string;
}
export interface ChartCategory {
  id: string;
  label: string;
}

export interface ChartDataset {
  title: string;
  /** What the numbers count or measure, e.g. "students", "₹", "kWh". */
  unit: string;
  groups: ChartGroup[];
  categories: ChartCategory[];
  /** values[groupId][categoryId]; null means the cell is MISSING (not zero). */
  values: Record<string, Record<string, Q | null>>;
}

export const MAX_GROUPS = 12;
export const MAX_CATEGORIES = 8;

export type ChartMode = 'absolute' | 'percent';

export function makeDataset(
  title: string,
  unit: string,
  categories: string[],
  rows: { label: string; values: (number | null)[] }[]
): ChartDataset {
  const cats = categories.map((label, i) => ({ id: `c${i + 1}`, label }));
  const groups = rows.map((r, i) => ({ id: `g${i + 1}`, label: r.label }));
  const values: ChartDataset['values'] = {};
  rows.forEach((r, gi) => {
    values[groups[gi].id] = {};
    cats.forEach((c, ci) => {
      const v = r.values[ci];
      values[groups[gi].id][c.id] = v === null || v === undefined ? null : q(v);
    });
  });
  return { title, unit, groups, categories: cats, values };
}

export const cell = (ds: ChartDataset, g: string, c: string): Q | null => ds.values[g]?.[c] ?? null;

export interface DatasetIssue {
  code: 'no_groups' | 'no_categories' | 'negative_value' | 'duplicate_label';
  message: string;
  groupId?: string;
  categoryId?: string;
}

/** Stacked bars need non-negative parts; missing cells are allowed but reported separately. */
export function validateDataset(ds: ChartDataset): DatasetIssue[] {
  const issues: DatasetIssue[] = [];
  if (ds.groups.length === 0) issues.push({ code: 'no_groups', message: 'Add at least one group (bar).' });
  if (ds.categories.length === 0) issues.push({ code: 'no_categories', message: 'Add at least one category (segment).' });
  for (const g of ds.groups) {
    for (const c of ds.categories) {
      const v = cell(ds, g.id, c.id);
      if (v && isNeg(v)) {
        issues.push({ code: 'negative_value', groupId: g.id, categoryId: c.id, message: `${g.label} / ${c.label} is negative. A stacked bar cannot show a negative part; enter 0 or more.` });
      }
    }
  }
  const dup = (labels: string[]) => labels.find((l, i) => labels.indexOf(l) !== i);
  const dg = dup(ds.groups.map((g) => g.label.trim().toLowerCase()));
  if (dg !== undefined) issues.push({ code: 'duplicate_label', message: `Two groups are both called “${dg}”. Give each group its own name.` });
  const dc = dup(ds.categories.map((c) => c.label.trim().toLowerCase()));
  if (dc !== undefined) issues.push({ code: 'duplicate_label', message: `Two categories are both called “${dc}”. Give each category its own name.` });
  return issues;
}

export const missingCells = (ds: ChartDataset): { groupId: string; categoryId: string }[] =>
  ds.groups.flatMap((g) => ds.categories.filter((c) => cell(ds, g.id, c.id) === null).map((c) => ({ groupId: g.id, categoryId: c.id })));

const positive = (v: Q | null): Q => (v && !isNeg(v) ? v : ZERO);

/** Total of a group. Missing and negative cells contribute 0 (negatives are reported by validateDataset). */
export const groupTotal = (ds: ChartDataset, g: string): Q => sum(ds.categories.map((c) => positive(cell(ds, g, c.id))));
export const categoryTotal = (ds: ChartDataset, c: string): Q => sum(ds.groups.map((g) => positive(cell(ds, g.id, c))));
export const grandTotal = (ds: ChartDataset): Q => sum(ds.groups.map((g) => groupTotal(ds, g.id)));

// ---------------------------------------------------------------------------
// Shares and honest rounding
// ---------------------------------------------------------------------------

export interface ShareRow {
  categoryId: string;
  /** Exact share as a fraction 0..1. */
  share: Q;
  /** Exact percentage 0..100. */
  percent: Q;
  /** Rounded text, e.g. "33.3". */
  text: string;
}

export type GroupShares =
  | { status: 'no_data'; message: string }
  | {
      status: 'ok';
      rows: ShareRow[];
      /** Sum of the ROUNDED figures shown to the student. */
      displayedSum: string;
      /** The exact shares always sum to exactly 100%. */
      exactSumIsHundred: boolean;
      /** Set when rounding makes the displayed figures not add to exactly 100. */
      roundingNote: string | null;
    };

export function groupShares(ds: ChartDataset, groupId: string, places = 1): GroupShares {
  const total = groupTotal(ds, groupId);
  if (isZero(total)) {
    return { status: 'no_data', message: 'This group has a total of 0, so shares are undefined. No percentages are shown.' };
  }
  const rows: ShareRow[] = ds.categories.map((c) => {
    const v = positive(cell(ds, groupId, c.id));
    const share = div(v, total);
    const percent = mul(share, HUNDRED);
    return { categoryId: c.id, share, percent, text: formatDecimal(percent, places) };
  });
  const exact = sum(rows.map((r) => r.percent));
  // Sum the displayed (rounded) figures exactly via integers.
  let displayed = q(0);
  for (const r of rows) displayed = add(displayed, parseQ(r.text) ?? ZERO);
  const displayedSum = formatDecimal(displayed, places);
  const matches = eq(displayed, HUNDRED);
  return {
    status: 'ok',
    rows,
    displayedSum,
    exactSumIsHundred: eq(exact, HUNDRED),
    roundingNote: matches ? null : `The rounded figures add up to ${displayedSum}% because each is rounded to ${places} decimal place${places === 1 ? '' : 's'}. The exact shares add up to exactly 100%.`,
  };
}

// ---------------------------------------------------------------------------
// Axis
// ---------------------------------------------------------------------------

export interface Axis {
  max: number;
  step: number;
  ticks: number[];
}

/** A zero-based axis with "nice" ticks. Never truncates: the axis always starts at 0. */
export function niceAxis(maxValue: number, targetTicks = 5): Axis {
  if (!(maxValue > 0) || !Number.isFinite(maxValue)) return { max: 1, step: 0.2, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] };
  const rough = maxValue / targetTicks;
  const pow = 10 ** Math.floor(Math.log10(rough));
  let step = pow;
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * pow >= rough) {
      step = m * pow;
      break;
    }
  }
  const max = Math.ceil(maxValue / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(12)));
  return { max, step, ticks };
}

// ---------------------------------------------------------------------------
// Editing (pure; the store keeps undo/redo history)
// ---------------------------------------------------------------------------

export type EditResult = { ok: true; dataset: ChartDataset } | { ok: false; error: string };

export function setCell(ds: ChartDataset, g: string, c: string, v: Q | null): EditResult {
  if (!ds.groups.some((x) => x.id === g) || !ds.categories.some((x) => x.id === c)) return { ok: false, error: 'That cell does not exist.' };
  if (v && isNeg(v)) return { ok: false, error: 'A stacked bar cannot show a negative part. Enter 0 or more.' };
  return { ok: true, dataset: { ...ds, values: { ...ds.values, [g]: { ...ds.values[g], [c]: v } } } };
}

let counter = 0;
const nextId = (prefix: string, used: string[]): string => {
  let id: string;
  do {
    counter += 1;
    id = `${prefix}${counter}`;
  } while (used.includes(id));
  return id;
};

export function addGroup(ds: ChartDataset, label?: string): EditResult {
  if (ds.groups.length >= MAX_GROUPS) return { ok: false, error: `A chart can have at most ${MAX_GROUPS} groups.` };
  const id = nextId('g', ds.groups.map((g) => g.id));
  const row: Record<string, Q | null> = {};
  for (const c of ds.categories) row[c.id] = ZERO;
  return { ok: true, dataset: { ...ds, groups: [...ds.groups, { id, label: label ?? `Group ${ds.groups.length + 1}` }], values: { ...ds.values, [id]: row } } };
}

export function removeGroup(ds: ChartDataset, id: string): EditResult {
  if (ds.groups.length <= 1) return { ok: false, error: 'Keep at least one group.' };
  const values = { ...ds.values };
  delete values[id];
  return { ok: true, dataset: { ...ds, groups: ds.groups.filter((g) => g.id !== id), values } };
}

export function addCategory(ds: ChartDataset, label?: string): EditResult {
  if (ds.categories.length >= MAX_CATEGORIES) return { ok: false, error: `A chart can have at most ${MAX_CATEGORIES} categories.` };
  const id = nextId('c', ds.categories.map((c) => c.id));
  const values: ChartDataset['values'] = {};
  for (const g of ds.groups) values[g.id] = { ...ds.values[g.id], [id]: ZERO };
  return { ok: true, dataset: { ...ds, categories: [...ds.categories, { id, label: label ?? `Category ${ds.categories.length + 1}` }], values } };
}

export function removeCategory(ds: ChartDataset, id: string): EditResult {
  if (ds.categories.length <= 1) return { ok: false, error: 'Keep at least one category.' };
  const values: ChartDataset['values'] = {};
  for (const g of ds.groups) {
    const row = { ...ds.values[g.id] };
    delete row[id];
    values[g.id] = row;
  }
  return { ok: true, dataset: { ...ds, categories: ds.categories.filter((c) => c.id !== id), values } };
}

export const renameGroup = (ds: ChartDataset, id: string, label: string): ChartDataset => ({ ...ds, groups: ds.groups.map((g) => (g.id === id ? { ...g, label } : g)) });
export const renameCategory = (ds: ChartDataset, id: string, label: string): ChartDataset => ({ ...ds, categories: ds.categories.map((c) => (c.id === id ? { ...c, label } : c)) });

// ---------------------------------------------------------------------------
// Questions answered from the dataset (never from pixel positions)
// ---------------------------------------------------------------------------

export interface ArgMax {
  ids: string[];
  value: Q;
  /** More than one id means a tie. */
  tied: boolean;
}

function argMax(entries: { id: string; value: Q }[]): ArgMax | null {
  if (entries.length === 0) return null;
  let best = entries[0].value;
  for (const e of entries) if (cmp(e.value, best) > 0) best = e.value;
  const ids = entries.filter((e) => eq(e.value, best)).map((e) => e.id);
  return { ids, value: best, tied: ids.length > 1 };
}

export const largestGroupTotal = (ds: ChartDataset): ArgMax | null => argMax(ds.groups.map((g) => ({ id: g.id, value: groupTotal(ds, g.id) })));
export const largestCategoryOverall = (ds: ChartDataset): ArgMax | null => argMax(ds.categories.map((c) => ({ id: c.id, value: categoryTotal(ds, c.id) })));
export const largestSegmentInGroup = (ds: ChartDataset, g: string): ArgMax | null =>
  argMax(ds.categories.map((c) => ({ id: c.id, value: positive(cell(ds, g, c.id)) })));
/** Group with the biggest ABSOLUTE amount in a category. */
export const largestAbsoluteInCategory = (ds: ChartDataset, c: string): ArgMax | null =>
  argMax(ds.groups.map((g) => ({ id: g.id, value: positive(cell(ds, g.id, c)) })));
/** Group with the biggest PERCENTAGE share in a category (groups with no data are skipped). */
export function largestShareInCategory(ds: ChartDataset, c: string): ArgMax | null {
  const entries: { id: string; value: Q }[] = [];
  for (const g of ds.groups) {
    const t = groupTotal(ds, g.id);
    if (isZero(t)) continue;
    entries.push({ id: g.id, value: mul(div(positive(cell(ds, g.id, c)), t), HUNDRED) });
  }
  return argMax(entries);
}

export type InferenceKind =
  | 'totals_from_stacked'
  | 'share_from_stacked'
  | 'totals_from_percent'
  | 'actual_counts_from_percent'
  | 'within_group_order_from_percent'
  | 'across_groups_counts_from_percent'
  | 'equal_percent_means_equal_quantity'
  | 'stacked_from_percent'
  | 'percent_from_stacked';

export interface Verdict {
  canInfer: boolean;
  reason: string;
}

/** What each chart type can and cannot tell you (Chapter 10 summary and examples). */
export function inferenceVerdict(kind: InferenceKind): Verdict {
  switch (kind) {
    case 'totals_from_stacked':
      return { canInfer: true, reason: 'The full length of each stacked bar is that group’s total.' };
    case 'share_from_stacked':
      return { canInfer: true, reason: 'A segment’s length compared with the whole bar gives its share, though the segments do not all start at the same baseline.' };
    case 'totals_from_percent':
      return { canInfer: false, reason: 'Every 100% bar has the same length, so it hides the totals. Many different totals give the same bar.' };
    case 'actual_counts_from_percent':
      return { canInfer: false, reason: 'A 100% chart shows proportions only. Without the totals you cannot recover the actual counts.' };
    case 'within_group_order_from_percent':
      return { canInfer: true, reason: 'Inside one bar all parts share the same total, so a larger percentage means a larger actual amount in that group.' };
    case 'across_groups_counts_from_percent':
      return { canInfer: false, reason: 'A bigger percentage in one group does not mean a bigger amount than in another group; the groups can have very different totals.' };
    case 'equal_percent_means_equal_quantity':
      return { canInfer: false, reason: 'Equal percentages of different totals are different quantities. 50% of 10 is not 50% of 1000.' };
    case 'stacked_from_percent':
      return { canInfer: false, reason: 'A 100% chart cannot be turned back into a stacked chart because the totals are lost.' };
    case 'percent_from_stacked':
      return { canInfer: true, reason: 'Divide each part by its bar’s total. Nothing is lost going from stacked to 100% stacked.' };
  }
}

/** Groups whose shares are identical in every category but whose totals differ. */
export function equalShareDifferentTotals(ds: ChartDataset): { a: string; b: string }[] {
  const out: { a: string; b: string }[] = [];
  for (let i = 0; i < ds.groups.length; i++) {
    for (let j = i + 1; j < ds.groups.length; j++) {
      const A = ds.groups[i].id;
      const B = ds.groups[j].id;
      const tA = groupTotal(ds, A);
      const tB = groupTotal(ds, B);
      if (isZero(tA) || isZero(tB) || eq(tA, tB)) continue;
      const same = ds.categories.every((c) => eq(div(positive(cell(ds, A, c.id)), tA), div(positive(cell(ds, B, c.id)), tB)));
      if (same) out.push({ a: A, b: B });
    }
  }
  return out;
}

export interface OppositeCases {
  /** Two raw datasets with IDENTICAL 100% charts but opposite absolute comparisons. */
  case1: ChartDataset;
  case2: ChartDataset;
  categoryId: string;
  /** In case 1 group A has more of the category than B; in case 2 less. */
  summary: string;
}

const gcdBig = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
};
const lcmBig = (a: bigint, b: bigint): bigint => (a === 0n || b === 0n ? 1n : (a / gcdBig(a, b)) * b);

/**
 * Textbook "Case 1 / Case 2": from the percentages of two groups, build two
 * different sets of raw counts with the same 100% chart but opposite absolute
 * comparisons for `categoryId`. Returns null when that is impossible
 * (equal shares, or one share is 0).
 */
export function buildOppositeCases(ds: ChartDataset, groupA: string, groupB: string, categoryId: string): OppositeCases | null {
  const tA = groupTotal(ds, groupA);
  const tB = groupTotal(ds, groupB);
  if (isZero(tA) || isZero(tB)) return null;
  const shareOf = (g: string, t: Q, c: string) => div(positive(cell(ds, g, c)), t);
  let sA = shareOf(groupA, tA, categoryId);
  let sB = shareOf(groupB, tB, categoryId);
  if (isZero(sA) || isZero(sB) || eq(sA, sB)) return null;
  let a = groupA;
  let b = groupB;
  if (cmp(sA, sB) < 0) {
    [a, b] = [b, a];
    [sA, sB] = [sB, sA];
  }
  // Now share(a) > share(b). Equal totals give a ≥ b; a large total for b flips it.
  // Smallest total for which every share becomes a whole number of items.
  let L = 1n;
  for (const [g, t] of [[groupA, tA], [groupB, tB]] as const) {
    for (const c of ds.categories) L = lcmBig(L, div(positive(cell(ds, g, c.id)), t).d);
  }
  const k = floorQ(div(sA, sB)) + 2n;
  const totalsCase1 = { a: q(L), b: q(L) };
  const totalsCase2 = { a: q(L), b: q(L * k) };
  const build = (totals: { a: Q; b: Q }): ChartDataset => {
    const values: ChartDataset['values'] = { ...ds.values };
    for (const [g, tt] of [[a, totals.a], [b, totals.b]] as const) {
      const origTotal = g === groupA ? tA : tB;
      const row: Record<string, Q | null> = {};
      for (const c of ds.categories) row[c.id] = mul(div(positive(cell(ds, g, c.id)), origTotal), tt);
      values[g] = row;
    }
    return { ...ds, groups: ds.groups.filter((g) => g.id === a || g.id === b), values: { [a]: values[a], [b]: values[b] } };
  };
  const labelOf = (id: string) => ds.groups.find((g) => g.id === id)?.label ?? id;
  const catLabel = ds.categories.find((c) => c.id === categoryId)?.label ?? categoryId;
  return {
    case1: build(totalsCase1),
    case2: build(totalsCase2),
    categoryId,
    summary: `${labelOf(a)} has the larger percentage of ${catLabel}. In Case 1 it also has more; in Case 2, with a much larger total for ${labelOf(b)}, it has fewer. The 100% charts are identical.`,
  };
}

// ---------------------------------------------------------------------------
// Text alternative
// ---------------------------------------------------------------------------

export function describeChart(ds: ChartDataset, mode: ChartMode): string[] {
  const lines: string[] = [];
  lines.push(`${ds.title}: ${mode === 'absolute' ? 'stacked bar chart of actual values' : '100% stacked bar chart of shares within each group'}, in ${ds.unit}.`);
  for (const g of ds.groups) {
    const t = groupTotal(ds, g.id);
    if (mode === 'absolute') {
      lines.push(`${g.label}: total ${formatDecimal(t, 2)}. ${ds.categories.map((c) => `${c.label} ${cell(ds, g.id, c.id) === null ? 'missing' : formatDecimal(cell(ds, g.id, c.id)!, 2)}`).join(', ')}.`);
    } else {
      const s = groupShares(ds, g.id);
      lines.push(s.status === 'no_data' ? `${g.label}: no data (total 0), so no percentages.` : `${g.label}: ${ds.categories.map((c, i) => `${c.label} ${s.rows[i].text}%`).join(', ')}. (Total ${formatDecimal(t, 2)} is not shown by this chart.)`);
    }
  }
  return lines;
}

// ---------------------------------------------------------------------------
// CSV (client side only)
// ---------------------------------------------------------------------------

export interface CsvIssue {
  line: number;
  message: string;
}
export type CsvResult = { ok: true; dataset: ChartDataset; warnings: CsvIssue[] } | { ok: false; errors: CsvIssue[] };

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseDatasetCsv(text: string, title = 'Imported data', unit = 'units'): CsvResult {
  const raw = text.replace(/^﻿/, '').split(/\r?\n/);
  const rows = raw.map((l, i) => ({ line: i + 1, text: l })).filter((r) => r.text.trim() !== '');
  const errors: CsvIssue[] = [];
  if (rows.length < 2) return { ok: false, errors: [{ line: 1, message: 'The file needs a header row and at least one data row.' }] };
  const header = splitCsvLine(rows[0].text);
  if (header.length < 2) return { ok: false, errors: [{ line: rows[0].line, message: 'The header needs a group-name column followed by at least one category column.' }] };
  const catLabels = header.slice(1);
  if (catLabels.length > MAX_CATEGORIES) errors.push({ line: rows[0].line, message: `At most ${MAX_CATEGORIES} categories are supported (found ${catLabels.length}).` });
  if (catLabels.some((c) => c === '')) errors.push({ line: rows[0].line, message: 'Every category column needs a name in the header.' });
  const lower = catLabels.map((c) => c.toLowerCase());
  if (new Set(lower).size !== lower.length) errors.push({ line: rows[0].line, message: 'Category names in the header must all be different.' });
  if (rows.length - 1 > MAX_GROUPS) errors.push({ line: rows[1].line, message: `At most ${MAX_GROUPS} groups are supported (found ${rows.length - 1}).` });

  const warnings: CsvIssue[] = [];
  const parsed: { label: string; values: (Q | null)[] }[] = [];
  for (const r of rows.slice(1)) {
    const cells = splitCsvLine(r.text);
    if (cells.length !== header.length) {
      errors.push({ line: r.line, message: `This row has ${cells.length} cells but the header has ${header.length}.` });
      continue;
    }
    if (cells[0] === '') errors.push({ line: r.line, message: 'This row has no group name.' });
    const values: (Q | null)[] = [];
    cells.slice(1).forEach((c, i) => {
      if (c === '') {
        values.push(null);
        warnings.push({ line: r.line, message: `“${catLabels[i]}” is empty and will be treated as MISSING (not 0).` });
        return;
      }
      const v = parseQ(c);
      if (!v) errors.push({ line: r.line, message: `“${c}” in column “${catLabels[i]}” is not a number.` });
      else if (isNeg(v)) errors.push({ line: r.line, message: `“${c}” in column “${catLabels[i]}” is negative; stacked bars need 0 or more.` });
      values.push(v);
    });
    parsed.push({ label: cells[0], values });
  }
  const gl = parsed.map((p) => p.label.toLowerCase());
  if (new Set(gl).size !== gl.length) errors.push({ line: rows[1].line, message: 'Group names (first column) must all be different.' });
  if (errors.length > 0) return { ok: false, errors };

  const ds: ChartDataset = {
    title,
    unit,
    categories: catLabels.map((label, i) => ({ id: `c${i + 1}`, label })),
    groups: parsed.map((p, i) => ({ id: `g${i + 1}`, label: p.label })),
    values: {},
  };
  parsed.forEach((p, gi) => {
    ds.values[ds.groups[gi].id] = {};
    ds.categories.forEach((c, ci) => (ds.values[ds.groups[gi].id][c.id] = p.values[ci]));
  });
  return { ok: true, dataset: ds, warnings };
}

const csvCell = (s: string): string => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function datasetToCsv(ds: ChartDataset): string {
  const lines = [['Group', ...ds.categories.map((c) => c.label)].map(csvCell).join(',')];
  for (const g of ds.groups) {
    lines.push([g.label, ...ds.categories.map((c) => { const v = cell(ds, g.id, c.id); return v === null ? '' : formatExact(v); })].map(csvCell).join(','));
  }
  return lines.join('\n') + '\n';
}

export const chartNumber = (v: Q | null): number => (v ? toNumber(v) : 0);
