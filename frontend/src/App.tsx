import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SubjectExplorer } from './features/explorer/SubjectExplorer';
import { ElectricityLab } from './features/electricity/ElectricityLab';
import { WorkbenchPage } from './features/workbench/WorkbenchPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: Subject Explorer */}
        <Route path="/" element={<SubjectExplorer />} />

        {/* Route 2: Electricity Laboratory */}
        <Route path="/physics/electricity" element={<ElectricityLab />} />

        {/* Route 3: Interactive Workbench */}
        <Route path="/physics/electricity/workbench" element={<WorkbenchPage />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
