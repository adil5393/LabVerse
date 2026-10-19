# PHY-2B report: Newton's first law and inertia

Source: NCERT Class 9 Science, *Exploration* (2026-27), Chapter 6 (`iesc106.pdf`). Section **6.4 Newton's First Law of Motion** (Examples 6.2 and 6.3, Pause and Ponder 3 to 5) plus the "Meet a Scientist" note on inertia and the Section 6.3 thought experiment. Section numbers were taken from the PDF, not assumed. Exercise **Q6** (Fig. 6.37, rendered from the PDF) is the only remaining question fully supported by the first law.

## What was built (on top of PHY-2A, nothing rewritten)

- **Unit 3 "Newton's first law and inertia"** with optional prerequisite `pfp-xt` (reading position-time graphs, linked to Chapter 4) and unit-level prerequisites; chapter now has 5 lessons in 3 units.
  - **Lesson 4, rest and constant velocity** (objectives: state the law, zero net force is not zero velocity, why everyday objects stop, graphs of motion with and without net force). Covers Example 6.2 (push equals friction) and Example 6.3 (graphs), Galileo's thought experiment, and corrects "a moving object needs a forward force".
  - **Lesson 5, inertia and mass** (objectives: inertia is not a force, same pulse on different masses, braking and seat belts, balanced forces versus action-reaction pairs). Mass as a measure of inertia, braking and seat belts, and the pulse comparison are labelled enrichment in the curriculum map; the book names inertia but not these examples.
  - Both follow Understand, Worked Example, Guided Practice, Your Turn, Reflect with misconception notes, 8 independent items each (two per objective), hints and reflection links. Misconceptions targeted with specific feedback: moving needs a forward force; zero force means zero velocity; heavier means faster; inertia is a force; force and velocity must point the same way; braking creates a forward force; opposite forces on different objects are balanced.
- **Model extension (one, justified):** `Setup.pulseS`, an optional force pulse (pushes act only for a stated time, multiple of the fixed step). Needed for investigation I; friction, static and kinetic behaviour, exact stopping and the force diagrams are unchanged. PHY-2A tests (61) still pass untouched.
- **Investigations F to J** (A to E unchanged; lab now lists ten), each Predict, Experiment, Observe, Explain with options judged by the model:
  - F motion without a driving force (frictionless cart keeps 4 m/s); G zero net force from rest, rightward and leftward starts (0, +3, −3 m/s kept); H friction versus frictionless (wood decelerates at 3 m/s² and stops, no reversal); I equal 8 N, 1 s pulses on 1, 2 and 4 kg (velocity change 8, 4, 2 m/s, constant afterwards); J sudden braking.
  - Investigation I only observes that more mass changes velocity less; the second law and its derivation are not introduced. Investigation H and the lessons never imply a force is needed to maintain motion.
- **Braking demonstration** (`vehicle.ts`, `BrakingDemo.tsx`): closed-form, fixed-step history. Vehicle brakes at a constant rate from 1 s; an unbelted passenger on a slippery seat has no horizontal force, keeps the old velocity, and moves forward only relative to the vehicle; a belt exerts the backward force (mass × deceleration) so the passenger slows with the vehicle. The model **ends after a 0.5 m gap before any contact**, never produces a forward force, and states on screen that it is a simplified teaching model, not crash-safety data. Passenger force diagram reuses the existing figure.
- **NCERT Q6** solved (A and D constant velocity, B at rest, only C, the steepening curve, has a net force) with graph illustrations using the Chapter 4 graph component (illustrative values with the book's shapes, labelled). Questions 5 and 7 to 16 need the second or third law and remain Upcoming.

## Verification

- **Targeted tests** (85 in `engine/physics/forces`, 24 new in `firstLaw.test.ts`): constant non-zero velocity under zero net force (x = ut at many times), rest under zero net force, negative velocity retained, frictional deceleration and stopping, force pulse (Δv 8, 4, 2; constant afterwards; agrees with the Chapter 4 two-stage profile; stops cleanly under friction), mass comparison, force diagram agreement, braking assumptions (cruising, ½ d t² forward motion, exact end at the gap, belt force = m·d backward, never a forward force, vehicle never reverses), one-option-holds for every route, validation, Q6 parts, upcoming questions, regression of PHY-2A. Chapter integrity, the mastery rules (hint is assisted, navigation is not mastery, each objective needs independent evidence, teacher demo and shown solutions never master) run over all five lessons.
- **Real Chrome** (1440 and 360 px, no page errors): lesson 4 completed legitimately and Mastered with a Physics breadcrumb; Next-only through lesson 5 gives no evidence; a hint makes an answer assisted; experiment F keeps +4 m/s and +40 m; G rest stays 0, leftward cart keeps −3 m/s; I gives +8, +4, +2 m/s with zero net force afterwards and a specific inertia correction for a wrong prediction; H friction gives +3 m/s at 1 s then stops at +6 m; J wrong prediction (new forward force) is corrected, unbelted passenger keeps 15 m/s with 0 N and moves 0.5 m forward relative to the vehicle then the model ends, belt gives −300 N with the passenger velocity equal to the vehicle's; keyboard Reset, Play and Pause; Q6 solution and illustrations; Forces, Motion and Electricity still open and PHY-2A investigation B unchanged; no horizontal overflow at 360 px on the hub, labs I and J, exercises and both new lessons.
- **Broad checks at completion:** see the next section.

## Broad verification results (run once)

Full frontend suite: 63 files, 1202 tests, all passing. Backend `python -m pytest backend/tests`: 22 passed. `tsc -b`: clean. `vite build`: succeeds. Lint (`oxlint src`): no errors, 59 warnings, unchanged from PHY-2A (the one Forces-related warning is the existing fast-refresh warning for exporting the `FORCE_VISUALS` registry).

## Limitations

- The braking demonstration is deliberately simple (constant deceleration, slippery seat, ideal belt, a stated 0.5 m gap, no contact or injury modelling); it must not be read as crash data.
- Pulse lengths are multiples of the 0.01 s step; the Force Laboratory still has one dimension and simple dry friction.
- Q6's graphs have no scale in the book; the illustrations use stated values with the same shapes.
- Chapter Practice remains Upcoming; the second law, third law and forces on a system (Sections 6.5 to 6.7) were not started.
