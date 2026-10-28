import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SubjectExplorer } from './features/explorer/SubjectExplorer';
import { LoginPage } from './features/auth/LoginPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { ExperienceFrame } from './components/ExperienceFrame';

// Lazy-loaded Subject & Chapter Modules
const ElectricityLab = lazy(() =>
  import('./features/electricity/ElectricityLab').then((m) => ({ default: m.ElectricityLab }))
);
const WorkbenchPage = lazy(() =>
  import('./features/workbench/WorkbenchPage').then((m) => ({ default: m.WorkbenchPage }))
);
const RoboticsHub = lazy(() =>
  import('./features/robotics/RoboticsHub').then((m) => ({ default: m.RoboticsHub }))
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
const CoordinateGeometryAssessmentPage = lazy(() =>
  import('./features/mathematics/coordinateGeometry/CoordinateGeometryPages').then((m) => ({ default: m.CoordinateGeometryAssessmentPage }))
);
const CoordinateGeometryPracticePage = lazy(() =>
  import('./features/mathematics/coordinateGeometry/CoordinateGeometryPages').then((m) => ({ default: m.CoordinateGeometryPracticePage }))
);
const MathWorkbenchPage = lazy(() =>
  import('./features/mathematics/MathWorkbenchPage').then((m) => ({ default: m.MathWorkbenchPage }))
);
const CirclesHub = lazy(() =>
  import('./features/mathematics/circles/learn/CirclesHub').then((m) => ({ default: m.CirclesHub }))
);
const CirclesPracticePage = lazy(() =>
  import('./features/mathematics/circles/learn/CirclesHub').then((m) => ({ default: m.CirclesPracticePage }))
);
const CirclesAssessmentPage = lazy(() =>
  import('./features/mathematics/circles/learn/CirclesHub').then((m) => ({ default: m.CirclesAssessmentPage }))
);
const CirclesLearnPage = lazy(() =>
  import('./features/mathematics/circles/learn/CirclesLearn').then((m) => ({ default: m.CirclesLearnPage }))
);
const CircleWorkbenchPage = lazy(() =>
  import('./features/mathematics/circles/CircleWorkbenchPage').then((m) => ({
    default: m.CircleWorkbenchPage,
  }))
);
const QuadrilateralsHub = lazy(() =>
  import('./features/mathematics/quadrilaterals/learn/QuadrilateralsHub').then((m) => ({ default: m.QuadrilateralsHub }))
);
const QuadrilateralsPracticePage = lazy(() =>
  import('./features/mathematics/quadrilaterals/learn/QuadrilateralsHub').then((m) => ({ default: m.QuadrilateralsPracticePage }))
);
const QuadrilateralsAssessmentPage = lazy(() =>
  import('./features/mathematics/quadrilaterals/learn/QuadrilateralsHub').then((m) => ({ default: m.QuadrilateralsAssessmentPage }))
);
const QuadrilateralsLearnPage = lazy(() =>
  import('./features/mathematics/quadrilaterals/learn/QuadrilateralsLearn').then((m) => ({ default: m.QuadrilateralsLearnPage }))
);
const QuadrilateralWorkbenchPage = lazy(() =>
  import('./features/mathematics/quadrilaterals/QuadrilateralWorkbenchPage').then((m) => ({
    default: m.QuadrilateralWorkbenchPage,
  }))
);
const PropositionsHub = lazy(() =>
  import('./features/mathematics/propositions/learn/PropositionsHub').then((m) => ({ default: m.PropositionsHub }))
);
const PropositionsPracticePage = lazy(() =>
  import('./features/mathematics/propositions/learn/PropositionsHub').then((m) => ({ default: m.PropositionsPracticePage }))
);
const PropositionsAssessmentPage = lazy(() =>
  import('./features/mathematics/propositions/learn/PropositionsHub').then((m) => ({ default: m.PropositionsAssessmentPage }))
);
const PropositionsLearnPage = lazy(() =>
  import('./features/mathematics/propositions/learn/PropositionsLearn').then((m) => ({ default: m.PropositionsLearnPage }))
);
const PropositionsWorkbenchPage = lazy(() =>
  import('./features/mathematics/propositions/PropositionsWorkbenchPage').then((m) => ({
    default: m.PropositionsWorkbenchPage,
  }))
);
const TwoVariablesHub = lazy(() =>
  import('./features/mathematics/twoVariables/learn/TwoVariablesHub').then((m) => ({ default: m.TwoVariablesHub }))
);
const TwoVariablesPracticePage = lazy(() =>
  import('./features/mathematics/twoVariables/learn/TwoVariablesHub').then((m) => ({ default: m.TwoVariablesPracticePage }))
);
const TwoVariablesAssessmentPage = lazy(() =>
  import('./features/mathematics/twoVariables/learn/TwoVariablesHub').then((m) => ({ default: m.TwoVariablesAssessmentPage }))
);
const TwoVariablesLearnPage = lazy(() =>
  import('./features/mathematics/twoVariables/learn/TwoVariablesLearn').then((m) => ({ default: m.TwoVariablesLearnPage }))
);
const TwoVariablesWorkbenchPage = lazy(() =>
  import('./features/mathematics/twoVariables/TwoVariablesWorkbenchPage').then((m) => ({
    default: m.TwoVariablesWorkbenchPage,
  }))
);
const UnderstandingDataHub = lazy(() =>
  import('./features/mathematics/understandingData/learn/UnderstandingDataHub').then((m) => ({ default: m.UnderstandingDataHub }))
);
const UnderstandingDataPracticePage = lazy(() =>
  import('./features/mathematics/understandingData/learn/UnderstandingDataHub').then((m) => ({ default: m.UnderstandingDataPracticePage }))
);
const UnderstandingDataAssessmentPage = lazy(() =>
  import('./features/mathematics/understandingData/learn/UnderstandingDataHub').then((m) => ({ default: m.UnderstandingDataAssessmentPage }))
);
const UnderstandingDataLearnPage = lazy(() =>
  import('./features/mathematics/understandingData/learn/UnderstandingDataLearn').then((m) => ({ default: m.UnderstandingDataLearnPage }))
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

const PhysicsHub = lazy(() =>
  import('./features/physics/motion/MotionHub').then((m) => ({ default: m.PhysicsHub }))
);
const MotionHub = lazy(() =>
  import('./features/physics/motion/MotionHub').then((m) => ({ default: m.MotionHub }))
);
const MotionLab = lazy(() =>
  import('./features/physics/motion/MotionLab').then((m) => ({ default: m.MotionLab }))
);
const MotionGraphStudio = lazy(() =>
  import('./features/physics/motion/MotionGraphStudio').then((m) => ({ default: m.MotionGraphStudio }))
);
const EquationLab = lazy(() =>
  import('./features/physics/motion/MotionLabs').then((m) => ({ default: m.EquationLab }))
);
const CircularLab = lazy(() =>
  import('./features/physics/motion/MotionLabs').then((m) => ({ default: m.CircularLab }))
);
const SoundHub = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.SoundHub })));
const SoundLearnPage = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.SoundLearnPage })));
const SoundExercises = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.SoundExercises })));
const VibrationLabPage = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.VibrationLabPage })));
const WaveLabPage = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.WaveLabPage })));
const CharacteristicsLabPage = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.CharacteristicsLabPage })));
const SoundPracticePage = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.SoundPracticePage })));
const MotionAssessmentPage = lazy(() => import('./features/physics/motion/MotionAssessment').then((m) => ({ default: m.MotionAssessmentPage })));
const ForcesAssessmentPage = lazy(() => import('./features/physics/forces/ForcesAssessment').then((m) => ({ default: m.ForcesAssessmentPage })));
const WorkAssessmentPage = lazy(() => import('./features/physics/work/WorkAssessment').then((m) => ({ default: m.WorkAssessmentPage })));
const MixturesHub = lazy(() => import('./features/chemistry/mixtures/MixturesPages').then((m) => ({ default: m.MixturesHub })));
const MixturesLearnPage = lazy(() => import('./features/chemistry/mixtures/MixturesPages').then((m) => ({ default: m.MixturesLearnPage })));
const MixturesPracticePage = lazy(() => import('./features/chemistry/mixtures/MixturesPages').then((m) => ({ default: m.MixturesPracticePage })));
const MixturesAssessmentPage = lazy(() => import('./features/chemistry/mixtures/MixturesPages').then((m) => ({ default: m.MixturesAssessmentPage })));
const MixturesLabPage = lazy(() => import('./features/chemistry/mixtures/MixturesPages').then((m) => ({ default: m.MixturesLabPage })));
const AtomHub = lazy(() => import('./features/chemistry/atom/AtomPages').then((m) => ({ default: m.AtomHub })));
const AtomLearnPage = lazy(() => import('./features/chemistry/atom/AtomPages').then((m) => ({ default: m.AtomLearnPage })));
const AtomPracticePage = lazy(() => import('./features/chemistry/atom/AtomPages').then((m) => ({ default: m.AtomPracticePage })));
const AtomAssessmentPage = lazy(() => import('./features/chemistry/atom/AtomPages').then((m) => ({ default: m.AtomAssessmentPage })));
const AtomLabPage = lazy(() => import('./features/chemistry/atom/AtomPages').then((m) => ({ default: m.AtomLabPage })));
const FoundationsHub = lazy(() => import('./features/chemistry/foundations/FoundationsPages').then((m) => ({ default: m.FoundationsHub })));
const FoundationsLearnPage = lazy(() => import('./features/chemistry/foundations/FoundationsPages').then((m) => ({ default: m.FoundationsLearnPage })));
const FoundationsPracticePage = lazy(() => import('./features/chemistry/foundations/FoundationsPages').then((m) => ({ default: m.FoundationsPracticePage })));
const FoundationsAssessmentPage = lazy(() => import('./features/chemistry/foundations/FoundationsPages').then((m) => ({ default: m.FoundationsAssessmentPage })));
const FoundationsLabPage = lazy(() => import('./features/chemistry/foundations/FoundationsPages').then((m) => ({ default: m.FoundationsLabPage })));
const BiologyLab = lazy(() => import('./features/biology/BiologyLab').then((m) => ({ default: m.BiologyLab })));
const CellHub = lazy(() => import('./features/biology/cell/CellPages').then((m) => ({ default: m.CellHub })));
const CellLearnPage = lazy(() => import('./features/biology/cell/CellPages').then((m) => ({ default: m.CellLearnPage })));
const CellPracticePage = lazy(() => import('./features/biology/cell/CellPages').then((m) => ({ default: m.CellPracticePage })));
const CellAssessmentPage = lazy(() => import('./features/biology/cell/CellPages').then((m) => ({ default: m.CellAssessmentPage })));
const CellLabPage = lazy(() => import('./features/biology/cell/CellPages').then((m) => ({ default: m.CellLabPage })));
const TissuesHub = lazy(() => import('./features/biology/tissues/TissuePages').then((m) => ({ default: m.TissuesHub })));
const TissuesLearnPage = lazy(() => import('./features/biology/tissues/TissuePages').then((m) => ({ default: m.TissuesLearnPage })));
const TissuesPracticePage = lazy(() => import('./features/biology/tissues/TissuePages').then((m) => ({ default: m.TissuesPracticePage })));
const TissuesAssessmentPage = lazy(() => import('./features/biology/tissues/TissuePages').then((m) => ({ default: m.TissuesAssessmentPage })));
const TissuesLabPage = lazy(() => import('./features/biology/tissues/TissuePages').then((m) => ({ default: m.TissuesLabPage })));
const ReproductionHub = lazy(() => import('./features/biology/reproduction/ReproPages').then((m) => ({ default: m.ReproductionHub })));
const ReproductionLearnPage = lazy(() => import('./features/biology/reproduction/ReproPages').then((m) => ({ default: m.ReproductionLearnPage })));
const ReproductionPracticePage = lazy(() => import('./features/biology/reproduction/ReproPages').then((m) => ({ default: m.ReproductionPracticePage })));
const ReproductionAssessmentPage = lazy(() => import('./features/biology/reproduction/ReproPages').then((m) => ({ default: m.ReproductionAssessmentPage })));
const ReproductionLabPage = lazy(() => import('./features/biology/reproduction/ReproPages').then((m) => ({ default: m.ReproductionLabPage })));
const DiversityHub = lazy(() => import('./features/biology/diversity/DiversityPages').then((m) => ({ default: m.DiversityHub })));
const DiversityLearnPage = lazy(() => import('./features/biology/diversity/DiversityPages').then((m) => ({ default: m.DiversityLearnPage })));
const DiversityPracticePage = lazy(() => import('./features/biology/diversity/DiversityPages').then((m) => ({ default: m.DiversityPracticePage })));
const DiversityAssessmentPage = lazy(() => import('./features/biology/diversity/DiversityPages').then((m) => ({ default: m.DiversityAssessmentPage })));
const DiversityLabPage = lazy(() => import('./features/biology/diversity/DiversityPages').then((m) => ({ default: m.DiversityLabPage })));
const SoundAssessmentPage = lazy(() => import('./features/physics/sound/SoundPages').then((m) => ({ default: m.SoundAssessmentPage })));
const MotionPractice = lazy(() =>
  import('./features/physics/motion/MotionPractice').then((m) => ({ default: m.MotionPractice }))
);
const DerivationLab = lazy(() =>
  import('./features/physics/motion/MotionLabs').then((m) => ({ default: m.DerivationPage }))
);
const ForcesHub = lazy(() =>
  import('./features/physics/forces/ForcesPages').then((m) => ({ default: m.ForcesHub }))
);
const ForcesLearnPage = lazy(() =>
  import('./features/physics/forces/ForcesPages').then((m) => ({ default: m.ForcesLearnPage }))
);
const ForcesPractice = lazy(() =>
  import('./features/physics/forces/ForcesPractice').then((m) => ({ default: m.ForcesPractice }))
);
const ForcesExercises = lazy(() =>
  import('./features/physics/forces/ForcesPages').then((m) => ({ default: m.ForcesExercises }))
);
const ForcesDerivation = lazy(() =>
  import('./features/physics/forces/ForcesLab').then((m) => ({ default: m.ForcesDerivation }))
);
const ForcesInteractions = lazy(() =>
  import('./features/physics/forces/ForcesInteractions').then((m) => ({ default: m.ForcesInteractions }))
);
const ForcesLab = lazy(() =>
  import('./features/physics/forces/ForcesLab').then((m) => ({ default: m.ForcesLab }))
);
const WorkHub = lazy(() =>
  import('./features/physics/work/WorkPages').then((m) => ({ default: m.WorkHub }))
);
const WorkLearnPage = lazy(() =>
  import('./features/physics/work/WorkPages').then((m) => ({ default: m.WorkLearnPage }))
);
const WorkExercises = lazy(() =>
  import('./features/physics/work/WorkPages').then((m) => ({ default: m.WorkExercises }))
);
const KineticLab = lazy(() =>
  import('./features/physics/work/KineticLab').then((m) => ({ default: m.KineticLab }))
);
const EnergyLab = lazy(() =>
  import('./features/physics/work/EnergyLab').then((m) => ({ default: m.EnergyLab }))
);
const MachinesLab = lazy(() =>
  import('./features/physics/work/MachinesLab').then((m) => ({ default: m.MachinesLab }))
);
const PowerLab = lazy(() =>
  import('./features/physics/work/MachinesLab').then((m) => ({ default: m.PowerLab }))
);
const WorkPractice = lazy(() =>
  import('./features/physics/work/WorkPractice').then((m) => ({ default: m.WorkPractice }))
);
const WorkDerivations = lazy(() =>
  import('./features/physics/work/KineticLab').then((m) => ({ default: m.WorkDerivations }))
);
const WorkLab = lazy(() =>
  import('./features/physics/work/WorkLab').then((m) => ({ default: m.WorkLab }))
);
const MotionLearnPage = lazy(() =>
  import('./features/physics/motion/MotionLearn').then((m) => ({ default: m.MotionLearnPage }))
);
const MotionExercises = lazy(() =>
  import('./features/physics/motion/MotionExercises').then((m) => ({ default: m.MotionExercises }))
);
const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 space-y-4" role="status" aria-live="polite">
    <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
    <div className="text-sm font-mono text-slate-400 animate-pulse tracking-wide">
      Getting your lab ready…
    </div>
  </div>
);

/** Old Electricity links (/physics/electricity...) keep working: they move to the Robotics section with their query string. */
const MovedToRobotics: React.FC<{ to: string }> = ({ to }) => {
  const { search } = useLocation();
  return <Navigate to={to + search} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ExperienceFrame>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Sign-in is the only public page; every other route needs a session. */}
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
          {/* Route 1: Subject Explorer */}
          <Route path="/" element={<SubjectExplorer />} />

          {/* Robotics section: Electricity and the DC circuit workbench (outside the Class 9 syllabus) */}
          <Route path="/robotics" element={<RoboticsHub />} />
          <Route path="/robotics/electricity" element={<ElectricityLab />} />
          <Route path="/robotics/electricity/workbench" element={<WorkbenchPage />} />
          {/* Former Physics locations of Electricity redirect to Robotics */}
          <Route path="/physics/electricity" element={<MovedToRobotics to="/robotics/electricity" />} />
          <Route path="/physics/electricity/workbench" element={<MovedToRobotics to="/robotics/electricity/workbench" />} />

          {/* Physics hub and Class 9 Chapter 4: Describing Motion (PHY-1A). Electricity routes above are untouched. */}
          <Route path="/physics" element={<PhysicsHub />} />
          <Route path="/physics/forces" element={<ForcesHub />} />
          <Route path="/physics/forces/lab" element={<ForcesLab />} />
          <Route path="/physics/forces/derivations" element={<ForcesDerivation />} />
          <Route path="/physics/forces/interactions" element={<ForcesInteractions />} />
          <Route path="/physics/forces/exercises" element={<ForcesExercises />} />
          <Route path="/physics/forces/practice" element={<ForcesPractice />} />
          <Route path="/physics/sound" element={<SoundHub />} />
          <Route path="/physics/sound/vibration" element={<VibrationLabPage />} />
          <Route path="/physics/sound/wave" element={<WaveLabPage />} />
          <Route path="/physics/sound/characteristics" element={<CharacteristicsLabPage />} />
          <Route path="/physics/sound/practice" element={<SoundPracticePage />} />
          <Route path="/physics/sound/assessment" element={<SoundAssessmentPage />} />
          <Route path="/physics/motion/assessment" element={<MotionAssessmentPage />} />
          <Route path="/physics/forces/assessment" element={<ForcesAssessmentPage />} />
          <Route path="/physics/work/assessment" element={<WorkAssessmentPage />} />
          <Route path="/physics/sound/exercises" element={<SoundExercises />} />
          <Route path="/physics/sound/learn/:lessonId" element={<SoundLearnPage />} />
          <Route path="/physics/forces/learn/:lessonId" element={<ForcesLearnPage />} />
          <Route path="/physics/work" element={<WorkHub />} />
          <Route path="/physics/work/lab" element={<WorkLab />} />
          <Route path="/physics/work/kinetic" element={<KineticLab />} />
          <Route path="/physics/work/energy" element={<EnergyLab />} />
          <Route path="/physics/work/machines" element={<MachinesLab />} />
          <Route path="/physics/work/power" element={<PowerLab />} />
          <Route path="/physics/work/practice" element={<WorkPractice />} />
          <Route path="/physics/work/derivations" element={<WorkDerivations />} />
          <Route path="/physics/work/exercises" element={<WorkExercises />} />
          <Route path="/physics/work/learn/:lessonId" element={<WorkLearnPage />} />
          <Route path="/physics/motion" element={<MotionHub />} />
          <Route path="/physics/motion/lab" element={<MotionLab />} />
          <Route path="/physics/motion/graphs" element={<MotionGraphStudio />} />
          <Route path="/physics/motion/equations" element={<EquationLab />} />
          <Route path="/physics/motion/circular" element={<CircularLab />} />
          <Route path="/physics/motion/practice" element={<MotionPractice />} />
          <Route path="/physics/motion/derivations" element={<DerivationLab />} />
          <Route path="/physics/motion/exercises" element={<MotionExercises />} />
          <Route path="/physics/motion/learn/:lessonId" element={<MotionLearnPage />} />

          {/* Route 4: Mathematics Laboratory Landing Page */}
          <Route path="/mathematics" element={<MathematicsLab />} />

          {/* Route 5: Interactive Mathematics Workbench (Coordinate Geometry) */}
          <Route path="/mathematics/workbench" element={<MathWorkbenchPage />} />
          <Route path="/mathematics/coordinate-geometry" element={<CoordinateGeometryLab />} />
          <Route path="/mathematics/coordinate-geometry/learn/:lessonId" element={<CoordinateGeometryLearnPage />} />
          <Route path="/mathematics/coordinate-geometry/practice" element={<CoordinateGeometryPracticePage />} />
          <Route path="/mathematics/coordinate-geometry/assessment" element={<CoordinateGeometryAssessmentPage />} />

          {/* Route 6: Circles Module Landing Page */}
          <Route path="/mathematics/circles" element={<CirclesHub />} />
          <Route path="/mathematics/circles/practice" element={<CirclesPracticePage />} />
          <Route path="/mathematics/circles/assessment" element={<CirclesAssessmentPage />} />

          {/* Route 7: Interactive Circles Workbench */}
          <Route path="/mathematics/circles/workbench" element={<CircleWorkbenchPage />} />
          <Route path="/mathematics/circles/learn/:lessonId" element={<CirclesLearnPage />} />

          {/* Route 8: Quadrilaterals Module Landing Page */}
          <Route path="/mathematics/quadrilaterals" element={<QuadrilateralsHub />} />
          <Route path="/mathematics/quadrilaterals/practice" element={<QuadrilateralsPracticePage />} />
          <Route path="/mathematics/quadrilaterals/assessment" element={<QuadrilateralsAssessmentPage />} />

          {/* Route 9: Interactive Quadrilaterals Workbench */}
          <Route path="/mathematics/quadrilaterals/workbench" element={<QuadrilateralWorkbenchPage />} />
          <Route path="/mathematics/quadrilaterals/learn/:lessonId" element={<QuadrilateralsLearnPage />} />

          {/* Route 10: Propositions & Converses Module Landing Page */}
          <Route path="/mathematics/propositions" element={<PropositionsHub />} />
          <Route path="/mathematics/propositions/practice" element={<PropositionsPracticePage />} />
          <Route path="/mathematics/propositions/assessment" element={<PropositionsAssessmentPage />} />

          {/* Route 11: Interactive Propositions Workbench */}
          <Route path="/mathematics/propositions/workbench" element={<PropositionsWorkbenchPage />} />
          <Route path="/mathematics/propositions/learn/:lessonId" element={<PropositionsLearnPage />} />

          {/* Route 11b: Two Variables, One Line landing page and workbench */}
          <Route path="/mathematics/two-variables" element={<TwoVariablesHub />} />
          <Route path="/mathematics/two-variables/practice" element={<TwoVariablesPracticePage />} />
          <Route path="/mathematics/two-variables/assessment" element={<TwoVariablesAssessmentPage />} />
          <Route path="/mathematics/two-variables/workbench" element={<TwoVariablesWorkbenchPage />} />
          <Route path="/mathematics/two-variables/learn/:lessonId" element={<TwoVariablesLearnPage />} />

          {/* Route 11c: Understanding Data landing page and workbench */}
          <Route path="/mathematics/understanding-data" element={<UnderstandingDataHub />} />
          <Route path="/mathematics/understanding-data/practice" element={<UnderstandingDataPracticePage />} />
          <Route path="/mathematics/understanding-data/assessment" element={<UnderstandingDataAssessmentPage />} />
          <Route path="/mathematics/understanding-data/workbench" element={<UnderstandingDataWorkbenchPage />} />
          <Route path="/mathematics/understanding-data/learn/:lessonId" element={<UnderstandingDataLearnPage />} />

          {/* Route 12: Chemistry Laboratory Landing Page */}
          <Route path="/chemistry" element={<ChemistryLab />} />

          {/* Route 13: Interactive Chemistry States of Matter Workbench */}
          <Route path="/chemistry/states-of-matter" element={<StatesOfMatterWorkbench />} />
          <Route path="/chemistry/mixtures" element={<MixturesHub />} />
          <Route path="/chemistry/mixtures/learn/:lessonId" element={<MixturesLearnPage />} />
          <Route path="/chemistry/mixtures/practice" element={<MixturesPracticePage />} />
          <Route path="/chemistry/mixtures/assessment" element={<MixturesAssessmentPage />} />
          <Route path="/chemistry/mixtures/lab" element={<MixturesLabPage />} />
          <Route path="/chemistry/atom" element={<AtomHub />} />
          <Route path="/chemistry/atom/learn/:lessonId" element={<AtomLearnPage />} />
          <Route path="/chemistry/atom/practice" element={<AtomPracticePage />} />
          <Route path="/chemistry/atom/assessment" element={<AtomAssessmentPage />} />
          <Route path="/chemistry/atom/lab" element={<AtomLabPage />} />
          <Route path="/chemistry/atomic-foundations" element={<FoundationsHub />} />
          <Route path="/chemistry/atomic-foundations/learn/:lessonId" element={<FoundationsLearnPage />} />
          <Route path="/chemistry/atomic-foundations/practice" element={<FoundationsPracticePage />} />
          <Route path="/chemistry/atomic-foundations/assessment" element={<FoundationsAssessmentPage />} />
          <Route path="/chemistry/atomic-foundations/lab" element={<FoundationsLabPage />} />

          {/* Biology: Unit I World of Living */}
          <Route path="/biology" element={<BiologyLab />} />
          <Route path="/biology/cell" element={<CellHub />} />
          <Route path="/biology/cell/learn/:lessonId" element={<CellLearnPage />} />
          <Route path="/biology/cell/practice" element={<CellPracticePage />} />
          <Route path="/biology/cell/assessment" element={<CellAssessmentPage />} />
          <Route path="/biology/cell/lab" element={<CellLabPage />} />
          <Route path="/biology/tissues" element={<TissuesHub />} />
          <Route path="/biology/tissues/learn/:lessonId" element={<TissuesLearnPage />} />
          <Route path="/biology/tissues/practice" element={<TissuesPracticePage />} />
          <Route path="/biology/tissues/assessment" element={<TissuesAssessmentPage />} />
          <Route path="/biology/tissues/lab" element={<TissuesLabPage />} />
          <Route path="/biology/reproduction" element={<ReproductionHub />} />
          <Route path="/biology/reproduction/learn/:lessonId" element={<ReproductionLearnPage />} />
          <Route path="/biology/reproduction/practice" element={<ReproductionPracticePage />} />
          <Route path="/biology/reproduction/assessment" element={<ReproductionAssessmentPage />} />
          <Route path="/biology/reproduction/lab" element={<ReproductionLabPage />} />
          <Route path="/biology/diversity" element={<DiversityHub />} />
          <Route path="/biology/diversity/learn/:lessonId" element={<DiversityLearnPage />} />
          <Route path="/biology/diversity/practice" element={<DiversityPracticePage />} />
          <Route path="/biology/diversity/assessment" element={<DiversityAssessmentPage />} />
          <Route path="/biology/diversity/lab" element={<DiversityLabPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
      </ExperienceFrame>
    </BrowserRouter>
  );
};

export default App;
