import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SubjectExplorer } from './features/explorer/SubjectExplorer';
import { ElectricityLab } from './features/electricity/ElectricityLab';
import { WorkbenchPage } from './features/workbench/WorkbenchPage';
import { MathematicsLab } from './features/mathematics/MathematicsLab';
import { MathWorkbenchPage } from './features/mathematics/MathWorkbenchPage';
import { ChemistryLab } from './features/chemistry/ChemistryLab';
import { StatesOfMatterWorkbench } from './features/chemistry/StatesOfMatterWorkbench';
import { CirclesLab } from './features/mathematics/circles/CirclesLab';
import { CircleWorkbenchPage } from './features/mathematics/circles/CircleWorkbenchPage';
import { QuadrilateralsLab } from './features/mathematics/quadrilaterals/QuadrilateralsLab';
import { QuadrilateralWorkbenchPage } from './features/mathematics/quadrilaterals/QuadrilateralWorkbenchPage';
import { PropositionsLab } from './features/mathematics/propositions/PropositionsLab';
import { PropositionsWorkbenchPage } from './features/mathematics/propositions/PropositionsWorkbenchPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
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
        <Route
          path="/mathematics/coordinate-geometry"
          element={<Navigate to="/mathematics/workbench?module=coordinate-geometry&experiment=distance" replace />}
        />

        {/* Route 6: Circles Module Landing Page */}
        <Route path="/mathematics/circles" element={<CirclesLab />} />

        {/* Route 7: Interactive Circles Workbench */}
        <Route path="/mathematics/circles/workbench" element={<CircleWorkbenchPage />} />

        {/* Route 8: Quadrilaterals Module Landing Page */}
        <Route path="/mathematics/quadrilaterals" element={<QuadrilateralsLab />} />

        {/* Route 9: Interactive Quadrilaterals Workbench */}
        <Route path="/mathematics/quadrilaterals/workbench" element={<QuadrilateralWorkbenchPage />} />

        {/* Route 10: Propositions & Converses Module Landing Page */}
        <Route path="/mathematics/propositions" element={<PropositionsLab />} />

        {/* Route 11: Interactive Propositions Workbench */}
        <Route path="/mathematics/propositions/workbench" element={<PropositionsWorkbenchPage />} />

        {/* Route 12: Chemistry Laboratory Landing Page */}
        <Route path="/chemistry" element={<ChemistryLab />} />

        {/* Route 13: Interactive Chemistry States of Matter Workbench */}
        <Route path="/chemistry/states-of-matter" element={<StatesOfMatterWorkbench />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
