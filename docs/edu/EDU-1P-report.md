# EDU-1P Report: Propositions and Their Converses

Baseline: `fbe0fcf` (EDU-1). Audit written first: `docs/edu/EDU-1P-audit.md`.

## 1. Result

The Propositions chapter now has a beginner-first **Learn** path (11 lessons in 6 units) built on the EDU-1 framework, evidence-based mastery with a safe migration, the observed "Next gives mastery" defect eliminated, and several further defects fixed. The Free Laboratory, the guided workbench, the practice bank and every stored record are preserved.

What is **not** done is stated in section 9.

## 2. What the chapter is (verified against the textbook)

The repository calls it "Class 9 NCERT Ganita Manjari: Propositions and Their Converses". I checked the book instead of the description: it is Grade 9, **Part II, Chapter 9** (`iemh201.pdf`, 7 pages). It has **no numbered sections**: it has Statements 1 and 2, Examples 1 to 5, "Think and Reflect" prompts, Exercise Set 9.1 (questions 1 to 17) and a summary.

Consequences fixed in the repository:

- The curriculum matrix, 33 practice questions and the experiment registry cited invented "Section 1 to 11" labels. They now cite what the chapter really contains (for example "Example 5", "Exercise Set 9.1, question 17"), marked "original question" where the question is LabVerse's own.
- The UI called the practice bank "NCERT Practice Engine" and "NCERT Deductive Rationale". It is not NCERT questions; labels corrected.
- Lesson 4 said the theorem and converse "operate as mathematical definitions"; Lesson 8 attributed the converse proof to Euclid. Both unsupported; replaced with what the textbook says.
- Material beyond the chapter is marked **extension** in the lesson text: sorting questions, commands and opinions; Euler's `n² + n + 41`; the acute/obtuse comparison; necessary and sufficient. A test checks that the extension notes exist and that no section or theorem number is invented.

## 3. The Learn path

Units, lessons and what each teaches. Every lesson has explainer steps (with a quick check each), a worked example, guided practice, independent practice, a reflection, declared **objectives**, and a prerequisite list.

| Unit | Lesson | Teaches | Visual (accessible, manipulable) |
|---|---|---|---|
| 1 Statements | 1 Propositions | true-or-false claims; a false statement is still a proposition; what is not one (extension) | tappable grid for a rule about `n` |
| | 2 If P, then Q | hypothesis and conclusion; "Y when X", "all A are B"; what the promise covers | number grid: P outlined, Q filled |
| 2 Converses | 3 The converse | swap the parts; a true statement can have a false converse; no free "going backwards" | grid with a converse toggle |
| | 4 Four possibilities | all four combinations of true/false; reason or counterexample | grid with toggle |
| 3 Counterexamples | 5 Counterexamples | P true and Q false; supporting versus not-covered numbers; Fermat and Euler | grid; counterexample readout |
| | 6 Factors and squares | factor-partner pairs; squares have an odd count; **which direction an argument proves** (textbook Example 3) | factor-pair explorer |
| 4 Geometry | 7 Geometry converses | equal sides and angles; equal area versus congruent (Example 4); equal diagonals and the two sticks (Exercise 17) | draggable triangle, two-triangle pairs, two-sticks quadrilateral |
| | 8 Pythagoras converse | theorem, converse, and the textbook's proof (Example 5), step by step on the figure | adjustable-angle triangle, proof figure with highlighted parts |
| 5 Proof | 9 Why testing is not proof | a pattern that fails after 40 successes; what a proof must cover | evidence strip |
| | 10 Building an argument | ordering steps, choosing reasons, spotting circular or wrong-direction arguments | factor pairs for the proof figure |
| 6 Synthesis | 11 Putting it together | translate, decide with a counterexample or a proof, necessary and sufficient (extension) | grid with toggle |

Totals: 125 questions (104 choice, 8 numeric, 7 counterexample-judged, 6 step-ordering), 62 independent items across 29 objectives, 33 worked-example steps, 27 guided steps, 13 proof lines, 35 visuals, 153 authored wrong-answer explanations covering 50 mistake types.

### The reasoning is practised, not displayed

- **Observe, conjecture, prove, apply:** steps are labelled with their phase. The observation steps state that trying cases suggests a rule and does not prove it. Proof steps show one claim and one reason per line, and selecting a step highlights the matching part of the figure (Pythagoras converse).
- **Arrange the steps** (6 questions): a proof's steps appear scrambled. Any order is accepted in which every step comes after what it needs; a wrong order is explained ("Step 1 relies on ... which has not been placed before it"). No drag and drop: up and down buttons.
- **Counterexample questions** (7): the student types a number and a judge decides. It says specifically whether the number fits the claim (a supporting example), does not satisfy the hypothesis (not covered), or is outside the domain.
- Also: identify what is given and what must be proved; recognise unsupported conclusions (affirming the consequent, the converse used by mistake, circular reasoning, examples offered as proof); choose the right justification.
- No free-text proof is auto-graded.

## 4. Prerequisites

| Prerequisite | Used by |
|---|---|
| True, false, and checking a claim | chapter; Unit 1 |
| The number words (even, odd, multiple, factor, prime, square) | chapter; Units 2, 3, 5 |
| A condition picks out some numbers | Units 2, 3, 6 |
| Triangles: sides, angles, congruent | chapter; Unit 4 |
| A letter that stands for any number | Units 5, 6 |

Each has a plain-language refresher, an optional interactive demo (the factor-pair, grid and triangle visuals), readiness questions with specific wrong-answer feedback, and a link to the refresher the wrong answer points at. Semantics are unchanged from EDU-1: Passed (earned), Needs Review, Skipped (not assessed). Nothing blocks a lesson or the laboratory. A re-check asks only the questions not yet answered correctly.

## 5. Mastery

**The defect (observed, P0):** pressing Next Step through the stages then Complete Lesson set `completed = true, mastered = true`. Reproduced at baseline, fixed, and tested in code and in Chrome.

Rules now (shared with Coordinate Geometry and Circles; extensions are backward compatible):

- Mastery comes only from independent first-try answers with no hint, no revealed solution and no teacher mode, at least 70% of the items.
- **New, shared:** a lesson may declare objectives. Mastery then also needs at least one independent success for **every** objective. This matters when the share rule alone would pass: in Lesson 10, 5 of 7 right is 71% but if the two "choose the justification" items are the misses, the lesson is not mastered, and the page says which goal is missing. Every Propositions objective is tested by at least two items (checked by a test).
- Next, viewing every stage, resuming and refreshing create no evidence (store tests and browser).
- A teacher demonstration is "Demonstrated".
- Repeating a question: one item, many attempts, still one piece of evidence. A wrong first try can never become a first-try success. Help before the first answer makes it assisted for good.

**Old guided workbench**

- `completeLesson` no longer sets mastery.
- Practice evidence is now **persistent** and per question (it was held in memory and could be erased by Retry).
- Retry no longer deletes evidence.
- Hints and solutions are recorded against the answer.
- Mastery is computed from the evidence by the same 70% rule.

**Migration (storage key unchanged, payload version 2):** every record is kept. A lesson marked "mastered" without evidence becomes `mastered: false, legacyMasteryUnverified: true` and is shown as **"Earlier mastery: Unverified"**. It clears only when the student earns it. Corrupt storage, hostile values and no storage at all do not throw.

## 6. Other defects found and fixed

| Defect | Evidence |
|---|---|
| Proof workbench: the same first step five times was reported "Proof Complete & Verified". Reasons were matched by kind, so a "test run" justified a definition. Fixed: each step once, the exact justification, all steps required. | Observed (run) |
| Equal-diagonals figure: "General Quadrilateral" drew a rectangle labelled "EQUAL" while the banner said unequal; numbers (6.4, 5.0, 4.8, 6.2) were not computed from any figure. Now every figure is defined by coordinates; diagonals, angles and the drawing come from them; a rhombus option added. | Observed (browser) |
| **A hint taken before answering locked the practice question** (options disabled, no Submit button), so a student asking for help could never answer. | Observed (real Chrome, found during EDU-1P) |
| The practice question numbers, hub cards and experiment cards were `div`s or unnamed buttons; the hub cards could not be reached by keyboard. | Observed |
| The "Observe" note in the shared lesson page said "every circle" (wrong for this chapter). | Observed |
| Mastery earned directly in practice mode was not shown on the hub (no lesson record). Now read from the evidence. | Observed (browser) |

## 7. Accessibility and responsive design

- Every new visual has a generated text alternative that lists the facts it draws (for the grid: which numbers satisfy each part, and where the first is true and the second false), a live readout, and keyboard controls. Meaning is carried by an outline, a symbol and words as well as colour. Grid cells say "First part true. Second part false. Counterexample."
- Nothing needs drag: tapping a grid number, nudging buttons for the triangle, sticks and number stepper, up/down buttons for ordering. The triangle vertex and circle handles also take arrow keys, with a visible focus ring.
- Existing workbench: 14 unlabelled inputs, sliders and selects got accessible names; the guided panel stacks under the workbench on small screens; touch targets raised to 44 px on the hub, guided toolbar, stage tabs, practice buttons and question numbers.
- Reduced motion: nothing in the Learn path animates. A stylesheet rule disables transitions and animations in the learning pages under `prefers-reduced-motion`; verified by emulating the preference and reading computed styles.
- No horizontal overflow at 360, 390, 768, 1440 or phone landscape (844 by 390), including the old workbench. Remaining small control: the teacher-mode checkbox is 20 px inside a 44 px tall label.

## 8. Verification

**Automated:** frontend 44 files, **827 tests**, all passing (763 before). Backend 22 passing. `tsc -b` clean; production build succeeds.

New tests cover: chapter and unit prerequisites, explainers, feedback tied to each wrong answer and remedial links (shared integrity suite); the authored truth of every claim against brute force to 5000; the partner-pair argument for every n up to 2000; Fermat and Euler arithmetic with exact integers; counterexample judges over many numbers; geometry (isosceles both directions, the altitude proof figure, equal area, Pythagoras for integer triples and its monotonic dependence on the angle, the two-sticks classification across angles and crossings); step-ordering evaluation against **every permutation** of every ordering question; objective coverage (including the 71% case); mastery, abuse resistance and migration (store, pure rules, hostile storage); the proof workbench and equal-diagonals fixes; honesty of references; architecture (lazy loading, no network, no animation, focus ring, registry on every page).

**Lint:** `oxlint` failed to start. Diagnosis: its Windows binding `@oxlint/binding-win32-x64-msvc` is an optional dependency that requires Node `^20.19 || >=22.12`; this machine has Node 20.17.0, so `npm` skipped it silently. I installed that binding by hand into `node_modules` (untracked; no change to the repository), after which lint runs: **0 errors, 42 warnings** (React style notes in older files; none introduced by this milestone beyond fast-refresh export notes). A clean install needs Node 20.19 or newer, which Vite also asks for.

**Real Chrome (dev server and production preview), real clicks, typing and key presses**

- Every one of the 11 Learn lessons was completed through the UI and reached Mastered, including the counterexample and ordering questions. 73 wrong answers were submitted through the UI; each showed its authored specific feedback; no console errors. The Coordinate Geometry (7 lessons, 28 wrong answers) and Circles (11 lessons, 44) sweeps were re-run after the shared changes and still pass.
- Abuse scenarios: Next through every stage; refresh and resume; teacher mode; hints; revealed solutions; one question answered five times; wrong first then right; 71% with a missed objective; the old workbench Next Step and Complete Lesson; legacy "mastered" data.
- Journey: hub, prerequisites with a wrong answer and a skip, Lesson 1 start to Mastered, resume, hub status; Free Laboratory opens immediately and writes no progress.
- Keyboard-only: grid cells, converse toggle, ordering without drag, triangle vertex, sticks controls.
- Production build served by `vite preview`: the same journey and abuse scenarios pass.

**Bundle (production, raw / gzip), before to after**

| Chunk | Before | After |
|---|---|---|
| Entry | 287.94 / 89.50 kB | 288.25 / 89.57 kB |
| CSS | 67.15 / 11.99 kB | 68.43 / 12.25 kB |
| `PropositionsLab` | 11.53 / 2.73 kB | 12.69 / 3.11 kB |
| `usePropositionsStore` | 47.58 / 13.34 kB | 50.15 / 14.15 kB |
| `PropositionsWorkbenchPage` | 130.78 / 28.69 kB | 133.63 / 29.62 kB |
| Shared `LearnLessonPage` | 40.21 / 10.54 kB | 44.03 / 11.61 kB |
| New `PropositionsLearn` | none | 136.95 / 39.18 kB |

The Learn chunk loads with the Propositions hub, because the hub lists the lessons and their prerequisites.

## 9. Limitations and remaining work

- **Lesson 12** (chapter practice) and the original 12 guided Investigate lessons keep their concise text; only their errors were corrected. The 33-question practice bank is unchanged apart from references and mastery bookkeeping. I read nine of its answers; I did not re-audit all 33.
- Only the textbook's own proofs are formalised (Statement 2 via the altitude, the Pythagoras converse, the factor-partner argument) plus the elementary algebra proofs. Pythagoras's theorem itself, and the other-direction proof for perfect squares (at most one repeated pair), are used as known and named; they are not re-proved.
- The Pythagoras acute/obtuse comparison, Euler's polynomial and necessary/sufficient are extensions, labelled.
- The "Reset Chapter Progress" button on the hub resets the guided-workbench record only. Learn evidence is stored in the shared education store, which has no per-chapter reset (same as Circles). A per-chapter reset is the next sensible small step.
- Not tested with a screen reader (NVDA, VoiceOver); semantics, labels and keyboard paths are verified by script only. PWA/Capacitor packaging was not exercised.
- The sticks visual changes one setting per button press; there is no pointer drag for the stick ends.
- The Chrome driver reads expected answers from the dev server's modules; every input to the page was real. The production run used static answers.
- Lint needs Node 20.19+ to install its native binding on a fresh machine (see section 8).
