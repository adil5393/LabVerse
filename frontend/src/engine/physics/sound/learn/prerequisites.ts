/**
 * Class 9 Physics, Chapter 10 "Sound Waves": chapter and unit prerequisites (SND-1). Three short, optional refreshers. They never
 * block a lesson. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { numQ, pick } from './questions';

export const PSP_TOFRO: Prerequisite = {
  id: 'psp-tofro',
  title: 'To-and-fro motion about a rest position',
  why: 'Sound begins with vibration, which is motion to and fro about a rest position. You need to be able to picture one complete swing and to count swings.',
  connection: 'Chapter 4: Describing Motion Around Us, lessons 1 and 2 (/physics/motion/learn/pm-l1)',
  refresher: [{
    id: 'psp-tf-step', title: 'A swing out and back is one cycle',
    paragraphs: [
      'A child on a swing, a pendulum, a ruler pressed on a desk and then released: each moves out to one side, back through the middle, out to the other side and back again. The middle is the rest position, where the object sits when nothing disturbs it.',
      'One complete trip (out, back, across and back to where it started) is one cycle. Counting how many cycles happen in each second tells you how fast the object vibrates.',
    ],
    misconception: { wrong: 'A vibrating object moves away from its rest position and keeps going.', right: 'It moves out and comes back, again and again, always about the same rest position.' },
  }],
  checks: [
    pick('psp-tf-c1', 'A ruler is pressed on a desk and released. It moves up, down, up, down. What is the rest position?', [
      ['The place where the ruler is when it is not moving', null],
      ['The highest point it reaches', 'The highest point is one end of the swing. The rest position is the middle, where the ruler sits when it is still.', 'rest_is_end'],
    ], 'The rest position is where it sits when nothing disturbs it.', undefined, 'psp-tf-step'),
    numQ('psp-tf-c2', 'A pendulum completes 3 full cycles every second. How many full cycles does it complete in 4 seconds?', 12, '3 cycles each second for 4 seconds: 3 × 4 = 12.', { refresherId: 'psp-tf-step' }),
  ],
};

export const PSP_PARTICLES: Prerequisite = {
  id: 'psp-particles',
  title: 'Matter is made of particles: solids, liquids and gases',
  why: 'Sound travels by the particles of a material pushing on their neighbours. You need to picture a material as many tiny particles and know that solids, liquids and gases all have them.',
  connection: 'Chemistry: Matter (the particle picture of solids, liquids and gases)',
  refresher: [{
    id: 'psp-pa-step', title: 'Particles packed close, or far apart',
    paragraphs: [
      'Everything around you is made of tiny particles. In a solid they are packed close and each stays near its own place. In a liquid they are close but can slide past each other. In a gas, such as air, they are far apart and move about freely.',
      'Where the particles are crowded the material is denser; where they are spread out it is less dense. Density is how much material there is in a given space.',
    ],
    misconception: { wrong: 'Air is empty, so there is nothing in it.', right: 'Air is a gas made of particles that are far apart. It is a thin material, not nothing. A space with no particles at all is called a vacuum.' },
  }],
  checks: [
    pick('psp-pa-c1', 'In which region are the particles of a gas most crowded together?', [
      ['The denser region', null],
      ['The less dense region', 'Less dense means the particles are more spread out.', 'density_reversed'],
    ], 'Denser means more particles in the same space.', undefined, 'psp-pa-step'),
    pick('psp-pa-c2', 'What is a vacuum?', [
      ['A space with no particles of matter in it', null],
      ['Air that is very cold', 'Cold air still has particles. A vacuum is a space with essentially none.', 'vacuum_is_air'],
    ], 'No matter at all.', undefined, 'psp-pa-step'),
  ],
};

export const PSP_GRAPH: Prerequisite = {
  id: 'psp-graph',
  title: 'Reading a simple graph with an average line',
  why: 'A sound wave is drawn as a graph of density against distance. You need to read a value from the vertical axis, say where it is above or below a reference line, and find where a pattern repeats.',
  connection: 'Chapter 4: Describing Motion Around Us, lesson 7 (/physics/motion/learn/pm-l7)',
  refresher: [{
    id: 'psp-gr-step', title: 'Above the line, below the line, and where it repeats',
    paragraphs: [
      'On a graph the horizontal axis (x) shows one quantity, such as distance, and the vertical axis (y) shows another, such as density. A dashed line can mark an average value. Points above the dashed line are above average; points below it are below average.',
      'A wavy graph that repeats the same shape again and again is periodic. The distance along the x-axis after which it starts to repeat is its repeat length. The highest point of a hump is a crest and the lowest point of a dip is a trough.',
    ],
    misconception: { wrong: 'The height of a point on the graph is how far along it is.', right: 'How far along it is, is read on the horizontal axis. The height is the value of the other quantity.' },
  }],
  checks: [
    pick('psp-gr-c1', 'A point on a density graph lies below the dashed average line. What does that tell you?', [
      ['The density there is lower than average', null],
      ['The density there is higher than average', 'Below the average line means below the average value.', 'above_below_reversed'],
    ], 'Below the line is below average.', undefined, 'psp-gr-step'),
    numQ('psp-gr-c2', 'A wavy graph has crests at 2 cm, 6 cm and 10 cm along the x-axis. How far is it from one crest to the next, in centimetres?', 4, '6 − 2 = 4 cm (and 10 − 6 = 4 cm).', { unit: 'cm', refresherId: 'psp-gr-step' }),
  ],
};

export const PS_PREREQUISITES = [PSP_TOFRO, PSP_PARTICLES, PSP_GRAPH];

export const PS_UNITS: EduUnit[] = [
  {
    id: 'ps-unit-1', number: 1, title: 'Making and carrying sound',
    centralIdea: 'Sound is produced by vibrating objects. It reaches us by travelling through a material medium (a solid, a liquid or a gas) and cannot travel through a vacuum.',
    connection: 'This is Sections 10.1, 10.1.1, 10.2 and 10.2.1. It uses the idea of to-and-fro motion from Chapter 4 and the particle picture of matter.',
    vocabulary: [
      { term: 'vibration', meaning: 'to-and-fro motion of an object about its rest position' },
      { term: 'source', meaning: 'the object that produces a sound' },
      { term: 'medium', meaning: 'the material through which sound travels: a solid, a liquid or a gas' },
      { term: 'vacuum', meaning: 'a space with no matter in it' },
    ],
    discover: ['Why every sound starts with a vibration', 'How a tuning fork and a plucked string show it', 'What sound needs in order to travel, and why astronauts cannot hear each other directly'],
    prerequisiteIds: ['psp-tofro', 'psp-particles'], lessonIds: ['ps-l1', 'ps-l2', 'ps-l3'],
  },
  {
    id: 'ps-unit-2', number: 2, title: 'Sound as a wave',
    centralIdea: 'A sound wave is a pattern of compressions and rarefactions that travels through a medium while the particles of the medium only vibrate about their own places. The wave carries energy, not matter, and can be drawn as a graph of density against distance.',
    connection: 'This is Sections 10.3, 10.4 and 10.5. It builds on Unit 1 and on reading graphs.',
    vocabulary: [
      { term: 'compression', meaning: 'a region where the particles are crowded together (density above average)' },
      { term: 'rarefaction', meaning: 'a region where the particles are spread out (density below average)' },
      { term: 'longitudinal wave', meaning: 'a wave in which the particles vibrate along the direction the wave travels' },
      { term: 'crest and trough', meaning: 'the highest and lowest points of the density graph' },
    ],
    discover: ['How a vibrating source makes compressions and rarefactions travel', 'Why the particles stay where they are while the wave moves on', 'How a sound wave is drawn as a graph'],
    prerequisiteIds: ['psp-particles', 'psp-graph'], lessonIds: ['ps-l4', 'ps-l5', 'ps-l6'],
  },
];
