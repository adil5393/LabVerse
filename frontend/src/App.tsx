import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SubjectExplorer } from './features/explorer/SubjectExplorer';

// Lazy-loaded Subject & Chapter Modules
const ElectricityLab = lazy(() =>
  import('./features/electricity/ElectricityLab').then((m) => ({ default: m.ElectricityLab }))
);
const WorkbenchPage = lazy(() =>
  import('./features/workbench/WorkbenchPage').then((m) => ({ default: m.WorkbenchPage }))
);
const MathematicsLab = lazy(() =>
  import('./features/mathematics/MathematicsLab').then((m) => ({ default: m.MathematicsLab }))
);
const CoordinateGeometryLab = lazy(() =>
  import('./features/mathematics/coordinateGeometry/CoordinateGeometryPages').then((m) => ({ default: m.CoordinateGeometryLab }))
);
const CoordinateGeometryLearnPage = lazy(() =>
  import('./features/mathematics/coordinateGeometry/CoordinateGeometryPages').then((m) => ({ default: m.CoordinateGeometryLearnPage }))
);
const CoordinateGeometryPracticePage = lazy(() =>
  import('./features/mathematics/coordinateGeometry/CoordinateGeometryPages').then((m) => ({ default: m.CoordinateGeometryPracticePage }))
);
const MathWorkbenchPage = lazy(() =>
  import('./features/mathematics/MathWorkbenchPage').then((m) => ({ default: m.MathWorkbenchPage }))
);
const CirclesLab = lazy(() =>
  import('./features/mathematics/circles/CirclesLab').then((m) => ({ default: m.CirclesLab }))
);
const CirclesLearnPage = lazy(() =>
  import('./features/mathematics/circles/learn/CirclesLearn').then((m) => ({ default: m.CirclesLearnPage }))
);
const CircleWorkbenchPage = lazy(() =>
  import('./features/mathematics/circles/CircleWorkbenchPage').then((m) => ({
    default: m.CircleWorkbenchPage,
  }))
);
const QuadrilateralsLab = lazy(() =>
  import('./features/mathematics/quadrilaterals/QuadrilateralsLab').then((m) => ({
    default: m.QuadrilateralsLab,
  }))
);
const QuadrilateralWorkbenchPage = lazy(() =>
  import('./features/mathematics/quadrilaterals/QuadrilateralWorkbenchPage').then((m) => ({
    default: m.QuadrilateralWorkbenchPage,
  }))
);
const PropositionsLab = lazy(() =>
  import('./features/mathematics/propositions/PropositionsLab').then((m) => ({
    default: m.PropositionsLab,
  }))
);
const PropositionsWorkbenchPage = lazy(() =>
  import('./features/mathematics/propositions/PropositionsWorkbenchPage').then((m) => ({
    default: m.PropositionsWorkbenchPage,
  }))
);
const TwoVariablesLab = lazy(() =>
  import('./features/mathematics/twoVariables/TwoVariablesLab').then((m) => ({
    default: m.TwoVariablesLab,
  }))
);
const TwoVariablesWorkbenchPage = lazy(() =>
  import('./features/mathematics/twoVariables/TwoVariablesWorkbenchPage').then((m) => ({
    default: m.TwoVariablesWorkbenchPage,
  }))
);
const UnderstandingDataLab = lazy(() =>
  import('./features/mathematics/understandingData/UnderstandingDataLab').then((m) => ({
    default: m.UnderstandingDataLab,
  }))
);
const UnderstandingDataWorkbenchPage = lazy(() =>
  import('./features/mathematics/understandingData/UnderstandingDataWorkbenchPage').then((m) => ({
    default: m.UnderstandingDataWorkbenchPage,
  }))
);
const ChemistryLab = lazy(() =>
  import('./features/chemistry/ChemistryLab').then((m) => ({ default: m.ChemistryLab }))
);
const StatesOfMatterWorkbench = lazy(() =>
  import('./features/chemistry/StatesOfMatterWorkbench').then((m) => ({
    default: m.StatesOfMatterWorkbench,
  }))
);

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col items-center justify-center p-6 space-y-4">
    <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
    <div className="text-sm font-mono text-slate-400 animate-pulse tracking-wide">
      Loading Laboratory Module...
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Route 1: Subject Explorer */}
          <Route path="/" element={<SubjectExplorer />} />

          {/* Route 2: Electricity Laboratory (Physics) */}
          <Route path="/physics/electricity" element={<ElectricityLab />} />

          {/* Route 3: Interactive Physics Workbench */}
          <Route path="/physics/electricity/workbench" element={<WorkbenchPage />} />

          {/* Route 4: Mathematics Laboratory Landing Page */}
          <Route path="/mathematics" element={<MathematicsLab />} />

          {/* Route 5: Interactive Mathematics Workbench (Coordinate Geometry) */}
          <Route path="/mathematics/workbench" element={<MathWorkbenchPage />} />
          <Route path="/mathematics/coordinate-geometry" element={<CoordinateGeometryLab />} />
          <Route path="/mathematics/coordinate-geometry/learn/:lessonId" element={<CoordinateGeometryLearnPage />} />
          <Route path="/mathematics/coordinate-geometry/practice" element={<CoordinateGeometryPracticePage />} />

          {/* Route 6: Circles Module Landing Page */}
          <Route path="/mathematics/circles" element={<CirclesLab />} />

          {/* Route 7: Interactive Circles Workbench */}
          <Route path="/mathematics/circles/workbench" element={<CircleWorkbenchPage />} />
          <Route path="/mathematics/circles/learn/:lessonId" element={<CirclesLearnPage />} />

          {/* Route 8: Quadrilaterals Module Landing Page */}
          <Route path="/mathematics/quadrilaterals" element={<QuadrilateralsLab />} />

          {/* Route 9: Interactive Quadrilaterals Workbench */}
          <Route path="/mathematics/quadrilaterals/workbench" element={<QuadrilateralWorkbenchPage />} />

          {/* Route 10: Propositions & Converses Module Landing Page */}
          <Route path="/mathematics/propositions" element={<PropositionsLab />} />

          {/* Route 11: Interactive Propositions Workbench */}
          <Route path="/mathematics/propositions/workbench" element={<PropositionsWorkbenchPage />} />

          {/* Route 11b: Two Variables, One Line landing page and workbench */}
          <Route path="/mathematics/two-variables" element={<TwoVariablesLab />} />
          <Route path="/mathematics/two-variables/workbench" element={<TwoVariablesWorkbenchPage />} />

          {/* Route 11c: Understanding Data landing page and workbench */}
          <Route path="/mathematics/understanding-data" element={<UnderstandingDataLab />} />
          <Route path="/mathematics/understanding-data/workbench" element={<UnderstandingDataWorkbenchPage />} />

          {/* Route 12: Chemistry Laboratory Landing Page */}
          <Route path="/chemistry" element={<ChemistryLab />} />

          {/* Route 13: Interactive Chemistry States of Matter Workbench */}
          <Route path="/chemistry/states-of-matter" element={<StatesOfMatterWorkbench />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
