# A calmer Forces chapter

The interactive sections in **How Forces Affect Motion** now use soft neutral panels, muted green controls, and dark scientific diagrams. The diagram colours retain their physical meaning.

The interaction flow is simpler:

- **Watch motion / See forces:** one view at a time, with the same simulation and playback time behind both views.
- **Playback close to the experiment:** Play, step, Reset, and Setup are the main controls. Speed, duration, backward steps, and braking shortcuts are available in Playback options.
- **Reasoning on request:** detailed force explanations, measurements, graphs, history, and supporting force-pair diagrams can be opened when needed.
- **Activities in plain sight:** the phone labs have an activity picker instead of relying on workspace menus to switch investigations.
- **Two distinct carts:** the interaction scene follows the carts' current positions instead of fitting the entire future journey. On phones, the force view lets the student inspect one cart at a time.
- **Force pairs first:** the situation and answer choices come before the optional diagrams. Predictions, feedback, and the scientific models retain their original rules.

The lighter presentation also applies to shared graph activities within Forces lessons and practice. Other chapters retain their existing presentation.

## Screenshots

- [Lesson activity: motion view](screenshots/forces-calm-activity-phone.png)
- [Lesson activity: force view](screenshots/forces-calm-force-view-phone.png)
- [Force laboratory](screenshots/forces-calm-lab-phone.png)
- [Two-body interactions](screenshots/forces-calm-interactions-phone.png)

## Verification

`frontend/scripts/audit-forces-sessions.cjs` checks the 49 actual Forces curriculum examples at 320, 390, 768, and 1440px. It exercises motion/force switching without resetting time, one-cart inspection, force-pair feedback, all 22 activity-picker options across the two phone labs, and the initial separation of the two carts. It also checks rendered SVG label size and clipping. The audit uses the real development preview and the shared curriculum review entry.

The production build and full automated test suite are checked alongside this browser audit. These checks cover the authored examples and listed flows, rather than every possible parameter combination or every physical phone browser.
