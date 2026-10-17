import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SubjectExplorer } from './features/explorer/SubjectExplorer';
import { ElectricityLab } from './features/electricity/ElectricityLab';
import { WorkbenchPage } from './features/workbench/WorkbenchPage';
import { MathematicsLab } from './features/mathematics/MathematicsLab';
import { MathWorkbenchPage } from './features/mathematics/MathWorkbenchPage';
import { ChemistryLab } from './features/chemistry/ChemistryLab';
import { StatesOfMatterWorkbench } from './features/chemistry/StatesOfMatterWorkbench';

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

        {/* Route 5: Interactive Mathematics Workbench */}
        <Route path="/mathematics/workbench" element={<MathWorkbenchPage />} />

        {/* Route 6: Chemistry Laboratory Landing Page */}
        <Route path="/chemistry" element={<ChemistryLab />} />

        {/* Route 7: Interactive Chemistry States of Matter Workbench */}
        <Route path="/chemistry/states-of-matter" element={<StatesOfMatterWorkbench />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
