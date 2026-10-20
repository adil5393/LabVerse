import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Physics Labs
import { WorkLab } from '../../physics/work/WorkLab';
import { KineticLab } from '../../physics/work/KineticLab';
import { EnergyLab } from '../../physics/work/EnergyLab';
import { MachinesLab, PowerLab } from '../../physics/work/MachinesLab';
import { MotionLab } from '../../physics/motion/MotionLab';
import { MotionGraphStudio } from '../../physics/motion/MotionGraphStudio';
import { EquationLab, CircularLab } from '../../physics/motion/MotionLabs';
import { ForcesLab } from '../../physics/forces/ForcesLab';
import { ForcesInteractions } from '../../physics/forces/ForcesInteractions';
import { WorkbenchPage as CircuitWorkbench } from '../../workbench/WorkbenchPage';

// Mathematics Labs
import { MathWorkbenchPage as CoordinateGeometryWorkbench } from '../../mathematics/MathWorkbenchPage';
import { CircleWorkbenchPage } from '../../mathematics/circles/CircleWorkbenchPage';
import { QuadrilateralWorkbenchPage } from '../../mathematics/quadrilaterals/QuadrilateralWorkbenchPage';
import { TwoVariablesWorkbenchPage } from '../../mathematics/twoVariables/TwoVariablesWorkbenchPage';
import { UnderstandingDataWorkbenchPage } from '../../mathematics/understandingData/UnderstandingDataWorkbenchPage';
import { PropositionsWorkbenchPage } from '../../mathematics/propositions/PropositionsWorkbenchPage';

// Chemistry Labs
import { StatesOfMatterWorkbench } from '../../chemistry/StatesOfMatterWorkbench';

describe('Global Blender-Inspired Workspace V3 Rollout Audit', () => {
  const labs = [
    { name: 'Physics — Work Laboratory (Reference)', component: <WorkLab />, chapterId: 'work' },
    { name: 'Physics — Kinetic Energy Lab', component: <KineticLab />, chapterId: 'work' },
    { name: 'Physics — Energy Conservation Lab', component: <EnergyLab />, chapterId: 'work' },
    { name: 'Physics — Simple Machines Lab', component: <MachinesLab />, chapterId: 'work' },
    { name: 'Physics — Power Lab', component: <PowerLab />, chapterId: 'work' },
    { name: 'Physics — Motion Laboratory', component: <MotionLab />, chapterId: 'motion' },
    { name: 'Physics — Motion Graph Studio', component: <MotionGraphStudio />, chapterId: 'motion' },
    { name: 'Physics — Equation Laboratory', component: <EquationLab />, chapterId: 'motion' },
    { name: 'Physics — Uniform Circular Motion', component: <CircularLab />, chapterId: 'motion' },
    { name: 'Physics — Force Laboratory', component: <ForcesLab />, chapterId: 'forces' },
    { name: 'Physics — Two-Body Interactions', component: <ForcesInteractions />, chapterId: 'forces' },
    { name: 'Physics — Circuit Workbench', component: <CircuitWorkbench />, chapterId: 'electricity' },
    { name: 'Mathematics — Coordinate Geometry', component: <CoordinateGeometryWorkbench />, chapterId: 'coordinate-geometry' },
    { name: 'Mathematics — Circles Laboratory', component: <CircleWorkbenchPage />, chapterId: 'circles' },
    { name: 'Mathematics — Quadrilaterals Laboratory', component: <QuadrilateralWorkbenchPage />, chapterId: 'quadrilaterals' },
    { name: 'Mathematics — Two Variables, One Line', component: <TwoVariablesWorkbenchPage />, chapterId: 'two-variables' },
    { name: 'Mathematics — Understanding Data', component: <UnderstandingDataWorkbenchPage />, chapterId: 'understanding-data' },
    { name: 'Mathematics — Propositions & Converses', component: <PropositionsWorkbenchPage />, chapterId: 'propositions' },
    { name: 'Chemistry — States of Matter Simulator', component: <StatesOfMatterWorkbench />, chapterId: 'states-of-matter' },
  ];

  labs.forEach(({ name, component, chapterId }) => {
    it(`renders WorkspaceShell and 5-region workstation layout for ${name}`, () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          {component}
        </MemoryRouter>
      );

      // 1. WorkspaceShell rendered with correct chapterId
      expect(html).toContain('data-testid="workspace-shell"');
      expect(html).toContain(`data-workspace="${chapterId}"`);

      // 2. Shared Top Workstation Bar
      expect(html).toContain('LabVerse');
      expect(html).toContain('Experiment');
      expect(html).toContain('Blackboard');

      // 3. Functional Left Explorer Rail
      expect(html).toContain('chevron_right');

      // 4. Analysis Dock
      const hasDock = html.includes('analytics') || html.includes('work-readout');
      expect(hasDock).toBe(true);

      // 5. Right Properties Inspector
      expect(html).toContain('chevron_left');
    });
  });
});
