/**
 * Chapter 3, Units 2 and 3 (Lessons 4 to 6): connective tissue, muscular and nervous tissue, and the musculoskeletal system
 * with joints and the skeleton. Aligned to NCERT Exploration (2026-27) Sections 3.3.2 to 3.6, Activities 3.2 to 3.5 and
 * Tables 3.3 to 3.5. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';
import { TISSUE_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const T4: EduLesson = {
  id: 'bt-l4', unitId: 'bt-unit-2', number: 4, title: 'Connective tissue: blood, bone and their links',
  objective: 'explain how a matrix makes blood fluid and bone hard, describe the components of blood, and distinguish cartilage, tendons and ligaments.',
  prerequisiteIds: ['btp-organisation'],
  objectives: [
    { id: 'matrix', label: 'Explain the role of the matrix in connective tissue' },
    { id: 'blood', label: 'Describe plasma, red cells, white cells and platelets' },
    { id: 'links', label: 'Distinguish bone, cartilage, tendons and ligaments' },
  ],
  steps: [
    {
      id: 'bt4-matrix', title: 'Two very different connective tissues', phase: 'reasoning',
      paragraphs: [
        'Blood connects every part of the body by carrying nutrients, gases and hormones; bones connect and support the body from head to toe. Both are connective tissues, which connect and support other tissues.',
        'Blood is fluid and bone is hard because of the matrix, the material between the cells. In blood it is watery plasma; in bone it is a rigid matrix of calcium and phosphorus compounds.',
      ],
      check: pick('chk-bt4-matrix', 'Blood and bone are both connective tissues but feel completely different. Why?', [['Their matrices differ: liquid plasma versus a hard mineral matrix', null], ['Blood has no cells', 'Blood is full of cells: red cells, white cells and platelets.', 'blood-cells'], ['Bone is not a tissue', 'Bone is a connective tissue.', 'tissue-list']], 'The matrix.', undefined, 'bt4-matrix'),
    },
    {
      id: 'bt4-blood', title: 'What is in blood', phase: 'observe',
      paragraphs: [
        'Plasma makes up about 55 % of blood’s volume; the cells and platelets about 45 %. Red blood cells contain haemoglobin, an iron-rich protein that carries oxygen and gives blood its colour; they live about four months and are replaced regularly.',
        'Platelets help blood clot at a cut. White blood cells gather at an infection and fight it, which can cause redness, swelling and pus. During exercise muscles need more oxygen, so breathing and blood flow increase.',
      ],
      visual: v('animalTissues', { group: 'connective', editable: true }, 'Connective tissues: blood with its components, bone, cartilage, tendon and ligament, each with the action that lets you feel it.'),
      check: pick('chk-bt4-blood', 'Which part of blood helps stop bleeding from a cut?', [['Platelets', null], ['Red blood cells', 'Red blood cells carry oxygen.', 'blood-part'], ['White blood cells', 'White blood cells fight infection.', 'blood-part']], 'Clotting.', undefined, 'bt4-blood'),
    },
    {
      id: 'bt4-links', title: 'Cartilage, tendons and ligaments', phase: 'apply',
      paragraphs: [
        'Touch your elbow: bone is hard and rigid. Fold your ear or press your nose: cartilage is soft and flexible and springs back; it cushions the ends of bones.',
        'Wiggle your fingers and feel your forearm move: tendons connect muscle to bone and pass on the muscle’s pull. Lift your leg until the knee stops: ligaments connect bone to bone, limit movement and prevent dislocation.',
      ],
      check: pick('chk-bt4-links', 'A ligament connects…', [['bone to bone', null], ['muscle to bone', 'That is a tendon.', 'tendon-ligament'], ['muscle to muscle', 'Neither tendons nor ligaments do this.', 'tendon-ligament']], 'Bone to bone.', undefined, 'bt4-links'),
    },
  ],
  investigation: { title: 'Explore connective tissues', description: 'See the matrix and job of each connective tissue.', href: `${TISSUE_LAB}?view=animal`, buttonLabel: 'Open animal tissues' },
  worked: {
    id: 'w-bt-l4', title: 'Blood volume',
    given: ['An adult has about 5 litres of blood.', 'Plasma is about 55 % of the volume.'],
    ask: 'Estimate the volume of plasma and of the cells and platelets.',
    steps: [
      { text: 'Plasma ≈ 5 × 55 ÷ 100 = 2.75 litres.', why: 'A percentage of a total is total × percent ÷ 100.' },
      { text: 'Cells and platelets ≈ 5 − 2.75 = 2.25 litres (45 %).', why: 'The two parts make up the whole.' },
    ],
    verify: '2.75 + 2.25 = 5 litres; 55 % + 45 % = 100 %.',
  },
  guided: {
    id: 'g-bt-l4', prompt: 'Name the connective tissue.',
    steps: [
      { id: 'g1', prompt: 'Tendon.', question: pick('bt-g4-1', 'The tough cord you feel behind your ankle when you point your toes joins the calf muscle to the heel bone. It is a…', [['tendon', null], ['ligament', 'A ligament joins bone to bone; this joins muscle to bone.', 'tendon-ligament'], ['cartilage', 'Cartilage cushions bone ends; it is not a cord joining muscle to bone.', 'tissue-swap']], 'Muscle to bone.'), hints: ['What does it join?'] },
      { id: 'g2', prompt: 'Blood.', question: num('bt-g4-2', 'A 4-litre blood sample is 55 % plasma. How many litres of plasma is that?', 2.2, '4 × 0.55 = 2.2 litres.', { unit: 'litres', rules: [[[1.8], 'That is the 45 % made of cells and platelets.', 'part-swap']] }), hints: ['4 × 55 ÷ 100.'] },
    ],
    conclusion: 'Tendons join muscle to bone; ligaments join bone to bone; plasma is a little over half of blood.',
  },
  independent: [
    ind('i1', 'Haemoglobin', 'blood', 'Colour.', pick('bt-l4-i1', 'Blood is red because red blood cells contain…', [['haemoglobin, an iron-rich protein', null], ['platelets', 'Platelets are fragments that help clotting.', 'blood-part'], ['plasma', 'Plasma is the pale liquid part.', 'blood-part']], 'Haemoglobin.'), ['Iron-rich.'], ['Haemoglobin.']),
    ind('i2', 'Cartilage', 'links', 'Ear.', pick('bt-l4-i2', 'Your ear can be folded and springs back. It is supported by…', [['cartilage', null], ['bone', 'Bone is rigid and would not fold.', 'tissue-swap'], ['tendon', 'Tendons join muscle to bone.', 'tendon-ligament']], 'Soft and flexible.'), ['Flexible but keeps shape.'], ['Cartilage.']),
    ind('i3', 'Assertion', 'links', 'Tendons.', pick('bt-l4-i3', 'Claim: "Tendons connect bone to bone and allow joint movement." This is…', [['false: tendons connect muscle to bone; ligaments connect bone to bone', null], ['true', 'Bone-to-bone links are ligaments, not tendons.', 'tendon-ligament']], 'Check the definition.'), ['What do tendons join?'], ['The claim describes ligaments; tendons join muscle to bone.']),
    ind('i4', 'Infection', 'blood', 'Pus.', pick('bt-l4-i4', 'An infected cut becomes red and swollen with pus. Which blood cells collected there?', [['White blood cells', null], ['Red blood cells', 'Red cells carry oxygen; fighting infection is the job of white cells.', 'blood-part']], 'Defence.'), ['Which cells fight germs?'], ['White blood cells.']),
  ],
  reflection: {
    discover: 'Connective tissues connect and support; their matrix makes them fluid like blood or hard like bone, and tendons, ligaments and cartilage link and cushion the skeleton.',
    evidence: 'You named blood components, estimated plasma volume and distinguished tendons from ligaments.',
    stillConfusing: [
      { text: 'Tendon or ligament?', refresherId: 'bt4-links' },
      { text: 'What does each part of blood do?', refresherId: 'bt4-blood' },
    ],
  },
};

export const T5: EduLesson = {
  id: 'bt-l5', unitId: 'bt-unit-2', number: 5, title: 'Muscles and nerves',
  objective: 'compare skeletal, smooth and cardiac muscle by control, shape, nuclei and striations, and describe how a neuron receives and passes on messages.',
  prerequisiteIds: ['btp-cells'],
  objectives: [
    { id: 'muscles', label: 'Compare the three kinds of muscle' },
    { id: 'neuron', label: 'Name the parts of a neuron and their jobs' },
  ],
  steps: [
    {
      id: 'bt5-muscles', title: 'Three kinds of muscle', phase: 'reasoning',
      paragraphs: [
        'Running, writing and lifting are voluntary movements, made by skeletal muscles attached to the skeleton. Their fibres are long, cylindrical, unbranched, have many nuclei and show light and dark bands (striations).',
        'Food moving through the intestine and the beating heart are involuntary. Smooth muscle in the stomach and intestine has spindle-shaped cells, one nucleus each and no striations, and makes slow, steady movements. Cardiac muscle, found only in the heart, has branched, cylindrical fibres with one nucleus and faint striations; it contracts rhythmically all through life without tiring.',
      ],
      visual: v('animalTissues', { group: 'muscle', editable: true }, 'Skeletal, smooth and cardiac muscle side by side, with their shape, nuclei, striations and control.'),
      check: pick('chk-bt5-muscles', 'Branched fibres with one nucleus and faint striations are…', [['cardiac muscle', null], ['skeletal muscle', 'Skeletal fibres are unbranched with many nuclei.', 'muscle-swap'], ['smooth muscle', 'Smooth muscle cells are spindle-shaped without striations.', 'muscle-swap']], 'Heart muscle.', undefined, 'bt5-muscles'),
    },
    {
      id: 'bt5-neuron', title: 'The neuron', phase: 'reasoning',
      paragraphs: [
        'Pulling your hand from a hot pan or remembering a song involves nervous tissue, the body’s control network; the brain is the control centre. Muscles act on instructions from nerves: during exercise, the brain signals the heart to beat faster.',
        'A neuron has a cell body with the nucleus; dendrites that receive signals from other neurons; and a long axon that carries the message away and ends in axon terminals, which pass it on to other cells.',
      ],
      check: pick('chk-bt5-neuron', 'Which part of a neuron receives signals from other neurons?', [['Dendrites', null], ['Axon', 'The axon carries the message away from the cell body.', 'neuron-part'], ['Axon terminals', 'Terminals pass the message on to the next cell.', 'neuron-part']], 'Dendrites.', undefined, 'bt5-neuron'),
    },
  ],
  investigation: { title: 'Identify muscle types', description: 'Compare the three muscles and the parts of a neuron.', href: `${TISSUE_LAB}?view=animal`, buttonLabel: 'Open animal tissues' },
  worked: {
    id: 'w-bt-l5', title: 'Why the heart never tires',
    given: ['Cardiac muscle contracts about 70 times a minute for a whole lifetime.'],
    ask: 'Explain why it can work without fatigue, and why it is involuntary.',
    steps: [
      { text: 'Cardiac muscle cells have many mitochondria and a rich blood supply.', why: 'Mitochondria release energy as ATP; blood brings a constant supply of oxygen and glucose.' },
      { text: 'It is involuntary: we cannot stop our heart at will; nerves adjust its rate automatically.', why: 'Life depends on the heart never pausing.' },
    ],
    verify: 'Constant energy supply explains no fatigue; automatic control explains involuntary.',
  },
  guided: {
    id: 'g-bt-l5', prompt: 'Order a message and classify movements.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bt-g5-1', 'Order the path of a message through one neuron.', [{ id: 'a', text: 'Dendrites receive the signal', needs: [] }, { id: 'b', text: 'Cell body', needs: ['a'] }, { id: 'c', text: 'Axon carries it', needs: ['b'] }, { id: 'd', text: 'Axon terminals pass it on', needs: ['c'] }], ['c', 'd', 'b', 'a'], 'Dendrites, cell body, axon, terminals.'), hints: ['In through dendrites, out through the axon.'] },
      { id: 'g2', prompt: 'Movement.', question: pick('bt-g5-2', 'Food being pushed along the intestine is moved by…', [['smooth muscle, involuntarily', null], ['skeletal muscle, voluntarily', 'We do not consciously push food through the gut.', 'muscle-swap']], 'Gut muscle.'), hints: ['Can you control it?'] },
    ],
    conclusion: 'Messages go dendrites → cell body → axon → terminals; gut movements are involuntary smooth muscle.',
  },
  independent: [
    ind('i1', 'Skeletal muscle', 'muscles', 'Nuclei.', pick('bt-l5-i1', 'Skeletal muscle fibres have…', [['many nuclei and striations', null], ['one nucleus and no striations', 'That describes smooth muscle.', 'muscle-swap']], 'Multinucleate, striated.'), ['Think of the biceps.'], ['Many nuclei; striated.']),
    ind('i2', 'Voluntary', 'muscles', 'Writing.', pick('bt-l5-i2', 'Writing with a pen uses…', [['skeletal muscle, which is voluntary', null], ['cardiac muscle', 'Cardiac muscle is only in the heart.', 'muscle-swap'], ['smooth muscle', 'Smooth muscle is in organs like the gut and is involuntary.', 'muscle-swap']], 'Under your control.'), ['Can you decide to do it?'], ['Skeletal, voluntary.']),
    ind('i3', 'Axon', 'neuron', 'Job.', pick('bt-l5-i3', 'The long fibre of a neuron that carries messages away from the cell body is the…', [['axon', null], ['dendrite', 'Dendrites bring messages in.', 'neuron-part']], 'The axon carries messages away.'), ['Long and outgoing.'], ['Axon.']),
  ],
  reflection: {
    discover: 'Skeletal muscle is voluntary, striated and multinucleate; smooth and cardiac muscle are involuntary; neurons receive by dendrites and send along axons.',
    evidence: 'You identified muscles from their features and ordered a message through a neuron.',
    stillConfusing: [
      { text: 'Which muscle is which?', refresherId: 'bt5-muscles' },
      { text: 'Parts of a neuron', refresherId: 'bt5-neuron' },
    ],
  },
};

export const T6: EduLesson = {
  id: 'bt-l6', unitId: 'bt-unit-3', number: 6, title: 'The musculoskeletal system and joints',
  objective: 'explain how muscles, tendons and bones produce movement at joints, classify ball and socket, hinge, pivot and fixed joints by the movement they allow, and describe the protective roles of the skull, backbone and rib cage.',
  prerequisiteIds: ['btp-transport'],
  objectives: [
    { id: 'system', label: 'Explain how the musculoskeletal system produces movement' },
    { id: 'joints', label: 'Classify joints by the movement they allow' },
    { id: 'skeleton', label: 'Describe the skull, backbone and rib cage' },
  ],
  steps: [
    {
      id: 'bt6-system', title: 'Muscles pull bones', phase: 'reasoning',
      paragraphs: [
        'The musculoskeletal system is made of bones, muscles, joints, cartilage, tendons and ligaments. It lets us stand upright, move, keep our posture and protects delicate organs, under the control of the nervous system.',
        'A joint lets bones move but cannot move them itself. When a muscle contracts, its tendon passes the pull to a bone, which moves at a joint. The adult skeleton is about 12 to 15 % of body weight.',
      ],
      check: pick('chk-bt6-system', 'What actually moves a bone at a joint?', [['A muscle contracting and pulling through its tendon', null], ['The joint pushing the bone', 'Joints allow movement; they cannot move bones on their own.', 'joint-moves'], ['Ligaments shortening', 'Ligaments hold bones together and limit movement.', 'tendon-ligament']], 'Muscle pull.', undefined, 'bt6-system'),
    },
    {
      id: 'bt6-joints', title: 'Four kinds of joint', phase: 'observe',
      paragraphs: [
        'Move your shoulder in a full circle: the rounded top of the arm bone sits in a hollow of the shoulder bone, a ball and socket joint (also at the hip). Bend your elbow: it moves one way only, like a door hinge; the knee is a hinge joint too, protected by the kneecap.',
        'Shake your head "no": the skull turns on the backbone at a pivot joint. The skull bones themselves are joined by fixed joints, which cannot move and keep the brain safe.',
      ],
      prediction: { id: 'pr-bt6-joints', prompt: 'Predict: which can rotate in a full circle?', options: [{ id: 'p1', text: 'The elbow' }, { id: 'p2', text: 'The shoulder' }, { id: 'p3', text: 'The knee' }], expectedId: 'p2', reveal: 'Only the shoulder (a ball and socket joint) can make a full circle. The elbow and knee are hinges that only bend.' },
      visual: v('joints', { joint: 'ball-socket', editable: true }, 'Four joints, ball and socket, hinge, pivot and fixed: choose one and try each movement to see whether it is allowed.'),
      check: pick('chk-bt6-joints', 'When you bend your knees to jump, which joint is used?', [['Hinge joint', null], ['Ball and socket joint', 'The knee bends in one plane only; ball and socket joints are the shoulder and hip.', 'joint-swap'], ['Pivot joint', 'The pivot joint is where the skull turns on the backbone.', 'joint-swap']], 'Knee: hinge.', undefined, 'bt6-joints'),
    },
    {
      id: 'bt6-skeleton', title: 'Skull, backbone and rib cage', phase: 'reasoning',
      paragraphs: [
        'The skull is a hard case of flat bones protecting the brain, eyes and ears. From its base runs the backbone (vertebral column), a chain of small bones called vertebrae, with discs of cartilage between them that cushion and let us bend without harming the spinal cord.',
        'Twelve pairs of ribs form the rib cage, joined to the backbone and to the breastbone by flexible cartilage. It protects the heart and lungs, and its flexibility lets the chest expand and contract as we breathe. Exercise, yoga, good posture and nutrition keep bones, muscles and joints healthy.',
      ],
      check: pick('chk-bt6-skeleton', 'Why can the rib cage move during breathing even though it protects organs?', [['Its ribs are joined by flexible cartilage', null], ['Ribs are made of muscle', 'Ribs are bones; the cartilage joints give flexibility.', 'tissue-swap'], ['It has a ball and socket joint at every rib', 'Ribs connect to the spine and breastbone, with flexible cartilage, not ball and socket joints.', 'joint-swap']], 'Cartilage.', undefined, 'bt6-skeleton'),
    },
  ],
  investigation: { title: 'Test the four joints', description: 'Try bending, turning and circling at each joint.', href: `${TISSUE_LAB}?view=joints`, buttonLabel: 'Open the joint explorer' },
  worked: {
    id: 'w-bt-l6', title: 'Bones and muscles in a 50 kg student',
    given: ['Body mass 50 kg.', 'Bone about 12 to 15 % of body mass.', 'Muscle about 35 % (an illustrative value).'],
    ask: 'Estimate the mass of bone and of muscle.',
    steps: [
      { text: 'Bone ≈ 50 × 12 ÷ 100 = 6 kg to 50 × 15 ÷ 100 = 7.5 kg.', why: 'Mass of a part = body mass × percentage ÷ 100.' },
      { text: 'Muscle ≈ 50 × 35 ÷ 100 = 17.5 kg.', why: 'Same rule with the muscle percentage.' },
      { text: 'Together about a third or more of the body is bone and muscle.', why: '6 + 17.5 = 23.5 kg out of 50 kg.' },
    ],
    verify: 'The estimates depend on age, sex and fitness, so classmates’ values differ.',
  },
  guided: {
    id: 'g-bt-l6', prompt: 'Classify joints by movement.',
    steps: [
      { id: 'g1', prompt: 'Neck.', question: pick('bt-g6-1', 'Turning the head to say "no" uses a…', [['pivot joint', null], ['hinge joint', 'A hinge only bends one way; turning side to side needs a pivot.', 'joint-swap'], ['fixed joint', 'Fixed joints do not move at all.', 'joint-swap']], 'Pivot.'), hints: ['Like a doorknob.'] },
      { id: 'g2', prompt: 'Bone mass.', question: num('bt-g6-2', 'Estimate the bone mass of a 60 kg adult if bone is 15 % of body mass, in kg.', 9, '60 × 15 ÷ 100 = 9 kg.', { unit: 'kg', rules: [[[4], '60 ÷ 15 = 4 is not a percentage; multiply by 15 and divide by 100.', 'percent-divide']] }), hints: ['Total × percent ÷ 100.'] },
    ],
    conclusion: 'Joints are named by the movement they allow; percentages of body mass give rough part masses.',
  },
  independent: [
    ind('i1', 'Hinge', 'joints', 'One plane.', pick('bt-l6-i1', 'Claim: "In a hinge joint, movement is mainly in one plane because the bone ends allow sliding in all directions." This is…', [['partly wrong: the claim is true but the reason is false', null], ['completely right', 'Bone ends that slid in all directions would allow movement in many planes.', 'joint-swap']], 'True claim, false reason.'), ['Check the reason separately.'], ['Hinges move in one plane; their bone ends do not slide in all directions.']),
    ind('i2', 'Skull', 'skeleton', 'Fixed.', pick('bt-l6-i2', 'Why are skull bones joined by fixed joints?', [['So they cannot move and the brain stays protected', null], ['So the head can turn', 'Turning happens at the pivot joint with the backbone.', 'joint-swap']], 'Protection.'), ['What does the skull protect?'], ['A rigid case protects the brain.']),
    ind('i3', 'Ribs', 'skeleton', 'Count.', num('bt-l6-i3', 'How many ribs does a human have in total?', 24, '12 pairs = 24 ribs.', { rules: [[[12], 'There are 12 pairs, which is 24 ribs.', 'pairs-count']] }), ['Twelve pairs.'], ['24.']),
    ind('i4', 'Shoulder', 'joints', 'Free movement.', pick('bt-l6-i4', 'Why can the arm move in a full circle at the shoulder?', [['A rounded bone end fits into a hollow: a ball and socket joint', null], ['The shoulder has no joint', 'The shoulder is a joint between the arm bone and the shoulder bone.', 'joint-moves'], ['The arm has a pivot joint at the elbow', 'The elbow is a hinge; the circle comes from the shoulder.', 'joint-swap']], 'Ball and socket.'), ['Ball in a hollow.'], ['Ball and socket joint.']),
  ],
  reflection: {
    discover: 'Muscles pull bones through tendons at joints; the joint’s shape decides the movement, and the skull, backbone and rib cage protect vital organs.',
    evidence: 'You classified joints, estimated bone mass and explained how the rib cage moves.',
    stillConfusing: [
      { text: 'Which joint allows which movement?', refresherId: 'bt6-joints' },
      { text: 'What makes a bone move?', refresherId: 'bt6-system' },
    ],
  },
};
