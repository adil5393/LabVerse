# Phone-first LabVerse experience

Implemented on `codex/phone-first-experience` on 22 October 2026.

## Experience

The application now starts with a searchable subject and chapter explorer. The return card uses actual chapter-navigation history rather than invented progress. Physics opens its full chapter catalogue; Electricity remains directly available in the chapter list.

Reading pages use warm light surfaces, navy text and teal actions. Scientific canvases retain their dark palette. Shared colours are defined once through CSS variables and Tailwind opacity-compatible tokens. Icons reserve a fixed space while their font loads, avoiding mobile viewport expansion on a cold visit.

The main journey is consistently Learn → Lab → Practice. Chapter and lesson pages keep the same curriculum, prerequisites, narration and progress rules. On phones the lesson-stage strip becomes a labelled selector, and reading and answer controls have larger touch areas. The sign-in screen has straightforward copy, readable fields, password visibility, and an explicit shared-device reminder. Remember-device is unchecked initially.

## Laboratories

- Below 768 px, only the active phone layout is mounted. Physics laboratories use their specialised mobile views. Other workspaces use a canvas followed by Setup, Results and a subject-appropriate Equipment, Tools, Controls or Experiments action.
- Parameter and equipment sheets support Escape, focus containment and focus restoration, independent scrolling, a backdrop dismissal target and safe-area spacing.
- Mobile physics transport stays separate from the scene. Settings and analysis scroll vertically rather than being squeezed into permanent desktop columns.
- Geometry tools have visible labels in the phone sheet. Coordinate geometry fits its construction and origin to the measured viewport and provides a Fit action. Changing viewport size changes the camera, not the construction.
- Chemistry scales the chamber bitmap to the available canvas area. Piston pointer coordinates account for scaling and letterboxing.
- Electricity has a readable empty state, searchable equipment, touch panning and terminal hit areas, and controls that wrap below the canvas on phones instead of clipping across it.
- The dedicated Work laboratory also uses dynamic viewport height and mounts one layout at a time. Its desktop chrome shares the new palette and its phone analysis action opens results in a sheet.

## Practice

Motion, Forces and Work chapter practice now show one question at a time. Every question remains accessible through a topic-grouped selector. Submitted answers and feedback are restored when returning to a question. The first-answer scoring rule remains unchanged, and practice does not grant lesson mastery. Only the current question's interactive visual is mounted.

## Validation

- Baseline: 1,778 tests passed before implementation.
- Updated suite: 1,787 tests in 100 files. Added coverage for mobile panel access, a single active canvas across breakpoints, searchable chapters, construction fitting, and restoring submitted practice answers.
- TypeScript project build and Vite production build checked with bundled Node 24.19.0.
- Source-scoped lint checked; existing warnings remain. The lint script now scopes itself to source rather than dependencies. `npm test` runs the repeatable frontend suite.
- Browser checks include nine representative routes at 320, 390, 768 and 1440 px, checking against the requested viewport width. The wider smoke sweep also visited the other subject, chapter and laboratory routes.
- Touch-flow checks cover search and its empty state, dismissing the guide, placing a geometry point through the tool drawer, adding circuit equipment, enabling chemistry heating, moving between practice questions, landscape, changing lesson stage and signing out.
- Review images in `screenshots/` are captures of the running implementation, not generated mockups.

## Boundaries

Browser emulation was used, not a physical iPhone or low-end Android device. The existing placeholder authentication, backend solver contract and solver complexity issues from the earlier project analysis are outside this UI change. Scientific models and curriculum content were retained.

## Screenshots

| Screen | Capture |
|---|---|
| Phone home | [Home](screenshots/home.png) |
| Phone motion laboratory | [Motion](screenshots/motion-lab.png) |
| Geometry tools | [Geometry tools](screenshots/geometry-tools.png) |
| Chemistry chamber | [Chemistry](screenshots/chemistry-lab.png) |
| Practice | [Practice](screenshots/practice.png) |
| Sign-in | [Sign-in](screenshots/sign-in.png) |
| Desktop work laboratory | [Desktop lab](screenshots/desktop-lab.png) |
