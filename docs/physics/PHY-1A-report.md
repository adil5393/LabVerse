# PHY-1A Report: Class 9 Motion Foundation and First Laboratory

Baseline: EDU-1M6 (`bb6b835`). Textbook read: NCERT Class 9 Science, Exploration (2026-27), Chapter 4 "Describing Motion Around Us", official PDF `iesc104.pdf` (24 pages).

## Existing Physics, and what was changed

Physics was the Electricity lab only: `/physics/electricity` and `/physics/electricity/workbench`, a DC solver, and a subject-registry entry whose route a test pins to `/physics/electricity`. There was no Physics hub and no chapter registry.

Added, backward compatibly:
- A Physics hub at `/physics` listing chapters (Motion and Electricity). The subject card still enters Electricity; it gained a second link, "All physics chapters". The Electricity breadcrumb word "Physics" is now a link to the hub.
- Motion routes `/physics/motion`, `/lab`, `/exercises`, `/learn/:lessonId`.
- Nothing in Electricity, Chemistry or Mathematics was changed. No new framework: lessons, prerequisites, mastery and visual hosting use the shared EDU-1 components.

## Chapter 4 curriculum map (from the PDF)

Sections: 4.1 Motion in a Straight Line (4.1.1 position, 4.1.2 distance and displacement, 4.1.3 average speed and velocity including uniform and non-uniform motion, 4.1.4 average acceleration); 4.2 Graphical Representation (4.2.1 to 4.2.3); 4.3 Kinematic Equations; 4.4 Motion in a Plane (4.4.1 uniform circular motion). Activities 4.1 to 4.5, Pause and Ponder boxes, the scalar/vector note ("Ready to Go Beyond"), "The Journey Beyond", "At a Glance" and sixteen questions under "Revise, Reflect, Refine".

Stored in `engine/physics/motion/curriculum.ts` and shown on the chapter hub. **Available:** 4.1.1, 4.1.2 (distance, displacement, the scalar/vector note, Pause and Ponder, Activity 4.1's note), three solved exercises, and a LabVerse-enrichment laboratory. **Planned (marked so, no lessons):** 4.1.3, 4.1.4, 4.2, 4.3, 4.4.1. Rows that are not in the book are labelled enrichment. A test fails if a planned row has lessons or if the map cites a section the PDF lacks.

## What was built

- **Model** (`kinematics.ts`): one authoritative path of legs in whole centimetres and milliseconds. Position, distance, displacement, heading, turns, history and the text alternative are pure functions of the path and a simulated time. Distance adds each leg's length; displacement is final minus initial. Playback only moves the clock (`tickClock`); frame length and replay rate never change the physics. Reset clears the legs; undo removes the last. Positions off the track are refused with a reason. Staying put is a pause. Speed, velocity and acceleration can later be derived from leg length and duration without changing the model.
- **Figure** (`MotionTrack.tsx`, used by the lessons and the lab): labelled origin O and scale in metres, start marker, movable object, one history row per leg with arrowheads (direction is not colour-only), a displacement arrow, live sentence, readouts and a legs list. Move by buttons, by arrow keys on the focused object, by typing a position, or by dragging (drag only picks a target). Step size, wait, undo, reset, Play, Pause, step plus or minus one second, a time slider, and a replay-speed control that is labelled as not a physical speed. Under reduced motion, Play steps whole simulated seconds.
- **Laboratory** (`/physics/motion/lab`): opens at once with an editable track. Four optional guided investigations (A Moving forward, B Returning home, C Changing direction, D Different routes, same displacement): predict, check against the model with feedback that names the specific confusion, run the route, then change it. The page states that these are model values and that real measurements carry error.
- **Learn Unit 1, Describing motion** (3 lessons, 20 independent items, 9 guided steps, 3 objectives per lesson): 1 position and the reference point, 2 distance travelled, 3 displacement. They cover: reference point, signed positions, rest and motion with respect to a reference point, distance as path length that is never negative or decreasing, displacement as final minus initial, zero displacement, equality only without turning back, and the words scalar and vector (named only). Authored feedback per wrong answer (distance without a reference, final position given as distance, displacement given as distance, dropped sign, and so on).
- **Prerequisites** (chapter and unit): units of length and time, signed numbers, reading a position scale (with an optional demo). Skipping is recorded as bypassed and blocks nothing.
- **NCERT Exercises foundation:** all 16 questions in the book's order, with parts (2 has i and ii; 7 and 16 have four parts; 12 has i and ii), original summaries, and a data structure for given, find, assumptions, hint, steps with reasons, answers with units, a model check, a lab link and verification status. **Solved and verified: 1, 2 and 11** (the ones the first unit directly supports). The other thirteen are visibly upcoming with no solution. Flow: Try yourself, hint, steps, final answer, Explore in the lab. The module imports nothing but the motion model (a test enforces it), so viewing a solution can never reach mastery.
- **Hubs:** Physics hub, and a Motion hub with four destinations: Learn, Free Laboratory, NCERT Exercises, and Chapter Practice shown as Upcoming (a non-link, no page).

## Tests

Final run: `tsc -b` clean; frontend **53 files, 1044 tests passing** (980 before); backend 22; production build passes; `oxlint` 0 errors, 58 warnings (57 before; one is a fast-refresh export note in the new figure file). New tests (64): the motion model against independent arithmetic on 500 random paths with negative positions and reversals; the textbook athlete (160 m and 40 m); return to origin; reversing; different routes; zero motion; turns; exact decimals; validation; unit conversion; deterministic sampling; pause and resume and frame-size independence; replay rate; reset and undo; the generated text; content integrity and every numeric answer recomputed; every figure's alternative matches the model; objective coverage; exercise numbering and isolation; the map's honesty; route integration and Electricity preservation (source checks); help-aware mastery, navigation, repeated questions, teacher demonstration and prerequisite bypass through the shared store; the experiments' model values and prediction feedback.

**Real Chrome** (dev server; real clicks, typing and keys):
- Physics hub and Subject Explorer link; Electricity lab and workbench still load.
- Motion hub: three links plus an Upcoming practice card; the chapter map shows planned topics.
- A beginner completed lesson 1: Mastered. Touring lesson 3 with Next only: not mastered. Hint then correct: assisted. Wrong then right on every item: not mastered. Prerequisite skipped: bypassed; lessons and the lab open.
- Lab: 4 × 5 m forward gives position +20, distance 20, displacement +20; 2 × 5 m back gives +10, 30, +10; going to 0 gives displacement 0 and distance 40; to −30 gives −30 and 70; 500 is refused. ArrowRight on the focused object moved it. Play advanced simulated time and Pause froze it; Reset cleared the history. With reduced motion forced on, Play advanced in whole simulated seconds only.
- Experiment B: predicting distance 0 gets the correction about the size of the displacement; running the route shows 80 m and 0 m.
- Exercises: 1 to 16 in order, only 1, 2 and 11 have solution buttons; nothing is shown until asked; the flow reaches the lab link.
- No horizontal overflow at 360, 390, 768, 1440 and phone landscape (844 by 390); every control is at least 44 px (the draggable object's hit area is about 44 px; the buttons, arrow keys and typed position are the primary controls).

## Limitations and remaining work

- Only Unit 1 of Chapter 4 exists. Sections 4.1.3 onward (speed, velocity, acceleration, graphs, kinematic equations, circular motion) are planned, not built.
- Thirteen of the sixteen exercise questions have no solution yet; Chapter Practice does not exist.
- The model is one-dimensional with uniform motion inside a leg; speed and acceleration are not exposed yet.
- The shared lesson breadcrumb and the global header still contain a few controls under 44 px.
- No screen-reader testing; keyboard and label paths were verified by script only.
- oxlint's native binding is still the manual install from EDU-1P (needs Node 20.19+ on a clean machine).
