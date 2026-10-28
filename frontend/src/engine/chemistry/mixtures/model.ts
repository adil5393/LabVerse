/**
 * Chapter 5 (Exploring Mixtures and their Separation): the shared model behind the lessons, the Mixtures Laboratory and the tests.
 * Pure functions only. The numbers follow NCERT Exploration (2026-27), Chapter 5:
 *   - concentration as % m/m, % m/v and % v/v (Eqs 5.1 to 5.3);
 *   - particle-size bands: solution < 1 nm, colloid 1 to 1000 nm, suspension > 1000 nm;
 *   - simple distillation needs boiling points at least about 25 °C apart, otherwise fractional distillation;
 *   - the solubility table (g per 100 g of water) is the book's factual data table, used here as data.
 */

// ---------- Concentration ----------

/** % m/m: grams of solute in 100 g of solution. */
export const massByMass = (soluteG: number, solventG: number): number => (100 * soluteG) / (soluteG + solventG);
/** % m/v: grams of solute in 100 mL of solution. */
export const massByVolume = (soluteG: number, solutionMl: number): number => (100 * soluteG) / solutionMl;
/** % v/v: millilitres of solute in 100 mL of solution. */
export const volumeByVolume = (soluteMl: number, solutionMl: number): number => (100 * soluteMl) / solutionMl;
/** Mass of a component in a sample, from its % m/m. */
export const componentMass = (percent: number, sampleG: number): number => (percent * sampleG) / 100;

export type ConcentrationKind = 'm/m' | 'm/v' | 'v/v';
/** Which way of expressing concentration suits a mixture, following the book's guidance. */
export function suitableConcentration(solute: 'solid' | 'liquid', measuredBy: 'mass' | 'volume'): ConcentrationKind {
  if (solute === 'liquid') return 'v/v';
  return measuredBy === 'volume' ? 'm/v' : 'm/m';
}

// ---------- Solubility ----------

export const SOLUBILITY_TEMPS = [10, 20, 30, 40, 60, 80] as const;
export interface SaltData { id: string; name: string; g100: number[] }
/** Solubility in g per 100 g of water at 10, 20, 30, 40, 60 and 80 °C. */
export const SALTS: SaltData[] = [
  { id: 'kno3', name: 'Potassium nitrate', g100: [21, 32, 45, 62, 106, 167] },
  { id: 'nacl', name: 'Sodium chloride', g100: [36, 36, 36.3, 36.5, 37, 37] },
  { id: 'kcl', name: 'Potassium chloride', g100: [35, 35, 37.4, 40, 46, 54] },
  { id: 'nh4cl', name: 'Ammonium chloride', g100: [24, 37, 41, 41, 55, 66] },
];
export const saltById = (id: string): SaltData => SALTS.find((s) => s.id === id) ?? SALTS[0];

/** Solubility (g per 100 g of water) at a temperature, by straight-line interpolation between the table values. */
export function solubilityAt(salt: SaltData, tempC: number): number {
  const T = SOLUBILITY_TEMPS;
  if (tempC <= T[0]) return salt.g100[0];
  if (tempC >= T[T.length - 1]) return salt.g100[T.length - 1];
  for (let i = 0; i < T.length - 1; i++) {
    if (tempC >= T[i] && tempC <= T[i + 1]) {
      const f = (tempC - T[i]) / (T[i + 1] - T[i]);
      return salt.g100[i] + f * (salt.g100[i + 1] - salt.g100[i]);
    }
  }
  return salt.g100[0];
}

/** Grams of solute a saturated solution in `waterG` of water holds at `tempC`. */
export const saturatedMass = (salt: SaltData, tempC: number, waterG: number): number => (solubilityAt(salt, tempC) * waterG) / 100;

/** Grams of crystals deposited when a solution saturated at `hotC` is cooled to `coldC` (0 if it would not be saturated). */
export const crystalYield = (salt: SaltData, hotC: number, coldC: number, waterG: number): number =>
  Math.max(0, saturatedMass(salt, hotC, waterG) - saturatedMass(salt, coldC, waterG));

export type SolutionState = 'unsaturated' | 'saturated' | 'excess';
/** Whether `soluteG` in `waterG` of water at `tempC` is unsaturated, just saturated, or has undissolved solid left. */
export function solutionState(salt: SaltData, tempC: number, waterG: number, soluteG: number): SolutionState {
  const max = saturatedMass(salt, tempC, waterG);
  if (Math.abs(soluteG - max) < 1e-9) return 'saturated';
  return soluteG < max ? 'unsaturated' : 'excess';
}

// ---------- Particle size, mixture type and the Tyndall effect ----------

export type MixtureType = 'solution' | 'colloid' | 'suspension';
export const mixtureTypeFromSize = (diameterNm: number): MixtureType => (diameterNm < 1 ? 'solution' : diameterNm <= 1000 ? 'colloid' : 'suspension');

export interface MixtureProperties {
  type: MixtureType;
  nature: 'homogeneous' | 'heterogeneous';
  sizeBand: string;
  visible: boolean;
  filterable: boolean;
  settles: boolean;
  tyndall: boolean;
}

/** The book's Table 5.1, filled in from particle size alone. */
export function propertiesOf(type: MixtureType): MixtureProperties {
  switch (type) {
    case 'solution': return { type, nature: 'homogeneous', sizeBand: 'less than 1 nm', visible: false, filterable: false, settles: false, tyndall: false };
    case 'colloid': return { type, nature: 'heterogeneous', sizeBand: '1 to 1000 nm', visible: false, filterable: false, settles: false, tyndall: true };
    case 'suspension': return { type, nature: 'heterogeneous', sizeBand: 'more than 1000 nm', visible: true, filterable: true, settles: true, tyndall: true };
  }
}

export interface SampleMixture { id: string; name: string; type: MixtureType; diameterNm: number; note: string }
/** Everyday mixtures for the laboratory beakers. Diameters are typical orders of magnitude, consistent with the book's bands. */
export const SAMPLE_MIXTURES: SampleMixture[] = [
  { id: 'salt-water', name: 'Salt in water', type: 'solution', diameterNm: 0.3, note: 'Dissolved salt particles are far too small to scatter light.' },
  { id: 'sugar-water', name: 'Sugar in water', type: 'solution', diameterNm: 0.9, note: 'A true solution: clear and uniform.' },
  { id: 'milk-water', name: 'A few drops of milk in water', type: 'colloid', diameterNm: 300, note: 'Looks uniform, but the fat and protein particles scatter light.' },
  { id: 'starch-water', name: 'Starch in water', type: 'colloid', diameterNm: 100, note: 'A colloid: the beam is visible, nothing settles.' },
  { id: 'chalk-water', name: 'Chalk powder in water', type: 'suspension', diameterNm: 20000, note: 'Particles are visible, settle with time and stay on filter paper.' },
  { id: 'mud-water', name: 'Muddy water', type: 'suspension', diameterNm: 50000, note: 'Heavier particles settle; the finest ones need coagulation or centrifugation.' },
];
export const sampleById = (id: string): SampleMixture => SAMPLE_MIXTURES.find((m) => m.id === id) ?? SAMPLE_MIXTURES[0];

/** What a beam of light shows when passed through a mixture, for the laboratory's text alternative. */
export function describeBeam(m: SampleMixture): string {
  const p = propertiesOf(m.type);
  return p.tyndall
    ? `${m.name}: the path of the beam is visible from the side, because the particles (about ${fmtNm(m.diameterNm)}) scatter the light (Tyndall effect).`
    : `${m.name}: the beam passes through without a visible path, because the dissolved particles (under 1 nm) are too small to scatter light.`;
}
export const fmtNm = (nm: number): string => (nm >= 1000 ? `${nm / 1000} µm` : `${nm} nm`);

// ---------- Choosing a separation method ----------

export type Method =
  | 'evaporation' | 'crystallization' | 'distillation' | 'fractional-distillation' | 'chromatography'
  | 'separating-funnel' | 'sublimation' | 'magnet' | 'filtration' | 'centrifugation' | 'coagulation' | 'dissolve-filter-evaporate' | 'none';

export const METHOD_LABEL: Record<Method, string> = {
  evaporation: 'Evaporation',
  crystallization: 'Crystallization',
  distillation: 'Distillation',
  'fractional-distillation': 'Fractional distillation',
  chromatography: 'Paper chromatography',
  'separating-funnel': 'Separating funnel',
  sublimation: 'Sublimation',
  magnet: 'Magnet',
  filtration: 'Filtration',
  centrifugation: 'Centrifugation',
  coagulation: 'Coagulation, then sedimentation',
  'dissolve-filter-evaporate': 'Dissolve in water, filter, then evaporate',
  none: 'Cannot be separated by physical methods',
};

/** Property-based description of a mixture. The chooser reads only these properties, never the mixture's name. */
export interface MixtureCase {
  id: string;
  name: string;
  kind: 'two-miscible-liquids' | 'two-immiscible-liquids' | 'solid-in-liquid-solution' | 'insoluble-solid-in-liquid' | 'fine-particles-in-liquid' | 'two-solids' | 'coloured-components' | 'alloy';
  /** Boiling points (°C) for two miscible liquids. */
  boilingPoints?: [number, number];
  /** The two liquids, as keys of `BOILING_POINTS`, in the same order as `boilingPoints`. */
  liquids?: [string, string];
  /**
   * Names of the two parts, used to label a drawing of the separation. Their order depends on the kind: two immiscible liquids
   * [upper layer, lower layer]; a solid in a liquid [solid, liquid]; fine particles [particles, liquid]; two solids [the part the
   * method takes out, the part left behind]; coloured components [components, mixture]; an alloy [metal, metal].
   */
  parts?: [string, string];
  /** Which component is wanted, for a solution of a solid. */
  want?: 'solid' | 'solvent' | 'pure-crystals';
  /** For two solids: does one sublime, is one magnetic, is one soluble in water? */
  sublimes?: boolean;
  magnetic?: boolean;
  oneSoluble?: boolean;
  /** For particles in a liquid: do they differ enough in density to separate when spun? */
  needsSpinning?: boolean;
}

export interface MethodChoice { method: Method; reason: string }

export function chooseMethod(c: MixtureCase): MethodChoice {
  switch (c.kind) {
    case 'two-miscible-liquids': {
      const [a, b] = c.boilingPoints ?? [0, 0];
      const gap = Math.abs(a - b);
      if (gap === 0) return { method: 'none', reason: 'The liquids boil at the same temperature, so heating cannot vaporise one before the other.' };
      return gap >= 25
        ? { method: 'distillation', reason: `The boiling points differ by ${gap} °C (at least about 25 °C), so the lower-boiling liquid vaporises first and is condensed.` }
        : { method: 'fractional-distillation', reason: `The boiling points differ by only ${gap} °C (less than 25 °C), so a fractionating column is needed.` };
    }
    case 'two-immiscible-liquids':
      return { method: 'separating-funnel', reason: 'The liquids do not mix and form layers by density; the lower layer is run off through the stopcock.' };
    case 'solid-in-liquid-solution':
      if (c.want === 'solvent') return { method: 'distillation', reason: 'Distillation recovers the solvent as a pure liquid; the solid stays behind in the flask.' };
      if (c.want === 'pure-crystals') return { method: 'crystallization', reason: 'Cooling a hot saturated solution deposits pure crystals and leaves soluble impurities in solution.' };
      return { method: 'evaporation', reason: 'Evaporating the solvent leaves the dissolved solid behind (the solvent is lost).' };
    case 'insoluble-solid-in-liquid':
      return { method: 'filtration', reason: 'The solid particles are large enough to be held back by filter paper.' };
    case 'fine-particles-in-liquid':
      return c.needsSpinning
        ? { method: 'centrifugation', reason: 'Spinning fast pushes the denser particles to the bottom of the tube; the lighter liquid stays on top.' }
        : { method: 'coagulation', reason: 'A coagulant such as alum makes the fine particles clump together and settle, so the clear water can be decanted or filtered.' };
    case 'two-solids':
      if (c.sublimes) return { method: 'sublimation', reason: 'On gentle heating one solid turns directly to vapour and deposits on a cool surface; the other stays behind.' };
      if (c.magnetic) return { method: 'magnet', reason: 'Only one of the solids is attracted to a magnet.' };
      if (c.oneSoluble) return { method: 'dissolve-filter-evaporate', reason: 'Only one solid dissolves in water: filter off the insoluble one, then evaporate the filtrate.' };
      return { method: 'none', reason: 'Neither property differs enough for a simple physical method.' };
    case 'coloured-components':
      return { method: 'chromatography', reason: 'The components travel up the paper at different rates with the solvent, so they separate into spots.' };
    case 'alloy':
      return { method: 'none', reason: 'An alloy is a homogeneous mixture of metals that physical methods cannot separate.' };
  }
}

/** The book's examples and exercise mixtures, described by their properties. Boiling points from the book's Table 5.5. */
export const BOILING_POINTS: Record<string, number> = { water: 100, acetone: 56, alcohol: 78, chloroform: 61, benzene: 80 };

export const MIXTURE_CASES: MixtureCase[] = [
  { id: 'acetone-water', name: 'Acetone and water', kind: 'two-miscible-liquids', liquids: ['acetone', 'water'], boilingPoints: [56, 100] },
  { id: 'alcohol-benzene', name: 'Alcohol and benzene', kind: 'two-miscible-liquids', liquids: ['alcohol', 'benzene'], boilingPoints: [78, 80] },
  { id: 'oil-water', name: 'Mustard oil and water', kind: 'two-immiscible-liquids', parts: ['mustard oil', 'water'] },
  { id: 'salt-from-water', name: 'Common salt from salt water', kind: 'solid-in-liquid-solution', want: 'solid', parts: ['common salt', 'water'] },
  { id: 'water-from-salt', name: 'Pure water from salt water', kind: 'solid-in-liquid-solution', want: 'solvent', parts: ['common salt', 'water'] },
  { id: 'copper-sulfate', name: 'Pure copper sulfate from an impure sample', kind: 'solid-in-liquid-solution', want: 'pure-crystals', parts: ['copper sulfate', 'water'] },
  { id: 'sand-water', name: 'Sand and water', kind: 'insoluble-solid-in-liquid', parts: ['sand', 'water'] },
  { id: 'blood', name: 'Plasma from blood cells', kind: 'fine-particles-in-liquid', needsSpinning: true, parts: ['blood cells', 'plasma'] },
  { id: 'muddy-water', name: 'Fine mud from cloudy water', kind: 'fine-particles-in-liquid', needsSpinning: false, parts: ['fine mud', 'water'] },
  { id: 'camphor-sand', name: 'Camphor and sand', kind: 'two-solids', sublimes: true, parts: ['camphor', 'sand'] },
  { id: 'iron-sawdust', name: 'Iron nails and sawdust', kind: 'two-solids', magnetic: true, parts: ['iron nails', 'sawdust'] },
  { id: 'chalk-salt', name: 'Chalk powder and common salt', kind: 'two-solids', oneSoluble: true, parts: ['common salt', 'chalk'] },
  { id: 'ink', name: 'The dyes in black ink', kind: 'coloured-components', parts: ['dyes', 'black ink'] },
  { id: 'brass', name: 'Copper and zinc in brass', kind: 'alloy', parts: ['copper', 'zinc'] },
];
export const caseById = (id: string): MixtureCase => MIXTURE_CASES.find((m) => m.id === id) ?? MIXTURE_CASES[0];

/** Liquids of the boiling-point table that do not mix with water (they form a separate layer). The others mix with each other. */
export const IMMISCIBLE_WITH_WATER: ReadonlySet<string> = new Set(['chloroform', 'benzene']);
/** Of those, the ones denser than water (they form the lower layer): chloroform about 1.5 g/cm³; benzene about 0.88 g/cm³ floats. */
export const DENSER_THAN_WATER: ReadonlySet<string> = new Set(['chloroform']);

/** [upper layer, lower layer] for water and a liquid that does not mix with it. */
function twoLayers(a: string, b: string): [string, string] {
  const other = a === 'water' ? b : a;
  return DENSER_THAN_WATER.has(other) ? ['water', other] : [other, 'water'];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The mixture of two liquids from the boiling-point table. A pair that matches a book example returns that example, so the
 * preset, the liquid pickers, the name and the boiling points can never disagree. Any other pair is described by the same
 * properties: its name and boiling points come from `BOILING_POINTS`, and water with benzene or chloroform forms two layers.
 */
export function twoLiquidCase(a: string, b: string): MixtureCase {
  const preset = MIXTURE_CASES.find((c) => c.liquids && ((c.liquids[0] === a && c.liquids[1] === b) || (c.liquids[0] === b && c.liquids[1] === a)));
  if (preset) return preset;
  const pair: [string, string] = [a, b];
  const name = `${capitalize(a)} and ${b}`;
  const layers = (a === 'water' && IMMISCIBLE_WITH_WATER.has(b)) || (b === 'water' && IMMISCIBLE_WITH_WATER.has(a));
  return layers
    ? { id: `liquids-${a}-${b}`, name, kind: 'two-immiscible-liquids', liquids: pair, parts: twoLayers(a, b) }
    : { id: `liquids-${a}-${b}`, name, kind: 'two-miscible-liquids', liquids: pair, boilingPoints: [BOILING_POINTS[a], BOILING_POINTS[b]] };
}

// ---------- Paper chromatography ----------

/** Distance (cm) a component has moved when the solvent front has risen `frontCm` above the start line. */
export const spotDistance = (rate: number, frontCm: number): number => rate * frontCm;
export interface InkDye { id: string; colour: string; rate: number }
/** An original, illustrative black ink made of three dyes that travel at different rates. */
export const BLACK_INK: InkDye[] = [
  { id: 'blue', colour: '#3b82f6', rate: 0.25 },
  { id: 'red', colour: '#ef4444', rate: 0.55 },
  { id: 'yellow', colour: '#eab308', rate: 0.85 },
];
