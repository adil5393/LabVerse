/**
 * Schematic 3D models for Biology: a plant cell, an animal cell, a complete flower and four kinds of joint. Built from simple
 * shapes at load time (no downloaded model files), so they work offline and load quickly. Part ids match the 2D diagrams and
 * the models in `engine/biology`, so selecting a part in 3D shows the same explanation as in 2D.
 *
 * Proportions (reviewed against NCERT Class 9 Chapters 2, 3 and 11 and standard histology figures):
 *  - Plant cell: a leaf cell about 60 × 36 × 36 µm (1 unit = 10 µm). The central vacuole fills most of the cell and pushes the
 *    nucleus (about 10 µm) and a thin layer of cytoplasm against the wall. Chloroplasts are about 7 µm long, lens-shaped and
 *    lie in that thin layer. Mitochondria (drawn about 1.5 × 3.5 µm) are slightly enlarged so they can be seen and tapped.
 *  - Animal cell: about 25 µm across (1 unit ≈ 6 µm) with a central nucleus about 7 µm across, rough ER continuous with the
 *    nuclear envelope, Golgi stacks beside the nucleus, mitochondria, lysosomes and a small vacuole.
 *  - Organelles are far fewer than in a real cell (which has hundreds of mitochondria and millions of ribosomes).
 *  - Flower: a generalised complete flower about 6 cm across, five sepals, five petals, eight stamens and one pistil whose
 *    stigma stands just above the anthers.
 *  - Joints: bone shapes simplified; the ball sits in a shallow socket, the hinge spool sits in a hook-shaped notch, the ring
 *    of the first neck vertebra turns on the peg of the second. Movement ranges come from `JOINT_RANGES`.
 */

import {
  BoxGeometry, CapsuleGeometry, CatmullRomCurve3, Color, ConeGeometry, CylinderGeometry, DoubleSide, Group, InstancedMesh, Matrix4,
  Mesh, MeshStandardMaterial, Object3D, Plane, Quaternion, SphereGeometry, TorusGeometry, TubeGeometry, Vector3, type BufferGeometry,
  type Material,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { BIO } from '../shared/bioPalette';
import type { JointAxis, JointId } from '../../../engine/biology/tissues/model';

export type ModelSpec = { kind: 'cell'; cell: 'plant' | 'animal' } | { kind: 'flower' } | { kind: 'joint'; joint: JointId };
export type JointAngles = Record<JointAxis, number>;

export interface Layer { id: string; label: string; objects: Object3D[]; on: boolean }
export interface Built {
  root: Group;
  /** Selectable meshes for each part id. */
  parts: Map<string, Mesh[]>;
  /** Where the label of each part points, in the local space of an object (so it follows moving bones). */
  anchors: Map<string, { object: Object3D; at: Vector3 }>;
  layers: Layer[];
  /** A cut-away plane that removes the front of some outer layers (`constant` goes from `max` to 0). */
  cut?: { label: string; plane: Plane; max: number; materials: Material[] };
  /** Moves a joint model. */
  pose?: (a: JointAngles) => void;
  camera: { position: Vector3; target: Vector3; min: number; max: number };
  /** The space to keep in view (for a joint, everywhere the moving bone can reach). Defaults to the model at rest. */
  frame?: { centre: Vector3; radius: number };
}

/** Deterministic pseudo-random numbers, so every student sees the same model. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

interface MatOpts { opacity?: number; double?: boolean; emissive?: string }
const material = (colour: string, o: MatOpts = {}): MeshStandardMaterial => new MeshStandardMaterial({
  color: new Color(colour), roughness: 0.6, metalness: 0,
  transparent: o.opacity !== undefined && o.opacity < 1, opacity: o.opacity ?? 1, depthWrite: o.opacity === undefined || o.opacity >= 1,
  side: o.double ? DoubleSide : undefined,
});

class Builder {
  root = new Group();
  parts = new Map<string, Mesh[]>();
  anchors = new Map<string, { object: Object3D; at: Vector3 }>();
  /** One material per part and colour, so highlighting one part never lights up another. */
  private mats = new Map<string, MeshStandardMaterial>();

  mat(part: string, colour: string, o: MatOpts = {}): MeshStandardMaterial {
    const key = `${part}|${colour}|${o.opacity ?? 1}|${o.double ? 1 : 0}`;
    let m = this.mats.get(key);
    if (!m) { m = material(colour, o); this.mats.set(key, m); }
    return m;
  }

  /** Adds a mesh; when `part` is given the mesh becomes selectable as that part. */
  add<T extends Mesh>(mesh: T, part?: string, parent: Object3D = this.root): T {
    if (part) {
      mesh.userData.part = part;
      const list = this.parts.get(part) ?? [];
      list.push(mesh);
      this.parts.set(part, list);
    }
    parent.add(mesh);
    return mesh;
  }

  anchor(part: string, at: Vector3, object: Object3D = this.root) { this.anchors.set(part, { object, at }); }
}

const at = <T extends Object3D>(m: T, x: number, y: number, z: number): T => { m.position.set(x, y, z); return m; };

/** Places a unit cylinder (height 1 along y) so it runs from `a` to `b` (used for ligaments that follow moving bones). */
function strut(mesh: Mesh, a: Vector3, b: Vector3) {
  const d = new Vector3().subVectors(b, a);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize());
  mesh.scale.set(1, d.length(), 1);
}

/** Ribosomes as one instanced mesh of tiny spheres (cheap to draw however many there are). */
function ribosomes(b: Builder, points: Vector3[], radius: number) {
  const geo = new SphereGeometry(radius, 6, 4);
  const mesh = new InstancedMesh(geo, b.mat('ribosome', BIO.ribosome.line), points.length);
  const m = new Matrix4();
  points.forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)));
  mesh.instanceMatrix.needsUpdate = true;
  b.add(mesh, 'ribosome');
  return mesh;
}

/** A tube along a smooth curve through `points`, plus points along it (for ribosomes on rough ER). */
function tube(b: Builder, part: string, colour: string, points: Vector3[], radius: number): Vector3[] {
  const curve = new CatmullRomCurve3(points);
  b.add(new Mesh(new TubeGeometry(curve, 48, radius, 6, false), b.mat(part, colour)), part);
  return curve.getSpacedPoints(24);
}

function golgi(b: Builder, centre: Vector3, normal: Vector3, size: number) {
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal.clone().normalize());
  [1, 0.9, 0.78, 0.66].forEach((k, i) => {
    const disc = new Mesh(new CylinderGeometry(size * k, size * k, size * 0.1, 20), b.mat('golgi', BIO.golgi.fill));
    disc.quaternion.copy(q);
    disc.position.copy(centre).addScaledVector(normal.clone().normalize(), i * size * 0.24);
    b.add(disc, 'golgi');
  });
}

function mitochondrion(b: Builder, p: Vector3, dir: Vector3, r: number) {
  const m = new Mesh(new CapsuleGeometry(r, r * 2.6, 4, 10), b.mat('mitochondria', BIO.mitochondria.fill));
  m.position.copy(p);
  m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  b.add(m, 'mitochondria');
}

// ---------- Plant cell ----------

function plantCell(): Built {
  const b = new Builder();
  const rnd = seeded(7);
  const W = 6, H = 3.6, D = 3.6;
  const cutPlane = new Plane(new Vector3(0, 0, -1), D / 2 + 0.1);
  const outer: Material[] = [];
  const shell = (part: string, w: number, h: number, d: number, colour: string, opacity: number, radius: number) => {
    const m = b.mat(part, colour, { opacity, double: true });
    m.clippingPlanes = [cutPlane];
    outer.push(m);
    const mesh = b.add(new Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), m), part);
    mesh.renderOrder = 2;
    return mesh;
  };
  const wall = shell('wall', W, H, D, BIO.wall.line, 0.3, 0.25);
  const membrane = shell('membrane', W - 0.24, H - 0.24, D - 0.24, BIO.plantMembrane.line, 0.2, 0.22);
  const cytoplasm = shell('cytoplasm', W - 0.3, H - 0.3, D - 0.3, BIO.cytoplasm.fill, 0.08, 0.2);
  const vacuole = shell('vacuole', 4.4, 2.7, 2.7, BIO.vacuole.fill, 0.36, 0.8);
  vacuole.position.set(0.45, 0, 0);
  // Nucleus pushed to one side by the vacuole, with its nucleolus.
  const nucleusAt = new Vector3(-2.25, 0.75, 0.3);
  b.add(at(new Mesh(new SphereGeometry(0.5, 32, 20), b.mat('nucleus', BIO.nucleus.fill)), nucleusAt.x, nucleusAt.y, nucleusAt.z), 'nucleus');
  b.add(at(new Mesh(new SphereGeometry(0.2, 16, 12), b.mat('nucleus', BIO.nucleolus.fill)), nucleusAt.x + 0.12, nucleusAt.y + 0.08, nucleusAt.z + 0.38), 'nucleus');
  // Chloroplasts lie in the thin layer of cytoplasm along the four long faces.
  const chloroGeo = new SphereGeometry(1, 18, 12);
  const chloroMat = b.mat('chloroplast', BIO.chloroplast.fill);
  const faces: [Vector3, Vector3][] = [[new Vector3(0, 1, 0), new Vector3(0.36, 0.12, 0.26)], [new Vector3(0, -1, 0), new Vector3(0.36, 0.12, 0.26)], [new Vector3(0, 0, 1), new Vector3(0.36, 0.26, 0.12)], [new Vector3(0, 0, -1), new Vector3(0.36, 0.26, 0.12)]];
  faces.forEach(([n, s], f) => {
    for (let i = 0; i < 4; i++) {
      const x = -1.3 + i * 1.15 + (rnd() - 0.5) * 0.3;
      const across = (rnd() - 0.5) * 1.6;
      const c = new Mesh(chloroGeo, chloroMat);
      c.scale.copy(s);
      c.position.set(x, n.y !== 0 ? n.y * 1.5 : across, n.z !== 0 ? n.z * 1.5 : across);
      c.rotation.x = f > 1 ? 0 : (rnd() - 0.5) * 0.4;
      b.add(c, 'chloroplast');
    }
  });
  // Mitochondria in the cytoplasm between the chloroplasts and around the nucleus.
  for (let i = 0; i < 9; i++) {
    const face = faces[i % 4][0];
    const x = -1.9 + ((i * 0.83) % 4.4);
    const across = (rnd() - 0.5) * 2;
    mitochondrion(b, new Vector3(x, face.y !== 0 ? face.y * 1.52 : across, face.z !== 0 ? face.z * 1.52 : across), new Vector3(1, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6), 0.075);
  }
  mitochondrion(b, new Vector3(-2.5, -0.9, -0.9), new Vector3(0.2, 1, 0.3), 0.075);
  mitochondrion(b, new Vector3(-2.45, -1.0, 0.9), new Vector3(0.1, 0.4, 1), 0.075);
  // Rough ER wrapping round the nucleus, joined to its envelope.
  const er: Vector3[] = [];
  [0.68, 0.82].forEach((r, k) => {
    const pts = Array.from({ length: 9 }, (_, i) => {
      const t = -0.9 + i * 0.32 + k * 0.2;
      return new Vector3(nucleusAt.x + r * Math.cos(t) * 0.55, nucleusAt.y - r * Math.sin(t) * 0.8 - 0.1, nucleusAt.z + r * Math.cos(t * 1.3) * 0.6 - 0.25);
    });
    er.push(...tube(b, 'er', BIO.er.line, pts, 0.035));
  });
  golgi(b, new Vector3(-2.3, -0.75, 0.15), new Vector3(0.3, 1, 0), 0.3);
  const free = Array.from({ length: 24 }, () => new Vector3(-2.7 + rnd() * 0.8, (rnd() - 0.5) * 2.8, (rnd() - 0.5) * 2.8));
  ribosomes(b, [...er, ...free], 0.035);

  b.anchor('wall', new Vector3(W / 2 - 0.2, H / 2, D / 2 - 0.4));
  b.anchor('membrane', new Vector3(1.6, H / 2 - 0.12, -D / 2 + 0.3));
  b.anchor('cytoplasm', new Vector3(-2.5, -0.2, -1.2));
  b.anchor('vacuole', new Vector3(1.3, 0.6, 1.35));
  b.anchor('nucleus', nucleusAt.clone().add(new Vector3(0, 0.5, 0)));
  b.anchor('chloroplast', new Vector3(1.0, 1.55, 0.4));
  b.anchor('mitochondria', new Vector3(-2.5, -0.9, -0.9));
  b.anchor('er', er[6]);
  b.anchor('golgi', new Vector3(-2.3, -0.5, 0.15));
  b.anchor('ribosome', free[3]);
  return {
    root: b.root, parts: b.parts, anchors: b.anchors,
    layers: [
      { id: 'wall', label: 'Cell wall', objects: [wall], on: true },
      { id: 'membrane', label: 'Membrane and cytoplasm', objects: [membrane, cytoplasm], on: true },
      { id: 'vacuole', label: 'Vacuole', objects: [vacuole], on: true },
    ],
    cut: { label: 'Cut away the front of the wall, membrane and vacuole', plane: cutPlane, max: D / 2 + 0.1, materials: outer },
    camera: { position: new Vector3(1.8, 3.4, 8), target: new Vector3(0, 0, 0), min: 3.5, max: 16 },
  };
}

// ---------- Animal cell ----------

function animalCell(): Built {
  const b = new Builder();
  const rnd = seeded(11);
  const R = 2;
  const cutPlane = new Plane(new Vector3(0, 0, -1), R + 0.1);
  const outer: Material[] = [];
  // A slightly irregular, flattened sphere: animal cells have no wall to hold a fixed shape.
  const blob = (r: number) => {
    const g = new SphereGeometry(r, 48, 32);
    const pos = g.attributes.position;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const k = 1 + 0.05 * Math.sin(3 * v.x + 1) * Math.cos(2 * v.y) + 0.03 * Math.sin(4 * v.z);
      pos.setXYZ(i, v.x * k, v.y * k * 0.82, v.z * k * 0.92);
    }
    g.computeVertexNormals();
    return g;
  };
  const shell = (part: string, g: BufferGeometry, colour: string, opacity: number) => {
    const m = b.mat(part, colour, { opacity, double: true });
    m.clippingPlanes = [cutPlane];
    outer.push(m);
    const mesh = b.add(new Mesh(g, m), part);
    mesh.renderOrder = 2;
    return mesh;
  };
  const membrane = shell('membrane', blob(R), BIO.membrane.line, 0.2);
  const cytoplasm = shell('cytoplasm', blob(R - 0.05), BIO.cytoplasm.fill, 0.07);
  const nucleusAt = new Vector3(0.15, 0.05, 0);
  b.add(at(new Mesh(new SphereGeometry(0.58, 32, 20), b.mat('nucleus', BIO.nucleus.fill)), nucleusAt.x, nucleusAt.y, nucleusAt.z), 'nucleus');
  b.add(at(new Mesh(new SphereGeometry(0.22, 16, 12), b.mat('nucleus', BIO.nucleolus.fill)), nucleusAt.x + 0.15, nucleusAt.y + 0.1, nucleusAt.z + 0.42), 'nucleus');
  const er: Vector3[] = [];
  [0.78, 0.92, 1.06].forEach((r, k) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const t = 0.4 + i * 0.36 + k * 0.25;
      return new Vector3(nucleusAt.x + r * Math.cos(t), nucleusAt.y + r * Math.sin(t) * 0.75, nucleusAt.z + 0.35 * Math.sin(2 * t + k));
    });
    er.push(...tube(b, 'er', BIO.er.line, pts, 0.03));
  });
  golgi(b, new Vector3(-0.95, -0.55, 0.25), new Vector3(0.6, 1, 0.2), 0.28);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.5) * 1.6, r = 1.05 + rnd() * 0.5;
    mitochondrion(b, new Vector3(r * Math.cos(a), r * Math.sin(e) * 0.75, r * Math.sin(a) * 0.8), new Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5), 0.07);
  }
  const lysoGeo = new SphereGeometry(0.12, 14, 10);
  const lysoMat = b.mat('lysosome', BIO.lysosome.fill);
  const lysos = [new Vector3(-1.1, 0.5, 0.6), new Vector3(1.2, -0.6, 0.5), new Vector3(-0.4, -1.0, -0.7), new Vector3(0.9, 0.8, -0.6), new Vector3(-1.3, -0.1, -0.5)];
  lysos.forEach((p) => b.add(at(new Mesh(lysoGeo, lysoMat), p.x, p.y, p.z), 'lysosome'));
  b.add(at(new Mesh(new SphereGeometry(0.17, 16, 12), b.mat('vacuole', BIO.vacuole.fill, { opacity: 0.8 })), -0.6, 0.95, 0.3), 'vacuole');
  const free = Array.from({ length: 30 }, () => { const a = rnd() * Math.PI * 2, r = 0.9 + rnd() * 0.8; return new Vector3(r * Math.cos(a), (rnd() - 0.5) * 1.8, r * Math.sin(a) * 0.8); });
  ribosomes(b, [...er, ...free], 0.03);

  b.anchor('membrane', new Vector3(0, R * 0.8, 0.2));
  b.anchor('cytoplasm', new Vector3(1.3, -0.9, -0.4));
  b.anchor('nucleus', nucleusAt.clone().add(new Vector3(0, 0.58, 0)));
  b.anchor('er', er[14]);
  b.anchor('golgi', new Vector3(-0.95, -0.4, 0.25));
  b.anchor('lysosome', lysos[0]);
  b.anchor('vacuole', new Vector3(-0.6, 1.1, 0.3));
  b.anchor('ribosome', free[2]);
  b.anchor('mitochondria', b.parts.get('mitochondria')![0].position.clone());
  return {
    root: b.root, parts: b.parts, anchors: b.anchors,
    layers: [{ id: 'membrane', label: 'Membrane and cytoplasm', objects: [membrane, cytoplasm], on: true }],
    cut: { label: 'Cut away the front of the cell', plane: cutPlane, max: R + 0.1, materials: outer },
    camera: { position: new Vector3(2.6, 2.4, 5.2), target: new Vector3(0, 0, 0), min: 2.6, max: 12 },
  };
}

// ---------- Flower ----------

function flower(): Built {
  const b = new Builder();
  const green = b.mat('stalk', '#16a34a');
  b.add(at(new Mesh(new CylinderGeometry(0.1, 0.12, 1.3, 12), green), 0, -1.05, 0));
  const receptacle = new Mesh(new SphereGeometry(0.34, 20, 14), green);
  receptacle.scale.set(1, 0.6, 1);
  b.add(at(receptacle, 0, -0.42, 0));
  const leafGeo = new SphereGeometry(1, 24, 14);
  const sepals: Object3D[] = [], petals: Object3D[] = [], stamens: Object3D[] = [];
  for (let i = 0; i < 5; i++) {
    const g = new Group(); g.rotation.y = (i * 2 * Math.PI) / 5; g.position.y = -0.42; b.root.add(g);
    const tilt = new Group(); tilt.rotation.x = 0.35; g.add(tilt);
    const s = new Mesh(leafGeo, b.mat('sepal', BIO.sepal.fill)); s.scale.set(0.32, 0.05, 0.85); s.position.z = 0.82;
    b.add(s, 'sepal', tilt); sepals.push(g);
  }
  for (let i = 0; i < 5; i++) {
    const g = new Group(); g.rotation.y = ((i + 0.5) * 2 * Math.PI) / 5; g.position.y = -0.3; b.root.add(g);
    const tilt = new Group(); tilt.rotation.x = -0.55; g.add(tilt);
    const p = new Mesh(leafGeo, b.mat('petal', BIO.petal.fill, { double: true })); p.scale.set(0.78, 0.05, 1.5); p.position.z = 1.5;
    b.add(p, 'petal', tilt); petals.push(g);
  }
  const filamentGeo = new CylinderGeometry(0.025, 0.03, 1.7, 8); filamentGeo.translate(0, 0.85, 0);
  const antherGeo = new CapsuleGeometry(0.075, 0.16, 4, 10);
  let antherTip: Object3D | null = null;
  for (let i = 0; i < 8; i++) {
    const g = new Group(); g.rotation.y = (i * 2 * Math.PI) / 8 + 0.2; g.position.set(0, -0.25, 0); b.root.add(g);
    const lean = new Group(); lean.rotation.x = -0.3; lean.position.z = 0.22; g.add(lean);
    b.add(new Mesh(filamentGeo, b.mat('filament', BIO.filament.fill)), 'filament', lean);
    const a = new Mesh(antherGeo, b.mat('anther', BIO.anther.fill)); a.position.y = 1.78; b.add(a, 'anther', lean);
    if (i === 1) antherTip = a;
    stamens.push(g);
  }
  // Pistil: ovary (which can be cut open to show the ovules), style and stigma.
  const cutPlane = new Plane(new Vector3(0, 0, -1), 0.5);
  const ovaryMat = b.mat('ovary', BIO.ovary.fill, { double: true });
  ovaryMat.clippingPlanes = [cutPlane];
  const ovary = new Mesh(new SphereGeometry(0.38, 28, 18), ovaryMat); ovary.scale.set(1, 1.15, 1);
  b.add(at(ovary, 0, 0, 0), 'ovary');
  const ovuleGeo = new SphereGeometry(0.075, 12, 10);
  [[-0.12, -0.18], [0.12, -0.18], [-0.13, 0.0], [0.13, 0.0], [-0.11, 0.18], [0.11, 0.18]].forEach(([x, y]) => b.add(at(new Mesh(ovuleGeo, b.mat('ovule', BIO.ovule.fill)), x, y, -0.05), 'ovule'));
  b.add(at(new Mesh(new CylinderGeometry(0.05, 0.065, 1.65, 12), b.mat('style', BIO.style.fill)), 0, 1.2, 0), 'style');
  const stigma = new Mesh(new SphereGeometry(0.15, 18, 12), b.mat('stigma', BIO.stigma.fill)); stigma.scale.set(1.35, 0.6, 1.35);
  b.add(at(stigma, 0, 2.06, 0), 'stigma');

  b.anchor('sepal', new Vector3(0, -0.9, 1.4), b.root);
  b.anchor('petal', new Vector3(0.9, 1.0, 2.2));
  b.anchor('anther', new Vector3(0, 1.8, 0), antherTip ?? b.root);
  b.anchor('filament', new Vector3(0, 0.9, 0), (antherTip as Object3D | null)?.parent ?? b.root);
  b.anchor('stigma', new Vector3(0, 2.15, 0));
  b.anchor('style', new Vector3(0, 1.3, 0.06));
  b.anchor('ovary', new Vector3(0.3, 0.25, 0.2));
  b.anchor('ovule', new Vector3(0.11, 0.18, -0.05));
  return {
    root: b.root, parts: b.parts, anchors: b.anchors,
    layers: [{ id: 'sepals', label: 'Sepals', objects: sepals, on: true }, { id: 'petals', label: 'Petals', objects: petals, on: true }, { id: 'stamens', label: 'Stamens', objects: stamens, on: true }],
    cut: { label: 'Cut the ovary open to see the ovules', plane: cutPlane, max: 0.5, materials: [ovaryMat] },
    camera: { position: new Vector3(3.6, 3.4, 6.2), target: new Vector3(0, 0.55, 0), min: 2.2, max: 14 },
  };
}

// ---------- Joints ----------

const RAD = Math.PI / 180;

function ballSocket(): Built {
  const b = new Builder();
  const bone = (part: string) => b.mat(part, BIO.bone.fill, { double: true });
  // Shoulder blade with a shallow cup (the socket) facing outwards (+x).
  const blade = new Mesh(new BoxGeometry(0.6, 3.6, 2.6), bone('socket'));
  b.add(at(blade, -1.5, 0.2, 0), 'socket');
  const cup = new SphereGeometry(1.08, 32, 16, 0, Math.PI * 2, 0, 1.05); cup.rotateZ(Math.PI / 2);
  b.add(new Mesh(cup, bone('socket')), 'socket');
  const lining = new SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, 1.0); lining.rotateZ(Math.PI / 2);
  b.add(new Mesh(lining, b.mat('cartilage', BIO.cartilage.fill, { double: true })), 'cartilage');
  const arm = new Group(); b.root.add(arm);
  b.add(new Mesh(new SphereGeometry(0.9, 32, 20), bone('ball')), 'ball', arm);
  const cap = new SphereGeometry(0.93, 32, 16, 0, Math.PI * 2, 0, 1.2); cap.rotateZ(Math.PI / 2);
  b.add(new Mesh(cap, b.mat('cartilage', BIO.cartilage.fill)), 'cartilage', arm);
  const shaft = new Mesh(new CylinderGeometry(0.36, 0.32, 5.4, 18), bone('ball'));
  b.add(at(shaft, 0.35, -3.25, 0), 'ball', arm);
  b.add(at(new Mesh(new SphereGeometry(0.5, 18, 12), bone('ball')), 0.35, -5.95, 0), 'ball', arm);
  // A marker stripe along the front of the bone, so twisting can be seen.
  b.add(at(new Mesh(new BoxGeometry(0.08, 4.6, 0.08), b.mat('stripe', '#0f766e')), 0.35, -3.3, 0.36), undefined, arm);
  const ligGeo = new CylinderGeometry(0.07, 0.07, 1, 8); ligGeo.translate(0, 0, 0);
  const ligs = [[new Vector3(-0.55, 0.95, 0), new Vector3(0.45, -0.85, 0)], [new Vector3(-0.55, -0.95, 0), new Vector3(0.45, -1.15, 0)], [new Vector3(-0.55, 0, 0.95), new Vector3(0.35, -1.0, 0.45)], [new Vector3(-0.55, 0, -0.95), new Vector3(0.35, -1.0, -0.45)]]
    .map(([fixed, moving]) => ({ mesh: b.add(new Mesh(ligGeo, b.mat('ligament', BIO.ligament.fill)), 'ligament'), fixed, moving }));
  const pose = (a: JointAngles) => {
    arm.rotation.set(-a.bend * RAD, a.turn * RAD, a.sideways * RAD, 'ZXY');
    arm.updateMatrixWorld(true);
    for (const l of ligs) strut(l.mesh, l.fixed, arm.localToWorld(l.moving.clone()));
  };
  pose({ bend: 0, sideways: 0, turn: 0 });
  b.anchor('ball', new Vector3(0.3, 0.6, 0.55), arm);
  b.anchor('socket', new Vector3(-1.2, 1.5, 0.6));
  b.anchor('cartilage', new Vector3(-0.75, -0.6, 0.6));
  b.anchor('ligament', new Vector3(-0.1, 0.05, 0.98));
  return { root: b.root, parts: b.parts, anchors: b.anchors, layers: [{ id: 'ligaments', label: 'Ligaments', objects: ligs.map((l) => l.mesh), on: true }], pose, camera: { position: new Vector3(5.5, 1.2, 8.5), target: new Vector3(0.6, -0.6, 0), min: 4, max: 24 }, frame: { centre: new Vector3(0.6, -0.6, 0), radius: 6.2 } };
}

function hinge(): Built {
  const b = new Builder();
  const bone = (part: string) => b.mat(part, BIO.bone.fill);
  // Upper arm bone ending in a spool that lies across the joint (along x).
  b.add(at(new Mesh(new CylinderGeometry(0.42, 0.5, 5, 18), bone('upper')), 0, 3.0, 0), 'upper');
  const spool = new CylinderGeometry(0.55, 0.55, 1.9, 24); spool.rotateZ(Math.PI / 2);
  b.add(new Mesh(spool, bone('upper')), 'upper');
  const cart = new CylinderGeometry(0.6, 0.6, 1.7, 24, 1, true); cart.rotateZ(Math.PI / 2);
  b.add(new Mesh(cart, b.mat('cartilage', BIO.cartilage.fill, { opacity: 0.85, double: true })), 'cartilage');
  // Forearm with a hook-shaped notch wrapping the spool from below and behind.
  const fore = new Group(); b.root.add(fore);
  b.add(at(new Mesh(new CylinderGeometry(0.38, 0.32, 5, 18), bone('lower')), 0, -3.3, 0), 'lower', fore);
  for (const x of [-0.45, 0, 0.45]) {
    const pts = Array.from({ length: 12 }, (_, i) => { const t = Math.PI + 0.55 - (i / 11) * (Math.PI + 0.55 - 0.85); return new Vector3(x, 0.74 * Math.cos(t), -0.74 * Math.sin(t)); });
    b.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 24, 0.17, 8, false), bone('lower')), 'lower', fore);
  }
  b.add(at(new Mesh(new CylinderGeometry(0.4, 0.38, 0.6, 18), bone('lower')), 0, -0.9, 0), 'lower', fore);
  const ligGeo = new CylinderGeometry(0.08, 0.08, 1, 8);
  const ligs = [-1, 1].map((s) => ({ mesh: b.add(new Mesh(ligGeo, b.mat('ligament', BIO.ligament.fill)), 'ligament'), fixed: new Vector3(s * 1.0, 0.1, 0), moving: new Vector3(s * 0.48, -1.1, 0) }));
  const pose = (a: JointAngles) => {
    fore.rotation.set(-a.bend * RAD, 0, 0);
    fore.updateMatrixWorld(true);
    for (const l of ligs) strut(l.mesh, l.fixed, fore.localToWorld(l.moving.clone()));
  };
  pose({ bend: 0, sideways: 0, turn: 0 });
  b.anchor('upper', new Vector3(0.4, 2.2, 0.3));
  b.anchor('lower', new Vector3(0.3, -2.6, 0.3), fore);
  b.anchor('cartilage', new Vector3(0.7, 0.45, 0.35));
  b.anchor('ligament', new Vector3(1.0, -0.3, 0.1));
  return { root: b.root, parts: b.parts, anchors: b.anchors, layers: [{ id: 'ligaments', label: 'Side ligaments', objects: ligs.map((l) => l.mesh), on: true }], pose, camera: { position: new Vector3(9, 1.6, 4.2), target: new Vector3(0, 0.2, 0.8), min: 4, max: 24 }, frame: { centre: new Vector3(0, 0.2, 0.8), radius: 5.6 } };
}

function pivot(): Built {
  const b = new Builder();
  const bone = (part: string) => b.mat(part, BIO.bone.fill);
  b.add(at(new Mesh(new CylinderGeometry(1.1, 1.1, 0.9, 28), bone('peg')), 0, -1.3, -0.4), 'peg');
  b.add(at(new Mesh(new CylinderGeometry(0.3, 0.34, 1.7, 18), bone('peg')), 0, 0, 0), 'peg');
  b.add(at(new Mesh(new SphereGeometry(0.3, 16, 10), bone('peg')), 0, 0.85, 0), 'peg');
  const ring = new Group(); b.root.add(ring);
  const torus = new Mesh(new TorusGeometry(1.15, 0.24, 14, 40), bone('ring'));
  torus.rotation.x = Math.PI / 2; torus.position.set(0, 0.2, -0.62);
  b.add(torus, 'ring', ring);
  b.add(at(new Mesh(new BoxGeometry(1.5, 0.14, 0.16), b.mat('ligament', BIO.ligament.fill)), 0, 0.2, -0.46), 'ligament', ring);
  // Which way the head faces (the nose points forwards).
  const nose = new Mesh(new ConeGeometry(0.2, 0.6, 14), b.mat('facing', '#34d399'));
  nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.25, 0.85);
  b.add(nose, undefined, ring);
  const pose = (a: JointAngles) => { ring.rotation.set(0, a.turn * RAD, 0); };
  b.anchor('peg', new Vector3(0.3, 0.6, 0.1));
  b.anchor('ring', new Vector3(-1.2, 0.3, -0.6), ring);
  b.anchor('ligament', new Vector3(0.5, 0.3, -0.46), ring);
  return { root: b.root, parts: b.parts, anchors: b.anchors, layers: [], pose, camera: { position: new Vector3(2.6, 3.8, 4.6), target: new Vector3(0, -0.2, -0.3), min: 2.5, max: 14 } };
}

function fixed(): Built {
  const b = new Builder();
  const R = 3;
  for (const start of [-Math.PI / 2, Math.PI / 2]) {
    const g = new SphereGeometry(R, 40, 20, start + 0.012, Math.PI - 0.024, 0, 1.0);
    b.add(new Mesh(g, b.mat('plates', BIO.bone.fill, { double: true })), 'plates');
  }
  const pts = Array.from({ length: 26 }, (_, i) => { const th = 0.04 + (i / 25) * 0.94; const d = (i % 2 ? 1 : -1) * 0.045; return new Vector3(R * Math.sin(th) * d * 2.2, R * Math.cos(th) + 0.01, R * Math.sin(th)); });
  b.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 80, 0.05, 6, false), b.mat('suture', '#57534e')), 'suture');
  b.anchor('plates', new Vector3(-1.4, 2.6, 0.6));
  b.anchor('suture', pts[14]);
  return { root: b.root, parts: b.parts, anchors: b.anchors, layers: [], camera: { position: new Vector3(3.2, 5.6, 6.2), target: new Vector3(0, 1.8, 0.6), min: 3, max: 16 } };
}

export function buildModel(spec: ModelSpec): Built {
  if (spec.kind === 'cell') return spec.cell === 'plant' ? plantCell() : animalCell();
  if (spec.kind === 'flower') return flower();
  return spec.joint === 'ball-socket' ? ballSocket() : spec.joint === 'hinge' ? hinge() : spec.joint === 'pivot' ? pivot() : fixed();
}
