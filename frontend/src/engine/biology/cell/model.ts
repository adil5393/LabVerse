/**
 * Chapter 2 (Cell: The Building Block of Life) model: osmosis and tonicity, the parts of bacterial, plant and animal cells,
 * and cell division. Aligned to NCERT Exploration (2026-27) Sections 2.2 to 2.5, Tables 2.1 and 2.2. Pure functions only.
 */

// ---------- Osmosis (Section 2.2.1, Activity 2.2, Fig. 2.6) ----------

export type Tonicity = 'hypotonic' | 'isotonic' | 'hypertonic';
export type CellKind = 'plant' | 'animal';

/** The outside solution compared with the inside of the cell (Fig. 2.6). */
export function tonicity(outsidePercent: number, insidePercent: number): Tonicity {
  if (Math.abs(outsidePercent - insidePercent) < 1e-9) return 'isotonic';
  return outsidePercent < insidePercent ? 'hypotonic' : 'hypertonic';
}

/** Net direction of water through the membrane: from the more dilute side to the more concentrated side. */
export function waterFlow(outsidePercent: number, insidePercent: number): 'in' | 'out' | 'none' {
  const t = tonicity(outsidePercent, insidePercent);
  return t === 'hypotonic' ? 'in' : t === 'hypertonic' ? 'out' : 'none';
}

export interface CellResponse { tonicity: Tonicity; water: 'in' | 'out' | 'none'; state: string; sizeChange: 'larger' | 'same' | 'smaller'; explanation: string }

/** What happens to a living plant or animal cell placed in a solution (Section 2.2.2, Fig. 2.9). */
export function cellResponse(kind: CellKind, outsidePercent: number, insidePercent: number): CellResponse {
  const t = tonicity(outsidePercent, insidePercent);
  const water = waterFlow(outsidePercent, insidePercent);
  if (t === 'isotonic') return { tonicity: t, water, state: 'unchanged', sizeChange: 'same', explanation: 'The concentrations inside and outside are equal, so there is no net movement of water.' };
  if (kind === 'plant') {
    return t === 'hypotonic'
      ? { tonicity: t, water, state: 'turgid (firm)', sizeChange: 'same', explanation: 'Water enters and the vacuole fills; the rigid cell wall stops the cell from swelling much, so it becomes firm.' }
      : { tonicity: t, water, state: 'plasmolysed', sizeChange: 'same', explanation: 'Water leaves; the contents shrink and the membrane pulls away from the cell wall, but the wall keeps the outline of the cell.' };
  }
  return t === 'hypotonic'
    ? { tonicity: t, water, state: 'swollen (it may burst)', sizeChange: 'larger', explanation: 'Water enters; with no cell wall to hold it, the cell swells and may even burst.' }
    : { tonicity: t, water, state: 'shrunken', sizeChange: 'smaller', explanation: 'Water leaves; with no cell wall, the whole cell shrinks.' };
}

/** Effective solute concentration of potato cell sap used by the potato investigation (illustrative). */
export const POTATO_SAP_PERCENT = 3;

/**
 * Percentage change in mass of a potato piece after about an hour in a solution (Activity 2.2). Illustrative linear model
 * capped at +15 % and −25 %; a boiled potato's dead cells no longer have selectively permeable membranes, so nothing changes.
 */
export function potatoMassChangePercent(outsidePercent: number, boiled = false): number {
  if (boiled) return 0;
  const raw = 4 * (POTATO_SAP_PERCENT - outsidePercent);
  return Math.max(-25, Math.min(15, raw));
}

export const finalMass = (initialG: number, changePercent: number): number => initialG * (1 + changePercent / 100);
export const percentChange = (initialG: number, finalG: number): number => (100 * (finalG - initialG)) / initialG;

// ---------- Cell parts (Sections 2.2 and 2.3, Tables 2.1 and 2.2, Fig. 2.10) ----------

export type CellType = 'bacterial' | 'plant' | 'animal';

export interface CellPart {
  id: string;
  name: string;
  nickname: string;
  job: string;
  /** Number of membranes around it (0 for a structure with no membrane of its own). */
  membranes: 0 | 1 | 2;
  hasDNA: boolean;
  in: Record<CellType, boolean>;
  note?: string;
}

export const CELL_PARTS: CellPart[] = [
  { id: 'membrane', name: 'Cell membrane', nickname: 'the gatekeeper', job: 'Surrounds the cell and lets some substances through while blocking others (selectively permeable).', membranes: 1, hasDNA: false, in: { bacterial: true, plant: true, animal: true } },
  { id: 'wall', name: 'Cell wall', nickname: 'the rigid outer covering', job: 'Gives shape, strength and support; it is permeable to water and dissolved minerals. In plants it is made of cellulose.', membranes: 0, hasDNA: false, in: { bacterial: true, plant: true, animal: false } },
  { id: 'cytoplasm', name: 'Cytoplasm', nickname: 'the jelly-like interior', job: 'Semi-fluid substance that fills the cell and holds the organelles; in bacteria most activities happen directly in it.', membranes: 0, hasDNA: false, in: { bacterial: true, plant: true, animal: true } },
  { id: 'nucleus', name: 'Nucleus', nickname: 'the house of coded instructions', job: 'Holds the chromosomes (DNA) that control the cell; a double nuclear membrane with pores surrounds it, and the nucleolus inside makes ribosome subunits.', membranes: 2, hasDNA: true, in: { bacterial: false, plant: true, animal: true } },
  { id: 'nucleoid', name: 'Nucleoid', nickname: 'the primitive nucleus', job: 'Region of a bacterial cell holding its single circular DNA, with no membrane around it.', membranes: 0, hasDNA: true, in: { bacterial: true, plant: false, animal: false } },
  { id: 'ribosome', name: 'Ribosomes', nickname: 'the protein factories', job: 'Tiny sites of protein synthesis, free in the cytoplasm or attached to the rough ER.', membranes: 0, hasDNA: false, in: { bacterial: true, plant: true, animal: true } },
  { id: 'er', name: 'Endoplasmic reticulum (ER)', nickname: 'the manufacturing factory', job: 'Network of membranes continuous with the nuclear envelope. Rough ER (with ribosomes) makes proteins; smooth ER makes and stores fats and some hormones.', membranes: 1, hasDNA: false, in: { bacterial: false, plant: true, animal: true } },
  { id: 'golgi', name: 'Golgi apparatus', nickname: 'the post office', job: 'Stacks of flat sacs that modify, sort and package proteins and lipids into vesicles for transport, secretion or lysosome formation.', membranes: 1, hasDNA: false, in: { bacterial: false, plant: true, animal: true } },
  { id: 'lysosome', name: 'Lysosomes', nickname: 'the clean-up system', job: 'Sacs of enzymes that break down waste, worn-out parts and unwanted proteins, carbohydrates and fats.', membranes: 1, hasDNA: false, in: { bacterial: false, plant: false, animal: true }, note: 'Shown in the animal cell of Fig. 2.10; in plant cells the vacuole does much of this work.' },
  { id: 'mitochondria', name: 'Mitochondria', nickname: 'the powerhouses', job: 'Break down glucose in cellular respiration and store the energy released as ATP. The inner membrane is folded into cristae.', membranes: 2, hasDNA: true, in: { bacterial: false, plant: true, animal: true } },
  { id: 'chloroplast', name: 'Chloroplasts (plastids)', nickname: 'the food makers', job: 'Contain chlorophyll, which absorbs sunlight for photosynthesis. Other plastids are chromoplasts (colours) and leucoplasts (storage).', membranes: 2, hasDNA: true, in: { bacterial: false, plant: true, animal: false } },
  { id: 'vacuole', name: 'Vacuole', nickname: 'storage and support', job: 'Filled with cell sap; stores water, minerals, sugars and wastes. A large central vacuole keeps a plant cell firm.', membranes: 1, hasDNA: false, in: { bacterial: false, plant: true, animal: true }, note: 'Large and central in plant cells; small and only sometimes present in animal cells.' },
];

export const partById = (id: string): CellPart | undefined => CELL_PARTS.find((p) => p.id === id);
export const partsOf = (type: CellType): CellPart[] => CELL_PARTS.filter((p) => p.in[type]);
/** Parts found in one cell type but not another, e.g. present in plant cells and absent in animal cells. */
export const presentInButNot = (a: CellType, b: CellType): CellPart[] => CELL_PARTS.filter((p) => p.in[a] && !p.in[b]);
export const partsWithDNA = (): CellPart[] => CELL_PARTS.filter((p) => p.hasDNA);

/** Table 2.2: a cell is prokaryotic if it lacks a membrane-bound nucleus and membrane-bound organelles. */
export function classifyCell(hasMembraneBoundNucleus: boolean): 'prokaryotic' | 'eukaryotic' {
  return hasMembraneBoundNucleus ? 'eukaryotic' : 'prokaryotic';
}
export const TYPICAL_DIAMETER_UM: Record<'prokaryotic' | 'eukaryotic', [number, number]> = { prokaryotic: [1, 10], eukaryotic: [10, 100] };

/** Surface area ÷ volume of a cube of side `s`: smaller objects have more surface for each unit of volume (6/s). */
export const surfaceToVolume = (side: number): number => (6 * side * side) / (side ** 3);

// ---------- Cell division (Section 2.4) ----------

export interface DivisionResult { daughters: number; chromosomesEach: number; identical: boolean; purpose: string }

export function divide(kind: 'mitosis' | 'meiosis', parentChromosomes: number): DivisionResult {
  if (kind === 'mitosis') return { daughters: 2, chromosomesEach: parentChromosomes, identical: true, purpose: 'growth, repair, maintenance and asexual reproduction' };
  return { daughters: 4, chromosomesEach: parentChromosomes / 2, identical: false, purpose: 'forming gametes for sexual reproduction' };
}

/** Cells after `rounds` of mitosis starting from one cell. */
export const cellsAfterMitosis = (rounds: number): number => 2 ** rounds;
/** Fertilisation restores the chromosome number: two gametes each with half combine. */
export const zygoteChromosomes = (eggChromosomes: number, spermChromosomes: number): number => eggChromosomes + spermChromosomes;

export const CELL_THEORY = [
  'All living organisms are made up of one or more cells.',
  'The cell is the basic unit of structure and function in living beings.',
  'All cells arise from pre-existing cells.',
] as const;
