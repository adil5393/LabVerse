# LabVerse — Interactive Virtual Science Laboratories (MVP 0.1)

LabVerse is an extensible, interactive virtual laboratory platform designed for real STEM education. It provides real physical geometry, breadboard hole-level snapping, live circuit simulation, and zero login barriers.

---

## 1. Architectural Decisions & Vite Rationale

### Why Vite?
- **Sub-millisecond HMR & Native ES Modules**: In a high-frequency 2D interactive workbench where users pan, zoom, drag components, and adjust electrical parameters, developer feedback loops must be instantaneous. Vite provides instant server start and lightning-fast Hot Module Replacement (HMR) without bundling overhead during development.
- **Strict TypeScript Integration**: Configured with strict type checking and `verbatimModuleSyntax` to guarantee type safety between generic workbench entities and specialized physical equipment models.
- **Optimized Production Rollup Bundle**: Produces compact, tree-shaken static assets (`dist/`) that run directly in any modern browser without requiring node or cloud runtimes in production.

### Decoupled Core Architecture
1. **Generic Workbench Core (`frontend/src/features/workbench/`, `frontend/src/types/workbench.ts`)**:
   - The workbench canvas, affine coordinate transform engine (millimeter world space $\leftrightarrow$ screen pixels), camera zoom/pan, equipment registry, generic inspector, and local persistence are **strictly subject-agnostic**.
   - Physics, Chemistry, Biology, Mathematics, and Robotics laboratories plug into this shared engine through subject adapters without coupling the workbench to electrical circuits.
2. **Electricity Specialization Adapter (`frontend/src/subjects/physics/`, `frontend/src/types/physics.ts`)**:
   - Implements specific electrical terminals (anodes, cathodes, binding posts), component definitions (breadboard, DC bench supply, resistor, LED, jumper wires), and circuit connectivity.
3. **No Authentication Guarantee**:
   - Absolutely no login, signup, user accounts, password screens, or auth middleware.
   - Experiments open immediately and state persists locally in browser storage or downloadable `.lab` JSON files.

---

## 2. Milestone A Implemented Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Subject Explorer** | Choose from 5 STEM subjects. Physics is active; Chemistry, Biology, Mathematics, and Robotics are badged as in development. Includes filter tabs and "No login required" indicator. |
| `/physics/electricity` | **Electricity Laboratory** | Topic hub featuring Experiment 01: *Build Your First LED Circuit* (Guided) and *Free DC Circuit Workbench* (Sandbox), alongside curriculum specifications. |
| `/physics/electricity/workbench` | **Interactive Workbench** | The interactive workspace with top navigation toolbar, zoom/pan controls, Beginner/Advanced mode switcher, horizontal guided progression strip, equipment tray, ESD dark graphite SVG canvas, and contextual inspector sidebar. |

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript (strict), Vite, Tailwind CSS, Zustand, React Router DOM.
- **Design Tokens**: ESD Dark Graphite Mat (`#0c1017`), tailored electric blue (`#4d8eff`), conductive emerald (`#4edea3`), amber warning (`#ffb95a`), fault crimson (`#ffb4ab`).
- **Typography**: Inter (UI / headlines) and JetBrains Mono (measurements / coordinates / addresses).
- **Backend (Milestone D)**: Python 3.12, FastAPI, Pydantic, pytest.
- **Persistence**: Browser IndexedDB & JSON `.lab` export/import.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Development Server
```bash
cd frontend
npm run dev
```

### Production Build & Preview
```bash
cd frontend
npm run build
npm run preview
```

---

## 5. Milestone Progression

- [x] **Milestone A**: React application, 3 routes, Stitch-aligned design system, responsive workbench shell, and navigation.
- [ ] **Milestone B**: Equipment definitions, high-fidelity 400-tie breadboard SVG geometry, and component visual placement.
- [ ] **Milestone C**: Multi-pin snapping constraints, hole occupancy, jumper-wire routing, and client-side DSU electrical connectivity.
- [ ] **Milestone D**: Python DC circuit solver, direct supply short-circuit detection, and live FastAPI telemetry integration.
- [ ] **Milestone E**: Guided experiment topological validator, IndexedDB persistence, diagnostics, and acceptance test suite.

---

## Docker

Two services: the web app (nginx serving the Vite build, with `/api` proxied to the solver) and the FastAPI circuit solver.

```bash
docker compose up --build            # production-style, http://localhost:8080
docker compose down

docker compose -f docker-compose.dev.yml up --build   # hot reload: Vite on :5173, uvicorn --reload on :8000
```

- `frontend/Dockerfile` builds with Node 20 (`npm ci`, `tsc -b`, `vite build`) and serves `dist/` from nginx with single-page-app routing.
- `backend/Dockerfile` is built from the repository root (the solver is the `backend` package) and runs as a non-root user with a `/health` check.
- The app calls the relative URL `/api/solve`, so no CORS or host configuration is needed in either mode. Set `VITE_API_PROXY` to point the dev server at a different solver.
- Backend tests: `pip install -r backend/requirements-dev.txt && pytest backend/tests`.
