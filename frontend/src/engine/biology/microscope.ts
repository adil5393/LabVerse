/**
 * Shared optics for the virtual microscope used across the Class 9 Biology chapters (NCERT Exploration 2026-27, Chapter 2,
 * Section 2.1 and Activity 2.1). Pure functions: every figure and every answer about the microscope reads from here.
 *
 * Field of view: a 10X eyepiece with a field number of 20 mm gives a 5 mm field with the 4X objective, which is the value used
 * in the chapter's worked estimate (5000 µm / 25 onion cells = 200 µm).
 */

export const MM_TO_UM = 1000;
/** Limit of resolution of the unaided eye at the near point (about 25 cm): two points about 0.1 mm apart. */
export const EYE_RESOLUTION_MM = 0.1;
/** About the smallest detail a light microscope can separate, set by the wavelength of visible light. */
export const LIGHT_LIMIT_UM = 0.2;
export const FIELD_NUMBER_MM = 20;
export const EYEPIECES = [10, 15] as const;
/** 4X, 10X and 40X are on every school microscope; 100X is an oil-immersion lens found on some. */
export const OBJECTIVES = [4, 10, 40, 100] as const;

export const totalMagnification = (eyepiece: number, objective: number): number => eyepiece * objective;
/** Diameter of the circular field seen through the eyepiece, in mm (field number ÷ objective power). */
export const fieldDiameterMm = (objective: number): number => FIELD_NUMBER_MM / objective;
export const mmToUm = (mm: number): number => mm * MM_TO_UM;
/** Activity 2.1: size of one cell = field diameter in µm ÷ number of cells counted along the diameter. */
export const estimateCellSize = (fieldUm: number, cellsAcross: number): number => (cellsAcross > 0 ? fieldUm / cellsAcross : NaN);
/** How large an object of `sizeUm` appears through the microscope, in mm. */
export const apparentSizeMm = (sizeUm: number, magnification: number): number => (sizeUm * magnification) / MM_TO_UM;

export type Visibility = 'detail' | 'dots' | 'invisible';
/** Apparent size (mm) above which the shape of a cell can be made out comfortably, not just a speck. */
export const SHAPE_THRESHOLD_MM = 2;
/**
 * What a student sees of a structure: its shape ('detail'), only specks ('dots'), or nothing. A light microscope can never
 * reveal anything smaller than about 0.2 µm, however much it magnifies (empty magnification).
 */
export function visibility(sizeUm: number, magnification: number): Visibility {
  if (sizeUm < LIGHT_LIMIT_UM) return 'invisible';
  const seen = apparentSizeMm(sizeUm, magnification);
  if (seen >= SHAPE_THRESHOLD_MM) return 'detail';
  if (seen >= EYE_RESOLUTION_MM) return 'dots';
  return 'invisible';
}

/** Which instrument is needed to see an object (Fig. 2.1): the unaided eye, a light microscope or an electron microscope. */
export function instrumentFor(sizeUm: number): 'unaided eye' | 'light microscope' | 'electron microscope' {
  if (sizeUm >= mmToUm(EYE_RESOLUTION_MM)) return 'unaided eye';
  if (sizeUm >= LIGHT_LIMIT_UM) return 'light microscope';
  return 'electron microscope';
}

export type CellShape = 'box' | 'irregular' | 'rod' | 'oval' | 'slipper' | 'blob' | 'filament' | 'sporangium' | 'round';

export interface Specimen {
  id: string;
  label: string;
  /** Typical size of one cell or unit, in µm (illustrative values; real cells vary). */
  sizeUm: number;
  shape: CellShape;
  stain: string;
  /** Colour of the stained cells, for the picture only. */
  colour: string;
  arrangement: 'regular' | 'irregular' | 'scattered' | 'chain';
  features: string[];
  chapter: 2 | 3 | 11 | 12;
  note?: string;
  /** Plant cells in strong sugar solution: the membrane pulls away from the wall. */
  plasmolysed?: boolean;
  dividing?: boolean;
  budding?: boolean;
}

export const SPECIMENS: Specimen[] = [
  { id: 'onion', label: 'Onion peel', sizeUm: 200, shape: 'box', stain: 'safranin', colour: '#f472b6', arrangement: 'regular', chapter: 2, features: ['cell wall', 'nucleus', 'large vacuole'], note: 'Box-shaped cells packed in regular rows, each with a cell wall.' },
  { id: 'cheek', label: 'Human cheek cells', sizeUm: 60, shape: 'irregular', stain: 'methylene blue', colour: '#60a5fa', arrangement: 'irregular', chapter: 2, features: ['cell membrane only', 'nucleus'], note: 'Flat, irregular cells with no cell wall, lying separately.' },
  { id: 'rhoeo-sugar', label: 'Rhoeo leaf peel in 20 % sugar solution', sizeUm: 100, shape: 'box', stain: 'none (natural purple sap)', colour: '#c084fc', arrangement: 'regular', chapter: 2, plasmolysed: true, features: ['cell wall keeps its shape', 'contents shrunk away from the wall'], note: 'The walls keep their shape; the contents have shrunk away from them.' },
  { id: 'root-tip', label: 'Onion root tip (squash)', sizeUm: 25, shape: 'box', stain: 'aceto-carmine', colour: '#fb7185', arrangement: 'regular', chapter: 2, dividing: true, features: ['small cells', 'chromosomes in dividing cells'], note: 'Small, tightly packed cells; many are at different stages of division.' },
  { id: 'bacteria', label: 'Bacteria (prepared slide)', sizeUm: 2, shape: 'rod', stain: 'crystal violet', colour: '#a78bfa', arrangement: 'scattered', chapter: 12, features: ['no nucleus visible', 'very small'], note: 'Tiny rods. No nucleus can be seen: bacteria are prokaryotes.' },
  { id: 'yeast', label: 'Yeast in sugar solution', sizeUm: 6, shape: 'oval', stain: 'none', colour: '#fde68a', arrangement: 'scattered', chapter: 11, budding: true, features: ['oval cells', 'buds'], note: 'Oval cells, some with small buds growing out of them.' },
  { id: 'mould', label: 'Bread mould (Rhizopus), cotton blue', sizeUm: 100, shape: 'sporangium', stain: 'cotton blue', colour: '#38bdf8', arrangement: 'scattered', chapter: 11, features: ['thread-like hyphae', 'round sacs full of spores'], note: 'Threads (hyphae) ending in round sacs filled with tiny spores.' },
  { id: 'paramecium', label: 'Hay infusion: Paramecium', sizeUm: 200, shape: 'slipper', stain: 'none', colour: '#86efac', arrangement: 'scattered', chapter: 12, features: ['true nucleus', 'cilia', 'single cell'], note: 'A slipper-shaped single cell covered in fine cilia: a protist.' },
  { id: 'amoeba', label: 'Pond water: Amoeba', sizeUm: 400, shape: 'blob', stain: 'none', colour: '#cbd5e1', arrangement: 'scattered', chapter: 12, features: ['true nucleus', 'changing shape', 'single cell'], note: 'A single cell that keeps changing its shape: a protist.' },
  { id: 'spirogyra', label: 'Spirogyra filament', sizeUm: 50, shape: 'filament', stain: 'none', colour: '#4ade80', arrangement: 'chain', chapter: 12, features: ['cells end to end', 'spiral chloroplast'], note: 'Cells joined end to end in a thread, each with a spiral green chloroplast: a thallophyte.' },
];

export const specimenById = (id: string): Specimen | undefined => SPECIMENS.find((s) => s.id === id);

/** How many whole cells of a specimen lie along the diameter of the field. */
export const cellsAcrossField = (specimen: Specimen, objective: number): number => Math.floor(mmToUm(fieldDiameterMm(objective)) / specimen.sizeUm);

/** Sizes of objects from Fig. 2.1, in µm, for the size ladder. Values are typical. */
export const SIZE_LADDER: { label: string; sizeUm: number }[] = [
  { label: 'Chicken egg', sizeUm: 50000 },
  { label: 'Fish egg', sizeUm: 1500 },
  { label: 'Amoeba', sizeUm: 400 },
  { label: 'Most plant and animal cells', sizeUm: 50 },
  { label: 'Nucleus', sizeUm: 6 },
  { label: 'Most bacteria', sizeUm: 2 },
  { label: 'Mitochondrion', sizeUm: 1 },
  { label: 'Smallest bacteria', sizeUm: 0.3 },
  { label: 'Viruses', sizeUm: 0.1 },
  { label: 'Ribosomes', sizeUm: 0.025 },
  { label: 'Proteins', sizeUm: 0.005 },
];
