/**
 * Chapter 3 (Tissues in Action) model: meristem growth, plant and animal tissue data, muscle and joint rules, body composition
 * and tree rings. Aligned to NCERT Exploration (2026-27) Sections 3.1 to 3.6, Tables 3.2, 3.4, 3.5 and 3.7. Pure functions only.
 */

// ---------- Apical meristem: the onion root experiment (Activity 3.1, Fig. 3.2) ----------

/** Illustrative daily growth of onion roots in water, in cm. */
export const ROOT_GROWTH_CM_PER_DAY = 0.9;
export const ROOT_START_CM = 0.5;
export const TIP_CUT_CM = 1;

/**
 * Root length (cm) on `day` (1 to 7). If the tips are cut on `cutDay`, the root loses about 1 cm and stops growing, because
 * the dividing cells of the apical meristem were removed.
 */
export function rootLength(day: number, cutDay: number | null): number {
  const grown = (d: number) => ROOT_START_CM + ROOT_GROWTH_CM_PER_DAY * (d - 1);
  if (cutDay === null || day < cutDay) return grown(day);
  return Math.max(0, grown(cutDay) - TIP_CUT_CM);
}

export type MeristemId = 'apical' | 'lateral' | 'intercalary';
export const MERISTEMS: Record<MeristemId, { name: string; where: string; growth: string }> = {
  apical: { name: 'Apical meristem', where: 'tips of roots and shoots', growth: 'increase in length' },
  lateral: { name: 'Lateral meristem', where: 'a ring of dividing cells around the stem', growth: 'increase in girth (thickness)' },
  intercalary: { name: 'Intercalary meristem', where: 'base of internodes or just above nodes (as in grasses)', growth: 'regrowth after cutting or grazing' },
};

/** Which meristem explains a kind of growth. */
export function meristemFor(growth: 'length' | 'girth' | 'regrowth'): MeristemId {
  return growth === 'length' ? 'apical' : growth === 'girth' ? 'lateral' : 'intercalary';
}

// ---------- Plant tissues (Section 3.2.4, Figs 3.7 to 3.10) ----------

export type PlantTissueId = 'meristem' | 'epidermis' | 'parenchyma' | 'collenchyma' | 'sclerenchyma' | 'xylem' | 'phloem';

export interface PlantTissue {
  id: PlantTissueId;
  name: string;
  group: 'meristematic' | 'protective' | 'simple permanent' | 'complex permanent';
  cellTypes: 'one' | 'several';
  living: 'living' | 'mostly dead' | 'mostly living';
  wall: string;
  job: string;
  where: string;
  system: 'dermal' | 'ground' | 'vascular' | 'growth';
}

export const PLANT_TISSUES: PlantTissue[] = [
  { id: 'meristem', name: 'Meristematic tissue', group: 'meristematic', cellTypes: 'one', living: 'living', wall: 'thin walls; large nucleus; dense cytoplasm; no vacuoles; no spaces between cells', job: 'Divides continuously to add new cells.', where: 'root and shoot tips, a ring in the stem, base of internodes', system: 'growth' },
  { id: 'epidermis', name: 'Epidermis', group: 'protective', cellTypes: 'one', living: 'living', wall: 'single layer of flat, tightly packed cells covered with a waxy cuticle', job: 'Protects against injury, water loss and microbes; has stomata in leaves and root hairs in roots.', where: 'outermost layer of the whole plant', system: 'dermal' },
  { id: 'parenchyma', name: 'Parenchyma', group: 'simple permanent', cellTypes: 'one', living: 'living', wall: 'thin walls; loosely packed with spaces between cells', job: 'Stores food; makes food in green parts; forms air spaces that help aquatic plants float.', where: 'ground tissue of stems, roots and leaves', system: 'ground' },
  { id: 'collenchyma', name: 'Collenchyma', group: 'simple permanent', cellTypes: 'one', living: 'living', wall: 'corners unevenly thickened with pectin', job: 'Support with flexibility, so stems and tendrils bend without breaking.', where: 'young stems, leaf stalks', system: 'ground' },
  { id: 'sclerenchyma', name: 'Sclerenchyma', group: 'simple permanent', cellTypes: 'one', living: 'mostly dead', wall: 'thick walls hardened with lignin', job: 'Hardness and strength.', where: 'stems, leaf veins, coconut husk, walnut shells, seed coats', system: 'ground' },
  { id: 'xylem', name: 'Xylem', group: 'complex permanent', cellTypes: 'several', living: 'mostly dead', wall: 'tracheids, vessels, xylem fibres (thick-walled) and xylem parenchyma (the only living part)', job: 'Carries water and minerals up from the roots; also gives strength.', where: 'vascular bundles', system: 'vascular' },
  { id: 'phloem', name: 'Phloem', group: 'complex permanent', cellTypes: 'several', living: 'mostly living', wall: 'sieve tubes, companion cells, phloem parenchyma and phloem fibres', job: 'Carries food from the leaves to other parts.', where: 'vascular bundles', system: 'vascular' },
];

export const plantTissue = (id: PlantTissueId): PlantTissue => PLANT_TISSUES.find((t) => t.id === id)!;

/** A permanent tissue is simple if it has one type of cell and complex if it has several. */
export const isComplex = (t: PlantTissue): boolean => t.cellTypes === 'several';

// ---------- Animal tissues (Section 3.3, Tables 3.2 and 3.4) ----------

export interface Epithelium { id: string; job: string; structure: string; where: string }
export const EPITHELIA: Epithelium[] = [
  { id: 'exchange', job: 'Exchange: rapid diffusion of liquids and gases', structure: 'single layer of thin, flat cells', where: 'lining of blood vessels and lungs' },
  { id: 'protection', job: 'Protection from injury, friction and microbes', structure: 'many layers; outer cells flat and tightly packed', where: 'skin, mouth, oesophagus' },
  { id: 'secretion', job: 'Secretion of mucus, enzymes, hormones, sweat and saliva', structure: 'cuboidal or columnar cells specialised to make and release substances', where: 'salivary and sweat glands, stomach lining' },
  { id: 'sensory', job: 'Sensing smell, taste, sound and balance', structure: 'receptor cells with hair-like cilia', where: 'nostrils, taste buds, inner ear' },
  { id: 'absorption', job: 'Absorption of nutrients and water', structure: 'single layer of tall, pillar-like cells, often with hair-like projections', where: 'lining of the small intestine' },
];

export interface ConnectiveTissue { id: string; name: string; matrix: string; job: string; feel: string }
export const CONNECTIVE: ConnectiveTissue[] = [
  { id: 'blood', name: 'Blood', matrix: 'fluid plasma (about 55 % of the volume) carrying red cells, white cells and platelets (about 45 %)', job: 'Transports nutrients, gases and hormones; white cells fight infection; platelets help clotting.', feel: 'liquid' },
  { id: 'bone', name: 'Bone', matrix: 'hard, rigid matrix of calcium and phosphorus compounds', job: 'Strength, support and protection.', feel: 'hard and rigid (touch your elbow)' },
  { id: 'cartilage', name: 'Cartilage', matrix: 'soft, jelly-like matrix', job: 'Flexibility; cushions the ends of bones.', feel: 'soft, flexible, springs back (fold your ear)' },
  { id: 'tendon', name: 'Tendon', matrix: 'tough, fibrous', job: 'Connects muscle to bone and passes on its pull.', feel: 'a cord that moves when you wiggle your fingers' },
  { id: 'ligament', name: 'Ligament', matrix: 'tough, fibrous', job: 'Connects bone to bone, limits movement and prevents dislocation.', feel: 'the knee will not bend past a limit' },
];

/** Tendons join muscle to bone; ligaments join bone to bone. */
export function connectorFor(a: 'muscle' | 'bone', b: 'muscle' | 'bone'): 'tendon' | 'ligament' | 'none' {
  if (a === 'bone' && b === 'bone') return 'ligament';
  if (a !== b) return 'tendon';
  return 'none';
}

// ---------- Muscles and nerves (Sections 3.3.3 and 3.3.4) ----------

export type MuscleId = 'skeletal' | 'smooth' | 'cardiac';
export interface Muscle { id: MuscleId; control: 'voluntary' | 'involuntary'; shape: string; nuclei: 'many' | 'one'; striations: 'striated' | 'none' | 'faint'; branched: boolean; where: string }
export const MUSCLES: Record<MuscleId, Muscle> = {
  skeletal: { id: 'skeletal', control: 'voluntary', shape: 'long, cylindrical, unbranched fibres', nuclei: 'many', striations: 'striated', branched: false, where: 'attached to bones' },
  smooth: { id: 'smooth', control: 'involuntary', shape: 'spindle-shaped cells', nuclei: 'one', striations: 'none', branched: false, where: 'stomach, intestines' },
  cardiac: { id: 'cardiac', control: 'involuntary', shape: 'cylindrical, branched fibres', nuclei: 'one', striations: 'faint', branched: true, where: 'heart only' },
};

/** Identify a muscle from what is seen under the microscope. */
export function identifyMuscle(f: { branched: boolean; striations: 'striated' | 'none' | 'faint'; nuclei: 'many' | 'one' }): MuscleId {
  if (f.branched) return 'cardiac';
  if (f.striations === 'none') return 'smooth';
  return f.nuclei === 'many' ? 'skeletal' : 'cardiac';
}

export const NEURON_PARTS = [
  { id: 'dendrites', name: 'Dendrites', job: 'receive signals from other neurons' },
  { id: 'body', name: 'Cell body', job: 'contains the nucleus and controls the cell' },
  { id: 'axon', name: 'Axon', job: 'a long fibre that carries the message away from the cell body' },
  { id: 'terminals', name: 'Axon terminals', job: 'pass the message on to other cells' },
] as const;

// ---------- Joints (Sections 3.4 and 3.5, Table 3.5) ----------

export type JointId = 'ball-socket' | 'hinge' | 'pivot' | 'fixed';
export type Movement = 'bend' | 'sideways' | 'circle' | 'turn';

export const JOINTS: Record<JointId, { name: string; examples: string; allows: Movement[]; picture: string }> = {
  'ball-socket': { name: 'Ball and socket joint', examples: 'shoulder, hip', allows: ['bend', 'sideways', 'circle'], picture: 'a rounded end fits into a hollow, so the arm can move forwards, backwards, sideways and in a full circle' },
  hinge: { name: 'Hinge joint', examples: 'elbow, knee', allows: ['bend'], picture: 'bends and straightens in one direction only, like a door hinge' },
  pivot: { name: 'Pivot joint', examples: 'skull on the backbone (neck)', allows: ['turn'], picture: 'lets the head turn from side to side, like a doorknob turning' },
  fixed: { name: 'Fixed joint', examples: 'bones of the skull', allows: [], picture: 'bones joined so they cannot move, keeping the brain safe' },
};

export const canMove = (joint: JointId, movement: Movement): boolean => JOINTS[joint].allows.includes(movement);
export const BODY_JOINT: Record<string, JointId> = { shoulder: 'ball-socket', hip: 'ball-socket', elbow: 'hinge', knee: 'hinge', neck: 'pivot', skull: 'fixed' };

// ---------- Body composition (Activity 3.4) and tree rings (Table 3.7) ----------

export const BONE_PERCENT_RANGE: [number, number] = [12, 15];
export const partMass = (bodyKg: number, percent: number): number => (bodyKg * percent) / 100;

/** Table 3.7: a teak tree, age (years), diameter at breast height (cm) and number of annual rings. */
export const TEAK_DATA: { age: number; dbhCm: number; rings: number }[] = [
  { age: 5, dbhCm: 4, rings: 5 }, { age: 10, dbhCm: 8, rings: 10 }, { age: 20, dbhCm: 24, rings: 20 },
  { age: 25, dbhCm: 28, rings: 25 }, { age: 30, dbhCm: 32, rings: 30 }, { age: 40, dbhCm: 40, rings: 40 },
];

/** One annual ring forms each year, so counting rings gives the age. */
export const ringsForAge = (years: number): number => Math.max(0, Math.floor(years));
/** Average growth in diameter per year between two rows of the table, in cm per year. */
export const growthRate = (a: { age: number; dbhCm: number }, b: { age: number; dbhCm: number }): number => (b.dbhCm - a.dbhCm) / (b.age - a.age);
