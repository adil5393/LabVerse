/**
 * Chapter 8 (Journey Inside the Atom): the shared model behind the lessons, the Atom Laboratory and the tests. Pure functions.
 * Follows NCERT Exploration (2026-27), Chapter 8:
 *   - relative charges e⁻ −1, p⁺ +1, n⁰ 0; mass number A = protons + neutrons; atomic number Z = protons;
 *   - Bohr–Bury filling: shell n holds at most 2n², the outermost shell at most 8, filled K, L, M, N in order;
 *   - valency from valence electrons (lose if fewer than 4, gain 8 − v if more than 4, share 4 if exactly 4, 0 with an octet);
 *   - weighted average atomic mass from isotope abundances; isotopes (same Z) and isobars (same A, different Z).
 * Element data for Z = 1 to 20 are standard facts (names, symbols, the neutron numbers of the common isotope as in Table 8.4).
 */

export interface ElementData { z: number; symbol: string; name: string; neutrons: number; latin?: string }

export const ELEMENTS: ElementData[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', neutrons: 0 },
  { z: 2, symbol: 'He', name: 'Helium', neutrons: 2 },
  { z: 3, symbol: 'Li', name: 'Lithium', neutrons: 4 },
  { z: 4, symbol: 'Be', name: 'Beryllium', neutrons: 5 },
  { z: 5, symbol: 'B', name: 'Boron', neutrons: 6 },
  { z: 6, symbol: 'C', name: 'Carbon', neutrons: 6 },
  { z: 7, symbol: 'N', name: 'Nitrogen', neutrons: 7 },
  { z: 8, symbol: 'O', name: 'Oxygen', neutrons: 8 },
  { z: 9, symbol: 'F', name: 'Fluorine', neutrons: 10 },
  { z: 10, symbol: 'Ne', name: 'Neon', neutrons: 10 },
  { z: 11, symbol: 'Na', name: 'Sodium', neutrons: 12, latin: 'Natrium' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', neutrons: 12 },
  { z: 13, symbol: 'Al', name: 'Aluminium', neutrons: 14 },
  { z: 14, symbol: 'Si', name: 'Silicon', neutrons: 14 },
  { z: 15, symbol: 'P', name: 'Phosphorus', neutrons: 16 },
  { z: 16, symbol: 'S', name: 'Sulfur', neutrons: 16 },
  { z: 17, symbol: 'Cl', name: 'Chlorine', neutrons: 18 },
  { z: 18, symbol: 'Ar', name: 'Argon', neutrons: 22 },
  { z: 19, symbol: 'K', name: 'Potassium', neutrons: 20, latin: 'Kalium' },
  { z: 20, symbol: 'Ca', name: 'Calcium', neutrons: 20 },
];
export const elementByZ = (z: number): ElementData | undefined => ELEMENTS.find((e) => e.z === z);
export const elementBySymbol = (s: string): ElementData | undefined => ELEMENTS.find((e) => e.symbol === s);

/** Other symbols from the chapter's table of common elements, including those from Latin names. */
export const MORE_SYMBOLS: { name: string; symbol: string; from?: string }[] = [
  { name: 'Iron', symbol: 'Fe', from: 'ferrum (Latin)' },
  { name: 'Copper', symbol: 'Cu', from: 'cuprum (Latin)' },
  { name: 'Silver', symbol: 'Ag', from: 'argentum (Latin)' },
  { name: 'Gold', symbol: 'Au', from: 'aurum (Latin)' },
  { name: 'Lead', symbol: 'Pb', from: 'plumbum (Latin)' },
  { name: 'Mercury', symbol: 'Hg', from: 'hydrargyros (Greek)' },
  { name: 'Tungsten', symbol: 'W', from: 'wolfram (German)' },
  { name: 'Zinc', symbol: 'Zn' },
  { name: 'Cobalt', symbol: 'Co' },
  { name: 'Iodine', symbol: 'I' },
  { name: 'Bromine', symbol: 'Br' },
  { name: 'Barium', symbol: 'Ba' },
  { name: 'Uranium', symbol: 'U' },
];

/** IUPAC writing rule: one capital letter, optionally followed by one lowercase letter. */
export const isWellFormedSymbol = (s: string): boolean => /^[A-Z][a-z]?$/.test(s);

// ---------- Particles and numbers ----------

export const RELATIVE_CHARGE = { electron: -1, proton: 1, neutron: 0 } as const;
export const massNumber = (protons: number, neutrons: number): number => protons + neutrons;
export const neutronsFrom = (massNo: number, atomicNo: number): number => massNo - atomicNo;
export const netCharge = (protons: number, electrons: number): number => protons - electrons;
/** Maximum electrons in shell n (n = 1 for K): 2n². */
export const shellCapacity = (n: number): number => 2 * n * n;
export const SHELL_NAMES = ['K', 'L', 'M', 'N'] as const;

// ---------- Electronic configuration ----------

/**
 * Distribution of `electrons` over K, L, M, N by the chapter's rules: fill inner shells first; shell n holds at most 2n²;
 * the outermost shell holds at most 8. Valid for the first twenty elements (up to calcium), which is the chapter's range.
 */
export function configuration(electrons: number): number[] {
  const shells: number[] = [];
  let left = electrons;
  for (let n = 1; left > 0 && n <= 4; n++) {
    const cap = n === 1 ? 2 : Math.min(shellCapacity(n), 8);
    const put = Math.min(cap, left);
    shells.push(put);
    left -= put;
  }
  return shells;
}
export const configText = (shells: number[]): string => shells.join(', ');
export const valenceElectrons = (shells: number[]): number => (shells.length ? shells[shells.length - 1] : 0);
/** Stable if the outermost shell is full: 2 for helium (one shell only), otherwise 8. */
export const hasStableShell = (shells: number[]): boolean => (shells.length === 1 ? shells[0] === 2 : valenceElectrons(shells) === 8);

export type ValencyWay = 'lose' | 'gain' | 'share' | 'none';
export interface Valency { value: number; way: ValencyWay }
/** The chapter's rule of thumb for valency from the electronic configuration. */
export function valencyOf(shells: number[]): Valency {
  const v = valenceElectrons(shells);
  if (hasStableShell(shells)) return { value: 0, way: 'none' };
  if (shells.length === 1) return { value: 1, way: 'lose' }; // hydrogen: one electron, combining capacity 1
  if (v < 4) return { value: v, way: 'lose' };
  if (v === 4) return { value: 4, way: 'share' };
  return { value: 8 - v, way: 'gain' };
}

export interface AtomSummary {
  element?: ElementData;
  protons: number; neutrons: number; electrons: number;
  massNumber: number; charge: number; shells: number[];
  kind: 'atom' | 'positive ion' | 'negative ion' | 'nothing';
}
/** What a set of particles makes: the element is decided by the protons alone. */
export function summarize(protons: number, neutrons: number, electrons: number): AtomSummary {
  const charge = netCharge(protons, electrons);
  return {
    element: elementByZ(protons), protons, neutrons, electrons, massNumber: massNumber(protons, neutrons), charge, shells: configuration(electrons),
    kind: protons === 0 ? 'nothing' : charge === 0 ? 'atom' : charge > 0 ? 'positive ion' : 'negative ion',
  };
}

// ---------- Isotopes, isobars and average atomic mass ----------

export interface Nuclide { z: number; a: number }
export type Relation = 'same' | 'isotopes' | 'isobars' | 'unrelated';
export function relation(x: Nuclide, y: Nuclide): Relation {
  if (x.z === y.z && x.a === y.a) return 'same';
  if (x.z === y.z) return 'isotopes';
  if (x.a === y.a) return 'isobars';
  return 'unrelated';
}

export interface IsotopeShare { mass: number; percent: number }
/** Weighted average atomic mass (u) from isotope masses and percentage abundances. */
export const averageAtomicMass = (isotopes: IsotopeShare[]): number => isotopes.reduce((s, i) => s + (i.mass * i.percent) / 100, 0);
export const simpleAverage = (masses: number[]): number => masses.reduce((s, m) => s + m, 0) / masses.length;

// ---------- Gold foil scattering (an illustrative model) ----------

/**
 * A sketch of the α-scattering result for the laboratory. Each α particle passes the nearest gold nucleus at a "miss
 * distance" b (in units where the nucleus is tiny compared with the atom). The deflection follows the Rutherford relation
 * tan(θ/2) = k ÷ b, with k chosen so that only a direct, close approach turns a particle back. In the Thomson model the
 * positive charge is spread out, so the deflection is always tiny.
 */
export type ScatterModel = 'rutherford' | 'thomson';
export function deflectionDeg(b: number, model: ScatterModel, k = 0.0025): number {
  if (model === 'thomson') return Math.min(1, 0.5 * Math.exp(-b));
  return (2 * Math.atan(k / Math.max(b, 1e-6)) * 180) / Math.PI;
}

export interface ScatterCounts { straight: number; small: number; large: number; back: number; total: number }
/** Classify a deterministic spread of miss distances through `layers` layers of atoms (a thicker foil has more layers). */
export function scatterCounts(model: ScatterModel, n = 100000, layers = 1): ScatterCounts {
  const out: ScatterCounts = { straight: 0, small: 0, large: 0, back: 0, total: n };
  for (let i = 0; i < n; i++) {
    let biggest = 0;
    for (let l = 0; l < layers; l++) {
      // Evenly spread miss distances over the area of one atom (radius 1): b = sqrt(u), u in (0, 1].
      const u = (((i * 7919 + l * 104729) % n) + 0.5) / n; // a different, even spread for each layer
      biggest = Math.max(biggest, deflectionDeg(Math.sqrt(u), model));
    }
    if (biggest < 1) out.straight++;
    else if (biggest < 10) out.small++;
    else if (biggest < 90) out.large++;
    else out.back++;
  }
  return out;
}

/** Ordered milestones of atomic models, for the chapter's timeline. */
export const MODEL_TIMELINE = [
  { id: 'dalton', year: 1808, who: 'Dalton', idea: 'Atoms are indivisible particles' },
  { id: 'thomson', year: 1897, who: 'Thomson', idea: 'Electrons embedded in a sphere of positive charge' },
  { id: 'rutherford', year: 1911, who: 'Rutherford', idea: 'A tiny, dense, positive nucleus; mostly empty space' },
  { id: 'bohr', year: 1913, who: 'Bohr', idea: 'Electrons in fixed shells of definite energy' },
  { id: 'chadwick', year: 1932, who: 'Chadwick', idea: 'The neutron: mass without charge in the nucleus' },
] as const;
