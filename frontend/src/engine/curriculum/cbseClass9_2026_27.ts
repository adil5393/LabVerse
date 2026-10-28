/**
 * CBSE Class 9, academic year 2026-27.
 *
 * Checked on 2026-10-28 against the official CBSE curriculum documents and the NCERT textbook tables of contents listed in
 * `sources`. Science chapter numbers follow NCERT *Exploration* (integrated Science); each chapter is shown under one student-facing
 * subject, with `connects` for the others. The `implementation` blocks are LabVerse's own honest status and are verified against
 * the real content by `__tests__/registry.test.ts`.
 */

import type { Curriculum, CurriculumChapter } from './types';

const EXPLORATION = 'ncert-exploration-9' as const;
const GM1 = 'ncert-ganita-manjari-9-1' as const;
const GM2 = 'ncert-ganita-manjari-9-2' as const;

const notStarted = (plannedLessons: number, note?: string): CurriculumChapter['implementation'] => ({
  status: 'not-started', lessons: 0, plannedLessons, labs: [], practice: false, assessment: false, narration: false, note,
});

const SCIENCE: CurriculumChapter[] = [
  {
    id: 'exploration', subject: 'integrated-science', textbook: EXPLORATION, number: 1,
    title: 'Exploration: Entering the World of Secondary Science', source: 'textbook-unassessed',
    connects: ['physics', 'chemistry', 'biology'],
    scope: { lessonPrefixes: ['ex-'], prereqPrefixes: ['exp-'] },
    implementation: notStarted(4, 'Scientific inquiry, language of science and measurement; not in the CBSE examined units.'),
  },
  {
    id: 'cell', subject: 'biology', textbook: EXPLORATION, number: 2, title: 'Cell: The Building Block of Life',
    boardTitle: 'Cell', boardUnit: 'I World of Living', boardUnitMarks: 27, source: 'textbook', connects: ['chemistry'],
    scope: { lessonPrefixes: ['bc-'], prereqPrefixes: ['bcp-'] },
    route: '/biology/cell',
    implementation: {
      status: 'partial', lessons: 6, plannedLessons: 6,
      labs: ['/biology/cell/lab'],
      practice: true, assessment: true, narration: true, note: 'All sections are taught in six lessons. Several NCERT end-of-chapter exercises are adapted in practice, but step-by-step solutions to every exercise are not built yet.',
    },
  },
  {
    id: 'tissues', subject: 'biology', textbook: EXPLORATION, number: 3, title: 'Tissues in Action',
    boardTitle: 'Tissues', boardUnit: 'I World of Living', boardUnitMarks: 27, source: 'textbook',
    scope: { lessonPrefixes: ['bt-'], prereqPrefixes: ['btp-'] },
    route: '/biology/tissues',
    implementation: {
      status: 'partial', lessons: 6, plannedLessons: 6,
      labs: ['/biology/tissues/lab'],
      practice: true, assessment: true, narration: true, note: 'All sections are taught in six lessons. Several NCERT end-of-chapter exercises are adapted in practice, but step-by-step solutions to every exercise are not built yet.',
    },
  },
  {
    id: 'motion', subject: 'physics', textbook: EXPLORATION, number: 4, title: 'Describing Motion Around Us',
    boardTitle: 'Motion', boardUnit: 'III Motion, Force, Work and Sound', boardUnitMarks: 23, source: 'textbook', connects: ['mathematics'],
    route: '/physics/motion',
    scope: { lessonPrefixes: ['pm-'], prereqPrefixes: ['pmp-'] },
    implementation: {
      status: 'complete', lessons: 10, plannedLessons: 10,
      labs: ['/physics/motion/lab', '/physics/motion/graphs', '/physics/motion/equations', '/physics/motion/circular', '/physics/motion/derivations'],
      practice: true, assessment: true, narration: true, note: 'The closing "Journey Beyond" activities are not built.',
    },
  },
  {
    id: 'mixtures', subject: 'chemistry', textbook: EXPLORATION, number: 5, title: 'Exploring Mixtures and their Separation',
    boardUnit: 'II Matter - Its Nature and Behaviour', boardUnitMarks: 25, source: 'textbook',
    route: '/chemistry/mixtures',
    scope: { lessonPrefixes: ['cm-'], prereqPrefixes: ['cmp-'] },
    implementation: {
      status: 'partial', lessons: 9, plannedLessons: 9,
      labs: ['/chemistry/mixtures/lab'],
      practice: true, assessment: true, narration: true, note: 'Step-by-step solutions to the NCERT end-of-chapter exercises are not built yet.',
    },
  },
  {
    id: 'forces', subject: 'physics', textbook: EXPLORATION, number: 6, title: 'How Forces Affect Motion',
    boardTitle: 'Force and Laws of Motion', boardUnit: 'III Motion, Force, Work and Sound', boardUnitMarks: 23, source: 'textbook',
    route: '/physics/forces',
    scope: { lessonPrefixes: ['pf-'], prereqPrefixes: ['pfp-'] },
    implementation: {
      status: 'complete', lessons: 10, plannedLessons: 10,
      labs: ['/physics/forces/lab', '/physics/forces/interactions', '/physics/forces/derivations'],
      practice: true, assessment: true, narration: true, note: 'The closing "Journey Beyond" activities are not built.',
    },
  },
  {
    id: 'work', subject: 'physics', textbook: EXPLORATION, number: 7, title: 'Work, Energy, and Simple Machines',
    boardTitle: 'Work, Energy and Simple Machines', boardUnit: 'III Motion, Force, Work and Sound', boardUnitMarks: 23, source: 'textbook',
    route: '/physics/work',
    scope: { lessonPrefixes: ['pw-'], prereqPrefixes: ['pwp-'] },
    implementation: {
      status: 'complete', lessons: 10, plannedLessons: 10,
      labs: ['/physics/work/lab', '/physics/work/kinetic', '/physics/work/energy', '/physics/work/machines', '/physics/work/power', '/physics/work/derivations'],
      practice: true, assessment: true, narration: true, note: 'The closing "Journey Beyond" activities are not built.',
    },
  },
  {
    id: 'atom', subject: 'chemistry', textbook: EXPLORATION, number: 8, title: 'Journey Inside the Atom',
    boardTitle: 'Structure of an Atom', boardUnit: 'II Matter - Its Nature and Behaviour', boardUnitMarks: 25, source: 'textbook', connects: ['physics'],
    route: '/chemistry/atom',
    scope: { lessonPrefixes: ['ca-'], prereqPrefixes: ['cap-'] },
    implementation: {
      status: 'partial', lessons: 8, plannedLessons: 8,
      labs: ['/chemistry/atom/lab'],
      practice: true, assessment: true, narration: true, note: 'Step-by-step solutions to the NCERT end-of-chapter exercises are not built yet.',
    },
  },
  {
    id: 'atomic-foundations', subject: 'chemistry', textbook: EXPLORATION, number: 9, title: 'Atomic Foundations of Matter',
    boardTitle: 'Atoms and Molecules', boardUnit: 'II Matter - Its Nature and Behaviour', boardUnitMarks: 25, source: 'textbook',
    route: '/chemistry/atomic-foundations',
    scope: { lessonPrefixes: ['cf-'], prereqPrefixes: ['cfp-'] },
    implementation: {
      status: 'partial', lessons: 8, plannedLessons: 8,
      labs: ['/chemistry/atomic-foundations/lab'],
      practice: true, assessment: true, narration: true, note: 'Step-by-step solutions to the NCERT end-of-chapter exercises are not built yet.',
    },
  },
  {
    id: 'sound', subject: 'physics', textbook: EXPLORATION, number: 10, title: 'Sound Waves: Characteristics and Applications',
    boardTitle: 'Sound', boardUnit: 'III Motion, Force, Work and Sound', boardUnitMarks: 23, source: 'textbook', connects: ['biology'],
    route: '/physics/sound',
    scope: { lessonPrefixes: ['ps-'], prereqPrefixes: ['psp-'] },
    implementation: {
      status: 'complete', lessons: 12, plannedLessons: 12, labs: ['/physics/sound/vibration', '/physics/sound/wave', '/physics/sound/characteristics'],
      practice: true, assessment: true, narration: true,
      note: 'All twelve lessons, three laboratories, all 15 exercises and 13 Pause and Ponder items, practice and assessment; pending teacher review.',
    },
  },
  {
    id: 'reproduction', subject: 'biology', textbook: EXPLORATION, number: 11, title: 'Reproduction: How Life Continues',
    boardTitle: 'Reproduction', boardUnit: 'I World of Living', boardUnitMarks: 27, source: 'textbook',
    scope: { lessonPrefixes: ['br-'], prereqPrefixes: ['brp-'] },
    route: '/biology/reproduction',
    implementation: {
      status: 'partial', lessons: 6, plannedLessons: 6,
      labs: ['/biology/reproduction/lab'],
      practice: true, assessment: true, narration: true, note: 'All sections are taught in six lessons. Several NCERT end-of-chapter exercises are adapted in practice, but step-by-step solutions to every exercise are not built yet.',
    },
  },
  {
    id: 'diversity', subject: 'biology', textbook: EXPLORATION, number: 12, title: 'Patterns in Life: Diversity and Classification',
    boardTitle: 'Diversity', boardUnit: 'I World of Living', boardUnitMarks: 27, source: 'textbook',
    scope: { lessonPrefixes: ['bd-'], prereqPrefixes: ['bdp-'] },
    route: '/biology/diversity',
    implementation: {
      status: 'partial', lessons: 6, plannedLessons: 6,
      labs: ['/biology/diversity/lab'],
      practice: true, assessment: true, narration: true, note: 'All sections are taught in six lessons. Several NCERT end-of-chapter exercises are adapted in practice, but step-by-step solutions to every exercise are not built yet.',
    },
  },
  {
    id: 'earth-system', subject: 'integrated-science', textbook: EXPLORATION, number: 13, title: 'Earth as a System: Energy, Matter, and Life',
    boardTitle: 'Earth as a System: Energy, Matter & Life', boardUnit: 'IV Earth as a System', boardUnitMarks: 5, source: 'textbook',
    connects: ['physics', 'chemistry', 'biology'],
    scope: { lessonPrefixes: ['es-'], prereqPrefixes: ['esp-'] },
    implementation: notStarted(6),
  },
];

const MATHEMATICS: CurriculumChapter[] = [
  {
    id: 'coordinate-geometry', subject: 'mathematics', textbook: GM1, number: 1, title: 'Orienting Yourself: The Use of Coordinates',
    boardTitle: 'Coordinate Geometry', boardUnit: 'III Coordinate Geometry', boardUnitMarks: 4, source: 'textbook',
    route: '/mathematics/coordinate-geometry',
    scope: { lessonPrefixes: ['cg-'], prereqPrefixes: ['pre-'] },
    implementation: {
      status: 'complete', lessons: 7, plannedLessons: 7, labs: ['/mathematics/workbench'], practice: true, assessment: true, narration: true,
      note: 'Lessons, practice (per lesson), laboratory, narration and assessment exist; pending teacher review.',
    },
  },
  {
    id: 'linear-polynomials', subject: 'mathematics', textbook: GM1, number: 2, title: 'Introduction to Linear Polynomials',
    boardTitle: 'Introduction to Polynomials', boardUnit: 'II Algebra', boardUnitMarks: 20, source: 'textbook',
    scope: { lessonPrefixes: ['lp-'], prereqPrefixes: ['lpp-'] }, implementation: notStarted(7),
  },
  {
    id: 'world-of-numbers', subject: 'mathematics', textbook: GM1, number: 3, title: 'The World of Numbers',
    boardTitle: 'Number System', boardUnit: 'I Number System', boardUnitMarks: 7, source: 'textbook',
    scope: { lessonPrefixes: ['wn-'], prereqPrefixes: ['wnp-'] }, implementation: notStarted(8),
  },
  {
    id: 'algebraic-identities', subject: 'mathematics', textbook: GM1, number: 4, title: 'Exploring Algebraic Identities',
    boardUnit: 'II Algebra', boardUnitMarks: 20, source: 'textbook',
    scope: { lessonPrefixes: ['ai-'], prereqPrefixes: ['aip-'] }, implementation: notStarted(7),
  },
  {
    id: 'circles', subject: 'mathematics', textbook: GM1, number: 5, title: 'I’m Up and Down, and Round and Round',
    boardTitle: 'Circles', boardUnit: 'IV Geometry', boardUnitMarks: 25, source: 'textbook',
    route: '/mathematics/circles',
    scope: { lessonPrefixes: ['circles-'], prereqPrefixes: ['cpre-'] },
    implementation: {
      status: 'partial', lessons: 12, plannedLessons: 12, labs: ['/mathematics/circles/workbench'], practice: true, assessment: true, narration: true,
      note: 'Pilot migration to the unified framework (11 lessons + 1 optional Beyond Class 9 extension). Older path kept behind a compatibility switch until reviewed.',
    },
    reviewFlags: ['The older path teaches tangents (not in the 2026 Chapter 5); kept only as an optional Beyond Class 9 extension.'],
  },
  {
    id: 'perimeter-area', subject: 'mathematics', textbook: GM1, number: 6, title: 'Measuring Space: Perimeter and Area',
    boardTitle: 'Area and Perimeter', boardUnit: 'V Mensuration', boardUnitMarks: 14, source: 'textbook',
    scope: { lessonPrefixes: ['pa-'], prereqPrefixes: ['pap-'] }, implementation: notStarted(8),
  },
  {
    id: 'probability', subject: 'mathematics', textbook: GM1, number: 7, title: 'The Mathematics of Maybe: Introduction to Probability',
    boardTitle: 'Introduction to Probability', boardUnit: 'VI Statistics and Probability', boardUnitMarks: 10, source: 'textbook',
    scope: { lessonPrefixes: ['pr-'], prereqPrefixes: ['prp-'] }, implementation: notStarted(6),
  },
  {
    id: 'sequences', subject: 'mathematics', textbook: GM1, number: 8, title: 'Predicting What Comes Next: Exploring Sequences and Progressions',
    boardTitle: 'Sequences and Progressions', boardUnit: 'II Algebra', boardUnitMarks: 20, source: 'textbook',
    scope: { lessonPrefixes: ['sq-'], prereqPrefixes: ['sqp-'] }, implementation: notStarted(7),
  },
  {
    id: 'propositions', subject: 'mathematics', textbook: GM2, number: 9, title: 'Propositions and their Converses',
    boardUnit: 'IV Geometry', boardUnitMarks: 25, source: 'textbook',
    route: '/mathematics/propositions',
    scope: { lessonPrefixes: ['prop-'], prereqPrefixes: ['pp-'] },
    implementation: {
      status: 'partial', lessons: 11, plannedLessons: 11, labs: ['/mathematics/propositions/workbench'], practice: true, assessment: true, narration: true,
      note: 'Migrated to the unified framework (older path behind a compatibility switch until reviewed).',
    },
    reviewFlags: ['The CBSE course structure places propositions and converses inside "Triangles: Congruence Theorems".'],
  },
  {
    id: 'understanding-data', subject: 'mathematics', textbook: GM2, number: 10, title: 'How Quantities Combine: Understanding Data',
    boardTitle: 'Statistics', boardUnit: 'VI Statistics and Probability', boardUnitMarks: 10, source: 'textbook',
    route: '/mathematics/understanding-data',
    scope: { lessonPrefixes: ['ud-'], prereqPrefixes: ['up-'] },
    implementation: {
      status: 'partial', lessons: 6, plannedLessons: 6, labs: ['/mathematics/understanding-data/workbench'], practice: true, assessment: true, narration: true,
      note: 'Migrated to the unified framework (older path behind a compatibility switch until reviewed).',
    },
    reviewFlags: ['The CBSE Statistics outcomes also mention mean, median and mode for decision-making; the NCERT chapter does not teach them.'],
  },
  {
    id: 'algorithms', subject: 'mathematics', textbook: GM2, number: 11, title: 'The World of Algorithms',
    source: 'textbook',
    scope: { lessonPrefixes: ['al-'], prereqPrefixes: ['alp-'] }, implementation: notStarted(6),
    reviewFlags: ['Not a named chapter in the CBSE course structure; computational thinking is listed as a strand of every unit.'],
  },
  {
    id: 'quadrilaterals', subject: 'mathematics', textbook: GM2, number: 12, title: 'Quadrilaterals',
    boardTitle: '4-gons (Quadrilaterals)', boardUnit: 'IV Geometry', boardUnitMarks: 25, source: 'textbook',
    route: '/mathematics/quadrilaterals',
    scope: { lessonPrefixes: ['quad-'], prereqPrefixes: ['qp-'] },
    implementation: {
      status: 'partial', lessons: 8, plannedLessons: 8, labs: ['/mathematics/quadrilaterals/workbench'], practice: true, assessment: true, narration: true,
      note: 'Migrated to the unified framework (older path behind a compatibility switch until reviewed).',
    },
  },
  {
    id: 'two-variables', subject: 'mathematics', textbook: GM2, number: 13, title: 'Two Variables, One Line',
    boardTitle: 'Linear Equations in Two Variables', boardUnit: 'II Algebra', boardUnitMarks: 20, source: 'textbook',
    route: '/mathematics/two-variables',
    scope: { lessonPrefixes: ['tv-'], prereqPrefixes: ['tp-'] },
    implementation: {
      status: 'partial', lessons: 11, plannedLessons: 11, labs: ['/mathematics/two-variables/workbench'], practice: true, assessment: true, narration: true,
      note: 'Migrated to the unified framework; Lessons 8 to 11 now teach pairs of equations (13.4 to 13.6). Older path behind a compatibility switch until reviewed.',
    },
  },
  {
    id: 'surface-area-volume', subject: 'mathematics', textbook: GM2, number: 14, title: 'Math of Space: Surface Area and Volume',
    boardTitle: 'Surface Area and Volume', boardUnit: 'V Mensuration', boardUnitMarks: 14, source: 'textbook',
    scope: { lessonPrefixes: ['sv-'], prereqPrefixes: ['svp-'] }, implementation: notStarted(7),
  },
  {
    id: 'euclid-geometry', subject: 'mathematics', title: 'Introduction to Euclid’s Geometry: Axioms and Postulates',
    boardUnit: 'IV Geometry', boardUnitMarks: 25, source: 'cbse-only',
    scope: { lessonPrefixes: ['eg-'], prereqPrefixes: ['egp-'] },
    implementation: notStarted(4, 'Listed by CBSE but not a chapter of Ganita Manjari Parts I or II.'),
    reviewFlags: ['CBSE-only topic: confirm with the school which source the teacher will use.'],
  },
  {
    id: 'lines-angles', subject: 'mathematics', title: 'Lines and Angles', boardUnit: 'IV Geometry', boardUnitMarks: 25, source: 'cbse-only',
    scope: { lessonPrefixes: ['la-'], prereqPrefixes: ['lap-'] },
    implementation: notStarted(5, 'Listed by CBSE but not a chapter of Ganita Manjari Parts I or II.'),
    reviewFlags: ['CBSE-only topic: confirm with the school which source the teacher will use.'],
  },
  {
    id: 'triangles-congruence', subject: 'mathematics', title: 'Triangles: Congruence Theorems', boardUnit: 'IV Geometry', boardUnitMarks: 25,
    source: 'cbse-only',
    scope: { lessonPrefixes: ['tc-'], prereqPrefixes: ['tcp-'] },
    implementation: notStarted(6, 'Listed by CBSE but not a chapter of Ganita Manjari Parts I or II.'),
    reviewFlags: ['CBSE-only topic: confirm with the school which source the teacher will use.'],
  },
];

export const CBSE_CLASS_9_2026_27: Curriculum = {
  id: 'cbse-9-2026-27',
  board: 'CBSE',
  classGrade: 9,
  academicYear: '2026-27',
  sources: [
    { title: 'CBSE Science (086) Classes IX (2026-27)', url: 'https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/ScienceSt_SecP1_2026-27.pdf', checked: '2026-10-28' },
    { title: 'CBSE Mathematics Class IX (2026-27)', url: 'https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/Maths_SecP1IX_2026-27.pdf', checked: '2026-10-28' },
    { title: 'CBSE Science at Advanced Level (Optional), Grade 9', url: 'https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/ScienceAd_SecP1_2026-27.pdf', checked: '2026-10-28' },
    { title: 'CBSE Mathematics at Advanced Level (Optional), Grade 9', url: 'https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/MathsAd_SecP1_2026-27.pdf', checked: '2026-10-28' },
    { title: 'NCERT Exploration, Class 9 Science (prelims and chapters 1-13)', url: 'https://ncert.nic.in/textbook/pdf/iesc1ps.pdf', checked: '2026-10-28' },
    { title: 'NCERT Ganita Manjari Grade 9 Part I (prelims and chapters 1-8)', url: 'https://ncert.nic.in/textbook/pdf/iemh1ps.pdf', checked: '2026-10-28' },
    { title: 'NCERT Ganita Manjari Grade 9 Part II (prelims and chapters 9-14)', url: 'https://ncert.nic.in/textbook/pdf/iemh2ps.pdf', checked: '2026-10-28' },
  ],
  textbooks: [
    { id: EXPLORATION, title: 'Exploration (Science, Class 9)', publisher: 'NCERT', edition: '2026-27', pdfPattern: 'https://ncert.nic.in/textbook/pdf/iesc1NN.pdf' },
    { id: GM1, title: 'Ganita Manjari, Grade 9, Part I', publisher: 'NCERT', edition: '2026-27', pdfPattern: 'https://ncert.nic.in/textbook/pdf/iemh1NN.pdf' },
    { id: GM2, title: 'Ganita Manjari, Grade 9, Part II', publisher: 'NCERT', edition: '2026-27', pdfPattern: 'https://ncert.nic.in/textbook/pdf/iemh2NN.pdf' },
  ],
  chapters: [...SCIENCE, ...MATHEMATICS],
  optionalTracks: [
    {
      id: 'science-advanced', title: 'Science at Advanced Level (optional)', document: 'ScienceAd_SecP1_2026-27.pdf',
      chapters: ['Measurement – Foundation of Science', 'Understanding Motion through Experience', 'Newton’s Laws of Motion', 'The Geometry of Power – Advanced Simple Machines', 'Work and Energy', 'Structure of Atom', 'Chemical Bonding', 'Mixtures and Separation of Mixtures', 'Microscope and Microscopy', 'Engineering Life: Miracles in Biotechnology'],
      status: 'not-started', note: 'Optional CBSE track; outside the standard scope implemented here.',
    },
    {
      id: 'mathematics-advanced', title: 'Mathematics at Advanced Level (optional)', document: 'MathsAd_SecP1_2026-27.pdf',
      chapters: ['Sets', 'Logarithms', 'Relations and Functions', 'Coordinate Geometry', 'Combinatorics', 'Exploring some more Progressions'],
      status: 'not-started', note: 'Optional CBSE track; outside the standard scope implemented here.',
    },
  ],
  supportingMaterial: [
    { id: 'states-of-matter', title: 'States of Matter and particle motion', route: '/chemistry/states-of-matter', subject: 'chemistry', reason: 'Not a chapter of Exploration (2026-27); Chapter 5 only points to it for further reading. Kept as an optional refresher.' },
    { id: 'electricity', title: 'Electricity and DC circuits workbench', route: '/robotics/electricity', subject: 'robotics', reason: 'Class 10 content; lives in the dedicated Robotics section, outside the Class 9 path.' },
  ],
  contradictions: [
    {
      id: 'maths-geometry-chapters',
      summary: 'CBSE Mathematics IX lists Euclid’s Geometry, Lines and Angles, and Triangles: Congruence Theorems, which are not chapters of Ganita Manjari Parts I or II.',
      decision: 'Registered as cbse-only chapters, built after the textbook chapters, flagged for teacher review.',
    },
    {
      id: 'maths-algorithms',
      summary: 'Ganita Manjari Part II Chapter 11 (The World of Algorithms) is not named in the CBSE course structure.',
      decision: 'Kept as a textbook chapter; flagged as possibly unassessed.',
    },
  ],
};
