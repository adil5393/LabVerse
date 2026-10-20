# PHY-3 completion report: Chapter 7, Work, Energy, and Simple Machines

Source: NCERT Class 9 Science, *Exploration* (2026-27), Chapter 7 (`iesc107.pdf`, 24 pages), read in full once. Figures 7.37 to 7.39 (exercises 11, 13, 14) were read from the rendered pages. All explanations, figures and questions are original.

## Commits

| Milestone | Commit | Scope |
|---|---|---|
| PHY-3A | `9ef52c7` | Foundation: Chapter 7 registration, prerequisites, lessons 1 to 3 (work), Work Laboratory (A to E), exercise inventory |
| PHY-3B | `9149621` | Lessons 4 and 5, derivation framework, Work-Energy Laboratory (A to F) |
| PHY-3C | `3503934` | Lessons 6 and 7, Energy Laboratory (A to F), derivations U and C |
| PHY-3D | `dec48d4` | Lessons 8 to 10, Power and Simple Machines Laboratories, derivations R, L and P, all exercise parts |
| PHY-3E | see `git log` (`feat(physics): complete class 9 work energy chapter`) | Chapter Practice, completeness audit, regression tests, this report |

## 1. Lessons and units (EDU-1 flow: Understand, Worked Example, Guided Practice, Your Turn, Reflect)

| Unit | Lessons | Sections |
|---|---|---|
| 1 Understanding work | 1 Work in physics; 2 When is the work zero?; 3 Positive and negative work | 7.1, 7.1.1, 7.1.2 |
| 2 Energy and the work-energy theorem | 4 Energy and the theorem, forms of energy; 5 Kinetic energy K = ½mv² | 7.2, 7.3, 7.4.1 |
| 3 Potential energy and conservation | 6 Potential energy U = mgh; 7 Conservation of mechanical energy | 7.4.2, 7.4.3 |
| 4 Power | 8 Power P = W ÷ t | 7.5 |
| 5 Simple machines | 9 Pulley and inclined plane; 10 The lever | 7.6, 7.6.1 to 7.6.3 |

Nine optional prerequisites (force and Newton's laws, displacement, speed and velocity, mass and weight, units, reading graphs, equations of motion, squares and rearranging, ratios and right triangles), each with a refresher, specific feedback and a readiness check; unit and chapter lists link to Chapters 4 and 6. Nothing is gated. Every lesson objective has at least two independent items.

## 2. Curriculum coverage (verified by the test `chapter7.final.test.ts`)

All 15 equations (7.1 to 7.16), all 13 Examples, all 5 Activities and all 13 Pause and Ponder items map to the lesson that teaches them (the Activities that need physical apparatus are taught as ideas and modelled by the laboratories, not replaced). The joule, watt, horsepower, James Prescott Joule, James Watt and the watermill (gharat) are covered.

**Not built:** the three "Journey Beyond" activities (rubber-band pen launcher, building machines from household items, PhET simulations) and "The Quest Continues" (dark energy). They are suggested home or external activities with no interactive model; the launcher would need an elastic-energy model, which is beyond Class 9. They are marked Upcoming in the chapter map and listed here, not silently omitted.

LabVerse enrichment (labelled as such): the reference level of potential energy, the force-angle control W = F s cos θ, the P = F v step, the torque used to decide lever balance, net work as a preview of the theorem, and the laboratories themselves.

## 3. Interactive laboratories (one model per quantity; computation separate from drawing; simulated time, never the frame rate; reduced motion respected)

| Laboratory | Model | Investigations |
|---|---|---|
| Work `/physics/work/lab` | Kinematic work model: the displacement is chosen, not solved | A to E |
| Work-Energy `/physics/work/kinetic` | Exact constant-net-force kinematics, W_net = ΔK, direction reversals, K never negative | A to F |
| Energy `/physics/work/energy` | Closed-form ramp or free fall; K + U + Q conserved without drift; chosen reference height | A to F |
| Simple Machines `/physics/work/machines` | Inclined plane (friction gives thermal energy), pulley (rope pulled = strands × rise; movable block weight), lever (Classes I to III, arc = arm × angle) | ramp A to C, pulley A to C, lever A to D |
| Power `/physics/work/power` | P = W ÷ t from a direct work, a lift or a speed-up | A to C |

Every laboratory opens at once, states its assumptions, ranges and idealisations, refuses invalid setups with a reason, and gives a text description of the scene. Primary controls sit under the canvas; secondary settings are in collapsed sections.

## 4. Derivations (`/physics/work/derivations`, and inside the lessons)

Six interactive derivations with assumptions, step-by-step reasons, student-controlled parameters, a graph or figure drawn from the same numbers, missing-step questions with specific feedback, a numerical check for one case (illustration, never proof) and a revision summary: K = ½mv² and W_net = ΔK (force-displacement area graph, Eqs. 7.4 to 7.6), U = mgh (Eqs. 7.7, 7.8), K + U constant in free fall (Eqs. 7.9, 7.10), the ramp F′L = mgh (Eq. 7.13), the lever F₁d₁ = F₂d₂ (Eqs. 7.14 to 7.16; Eq. 7.15 is an experiment in the book and the small-rotation geometry connecting it is labelled enrichment) and P = W ÷ t. The derivations record nothing, so pressing Next never grants mastery.

## 5. NCERT exercises (`/physics/work/exercises`)

All 15 questions and all **43** subparts are solved (Try yourself, Hint, Reasoning, Calculation, Final answer, meaning, common mistake, Explore in the lab or the reason none fits). Values read from Figs. 7.37 (force trapezoid: 150 J, speed 6 and about 8.1 m/s), 7.38 (35 m/s then braking: 612 500 J, −612 500 J) and 7.39 (potential-energy levels 20, 30, 40 J) are labelled with how they were read; the drawn curve of Fig. 7.39 is approximate and does not affect any answer. Question 6 is ambiguous in the book; both readings are answered. Question 3(iii) states its vertical-throw assumption. Viewing a solution never touches mastery (the module imports no store).

## 6. Chapter Practice (`/physics/work/practice`)

33 original questions in 10 categories (work, work-energy and kinetic energy, potential energy, conservation, friction, power, pulleys and ramps, levers, diagrams and graphs, derivation reasoning), 20 numerical and 13 conceptual or reasoning items, each mapped to a lesson objective, with specific feedback and a lesson to review. Same architecture as Chapter 4 practice: each question appears once, the first answer is scored, and nothing is written to the progress store.

## 7. Verification

- **Full frontend suite:** 71 files, 1376 tests, all passing (baseline before PHY-3: 65 files, 1248 tests). 128 tests are in `engine/physics/work`: independent W = F s cos θ grids, signed and zero work, W_net = ΔK with direction reversals, K ∝ v², K + U + Q conserved to 1e-8 over thousands of sampled states without drift, friction accounting across the Work, Energy and Ramp models, ramp, pulley (rope constraint) and lever (balance, classes, work in = work out) relations, power P = W ÷ t, every derivation relation over parameter grids, every investigation (exactly one prediction holds), the exercise inventory and recomputed answers, Chapter Practice hand values, the textbook-coverage audit and cross-model regression, mastery integrity, route and progress preservation.
- **Backend:** `python -m pytest backend/tests`: 22 passed.
- **`tsc -b`:** clean (with the PHY-2E files present). **`vite build`:** succeeds. **Lint (`oxlint src`):** no errors, 59 warnings, unchanged from the baseline.

## 8. Browser verification (real Chrome, 360, 390, 768 and 1440 px and phone landscape)

Hub (Learn, five laboratories, derivations, exercises and practice all working links), all ten lessons open with Physics breadcrumbs and reach Mastered with first-try independent answers; Next-only, hinted and wrong-then-right attempts give no mastery; Work, Work-Energy, Energy, Power and Simple Machines calculations (positive, negative and zero work, a direction reversal, friction giving thermal energy with the total conserved, reference-height changes, the rope constraint, lever classes); investigations predict-and-correct; derivations gated by their missing-step questions and operable by keyboard; every exercise reachable and sampled solutions with figures (Q6, Q7, Q9, Q11, Q13 to Q15); Chapter Practice scoring and review links; Motion, Forces and Electricity routes still open; no page-level horizontal overflow on the new pages at any width and no page errors.

## 9. Known limitations

- The Work Laboratory is a kinematic model with constant forces. The Work-Energy model has one constant net force on a line.
- The Energy Laboratory is a point-like object on a straight ramp or in free fall, released at the top, with constant kinetic friction and no air resistance or bounce. Upward throws (exercises 3 and 10) are solved analytically and do not have a matching laboratory.
- The pulley figure is schematic: the free end is drawn leaving the top block and the rope length is not to scale. The pulley and ramp have no rope or axle friction except through the explicit models (movable block weight; ramp friction coefficient). The lever is a rigid bar turned through a small angle.
- Chapter 6: the card text on the Physics hub still says the third law is upcoming, and the unfinished PHY-2E files `forces/practice.ts` and `forces/journeyBeyond.ts` remain untracked and unchanged apart from one unused-parameter fix needed for the type check. Chapter 6 is not marked complete.
