// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { EduChapter, VisualRef } from '../../../engine/education/types';
import { CELL_CHAPTER } from '../../../engine/biology/cell/learn/content';
import { TISSUES_CHAPTER } from '../../../engine/biology/tissues/learn/content';
import { REPRODUCTION_CHAPTER } from '../../../engine/biology/reproduction/learn/content';
import { DIVERSITY_CHAPTER } from '../../../engine/biology/diversity/learn/content';
import { CELL_PARTS } from '../../../engine/biology/cell/model';
import { FLOWER_PARTS } from '../../../engine/biology/reproduction/model';
import { JOINT_PARTS, JOINT_RANGES, JOINTS, canMove, type JointId } from '../../../engine/biology/tissues/model';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }

let host: HTMLDivElement; let root: Root;
beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const q = (sel: string) => host.querySelector(sel) as HTMLElement | null;
const click = (el: Element | null) => act(() => { el!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

/** Every visual a chapter refers to: lesson steps, worked examples, practice prompts and practice solutions. */
function visualsOf(ch: EduChapter): VisualRef[] {
  const out: VisualRef[] = [];
  for (const l of Object.values(ch.lessons)) {
    for (const s of l.steps) if (s.visual) out.push(s.visual);
    if (l.worked?.visual) out.push(l.worked.visual);
  }
  for (const g of ch.practice?.groups ?? []) for (const it of g.items) { if (it.visual) out.push(it.visual); if (it.solutionVisual) out.push(it.solutionVisual); }
  return out;
}

describe('Biology is diagram-led: lessons and practice solutions use diagrams that exist', () => {
  it('every visual a Biology chapter refers to is registered for that chapter (a missing one would silently fall back to text)', async () => {
    const { CELL_VISUALS } = await import('../cell/CellVisuals');
    const { TISSUE_VISUALS } = await import('../tissues/TissueVisuals');
    const { REPRO_VISUALS } = await import('../reproduction/ReproVisuals');
    const { DIVERSITY_VISUALS } = await import('../diversity/DiversityVisuals');
    for (const [ch, reg] of [[CELL_CHAPTER, CELL_VISUALS], [TISSUES_CHAPTER, TISSUE_VISUALS], [REPRODUCTION_CHAPTER, REPRO_VISUALS], [DIVERSITY_CHAPTER, DIVERSITY_VISUALS]] as const) {
      for (const v of visualsOf(ch)) expect(reg[v.kind], `${ch.id}: ${v.kind}`).toBeDefined();
    }
  });

  it('most lesson steps now carry a diagram, and each chapter puts diagrams in practice solutions', () => {
    for (const ch of [CELL_CHAPTER, TISSUES_CHAPTER, REPRODUCTION_CHAPTER, DIVERSITY_CHAPTER]) {
      const steps = Object.values(ch.lessons).flatMap((l) => l.steps);
      expect(steps.filter((s) => s.visual).length / steps.length, ch.id).toBeGreaterThanOrEqual(0.5);
      const solutions = ch.practice!.groups.flatMap((g) => g.items).filter((it) => it.solutionVisual);
      expect(solutions.length, ch.id).toBeGreaterThanOrEqual(3);
      // A solution diagram is never also shown with the question (it could give the answer away).
      for (const it of solutions) expect(it.visual).toBeUndefined();
    }
  });
});

describe('labelled diagrams: tap-to-inspect, keyboard and text alternatives', () => {
  it('tapping a numbered marker shows that part’s name and job; Enter on a focused marker does the same', async () => {
    const { NucleusVisual } = await import('../cell/CellDiagrams');
    act(() => root.render(<NucleusVisual props={{}} alt="nucleus" />));
    expect(q('[data-testid="nucleus-diagram-inspect"]')!.textContent).toContain('Tap a number');
    click(q('[data-hotspot="nucleolus"]'));
    expect(q('[data-testid="nucleus-diagram-inspect"]')!.textContent).toContain('Nucleolus');
    expect(q('[data-hotspot="nucleolus"]')!.getAttribute('aria-pressed')).toBe('true');
    const pore = q('[data-hotspot="pore"]')!;
    expect(pore.getAttribute('tabindex')).toBe('0');
    act(() => { pore.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    expect(q('[data-testid="nucleus-diagram-inspect"]')!.textContent).toContain('Nuclear pores');
    // Every part is also listed in words, and the badge says it is a schematic.
    expect(host.querySelectorAll('.bio-parts > li')).toHaveLength(5);
    expect(q('[data-diagram-kind]')!.textContent).toContain('Schematic diagram');
  });

  it('a process sequence steps through its stages and can show them all at once', async () => {
    const { PollenToSeedVisual } = await import('../reproduction/ReproDiagrams');
    act(() => root.render(<PollenToSeedVisual props={{}} alt="pollen" />));
    expect(q('[data-testid="pollen-to-seed-caption"]')!.textContent).toContain('lands on the sticky stigma');
    click(q('[data-action="step-next"]'));
    expect(q('[data-testid="pollen-to-seed-caption"]')!.textContent).toContain('grows a tube down through the style');
    click(q('[data-action="show-all-stages"]'));
    expect(host.querySelectorAll('.bio-sequence-all > li')).toHaveLength(4);
  });

  it('a practice solution diagram appears only once the solution is shown', async () => {
    const { IndependentCard } = await import('../../education/LessonParts');
    const { VisualRegistryProvider } = await import('../../education/visuals');
    const { TonicityVisual } = await import('../cell/CellDiagrams');
    const item = CELL_CHAPTER.practice!.groups.flatMap((g) => g.items).find((it) => it.id === 'bcx-4')!;
    expect(item.solutionVisual?.kind).toBe('tonicity');
    act(() => root.render(<VisualRegistryProvider value={{ tonicity: TonicityVisual }}><IndependentCard item={item} lessonId="" index={0} practiceChapterId="cell-test" /></VisualRegistryProvider>));
    expect(q('[data-testid="tonicity-compare"]')).toBeNull();
    click(q('[data-option="o0"]'));
    click([...host.querySelectorAll('button')].find((b) => b.textContent === 'Check answer')!);
    click([...host.querySelectorAll('button')].find((b) => b.textContent?.includes('Show solution'))!);
    expect(q('[data-testid="solution-visual"] [data-testid="tonicity-compare"]')).not.toBeNull();
  });
});

describe('2D is the default; 3D is optional, lazy and falls back cleanly', () => {
  it('the cell explorer, flower and joints start in 2D, and without WebGL the 3D button is disabled with an explanation', async () => {
    const { CellCompareVisual } = await import('../cell/CellVisuals');
    const { FlowerPartsVisual } = await import('../reproduction/ReproVisuals');
    const { JointsVisual } = await import('../tissues/TissueVisuals');
    for (const [V, id] of [[CellCompareVisual, 'cell-compare'], [FlowerPartsVisual, 'flower-parts'], [JointsVisual, 'joints']] as const) {
      act(() => root.render(<V props={{ editable: true }} alt="x" />));
      expect(q(`[data-testid="${id}"]`)!.getAttribute('data-view') ?? '2d').toBe('2d');
      expect(q('[data-viewmode="2d"]')!.getAttribute('aria-pressed')).toBe('true');
      const three = q('[data-viewmode="3d"]') as HTMLButtonElement;
      expect(three.textContent).toContain('Explore in 3D');
      expect(three.disabled).toBe(true); // happy-dom has no WebGL
      expect(host.textContent).toContain('3D is not available on this device');
      expect(q('[data-testid="bio3d"]')).toBeNull();
    }
  });

  it('three.js is imported only by the lazily loaded viewer and its models, never by a page, lesson or the switch', () => {
    const files = import.meta.glob(['../**/*.tsx', '../**/*.ts', '../../education/*.tsx', '../../explorer/*.tsx', '../../../components/*.tsx'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const users = Object.entries(files).filter(([, src]) => /from\s+['"]three(\/|['"])/.test(src)).map(([f]) => f.replace(/^.*\/biology\//, ''));
    expect(users.sort()).toEqual(['../three/Bio3DViewer.tsx', '../three/models.ts']);
    const sw = files['../three/ViewMode.tsx'];
    expect(sw).toMatch(/lazy\(\(\) => import\('\.\/Bio3DViewer'\)\)/);
    // Only a type import (erased at build time) is allowed; a value import would pull three.js into the page bundle.
    expect(sw).not.toMatch(/^import (?!type )[^\n]*from '\.\/Bio3DViewer'/m);
  });

  it('the 3D viewer has no animation loop and nothing turns by itself', () => {
    const files = import.meta.glob(['../three/*.tsx', '../three/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const viewer = files['../three/Bio3DViewer.tsx'];
    expect(viewer).not.toMatch(/setAnimationLoop|autoRotate\s*=\s*true|setInterval/);
    expect(viewer).toMatch(/enableDamping = false/);
    expect(viewer).toMatch(/forceContextLoss\(\)/);
    expect(viewer).toMatch(/\.dispose\(\)/);
  });
});

describe('3D models match the 2D content and the science', () => {
  it('each model’s selectable parts are exactly the parts the lesson explains, with a label anchor for each', async () => {
    const { buildModel } = await import('../three/models');
    const plant = buildModel({ kind: 'cell', cell: 'plant' });
    const animal = buildModel({ kind: 'cell', cell: 'animal' });
    expect([...plant.parts.keys()].sort()).toEqual(CELL_PARTS.filter((p) => p.in.plant).map((p) => p.id).sort());
    expect([...animal.parts.keys()].sort()).toEqual(CELL_PARTS.filter((p) => p.in.animal).map((p) => p.id).sort());
    expect(plant.parts.has('lysosome')).toBe(false);
    expect(animal.parts.has('wall') || animal.parts.has('chloroplast')).toBe(false);
    const flower = buildModel({ kind: 'flower' });
    expect([...flower.parts.keys()].sort()).toEqual(Object.keys(FLOWER_PARTS).sort());
    for (const joint of Object.keys(JOINTS) as JointId[]) {
      const m = buildModel({ kind: 'joint', joint });
      expect([...m.parts.keys()].sort(), joint).toEqual(JOINT_PARTS[joint].map((p) => p.id).sort());
      for (const id of m.parts.keys()) expect(m.anchors.has(id), `${joint}: ${id}`).toBe(true);
    }
    for (const m of [plant, animal, flower]) for (const id of m.parts.keys()) expect(m.anchors.has(id), id).toBe(true);
  });

  it('in the plant cell the large central vacuole fills most of the cell and the nucleus sits to one side', async () => {
    const { buildModel } = await import('../three/models');
    const { Box3, Vector3 } = await import('three');
    const plant = buildModel({ kind: 'cell', cell: 'plant' });
    const size = (id: string) => new Box3().setFromObject(plant.parts.get(id)![0]).getSize(new Vector3());
    const cell = size('membrane'), vac = size('vacuole');
    expect((vac.x * vac.y * vac.z) / (cell.x * cell.y * cell.z)).toBeGreaterThan(0.45);
    const nucleus = plant.parts.get('nucleus')![0].position;
    expect(Math.abs(nucleus.x)).toBeGreaterThan(cell.x / 3);
  });

  it('joint movement ranges agree with which movements each joint allows', () => {
    for (const joint of Object.keys(JOINTS) as JointId[]) {
      const r = JOINT_RANGES[joint];
      expect(Boolean(r.bend), `${joint} bend`).toBe(canMove(joint, 'bend'));
      expect(Boolean(r.sideways), `${joint} sideways`).toBe(canMove(joint, 'sideways'));
      expect(Boolean(r.turn), `${joint} turn`).toBe(canMove(joint, 'turn'));
    }
    expect(canMove('ball-socket', 'turn')).toBe(true); // the arm can rotate about its length at the shoulder
    expect(canMove('hinge', 'turn')).toBe(false);
    expect(JOINT_RANGES.hinge.bend![1]).toBeLessThanOrEqual(150);
  });
});
