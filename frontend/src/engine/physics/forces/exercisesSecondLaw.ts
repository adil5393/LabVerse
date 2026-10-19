/**
 * NCERT Chapter 6 exercises 5, 8 and 10 to 15 (PHY-2C): the questions fully supported by Newton's second law and momentum
 * (Section 6.5). Same structure as the earlier solutions: given, find, principle, formula choice, hint, steps with reasons,
 * calculations, answers, explanation, common mistakes, illustrations, laboratory links where the model fits (and the reason
 * when it does not). Question summaries are original paraphrases. Graph data for Q10 and Q11 are read from Figs. 6.40 and 6.41
 * of the printed chapter. Viewing a solution is never mastery evidence: nothing here touches the learning-progress store.
 */

import type { ForceExercise } from './exercises';
import { DEFAULT_SETUP, sampleAtTime, type Setup } from './forceModel';
import { combinedAcceleration, momentumChangeBetween } from './secondLaw';

const V = (method: string) => ({ status: 'verified' as const, method });
const c = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });

export const SOLVED_2C: Record<number, ForceExercise> = {
  5: {
    number: 5, sections: ['6.5'], topic: "Newton's second law (statement)", status: 'solved', lessonIds: ['pf-l6'],
    parts: [{ id: 'a', label: 'which of the four statements is correct' }],
    summary: 'When a net force acts on an object, it accelerates. Four statements describe the direction of the acceleration and how its size depends on the force or the mass. Which is correct?',
    solution: {
      kind: 'multiple-choice',
      given: ['(i) opposite to the force, proportional to the force; (ii) opposite to the force, proportional to the mass; (iii) along the force, inversely proportional to the force; (iv) along the force, proportional to the force.'],
      find: ['Which statement correctly describes the acceleration.'],
      principle: 'Newton\'s second law: the acceleration is in the direction of the net force; its magnitude is proportional to the net force and inversely proportional to the mass (a = F ÷ m).',
      hint: 'Check each statement for two things: the direction of the acceleration, and how its size depends on F (or m).',
      steps: [
        { text: 'Direction: the acceleration points the same way as the net force. So (i) and (ii), which say "opposite", are wrong.', why: 'F = ma with m > 0 means a and F have the same sign.' },
        { text: 'Dependence on force: a = F ÷ m, so a is proportional to F (double F, double a). Statement (iii), "inversely proportional to the force", is wrong.', why: 'More net force gives more acceleration.' },
        { text: 'Statement (iv): along the force, proportional to the force. This agrees with the law.', why: 'Both the direction and the dependence match F = ma.' },
        { text: 'Check (ii) as well: it says the acceleration is proportional to the mass, but a heavier object accelerates less (inversely proportional).', why: 'A second reason (ii) cannot be right.' },
      ],
      answers: [{ label: 'Correct statement', value: '(iv) in the direction of the force, with acceleration proportional to the force acting on the object', part: 'a' }],
      explanation: 'The law has two parts: direction (with the net force) and size (proportional to F, inversely proportional to m). Only (iv) gets both right.',
      commonMistakes: [{ mistake: 'Choosing "opposite to the force" because friction opposes motion.', fix: 'The acceleration follows the net force; friction is just one of the forces in the sum.' }, { mistake: 'Confusing proportional with inversely proportional.', fix: 'Doubling F doubles a (proportional); doubling m halves a (inverse).' }],
      illustrations: [{ kind: 'cart', caption: 'A 2 kg cart with 8 N to the right: a = +4 m/s², in the direction of the force; with 4 N it is +2 m/s².', setup: c({ massKg: 2, forceA: 8 }), t: 2, graphs: true }],
      labs: [{ href: '/physics/forces/lab?experiment=K', label: 'Experiment K: same mass, different net forces' }],
      verification: V('The direction and proportionality were recomputed with the Force Laboratory model (automated test).'),
    },
  },
  8: {
    number: 8, sections: ['6.5'], topic: 'Force, momentum change and time of contact', status: 'solved', lessonIds: ['pf-l7'],
    parts: [{ id: 'a', label: 'why glass items are packed in bubble wrap or hay' }],
    summary: 'Explain how bubble wrap or hay protects glass items that are being transported.',
    solution: {
      kind: 'conceptual',
      given: ['Glass items are packed in bubble wrap or hay for transport.', 'A knock or a drop changes the velocity of a glass item suddenly.'],
      find: ['Why the packing protects the glass.'],
      principle: 'The net force is the rate of change of momentum: F = Δp ÷ Δt. For the same change of momentum, a longer time means a smaller force.',
      formulas: [{ formula: 'F = Δp ÷ Δt = m (v − u) ÷ t', why: 'The glass changes its velocity in a short time when it is knocked; this gives the average force on it.' }],
      hint: 'The glass item must lose the same momentum however it is stopped. What does the packing change?',
      steps: [
        { text: 'When a glass item is dropped or knocked, its momentum changes (for example from moving to rest). The change Δp is the same with or without packing.', why: 'Δp = m (v − u) depends only on the mass and the velocities.' },
        { text: 'Without packing the glass stops almost at once on a hard surface, so Δt is very small and the force F = Δp ÷ Δt is very large: the glass breaks.', why: 'A small denominator gives a large force.' },
        { text: 'Bubble wrap or hay is soft and compresses. It makes the glass take longer to stop, so Δt is larger.', why: 'The same Δp spread over a longer time.' },
        { text: 'With a larger Δt the force is smaller (and so is the acceleration), and the glass is much less likely to break.', why: 'F = Δp ÷ Δt: a longer time means a smaller average force.' },
      ],
      answers: [{ label: 'Why packing helps', value: 'It increases the time over which the glass\'s momentum changes, so the average force on it is smaller.', part: 'a' }],
      explanation: 'Packing does not change the glass\'s momentum or the knock; it makes the stopping gentler by lengthening the time, which lowers the force. The same idea explains the landing mat in the high jump, the airbag and the fielder pulling their hands back.',
      commonMistakes: [{ mistake: 'Saying the packing reduces the momentum of the glass.', fix: 'The momentum change is the same; the time over which it happens is longer.' }, { mistake: 'Saying the packing makes the glass lighter.', fix: 'The mass is unchanged.' }],
      illustrations: [
        { kind: 'cart', caption: 'A 5 kg cart moving at 4 m/s is stopped by a 20 N force over 1 s (a gentle stop): Δp = −20 kg m/s.', setup: c({ massKg: 5, forceA: 20, dirA: 'left', startVelocity: 4, pulseS: 1 }), t: 1, graphs: true },
        { kind: 'cart', caption: 'The same cart is stopped by a 40 N force over 0.5 s (an abrupt stop): the same Δp = −20 kg m/s, twice the force.', setup: c({ massKg: 5, forceA: 40, dirA: 'left', startVelocity: 4, pulseS: 0.5 }), t: 0.5, graphs: true },
      ],
      labs: [{ href: '/physics/forces/lab?experiment=N', label: 'Experiment N: the same change of momentum from a force and a time' }],
      labNote: 'The laboratory does not model a soft packing material; the two cart runs show the same momentum change produced by a smaller force over a longer time.',
      verification: V('Both pulses recomputed with the model: each gives Δp = −20 kg m/s, with forces 20 N and 40 N (automated test).'),
    },
  },
  10: {
    number: 10, sections: ['6.5'], topic: 'Force-mass graph from an acceleration-mass graph', status: 'solved', lessonIds: ['pf-l6'],
    parts: [{ id: 'a', label: 'the force-mass graph' }],
    summary: 'The acceleration-mass graph for a force acting on objects of different masses is a falling curve. Plot the force-mass graph for the same data.',
    solution: {
      kind: 'numerical',
      given: ['Fig. 6.40 (read from the figure): the points (mass, acceleration) are (1 kg, 10 m/s²), (2 kg, 5 m/s²), (4 kg, 2.5 m/s²) and (5 kg, 2 m/s²).'],
      find: ['The force-mass graph: F plotted against m.'],
      assumptions: ['The same force acts on all the masses, and the points are read from the printed graph.'],
      principle: 'F = ma: multiply the mass and the acceleration at each point to get the force.',
      formulas: [{ formula: 'F = m a', why: 'Mass and acceleration are known at each point; the force is wanted.' }],
      hint: 'Find F = ma for each point of the acceleration-mass graph. What do you notice about the four values?',
      steps: [
        { text: 'm = 1 kg, a = 10 m/s²: F = 1 × 10 = 10 N.', why: 'Newton\'s second law, F = ma.' },
        { text: 'm = 2 kg, a = 5 m/s²: F = 2 × 5 = 10 N.', why: 'The same law, F = ma, at another point of the graph.' },
        { text: 'm = 4 kg, a = 2.5 m/s²: F = 4 × 2.5 = 10 N. m = 5 kg, a = 2 m/s²: F = 5 × 2 = 10 N.', why: 'The same law, F = ma, at another point of the graph.' },
        { text: 'The force is 10 N at every mass, so the force-mass graph is a horizontal straight line at F = 10 N.', why: 'The curve a = 10 ÷ m is exactly what keeps m × a constant.' },
      ],
      answers: [{ label: 'Force-mass graph', value: 'a horizontal straight line at F = 10 N, for masses from 1 kg to 5 kg', part: 'a', numeric: 10 }],
      explanation: 'The same force acts on every mass, so the force does not depend on the mass. The acceleration falls as 1 ÷ m, a curve, but the force stays constant.',
      commonMistakes: [{ mistake: 'Drawing the same falling curve for force against mass.', fix: 'F = ma is the same for every point here (10 N), so the graph is flat.' }, { mistake: 'Drawing a straight line through the origin.', fix: 'That would mean the force grows with the mass; here the force is the same for all masses.' }],
      illustrations: [{ kind: 'massSweep', caption: 'Acceleration against mass for a constant 10 N (a curve) and force against mass (a horizontal line at 10 N).', force: 10, masses: [1, 2, 4, 5] }],
      labs: [{ href: '/physics/forces/lab?experiment=L', label: 'Experiment L: the same net force on different masses' }],
      verification: V('F = m a recomputed at each read point (automated test): 10 N each time.'),
    },
  },
  11: {
    number: 11, sections: ['6.5'], topic: 'Force from a velocity-time graph', status: 'solved', lessonIds: ['pf-l6'],
    parts: [{ id: 'a', label: 'the force on the object' }],
    summary: 'The velocity-time graph of a 10 kg object on a straight line is a straight line rising from 10 m/s at 0 s to 20 m/s at 4 s and 30 m/s at 8 s. Find the force acting on it using the graph.',
    solution: {
      kind: 'numerical',
      given: ['Mass m = 10 kg.', 'Fig. 6.41 (read from the figure): v = 10 m/s at t = 0, 20 m/s at 4 s and 30 m/s at 8 s: a straight line.'],
      find: ['The force acting on the object.'],
      assumptions: ['The graph is a straight line, so the acceleration and the net force are constant.'],
      principle: 'The slope of a velocity-time graph is the acceleration; the net force is F = ma.',
      formulas: [{ formula: 'a = (v − u) ÷ t (the slope)', why: 'The graph gives the velocities and times.' }, { formula: 'F = m a', why: 'Mass and acceleration are then known.' }],
      hint: 'Find the slope of the graph first. Then use F = ma.',
      steps: [
        { text: 'The graph is a straight line, so the acceleration is constant: a = slope.', why: 'A constant slope means a constant acceleration.' },
        { text: 'a = (30 − 10) m/s ÷ 8 s = 20 ÷ 8 = 2.5 m/s² (the same from 0 to 4 s: (20 − 10) ÷ 4 = 2.5 m/s²).', why: 'Slope = change in velocity ÷ time; two intervals give the same value, confirming the straight line.' },
        { text: 'F = ma = 10 kg × 2.5 m/s² = 25 N.', why: 'Newton\'s second law.' },
        { text: 'The velocity is increasing in the positive direction, so the force acts in the direction of motion.', why: 'The acceleration, and so the net force, is positive.' },
      ],
      answers: [{ label: 'Force on the object', value: '25 N, in the direction of the motion', part: 'a', numeric: 25 }],
      explanation: 'A steady slope means a constant net force. Doubling the mass would halve the acceleration for the same 25 N.',
      commonMistakes: [{ mistake: 'Using the final velocity (30 m/s) as the acceleration.', fix: 'The acceleration is the slope of the graph, 2.5 m/s².' }, { mistake: 'Calculating F = m v = 300 N.', fix: 'That is the momentum. The force is mass × acceleration.' }],
      illustrations: [{ kind: 'cart', caption: 'A 10 kg cart starting at 10 m/s with a 25 N net force: the velocity reaches 30 m/s at 8 s, as in the graph.', setup: c({ massKg: 10, forceA: 25, startVelocity: 10 }), t: 8, graphs: true }],
      labs: [{ href: '/physics/forces/lab?experiment=K', label: 'Experiment K: net force and acceleration' }],
      verification: V('Recomputed with the Force Laboratory model: 25 N on 10 kg from 10 m/s gives 30 m/s at 8 s (automated test).'),
    },
  },
  12: {
    number: 12, sections: ['6.5'], topic: 'Stopping force with the equations of motion', status: 'solved', lessonIds: ['pf-l6'],
    parts: [{ id: 'a', label: 'acceleration of the bullet' }, { id: 'b', label: 'stopping force' }],
    summary: 'A 50 g bullet moving at 100 m/s enters a stationary wooden block and stops after penetrating 50 cm. Estimate the stopping force, assuming a constant acceleration in the block.',
    solution: {
      kind: 'numerical',
      given: ['m = 50 g = 0.05 kg', 'u = 100 m/s, v = 0', 's = 50 cm = 0.5 m'],
      find: ['(a) The acceleration of the bullet in the block.', '(b) The stopping force.'],
      assumptions: ['The acceleration is constant while the bullet is in the block.'],
      principle: 'First find the acceleration from the equations of motion, then the force from F = ma. Convert to SI units first.',
      formulas: [{ formula: 'v² = u² + 2 a s', why: 'u, v and s are known and the time is not.' }, { formula: 'F = m a', why: 'The mass and the acceleration give the force.' }],
      hint: 'Convert grams to kilograms and centimetres to metres. Use the equation of motion that has no time.',
      steps: [
        { text: 'm = 50 g = 0.05 kg and s = 50 cm = 0.5 m.', why: 'F = ma needs kg and m/s².' },
        { text: '0 = 100² + 2 × a × 0.5, so 1 × a = −10 000 and a = −10 000 m/s².', why: 'The time is not given, so use v² = u² + 2as.' },
        { text: 'F = ma = 0.05 kg × (−10 000 m/s²) = −500 N.', why: 'Newton\'s second law.' },
        { text: 'The negative sign shows the force acts against the bullet\'s motion: a stopping force of magnitude 500 N.', why: 'The sign gives the direction.' },
        { text: 'Check by the stopping time: t = u ÷ |a| = 100 ÷ 10 000 = 0.01 s; the change of momentum is 0.05 × 100 = 5 kg m/s and 5 ÷ 0.01 = 500 N.', why: 'The momentum form F = Δp ÷ Δt gives the same force.' },
      ],
      answers: [{ label: '(a) Acceleration', value: '−10 000 m/s² (10 000 m/s² against the motion)', part: 'a', numeric: -10000 }, { label: '(b) Stopping force', value: '500 N, opposite to the bullet\'s motion (−500 N)', part: 'b', numeric: -500 }],
      explanation: 'The bullet stops in only a hundredth of a second, so its deceleration is enormous and the force is large even though its mass is small.',
      commonMistakes: [{ mistake: 'Using 50 g as 50 kg.', fix: 'Convert to 0.05 kg first (F would be 1000 times too large).' }, { mistake: 'Using 50 cm as 50 m.', fix: 'Convert to 0.5 m; the acceleration would be 100 times too small.' }, { mistake: 'Forgetting that the force is against the motion.', fix: 'The acceleration is negative, so the force is negative.' }],
      labNote: 'The Force Laboratory limits the mass to 0.5 kg and above, forces to 100 N and speeds to 20 m/s, so it cannot show a 0.05 kg bullet at 100 m/s stopped by 500 N. The same calculation is shown in the steps.',
      verification: V('Recomputed with v² = u² + 2as and F = ma, and checked with F = Δp ÷ Δt (automated test).'),
    },
  },
  13: {
    number: 13, sections: ['6.5'], topic: 'Time of contact from force and change of velocity', status: 'solved', lessonIds: ['pf-l6', 'pf-l7'],
    parts: [{ id: 'a', label: 'time of contact' }],
    summary: 'A footballer kicks a 0.4 kg ball so that it leaves at 108 km/h; the estimated force on it is 800 N. Find the time the foot is in contact with the ball.',
    solution: {
      kind: 'numerical',
      given: ['m = 0.4 kg', 'final speed v = 108 km/h', 'force F = 800 N'],
      find: ['The time of contact t.'],
      assumptions: ['The ball starts at rest (u = 0) and the force is constant during the contact.'],
      principle: 'F = ma gives the acceleration; then v = u + at gives the time. (Equivalently F = Δp ÷ Δt.)',
      formulas: [{ formula: 'a = F ÷ m', why: 'The force and the mass are given.' }, { formula: 'v = u + a t', why: 'The velocities and the acceleration give the time.' }],
      hint: 'Change 108 km/h to m/s. Find the acceleration from the force, then the time.',
      steps: [
        { text: 'v = 108 km/h = 108 ÷ 3.6 = 30 m/s.', why: 'Use SI units.' },
        { text: 'a = F ÷ m = 800 ÷ 0.4 = 2000 m/s².', why: 'Newton\'s second law.' },
        { text: '30 = 0 + 2000 × t, so t = 30 ÷ 2000 = 0.015 s.', why: 'v = u + at with u = 0.' },
        { text: 'Check with momentum: Δp = 0.4 × 30 = 12 kg m/s and t = Δp ÷ F = 12 ÷ 800 = 0.015 s.', why: 'F = Δp ÷ Δt gives the same time.' },
      ],
      answers: [{ label: 'Time of contact', value: '0.015 s (15 milliseconds)', part: 'a', numeric: 0.015 }],
      explanation: 'The foot is in contact for only a few hundredths of a second: a large force acting for a very short time gives the ball its speed.',
      commonMistakes: [{ mistake: 'Using 108 as the velocity without converting.', fix: 'Convert to 30 m/s.' }, { mistake: 'Finding the time as m ÷ F or F ÷ m.', fix: 'F ÷ m is the acceleration; the time is v ÷ a.' }],
      labNote: 'The laboratory allows forces only up to 100 N and masses from 0.5 kg, so an 800 N kick on a 0.4 kg ball is outside its range.',
      verification: V('Recomputed in two ways: a = F ÷ m then t = v ÷ a, and t = Δp ÷ F (automated test).'),
    },
  },
  14: {
    number: 14, sections: ['6.3', '6.5'], topic: 'Net force, friction and the equations of motion', status: 'solved', lessonIds: ['pf-l3', 'pf-l6'],
    parts: [{ id: 'a', label: 'distance before stopping' }],
    summary: 'A 2 kg object moving at a constant 10 m/s reaches a rough patch where the friction is 7 N, and at the same time an extra constant 3 N force opposes the motion. How far does it go before it stops?',
    solution: {
      kind: 'numerical',
      given: ['m = 2 kg, u = 10 m/s, v = 0 at the end', 'friction 7 N and an extra force 3 N, both opposing the motion'],
      find: ['The distance travelled before the object stops.'],
      assumptions: ['Both forces are constant and act along the line of motion; no other horizontal force acts.'],
      principle: 'Find the net force, then the acceleration (F = ma), then the stopping distance from the equations of motion.',
      formulas: [{ formula: 'net force = 7 N + 3 N (same direction)', why: 'Both oppose the motion, so they add.' }, { formula: 'a = F ÷ m', why: 'Newton\'s second law.' }, { formula: 'v² = u² + 2 a s', why: 'The time is not needed.' }],
      hint: 'The two opposing forces point the same way, so they add. Then find the deceleration and use the equation without time.',
      steps: [
        { text: 'Net force = 7 N + 3 N = 10 N, against the motion (take the motion as positive: −10 N).', why: 'Forces in the same direction add.' },
        { text: 'a = F ÷ m = −10 ÷ 2 = −5 m/s².', why: 'The acceleration is in the direction of the net force: it decelerates the object.' },
        { text: '0 = 10² + 2 × (−5) × s, so 10 s = 100 and s = 10 m.', why: 'v² = u² + 2as.' },
        { text: 'Check: the time to stop is 10 ÷ 5 = 2 s, and s = ½ (u + v) t = ½ × 10 × 2 = 10 m.', why: 'A second equation gives the same distance.' },
      ],
      answers: [{ label: 'Distance before stopping', value: '10 m', part: 'a', numeric: 10 }],
      explanation: 'Friction and the extra force together decelerate the object at 5 m/s², bringing it to rest in 2 s after 10 m.',
      commonMistakes: [{ mistake: 'Using only the friction (7 N).', fix: 'The extra 3 N also opposes the motion: the net force is 10 N.' }, { mistake: 'Subtracting the forces (7 − 3).', fix: 'Both oppose the motion, so they add.' }, { mistake: 'Saying the object keeps moving because it had a constant velocity.', fix: 'Constant velocity needed zero net force; now there is a net force.' }],
      illustrations: [{ kind: 'cart', caption: 'The two opposing forces combined as one 10 N force to the left on a 2 kg cart moving right at 10 m/s: it stops at 2 s after 10 m.', setup: c({ massKg: 2, forceA: 10, dirA: 'left', startVelocity: 10 }), t: 2, graphs: true }],
      labs: [{ href: '/physics/forces/lab?experiment=O', label: 'Experiment O: a force that opposes the velocity' }],
      labNote: 'In the cart the combined 10 N is applied as one push on a frictionless track; after the cart stops this push would keep acting, but the solution stops at the stopping time.',
      verification: V('Recomputed with the Force Laboratory model and with v² = u² + 2as (automated test).'),
    },
  },
  15: {
    number: 15, sections: ['6.5'], topic: 'Acceleration of two objects together', status: 'solved', lessonIds: ['pf-l6'],
    parts: [{ id: 'a', label: 'the expression for the acceleration' }],
    summary: 'The same tractor force F gives a harrow of mass m₁ an acceleration a₁ and a trolley of mass m₂ an acceleration a₂. Find the acceleration when the tractor pulls the trolley with the harrow on it, in terms of a₁ and a₂ (ignore friction).',
    solution: {
      kind: 'numerical',
      given: ['F = m₁ a₁ for the harrow alone.', 'F = m₂ a₂ for the trolley alone.', 'The same force F pulls both together (total mass m₁ + m₂).'],
      find: ['The acceleration a of the combined load in terms of a₁ and a₂.'],
      assumptions: ['No friction; the harrow rides on the trolley, so both move with the same acceleration.'],
      principle: 'Newton\'s second law applied to the combined mass: a = F ÷ (m₁ + m₂). Write the masses in terms of F and the accelerations.',
      formulas: [{ formula: 'm₁ = F ÷ a₁ and m₂ = F ÷ a₂', why: 'From F = ma for each object.' }, { formula: 'a = F ÷ (m₁ + m₂)', why: 'Second law for the two together.' }],
      hint: 'Express each mass using F and its acceleration. Then put the sum of the masses into a = F ÷ (m₁ + m₂).',
      steps: [
        { text: 'From F = m₁a₁: m₁ = F ÷ a₁. From F = m₂a₂: m₂ = F ÷ a₂.', why: 'Rearranging F = ma.' },
        { text: 'The combined mass is m₁ + m₂ = F ÷ a₁ + F ÷ a₂ = F (1 ÷ a₁ + 1 ÷ a₂) = F (a₁ + a₂) ÷ (a₁ a₂).', why: 'Common denominator a₁a₂.' },
        { text: 'a = F ÷ (m₁ + m₂) = F ÷ [F (a₁ + a₂) ÷ (a₁ a₂)] = a₁ a₂ ÷ (a₁ + a₂).', why: 'F cancels, so the answer does not depend on F.' },
        { text: 'Check with numbers: a₁ = 2 and a₂ = 3 m/s² with F = 6 N gives m₁ = 3 kg and m₂ = 2 kg; together 5 kg gives a = 6 ÷ 5 = 1.2 m/s², and a₁a₂ ÷ (a₁ + a₂) = 6 ÷ 5 = 1.2 m/s².', why: 'A numerical case confirms the formula.' },
      ],
      answers: [{ label: 'Acceleration of the harrow on the trolley', value: 'a = a₁ a₂ ÷ (a₁ + a₂)', part: 'a' }, { label: 'Check with a₁ = 2 m/s² and a₂ = 3 m/s²', value: '1.2 m/s²', numeric: 1.2 }],
      explanation: 'The combined acceleration is smaller than either a₁ or a₂, as it must be: the same force moves a larger mass. It equals the reciprocal of (1 ÷ a₁ + 1 ÷ a₂).',
      commonMistakes: [{ mistake: 'Adding the accelerations (a₁ + a₂).', fix: 'Masses add, not accelerations: the combined acceleration is smaller.' }, { mistake: 'Averaging the accelerations.', fix: 'a = F ÷ (m₁ + m₂) is not the mean of a₁ and a₂.' }],
      illustrations: [{ kind: 'cart', caption: 'Numerical check: a 5 kg cart (3 kg + 2 kg) with F = 6 N accelerates at 1.2 m/s², equal to a₁a₂ ÷ (a₁ + a₂) for a₁ = 2 and a₂ = 3.', setup: c({ massKg: 5, forceA: 6 }), t: 3, graphs: true }],
      labs: [{ href: '/physics/forces/lab?experiment=L', label: 'Experiment L: the same net force on different masses' }],
      verification: V('The formula was checked numerically with the model for several force and mass combinations (automated test).'),
    },
  },
};

/** Recompute the numerical results of questions 8 and 10 to 15 from the Force Laboratory model and the equations of motion. */
export function recomputeSecondLaw(): Record<string, number> {
  const run = (o: Partial<Setup>, t: number) => sampleAtTime(c(o), t, 20);
  // Q8: two stops with the same change of momentum
  const dpGentle = momentumChangeBetween(c({ massKg: 5, forceA: 20, dirA: 'left', startVelocity: 4, pulseS: 1 }), 0, 1, 20);
  const dpAbrupt = momentumChangeBetween(c({ massKg: 5, forceA: 40, dirA: 'left', startVelocity: 4, pulseS: 0.5 }), 0, 0.5, 20);
  // Q10: F = m a at the read points of Fig. 6.40, with a from the model for a 10 N force
  const q10 = [1, 2, 4, 5].map((m) => m * run({ massKg: m, forceA: 10 }, 0).a);
  // Q11: 10 kg, from 10 m/s to 30 m/s in 8 s: force from the slope, and the model's velocity after 8 s under 25 N
  const slope = (30 - 10) / 8;
  const q11Model = run({ massKg: 10, forceA: 25, startVelocity: 10 }, 8).v;
  // Q12: bullet
  const a12 = (0 - 100 * 100) / (2 * 0.5);
  // Q13: ball
  const a13 = 800 / 0.4;
  // Q14: 2 kg, 10 m/s, 10 N against: position at the stopping time
  const q14 = run({ massKg: 2, forceA: 10, dirA: 'left', startVelocity: 10 }, 2);
  // Q15: a1 = 2, a2 = 3 with F = 6 N: combined mass 5 kg
  const q15 = run({ massKg: 5, forceA: 6 }, 0).a;
  return {
    q8Gentle: dpGentle, q8Abrupt: dpAbrupt, q10Min: Math.min(...q10), q10Max: Math.max(...q10),
    q11Slope: slope, q11Force: 10 * slope, q11ModelV: q11Model,
    q12a: a12, q12F: 0.05 * a12, q13a: a13, q13t: (108 / 3.6) / a13,
    q14x: q14.x, q14v: q14.v, q15: q15, q15Formula: combinedAcceleration(2, 3),
  };
}
