/**
 * Authoritative Subject Registry for LabVerse
 * NCERT Classes 9–10 Digital STEM Laboratory Platform
 *
 * Single Source of Truth for:
 * - Subject availability (Active vs In Development)
 * - Navigation links and active route matching
 * - Homepage SubjectExplorer cards and topic previews
 * - Global header navigation tabs
 */

export type SubjectId = 'physics' | 'chemistry' | 'mathematics' | 'biology' | 'robotics';

export type SubjectStatus = 'ready' | 'in_development';

export interface SubjectFeature {
  title: string;
  description: string;
  icon: string;
}

export interface SubjectDefinition {
  id: SubjectId;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: SubjectStatus;
  route?: string;
  accentColor: string;
  badgeText: string;
  buttonText: string;
  topicsCount: number;
  experimentsCount: number;
  features?: SubjectFeature[];
}

export const LABVERSE_SUBJECTS: SubjectDefinition[] = [
  {
    id: 'physics',
    name: 'Physics',
    category: 'Electricity & DC Circuit Simulation',
    description:
      'Explore fundamental DC electrical circuits, Kirchhoff voltage/current loops, solderless breadboard wiring, and interactive component state analysis with physical solvers.',
    icon: 'electric_bolt',
    status: 'ready',
    route: '/physics/electricity',
    accentColor: '#38bdf8',
    badgeText: 'Active Laboratory',
    buttonText: 'Enter Electricity Lab',
    topicsCount: 1,
    experimentsCount: 6,
    features: [
      {
        title: 'Solderless Breadboarding',
        description: 'Standard 400-tie-point terminal pitch (2.54mm), dual power rails & central trough.',
        icon: 'schema',
      },
      {
        title: 'DC Loop Simulation',
        description: 'Real scientific DC solver with live current, voltage drops, and interactive component telemetry.',
        icon: 'bolt',
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'States of Matter & Thermodynamic Behavior',
    description:
      'Investigate molecular arrangements, kinetic particle motion, solids, liquids, and gases, dynamic heating curves, phase transitions, and thermodynamic behavior in interactive simulation chambers.',
    icon: 'science',
    status: 'ready',
    route: '/chemistry',
    accentColor: '#10b981',
    badgeText: 'Active Laboratory',
    buttonText: 'Enter Chemistry Lab',
    topicsCount: 1,
    experimentsCount: 6,
    features: [
      {
        title: 'Particle Motion & Phases',
        description: 'Real-time 2D molecular kinematics modeling solid lattice vibration, liquid flow, and gas diffusion.',
        icon: 'bubble_chart',
      },
      {
        title: 'Heating & Phase Transitions',
        description: 'Interactive thermal burner & piston to observe melting, boiling, latent heat plateaus, and pressure response.',
        icon: 'thermostat',
      },
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    category: 'Coordinate Geometry, Circles, Quadrilaterals, Propositions, Linear Equations & Data',
    description:
      'Six independent Class 9 mathematics laboratories: dynamic Cartesian coordinate plane, Euclidean circle theorems, quadrilateral classifications, formal mathematical reasoning, linear equations in two variables, and weighted averages, mixtures and stacked data charts.',
    icon: 'calculate',
    status: 'ready',
    route: '/mathematics',
    accentColor: '#a855f7',
    badgeText: 'Active Laboratory',
    buttonText: 'Explore Mathematics',
    topicsCount: 6,
    experimentsCount: 64,
    features: [
      {
        title: 'Coordinate Geometry',
        description: 'Dynamic Cartesian coordinate system, Euclidean distance formula, and Pythagorean proofs.',
        icon: 'grid_4x4',
      },
      {
        title: 'Circles Laboratory',
        description: 'Chord properties, subtended angles, cyclic quadrilaterals, tangents, and progressive guided learning.',
        icon: 'radio_button_unchecked',
      },
      {
        title: 'Quadrilaterals Laboratory',
        description: 'Convex & concave interior angles, parallelogram invariants, Midpoint theorem, and Varignon tiling.',
        icon: 'crop_square',
      },
      {
        title: 'Propositions & Converses',
        description: 'Logic of hypotheses & conclusions, converse truth independence, counterexample discovery, and deductive proofs.',
        icon: 'psychology',
      },
      {
        title: 'Two Variables, One Line',
        description: 'Interactive equation graphs, two-line systems, parallel and coincident lines, substitution and elimination.',
        icon: 'show_chart',
      },
      {
        title: 'Understanding Data',
        description: 'Weighted averages, mixtures and concentrations, stacked and 100% stacked bar charts, and spotting misleading conclusions.',
        icon: 'stacked_bar_chart',
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'Microscopy, Genetics & Plant Physiology',
    description:
      'Planned virtual compound light microscopy, Mendelian punnett square genetics, cellular respiration, and plant transpiration chambers.',
    icon: 'biotech',
    status: 'in_development',
    accentColor: '#06b6d4',
    badgeText: 'Coming Soon',
    buttonText: 'Coming Soon',
    topicsCount: 5,
    experimentsCount: 8,
  },
  {
    id: 'robotics',
    name: 'Robotics',
    category: 'Microcontrollers, Sensors & Actuator Logic',
    description:
      'Planned virtual microcontroller development boards, ultrasonic distance sensing, motor H-bridges, and control loop feedback logic.',
    icon: 'precision_manufacturing',
    status: 'in_development',
    accentColor: '#f59e0b',
    badgeText: 'Coming Soon',
    buttonText: 'Coming Soon',
    topicsCount: 4,
    experimentsCount: 6,
  },
];

export function getAllSubjects(): SubjectDefinition[] {
  return LABVERSE_SUBJECTS;
}

export function getAvailableSubjects(): SubjectDefinition[] {
  return LABVERSE_SUBJECTS.filter((s) => s.status === 'ready');
}

export function getInDevelopmentSubjects(): SubjectDefinition[] {
  return LABVERSE_SUBJECTS.filter((s) => s.status === 'in_development');
}

export function getSubjectById(id: SubjectId): SubjectDefinition | undefined {
  return LABVERSE_SUBJECTS.find((s) => s.id === id);
}

export function isSubjectActive(id: SubjectId): boolean {
  const subj = getSubjectById(id);
  return subj ? subj.status === 'ready' : false;
}
