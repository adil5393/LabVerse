/**
 * Chapter 8, Unit 1 (Lessons 1 to 3): from parmanu and Dalton to the electron and Thomson's model, the gold foil experiment and
 * Rutherford's model, and Bohr's model. Aligned to NCERT Exploration (2026-27), Sections 8.1 to 8.2.3. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';

export const ATOM_LAB = '/chemistry/atom/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const A1: EduLesson = {
  id: 'ca-l1', unitId: 'ca-unit-1', number: 1, title: 'From indivisible atoms to the electron',
  objective: 'trace the idea of the atom from Kanada and Democritus to Dalton, and explain how cathode rays revealed the electron and led to Thomson’s model.',
  prerequisiteIds: ['cap-particles', 'cap-charge'],
  objectives: [
    { id: 'history', label: 'Describe early ideas of the atom and Dalton’s theory' },
    { id: 'electron', label: 'Explain how cathode rays showed that atoms contain electrons' },
    { id: 'thomson', label: 'Describe Thomson’s model and why it is neutral' },
  ],
  steps: [
    {
      id: 'ca1-roots', title: 'An old question', phase: 'observe',
      paragraphs: [
        'More than 2000 years ago Acharya Kanada in India reasoned that dividing matter again and again must end at particles that cannot be divided, which he called parmanu. In Greece, Leucippus and Democritus called such particles atomos, "indivisible". These were ideas, not experiments.',
        'In 1808 John Dalton proposed, from the experiments of his time, that all matter is made of indivisible atoms, and that the atoms of one element are alike. His theory was the first scientific description of matter.',
      ],
      vocabulary: [{ term: 'parmanu', meaning: 'Kanada’s name for the smallest indivisible particle' }],
      check: pick('chk-ca1-roots', 'How was Dalton’s atomic theory different from the ideas of Kanada and Democritus?', [['It was based on experiments', null], ['It said atoms could be divided', 'Dalton also thought atoms were indivisible.', 'dalton-divisible'], ['It was older', 'Dalton’s theory (1808) came more than 2000 years later.', 'history-order']], 'Experimental basis.', undefined, 'ca1-roots'),
    },
    {
      id: 'ca1-electron', title: 'Cathode rays and the electron', phase: 'reasoning',
      paragraphs: [
        'In 1897 J. J. Thomson passed electricity through a gas at very low pressure in a glass tube. Rays travelled from the negative electrode (cathode) to the positive one (anode). Electric and magnetic fields bent them in a way that showed they were streams of negatively charged particles, much lighter than atoms: electrons.',
        'The rays were the same whatever the cathode metal or the gas, so electrons must be part of every atom. Atoms are not indivisible after all. The electron’s charge is taken as −1.',
      ],
      check: pick('chk-ca1-electron', 'Why did Thomson conclude that every atom contains electrons?', [['The rays were the same for every cathode material and gas', null], ['The rays were very bright', 'Brightness says nothing about what atoms contain.', 'irrelevant-evidence'], ['Electrons are heavier than atoms', 'Electrons are much lighter than atoms.', 'electron-heavy']], 'Independent of the material.', undefined, 'ca1-electron'),
    },
    {
      id: 'ca1-thomson', title: 'Thomson’s model', phase: 'conjecture',
      paragraphs: [
        'Atoms are neutral, so if they contain negative electrons, they must also contain positive charge. Thomson pictured the atom as a sphere of positive charge with electrons spread through it, like seeds in a watermelon (or plums in a pudding). The total positive and negative charges are equal, so the atom is neutral.',
        'It was the first serious attempt to describe how the charges in an atom balance, and the next experiment tested it.',
      ],
      visual: v('atomModel', { model: 'thomson' }, 'Thomson’s model: a sphere of positive charge with electrons spread throughout it, like seeds in a watermelon.'),
      check: pick('chk-ca1-thomson', 'In Thomson’s model, why is the atom neutral?', [['The positive sphere’s charge equals the total charge of the electrons', null], ['The electrons have no charge', 'Electrons are negative.', 'electron-neutral'], ['There is no positive charge', 'Then the atom would be negative overall.', 'no-positive']], 'Charges balance.', undefined, 'ca1-thomson'),
    },
  ],
  investigation: { title: 'Compare atomic models in the Atom Laboratory', description: 'Switch between Thomson’s and later models.', href: `${ATOM_LAB}?view=models`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l1', title: 'A clay and bead model',
    given: ['A student models an atom with positively charged clay and 6 beads, each carrying charge −1.'],
    ask: 'What positive charge must the clay carry for a neutral atom, and what if it carries +5?',
    steps: [
      { text: 'Total negative charge = 6 × (−1) = −6.', why: 'Each electron (bead) is −1.' },
      { text: 'For a neutral atom the clay must carry +6.', why: 'Neutral means the positive and negative charges cancel.' },
      { text: 'With +5 the total is +5 − 6 = −1: the model is negatively charged, not a neutral atom.', why: 'There is one more unit of negative than positive charge.' },
    ],
    verify: '+6 − 6 = 0: neutral.',
  },
  guided: {
    id: 'g-ca-l1', prompt: 'Put the ideas about atoms in order and test Thomson’s reasoning.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('ca-g1-1', 'Order these from earliest to latest.', [{ id: 'a', text: 'Kanada and Democritus: indivisible particles', needs: [] }, { id: 'b', text: 'Dalton: atomic theory from experiments', needs: ['a'] }, { id: 'c', text: 'Thomson: the electron', needs: ['b'] }], ['c', 'a', 'b'], 'Ancient ideas, Dalton (1808), Thomson (1897).'), hints: ['The ancient thinkers came first.'] },
      { id: 'g2', prompt: 'Charge.', question: num('ca-g1-2', 'An atom in Thomson’s model has 8 electrons. What positive charge must the sphere carry, in units of the electron’s charge?', 8, '+8 balances 8 × (−1).', { rules: [[[-8], 'That is the electrons’ total. The sphere carries the opposite charge.', 'sign-slip']] }), hints: ['Neutral means total charge 0.'] },
    ],
    conclusion: 'Ideas of the atom are ancient; experiments came with Dalton; the electron showed that atoms have parts.',
  },
  independent: [
    ind('i1', 'History', 'history', 'Meaning.', pick('ca-l1-i1', 'The Greek word atomos means…', [['indivisible', null], ['tiny', 'It means "cannot be cut", indivisible.', 'word-meaning']], 'Indivisible.'), ['Think "cannot be cut".'], ['Atomos: indivisible.']),
    ind('i2', 'Electron', 'electron', 'Cathode rays.', pick('ca-l1-i2', 'Cathode rays bend towards a positive plate. This shows they are…', [['negatively charged', null], ['positively charged', 'Positive particles would be pushed away from a positive plate.', 'unlike-repel'], ['uncharged', 'Uncharged rays would not bend in an electric field.', 'electron-neutral']], 'Attracted to positive.'), ['Unlike charges attract.'], ['They are attracted to + so they are negative.']),
    ind('i3', 'Thomson', 'thomson', 'Analogy.', pick('ca-l1-i3', 'In the watermelon picture of Thomson’s model, what do the seeds stand for?', [['Electrons', null], ['The positive charge', 'The red pulp is the spread-out positive charge.', 'part-swap'], ['The nucleus', 'Thomson’s model has no nucleus.', 'thomson-nucleus']], 'Seeds = electrons.'), ['Pulp vs seeds.'], ['Seeds are the electrons; pulp is the positive charge.']),
    ind('i4', 'Electron', 'electron', 'Divisible.', pick('ca-l1-i4', 'What did the discovery of the electron show about Dalton’s idea?', [['Atoms are not indivisible: they contain smaller particles', null], ['Dalton was right that atoms cannot be divided', 'Electrons come out of atoms, so atoms have parts.', 'dalton-divisible']], 'Atoms have parts.'), ['Where do electrons come from?'], ['Electrons come from atoms, so atoms are divisible.']),
  ],
  reflection: {
    discover: 'The atom began as an idea, became Dalton’s scientific theory, and was opened up by the electron; Thomson balanced the electrons’ charge with a positive sphere.',
    evidence: 'You ordered the ideas, explained the evidence for electrons and balanced charges in a model.',
    stillConfusing: [
      { text: 'How did cathode rays show electrons are in all atoms?', refresherId: 'ca1-electron' },
      { text: 'Why is Thomson’s atom neutral?', refresherId: 'ca1-thomson' },
    ],
  },
};

export const A2: EduLesson = {
  id: 'ca-l2', unitId: 'ca-unit-1', number: 2, title: 'The gold foil experiment and the nucleus',
  objective: 'describe the gold foil experiment, explain how its results ruled out Thomson’s model and led to Rutherford’s nuclear model, and state that model’s limitation.',
  prerequisiteIds: ['cap-charge', 'cap-powers'],
  objectives: [
    { id: 'results', label: 'Describe the three results of the gold foil experiment' },
    { id: 'conclusions', label: 'Link each result to a conclusion about the atom' },
    { id: 'limit', label: 'Explain why Rutherford’s model could not explain stability' },
  ],
  steps: [
    {
      id: 'ca2-test', title: 'Testing Thomson’s model', phase: 'conjecture',
      paragraphs: [
        'In 1911 Geiger and Marsden, working with Ernest Rutherford, fired a narrow beam of alpha (α) particles, which are small and positively charged, at a very thin gold foil.',
        'If Thomson were right, the positive charge would be spread thinly everywhere, so every α particle should pass through with at most a tiny deflection.',
      ],
      prediction: { id: 'pr-ca2-foil', prompt: 'Predict: what will happen to the α particles?', options: [{ id: 'p1', text: 'All pass through almost straight' }, { id: 'p2', text: 'Most pass straight, a few are deflected a lot, and a very few bounce back' }, { id: 'p3', text: 'Most bounce back' }], expectedId: 'p2', reveal: 'Most went straight through, some were deflected through large angles, and about one in many thousands bounced back. Thomson’s model could not explain the large deflections.' },
      visual: v('goldFoil', { model: 'rutherford', editable: true }, 'An α-particle beam hitting a thin gold foil. Most particles pass straight through, a few are deflected through large angles and a very few bounce back.'),
      check: pick('chk-ca2-test', 'Which result could Thomson’s model NOT explain?', [['A few α particles bounced back', null], ['Most α particles passed straight through', 'Thomson’s model also predicts small deflections; the surprise was the large ones.', 'which-result']], 'The large deflections.', undefined, 'ca2-test'),
    },
    {
      id: 'ca2-nucleus', title: 'Rutherford’s conclusions', phase: 'reasoning',
      paragraphs: [
        'Most particles went straight through: so most of the atom is empty space. A few were deflected sharply and some bounced back: so they met something small, very dense and positive. Rutherford called it the nucleus. It holds all the positive charge and nearly all the mass.',
        'Electrons move around the nucleus, a little like planets around the Sun (the planetary model). The atom is about 10⁻¹⁰ m across and the nucleus about 10⁻¹⁵ m: 10⁵ (one lakh) times smaller. If an atom were a cricket ground, the nucleus would be a peppercorn at the centre.',
      ],
      visual: v('atomModel', { model: 'rutherford' }, 'Rutherford’s planetary model: a tiny dense positive nucleus at the centre with electrons moving around it, and mostly empty space.'),
      check: pick('chk-ca2-nucleus', 'Which observation shows that most of an atom is empty space?', [['Most α particles passed through undeflected', null], ['A few bounced back', 'That shows the nucleus is dense and positive.', 'which-result']], 'Most passed straight.', undefined, 'ca2-nucleus'),
    },
    {
      id: 'ca2-limit', title: 'A problem with stability', phase: 'reasoning',
      paragraphs: [
        'An electron moving in a circle keeps changing direction, so it is accelerating (Chapter 4). A charged particle accelerating like this should lose energy, spiral inwards and fall into the nucleus. Atoms would collapse.',
        'But atoms are stable, so Rutherford’s model could not be the whole story. Rutherford also showed that the nucleus’s positive charge is carried by protons, with charge +1 each; in a neutral atom, protons = electrons.',
      ],
      check: pick('chk-ca2-limit', 'What could Rutherford’s model not explain?', [['Why the electrons do not spiral into the nucleus', null], ['Why α particles bounced back', 'That is exactly what his model explained.', 'which-result']], 'Stability.', undefined, 'ca2-limit'),
    },
  ],
  investigation: { title: 'Run the gold foil experiment', description: 'Compare Thomson’s and Rutherford’s predictions, and try a thicker foil.', href: `${ATOM_LAB}?view=foil`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l2', title: 'How many atoms thick is a page?',
    given: ['An atom is about 10⁻¹⁰ m across.', 'A sheet of paper is about 0.1 mm = 10⁻⁴ m thick.'],
    ask: 'About how many atoms, stacked, make the thickness of the sheet?',
    steps: [
      { text: 'Number ≈ thickness ÷ size of one atom = 10⁻⁴ ÷ 10⁻¹⁰.', why: 'Stacking atoms end to end.' },
      { text: '10⁻⁴ ÷ 10⁻¹⁰ = 10⁶, about a million atoms.', why: 'Subtract the powers: −4 − (−10) = 6.' },
    ],
    verify: '10⁶ × 10⁻¹⁰ m = 10⁻⁴ m.',
  },
  guided: {
    id: 'g-ca-l2', prompt: 'Link each observation of the gold foil experiment to a conclusion.',
    steps: [
      { id: 'g1', prompt: 'Large deflections.', question: pick('ca-g2-1', 'Some α particles were deflected through large angles. What does this show?', [['The positive charge is concentrated in a tiny region', null], ['The atom is mostly empty', 'That comes from the particles that passed straight.', 'which-result']], 'Concentrated positive charge.', undefined, 'ca2-nucleus'), hints: ['A big push needs a lot of charge close together.'] },
      { id: 'g2', prompt: 'Sizes.', question: num('ca-g2-2', 'The atom is about 10⁻¹⁰ m across and the nucleus about 10⁻¹⁵ m. How many times bigger is the atom?', 100000, '10⁻¹⁰ ÷ 10⁻¹⁵ = 10⁵.', { rules: [[[5], '5 is the power. 10⁵ = 100 000.', 'power-not-value']] }), hints: ['Divide: subtract the powers.'] },
    ],
    conclusion: 'A tiny, dense, positive nucleus explains the large deflections; it is about 10⁵ times smaller than the atom.',
  },
  independent: [
    ind('i1', 'Results', 'results', 'Most particles.', pick('ca-l2-i1', 'In the gold foil experiment, most α particles…', [['passed through without deflection', null], ['bounced back', 'Only a very few bounced back.', 'which-result']], 'Most passed straight.'), ['Most, not a few.'], ['Most went straight through.']),
    ind('i2', 'Conclusions', 'conclusions', 'Thicker foil.', pick('ca-l2-i2', 'If the foil were made thicker, what would you expect?', [['More α particles deflected, because each meets more nuclei', null], ['Fewer deflections', 'More layers of atoms mean more chances of passing close to a nucleus.', 'thicker-fewer']], 'More chances to meet a nucleus.'), ['More layers of atoms.'], ['More nuclei in the path: more deflections.']),
    ind('i3', 'Conclusions', 'conclusions', 'Negative particles.', pick('ca-l2-i3', 'If negatively charged particles were fired instead of α particles, how would the nucleus affect them?', [['It would attract them, bending them towards it', null], ['It would repel them in the same way', 'Unlike charges attract.', 'unlike-repel']], 'Attraction.'), ['Nucleus is positive.'], ['Negative particles are attracted by the positive nucleus.']),
    ind('i4', 'Limitation', 'limit', 'Stability.', pick('ca-l2-i4', 'Why should an electron orbiting a nucleus lose energy, according to the physics Rutherford used?', [['It is accelerating because its direction keeps changing', null], ['It is moving at a constant velocity', 'In a circle the direction changes, so the velocity changes.', 'circle-constant-velocity']], 'Circular motion is accelerated.'), ['Chapter 4: uniform circular motion.'], ['Changing direction means acceleration; an accelerating charge loses energy.']),
  ],
  reflection: {
    discover: 'Most α particles passing straight means mostly empty space; large deflections mean a tiny, dense, positive nucleus; but an orbiting electron should lose energy, so the model could not explain stability.',
    evidence: 'You linked each observation to a conclusion and compared sizes with powers of ten.',
    stillConfusing: [
      { text: 'What did the experiment show?', refresherId: 'ca2-nucleus' },
      { text: 'Why was Rutherford’s model unstable?', refresherId: 'ca2-limit' },
    ],
  },
};

export const A3: EduLesson = {
  id: 'ca-l3', unitId: 'ca-unit-1', number: 3, title: 'Bohr’s model: shells and energy levels',
  objective: 'state the main ideas of Bohr’s model, explain how it solves the stability problem, and name the shells K, L, M, N.',
  prerequisiteIds: ['cap-charge'],
  objectives: [
    { id: 'postulates', label: 'State Bohr’s ideas about shells and energy' },
    { id: 'stability', label: 'Explain how Bohr’s model accounts for stable atoms' },
  ],
  steps: [
    {
      id: 'ca3-shells', title: 'Fixed shells', phase: 'observe',
      paragraphs: [
        'In 1913 Niels Bohr proposed that electrons can move only in certain fixed circular paths around the nucleus, called orbits, shells or energy levels. They are named K, L, M, N… or numbered n = 1, 2, 3, 4…, starting from the nucleus.',
        'Each shell has a definite energy. K (n = 1), nearest the nucleus, has the least; energy increases outwards. An electron cannot be between shells.',
      ],
      visual: v('atomModel', { model: 'bohr' }, 'Bohr’s model: a nucleus surrounded by circular shells labelled K (n = 1), L (n = 2), M (n = 3) and N (n = 4).'),
      vocabulary: [{ term: 'energy level', meaning: 'a shell in which an electron has a definite energy' }],
      check: pick('chk-ca3-shells', 'Which shell has the lowest energy?', [['K (n = 1)', null], ['N (n = 4)', 'Energy increases away from the nucleus; N is the highest of these.', 'energy-order']], 'K is closest to the nucleus.', undefined, 'ca3-shells'),
    },
    {
      id: 'ca3-stable', title: 'Why atoms do not collapse', phase: 'reasoning',
      paragraphs: [
        'Bohr stated, as a postulate, that while an electron stays in one of these shells it does not lose energy. Its energy stays constant even though it is moving. So it does not spiral into the nucleus, and the atom is stable.',
        'An electron can jump to another shell only by absorbing or giving out exactly the difference in energy between the two shells.',
      ],
      check: pick('chk-ca3-stable', 'How does Bohr’s model explain that atoms are stable?', [['Electrons in allowed shells do not lose energy', null], ['Electrons do not move at all', 'In Bohr’s model electrons still move around the nucleus.', 'electrons-still'], ['There is no attraction between electrons and the nucleus', 'The attraction keeps electrons near the nucleus.', 'no-attraction']], 'Stationary states.', undefined, 'ca3-stable'),
    },
    {
      id: 'ca3-beyond', title: 'Models keep improving', phase: 'apply',
      paragraphs: [
        'Bohr’s model explained many observations, yet it too was later refined: today electrons are described by "clouds" showing where they are likely to be (the quantum mechanical model, studied in higher classes).',
        'Each model was kept until new evidence demanded a better one: Dalton → Thomson → Rutherford → Bohr → modern.',
      ],
      check: pick('chk-ca3-beyond', 'Why did scientists keep changing atomic models?', [['New experiments gave results the old model could not explain', null], ['Scientists liked new names', 'Models change because of evidence.', 'fashion']], 'Evidence drives change.', undefined, 'ca3-beyond'),
    },
  ],
  investigation: { title: 'Compare the models', description: 'See Thomson’s, Rutherford’s and Bohr’s pictures side by side.', href: `${ATOM_LAB}?view=models`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l3', title: 'Rutherford and Bohr compared',
    given: ['Both models have electrons moving around a nucleus.'],
    ask: 'Why does Rutherford’s model fail on stability while Bohr’s succeeds?',
    steps: [
      { text: 'Rutherford: the orbiting electron accelerates and should lose energy, so it would spiral in.', why: 'That follows from the physics of moving charges.' },
      { text: 'Bohr: in an allowed shell, the electron’s energy is constant, so it does not spiral in.', why: 'Bohr’s postulate of stationary states.' },
    ],
    verify: 'Bohr’s model matches the fact that atoms are stable.',
  },
  guided: {
    id: 'g-ca-l3', prompt: 'Check each statement against Bohr’s model.',
    steps: [
      { id: 'g1', prompt: 'Between shells.', question: pick('ca-g3-1', '"Electrons can be found between energy levels." According to Bohr this is…', [['incorrect', null], ['correct', 'Bohr allows electrons only in the fixed shells.', 'between-shells']], 'Only in shells.', undefined, 'ca3-shells'), hints: ['Allowed paths only.'] },
      { id: 'g2', prompt: 'Order the models.', question: ord('ca-g3-2', 'Put the models in order.', [{ id: 'd', text: 'Dalton', needs: [] }, { id: 't', text: 'Thomson', needs: ['d'] }, { id: 'r', text: 'Rutherford', needs: ['t'] }, { id: 'b', text: 'Bohr', needs: ['r'] }], ['r', 'b', 'd', 't'], 'Dalton, Thomson, Rutherford, Bohr.'), hints: ['Each tested the one before.'] },
    ],
    conclusion: 'Electrons occupy fixed shells only; the order of models is Dalton, Thomson, Rutherford, Bohr.',
  },
  independent: [
    ind('i1', 'Postulates', 'postulates', 'Naming.', pick('ca-l3-i1', 'The shell with n = 3 is called…', [['M', null], ['L', 'L is the second shell, n = 2.', 'shell-letter'], ['N', 'N is the fourth shell, n = 4.', 'shell-letter']], 'K, L, M.'), ['K = 1.'], ['K = 1, L = 2, M = 3.']),
    ind('i2', 'Postulates', 'postulates', 'Jumping.', pick('ca-l3-i2', 'An electron moves from the K shell to the L shell. It must…', [['absorb exactly the energy difference', null], ['give out energy', 'Moving outwards needs energy; moving inwards gives it out.', 'energy-order']], 'Absorb energy.'), ['L is higher in energy.'], ['Higher level: energy absorbed.']),
    ind('i3', 'Stability', 'stability', 'Statement.', pick('ca-l3-i3', '"Electrons lose energy in fixed orbits and slowly fall into the nucleus." According to Bohr this is…', [['incorrect', null], ['correct', 'In Bohr’s stationary states the energy stays constant.', 'electrons-still']], 'No energy loss.'), ['Stationary states.'], ['Incorrect: no energy is lost in a fixed shell.']),
  ],
  reflection: {
    discover: 'Bohr placed electrons in fixed shells (K, L, M, N) of definite energy in which they do not lose energy, which explains why atoms are stable.',
    evidence: 'You compared the models and judged statements against Bohr’s ideas.',
    stillConfusing: [
      { text: 'What are shells and energy levels?', refresherId: 'ca3-shells' },
      { text: 'How does Bohr explain stability?', refresherId: 'ca3-stable' },
    ],
  },
};
