# PHY-2A report: Class 9 Physics Chapter 6, force foundations and the Force Laboratory

Source: NCERT Class 9 Science, *Exploration* (2026-27), Chapter 6 "How Forces Affect Motion" (`https://ncert.nic.in/textbook/pdf/iesc106.pdf`, 22 pages, read in full). All LabVerse text, figures and questions are original; exercise summaries paraphrase the book.

## Verified textbook structure (coverage map)

The map lives in `engine/physics/forces/curriculum.ts` and in a collapsible table on the chapter hub.

| Section | Content | Status |
|---|---|---|
| 6.1, 6.1.1 | Concept of force, effects, direction and magnitude, newton, spring balance, weight | Learn lesson 1 |
| 6.2 | Balanced and unbalanced forces, net force, Example 6.1, Pause and Ponder 1 and 2 | Learn lesson 2 |
| 6.3 | Friction, Figs 6.10 and 6.11, Activities 6.1 and 6.2, thought experiment | Learn lesson 3, investigation D |
| 6.4 | First law, Examples 6.2 and 6.3 | Upcoming (PHY-2B) |
| 6.5 | Second law, Activities 6.3 and 6.4, Eqs 6.1 to 6.3, Examples 6.4 to 6.6 | Upcoming (PHY-2C) |
| 6.6 | Third law, Activities 6.5 to 6.7, Examples 6.7 and 6.8 | Upcoming (PHY-2D) |
| 6.7 | Forces on a system, tension, Eq. 6.4 | Upcoming (PHY-2E) |
| Revise, Reflect, Refine | 16 questions | 4 solved, 12 Upcoming |
| The Journey Beyond | closing activities | Upcoming |

Enrichment (not in the book, labelled as such): the Force Laboratory, force diagrams, five guided investigations, static versus kinetic friction, and the clarification that friction's direction is set by the sliding or tendency to slide at the contact. The textbook's "At a Glance" states friction acts opposite to the direction of motion; lesson 3 keeps that as the usual case for a sliding object and adds the box-on-an-accelerating-truck example so students do not learn it as an always-true rule.

## What was built

- **Chapter registered** as `forces` (Physics subject metadata, so lesson breadcrumbs read Physics, using the earlier breadcrumb fix). Routes: `/physics/forces`, `/lab`, `/exercises`, `/learn/:lessonId`. A Forces card was added to the Physics hub; Motion and Electricity are untouched.
- **Hub destinations:** Learn, Free Laboratory and NCERT Exercises are working. **Chapter Practice and the units for Sections 6.4 to 6.7 are marked Upcoming** and are not links (lessons carry their own independent practice).
- **Prerequisites** (all optional, never blocking): chapter-level `pfp-motion`, `pfp-direction`, `pfp-mass`, `pfp-arrows`, with unit-level subsets and links to the Chapter 4 lessons.
- **Learn lessons** (EDU-1 sequence, shared mastery): lesson 1 What is a force; lesson 2 Balanced and unbalanced forces (collinear addition with signs, balanced forces do not change velocity including for a moving object, unbalanced force and acceleration direction, reading force diagrams); lesson 3 Friction (contact force, direction, slowing and surfaces, static friction and the larger push needed to start motion, useful versus unwanted). Each has beginner steps with checks, a worked example, guided practice, 8 or 6 independent items with at least two per objective, specific misconception feedback and a reflection.
- **Force model** (`forceModel.ts`): one cart, SI units, deterministic fixed 0.01 s steps, two pushes (size and direction), mass, five surfaces from frictionless to rough, starting velocity. Net force = A + B + friction; acceleration = net force ÷ mass; g = 10 m/s² stated. Dry friction: static friction matches the push on a resting cart up to a limit, a bigger push slides it, kinetic friction acts against sliding. Inside a step the forces are constant so the update is exact, and the instant a sliding cart reaches zero velocity is found exactly: **friction can stop a cart but never reverse it or start it**. Playback moves a clock only (never frame rate); pause, scrub and reset are pure functions of simulated time.
- **Force diagrams** (`forceDiagram.ts`, `ForceFigure.tsx`): each arrow names the object it acts on and the object exerting it; weight and normal force are drawn vertically and shown to balance, separate from the horizontal net force; the net arrow is recomputed from the individual arrows alone and checked against the model; toggles for individual forces and net force; text listing with the net-force working under every diagram; usable by keyboard (all controls are buttons and fields).
- **Force Laboratory** (`/physics/forces/lab`): free exploration plus investigations A (equal and opposite forces), B (unbalanced forces), C (same force, different mass; a preview of the pattern only), D (friction and surfaces, including a gentle push that does not move the cart and a frictionless idealisation), E (moving without a net force). Each follows Predict, Experiment, Observe, Explain; options are judged by the model, not hand-written answers.
- **NCERT exercises:** all 16 inventoried with the book's numbering and subparts. Questions 1 to 4 are solved (given, find, principle, formulas, hint, steps with reasons, answers, explanation, common mistakes, arrow or cart illustrations, lab links where the model fits, Q4 explains why no lab applies: 18 000 N is outside the 100 N laboratory range). Questions 5 to 16 are Upcoming with their milestone and show no solution.

### Which questions were solved, and why only these

| Q | Result | Needs only |
|---|---|---|
| 1 | friction = F, opposite | balanced forces (6.2, 6.3) |
| 2 (i, ii, iii) | same, increase, decrease | net force and acceleration direction |
| 3 | statement (i): P has a net force of 1 N, Q none | collinear net force, constant velocity |
| 4 | 18 000 N forward | collinear addition (95 × 200 − 5 × 200) |

Questions 5 to 16 need the second or third law (formal treatment reserved for PHY-2C and PHY-2D) or graph reasoning from the first law, so they stay Upcoming.

## Verification

Independent expectations are hand values or the Chapter 4 exact constant-acceleration engine.

- **Targeted tests** (61 tests in `engine/physics/forces`): same-direction and opposing forces, balanced and unbalanced, negative (leftward) forces, zero force, zero start velocity, non-zero velocity with zero net force, mass change (a = 8, 4, 2), agreement with the Chapter 4 profile engine, friction stopping (stop time u/(μk g), distance independent of mass, farther on slipperier surfaces, never reverses), static holding versus sliding, a push equal to friction giving constant velocity, a reversal only when the push drives it, fixed-step grid, reproducibility, pause/scrub/reset purity, validation, diagram consistency (net arrow equals model net at every sampled time for a grid of setups, vertical forces cancel, arrows act on the cart), exactly one prediction option holding per investigation route, curriculum map and inventory, exercise coverage audit and numeric recomputation, isolation of the exercise module from the progress store, and mastery integrity (hint is assisted, navigation is not mastery, every objective needs independent evidence, teacher demonstration and shown solutions never master).
- **Real Chrome** (scripted, 1440 and 360 px, no page errors): Physics hub lists Forces; Motion and Electricity still open; lesson breadcrumb reads Physics; a beginner completes lesson 1 and reaches Mastered; 10 N and 10 N gives net 0, a = 0, velocity 0; 10 N and 6 N on 2 kg gives +4 N, +2 m/s², +6 m/s after 3 s, with the net arrow pointing right; a moving cart with balanced forces keeps 3 m/s (18 m in 6 s); a sliding cart on wood has −6 N kinetic friction, +3 m/s at 1 s, stops at +6 m and stays; a 3 N push on a resting cart gives −3 N static friction and no motion; 12 N slides at +3 m/s²; on ice the cart slides 60 m; keyboard Play, Pause and Reset with Enter; invalid mass refused with a reason; a wrong prediction gets a specific correction; skipping a prerequisite is recorded as bypassed and the lesson still opens; touring a lesson with Next only is not mastery; a hint makes an answer assisted; exercises list 16 with solutions for 1 to 4 and 12 Upcoming; no horizontal overflow at 360 px or desktop on the hub, laboratory, exercises and a lesson.
- **Broad checks at completion (run once):** full frontend suite 62 files, 1178 tests, all passing; backend `python -m pytest backend/tests` 22 passed; `tsc -b` clean; `vite build` succeeds; lint (`oxlint src`) reports no errors and 59 warnings, of which one is new (fast-refresh warning for exporting the `FORCE_VISUALS` registry from `ForcesPages.tsx`, the same pattern as the Motion registry) and the rest already existed.

## Known limitations

- Friction uses the simple dry model with illustrative coefficients; it ignores rolling resistance and air drag. g is fixed at 10 m/s².
- The cart is one-dimensional: forces at angles and turning effects (the book's "Ready to Go Beyond") are only named.
- The investigations show model behaviour; they are labelled as observation, not proof. Newton's second law is previewed as a pattern only; the formal law and derivations are for PHY-2C.
- Chapter Practice is Upcoming; mastery evidence comes from each lesson's independent items.
- Q6 depends on position-time graphs and the first law and is therefore Upcoming even though the graphs are drawable.
