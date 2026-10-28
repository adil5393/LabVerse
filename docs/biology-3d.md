# Biology diagrams and optional 3D views

## Added dependency

| Package | Version | Licence | Used for |
| --- | --- | --- | --- |
| `three` | 0.186.1 | MIT (Copyright © 2010–2026 three.js authors) | Optional 3D cell, flower and joint models |
| `@types/three` | 0.186.0 (dev only) | MIT | Type definitions |

`three` is loaded only when a student presses **Explore in 3D**. It is built into its own chunk (`Bio3DViewer-*.js`, about
600 kB, 151 kB gzipped) and is never part of the main bundle. A test (`features/biology/__tests__/diagrams3d.test.tsx`) fails
if any file other than `features/biology/three/Bio3DViewer.tsx` and `models.ts` imports it.

No model or texture files are downloaded: every model is built from simple shapes at load time, so there are no asset
licences to track and the views work offline once the chunk is cached.

## Where things live

- `features/biology/shared/bioPalette.ts`: one colour per structure, shared by 2D diagrams, labs and 3D models.
- `features/biology/shared/BioDiagram.tsx`: labelled diagrams with tap-to-inspect markers, process sequences, before/after panels.
- `features/biology/*/…Diagrams.tsx`: chapter diagrams used in lessons and practice solutions.
- `features/biology/three/ViewMode.tsx`: the “2D diagram / Explore in 3D” switch, WebGL check, lazy loader and fallback.
- `features/biology/three/Bio3DViewer.tsx`: the viewer (render on demand, no animation loop, releases WebGL on close).
- `features/biology/three/models.ts`: the models, with the proportions used and their sources noted at the top.

## Model notes

All models are schematic and say so on screen. Organelles are enlarged and far fewer than in a real cell; the plant cell’s
central vacuole fills most of the cell and pushes the nucleus to one side. Joint movement ranges (`JOINT_RANGES` in
`engine/biology/tissues/model.ts`) are typical adult active ranges.
