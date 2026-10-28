/**
 * One colour per structure for the whole Biology section, so a nucleus, a chloroplast or a piece of cartilage looks the same in
 * every lesson diagram, laboratory and 3D model. `fill` is the body colour and `line` the outline. Colours only help tell parts
 * apart: every diagram also names each part in words.
 */

export interface BioColour { fill: string; line: string }

const c = (fill: string, line: string): BioColour => ({ fill, line });

export const BIO: Record<string, BioColour> = {
  // Cell (Chapter 2)
  wall: c('#bbf7d0', '#15803d'),
  membrane: c('#fecaca', '#dc2626'),
  plantMembrane: c('#86efac', '#22c55e'),
  cytoplasm: c('#fef9c3', '#ca8a04'),
  nucleus: c('#c4b5fd', '#6d28d9'),
  nucleolus: c('#7c3aed', '#4c1d95'),
  chromatin: c('#a78bfa', '#5b21b6'),
  chloroplast: c('#4ade80', '#166534'),
  mitochondria: c('#fdba74', '#c2410c'),
  er: c('#5eead4', '#0f766e'),
  golgi: c('#f9a8d4', '#be185d'),
  lysosome: c('#fde047', '#a16207'),
  vacuole: c('#e0f2fe', '#0284c7'),
  ribosome: c('#94a3b8', '#475569'),
  water: c('#7dd3fc', '#38bdf8'),
  solute: c('#f8fafc', '#cbd5e1'),
  // Tissues (Chapter 3)
  xylem: c('#60a5fa', '#1d4ed8'),
  phloem: c('#86efac', '#16a34a'),
  sclerenchyma: c('#d97706', '#a16207'),
  parenchyma: c('#ecfccb', '#65a30d'),
  collenchyma: c('#bef264', '#4d7c0f'),
  bone: c('#e7e5e4', '#78716c'),
  cartilage: c('#93c5fd', '#2563eb'),
  ligament: c('#fcd34d', '#b45309'),
  tendon: c('#f5f5f4', '#a8a29e'),
  muscle: c('#fca5a5', '#b91c1c'),
  synovial: c('#a5f3fc', '#0891b2'),
  neuron: c('#c4b5fd', '#7c3aed'),
  myelin: c('#fde68a', '#ca8a04'),
  // Flower and reproduction (Chapter 11)
  sepal: c('#22c55e', '#15803d'),
  petal: c('#f9a8d4', '#db2777'),
  anther: c('#f59e0b', '#b45309'),
  filament: c('#fde68a', '#ca8a04'),
  stigma: c('#65a30d', '#3f6212'),
  style: c('#84cc16', '#4d7c0f'),
  ovary: c('#a3e635', '#4d7c0f'),
  ovule: c('#fef9c3', '#a16207'),
  pollen: c('#facc15', '#a16207'),
  pollenTube: c('#fde047', '#ca8a04'),
  egg: c('#fbcfe8', '#be185d'),
  sperm: c('#bfdbfe', '#2563eb'),
  // Diversity (Chapter 12)
  hypha: c('#e2e8f0', '#94a3b8'),
  spore: c('#334155', '#0f172a'),
  rhizoid: c('#d6d3d1', '#78716c'),
};

/** The highlight used for the part a student has selected, in every Biology diagram and 3D model. */
export const SELECTED = '#facc15';
export const SCENE_TEXT = '#e2e8f0';
export const SCENE_MUTED = '#94a3b8';
