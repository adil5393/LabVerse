# PHY-3A report: Chapter 7 foundation, work and the Work Laboratory

Source: NCERT Class 9 Science, *Exploration* (2026-27), Chapter 7 "Work, Energy, and Simple Machines" (`iesc107.pdf`, 24 pages), read in full. Section 7.1 (7.1.1, 7.1.2), Eqs. 7.1 and 7.2, Figs. 7.2 to 7.7, Examples 7.1 and 7.2, Pause and Ponder 1 and 2 and all fifteen exercises were checked against the PDF text.

## Scope and state of Chapter 6

- PHY-3A builds the opening of Chapter 7 only. Sections 7.2 to 7.6 (work-energy theorem, forms of energy, kinetic and potential energy, conservation, power, pulley, inclined plane, lever), Chapter Practice and the closing activities are marked **Upcoming** and are not links.
- The PHY-2E milestone for Chapter 6 was **not committed** when this work started. Its two untracked files (`forces/practice.ts`, `forces/journeyBeyond.ts`) were left as they were and are not part of this commit. Chapter 6 is not marked complete. The Chapter 6 card text on the Physics hub still says the third law is upcoming; that stale line belongs to PHY-2E and was not changed.

## Curriculum map (`engine/physics/work/curriculum.ts`)

16 rows: Section 7.1 (Eqs. 7.1 and 7.2, joule, Fig. 7.4 graph), 7.1.1, 7.1.2, enrichment rows, planned rows for 7.2 to 7.6, the exercises, the Journey Beyond activities, the closing society box and the energy-foundation helpers. Textbook rows and LabVerse enrichment are labelled separately. The book's three Activities in 7.6 and the energy sections are Upcoming, never shown as complete.

## Learn (3 lessons, 1 unit, EDU-1 framework, nothing new in the shared components)

| Lesson | Topic | Section |
|---|---|---|
| pw-l1 | Everyday work versus work in physics, W = F × s, the joule, the force-displacement graph | 7.1 |
| pw-l2 | Zero work: no displacement, no force, perpendicular force, tiredness is not work on the object; angle rule marked **enrichment** | 7.1.1 |
| pw-l3 | Positive and negative work, signed calculation with cm to m, friction does negative work, net work as a labelled **preview** | 7.1.2 |

Each follows Understand, Worked Example, Guided Practice, Your Turn, Reflect; every objective has at least two independent items and misconception-specific feedback. Six optional prerequisites (force and Newton's laws, displacement and direction, speed and velocity, mass and weight, units, reading a graph) with unit and chapter lists, links to Chapters 4 and 6, readiness checks and refreshers. Nothing is gated.

## Work Laboratory (`/physics/work/lab`)

- `engine/physics/work/workModel.ts` is a **kinematic work model**: the displacement is chosen, not solved from Newton's laws, and the page says so. W = F∥ × s for every force (scalar product for any angle), applied, weight, normal and friction work reported separately, net work as their sum. Horizontal track (smooth, wood, rough) and vertical rail. A held object (forces not balanced with zero displacement) and the kinetic energy that negative net work requires are reported, not hidden. Invalid setups (leaving the track, lifting off) are refused with a reason.
- `WorkView.tsx`: SVG scene, force arrows tagged F, f, W and N with a key, start and end markers, the displacement arrow, a play button and position slider (reduced motion jumps), a signed work table and an F-s graph whose area equals the applied work. Controls (force, direction, displacement) sit under the canvas; start position, mass, surface, rail and the enrichment angle are in a collapsed section.
- Investigations A (force and displacement), B (no displacement), C (positive and negative work), D (perpendicular force), E (work against friction): Predict, Experiment, Observe, Explain; exactly one prediction option holds for each of 15 routes.
- `energyBasics.ts`: pure functions for kinetic, potential and mechanical energy, work-energy bookkeeping and power, for later milestones. No UI uses them yet.

## NCERT exercises (`/physics/work/exercises`)

All 15 questions and all **43** subparts are listed with textbook numbering and original summaries. **Solved (5 parts):** 1(i), 1(ii), 2(i), 2(ii), 10(i), each with hint, reasoning, calculation, final answer and a real lab link. The other 38 parts are Upcoming and show what must be taught first; no question is yet fully solved because each question has at least one later part. Viewing a solution is isolated from progress (the module imports no store).

## Verification

- **Targeted tests (50, `work.test.ts`):** independent W = F s cos θ grid; zero force and zero displacement; opposing and perpendicular directions; negative work; textbook values (150 J bag, 200 N through 15 cm gives −30 J); friction work and separation from net work; static friction; normal force and lift-off refusal; validation; unit conversions; arrows, table, markers and graph checked against the model through rendered markup; lesson figure text equals the model; investigation outcomes; energy helpers; exercise inventory (numbering, 43 parts, 5 solved, recomputed answers, isolation, original wording); chapter integrity; mastery (hint is assisted, wrong then right is not first-try, repeats cannot inflate, navigation and teacher demo are not mastery, every objective needs independent evidence); prerequisites optional; route preservation for Motion, Forces and Electricity.
- **Real Chrome** (1440 and 360 px, no page errors): Physics hub with the new card, the Chapter 7 hub (Practice Upcoming and not clickable), lab calculations (+30, −30, 0, 0 with no displacement, friction +60/−60/0 and +80/−60/+20, lift +150/−150/0), play with the keyboard, invalid input refused, investigations B to E, lesson 1 and lesson 3 mastered with first-try answers, lesson 2 with Next only not mastered and no evidence recorded, a hint recorded as assisted, wrong then right not first-try, exercises (15 questions, 43 parts, 5 solutions, no progress recorded by viewing), Motion, Forces and Electricity routes still open, no page-level horizontal overflow at 360 px on seven pages.
- **Broad checks:** full frontend suite 66 files, 1298 tests passing (was 65 and 1248); backend `python -m pytest backend/tests` 22 passed; `tsc -b` clean; `vite build` succeeds; `oxlint src` no errors, 59 warnings (unchanged from the baseline). The two untracked PHY-2E files were moved aside during the type check, because one has an unused-parameter type error, and restored afterwards.

## Limitations

- The model prescribes the displacement and uses constant forces; it does not integrate motion, so it cannot show a force changing during the move. The F-s graph is a rectangle (the non-constant case is only named).
- Kinetic friction uses a single coefficient per surface and acts opposite to the prescribed displacement; static friction is shown only for a resting object. Rolling and air resistance are not modelled.
- Only five exercise subparts are solved; the work-energy theorem and later sections are needed for the rest.
- Chapter Practice for Chapter 7, the energy lessons, power and simple machines are the next milestones and were not started.
