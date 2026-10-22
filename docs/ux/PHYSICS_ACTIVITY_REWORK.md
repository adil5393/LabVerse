# Physics labs and lesson activities

This follow-up to the phone-first redesign covers the standalone Physics laboratories and the smaller interactive activities in Motion, Forces, Work/Energy/Machines, and Sound. Electricity's two existing lab routes are included in the responsive regression checks.

## Student experience

- Lesson activities have a consistent dark apparatus surface and a **Focus activity** button. Focus uses the whole screen without remounting the experiment. Returning preserves the current experiment, restores keyboard focus, and restores page scrolling.
- Motion tracks, force diagrams, derivation figures, energy plots, and machine schematics draw against their container width. Narrow lesson cards receive fewer ticks and readable labels rather than a squeezed desktop drawing.
- Phone graph activities show one graph at a time. The standalone graph lab gives the selected graph the full scene area, with playback directly below it.
- Measurements, history, and longer explanations use expandable sections. Work derivations use a compact phone selector, with assumptions and numerical parameters available separately.
- The phone work lab has a native-size schematic, force legend, cart selection and dragging, visibility settings, and parameter access. The desktop camera and workstation remain available at desktop sizes.
- Number fields put the label and unit above the input and step buttons, so long units cannot squeeze the input on a narrow phone.
- Sound labs put playback or plucking ahead of secondary graphs. Instrument settings, graph explanations, and picture-scale notes can be expanded when needed.

The physics engine, scoring, curriculum answers, and scientific calculations were not changed.

## Verification

The development review entry `/physics-audit.html` reads the real lesson and practice data. It renders each registered curriculum example through the production `VisualHost`; it does not use substitute demonstration data. This HTML entry is outside the production build entry points.

| Check | Coverage |
| --- | --- |
| Embedded curriculum instances | 165 instances across 22 visual types |
| Embedded render widths | 320, 390, 430, and 1440 CSS pixels: 660 checks |
| Standalone labs and derivation routes | 18 routes at 320, 390, 844, and 1440 pixels: 72 checks |
| Phone interaction flows | 35 checks: focus/return for all 22 types, ten setup sheets, cart dragging, plucking, and wave-frequency changes |
| Automated suite | 1,788 tests across 101 test files |
| Build | TypeScript project check and production build |

The embedded sweep opens secondary sections and measures rendered SVG labels and form controls. It checks page overflow, labels smaller than 10.5 rendered pixels, labels extending beyond their SVG, and visible button/input/select targets smaller than 43px high or 30px wide. The final results contain no findings for those checks and no browser runtime errors. Results are summarized in [physics-responsive-summary.json](physics-responsive-summary.json).

These are Chrome phone-emulation and desktop checks, including a short landscape viewport. They cover the authored starting states and the listed interaction flows, rather than every possible parameter combination or every physical phone browser. Existing repository lint warnings remain; lint reports no errors.

## Screenshots

These are captures of the implemented app at 390px, not generated mockups.

- [Graph laboratory](screenshots/physics-graph-lab-mobile.png)
- [Work laboratory](screenshots/physics-work-lab-mobile.png)
- [Wave laboratory](screenshots/physics-wave-lab-mobile.png)
- [Embedded force activity](screenshots/physics-embedded-force-mobile.png)
- [Activity focus view](screenshots/physics-activity-focus-mobile.png)

## Repeating the browser checks

Start the frontend development preview, then run `scripts/audit-physics.cjs` and `scripts/audit-physics-labs.cjs` from the frontend directory using an existing Playwright installation. `PLAYWRIGHT_MODULE` can point to that installation and `CHROME_PATH` can select an installed browser. `PREVIEW_URL` defaults to `http://127.0.0.1:5188`; `AUDIT_OUTPUT` controls the report folder. The scripts fail on runtime errors or page overflow; the embedded sweep also fails on its label and target-size findings.
