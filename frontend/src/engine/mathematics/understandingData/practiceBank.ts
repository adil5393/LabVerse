/**
 * Chapter Practice question bank (M6).
 *
 * Every question is built from a small data object. The table or chart shown
 * to the student, the expected answer, the hints and the worked solution are
 * all derived from that same data through the exact engine. Load-time
 * assertions throw if a derived fact is ambiguous (for example a tie where a
 * unique "largest" is asked for). Numbers are original LabVerse data.
 */

import {
  type Q, q, parseQ, formatDecimal, formatExact, eq as qEq, sub, mul, div, abs, cmp, HUNDRED,
} from './rational';
import {
  type WeightedItem, weightedMean, naiveMean, scaleWeights, shiftWeights, meanAfterAdding,
  meanAfterRemoving, missingGroupMean, solveUnknownWeight,
} from './weightedMean';
import {
  type Constituent, mixConstituents, quantityToReachTarget, reachableRange,
} from './mixture';
import {
  type ChartDataset, type ChartMode, makeDataset, groupTotal, grandTotal, groupShares, cell,
  largestGroupTotal, largestSegmentInGroup, largestShareInCategory, largestAbsoluteInCategory, categoryTotal,
} from './charts';
import type { UDPracticeQuestion, PracticeDifficulty, PracticeTopic, UserAnswer, GivensTable } from './types';

const assert = (c: boolean, m: string) => {
  if (!c) throw new Error(`Understanding Data practice bank integrity: ${m}`);
};
const f2 = (x: Q) => formatDecimal(x, 2);
const f4 = (x: Q) => formatDecimal(x, 4);

interface Base {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  topicId: PracticeTopic;
}
let n = 0;
const B = (title: string, difficulty: PracticeDifficulty, topicId: PracticeTopic): Base => ({ id: `q-ud-${++n}`, title, difficulty, topicId });

function arrange(id: string, correct: string, distractors: string[]): { options: string[]; index: number } {
  assert(!distractors.includes(correct), `${id}: a distractor equals the correct option`);
  assert(new Set(distractors).size === distractors.length, `${id}: duplicate distractors`);
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const index = h % (distractors.length + 1);
  const options = [...distractors];
  options.splice(index, 0, correct);
  return { options, index };
}

function choice(b: Base, statement: string, correct: string, distractors: string[], hints: string[], worked: string[], explanation: string, extra: Partial<UDPracticeQuestion> = {}): UDPracticeQuestion {
  const { options, index } = arrange(b.id, correct, distractors);
  return { ...b, inputType: 'multiple_choice', statement, options, answer: { kind: 'choice', index }, hints, workedSolution: worked, explanation, ...extra };
}
function numeric(b: Base, statement: string, value: Q, decimals: number | undefined, unit: string | undefined, hints: string[], worked: string[], explanation: string, extra: Partial<UDPracticeQuestion> = {}): UDPracticeQuestion {
  return { ...b, inputType: 'numeric', statement, unit, answer: { kind: 'number', value, decimals }, hints, workedSolution: worked, explanation, ...extra };
}

const itemsOf = (rows: [string, string, string][]): WeightedItem[] =>
  rows.map(([label, v, w], i) => ({ id: `i${i}`, label, value: parseQ(v)!, weight: parseQ(w)! }));

const tableOf = (items: WeightedItem[], valueHead: string, weightHead: string): GivensTable => ({
  headers: ['', valueHead, weightHead],
  rows: items.map((i) => [i.label, formatExact(i.value), formatExact(i.weight)]),
});

function wm(items: WeightedItem[]): { mean: Q; total: Q; sumP: Q } {
  const r = weightedMean(items);
  assert(r.ok, 'weighted mean must be valid');
  if (!r.ok) throw new Error('unreachable');
  return { mean: r.mean, total: r.totalWeight, sumP: r.sumProducts };
}

// ---------------------------------------------------------------------------
// Weighted-mean builders
// ---------------------------------------------------------------------------

function combineQ(b: Base, context: string, rows: [string, string, string][], unit: string, decimals?: number): UDPracticeQuestion {
  const items = itemsOf(rows);
  const { mean, total, sumP } = wm(items);
  const naive = naiveMean(items)!;
  assert(!qEq(mean, naive), `${b.id}: weighted and naive must differ in this question`);
  const sumText = items.map((i) => `${formatExact(i.weight)}×${formatExact(i.value)}`).join(' + ');
  return numeric(
    b,
    `${context} What is the combined average${decimals !== undefined ? ` (to ${decimals} decimal place${decimals === 1 ? '' : 's'})` : ''}?`,
    mean, decimals, unit,
    ['The average of the averages is wrong when the groups have different sizes.', 'Multiply each average by its group size to get each group’s total, then add the totals.'],
    [`Total of each group = size × average: ${sumText} = ${formatExact(sumP)}.`, `Total number of values = ${items.map((i) => formatExact(i.weight)).join(' + ')} = ${formatExact(total)}.`, `Combined average = ${formatExact(sumP)} ÷ ${formatExact(total)} = ${decimals !== undefined ? f2(mean) : formatExact(mean)}.`, `(The plain average of the averages would give ${f2(naive)}, which is wrong here.)`],
    'The combined average is a weighted mean, with each group weighted by how many values it contains.',
    { givens: tableOf(items, 'Average', 'Size') }
  );
}

function equalSizesQ(b: Base, rows: [string, string, string][]): UDPracticeQuestion {
  const items = itemsOf(rows);
  const { mean } = wm(items);
  assert(qEq(mean, naiveMean(items)!), `${b.id}: sizes must be equal`);
  return numeric(
    b, `${rows.length} groups have the SAME number of values (${rows[0][2]} each). Their averages are ${rows.map((r) => r[1]).join(', ')}. What is the combined average?`,
    mean, undefined, undefined,
    ['When every group has the same size, every group counts equally.', 'Then the ordinary average of the group averages is correct.'],
    [`Equal sizes, so the weights are equal and cancel: (${rows.map((r) => r[1]).join(' + ')}) ÷ ${rows.length} = ${formatExact(mean)}.`],
    'Averaging averages works only when the groups are the same size.',
    { givens: tableOf(items, 'Average', 'Size') }
  );
}

function expressionQ(b: Base, rows: [string, string, string][]): UDPracticeQuestion {
  const items = itemsOf(rows);
  const [a, c] = [items[0], items[1]];
  const correct = `(${a.weight.n}×${a.value.n} + ${c.weight.n}×${c.value.n}) ÷ (${a.weight.n} + ${c.weight.n})`;
  const distract = [
    `(${a.value.n} + ${c.value.n}) ÷ 2`,
    `(${a.value.n} + ${c.value.n}) ÷ (${a.weight.n} + ${c.weight.n})`,
    `(${a.weight.n}×${c.value.n} + ${c.weight.n}×${a.value.n}) ÷ (${a.weight.n} + ${c.weight.n})`,
  ];
  assert(![...distract].some((d) => d === correct), `${b.id}: duplicate expression`);
  const r = wm(items);
  return choice(
    b, `Group 1 has ${a.weight.n} values with average ${a.value.n}. Group 2 has ${c.weight.n} values with average ${c.value.n}. Which expression gives the combined average?`,
    correct, distract,
    ['Group total = size × average.', 'Divide the sum of group totals by the total number of values.'],
    [`Group 1 total = ${a.weight.n}×${a.value.n}; group 2 total = ${c.weight.n}×${c.value.n}.`, `Divide their sum by ${a.weight.n} + ${c.weight.n}.`, `Check: it equals ${f2(r.mean)}.`],
    'Combined mean = (sum of group totals) ÷ (total size).',
    { givens: tableOf(items, 'Average', 'Size') }
  );
}

function weightsQ(b: Base, context: string, rows: [string, string, string][], unit: string, decimals?: number, valueHead = 'Score', weightHead = 'Weight'): UDPracticeQuestion {
  const items = itemsOf(rows);
  const { mean, total, sumP } = wm(items);
  const sumText = items.map((i) => `${formatExact(i.weight)}×${formatExact(i.value)}`).join(' + ');
  return numeric(
    b, `${context}${decimals !== undefined ? ` Give the answer to ${decimals} decimal place${decimals === 1 ? '' : 's'}.` : ''}`, mean, decimals, unit,
    ['Multiply each score by its weight.', 'Divide by the total of the weights, not by the number of scores.'],
    [`Weighted sum = ${sumText} = ${formatExact(sumP)}.`, `Total weight = ${items.map((i) => formatExact(i.weight)).join(' + ')} = ${formatExact(total)}.`, `Weighted mean = ${formatExact(sumP)} ÷ ${formatExact(total)} = ${decimals !== undefined ? formatDecimal(mean, decimals) : formatExact(mean)}.`],
    'A weighted mean gives each value influence in proportion to its weight.',
    { givens: tableOf(items, valueHead, weightHead) }
  );
}

// ---------------------------------------------------------------------------
// Mixture builders
// ---------------------------------------------------------------------------

const con = (label: string, qty: string, unit: Constituent['unit'], pct: string, solute = 'solute'): Constituent => ({
  id: label, label, quantity: parseQ(qty)!, unit, solutes: { [solute]: parseQ(pct)! },
});
const mixTable = (cs: Constituent[], solute: string): GivensTable => ({
  headers: ['Part', 'Quantity', `${solute} %`],
  rows: cs.map((c) => [c.label, `${formatExact(c.quantity)} ${c.unit}`, `${formatExact(c.solutes[solute] ?? q(0))}%`]),
});

function mixtureConcentrationQ(b: Base, intro: string, cs: Constituent[], solute: string, decimals?: number): UDPracticeQuestion {
  const r = mixConstituents(cs);
  assert(r.ok, `${b.id}: mixture must be valid`);
  if (!r.ok) throw new Error('unreachable');
  const c = r.concentrations[solute];
  const u = r.baseUnit;
  return numeric(
    b, `${intro} (Assume quantities add.) What is the final concentration of ${solute}?`, c, decimals, '%',
    ['Final concentration = total solute ÷ total mixture quantity.', 'Find how much solute each part brings: quantity × concentration.'],
    [...r.contributions.map((x) => `${x.label}: ${f2(x.baseQuantity)} ${u} brings ${f4(x.soluteAmounts[solute] ?? q(0))} ${u} of ${solute}.`), `Total ${solute} = ${f4(r.soluteTotals[solute])} ${u}; total mixture = ${f2(r.totalQuantity)} ${u}.`, `Concentration = ${f4(r.soluteTotals[solute])} ÷ ${f2(r.totalQuantity)} × 100 = ${decimals !== undefined ? formatDecimal(c, decimals) : formatExact(c)}%.`],
    'Each concentration counts in proportion to the quantity it contributes, so a mixture is a weighted mean.',
    { givens: mixTable(cs, solute) }
  );
}

function soluteAmountQ(b: Base, cs: Constituent[], solute: string): UDPracticeQuestion {
  const r = mixConstituents(cs);
  if (!r.ok) throw new Error('mixture');
  return numeric(
    b, `These liquids are mixed. How much ${solute} is in the mixture, in ${r.baseUnit}?`, r.soluteTotals[solute], undefined, r.baseUnit,
    ['Each part brings (quantity × concentration) of solute.', 'Add what each part brings.'],
    [...r.contributions.map((x) => `${x.label}: ${f2(x.baseQuantity)} ${r.baseUnit} × concentration = ${f4(x.soluteAmounts[solute])} ${r.baseUnit}.`), `Total = ${formatExact(r.soluteTotals[solute])} ${r.baseUnit}.`],
    'Solute amounts add; percentages do not.',
    { givens: mixTable(cs, solute) }
  );
}

function dilutionQ(b: Base, cs: Constituent[], solute: string, target: string): UDPracticeQuestion {
  const s = quantityToReachTarget(cs, solute, q(0), parseQ(target)!);
  assert(s.kind === 'quantity', `${b.id}: dilution must be solvable`);
  if (s.kind !== 'quantity') throw new Error('unreachable');
  return numeric(
    b, `${cs[0].label} (${formatExact(cs[0].quantity)} ${cs[0].unit}, ${formatExact(cs[0].solutes[solute])}% ${solute}) is diluted with plain water (0% ${solute}). How many mL of water must be added so the concentration becomes ${target}%?`,
    s.amount, undefined, 'mL',
    ['Water adds quantity but no solute.', 'Solute stays the same: new concentration = (original solute) ÷ (new total).'],
    [`Solute now = ${formatExact(cs[0].solutes[solute])}% of ${formatExact(cs[0].quantity)} ${cs[0].unit}.`, `Let y mL of water be added: solute ÷ (original + y) = ${target}%.`, `Solving gives y = ${formatExact(s.amount)} mL.`],
    'Diluting lowers the concentration by adding quantity without adding solute.',
    { givens: mixTable(cs, solute) }
  );
}

function unknownBatchQ(b: Base, known: Constituent[], pct: string, target: string): UDPracticeQuestion {
  const s = quantityToReachTarget(known, 'copper', parseQ(pct)!, parseQ(target)!);
  assert(s.kind === 'quantity', `${b.id}: unknown batch must be solvable`);
  if (s.kind !== 'quantity') throw new Error('unreachable');
  const kg = div(s.amount, q(1000));
  return numeric(
    b, `Brass batches: ${known.map((k) => `${k.label} is ${formatExact(k.quantity)} kg at ${formatExact(k.solutes.copper)}% copper`).join('; ')}. A third batch is ${pct}% copper. When all three are combined the alloy is ${target}% copper. What is the weight of the third batch, in kg?`,
    kg, undefined, 'kg',
    ['Let y be the weight of the third batch. Write: total copper ÷ total weight = target.', 'Set up the equation and solve for y.'],
    [`Copper from the known batches = ${known.map((k) => `${formatExact(k.quantity)}×${formatExact(k.solutes.copper)}%`).join(' + ')}.`, `Equation: (known copper + y × ${pct}%) ÷ (known weight + y) = ${target}%.`, `Solving: y = ${formatExact(kg)} kg.`],
    'An unknown quantity in a mixture can be found by setting the weighted mean equal to the target.',
    { givens: mixTable(known, 'copper') }
  );
}

// ---------------------------------------------------------------------------
// Chart builders
// ---------------------------------------------------------------------------

const labelG = (ds: ChartDataset, id: string) => ds.groups.find((g) => g.id === id)!.label;
const labelC = (ds: ChartDataset, id: string) => ds.categories.find((c) => c.id === id)!.label;

function barSelectQ(b: Base, ds: ChartDataset, mode: ChartMode): UDPracticeQuestion {
  const m = largestGroupTotal(ds)!;
  assert(!m.tied, `${b.id}: largest total must be unique`);
  return {
    ...b, inputType: 'chart_select', statement: `${mode === 'absolute' ? 'Tap the bar with the largest TOTAL.' : 'Tap the group whose actual TOTAL is largest. (Hint: look at the totals table.)'}`,
    chart: { dataset: ds, mode }, answer: { kind: 'bar', groupId: m.ids[0] },
    hints: ['A bar’s total is the sum of all its segments.', 'Compare the totals, not the biggest single segment.'],
    workedSolution: [`Totals: ${ds.groups.map((g) => `${g.label} = ${f2(groupTotal(ds, g.id))}`).join(', ')} ${ds.unit}.`, `${labelG(ds, m.ids[0])} is largest.`],
    explanation: 'The full length of a stacked bar is the group’s total.',
  };
}

function segmentSelectQ(b: Base, ds: ChartDataset, groupId: string): UDPracticeQuestion {
  const m = largestSegmentInGroup(ds, groupId)!;
  assert(!m.tied, `${b.id}: unique largest segment`);
  return {
    ...b, inputType: 'chart_select', statement: `In ${labelG(ds, groupId)}, tap the segment that contributes the MOST.`,
    chart: { dataset: ds, mode: 'absolute' }, answer: { kind: 'segment', groupId, categoryId: m.ids[0] },
    hints: ['Look only at that group’s bar.', 'The biggest segment is the one with the biggest value.'],
    workedSolution: [`${labelG(ds, groupId)}: ${ds.categories.map((c) => `${c.label} ${f2(cell(ds, groupId, c.id)!)}`).join(', ')}.`, `${labelC(ds, m.ids[0])} is largest.`],
    explanation: 'Within one bar the segments share the same total, so the biggest value is the biggest part.',
  };
}

function shareSelectQ(b: Base, ds: ChartDataset, categoryId: string): UDPracticeQuestion {
  const share = largestShareInCategory(ds, categoryId)!;
  assert(!share.tied, `${b.id}: unique largest share`);
  return {
    ...b, inputType: 'chart_select', statement: `Tap the ${labelC(ds, categoryId)} segment that is the biggest PERCENTAGE of its own bar.`,
    chart: { dataset: ds, mode: 'percent' }, answer: { kind: 'segment', groupId: share.ids[0], categoryId },
    hints: ['In a 100% chart each bar is scaled to the same length.', 'Compare how much of its own bar each segment fills.'],
    workedSolution: ds.groups.map((g) => { const s = groupShares(ds, g.id); return s.status === 'ok' ? `${g.label}: ${labelC(ds, categoryId)} = ${s.rows.find((r) => r.categoryId === categoryId)!.text}%.` : `${g.label}: no data.`; }).concat([`${labelG(ds, share.ids[0])} has the largest share.`]),
    explanation: 'A 100% stacked chart compares proportions, not actual amounts.',
  };
}

function totalNumberQ(b: Base, ds: ChartDataset, groupId: string): UDPracticeQuestion {
  const t = groupTotal(ds, groupId);
  return numeric(
    b, `What is the total for ${labelG(ds, groupId)} (in ${ds.unit})?`, t, undefined, ds.unit,
    ['A stacked bar’s total is all its segments added.'],
    [ds.categories.map((c) => f2(cell(ds, groupId, c.id)!)).join(' + ') + ` = ${formatExact(t)}.`],
    'The total of a stacked bar is the sum of its parts.',
    { chart: { dataset: ds, mode: 'absolute' } }
  );
}

function shareNumberQ(b: Base, ds: ChartDataset, groupId: string, categoryId: string): UDPracticeQuestion {
  const s = groupShares(ds, groupId);
  assert(s.status === 'ok', `${b.id}: needs data`);
  if (s.status !== 'ok') throw new Error('unreachable');
  const row = s.rows.find((r) => r.categoryId === categoryId)!;
  return numeric(
    b, `What percentage of ${labelG(ds, groupId)}’s total is ${labelC(ds, categoryId)}? (to 1 decimal place)`, row.percent, 1, '%',
    ['Share = part ÷ total of its own group, times 100.'],
    [`${labelC(ds, categoryId)} = ${f2(cell(ds, groupId, categoryId)!)}; ${labelG(ds, groupId)} total = ${f2(groupTotal(ds, groupId))}.`, `${f2(cell(ds, groupId, categoryId)!)} ÷ ${f2(groupTotal(ds, groupId))} × 100 = ${formatDecimal(row.percent, 1)}%.`],
    'A percentage share compares a part with the total of its own group.',
    { chart: { dataset: ds, mode: 'absolute' } }
  );
}

function absVsPercentQ(b: Base, ds: ChartDataset, catId: string): UDPracticeQuestion {
  const share = largestShareInCategory(ds, catId)!;
  const abs = largestAbsoluteInCategory(ds, catId)!;
  assert(!share.tied && !abs.tied && share.ids[0] !== abs.ids[0], `${b.id}: share winner and amount winner must differ`);
  const correct = labelG(ds, abs.ids[0]);
  return choice(
    b, `The 100% chart shows ${labelG(ds, share.ids[0])} has the larger PERCENTAGE of ${labelC(ds, catId)}. Using the raw data, which group has the larger ACTUAL amount of ${labelC(ds, catId)}?`,
    correct, ds.groups.map((g) => g.label).filter((l) => l !== correct).concat(['Both have the same amount']).slice(0, ds.groups.length),
    ['A percentage is a share of that group’s own total.', 'Look at the actual values, not the shares.'],
    ds.groups.map((g) => `${g.label}: ${labelC(ds, catId)} = ${f2(cell(ds, g.id, catId)!)}, total = ${f2(groupTotal(ds, g.id))}.`).concat([`${correct} has more ${labelC(ds, catId)} in actual amount.`]),
    'A larger percentage does not mean a larger quantity when the totals differ.',
    { chart: { dataset: ds, mode: 'percent' } }
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const D = {
  houses: () => makeDataset('Students in two houses', 'students', ['Boys', 'Girls'], [{ label: 'House A', values: [120, 80] }, { label: 'House B', values: [60, 140] }]),
  shops: () => makeDataset('Sales of three shops', '₹ thousand', ['Books', 'Pens', 'Toys'], [{ label: 'Shop 1', values: [30, 50, 20] }, { label: 'Shop 2', values: [90, 40, 130] }, { label: 'Shop 3', values: [10, 15, 5] }]),
  smallLarge: () => makeDataset('Two clubs', 'members', ['Seniors', 'Juniors'], [{ label: 'Small club', values: [5, 5] }, { label: 'Large club', values: [40, 160] }]),
  sameShares: () => makeDataset('Two classes', 'students', ['Passed', 'Failed'], [{ label: 'Class P', values: [30, 10] }, { label: 'Class Q', values: [300, 100] }]),
  family: () => makeDataset('Monthly spending', '₹ hundred', ['Rent', 'Food', 'Travel'], [{ label: 'Family X', values: [40, 30, 10] }, { label: 'Family Y', values: [60, 55, 30] }]),
  schools: () => makeDataset('How students reach three schools', 'students', ['Cycle', 'Bus or walk'], [{ label: 'School A', values: [20, 80] }, { label: 'School B', values: [100, 900] }, { label: 'School C', values: [9, 21] }]),
  withEmpty: () => makeDataset('Orders', 'orders', ['Online', 'In store'], [{ label: 'Week 1', values: [0, 0] }, { label: 'Week 2', values: [30, 70] }]),
};

function chartMC(b: Base, statement: string, correct: string, distractors: string[], hints: string[], worked: string[], explanation: string, ds?: ChartDataset, mode: ChartMode = 'percent'): UDPracticeQuestion {
  return choice(b, statement, correct, distractors, hints, worked, explanation, ds ? { chart: { dataset: ds, mode } } : {});
}

// ---------------------------------------------------------------------------
// The bank
// ---------------------------------------------------------------------------

const salt = (id: string, qty: string, pct: string): Constituent => ({ id, label: id, quantity: parseQ(qty)!, unit: 'mL', solutes: { salt: parseQ(pct)! } });
const sugar = (id: string, qty: string, pct: string): Constituent => ({ id, label: id, quantity: parseQ(qty)!, unit: 'mL', solutes: { sugar: parseQ(pct)! } });

const scalingItems = itemsOf([['x₁', '4', '1'], ['x₂', '8', '2'], ['x₃', '12', '3']]);
const scaledX3 = wm(scaleWeights(scalingItems, q(3))).mean;
const baseMean = wm(scalingItems).mean;
assert(qEq(scaledX3, baseMean), 'scaling weights must not change the mean');
const shiftedMean = wm(shiftWeights(scalingItems, q(1))).mean;
assert(!qEq(shiftedMean, baseMean), 'shifting weights must change the mean');

const range = reachableRange([con('a', '1', 'L', '5'), con('b', '1', 'L', '8')], 'solute')!;
assert(cmp(q(10), range.max) > 0, 'a 10% mixture must be unreachable from 5% and 8%');
assert(!mixConstituents([con('a', '100', 'mL', '10'), con('b', '100', 'g', '10')]).ok, 'mL and g must not mix');
assert(groupShares(D.withEmpty(), 'g1').status === 'no_data', 'the empty week must have no data');
assert(cmp(mul(div(q(300), q(450)), HUNDRED), q(75)) !== 0 && qEq(mul(div(q(300), q(400)), HUNDRED), q(75)), 'raw-data matching question needs one matching set');

const unknownW = solveUnknownWeight(itemsOf([['A', '80', '10']]), q(50), q(62));
assert(unknownW.kind === 'weight', 'unknown weight must be solvable');

const afterAdd = meanAfterAdding(q(62), q(10), q(84), q(1))!;
const afterRemove = meanAfterRemoving(q(50), q(12), q(74), q(1))!;
const otherGroup = missingGroupMean(q(68), q(50), q(30), q(64))!;

export const UNDERSTANDING_DATA_PRACTICE_BANK: UDPracticeQuestion[] = [
  // ----- Basic -----
  combineQ(B('Combine two classes', 'basic', 'average_of_averages'), 'Class P has 15 students with average 72. Class Q has 25 students with average 56.', [['Class P', '72', '15'], ['Class Q', '56', '25']], 'marks'),
  choice(B('Spot the flaw in averaging averages', 'basic', 'error_detection'), 'A student says: “Class P averages 72 and Class Q averages 56, so together they average (72 + 56) ÷ 2 = 64.” The classes have 15 and 25 students. What is wrong?',
    'It ignores that the classes have different sizes', ['The classes should be subtracted, not added', 'It should divide by 3', 'Nothing is wrong'],
    ['Does each class count equally in the whole group?', 'Which class has more students?'],
    [`The larger class (25 students) should pull the combined average closer to 56.`, `Weighted: (15×72 + 25×56) ÷ 40 = ${f2(wm(itemsOf([['P', '72', '15'], ['Q', '56', '25']])).mean)}, not 64.`],
    'A plain average of group averages treats big and small groups alike.'),
  equalSizesQ(B('Equal sizes', 'basic', 'average_of_averages'), [['Week 1', '14', '5'], ['Week 2', '18', '5'], ['Week 3', '22', '5']]),
  weightsQ(B('Marks with weights 2 : 3 : 5', 'basic', 'custom_weights'), 'A final mark combines three parts (each out of 100) with weights 2 : 3 : 5. The scores are 60, 70 and 90.', [['Part 1', '60', '2'], ['Part 2', '70', '3'], ['Part 3', '90', '5']], 'marks'),
  mixtureConcentrationQ(B('Equal quantities, midpoint', 'basic', 'mixture'), 'Mix 100 mL of a 10% solution with 100 mL of a 30% solution.', [con('Part 1', '100', 'mL', '10'), con('Part 2', '100', 'mL', '30')], 'solute'),
  segmentSelectQ(B('Largest segment', 'basic', 'stacked_reading'), D.shops(), 'g2'),
  totalNumberQ(B('Total of a bar', 'basic', 'stacked_reading'), D.houses(), 'g1'),
  chartMC(B('Do 100% segments add up?', 'basic', 'percent_reading'), 'In a 100% stacked bar chart, what do the segments of each bar add up to?', '100%', ['The group’s total', '1000', 'It depends on the data'], ['Each bar represents a whole.'], ['Every bar is split into the shares of its own total, and shares of a whole add to 100%.'], 'Each 100% bar shows 100% of its own group.'),
  chartMC(B('Can you recover counts?', 'basic', 'percent_reading'), 'You only have a 100% stacked bar chart. Can you work out the actual counts in each group?', 'No, the totals are not shown', ['Yes, from the segment lengths', 'Yes, if you measure with a ruler'], ['Every bar has the same length.'], ['Many different totals give the same 100% bar.'], 'A 100% chart shows proportions only.', D.sameShares()),
  barSelectQ(B('Tap the largest total', 'basic', 'stacked_reading'), D.shops(), 'absolute'),
  shareNumberQ(B('Percentage share of a part', 'basic', 'percent_reading'), D.houses(), 'g1', 'c1'),
  weightsQ(B('A zero weight changes nothing', 'basic', 'weighted_mean'), 'Scores 10, 20 and 90 have weights 1, 3 and 0. What is the weighted mean?', [['A', '10', '1'], ['B', '20', '3'], ['C', '90', '0']], '', undefined, 'Value', 'Weight'),
  choice(B('Which chart type?', 'basic', 'chart_choice'), 'You want to compare how large each household’s total spending is AND what it is spent on. Which chart is best?',
    'Stacked bar chart of actual amounts', ['100% stacked bar chart', 'A single number'],
    ['Do you need the totals?', 'Which chart keeps the totals?'], ['You need totals and parts, so use actual values.'], 'Stacked bars keep both the total and the components.'),

  // ----- Standard -----
  combineQ(B('Combine, rounded answer', 'standard', 'average_of_averages'), 'A group of 6 players has average height 172.5 cm and a group of 4 has average height 160.25 cm.', [['Group 1', '172.5', '6'], ['Group 2', '160.25', '4']], 'cm', 2),
  combineQ(B('Three groups', 'standard', 'average_of_averages'), 'Three batches have 8, 12 and 20 items with average weights 50, 60 and 70 g.', [['Batch 1', '50', '8'], ['Batch 2', '60', '12'], ['Batch 3', '70', '20']], 'g'),
  expressionQ(B('Choose the expression', 'standard', 'average_of_averages'), [['Group 1', '18', '7'], ['Group 2', '42', '3']]),
  weightsQ(B('Restaurant rating, weights 5 : 3 : 2', 'standard', 'custom_weights'), 'A restaurant scores 4 for food, 5 for service and 3 for ambience out of 5, with weights 5 : 3 : 2. What is the overall rating (1 decimal place)?', [['Food', '4', '5'], ['Service', '5', '3'], ['Ambience', '3', '2']], 'out of 5', 1),
  numeric(B('Average after one more test', 'standard', 'adding_removing'), 'After 10 tests a student’s average is 62. On the 11th test she scores 84. What is the new average?', afterAdd, undefined, 'marks',
    ['Total so far = average × number of tests.', 'Add the new score, divide by the new number of tests.'], [`Total so far = 62 × 10 = 620.`, `New total = 620 + 84 = 704 over 11 tests.`, `New average = 704 ÷ 11 = ${formatExact(afterAdd)}.`], 'Adding a value is a weighted mean of the old average (weight 10) and the new value (weight 1).'),
  numeric(B('Average after removing a value', 'standard', 'adding_removing'), 'The average of 12 numbers is 50. One of them, 74, is removed. What is the average of the remaining 11 (to 2 decimal places)?', afterRemove, 2, undefined,
    ['Find the total of all 12 first.', 'Subtract the removed number, then divide by 11.'], [`Total of 12 = 50 × 12 = 600.`, `Remaining total = 600 − 74 = 526 over 11 numbers.`, `Average = 526 ÷ 11 = ${f2(afterRemove)}.`], 'Removing a value changes both the total and the count.'),
  numeric(B('Find the missing group average', 'standard', 'average_of_averages'), 'All 50 students have average 68. A group of 30 of them has average 64. What is the average of the other 20?', otherGroup, undefined, 'marks',
    ['Total of all 50 = 50 × 68.', 'Subtract the total of the 30, then divide by 20.'], [`All 50: 50 × 68 = 3400.`, `The 30: 30 × 64 = 1920.`, `The other 20 total 3400 − 1920 = 1480, so their average = 1480 ÷ 20 = ${formatExact(otherGroup)}.`], 'A combined mean and one part determine the other part.'),
  choice(B('Doubling all weights', 'standard', 'weight_changes'), 'Values 4, 8 and 12 have weights 1, 2 and 3. If every weight is multiplied by 3, what happens to the weighted mean?',
    'It stays the same', ['It is multiplied by 3', 'It increases by 3', 'It cannot be found'],
    ['Try computing both means.', 'What cancels in the fraction?'], [`Original: ${formatExact(baseMean)}. With weights 3, 6, 9: ${formatExact(scaledX3)}.`, 'The factor 3 cancels between numerator and denominator.'], 'Only the relative sizes of the weights matter.'),
  numeric(B('Add 1 to every weight', 'standard', 'weight_changes'), 'Values 4, 8 and 12 have weights 1, 2 and 3. Every weight is increased by 1. What is the new weighted mean (to 3 decimal places)?', shiftedMean, 3, undefined,
    ['The new weights are 2, 3 and 4.', 'This is NOT the same as multiplying the weights.'], [`New weights 2, 3, 4: (2×4 + 3×8 + 4×12) ÷ 9 = 80 ÷ 9 = ${formatDecimal(shiftedMean, 3)}.`, `The original mean was ${formatDecimal(baseMean, 3)}, so adding a constant changes the mean.`], 'Adding the same amount to every weight changes the relative weights.'),
  mixtureConcentrationQ(B('Unequal quantities', 'standard', 'mixture'), 'Mix 400 mL of a 5% solution with 100 mL of a 30% solution.', [con('Part 1', '400', 'mL', '5'), con('Part 2', '100', 'mL', '30')], 'solute'),
  mixtureConcentrationQ(B('Mixed units', 'standard', 'mixture'), 'Mix 2 L of a 12% solution with 3000 mL of a 22% solution.', [con('Part 1', '2', 'L', '12'), con('Part 2', '3000', 'mL', '22')], 'solute'),
  soluteAmountQ(B('Amount of solute', 'standard', 'mixture'), [con('Part 1', '250', 'mL', '8'), con('Part 2', '750', 'mL', '12')], 'solute'),
  dilutionQ(B('Dilution with water', 'standard', 'mixture'), [con('Syrup', '6', 'L', '10')], 'solute', '6'),
  choice(B('Impossible target', 'standard', 'mixture_assumptions'), 'Can mixing a 5% solution with an 8% solution ever give a 10% solution?',
    'No, a mixture lies between 5% and 8%', ['Yes, with enough of the 8% solution', 'Yes, if the 5% solution is stirred well', 'Only if the quantities are equal'],
    ['Where does a mixture’s concentration lie compared with its ingredients?'], ['Each ingredient is either 5% or 8% strong.', 'The mixture is a weighted mean of 5 and 8, so it lies between 5 and 8.', '10% is outside that range.'], 'A weighted mean cannot lie outside the values it combines.'),
  choice(B('Different bases', 'standard', 'mixture_assumptions'), 'One liquid’s concentration is “% by volume” (measured in mL). Another’s is “% by mass” (measured in g). Can you mix the percentages directly?',
    'No, they need an explicit conversion first', ['Yes, percentages are always comparable', 'Yes, just add the two percentages', 'Yes, if the numbers are equal'],
    ['Do the percentages measure the same kind of quantity?'], ['A percent by volume compares volumes; a percent by mass compares masses.', 'You need density to convert between them, so they cannot be combined directly.'], 'Percentages are only comparable on the same basis.'),
  mixtureConcentrationQ(B('Salt and sugar separately', 'standard', 'mixture'), 'A 600 mL salt solution (5% salt) is mixed with a 300 mL sugar solution (8% sugar). Each concentration is asked separately; give the SALT concentration to 2 decimal places.', [salt('Salt solution', '600', '5'), { ...sugar('Sugar solution', '300', '8') }], 'salt', 2),
  segmentSelectQ(B('Largest segment in another bar', 'standard', 'stacked_reading'), D.family(), 'g2'),
  shareSelectQ(B('Biggest percentage share', 'standard', 'percent_reading'), D.family(), 'c3'),
  absVsPercentQ(B('Larger percentage, smaller amount', 'standard', 'absolute_vs_percent'), D.smallLarge(), 'c1'),
  chartMC(B('Equal percentages', 'standard', 'absolute_vs_percent'), `Class P and Class Q both show 75% passed in the 100% chart. Do they have the same number of students who passed?`, 'No: 30 passed in P but 300 in Q', ['Yes, 75% is 75%', 'Yes, because the bars are equally long', 'Only if they have the same colours'], ['Check the raw totals.'], [`Class P: 30 of ${f2(groupTotal(D.sameShares(), 'g1'))} passed; Class Q: 300 of ${f2(groupTotal(D.sameShares(), 'g2'))} passed.`, 'Both are 75%, but 30 ≠ 300.'], 'Equal percentages of different totals are different quantities.', D.sameShares()),
  chartMC(B('Empty group', 'standard', 'percent_reading'), 'In a 100% chart, Week 1 has 0 orders in total. What should it show?', 'No data: percentages are undefined', ['0% for each category', '50% for each category', 'A full bar of 100%'], ['What is 0 ÷ 0?'], ['The total is 0, so each share would be 0 ÷ 0, which is undefined.', 'A correct chart shows “no data” instead of inventing percentages.'], 'Shares need a positive total.', D.withEmpty()),
  chartMC(B('Why not stacked → percent?', 'standard', 'chart_comparison'), 'Which statement about stacked and 100% stacked charts is correct?', 'A 100% chart can be made from a stacked chart, but not the other way round', ['A stacked chart can be made from a 100% chart', 'Neither can be made from the other', 'They always contain exactly the same information'], ['What is lost when every bar is scaled to the same length?'], ['Stacked → 100%: divide each part by its bar’s total.', '100% → stacked: impossible, the totals are gone.'], 'Scaling to 100% discards the totals.'),

  // ----- Challenge -----
  numeric(B('Find the missing weight', 'challenge', 'weighted_mean'), 'Class A: 10 students, average 80. Class B: average 50 but unknown size w. The combined average of both classes is 62. How many students are in Class B?', unknownW.kind === 'weight' ? unknownW.value : q(0), undefined, 'students',
    ['Write (10×80 + w×50) ÷ (10 + w) = 62.', 'Multiply out and collect the w terms.'], ['(800 + 50w) = 62(10 + w) = 620 + 62w.', '180 = 12w, so w = 15.', `Check: (800 + 750) ÷ 25 = 62.`], 'An unknown weight can be found by setting the weighted mean to its known value.'),
  unknownBatchQ(B('Unknown alloy batch', 'challenge', 'mixture'), [con('Batch A', '150', 'kg', '60', 'copper'), con('Batch B', '100', 'kg', '40', 'copper')], '45', '50'),
  mixtureConcentrationQ(B('Three-part mixture', 'challenge', 'mixture'), 'Mix 100 mL of 5%, 200 mL of 10% and 300 mL of 15% solution.', [con('Part 1', '100', 'mL', '5'), con('Part 2', '200', 'mL', '10'), con('Part 3', '300', 'mL', '15')], 'solute', 2),
  weightsQ(B('Ratings table with weights', 'challenge', 'custom_weights'), 'Ten customers rated Food (avg 4.2), Service (avg 3.1) and Ambience (avg 4.8) with weights 6 : 4 : 5. What is the combined average rating (to 2 decimal places)?', [['Food', '4.2', '6'], ['Service', '3.1', '4'], ['Ambience', '4.8', '5']], 'out of 5', 2, 'Average', 'Weight'),
  absVsPercentQ(B('Which group has more?', 'challenge', 'absolute_vs_percent'), D.schools(), 'c1'),
  shareSelectQ(B('Biggest share, spending data', 'challenge', 'percent_reading'), makeDataset('Weekly spending', '₹', ['Food', 'Travel', 'Other'], [{ label: 'Home 1', values: [500, 300, 200] }, { label: 'Home 2', values: [1000, 200, 800] }, { label: 'Home 3', values: [100, 250, 150] }]), 'c2'),
  chartMC(B('Spot the invalid inference', 'challenge', 'error_detection'), 'From the 100% chart a student concludes: “Class Q has 75% passes and Class P has 75% passes, so the two classes have the same total number of students.” What is wrong?', 'Equal percentages do not tell you the totals', ['Nothing, 75% means 75 students', 'The classes must have different totals because they are different classes', 'Percentages can only be compared when they differ'], ['What does a 100% chart hide?'], [`The raw data show totals of ${f2(groupTotal(D.sameShares(), 'g1'))} and ${f2(groupTotal(D.sameShares(), 'g2'))}, with identical percentages.`], 'Identical 100% bars can hide very different totals.', D.sameShares()),
  chartMC(B('Pick the matching raw data', 'challenge', 'chart_comparison'), 'This 100% chart shows two groups. Which raw dataset could have produced it? (Set A: Class P 30 passed / 10 failed, Class Q 300 / 100. Set B: Class P 30 / 10, Class Q 300 / 150.)', 'Set A only', ['Set B only', 'Both sets', 'Neither set'], ['Compute each class’s share of passes in each set.'], [`Set A: P = 30 ÷ 40 = 75%, Q = 300 ÷ 400 = 75%. ✓`, `Set B: Q = 300 ÷ 450 = ${formatDecimal(mul(div(q(300), q(450)), HUNDRED), 1)}%, not 75%. ✗`], 'A raw dataset matches a 100% chart only if every group’s shares match.', D.sameShares()),
  numeric(B('Grand total from two bars', 'challenge', 'stacked_reading'), 'Add the totals of all three bars in the chart. What is the grand total (in ₹ thousand)?', grandTotal(D.shops()), undefined, '₹ thousand',
    ['Total each bar first, then add the bar totals.'], [D.shops().groups.map((g) => `${g.label}: ${formatExact(groupTotal(D.shops(), g.id))}`).join('; ') + '.', `Grand total = ${formatExact(grandTotal(D.shops()))}.`], 'The grand total equals both the sum of bar totals and the sum of category totals.', { chart: { dataset: D.shops(), mode: 'absolute' } }),
  numeric(B('Category total across groups', 'challenge', 'stacked_reading'), 'What is the combined number of Girls across both houses?', categoryTotal(D.houses(), 'c2'), undefined, 'students',
    ['Add the Girls segment from each house.'], [`${f2(cell(D.houses(), 'g1', 'c2')!)} + ${f2(cell(D.houses(), 'g2', 'c2')!)} = ${formatExact(categoryTotal(D.houses(), 'c2'))}.`], 'Category totals add across groups.', { chart: { dataset: D.houses(), mode: 'absolute' } }),
];

export const getPracticeQuestionById = (id: string): UDPracticeQuestion | undefined => UNDERSTANDING_DATA_PRACTICE_BANK.find((x) => x.id === id);

export interface AnswerCheck {
  correct: boolean;
  /** Input could not be interpreted (not counted as an attempt). */
  invalid?: boolean;
}

/** Exact checking. Numeric answers that are rounded in the question accept any value that rounds correctly. */
export function checkPracticeAnswer(qn: UDPracticeQuestion, input: UserAnswer): AnswerCheck {
  const a = qn.answer;
  switch (a.kind) {
    case 'choice':
      return input.kind === 'choice' ? { correct: input.index === a.index } : { correct: false, invalid: true };
    case 'number': {
      if (input.kind !== 'number') return { correct: false, invalid: true };
      const v = parseQ(input.text);
      if (!v) return { correct: false, invalid: true };
      if (qEq(v, a.value)) return { correct: true };
      if (a.decimals !== undefined) {
        const half = div(q(1), q(2 * 10 ** a.decimals));
        return { correct: cmp(abs(sub(v, a.value)), half) <= 0 };
      }
      return { correct: false };
    }
    case 'segment':
      return input.kind === 'segment' ? { correct: input.groupId === a.groupId && input.categoryId === a.categoryId } : { correct: false, invalid: true };
    case 'bar':
      return input.kind === 'bar' ? { correct: input.groupId === a.groupId } : { correct: false, invalid: true };
  }
}

export const PRACTICE_COUNTS = {
  total: UNDERSTANDING_DATA_PRACTICE_BANK.length,
  basic: UNDERSTANDING_DATA_PRACTICE_BANK.filter((x) => x.difficulty === 'basic').length,
  standard: UNDERSTANDING_DATA_PRACTICE_BANK.filter((x) => x.difficulty === 'standard').length,
  challenge: UNDERSTANDING_DATA_PRACTICE_BANK.filter((x) => x.difficulty === 'challenge').length,
};

