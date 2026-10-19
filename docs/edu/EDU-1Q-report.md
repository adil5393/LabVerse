# EDU-1Q Report: Quadrilaterals

Baseline: EDU-1 and EDU-1P. Textbook checked: NCERT Ganita Manjari Grade 9, Part II, Chapter 12 (`iemh204.pdf`, 34 pages).

## Summary

Quadrilaterals now has a Learn path on the shared EDU-1 framework: 8 lessons in 5 units, 5 prerequisites (chapter and unit level), interactive figures, worked examples, guided practice and independent practice with misconception feedback. Mastery is evidence-based and old unearned mastery is kept and shown as Unverified. The Free Laboratory is unchanged and ungated.

## Findings and fixes

| Finding | Fix |
|---|---|
| **Mastery (P1).** The guided workbench counted one question answered correctly three times as mastery. Hints and solutions were not recorded. | The guided store now keeps per-question evidence: only the first, unassisted answer counts, hints, solutions and teacher mode are recorded as help, and the shared 70% rule applies. The two pure rules moved to `engine/mathematics/guidedLearning/mastery.ts`; the Circles store re-exports them (no behaviour change). A load-time migration keeps every record and marks old mastery Unverified. |
| **Free Laboratory tiling left gaps.** The lattice vectors were wrong: about half the plane was uncovered, for a square and for a general quadrilateral. | Lattice vectors are now the diagonals A→C and D→B. The cell area equals the area of its two tiles. A coverage test samples 1600 points for six shapes, including a dart: 0 gaps, 0 overlaps. |
| **Invented textbook references.** "Theorem 12.1 to 12.11", "Section 12.5 to 12.10", "Classic 8.9", "Activity 12.1", "Example 1/2" appear nowhere in the chapter. The chapter has Sections 12.1 to 12.4 (12.3.1, 12.3.2) and Theorems 1 to 9. | Registry, guided path, experiments and practice bank now cite real sections and theorems, or say "original question". A test fails on any reference outside Sections 12.1 to 12.4 and Theorems 1 to 9. |
| The practice bank was labelled "NCERT examination questions". | Relabelled "Practice Bank", original questions. |
| "Reset Chapter Progress" implied it reset everything but cleared only the workbench record. | Relabelled "Reset Investigate progress", with the confirmation saying Learn progress is kept. |
| The free board's `classifyQuadrilateral` accepts lengths within 0.15 and directions within about 3 degrees. Fine for a board, wrong for lessons about what a condition guarantees (a nearly parallel pair was called a parallelogram in a test). | The Learn model uses exact predicates (tolerance 1e-6) built from the same engine primitives. The engine is unchanged. |
| A real-browser run found a crash: triangle figures called the four-sided analysis. Unit tests could not see it. | Fixed; the lessons with triangle figures (4 to 6, prerequisites) now render. |

## What was built

- **Model** (`engine/mathematics/quadrilaterals/learn/figure.ts`): exact analysis of any four points; midpoint, converse, centroid (found by intersecting two medians, so concurrence is a real check), Varignon and tiling coverage. Figures, readouts, text alternatives and answers all come from it.
- **Lessons** (textbook 12.1 to 12.4): 1 What is a quadrilateral; 2 Parallelogram properties (Theorem 1); 3 Tests for a parallelogram (Theorems 2 to 5, and conditions that are not enough); 4 Midpoint Theorem (6); 5 Its converse (7); 6 Medians and the centroid (8); 7 Midpoints of a quadrilateral (9); 8 Tiling. 51 independent items (5 are proof-ordering questions), 23 guided steps, 20 explainer checks, 10 prerequisite checks and 8 line-by-line proofs.
- **Observe, conjecture, prove:** steps are labelled by phase. Observation steps say that trying cases suggests and does not prove; a test checks that no observation step claims proof and that every proof lesson observes first. Proofs are line by line, one reason each, and select highlights in the figure.
- **Figures:** one `quadFig` (free quadrilateral, parallelogram that stays a parallelogram, midpoint, converse with a slider for P, centroid with proof, angle wheel, tiling) and one `quadGallery` (tap the figure). Drag, arrow keys on a focused vertex, or buttons (vertex picker and four arrows, 44 px). Focus ring, live status line, generated text alternatives.
- **Prerequisites:** angles, parallel lines and a transversal, congruent triangles, "if … then" and converses, midpoints. Refresher, optional demo, readiness check with specific feedback; skipping is stored as bypassed. Nothing is gated.
- **Shared change** (backward compatible): `engine/education/builders.ts` (`pick`, `num`, `ord`, `ind`).
- **Hub:** a Learn section, per-card Learn links, Unverified note, 44 px controls, no horizontal overflow at 360 px.
- Not modified: Coordinate Geometry, Circles and Propositions content or behaviour. The Circles store only moved two pure functions to the shared module and re-exports them.

## Tests

Run at the end, once: `tsc -b` clean; frontend **47 files, 901 tests passing** (was 827); backend 22 passing (run from the repository root: `python -m pytest backend/tests`); production build succeeds; `oxlint` **0 errors, 47 warnings** (42 before: five are fast-refresh export notes in the new files). The native binding for oxlint is still the manually installed one from EDU-1P and needs Node 20.19+ on a clean machine.

New automated coverage (74 tests): every theorem 1 to 9 checked on thousands of random figures including non-convex; the four tests sufficient and the weaker conditions refuted by counterexample; question arithmetic checked against the mathematics; every permutation of every ordering question; each wrong gallery figure really lacks the property; objective coverage (including the case where 70% is reached but an objective is missed); mastery abuse (repeats, wrong-then-right, assisted, teacher mode, Next only); migration and hostile storage; reference honesty; tiling coverage.

**Real Chrome** (dev server; inputs were real clicks, typing and key presses, the chapter module was read only to know the right answer):

1. Lesson 2 completed through the UI with every independent item right first try: Mastered, 7 items with 1 attempt each.
2. Lesson 5 toured stage by stage with Next only: In progress, no evidence.
3. Lesson 4: every independent item answered wrong then right: not Mastered; wrong answers show the authored message.
4. Hint before an answer: recorded as assisted, not unassisted.
5. Prerequisite skipped: recorded as bypassed; the lesson and the Free Laboratory open regardless.
6. Keyboard: ArrowRight moves a focused vertex; the buttons move it and the readout follows; angle wheel totals 360° before and after.
7. Layout at 360, 390, 768 and 1440 px: no horizontal overflow; all new controls at least 44 px (the remaining small items are the global header, the shared lesson breadcrumb and the 20 px teacher-mode checkbox in a 44 px label).
8. Legacy record seeded in storage: shown as Unverified, history kept.
9. Old workbench: one question answered correctly four times: 1 of 2 correct, not mastered.
10. Gallery and numeric answers: wrong tap and wrong value get their own explanation; the correct tap is first-try evidence.

## Limitations and remaining work

- Not every answer was driven in the browser (by design: lesson 2 fully, other lessons by pattern); the rest is covered by the unit tests.
- The guided workbench lessons (13) keep their original text. Only their references were corrected and their mastery rule fixed; Learn links map each to its Learn lesson (workbench lessons 12 and 13, revision and practice, have none).
- 9 of the 33 practice-bank questions were not re-audited line by line; only their references and mastery bookkeeping changed.
- The tiling lesson shows the half-turn pairing and checks it by eye and by test. The textbook asks students to explore it experimentally; a written proof is not included.
- Theorem 7 is described as the textbook's converse, which keeps a midpoint and a parallel line rather than swapping the two halves of Theorem 6. Lesson 5 says so.
- "Reset Investigate progress" does not clear Learn evidence: the shared education store still has no per-chapter reset (same as Circles and Propositions).
- A resumed lesson reopens at the last idea, so the first figure is not always the first thing shown on a second visit.
- No screen-reader or PWA testing. The hub's chapter practice bank and the 13-lesson workbench were not redesigned.
