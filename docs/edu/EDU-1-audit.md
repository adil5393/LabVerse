# EDU-1: Educational Audit

Scope: every learning module in LabVerse as of commit `82c010a` (before EDU-1).
Goal: find where a student's understanding is at risk, fix it in the two pilot chapters (Coordinate Geometry and Circles), and record everything else as a roadmap. Unrelated modules were **not** changed.

## How to read this audit

Every finding carries an evidence label:

- **Observed**: reproduced by running code, a test, or a real Chrome session during EDU-1.
- **Suspected**: inferred from reading the source or the page; not reproduced.

Priorities: **P0** teaches or records something false; **P1** misleads progress or blocks a student; **P2** a weaker learning experience or an accessibility gap.

NCERT alignment was checked against the textbook text for Ganita Manjari, Grade 9, Part I (Chapter 1 for Coordinate Geometry, Chapter 5 for Circles). Section titles, theorem numbers and chapter summaries were read from the text. No textbook sentence or exercise was copied; all explanations and questions in the new lessons are original.

## Summary

| Module | Structure | Explanations | Visual learning | Experiments | Practice | Progress honesty | Accessibility |
|---|---|---|---|---|---|---|---|
| Coordinate Geometry (before) | 1 workbench, no lessons | none | canvas workbench | 1 (distance) | none | none | partial |
| Circles (before) | 12 + 1 lessons, staged | short, inside inspector | canvas workbench, strong | 13 | 1 to 3 per lesson | **inflated** | weak |
| Quadrilaterals | 13 lessons, staged | short | canvas | many | per lesson | **inflated** | none |
| Propositions | 12 lessons | text | SVG | few | per lesson | **inflated (P0)** | none |
| Two Variables (M5) | 6 + lessons | good | SVG, strong | many | strong | honest | good |
| Understanding Data (M6/M6.1) | lessons | good | SVG, strong | many | strong | one gap (hints) | good |
| Physics: Electricity | 6-step LED guide | step text | breadboard SVG | 1 guided build | none | none saved | none |
| Chemistry: States of Matter | 6-step guide | step text | particle canvas | 1 guided run | none | none saved | none |

After EDU-1: Coordinate Geometry (3 units, 7 lessons) and Circles (4 units, 11 Learn lessons) have prerequisites, explainers, worked examples, guided and independent practice, targeted feedback and evidence-based progress.

## Per-module audit

### 1. Coordinate Geometry

| Area | Finding | Evidence |
|---|---|---|
| Structure | Only a distance workbench existed (`experimentsCount: 1`). The NCERT chapter begins with the axes, the origin, plotting, the order of coordinates, quadrants and points on the axes, then distance (sections 1.3 and 1.4). None of that was taught. A route redirected straight into the workbench. | Observed |
| Explanation | None in the product. A student who did not know that (x, y) differs from (y, x) had nowhere to learn it. | Observed |
| Visual learning | The workbench canvas is accurate and interactive for distance, but nothing visual taught signs, quadrants or axis distances. | Observed |
| Experiments | One. | Observed |
| Practice | None. | Observed |
| Progress | None. | Observed |
| Accessibility | The canvas has no text alternative or keyboard path. | Observed |

Result: P1 (a missing foundation). **Remediated in EDU-1** (pilot).

### 2. Circles

| Area | Finding | Evidence |
|---|---|---|
| Structure | Good: 4 units, 12 core lessons plus an optional tangents extension, staged Understand, Predict, Experiment, Observe, Explain, Practise. Free Workbench and Chapter Practice are always open. | Observed |
| NCERT references | The registry, the 13 experiments and the practice solutions cited invented numbering ("Theorem 9.1 to 9.11", "Old 10.x", "Section 1" to "Section 5"). The textbook has Chapter 5, sections 5.1 to 5.8, Theorems 1 to 12. The lesson order (midpoints before equal chords) also differs from the book. **P0 (false citations shown to students).** | Observed |
| Mastery | Answering the **same** practice question correctly 3 times set `practiceMastered = true`; `practiceCorrectCount` could exceed the number of questions. Hints and revealed solutions were never recorded. **P1.** | Observed (ran it) |
| Hint state | In the guided inspector the "hint revealed" and "solution shown" flags were shared by all questions of a lesson, so help on question 1 appeared on question 2. **P2.** | Observed (code) |
| Prerequisites | None. | Observed |
| Explanation | One concept card and a "why" paragraph per lesson, shown in a narrow inspector. No worked example. | Observed |
| Proofs | Proof steps exist in the workbench, but the measured experiment and the proof are not separated, and a measured example can look like a proof. | Observed |
| Visual learning | Strong and accurate canvas, 13 experiments. Not available to screen readers. | Observed |
| Accessibility | 11 aria attributes across the module, a single canvas, no text equivalents for measurements. | Observed (counts) |
| `geometry.ts` | Comments in the verification helpers name theorems with wrong numbers ("Theorem 3", "Theorem 5", "Theorem 6"). The code is correct; the comments are not student-visible. | Observed |

**Remediated in EDU-1** (pilot): NCERT references corrected in the registry, experiments and practice bank, with a regression test; mastery rebuilt on per-question evidence with a migration; per-question hint state; new Learn layer with prerequisites for the chapter and for every unit.

### 3. Quadrilaterals (not changed)

| Area | Finding | Evidence |
|---|---|---|
| Mastery | `recordPracticeResult` uses the same rule as the pre-EDU-1 Circles store. The same question answered correctly 3 times gave `practiceMastered = true`, `practiceCorrectCount = 3`. **P1.** | Observed (ran it) |
| Hints and solutions | Not recorded against mastery. | Suspected |
| Prerequisites, worked examples | None. | Observed |
| Accessibility | 0 aria attributes, 1 canvas. | Observed (counts) |

### 4. Propositions and Converses (not changed)

| Area | Finding | Evidence |
|---|---|---|
| Mastery | `completeLesson` sets `completed: true, mastered: true`. Pressing **Next** through every stage of a lesson (no answer given) produced `completed = true, mastered = true`. **P0 for progress honesty.** | Observed (ran it) |
| Prerequisites, worked examples | None. | Observed |
| Accessibility | 0 aria attributes. | Observed (counts) |

### 5. Two Variables, One Line (M5, not changed)

| Area | Finding | Evidence |
|---|---|---|
| Mastery | `lessonMasteryEarned` requires a prediction, a minimum number of interactions, and at least 70% of practice questions correct on the first attempt. A hint taken before the first answer keeps `firstAttemptCorrect = false`. Teacher demonstration cannot master. | Observed (ran it) |
| Prerequisites | None. A student who does not know the number line or signed numbers has no refresher. **P2.** | Observed |
| Accessibility | 64 aria attributes, 38 roles, keyboard controls. The best of the older modules. | Observed (counts) |

### 6. Understanding Data (M6 and M6.1, not changed)

| Area | Finding | Evidence |
|---|---|---|
| Mastery | `submitPracticeAnswer` sets `firstAttemptCorrect = correct` when only a hint had been revealed (`attempts` is still 0). A hint followed by a correct first answer **counts as an unassisted first-attempt success**. **P1.** | Observed (ran it) |
| Prerequisites | None. **P2.** | Observed |
| Accessibility | 91 aria attributes, 63 roles. Strong. | Observed (counts) |

### 7. Physics: Electricity (not changed)

| Area | Finding | Evidence |
|---|---|---|
| Structure | One guided LED build in six steps. No prerequisites, prediction, practice or reflection. | Observed |
| Progress | Nothing is saved. | Observed |
| Visual learning | Breadboard SVG with current-flow overlay; the only module that honours `prefers-reduced-motion`. | Observed |
| Accessibility | 0 aria attributes in the lab and the workbench; interaction is pointer-based. **P2.** | Observed (counts) |

### 8. Chemistry: States of Matter (not changed)

| Area | Finding | Evidence |
|---|---|---|
| Structure | One guided run, "Heating Water", six steps. No practice, prediction or prerequisites. | Observed |
| Progress | Nothing is saved. | Observed |
| Visual learning | A particle canvas; 0 aria attributes, no text equivalent of the heating curve. Animated continuously with no reduced-motion setting. **P2.** | Observed |

### 9. Other

- **Mathematics Workbench (generic):** pointer-driven, no keyboard path, no text alternative. P2.
- **Subject Explorer and header:** the "Auto-saved to browser" badge is accurate for the stores that persist; it is not true of Electricity and Chemistry. P2 (wording).
- **Reduced motion:** a single `prefers-reduced-motion` check exists in the whole app (the current-flow overlay). Three `animate-pulse` badges in Circles, Quadrilaterals, Propositions and the Chemistry/Workbench labs are decorative. P2.
- **Font dependency:** icons use the Material Symbols font from a CDN stylesheet (pre-existing). Offline use shows icon names as text. P1 for the future offline/PWA goal. Not changed.

## Prioritised findings

| # | Priority | Module | Finding | Evidence | Status |
|---|---|---|---|---|---|
| 1 | P0 | Propositions | Next-only produces completed and mastered | Observed | Roadmap (EDU-2) |
| 2 | P0 | Circles | Invented NCERT section and theorem numbers shown to students | Observed | **Fixed** |
| 3 | P1 | Circles | Same question repeated gives mastery; count exceeds total | Observed | **Fixed** |
| 4 | P1 | Quadrilaterals | Same repeated-question mastery | Observed | Roadmap |
| 5 | P1 | Understanding Data | Hint then correct counts as unassisted | Observed | Roadmap |
| 6 | P1 | Coordinate Geometry | No axes, quadrants, plotting or practice in the product | Observed | **Fixed** |
| 7 | P1 | All | No prerequisites or readiness checks anywhere | Observed | **Fixed in the two pilots** |
| 8 | P1 | Circles (new, found in Chrome) | Overlapping touch areas at the centre sent a tap on a diameter to the radius | Observed | **Fixed** |
| 9 | P1 | App | Icon font loaded from a CDN | Observed | Roadmap |
| 10 | P2 | Circles | Hint and solution state shared across questions | Observed | **Fixed** |
| 11 | P2 | Electricity, Chemistry | No practice, no saved progress, no accessibility semantics | Observed | Roadmap |
| 12 | P2 | Workbenches | No keyboard path, no text alternative for canvases | Observed | Roadmap |
| 13 | P2 | M5, M6 | No prerequisites or readiness checks | Observed | Roadmap |
| 14 | P2 | App | Decorative pulse animations; one reduced-motion check | Observed | Roadmap |
| 15 | P2 | Quadrilaterals | Hints and solutions not tied to mastery | Suspected | Roadmap |

## Visualization coverage audit

"Visualizable" means a quantity or relation that a picture, a diagram or a manipulable can show faithfully.

| Concept | Visual before | Visual after EDU-1 | Manipulable | Text alternative | Keyboard | Touch size |
|---|---|---|---|---|---|---|
| Axes, origin, (x, y) | none | plane explorer with projections | yes | live readout and caption | arrows and buttons | 48 px |
| Order of coordinates | none | two look-alike points, plotting by tapping | yes | readout | yes | 48 px |
| Quadrants and signs | none | shaded quadrants, point readout | yes | readout | yes | 48 px |
| Distance from the axes | none | dashed projections | yes | readout | yes | 48 px |
| Distance and midpoint | workbench canvas | right triangle with live legs, midpoint dot | yes | readout | yes | 48 px |
| Number line, signs | none | number line | pick | caption | buttons | 48 px |
| Circle parts, equal distance | workbench | draggable point, segment picker | yes | readout and caption | arrows | 48 px |
| Perpendicular, chord, distance | workbench | chord with marked right angle and live halves | yes | readout | arrows | 48 px |
| Central angle, inscribed angle | workbench | draggable P, live ratio, highlighted proof steps | yes | readout | arrows | 48 px |
| Cyclic quadrilateral | workbench | draggable B and D, live sums, highlighted arcs | yes | readout | arrows | 48 px |
| Concyclicity tests | workbench | figure with measured opposite angles | partial | readout | n/a | 48 px |
| Tangents (extension) | workbench | unchanged | n/a | none | n/a | n/a |
| Other modules | existing | unchanged | | | | |

Remaining gaps in the two pilots: tangents (outside the chapter), a drag version of the concyclicity test, and animation of reflection and rotation (intentionally omitted: no decorative animation).

## Framework added (chapter-neutral)

- Types and pure logic: `frontend/src/engine/education/` (`types.ts`, `evaluate.ts`, `progress.ts`).
- Evidence store: `frontend/src/store/useEducationStore.ts`, persisted locally under `labverse_edu_progress_v1` with a versioned migration.
- Shared components: `frontend/src/features/education/` (ChapterHub, ChapterIntroduction, UnitIntroduction, ChapterPrerequisites, UnitPrerequisites, ConceptExplainer, WorkedExample, GuidedPractice, IndependentPractice, LearningReflection, MisconceptionFeedback, QuestionView, LearnLessonPage).
- A chapter supplies **data** and a **visual registry**; the shared code imports no chapter code.

### Progress rules

- Statuses: not started, in progress, completed, demonstrated, mastered, needs review.
- Mastery counts only independent items answered correctly **on the first try** with no hint, no revealed solution and no teacher mode; at least 70% of items.
- Never inferred from: Next clicks, reading explanations or the worked example, skipping a prerequisite, a teacher demonstration, revealing a solution, or doing an experiment.
- A bypassed prerequisite is stored as `bypassed` and shown as "Skipped (not assessed)". It is never `passed`.
- Version 0 data (booleans) migrates to assisted records so it cannot become mastery.
- The last stage a student visited is stored only for resume; it is navigation, not evidence, and a lesson with only a stage recorded is still "not started".
- A readiness re-check asks only the questions the student has not yet answered correctly.

## NCERT verification and limits

Verified against the textbook text: Coordinate Geometry (Chapter 1: sections 1.3 and 1.4, the quadrant sign pattern, the rule that (x, y) equals (y, x) only when x equals y, the distance rule and its name); Circles (Chapter 5: sections 5.1 to 5.8, Theorems 1 to 12, the statements of Theorems 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12).

Limits: the midpoint is taught as averaging because the book treats it through exercises, not a named formula. The same-segment result and the angle in a semicircle are consequences the book mentions (section 5.7 and an end-of-chapter exercise), not numbered theorems. The Circles proof of the angle theorem covers the case where the centre lies inside the angle; the other positions are described but not drawn. The proof ideas for Theorems 10 and 12 are summarised, not completed. Other modules were verified in earlier milestones and not re-audited here.

## EDU-2 roadmap (recommended)

1. **Propositions:** replace `completeLesson` mastery with evidence; add prerequisites (P0).
2. **Quadrilaterals and Understanding Data:** adopt the per-question evidence model (P1); reuse the shared components for prerequisites, worked examples and misconception feedback.
3. **Understanding Data and Two Variables:** prerequisites and readiness checks (P2).
4. **Electricity and Chemistry:** prediction, short practice, saved progress, text alternatives for the breadboard and the heating curve (P2).
5. **App-wide:** bundle the icon font; one reduced-motion setting; keyboard paths for the generic workbench canvases.
6. Move the per-chapter stores onto `useEducationStore`, keeping the migration, so one reset and one report covers all chapters.


## Verification performed in EDU-1

### Automated

- Frontend: 42 test files, 763 tests, all passing (about 105 are new). Backend: 22 passing. `tsc -b` and the production build succeed.
- New suites cover: answer evaluation and specific feedback; honest status rules (teacher demo, assisted work, retries); migration and persistence; chapter integrity for both pilots (prerequisites at chapter and unit level, explanations, guided objectives, feedback tied to the actual question, remedial links that resolve, unique ids, mastery rules); mathematical correctness with independent oracles (coordinates, quadrants, order, distance, midpoint, circle radii, chords, perpendicular distances, central, inscribed, same-segment, semicircle and cyclic angles, proof figures); NCERT references; the Circles mastery fix and its migration; architecture (lazy loading, no network or CDN, no animation, registry supplied by every page, focus-ring pattern).
- Not run: the repository linter (`oxlint`), whose native binding is not installed in this environment.

### Real Chrome (CDP), dev server and production preview

Real pointer, touch-size, keyboard and typing input; no state was injected. Results recorded in the final report.

Defects found by these sessions and fixed:

1. Duplicate React keys when two practice items shared a topic (console error).
2. The Coordinate Geometry hub rendered refreshers without their diagrams (no visual registry on that page); a regression test now guards every page.
3. The keyboard focus ring on draggable handles never appeared (an ineffective Tailwind variant); fixed and tested.
4. Circles "tap the diameter": overlapping touch areas at the centre, a chord almost through the centre, and radius touch areas that swallowed a centre tap; fixed.
5. Resume reopened the first unfinished stage instead of the last visited stage.
6. Quadrant names collided with points near the axes.
7. Diagrams were taller than a phone in landscape.
8. A readiness re-check repeated questions the student had already answered correctly.
9. The ratio readout showed "2" where the text said "2.00".
10. Old Circles guided practice mixed hint and solution state between questions (found while testing the mastery fix).

### Bundle impact (production build, raw / gzip)

| Chunk | Before (`82c010a`) | After | Change |
|---|---|---|---|
| Entry `index-*.js` | 286.86 kB / 89.29 kB | 287.94 kB / 89.51 kB | +1.08 kB / +0.22 kB |
| `index-*.css` | 64.81 kB / 11.57 kB | 67.15 kB / 11.99 kB | +2.34 kB / +0.42 kB |
| `CirclesLab` | 18.07 kB | 18.66 kB | +0.59 kB |
| `CircleWorkbenchPage` | 137.94 kB | 132.71 kB | −5.23 kB |
| `MathWorkbenchPage` | 94.43 kB | 91.82 kB | −2.61 kB |
| New: `CoordinateGeometryPages` | none | 75.10 kB / 21.74 kB | loaded on the Coordinate Geometry routes only |
| New: `CirclesLearn` | none | 92.21 kB / 26.66 kB | loaded by the Circles hub and Learn routes |
| New: `LearnLessonPage` (shared) | none | 40.21 kB / 10.54 kB | shared by both chapters |

All new code is behind route-level `lazy()`; the entry bundle grows by one route table entry per new page.
