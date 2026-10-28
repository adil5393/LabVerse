/**
 * Chapter 11 (Reproduction: How Life Continues) model: asexual and sexual reproduction, meiosis and variation, flowers and
 * pollination, animal reproductive strategies and the human menstrual cycle. Aligned to NCERT Exploration (2026-27) Sections
 * 11.1 to 11.5 and Tables 11.2 to 11.5. Pure functions only.
 */

// ---------- Asexual reproduction (Section 11.1) ----------

export type AsexualMethod = 'vegetative propagation' | 'budding' | 'spore formation';
export const ASEXUAL_EXAMPLES: { organism: string; method: AsexualMethod; detail: string }[] = [
  { organism: 'Potato', method: 'vegetative propagation', detail: 'new plants sprout from the fleshy underground stem' },
  { organism: 'Ginger', method: 'vegetative propagation', detail: 'new shoots grow from the underground stem' },
  { organism: 'Bryophyllum', method: 'vegetative propagation', detail: 'tiny plantlets grow along the edges of the leaf' },
  { organism: 'Sugarcane', method: 'vegetative propagation', detail: 'stem cuttings with nodes grow into new plants' },
  { organism: 'Yeast', method: 'budding', detail: 'a small outgrowth (bud) forms on the cell and separates' },
  { organism: 'Hydra', method: 'budding', detail: 'repeated cell division at one spot forms a bud that grows and detaches' },
  { organism: 'Bread mould (Rhizopus)', method: 'spore formation', detail: 'millions of light spores form in sacs and spread through the air' },
];

/** Asexual reproduction uses mitosis, so the offspring are clones of the single parent. */
export const asexualOffspringIdentical = true;

// ---------- Meiosis and variation (Section 11.2.1, Activity 11.4) ----------

/** Different gametes possible from independent sorting of `pairs` chromosome pairs: 2 to the power of the number of pairs. */
export const gameteCombinations = (pairs: number): number => 2 ** pairs;
export const HUMAN_PAIRS = 23;
export const haploid = (diploid: number): number => diploid / 2;

/** Activity 11.4: one random bead from each pair. `rand` returns values in [0, 1). */
export function drawGamete(pairs: { light: string; dark: string }[], rand: () => number): string[] {
  return pairs.map((p) => (rand() < 0.5 ? p.light : p.dark));
}

/** Every combination, in order, for small numbers of pairs (Activity 11.4 lists all eight for three pairs). */
export function allCombinations(pairs: { light: string; dark: string }[]): string[][] {
  return pairs.reduce<string[][]>((acc, p) => acc.flatMap((c) => [[...c, p.light], [...c, p.dark]]), [[]]);
}

// ---------- Flowers and pollination (Sections 11.2.2 to 11.2.5) ----------

export type FlowerPartId = 'sepal' | 'petal' | 'anther' | 'filament' | 'stigma' | 'style' | 'ovary' | 'ovule';
export const FLOWER_PARTS: Record<FlowerPartId, { name: string; whorl: 'sepals' | 'petals' | 'stamen (male)' | 'pistil (female)'; job: string }> = {
  sepal: { name: 'Sepal', whorl: 'sepals', job: 'Green outer whorl that protects the flower in the bud.' },
  petal: { name: 'Petal', whorl: 'petals', job: 'Coloured part that attracts pollinators.' },
  anther: { name: 'Anther', whorl: 'stamen (male)', job: 'Makes pollen grains, which contain the male gametes.' },
  filament: { name: 'Filament', whorl: 'stamen (male)', job: 'Stalk that holds up the anther.' },
  stigma: { name: 'Stigma', whorl: 'pistil (female)', job: 'Tip of the pistil, often sticky, that receives pollen.' },
  style: { name: 'Style', whorl: 'pistil (female)', job: 'Tube joining the stigma to the ovary; the pollen tube grows down it.' },
  ovary: { name: 'Ovary', whorl: 'pistil (female)', job: 'Swollen base of the pistil holding the ovules; it becomes the fruit.' },
  ovule: { name: 'Ovule', whorl: 'pistil (female)', job: 'Contains the egg cell; after fertilisation it becomes the seed.' },
};

/** After fertilisation: the ovary becomes the fruit and each ovule becomes a seed; the zygote becomes the embryo. */
export const AFTER_FERTILISATION: Record<'ovary' | 'ovule' | 'zygote', string> = { ovary: 'fruit', ovule: 'seed', zygote: 'embryo' };

export type PollinationKind = 'self' | 'cross';
/** Same flower or another flower of the same plant is self-pollination; a flower on another plant of the same kind is cross. */
export const pollinationKind = (samePlant: boolean): PollinationKind => (samePlant ? 'self' : 'cross');

export type Agent = 'wind' | 'water' | 'insect' | 'bird';
export interface FlowerTraits { showy: boolean; nectarOrScent: boolean; pollen: 'light' | 'sticky'; stigma: 'feathery' | 'sticky'; aquatic: boolean }
/** The pollinator a flower is adapted for (Section 11.2.4). */
export function likelyAgent(t: FlowerTraits): Agent {
  if (t.aquatic) return 'water';
  if (!t.showy && t.pollen === 'light' && t.stigma === 'feathery') return 'wind';
  return t.nectarOrScent ? 'insect' : 'bird';
}

/**
 * Activity 11.6 with garden pea, which pollinates itself as the flower opens. A flower whose stamens were removed while still a
 * closed bud, and which is then bagged, receives no pollen and forms no fruit. Every other treatment is pollinated.
 */
export interface PeaTreatment { id: string; label: string; stage: 'bud' | 'flower'; stamensRemoved: boolean; bagged: boolean }
export const PEA_TREATMENTS: PeaTreatment[] = [
  { id: 'bud-bag', label: 'Bud, bagged', stage: 'bud', stamensRemoved: false, bagged: true },
  { id: 'bud-cut-bag', label: 'Bud, stamens removed, bagged', stage: 'bud', stamensRemoved: true, bagged: true },
  { id: 'flower-cut-bag', label: 'Open flower, stamens removed, bagged', stage: 'flower', stamensRemoved: true, bagged: true },
  { id: 'flower-bag', label: 'Open flower, bagged', stage: 'flower', stamensRemoved: false, bagged: true },
  { id: 'flower-open', label: 'Open flower, not bagged', stage: 'flower', stamensRemoved: false, bagged: false },
];

export function peaPollinated(t: Omit<PeaTreatment, 'id' | 'label'>): { pollinated: boolean; why: string } {
  if (!t.stamensRemoved) return { pollinated: true, why: 'Its own anthers shed pollen on to its stigma (self-pollination).' };
  if (t.stage === 'flower') return { pollinated: true, why: 'The open flower had already pollinated itself before the stamens were removed.' };
  if (!t.bagged) return { pollinated: true, why: 'Insects or wind could still bring pollen from another flower.' };
  return { pollinated: false, why: 'The stamens were removed before any pollen was shed, and the bag kept out pollen from other flowers.' };
}
export const formsFruit = (t: Omit<PeaTreatment, 'id' | 'label'>): boolean => peaPollinated(t).pollinated;

/** Table 11.3: approximate pollen released per flower and seeds formed. */
export const POLLEN_STRATEGIES = {
  wind: { label: 'Wind-pollinated grasses (maize, wheat)', pollen: [500000, 1000000] as [number, number], seeds: [50, 200] as [number, number] },
  insect: { label: 'Insect-pollinated plants (sunflower)', pollen: [20000, 40000] as [number, number], seeds: [800, 1000] as [number, number] },
};
export const midpoint = ([a, b]: [number, number]): number => (a + b) / 2;
/** Pollen grains needed per seed, using the middle of each range. */
export const pollenPerSeed = (s: { pollen: [number, number]; seeds: [number, number] }): number => midpoint(s.pollen) / midpoint(s.seeds);

// ---------- Animals (Sections 11.3 and 11.4, Table 11.4) ----------

export const ANIMAL_STRATEGIES = [
  { animal: 'Fish', habitat: 'water', fertilisation: 'external', eggs: '100s to 1000s at a time', survival: 'low' },
  { animal: 'Frog', habitat: 'water/land', fertilisation: 'external', eggs: '5000 to 50 000 at a time', survival: 'low' },
  { animal: 'Lizard', habitat: 'land', fertilisation: 'internal', eggs: '2 to 20 at a time', survival: 'moderate' },
  { animal: 'Bird', habitat: 'water/land', fertilisation: 'internal', eggs: '1 to 15 at a time', survival: 'moderate to high' },
] as const;

/** Of `eggs` laid, the number expected to survive if a fraction `survival` survive. */
export const survivors = (eggs: number, survival: number): number => Math.round(eggs * survival);

// ---------- Human reproduction (Section 11.5, Table 11.5, Fig. 11.21) ----------

export const GAMETES = {
  sperm: { size: 'very small', number: 'millions', nutrients: 'absent', motility: 'actively motile' },
  egg: { size: 'large', number: 'few', nutrients: 'present', motility: 'non-motile' },
} as const;

/** Mother always gives X; the father gives X or Y with equal chance. */
export function babySex(fromFather: 'X' | 'Y'): 'female (XX)' | 'male (XY)' {
  return fromFather === 'X' ? 'female (XX)' : 'male (XY)';
}

export const DAY_MS = 86400000;
/** Dates as UTC midnight to avoid time-zone shifts. */
export const utcDate = (y: number, m: number, d: number): Date => new Date(Date.UTC(y, m - 1, d));
export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);

export interface CycleForecast { nextPeriod: Date; ovulation: Date; cycleLength: number }
/**
 * The next period starts one cycle length after the first day of the last one; ovulation is usually about 14 days before the
 * next period (day 14 of a 28-day cycle). Cycles of 21 to 35 days are typical, so these are estimates, not certainties.
 */
export function forecastCycle(lastPeriodStart: Date, cycleLength = 28): CycleForecast {
  const nextPeriod = addDays(lastPeriodStart, cycleLength);
  return { nextPeriod, ovulation: addDays(nextPeriod, -14), cycleLength };
}
export const TYPICAL_CYCLE_RANGE: [number, number] = [21, 35];

/** Phase of a 28-day cycle on a given day (Fig. 11.21). */
export function cyclePhase(day: number): 'menstruation' | 'lining rebuilds' | 'ovulation' | 'lining thickens' {
  if (day <= 5) return 'menstruation';
  if (day < 14) return 'lining rebuilds';
  if (day === 14) return 'ovulation';
  return 'lining thickens';
}

export const PREGNANCY_WEEKS = 40;
/** The developing baby is called an embryo for about the first eight weeks and a foetus from about the ninth week. */
export const stageName = (week: number): 'embryo' | 'foetus' => (week < 9 ? 'embryo' : 'foetus');
export const trimester = (week: number): 1 | 2 | 3 => (week <= 13 ? 1 : week <= 26 ? 2 : 3);
