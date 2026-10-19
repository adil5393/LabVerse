/** NCERT Chapter 7 solutions from PHY-3A: parts supported by Section 7.1 (work done by a constant force). Original wording. */

import type { WorkSolution } from './exerciseTypes';

const LAB = '/physics/work/lab';

export const SOLUTIONS_A: Record<string, WorkSolution> = {
  '1-i': {
    given: ['A force is applied to an object.', 'The object does not move.'], find: ['Is work said to be done?'],
    principle: 'Work by a constant force is W = F × s, so it needs a displacement s of the object.',
    hint: 'What two things must happen before a force does work on an object? Check whether both happen here.',
    reasoning: [
      { text: 'A force does work on an object only if the object is displaced in the direction of the force (or against it).', why: 'Work is defined as force multiplied by displacement, W = F × s.' },
      { text: 'The object does not move, so its displacement is zero.', why: 'Zero displacement is given.' },
      { text: 'Whatever the size of the force, the product of force and zero displacement is zero.', why: 'Anything multiplied by zero is zero.' },
    ],
    calculation: ['W = F × s = F × 0 m = 0 J'],
    finalAnswer: 'False: no work is done on the object, however large the force is.',
    meaning: 'The person may feel tired because the muscles use energy, but the object gains no energy from this force.',
    commonMistake: 'Saying work is done because you push hard or feel tired. Tiredness comes from your muscles using energy; no work is done on the object if it is not displaced.',
    lab: { href: `${LAB}?experiment=B`, label: 'Experiment B: no displacement' },
    verification: 'The Work Laboratory model gives 0 J for a 10 N push with zero displacement (automated test).',
  },
  '1-ii': {
    given: ['A bucket is lifted vertically upwards.'], find: ['Is the work done on the bucket by the lifting force positive?'],
    assumptions: ['"The work done" means the work done by the lifting force of the person (the bucket is lifted slowly, so the force is about the bucket\'s weight).'],
    principle: 'Work is positive when the force acts along the displacement.',
    hint: 'Compare the direction of the lifting force with the direction of the bucket\'s displacement.',
    reasoning: [
      { text: 'To lift the bucket you pull it upwards.', why: 'The lifting force acts upwards.' },
      { text: 'The bucket moves upwards, in the direction of that force.', why: 'The displacement is upwards.' },
      { text: 'A force along the displacement does positive work.', why: 'The force and displacement have the same sign, so W = F × s is positive.' },
    ],
    calculation: ['For a bucket of mass m lifted through a height h: F = mg and s = +h, so W = mg × h = +mgh (positive).'],
    finalAnswer: 'True: the lifting force does positive work on the bucket. (Gravity, which pulls down while the bucket goes up, does negative work.)',
    meaning: 'The lifting force transfers energy to the bucket; gravity takes the same amount away from the bucket-and-Earth motion, so the net work for a slow lift is zero.',
    commonMistake: 'Forgetting to say which force. The weight of the bucket does negative work as it is lifted, but the question is about the lifting force.',
    lab: { href: `${LAB}?experiment=C`, label: 'Experiment C: positive and negative work' },
    verification: 'For 2 kg lifted 2 m the model gives +40 J for the lifting force and −40 J for gravity (automated test).',
  },
  '2-i': {
    given: ['Work done = ____ × ____ (measured in the direction of the force).'], find: ['The two quantities that are multiplied.'],
    principle: 'The definition of the work done by a constant force, W = F × s.',
    hint: 'Recall how you found the work of lifting the bag: what did you multiply?',
    reasoning: [
      { text: 'The work done by a constant force is the force multiplied by the displacement of the object in the direction of the force.', why: 'This is the definition of work, W = F × s.' },
      { text: 'The second blank is already "(in the direction of the force)", so it is the displacement.', why: 'The phrase says in which direction the displacement is measured.' },
    ],
    calculation: ['W = F × s: work (J) = force (N) × displacement (m)'],
    finalAnswer: 'Work done = force × displacement (in the direction of the force).',
    meaning: 'Work is larger when the force or the displacement is larger.',
    commonMistake: 'Writing force × distance travelled for a path with turns, or force × time. Only the displacement along the force counts.',
    lab: { href: `${LAB}?experiment=A`, label: 'Experiment A: force and displacement' },
    verification: 'For 10 N and 3 m along the force the model gives 30 J = 10 × 3 (automated test).',
  },
  '2-ii': {
    given: ['1 joule is done when a force of ____ N displaces an object by 1 m in the direction of the force.'], find: ['The missing force in newtons.'],
    principle: 'The joule is defined through W = F × s: 1 J = 1 N × 1 m.',
    hint: 'Start from 1 J = (force) × (1 m) and solve for the force.',
    reasoning: [
      { text: 'The joule is defined through W = F × s: 1 J = 1 N × 1 m.', why: 'The unit of work is the unit of force times the unit of displacement.' },
      { text: 'Compare 1 J = F × 1 m with 1 J = 1 N × 1 m: F must be 1 N.', why: 'Both sides have the same displacement, so the forces match.' },
    ],
    calculation: ['F = W ÷ s = 1 J ÷ 1 m = 1 N'],
    finalAnswer: '1 newton.',
    meaning: 'A joule is a small amount of work: about the work of lifting a 100 g object through 1 m.',
    commonMistake: 'Answering 10 N (using g = 10) or 1 kg. The question is about a force of 1 N, not a weight or a mass.',
    lab: { href: `${LAB}?experiment=A`, label: 'Experiment A: force and displacement' },
    verification: 'The model gives exactly 1 J for a 1 N force and a 1 m displacement along it (automated test).',
  },
  '10-i': {
    given: ['A 2 kg ball is thrown upwards and later comes back down.'], find: ['The sign of the work done by gravity during the upward motion and during the downward motion.'],
    assumptions: ['Only the direction of gravity and of the displacement is needed, so the speed and the mass do not change the signs.'],
    principle: 'The sign of the work comes from the direction of the force relative to the displacement.',
    hint: 'Which way does gravity act? Compare that with the displacement of the ball, first going up, then coming down.',
    reasoning: [
      { text: 'Gravity pulls the ball downwards all the time.', why: 'The weight acts towards the Earth, whichever way the ball moves.' },
      { text: 'Going up, the displacement is upwards, opposite to gravity, so gravity does negative work.', why: 'A force opposite to the displacement does negative work (like the goalkeeper stopping a ball).' },
      { text: 'Coming down, the displacement is downwards, along gravity, so gravity does positive work.', why: 'A force along the displacement does positive work.' },
    ],
    calculation: ['Going up through a height h: W = (−mg) × (+h) = −mgh (negative).', 'Coming down through h: W = (−mg) × (−h) = +mgh (positive).', 'For example with m = 2 kg, h = 10 m, g = 10 m/s²: −200 J going up and +200 J coming down.'],
    finalAnswer: 'Negative work on the way up; positive work on the way down.',
    meaning: 'Going up, gravity removes kinetic energy from the ball; coming down, it gives it back.',
    commonMistake: 'Saying gravity does positive work because it is "the force that acts". The sign depends on the direction of the displacement relative to the force.',
    lab: { href: `${LAB}?experiment=C`, label: 'Experiment C: positive and negative work (the lifted box: gravity does the opposite sign to the hands)' },
    verification: 'The model gives −mgh for a displacement of +h and +mgh for −h, for several masses and heights (automated test).',
  },
};
