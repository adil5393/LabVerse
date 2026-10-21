# LabVerse project analysis

Date: 22 October 2026

## Scope and conclusion

Repository-wide inventory and architecture review, with focused inspection of routing, state, scientific engines, circuit integration, education, narration, deployment, and validation configuration. This is not an exhaustive correctness proof of every lesson, equation, interaction, or browser layout. No application source was changed.

LabVerse is a substantial browser-based STEM learning application, considerably beyond the MVP described in the README. It has useful separation between pure scientific calculations, React interfaces, and Zustand state. Its immediate needs are integration reliability and repeatable verification before further feature expansion.

## Architecture

| Layer | Implementation | Role |
|---|---|---|
| Application | React 19, TypeScript, React Router, Vite | Route-based modules with lazy loading |
| Interface | Tailwind, SVG, workspace shells | Interactive apparatus, inspectors, graphs, mobile layouts |
| Scientific engines | `frontend/src/engine` | Geometry, connectivity, local DC solving, mechanics, chemistry, evaluation |
| State | `frontend/src/store` | Experiment state, history, learning progress, preferences, placeholder sessions |
| Curriculum | Chapter content, registries, prerequisites, practice banks | Lessons, investigations, guided learning, assessment |
| Backend | FastAPI, Pydantic, NumPy | Health endpoint and DC circuit solving |
| Deployment | Docker Compose, nginx | Static frontend, SPA routing, API proxy, backend health checks |

The source inventory initially contained 550 frontend files and 96 test files. The working tree changed during this review when an additional workspace test appeared; that file was left untouched.

Implemented areas include electricity; motion, forces, sound, work, energy, power and machines; coordinate geometry, circles, quadrilaterals, propositions, linear equations and data; chemistry states of matter; reusable learning and narration facilities. Most simulations run locally. The backend is specifically a circuit solver, rather than a general backend for accounts, curriculum or student records.

## Strengths

- Scientific engines are largely separate from rendering, allowing focused numerical tests.
- Route-level lazy loading avoids eagerly loading every laboratory.
- Shared workspace slots, mobile shells and control components provide a foundation for consistent interaction.
- Learning records distinguish assisted work and independent evidence, with versioned local progress migration.
- Narration includes explicit playback controls, keyboard considerations and readable text alternatives.
- Circuit UI guards against applying stale asynchronous results after topology changes.
- Deployment includes SPA fallback, API proxying, immutable hashed assets and a non-root backend container.

## Prioritized findings

### 1. High: normal equipment properties violate the circuit API contract

`frontend/src/features/workbench/WorkbenchPage.tsx:456` copies catalog defaults into instances. `frontend/src/engine/simulation/simulationClient.ts` sends these properties unchanged. The catalog includes strings such as LED `color: 'red'` and breadboard row descriptions, whereas `backend/solver/dc_solver.py:43` declares `properties: Dict[str, float]`.

Reproduced directly with Pydantic: a request containing `properties: {'color': 'red'}` fails validation. Through FastAPI this produces a validation response rather than a solve result. The client silently falls back on non-success responses, concealing the mismatch. Backend unit tests passing does not validate this browser-to-API contract.

Action: define an explicit shared solve payload containing validated simulation parameters, or support the actual property union with model-specific validation. Add a contract test using real catalog defaults. Surface which solver produced a result and why fallback occurred.

### 2. High if access protection is intended: sign-in is only a browser gate

`frontend/src/store/useAuthStore.ts:13` reads credentials from build-time browser environment values. Sessions are unsigned browser-storage objects. `RequireAuth` checks only the store's user value; development initializes signed in. `backend/main.py` has no authentication on `/api/solve`.

The README correctly acknowledges this placeholder in its final section, but earlier promises no authentication at all. Treat the current gate as a convenience. If protected access is required, move credential checks and session verification to the server and authorize the API there.

### 3. High: circuit solving has unbounded exponential work

`backend/solver/dc_solver.py:611` materializes and sorts all `2^n` LED conduction candidates. Request collections have no explicit size bounds. Large connected LED networks can consume substantial memory and processing time. The local solver repeats this strategy; `frontend/src/engine/simulation/dcSolverLocal.ts:631` also uses JavaScript's signed 32-bit bit shift, which produces incorrect candidate counts for sufficiently large LED counts.

The 400 ms browser timeout does not cancel server-side computation. Falling back executes synchronous local solving on the browser thread.

Action: impose documented limits immediately, validate topology and finite parameter ranges, then replace exhaustive enumeration if larger circuits are required. Consider a worker for local computation and server-side resource controls.

### 4. Medium: validation tooling is not dependable enough

- `frontend/package.json` has no test script despite the extensive Vitest suite.
- No tracked GitHub workflow was found.
- The lint command traversed installed dependencies and produced an extremely large warning stream, making project findings difficult to assess.
- `frontend/tsconfig.app.json` does not enable `strict`, contrary to the README's claim.
- The installed Node version was 20.17.0; installed Vite requires 20.19+ or 22.12+.

Action: establish a supported runtime, scope lint to project source, add a repeatable test command and CI, and enable stricter type checking incrementally.

### 5. Medium: persistence promises exceed the electricity implementation

The electricity store is in memory and the workbench provides JSON export. No IndexedDB implementation or electricity import handler was found in the inspected source, despite README promises of IndexedDB persistence and import/export. Reloading can therefore lose unexported circuit state. Learning progress does use local storage, but it remains device/browser-local and is not scoped to individual authenticated students.

Action: implement and document autosave, validated import and migration, or narrow the product claims. Decide how shared devices should handle student progress before adding real accounts.

### 6. Medium: runtime failure recovery and fallback visibility are limited

`App.tsx` provides Suspense loading, but no React error boundary was found. Failed lazy imports or rendering errors have no dedicated recovery interface. The circuit client accepts a successful response without runtime schema validation and treats all backend failures as silent local fallback. The abort timer is cleared only after fetch resolves, rather than in a finally block.

Action: add route recovery, validate responses, record fallback reasons, and distinguish network failures from rejected requests and solver errors.

### 7. Maintainability and documentation debt

The shared workspace imports its header from the physics work chapter, inverting the intended shared-to-feature dependency. There are overlapping shared, physics-specific and chapter-specific controls and layouts. Several canvases, inspectors and content files are large; these need selective decomposition as they change, rather than a wholesale rewrite.

The README describes an electricity-only milestone, inactive mathematics/chemistry, strict typing, no login and IndexedDB, while later sections and current code contradict those claims. It advertises Docker port 8080 while production Compose binds localhost port 8085. Backend dependencies use open-ended minimum versions, and the frontend directly lists a Windows-specific native binding, requiring force installation in Linux Docker builds.

Action: update architecture and setup documentation, move shared headers and primitives to neutral locations, pin reproducible backend dependencies, and remove the platform-specific direct binding if transitive optional dependencies cover it.

## Verification performed

| Check | Result |
|---|---|
| Python backend tests | 22 passed |
| Production frontend build | Completed; Node compatibility warning |
| Realistic nonnumeric property validation | Reproduced rejection of LED color |
| Standard frontend lint | Ran, but traversed dependencies and generated excessive warnings; not a clean source-quality result |
| Frontend Vitest suite | Attempts did not produce a usable completion; stopped after stalls, including a single-worker retry. No passing-suite claim is made |
| Browser interaction, visual layouts and Docker startup | Not exercised |
| Dependency vulnerability audit | Not performed |

## Recommended sequence

1. Fix the real catalog-to-API payload and add an integration test.
2. Bound circuit complexity and reject invalid numeric/topological inputs.
3. Make runtime, lint, tests and CI reproducible; obtain a complete frontend result.
4. Resolve the intended access model and implement server sessions if needed.
5. Make save/restore behavior reliable and document local progress limitations.
6. Consolidate shared workspace ownership and refresh documentation.

Continue using the existing architecture. The evidence supports targeted hardening rather than a rewrite.
