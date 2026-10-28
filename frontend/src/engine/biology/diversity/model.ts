/**
 * Chapter 12 (Patterns in Life: Diversity and Classification) model: the five kingdom key, plant groups, animal phyla and
 * vertebrate classes, the classification hierarchy and binomial names. Aligned to NCERT Exploration (2026-27) Sections 12.3
 * to 12.8, Figs 12.4, 12.5, 12.16 and 12.17, Table 12.3. Pure functions only.
 */

// ---------- Five kingdom key (Section 12.6, Fig. 12.5) ----------

export type Kingdom = 'Monera' | 'Protista' | 'Fungi' | 'Plantae' | 'Animalia';
export interface OrganismFeatures {
  cellular: boolean;
  nucleus: 'none' | 'true';
  cells: 'uni' | 'multi';
  wall: 'none' | 'cellulose' | 'chitin' | 'other';
  nutrition: 'autotrophic' | 'heterotrophic' | 'both';
}

export interface KingdomResult { kingdom: Kingdom | null; steps: string[] }

/** Follows the criteria of Fig. 12.5 in order: cell type, level of organisation, cell wall, mode of nutrition. */
export function classifyKingdom(f: OrganismFeatures): KingdomResult {
  const steps: string[] = [];
  if (!f.cellular) { steps.push('No cells at all (acellular), like a virus: it fits none of the five kingdoms.'); return { kingdom: null, steps }; }
  if (f.nucleus === 'none') { steps.push('No true nucleus: a prokaryote.'); return { kingdom: 'Monera', steps }; }
  steps.push('True nucleus: a eukaryote.');
  if (f.wall === 'chitin') { steps.push('Cell wall of chitin and absorbs its food: a fungus (even yeast, which is unicellular).'); return { kingdom: 'Fungi', steps }; }
  if (f.cells === 'uni') { steps.push('Single-celled eukaryote without a chitin wall: a protist.'); return { kingdom: 'Protista', steps }; }
  steps.push('Multicellular.');
  if (f.wall === 'none') { steps.push('No cell wall and depends on others for food: an animal.'); return { kingdom: 'Animalia', steps }; }
  if (f.nutrition === 'autotrophic') { steps.push('Cellulose cell wall and makes its own food: a plant.'); return { kingdom: 'Plantae', steps }; }
  steps.push('Cell wall but no chlorophyll, absorbing food from dead or living matter: placed with the fungi.');
  return { kingdom: 'Fungi', steps };
}

export const KINGDOM_FACTS: Record<Kingdom, { cells: string; nucleus: string; wall: string; nutrition: string; examples: string }> = {
  Monera: { cells: 'unicellular', nucleus: 'no true nucleus (prokaryotic)', wall: 'present', nutrition: 'autotrophic or heterotrophic', examples: 'bacteria, cyanobacteria' },
  Protista: { cells: 'unicellular', nucleus: 'true nucleus', wall: 'none, or of cellulose', nutrition: 'autotrophic or heterotrophic', examples: 'Amoeba, Paramecium, Euglena, Chlamydomonas' },
  Fungi: { cells: 'mostly multicellular', nucleus: 'true nucleus', wall: 'chitin', nutrition: 'heterotrophic, by absorption; mostly decomposers', examples: 'mushroom, yeast, Aspergillus, Penicillium' },
  Plantae: { cells: 'multicellular', nucleus: 'true nucleus', wall: 'cellulose', nutrition: 'autotrophic (photosynthesis)', examples: 'mosses, ferns, pines, grasses, roses' },
  Animalia: { cells: 'multicellular', nucleus: 'true nucleus', wall: 'none', nutrition: 'heterotrophic', examples: 'ant, snake, frog, bird, cat, human' },
};

/** Fig. 12.4: classification systems over time. */
export const CLASSIFICATION_TIMELINE = [
  { year: '4th century BCE', who: 'Aristotle', system: 'animals grouped by habitat: land, water and air' },
  { year: '1758', who: 'Carolus Linnaeus', system: 'two kingdoms: Plantae and Animalia' },
  { year: '1866', who: 'Ernst Haeckel', system: 'three kingdoms: Protista added for microscopic life' },
  { year: '1938', who: 'Herbert F. Copeland', system: 'four kingdoms: Monera separated from Protista' },
  { year: '1969', who: 'Robert H. Whittaker', system: 'five kingdoms: Monera, Protista, Fungi, Plantae, Animalia' },
] as const;

// ---------- Plant groups (Section 12.6.4, Table 12.3) ----------

export type PlantGroup = 'Thallophyta' | 'Bryophyta' | 'Pteridophyta' | 'Gymnosperm' | 'Angiosperm';
export interface PlantFeatures { body: 'thallus' | 'simple parts' | 'roots, stems and leaves'; vascular: boolean; seeds: boolean; fruits: boolean }

export function classifyPlant(f: PlantFeatures): PlantGroup {
  if (f.body === 'thallus') return 'Thallophyta';
  if (!f.vascular) return 'Bryophyta';
  if (!f.seeds) return 'Pteridophyta';
  return f.fruits ? 'Angiosperm' : 'Gymnosperm';
}

export const PLANT_GROUPS: Record<PlantGroup, { meaning: string; features: string; needsWaterToReproduce: boolean; example: string }> = {
  Thallophyta: { meaning: 'thallos, undifferentiated body', features: 'simple thallus with no roots, stems or leaves; mostly in water', needsWaterToReproduce: true, example: 'Spirogyra (algae)' },
  Bryophyta: { meaning: 'bryon, moss', features: 'rhizoids and simple stem-like and leaf-like parts; no vascular tissue; moist, shady places', needsWaterToReproduce: true, example: 'moss, Marchantia' },
  Pteridophyta: { meaning: 'pteron, feather', features: 'true roots, stems and leaves with xylem and phloem; no seeds', needsWaterToReproduce: true, example: 'ferns' },
  Gymnosperm: { meaning: 'gymnos, naked; spermos, seed', features: 'seeds not enclosed in fruits, often on cones; needle-like leaves', needsWaterToReproduce: false, example: 'pine, cycads' },
  Angiosperm: { meaning: 'angeion, vessel; spermos, seed', features: 'flowers, and seeds enclosed in fruits', needsWaterToReproduce: false, example: 'Gulmohar, grasses, roses' },
};

// ---------- Animals (Section 12.6.5, Fig. 12.16) ----------

export type Phylum = 'Porifera' | 'Cnidaria' | 'Platyhelminthes' | 'Nematoda' | 'Annelida' | 'Arthropoda' | 'Mollusca' | 'Echinodermata';
export interface PhylumFacts { meaning: string; level: 'cellular' | 'tissue' | 'organ' | 'organ system'; skeleton: 'none' | 'exoskeleton' | 'endoskeleton'; habitat: string; key: string; examples: string }

export const PHYLA: Record<Phylum, PhylumFacts> = {
  Porifera: { meaning: 'pore-bearers', level: 'cellular', skeleton: 'none', habitat: 'water (marine)', key: 'many pores; water flows through bringing food and oxygen; fixed in place', examples: 'sponges' },
  Cnidaria: { meaning: 'tentacle animals', level: 'tissue', skeleton: 'none', habitat: 'fresh and marine water', key: 'tentacles catch prey; one opening for food and waste', examples: 'Hydra, jellyfish, corals' },
  Platyhelminthes: { meaning: 'flatworms', level: 'organ', skeleton: 'none', habitat: 'water or inside a host', key: 'flat body with bilateral symmetry; one opening; many are parasites with hooks and suckers', examples: 'tapeworm, planaria' },
  Nematoda: { meaning: 'roundworms', level: 'organ system', skeleton: 'none', habitat: 'soil, water or inside a host', key: 'cylindrical body with two openings (mouth and anus)', examples: 'roundworms' },
  Annelida: { meaning: 'ringed worms', level: 'organ system', skeleton: 'none', habitat: 'moist soil or water', key: 'cylindrical body divided into segments; body cavity; nerve cord', examples: 'earthworm' },
  Arthropoda: { meaning: 'jointed limbs', level: 'organ system', skeleton: 'exoskeleton', habitat: 'land or water', key: 'segmented body with jointed legs and a hard external skeleton', examples: 'insects, crabs, spiders' },
  Mollusca: { meaning: 'soft-bodied', level: 'organ system', skeleton: 'exoskeleton', habitat: 'water or moist land', key: 'soft body with a muscular foot, often protected by a shell', examples: 'snail, squid, octopus' },
  Echinodermata: { meaning: 'spiny skin', level: 'organ system', skeleton: 'endoskeleton', habitat: 'marine water', key: 'spiny skin; hard internal skeleton of calcium carbonate but no notochord', examples: 'starfish, sea urchin' },
};

export interface InvertebrateFeatures { tissues: boolean; tentacles: boolean; flat: boolean; openings: 1 | 2; segmented: boolean; jointedLegs: boolean; softBodyFoot: boolean; spinySkin: boolean }

/** A simple key to the eight invertebrate phyla of Fig. 12.16. */
export function classifyInvertebrate(f: InvertebrateFeatures): Phylum {
  if (!f.tissues) return 'Porifera';
  if (f.spinySkin) return 'Echinodermata';
  if (f.jointedLegs) return 'Arthropoda';
  if (f.softBodyFoot) return 'Mollusca';
  if (f.tentacles && f.openings === 1) return 'Cnidaria';
  if (f.flat && f.openings === 1) return 'Platyhelminthes';
  return f.segmented ? 'Annelida' : 'Nematoda';
}

export type ChordateGroup = 'Protochordata' | 'Fish' | 'Amphibians' | 'Reptiles' | 'Birds' | 'Mammals';
export interface ChordateFeatures { backbone: boolean; covering: 'scales and gills' | 'moist skin' | 'dry scales' | 'feathers' | 'hair' }
export function classifyChordate(f: ChordateFeatures): ChordateGroup {
  if (!f.backbone) return 'Protochordata';
  return ({ 'scales and gills': 'Fish', 'moist skin': 'Amphibians', 'dry scales': 'Reptiles', feathers: 'Birds', hair: 'Mammals' } as const)[f.covering];
}
/** Notochord present at least once in life: chordate; otherwise a non-chordate (invertebrate). */
export const isChordate = (hasNotochord: boolean): boolean => hasNotochord;

// ---------- Hierarchy and names (Sections 12.7.1 and 12.8, Fig. 12.17, Table 12.3) ----------

export const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'] as const;
export type Rank = (typeof RANKS)[number];
export type Taxonomy = Record<Rank, string> & { common: string };

export const ORGANISMS: Taxonomy[] = [
  { common: 'Tiger', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'Panthera tigris' },
  { common: 'Lion', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'Panthera leo' },
  { common: 'House cat', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Felis', species: 'Felis catus' },
  { common: 'Dog', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'Canis familiaris' },
  { common: 'Human', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Homo', species: 'Homo sapiens' },
  { common: 'Pea', kingdom: 'Plantae', phylum: 'Magnoliophyta', class: 'Magnoliopsida', order: 'Fabales', family: 'Fabaceae', genus: 'Pisum', species: 'Pisum sativum' },
  { common: 'Mango', kingdom: 'Plantae', phylum: 'Magnoliophyta', class: 'Magnoliopsida', order: 'Sapindales', family: 'Anacardiaceae', genus: 'Mangifera', species: 'Mangifera indica' },
];

export const organism = (common: string): Taxonomy | undefined => ORGANISMS.find((o) => o.common.toLowerCase() === common.toLowerCase());

/** The most specific rank two organisms share, or null if they are in different kingdoms. */
export function lowestSharedRank(a: Taxonomy, b: Taxonomy): Rank | null {
  let shared: Rank | null = null;
  for (const r of RANKS) { if (a[r] !== b[r]) break; shared = r; }
  return shared;
}

export interface BinomialCheck { ok: boolean; problems: string[]; genus?: string; species?: string }
/** Rules for writing scientific names: two words, genus first with a capital letter, species in lower case. */
export function checkBinomial(name: string): BinomialCheck {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const problems: string[] = [];
  if (words.length !== 2) problems.push(`A scientific name has exactly two words; this has ${words.length}.`);
  const [genus = '', species = ''] = words;
  if (genus && !/^[A-Z][a-z]+$/.test(genus)) problems.push('The genus name must begin with a capital letter, with the rest in lower case.');
  if (species && !/^[a-z]+$/.test(species)) problems.push('The species name must be written entirely in lower case.');
  return { ok: problems.length === 0, problems, genus: genus || undefined, species: species || undefined };
}

/** Fewer members but more features in common as you go down the ranks. */
export const isMoreSpecific = (a: Rank, b: Rank): boolean => RANKS.indexOf(a) > RANKS.indexOf(b);
