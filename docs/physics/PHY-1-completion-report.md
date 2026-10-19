# PHY-1 completion report: Class 9 Physics, Chapter 4 "Describing Motion Around Us"

Source: NCERT Class 9 Science, *Exploration* (2026-27), Chapter 4 (`https://ncert.nic.in/textbook/pdf/iesc104.pdf`, read in full for this work).
All LabVerse text, figures and questions are original. Question summaries paraphrase the textbook.

## Commits

| Checkpoint | Commit | Content |
|---|---|---|
| PHY-1A | `44b20c1` | Position, distance, displacement: Learn unit 1, Motion Laboratory, exercises 1, 2, 11 |
| PHY-1A refinement | `5c1e542` | Semantic colours and layout |
| PHY-1B | `b186c55` | Speed and velocity |
| PHY-1C | `6ee25e3` | Acceleration, Motion Graph Studio, graph lessons |
| PHY-1D | `bf92783` | Equations of motion, Equation Laboratory, uniform circular motion |
| PHY-1E | `2555a1d` | All 16 NCERT exercises with every part, Chapter Practice |

Each checkpoint was committed with a working build (type-check and tests passing).

## Curriculum coverage

Five units, ten lessons, six optional prerequisite refreshers (units, signed numbers, scale reading, rates, using a formula, circle geometry). All lessons use the shared EDU-1 sequence (Understand, Worked example, Guided practice, Your turn, Reflect) and the shared evidence-based mastery model. Prerequisites never block a lesson.

| Unit | Lessons | Sections | Laboratory |
|---|---|---|---|
| 1 Describing motion | 1 position and reference point, 2 distance, 3 displacement | 4.1.1, 4.1.2 | Motion Laboratory, investigations A to D |
| 2 Speed and velocity | 4 speed (uniform/non-uniform, km/h), 5 velocity (turning back, round trip, same speed different velocity) | 4.1.3 | Motion Laboratory, investigations E to I (five new) |
| 3 Acceleration and graphs | 6 acceleration, 7 position-time graphs, 8 velocity-time graphs (slope, area, signed area versus area of \|v\|) | 4.1.4, 4.2.1 to 4.2.3 | Motion Graph Studio |
| 4 Equations of motion | 9 the three equations, derivation from the v-t graph, choosing an equation, assumptions and signs | 4.3 | Equation Laboratory |
| 5 Uniform circular motion | 10 speed 2πr/T, tangent velocity, arc versus chord, average speed versus average velocity | 4.4.1 | Uniform circular motion experiment |

Chapter map (collapsible on the hub): 14 rows, 0 planned. Rows that go beyond the textbook are labelled **enrichment** (turning-back graphs, signed area versus area of |v|, the reversal example in the equations, arc and chord quantities on a circle, the laboratories themselves, Chapter Practice). The textbook's graphs show one direction of motion only; the book treats the acceleration towards the centre in circular motion as an idea, and so does LabVerse (shown as an arrow, no formula).

### Scientific model (one state per view)

- `speed.ts`: average speed, average velocity, instantaneous leg velocity and uniform/non-uniform classification, all derived from the existing path legs (distance and displacement over any interval). Replay speed (a screen setting) never enters these numbers; a Chrome check confirms identical values at 0.5x and 2x.
- `profile.ts`: exact constant-acceleration segments (v = u + at, x = x0 + ut + ½at²), turning points, signed area (displacement) and area of |v| (distance), average acceleration, validation limits. Reduces to the path model when a = 0 (tested).
- `equations.ts`: the three equations with signs, refusal for non-constant acceleration, equation chooser, stopping distance, cross-check against the profile.
- `circular.ts`: true 2-D geometry (position, tangent velocity, arc length, chord vector, revolutions). Not the 1-D signed displacement.
- Semantic colours preserved (position cyan, distance amber, displacement violet, time slate, predictions yellow, correct green, error red); added speed teal, velocity pink, acceleration orange, always paired with a word or symbol.
- Accessibility: every new view works with mouse, touch, keyboard (graphs are focusable sliders with arrow keys, Home and End), buttons, number fields and a range slider; nothing requires dragging. Text description of every figure is generated from the same model, with a table of values for the graphs, `aria-live` readouts, reduced-motion stepping and 44 px targets.

## Exercise coverage audit (all 16, every subpart)

Verified two ways: the engine recomputation (`recomputeAnswers`) and independent hand calculations written in the test from the problem statements. The audit test (`exerciseCoverage`) fails if any part lacks an answer.

| Q | Kind | Parts answered | Result | Illustration / lab |
|---|---|---|---|---|
| 1 | numerical | a, b | 1000 m; 0 m | Lab B |
| 2 | numerical | i, ii | 18 m; +6 m | Lab C |
| 3 | conceptual | a, b | Yes, by changing direction | circular illustration and lab |
| 4 | numerical | a, b | 4 m/s²; 72 m | graph illustration; Equation Lab prefilled |
| 5 | numerical | a, b | −4 m/s²; 7 s | graph illustration; Equation Lab prefilled |
| 6 | graph | single | No: different slopes; they only meet at 5 s | two graph illustrations (illustrative values) |
| 7 | multi-select | i, ii, iii, iv | (i) and (ii) correct; (iii) and (iv) incorrect | two track illustrations (illustrative values) |
| 8 | numerical | single | 450 m | exact graph illustration; no lab (fractional a) |
| 9 | numerical | single | 310 m | three-stage illustration; lab not linked (several accelerations) |
| 10 | numerical | single | 25 m, stops 5 m short | two-stage illustration; lab not linked |
| 11 | conceptual | single | At rest with respect to the Earth, in motion with respect to the Sun | lesson link |
| 12 | graph | i, ii, iii, iv | 240 m; 50 m; 320 m; 1/60 m/s² | shaded v-t illustration |
| 13 | graph (estimate) | single | about 47 km (46.8 km by strips) | none: km/h and hours are outside the Graph Studio |
| 14 | numerical | single | 774 m | two-stage illustration |
| 15 | graph | a, b, c | 1 and 0.3 m/s²; 12.5 m; 15 m | two illustrations; two Equation Lab links |
| 16 | numerical | i, ii, iii, iv | 66 cm; 14 cm; 0.0122 cm/s; 0.0026 cm/s | scaled circle illustration |

Each solution has given, find, assumptions, principle, formula choice with reasons, hint, step-by-step working with "why", final answer, explanation of the result, and a verification note. The page keeps the order Try yourself, Hint, Worked steps, Final answer, Explore (illustrations and labs appear only after the final answer). Viewing a solution writes nothing to the learning store (Chrome and unit tests check this). A lab is linked only where its model fits; otherwise the page says why not.

## Chapter Practice

28 original questions in seven categories (concept checks, numerical, graph interpretation, prediction, sign or unit errors, motion comparisons, circular-motion reasoning), replacing the "Upcoming" placeholder. Open to everyone, no prerequisites or login. Each question is shown once and only the first answer counts in the on-page summary; wrong answers point to a lesson. Tests check that no practice prompt repeats a lesson question, an exercise summary or another practice question, that every numerical answer equals an independent hand value, and that the module never touches the learning store. Practice is not mastery evidence.

## Tests

- Full frontend suite, run once at completion: **58 files, 1103 tests, all passing**.
- New or extended physics motion tests: 123 tests in 8 files (speed 14, profile 10, equations and circular 17, exercises 12, practice 6, learn 27, integration 12, kinematics 25), including independent-oracle checks (numerical integration of v and |v|, hand values for every lesson and exercise number, circle geometry identities) and edge cases (zero acceleration, negative velocity and acceleration, reversals, a = 0 agreement with the path model, refusal of non-constant acceleration, full turn, clockwise motion, invalid inputs).
- Backend: `python -m pytest backend/tests` (from the repository root): **22 passed** (unchanged by this work).
- `tsc -b`: clean. Production build (`vite build`): succeeds. Lint (`oxlint src`): no errors; warnings only (existing ones plus one fast-refresh warning for the `MOTION_VISUALS` export).

## Real-Chrome checks (all passed, no page errors)

Scripted with the Chrome DevTools protocol against the dev server at 1440x900, 360x780 and a 844x390 landscape phone:

1. Speed and velocity investigation (experiment G): specific correction for velocity = speed, matching prediction with the substitution, run route 7 m/s and +1 m/s.
2. Direction reversal: velocity negative after the turn, "turned back" message; replay speed 0.5x and 2x give identical physical values.
3. Acceleration investigation (Graph Studio, decreasing speed): prediction versus model, a = −2 m/s², v = 0 at 8 s.
4. Position-time graph: keyboard to 8 s reads +64 m; slider text for assistive technology.
5. Velocity-time graph: reversal gives displacement 0 but distance 50 m; table of values; an impossible acceleration (99 m/s²) is refused with a reason.
6. Equation experiment: braking gives v = 0, s = +50 m and the model check passes; changing acceleration is refused.
7. Circular motion: half turn displacement 20 m, distance 31.42 m; full turn displacement 0; speed unchanged.
8. Numerical exercise (Q4): nothing revealed up front; principle and formulas with steps; answers 4 m/s² and 72 m; illustration after the answer; Equation Lab link prefilled (fields show a = 4, duration 6).
9. Conceptual exercise (Q11) and a no-lab exercise (Q9, with the reason shown).
10. Chapter Practice: 28 items, first-answer-only scoring, review links, no mastery written.
11. Navigation only (Next through four new lessons): no independent evidence, not mastery.
12. Hint-assisted answer is assisted, not first-try; a lesson completed by first-try independent answers is Mastered.
13. Keyboard: graph sliders (arrow keys, End), circular time slider (ArrowRight), motion track (PHY-1A checks unchanged).
14. Mobile and desktop: no horizontal overflow at 360 px on the hub, lab, Graph Studio, Equation Lab, circular lab, exercises, practice and a lesson; none in landscape.
15. Electricity landing and workbench still load and link to the Physics hub.

Screenshots of the Graph Studio (desktop), circular lab, the shaded Q12 illustration and a mobile lesson were inspected by eye.

## Unresolved issues and honest limits

- **Figure-derived data.** Q12 and Q13 values were read by eye from the rendered printed figures (Q13 is an estimate and says so). Q6 and Q7 figures carry no scale, so their illustrations use stated illustrative values with the same shape. These are labelled on the page.
- **Single constant acceleration in the Graph Studio.** The presets and editor offer one constant acceleration per motion (so every graph follows exactly from the equations). Multi-stage motions (Q9, Q10, Q12, Q14) are shown as read-only illustrations and are not linked to a lab. Q7 uses the path model, which idealises the changes of speed as instantaneous.
- **Q8 and Q15.** Q8 has a fractional deceleration (−5/36 m/s²), so it is shown as an exact illustration without a typed-number lab link. Q15 draws the two cars on two panels, not one overlaid graph; the five plotting points per car are in the solution.
- **Q16.** The circular lab works in metres and seconds (period up to 60 s), so it cannot show a 7 cm minute hand. A clearly labelled scaled illustration shows only the geometry (1.5 turns, displacement along a diameter).
- **Practice is local to the page.** Results are not saved or counted anywhere by design.
- **Browser coverage.** One Chrome profile at three viewport sizes; the full exercise and practice banks are covered by automated tests rather than replayed in the browser. Layout was checked for overflow on every new page and visually on a sample of pages.
- Forces, Energy, Sound, Chemistry and unrelated Mathematics were not started.
