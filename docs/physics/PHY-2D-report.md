# PHY-2D report: Newton's third law and two-body interactions

Source: NCERT Class 9 Science, *Exploration* (2026-27), Chapter 6 (`iesc106.pdf`), Sections **6.6** (Activities 6.5 to 6.7, walking and climbing, canoe, rocket, non-contact forces Figs. 6.31 to 6.33, Examples 6.7 and 6.8, Pause and Ponder 9 and 10) and **6.7** (forces on a system, Fig. 6.34, Eq. 6.4, Fig. 6.35). Exercises 7, 9 and 16 were checked against the PDF text.

## Curriculum coverage

Sections 6.1 to 6.7 and all sixteen exercises are now covered; only the closing "The Journey Beyond" activities remain Upcoming in the chapter map. Chapter Practice is still Upcoming (each lesson has its own independent practice).

- **Unit 5, Newton's third law:** lesson 8 (statement and the Activity 6.5 and 6.6 ideas; which object each force acts on; why a pair does not cancel and how it differs from balanced forces; equal forces with unequal accelerations, Examples 6.7 and 6.8) and lesson 9 (walking and climbing with forward friction on the foot, canoe, balloon and rocket with the net force thrust minus weight, spacecraft and fire-hose from Pause and Ponder 9 and 10, non-contact forces, momentum of two interacting objects as enrichment).
- **Unit 6, forces on a system (Section 6.7):** lesson 10 (internal versus external forces, a = F ÷ (m₁ + m₂) from Eq. 6.4, tension, checking on each box).
- New optional prerequisite `pfp-fma` (using F = ma for ONE object); unit prerequisites for both units; skipping never blocks.
- Enrichment (labelled): the force-pair rule, side-by-side balanced versus pair diagrams, and total momentum of an isolated pair.

## Two-body model and interactions (no existing engine rewritten)

- `twoBody.ts`: carts A and B on a frictionless track, exact closed-form motion on the same fixed 0.01 s grid. **Push apart:** equal and opposite internal forces for a finite time, then coasting; total momentum conserved; B may not approach A (collisions are not modelled and the validation says so). **Tow (Section 6.7):** a taut string, an external force on A, a = F ÷ (m_A + m_B), tension T = m_B a as the internal pair. Force on A by B and force on B by A are always exactly equal and opposite; the net force on each cart is computed separately.
- `pairs.ts`: the pair rule (objects swap, same kind, equal size, opposite direction), with the specific reason when a chosen couple is not a pair, and six textbook scenarios (book on a table, wall, walking, canoe, rocket, two magnets).
- **Interactions Laboratory** (`/physics/forces/interactions`, linked from the Force Laboratory): the two-cart view with separate free-body diagrams naming the source and recipient of every force, a "show net force on each cart" toggle, per-cart readouts, a velocity timeline and time controls near the canvas; advanced settings (starting velocities, arrangement) are collapsed so the page stays uncrowded. Investigations P (two carts pushing apart), Q (different masses, equal forces, Example 6.8), R (identify the pair), S (balanced forces versus a pair, side by side), T (everyday interactions), each Predict, Experiment, Observe, Explain, judged by the model (exactly one prediction option holds).
- The single-cart Force Laboratory, friction model, pulse model, graphs, derivations and investigations A to O are unchanged.

## NCERT exercises

| Q | Result |
|---|---|
| 7 | The boat moves backwards (the sailor pushes it backwards, it pushes him forwards, equal forces on different objects); illustration with labelled illustrative masses (boat 120 kg, sailor 60 kg) |
| 9 | (iv) equal magnitude of force; illustration of an idealised interaction; the page says collisions, impacts and deformation are not simulated |
| 16 | Equal and opposite magnetic forces; the needle moves because its small mass (and pivot) give a large acceleration, while the massive bar magnet, held by friction or the table, shows none |

Each has given, find, principle, hint, steps with reasons, final answer, explanation, common mistakes, illustration and lab link or the reason none fits. The 13 existing solutions are unchanged. All sixteen are now solved.

## Verification

- **Targeted tests** (131 in `engine/physics/forces`, 20 new in `twoBody.test.ts`): equal and opposite pair at every sampled time for a grid of masses, forces and durations; hand values (2 kg and 4 kg, 6 N, 2 s gives −6 and +3 m/s, total momentum 0); momentum conserved at every step including with starting velocities; accelerations in the inverse mass ratio and Example 6.8 (0.4 and 20 m/s²); net force on each body computed separately; zero duration and zero force; deterministic history; agreement with the single-cart model; validation (including refused collisions); tow mode (a = F ÷ (m₁ + m₂), T = m₂ a, tension pair equal and opposite, total momentum changes by F·t); pair identification for every scenario, weight and normal force not a pair, rocket thrust not the partner of the weight, every reason reported; one-option-holds for P and Q; exercise numbers 7, 9 and 16 against hand values; full inventory and numbering. The shared mastery tests (hint is assisted, navigation is not mastery, every objective needs independent evidence, teacher demo and shown solutions never master) now run over ten lessons.
- **Real Chrome** (1440 and 360 px, no page errors): the Interactions Laboratory opens with advanced settings collapsed; push apart gives −6 N and +6 N, a = −3 and +1.5, vA −6 and vB +3, total momentum 0; 1 kg and 9 kg with 10 N give equal forces and accelerations −10 and +1.11 m/s²; zero duration leaves both carts at rest; invalid mass is refused with a reason; keyboard Play and Pause; investigation P and Q corrections and Example 6.8 values; pair checking (weight plus normal force is not a pair with the reason; weight plus "book pulls the Earth" is a pair; rocket thrust and weight are not a pair); the balanced-versus-pair side-by-side panels; lesson 8 completed to Mastered with a Physics breadcrumb; Next-only through lesson 9 gives no mastery and a hint makes an answer assisted; lesson 10 mastered legitimately; all sixteen exercises have solutions, Q7, Q9 and Q16 open with illustrations and the right notes, and viewing them records no progress; Forces hub, the PHY-2C lab and derivation, Motion and Electricity still open; no horizontal overflow at 360 px on the hub, interactions (P, S, T), exercises and both new lesson types.
- **PHY-2C seat-bar change** re-verified in the browser: the shortened seat bar ends above the vehicle speed label.
- **Broad checks at completion:** see the next section.

## Broad verification results

Full frontend suite: 65 files, 1248 tests, all passing. Backend `python -m pytest backend/tests`: 22 passed. `tsc -b`: clean. `vite build`: succeeds. Lint (`oxlint src`): no errors, 59 warnings, unchanged from PHY-2C (the Forces-related one is the existing fast-refresh warning for exporting the `FORCE_VISUALS` registry).

## Limitations

- The model is deliberately limited to push-apart and a taut string on a frictionless track. It does not simulate collisions, rebounds, deformation or a real firing, so exercises 7, 9 and 16 use labelled illustrative values for the interaction forces and masses.
- The two-body masses range from 0.01 to 1000 kg and the force up to 1000 N; the single-cart laboratory limits are unchanged.
- Chapter Practice remains Upcoming; the "Journey Beyond" activities are not implemented. PHY-2E and Chapter 7 were not started.
