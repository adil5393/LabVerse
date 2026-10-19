# EDU-1M5 Report: Linear Equations in Two Variables (M5)

Baseline: EDU-1Q (`764d009`). Textbook checked: NCERT Ganita Manjari Grade 9, Part II, Chapter 13 "Two Variables, One Line" (`iemh205.pdf`, 38 pages).

## Summary

M5 gains a Learn path on the shared EDU-1 framework: 7 lessons in 4 units, 4 prerequisites (chapter and unit level), and one synchronized graph, table and substitution-check figure. The existing M5 workbench, 14 guided lessons, practice bank and mastery behaviour are unchanged and still load. The Free Laboratory stays ungated.

## Scope check

The chapter has 13.1 (13.1.1 standard form), 13.2 (13.2.1 algebraic meaning, 13.2.2 geometric visualisation), 13.3 (13.3.1 slope, 13.3.2 slope-intercept), 13.4 pairs of equations, 13.5 algebraic methods, 13.6 graphical method. Slope is in scope, so it is taught. The Learn lessons cover 13.1 to 13.3; 13.4 to 13.6 stay with the existing guided lessons and are said so on the hub. The coverage matrix, which had marked most rows "from chapter summaries", now marks the rows confirmed in the PDF as textbook headings; no exercise or example numbers are cited.

## What was built

- **Model** (`engine/.../twoVariables/learn/model.ts`): composes the existing exact-rational engine (`linearEquation`, `rational`, `graphMath`): substitution check with steps, reversed pair, tables (by x, or by y for a vertical line), intercepts and slope, rise over run, meaningful versus merely satisfying solutions, generated text alternatives.
- **Figure** (`TvVisual.tsx`): editable a, b, c (or m, d), a movable test point, a table whose x-values the student types, a live substitution check, the reversed pair, intercepts, rise and run. Graph, table, readout and alt text come from one equation, so they cannot disagree. Satisfying points are a green circle with a tick; others a red ring with a cross. Axes labelled x and y with ticks. Handles negative coordinates, zero coefficients, vertical and horizontal lines, a line that misses the window (message), a=b=0 (explained, no line), decimals and fractions (exact). Controls: drag, arrow keys on the point, four buttons, number boxes with plus/minus (44 px). No animation.
- **Lessons:** 1 Two quantities, one equation (13.1); 2 Standard form (13.1.1); 3 Solutions are ordered pairs (13.2.1, including why (x, y) is not (y, x)); 4 From a table to a graph (13.2.2: equation → solutions → table → points → line, on and off the line, c = 0 through the origin); 5 Solutions that make sense (mathematical versus real-world, whole-number marks); 6 The steepness of a line (13.3.1: rise ÷ run, horizontal and vertical); 7 y = mx + d (13.3.2: with the proof that m is the slope). 46 independent items, 19 guided steps, steps labelled observe, conjecture, reasoning, proof or apply; one proof-ordering question.
- **Prerequisites:** letters and substitution, signed numbers, solving a simple equation, ordered pairs and the plane (with an interactive point and its reversed pair). Refresher, readiness check and specific feedback; skipping is stored as bypassed; nothing gates.
- **Misconception feedback** is authored per wrong answer: swapped x and y, sign errors, dropped coefficients, stopping early, target used as value, one-solution-only, every-point-is-a-solution, equation-solution-but-not-sensible, slope as intercept, rise/run inverted.
- **Mastery:** uses the shared EDU-1 evidence rules (first try, unassisted, 70%, every objective covered). The existing guided-workbench mastery was audited as honest in EDU-1 and was not changed.
- **Hub:** a Learn section, per-card Learn links, honest reset label ("Reset guided-lesson progress"), 44 px controls.

## Tests

Final run: `tsc -b` clean; frontend **48 files, 936 tests passing** (901 before); backend 22 passing (from the repository root); production build passes; `oxlint` 0 errors, 52 warnings (47 before; the 5 new are fast-refresh export notes).

New tests (35) use independent arithmetic, not the implementation: substitution against floating-point evaluation over a grid of integer and fractional pairs and five equations; every table row verified as a solution, including horizontal and vertical lines; intercept, slope and m = −a/b, d = −c/b; rise over run for several point pairs; c = 0 through the origin for 48 coefficient pairs; whole-number solution counts for the story equations (6, 4 and 1) by brute force; every numeric answer recomputed; correct and wrong pair options checked by substitution; every ordering question over all permutations; objective coverage including the 70%-but-objective-missed case.

**Real Chrome** (dev server; real clicks, typing and keys; the chapter module read only for the right answer):
1. Lesson 3 completed through the UI: Mastered, 7 items, 1 attempt each.
2. Lesson 6 toured with Next only: In progress, no evidence.
3. Lesson 5, every item wrong then right: not Mastered; wrong answers show the authored message.
4. Hint before an answer: recorded as assisted.
5. Prerequisite skipped: recorded as bypassed; lesson and Free Laboratory open.
6. Synchronization: (2, 3) on 3x + 2y = 12 is a solution; ArrowRight to (3, 3) flips the verdict to 15 ≠ 12; ArrowDown twice gives 11 ≠ 12; on-screen buttons reach (2, 4) = 14 ≠ 12; the reversed pair shows 13; typing x = 1 in the table gives y = 9/2 and the pair (1, 9/2); raising a changes the equation line and the solved-for-y line together; b = 0 gives a vertical line that is still drawn; a = b = 0 explains there is no line.
7. No horizontal overflow at 360, 390, 768, 1440 and phone landscape (844 by 390); all new controls at least 44 px.
8. Existing guided progress (one mastered, one completed lesson) loads unchanged.

## Limitations and remaining work

- Learn covers 13.1 to 13.3; pairs of equations, substitution and elimination (13.4 to 13.6) have no Learn lessons and remain the existing guided lessons.
- The old guided store trusts the stored mastery flag on load (it is only ever set from evidence); it was not given an Unverified migration because no unearned flag can be produced by the current code.
- Equation text from the older engine (`formatSlopeIntercept`) uses a hyphen for negative numbers while new text uses a true minus sign.
- "Reset guided-lesson progress" does not clear Learn evidence; the shared education store has no per-chapter reset (same as other chapters).
- A resumed lesson reopens at the last idea.
- No screen-reader testing; keyboard paths and labels verified by script only. The 9 practice-bank questions' wording was not re-audited.
- oxlint's native binding is the manual install from EDU-1P (needs Node 20.19+ on a clean machine).
