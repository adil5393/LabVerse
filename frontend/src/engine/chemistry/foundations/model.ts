/**
 * Chapter 9 (Atomic Foundations of Matter): the shared model behind the lessons, the Formula Laboratory and the tests. Pure.
 * Follows NCERT Exploration (2026-27), Chapter 9:
 *   - conservation of mass (closed system) and constant proportions;
 *   - covalent bonds by sharing and ionic bonds by transfer, from the valencies of Chapter 8;
 *   - formulae by criss-crossing valencies (covalent) or charges (ionic), reduced to the simplest ratio, with brackets around a
 *     polyatomic ion that appears more than once; the chapter's ion table (Table 9.1);
 *   - prefix names of binary covalent compounds;
 *   - molecular mass and formula unit mass from atomic masses (H 1, C 12, N 14, O 16, Na 23, Mg 24, … Cl 35.5 u).
 */

import { configuration, elementBySymbol, valencyOf } from '../atom/model';

// ---------- Laws of chemical combination ----------

export const totalMass = (masses: number[]): number => masses.reduce((s, m) => s + m, 0);
/** True if reactant and product totals agree within a measuring uncertainty (default 0.005 g). */
export const massConserved = (reactants: number[], products: number[], tolerance = 0.005): boolean => Math.abs(totalMass(reactants) - totalMass(products)) <= tolerance;
/** Reading on a balance after a gas-producing reaction: closed flask keeps the gas; an open one loses it. */
export const balanceReading = (startG: number, gasG: number, closed: boolean): number => (closed ? startG : startG - gasG);
/** Mass of B that combines with `massA` of A when they combine in the ratio a : b by mass. */
export const partnerMass = (massA: number, a: number, b: number): number => (massA * b) / a;
/** Mass of product from `massA` of A, when `refA` of A gives `refProduct` of product. */
export const productFrom = (massA: number, refA: number, refProduct: number): number => (massA * refProduct) / refA;
/** Do two samples have the same mass ratio (within 1 part in 10⁶)? */
export const sameRatio = (a1: number, b1: number, a2: number, b2: number): boolean => Math.abs(a1 / b1 - a2 / b2) < 1e-6 * Math.max(1, a1 / b1);

// ---------- Atomic masses and formula masses ----------

export const ATOMIC_MASS: Record<string, number> = {
  H: 1, He: 4, Li: 7, C: 12, N: 14, O: 16, F: 19, Ne: 20, Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35.5, Ar: 40, K: 39, Ca: 40,
  Fe: 56, Cu: 63.5, Zn: 65, Ag: 108, Ba: 137, Br: 80, I: 127,
};

/** Parse a formula such as "Ca(NO3)2" or "Al2(SO4)3" into element counts. Throws on anything it cannot read. */
export function parseFormula(formula: string): Record<string, number> {
  let i = 0;
  const readNumber = (): number => { let s = ''; while (i < formula.length && /[0-9]/.test(formula[i])) s += formula[i++]; return s ? Number(s) : 1; };
  const group = (): Record<string, number> => {
    const counts: Record<string, number> = {};
    const add = (sym: string, n: number) => { counts[sym] = (counts[sym] ?? 0) + n; };
    while (i < formula.length && formula[i] !== ')') {
      if (formula[i] === '(') {
        i++;
        const inner = group();
        if (formula[i] !== ')') throw new Error(`unclosed bracket in ${formula}`);
        i++;
        const k = readNumber();
        for (const [s, n] of Object.entries(inner)) add(s, n * k);
      } else if (/[A-Z]/.test(formula[i])) {
        let sym = formula[i++];
        if (i < formula.length && /[a-z]/.test(formula[i])) sym += formula[i++];
        add(sym, readNumber());
      } else throw new Error(`cannot read "${formula[i]}" in ${formula}`);
    }
    return counts;
  };
  const out = group();
  if (i !== formula.length) throw new Error(`unexpected ")" in ${formula}`);
  return out;
}

export interface MassPart { symbol: string; count: number; atomicMass: number; subtotal: number }
export function formulaMassParts(formula: string): MassPart[] {
  return Object.entries(parseFormula(formula)).map(([symbol, count]) => {
    const m = ATOMIC_MASS[symbol];
    if (m === undefined) throw new Error(`no atomic mass for ${symbol}`);
    return { symbol, count, atomicMass: m, subtotal: m * count };
  });
}
/** Molecular mass (covalent) or formula unit mass (ionic), in u. */
export const formulaMass = (formula: string): number => formulaMassParts(formula).reduce((s, p) => s + p.subtotal, 0);

/** Show digits as subscripts: "Al2(SO4)3" → "Al₂(SO₄)₃". */
export const pretty = (formula: string): string => formula.replace(/[0-9]/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);

// ---------- Ions (Table 9.1) ----------

export interface Ion { id: string; name: string; formula: string; charge: number; polyatomic: boolean }
export const IONS: Ion[] = [
  { id: 'na', name: 'Sodium', formula: 'Na', charge: 1, polyatomic: false },
  { id: 'li', name: 'Lithium', formula: 'Li', charge: 1, polyatomic: false },
  { id: 'k', name: 'Potassium', formula: 'K', charge: 1, polyatomic: false },
  { id: 'ag', name: 'Silver', formula: 'Ag', charge: 1, polyatomic: false },
  { id: 'ca', name: 'Calcium', formula: 'Ca', charge: 2, polyatomic: false },
  { id: 'ba', name: 'Barium', formula: 'Ba', charge: 2, polyatomic: false },
  { id: 'fe2', name: 'Iron (ferrous)', formula: 'Fe', charge: 2, polyatomic: false },
  { id: 'fe3', name: 'Iron (ferric)', formula: 'Fe', charge: 3, polyatomic: false },
  { id: 'cu1', name: 'Copper (cuprous)', formula: 'Cu', charge: 1, polyatomic: false },
  { id: 'cu2', name: 'Copper (cupric)', formula: 'Cu', charge: 2, polyatomic: false },
  { id: 'mg', name: 'Magnesium', formula: 'Mg', charge: 2, polyatomic: false },
  { id: 'zn', name: 'Zinc', formula: 'Zn', charge: 2, polyatomic: false },
  { id: 'al', name: 'Aluminium', formula: 'Al', charge: 3, polyatomic: false },
  { id: 'nh4', name: 'Ammonium', formula: 'NH4', charge: 1, polyatomic: true },
  { id: 'f', name: 'Fluoride', formula: 'F', charge: -1, polyatomic: false },
  { id: 'cl', name: 'Chloride', formula: 'Cl', charge: -1, polyatomic: false },
  { id: 'br', name: 'Bromide', formula: 'Br', charge: -1, polyatomic: false },
  { id: 'i', name: 'Iodide', formula: 'I', charge: -1, polyatomic: false },
  { id: 'o', name: 'Oxide', formula: 'O', charge: -2, polyatomic: false },
  { id: 's', name: 'Sulfide', formula: 'S', charge: -2, polyatomic: false },
  { id: 'oh', name: 'Hydroxide', formula: 'OH', charge: -1, polyatomic: true },
  { id: 'no3', name: 'Nitrate', formula: 'NO3', charge: -1, polyatomic: true },
  { id: 'hco3', name: 'Hydrogencarbonate', formula: 'HCO3', charge: -1, polyatomic: true },
  { id: 'co3', name: 'Carbonate', formula: 'CO3', charge: -2, polyatomic: true },
  { id: 'so4', name: 'Sulfate', formula: 'SO4', charge: -2, polyatomic: true },
];
export const ionById = (id: string): Ion => { const ion = IONS.find((x) => x.id === id); if (!ion) throw new Error(`no ion ${id}`); return ion; };
export const CATIONS = IONS.filter((x) => x.charge > 0);
export const ANIONS = IONS.filter((x) => x.charge < 0);
export const ionText = (ion: Ion): string => `${pretty(ion.formula)}${Math.abs(ion.charge) === 1 ? '' : Math.abs(ion.charge)}${ion.charge > 0 ? '⁺' : '⁻'}`.replace(/(\d)([⁺⁻])/, (_, d, s) => `${'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]}${s}`);

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const part = (formula: string, polyatomic: boolean, count: number): string => (count === 1 ? formula : polyatomic ? `(${formula})${count}` : `${formula}${count}`);

export interface CrissCross { left: string; right: string; leftNumber: number; rightNumber: number; raw: [number, number]; reduced: [number, number]; formula: string }

/** Ionic formula by criss-crossing the charge numbers and reducing to the simplest ratio. */
export function ionicFormula(cation: Ion, anion: Ion): CrissCross {
  const a = cation.charge, b = -anion.charge;
  const raw: [number, number] = [b, a];
  const g = gcd(raw[0], raw[1]);
  const reduced: [number, number] = [raw[0] / g, raw[1] / g];
  return { left: cation.formula, right: anion.formula, leftNumber: a, rightNumber: b, raw, reduced, formula: part(cation.formula, cation.polyatomic, reduced[0]) + part(anion.formula, anion.polyatomic, reduced[1]) };
}

/** Covalent formula by criss-crossing valencies (the book's method: HCl, H2S, CCl4, CO2). */
export function covalentFormula(a: string, valA: number, b: string, valB: number): CrissCross {
  const raw: [number, number] = [valB, valA];
  const g = gcd(raw[0], raw[1]);
  const reduced: [number, number] = [raw[0] / g, raw[1] / g];
  return { left: a, right: b, leftNumber: valA, rightNumber: valB, raw, reduced, formula: part(a, false, reduced[0]) + part(b, false, reduced[1]) };
}

/** Name of an ionic compound: cation name then anion name (ferrous/ferric and cuprous/cupric as in Table 9.1). */
export function ionicName(cation: Ion, anion: Ion): string {
  const c = cation.name.replace(/^Iron \((\w+)\)$/, '$1').replace(/^Copper \((\w+)\)$/, '$1');
  return `${c} ${anion.name.toLowerCase()}`.replace(/^./, (x) => x.toUpperCase());
}

// ---------- Naming binary covalent compounds ----------

const PREFIX = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa'];
const ELEMENT_NAME: Record<string, string> = { H: 'hydrogen', C: 'carbon', N: 'nitrogen', O: 'oxygen', F: 'fluorine', P: 'phosphorus', S: 'sulfur', Cl: 'chlorine', Br: 'bromine', I: 'iodine', Si: 'silicon' };
const IDE: Record<string, string> = { H: 'hydride', N: 'nitride', O: 'oxide', F: 'fluoride', S: 'sulfide', Cl: 'chloride', Br: 'bromide', I: 'iodide', C: 'carbide', P: 'phosphide' };
const COMMON_NAMES: Record<string, string> = { H2O: 'water', NH3: 'ammonia', CH4: 'methane' };

const joinPrefix = (prefix: string, word: string): string => {
  if (!prefix) return word;
  if (/[oa]$/.test(prefix) && /^[aeiou]/.test(word)) return prefix.slice(0, -1) + word; // monoxide, tetroxide, pentoxide
  return prefix + word; // dioxide, trioxide keep the i
};

/** Prefix name of a binary covalent compound written as two element parts, e.g. ("N", 2, "O", 4) → dinitrogen tetroxide. */
export function covalentName(first: string, n1: number, second: string, n2: number): string {
  const key = `${first}${n1 > 1 ? n1 : ''}${second}${n2 > 1 ? n2 : ''}`;
  if (COMMON_NAMES[key]) return COMMON_NAMES[key];
  const firstWord = first === 'H' || n1 === 1 ? ELEMENT_NAME[first] : joinPrefix(PREFIX[n1], ELEMENT_NAME[first]);
  const secondWord = first === 'H' ? IDE[second] : joinPrefix(PREFIX[n2], IDE[second]);
  return `${firstWord} ${secondWord}`;
}

// ---------- Bonds between two elements (first twenty) ----------

const METALS = new Set(['Li', 'Be', 'Na', 'Mg', 'Al', 'K', 'Ca']);
/** IUPAC order for the first-written element of a binary covalent compound (earlier in the list is written first). */
const NONMETAL_ORDER = ['B', 'Si', 'C', 'P', 'N', 'H', 'S', 'I', 'Br', 'Cl', 'O', 'F'];
export const isMetal = (symbol: string): boolean => METALS.has(symbol);
export const valencyOfSymbol = (symbol: string): number => { const e = elementBySymbol(symbol); if (!e) throw new Error(`no element ${symbol}`); return valencyOf(configuration(e.z)).value; };

export type BondKind = 'ionic' | 'covalent' | 'none';
export interface BondResult { kind: BondKind; formula: string; detail: string; bondOrder?: number }

/** How two elements of the first twenty combine: a metal with a non-metal transfers electrons; two non-metals share. */
export function bondBetween(a: string, b: string): BondResult {
  const va = valencyOfSymbol(a), vb = valencyOfSymbol(b);
  if (va === 0 || vb === 0) return { kind: 'none', formula: '', detail: `${va === 0 ? a : b} already has a stable outer shell, so it neither shares nor transfers electrons.` };
  if (isMetal(a) && isMetal(b)) return { kind: 'none', formula: '', detail: 'Two metals do not form an ionic or covalent compound; melted together they form an alloy.' };
  if (a === b) {
    const order = va;
    return { kind: 'covalent', formula: `${a}2`, bondOrder: order, detail: `Two ${a} atoms share ${order} pair${order === 1 ? '' : 's'} of electrons: a ${['', 'single', 'double', 'triple'][order] ?? `${order}-fold`} covalent bond.` };
  }
  if (isMetal(a) !== isMetal(b)) {
    const [m, n] = isMetal(a) ? [a, b] : [b, a];
    const vm = isMetal(a) ? va : vb, vn = isMetal(a) ? vb : va;
    const cc = covalentFormula(m, vm, n, vn); // the same criss-cross gives the ionic ratio
    return { kind: 'ionic', formula: cc.formula, detail: `${m} loses ${vm} electron${vm === 1 ? '' : 's'} to become ${m}${vm === 1 ? '⁺' : `${'⁰¹²³⁴⁵⁶⁷⁸⁹'[vm]}⁺`}; ${n} gains ${vn} to become ${n}${vn === 1 ? '⁻' : `${'⁰¹²³⁴⁵⁶⁷⁸⁹'[vn]}⁻`}. The oppositely charged ions attract: an ionic bond.` };
  }
  // Two different non-metals: write them in the conventional IUPAC element order (HCl, H2S, H2O, CO2, NH3, CH4, CCl4, OF2).
  const first = NONMETAL_ORDER.indexOf(a) <= NONMETAL_ORDER.indexOf(b) ? a : b;
  const second = first === a ? b : a;
  const cc = covalentFormula(first, valencyOfSymbol(first), second, valencyOfSymbol(second));
  return { kind: 'covalent', formula: cc.formula, detail: `${first} and ${second} share electrons so that each completes its outer shell: a covalent compound.` };
}

// ---------- Properties (Activity 9.4) ----------

export interface CompoundSample { id: string; name: string; kind: 'ionic' | 'covalent'; dissolvesInWater: boolean; dissolvesInKerosene: boolean; conductsSolid: false; conductsInWater: boolean }
export const SAMPLES: CompoundSample[] = [
  { id: 'nacl', name: 'Sodium chloride', kind: 'ionic', dissolvesInWater: true, dissolvesInKerosene: false, conductsSolid: false, conductsInWater: true },
  { id: 'cuso4', name: 'Copper sulfate', kind: 'ionic', dissolvesInWater: true, dissolvesInKerosene: false, conductsSolid: false, conductsInWater: true },
  { id: 'sugar', name: 'Sugar', kind: 'covalent', dissolvesInWater: true, dissolvesInKerosene: false, conductsSolid: false, conductsInWater: false },
  { id: 'camphor', name: 'Camphor', kind: 'covalent', dissolvesInWater: false, dissolvesInKerosene: true, conductsSolid: false, conductsInWater: false },
  { id: 'naphthalene', name: 'Naphthalene', kind: 'covalent', dissolvesInWater: false, dissolvesInKerosene: true, conductsSolid: false, conductsInWater: false },
];
