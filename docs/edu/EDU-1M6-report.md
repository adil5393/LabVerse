# EDU-1M6 Report: Understanding Data (How Quantities Combine)

Baseline: EDU-1M5 (`6c48a70`). Textbook checked: NCERT Ganita Manjari Grade 9, Part II, Chapter 10 "How Quantities Combine: Understanding Data" (`iemh202.pdf`, 29 pages).

## Summary

1. The critical hint defect is fixed first and covered by regression tests, in the store and in the real practice UI.
2. M6 gains a Learn path on the shared EDU-1 framework: 6 lessons in 4 units, 3 prerequisites (chapter and unit level), and two synchronized, editable figures built on the existing exact-fraction engines and chart components.
3. The Free Laboratory, the 14 guided lessons and the practice bank are unchanged and ungated.

## Mastery defect (fixed first)

**Reproduced:** `submitPracticeAnswer` set `firstAttemptCorrect = correct` whenever `attempts` was 0, even if a hint or the solution had been opened first. A hint, then a correct answer, counted as unassisted mastery evidence.

**Fixed:**
- Help requested before the first answer sets `assisted` for good (also when the solution is hidden again or the question retried).
- Only the first answer decides independence. Help after it changes nothing.
- Mastery counts `isIndependent` attempts only.
- Older saved attempts carry no `assisted` flag; if they used a hint or solution they cannot be trusted. On load, a mastered lesson whose evidence no longer supports mastery becomes `mastered: false, legacyMasteryUnverified: true`. Nothing is deleted, and the hub shows "Earlier mastery: Unverified". Earning mastery again clears the flag.
- One fixture of the M6.1 migration test had a mastered lesson with a single answer on file; real old mastery always had every answer, so the fixture now does.

## Curriculum coverage (verified against the PDF)

| Chapter content | Learn lesson |
|---|---|
| 10.1.1 Average of averages, combined mean, equal sizes | 1 |
| 10.1.3 Custom weights, ratings, weighted mean formula, adding or removing a value | 2 |
| 10.1.2 Mixtures, unknown quantity | 3 |
| 10.2.1 Stacking columns, clusters chosen by focus | 4 |
| 10.2.2 100% stacked bars, pie charts, what can and cannot be inferred, stacked to 100% but not back | 5 |
| 10.2.2 Typical Day: what an average hides (optional in the guided path) | 6 |

**Not in the chapter, so not taught:** median, mode, range, frequency tables, histograms, frequency polygons. The existing registry already marks these "not covered"; a test fails if lesson text teaches them. No example or exercise numbers are cited.

## What was built

- **Model** (`engine/.../understandingData/learn/model.ts`): composes `weightedMean`, `charts`, `pie` and `averageDay` (exact BigInt fractions, honest rounding marks). The weighted figure and the chart figure each read from one source, so graph, table, calculation and text cannot disagree.
- **Weighted figure:** edit values and weights (type, or plus and minus buttons); bar width is the weight and height the value, so area is weight times value; the weighted mean and the plain average are drawn and written; step-by-step calculation; zero total weight, negative weight and empty input give a message, never a number.
- **Chart figure:** one editable table drawn as stacked, 100% stacked, clustered (by group or by category) or pie, using the existing chart components. Row, column and grand totals, shares and the written summary all update from the same table. Average-day row for lesson 6.
- **Lessons:** each has explainer steps labelled observe, conjecture, reasoning or apply, a worked example, guided practice and 5 to 6 independent items with authored feedback per wrong answer (average of averages, total mistaken for average, share mistaken for amount, truncated axis, top of a segment mistaken for its value, and so on) and refresher links. Objectives per lesson; mastery needs every objective.
- **Prerequisites:** the average (total divided by count), fractions, percentages and ratios, reading a table and a bar. Refresher, readiness checks and an optional demo; skipping is recorded as bypassed and nothing gates.
- **Hub:** a Learn section, per-card Learn links, Unverified note, honest reset label ("guided-lesson progress"), keyboard and 44 px controls. Shared change: the `VisualHost` figure gets `min-w-0` (stops wide tables stretching the page).

## Tests

Final run: `tsc -b` clean; frontend **50 files, 980 tests passing** (936 before); backend 22; production build passes; `oxlint` 0 errors, 57 warnings (52 before; the 5 new are fast-refresh export notes). One existing, unrelated test (`subjectNavigation`: Quadrilateral store parallelogram constraint) failed once in the first full run and passed alone and on the rerun, so it is flaky.

New tests (45): hint-before-answer regression, solution-assisted, help after the first answer, wrong-then-right, repeated question, lesson-level mastery with and without help, legacy migration (kept as Unverified, clean evidence kept, corrupt storage); weighted mean against floating-point arithmetic over 400 random sets with decimals; ratio-only weights, bounds, equal weights, zero, negative and empty inputs, a single item, zero-weight items, negative values, exact one third; shares and pie angles (exact 100 and 360); a doubled shop with identical shares and different totals; totals against independent sums; a cell edit changing exactly the cell, row, column and grand totals; a zero-total group; average day against hand calculation; the written description equal to the table; every numeric answer recomputed; objective coverage including 70% with a missed objective.

**Real Chrome** (dev server; real clicks, typing and keys; the chapter module read only for the right answer):
1. Lesson 1 completed through the UI: Mastered, 6 items, 1 attempt each.
2. **The hint defect in the real old practice UI:** hint, then 62 submitted correctly: recorded `firstAttemptCorrect: false, assisted: true`.
3. Hint before a correct first answer in a Learn lesson: assisted.
4. Wrong then right on every item: not Mastered. Next-only through all stages: In progress, no evidence.
5. Prerequisite skipped: bypassed; lesson and Free Laboratory open.
6. Editing Shop C laptops 15 to 25: the chart bars, the row total (40 to 50), the grand total (195 to 205) and the written summary changed together; in the 100% view the shares followed (Phones 40%, Laptops 50%, Tablets 10%). Changing a class size to 10 made the weighted mean equal the plain average (70) with a matching calculation; zero weights gave a message.
7. Keyboard: Enter on a focused chart-type button switched the chart.
8. No horizontal overflow at 360, 390, 768, 1440 and phone landscape (844 by 390); new controls at least 44 px.
9. Legacy: an old mastered lesson with a hint-assisted answer loaded as Unverified ("0 mastered"), record intact.

## Limitations and remaining work

- No new chart types were added: the chapter has no histogram or frequency material, so unequal class widths and frequency density are out of scope.
- At 360 px the editable tables scroll sideways inside their own region rather than reflowing.
- The 13 guided lessons and the 54-question practice bank keep their original text; only their mastery tracking changed. They were not re-audited.
- The existing chart components were reused as they were; their own keyboard and screen-reader behaviour was not re-audited (the tables and text summaries beside them carry the same information).
- Old mastery with incomplete answers is marked Unverified, which is stricter than before by design.
- "Reset guided-lesson progress" does not clear Learn evidence (no per-chapter reset in the shared store).
- No screen-reader testing. oxlint's native binding is still the manual install from EDU-1P.
