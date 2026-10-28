// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }

let host: HTMLDivElement; let root: Root;
beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

const q = (sel: string) => host.querySelector(sel) as HTMLElement | null;
const click = (el: Element | null) => act(() => { (el as HTMLElement).click(); });
const choose = (sel: string, value: string) => act(() => {
  const el = host.querySelector(sel) as HTMLSelectElement;
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, value);
  el.dispatchEvent(new Event('change', { bubbles: true }));
});
const key = (el: Element, k: string) => act(() => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); });

describe('separation bench: presets, liquids, labels and calculations stay in sync', () => {
  it('the acetone and water preset shows acetone and water, not another pair', async () => {
    const { MixSeparationVisual } = await import('../../chemistry/mixtures/MixturesVisuals');
    act(() => root.render(<MixSeparationVisual props={{ editable: true, quiz: true }} alt="bench" />));
    const bench = q('[data-testid="mix-separation"]')!;
    expect((q('#sep-case') as HTMLSelectElement).value).toBe('acetone-water');
    expect((q('#sep-a') as HTMLSelectElement).value).toBe('acetone');
    expect((q('#sep-b') as HTMLSelectElement).value).toBe('water');
    expect(bench.getAttribute('data-boiling-points')).toBe('56,100');
    const mixture = q('[data-testid="mix-separation-mixture"]')!.textContent!;
    expect(mixture).toContain('Acetone and water');
    expect(mixture).toContain('56 °C and 100 °C');
    expect(mixture.toLowerCase()).not.toContain('benzene');
  });

  it('switching presets moves the liquid pickers, and picking liquids selects the matching preset or a custom pair', async () => {
    const { MixSeparationVisual } = await import('../../chemistry/mixtures/MixturesVisuals');
    act(() => root.render(<MixSeparationVisual props={{ editable: true }} alt="bench" />));
    const bench = () => q('[data-testid="mix-separation"]')!;
    choose('#sep-case', 'alcohol-benzene');
    expect((q('#sep-a') as HTMLSelectElement).value).toBe('alcohol');
    expect((q('#sep-b') as HTMLSelectElement).value).toBe('benzene');
    expect(bench().getAttribute('data-boiling-points')).toBe('78,80');
    expect(bench().getAttribute('data-method')).toBe('fractional-distillation');
    // A pair that is not a book example becomes a custom mixture with its own name and boiling points.
    choose('#sep-b', 'water');
    expect((q('#sep-case') as HTMLSelectElement).value).toBe('custom-liquids');
    expect(bench().getAttribute('data-boiling-points')).toBe('78,100');
    expect(q('[data-testid="mix-separation-mixture"]')!.textContent).toContain('Alcohol and water');
    // Water and benzene do not mix: two layers, separating funnel.
    choose('#sep-a', 'benzene');
    expect(bench().getAttribute('data-method')).toBe('separating-funnel');
    expect(bench().getAttribute('data-boiling-points')).toBe('');
    // Choosing acetone + water again lands back on the book preset.
    choose('#sep-a', 'acetone');
    expect((q('#sep-case') as HTMLSelectElement).value).toBe('acetone-water');
    expect(bench().getAttribute('data-method')).toBe('distillation');
  });

  it('a lesson figure for alcohol and benzene starts with those liquids', async () => {
    const { MixSeparationVisual } = await import('../../chemistry/mixtures/MixturesVisuals');
    act(() => root.render(<MixSeparationVisual props={{ editable: true, caseId: 'alcohol-benzene' }} alt="bench" />));
    expect((q('#sep-a') as HTMLSelectElement).value).toBe('alcohol');
    expect(q('[data-testid="mix-separation"]')!.getAttribute('data-liquids')).toBe('alcohol+benzene');
  });

  it('the model never disagrees with itself about a pair of liquids', async () => {
    const { BOILING_POINTS, MIXTURE_CASES, chooseMethod, twoLiquidCase } = await import('../../../engine/chemistry/mixtures/model');
    for (const c of MIXTURE_CASES.filter((m) => m.liquids)) {
      expect(twoLiquidCase(c.liquids![0], c.liquids![1])).toBe(c);
      expect(twoLiquidCase(c.liquids![1], c.liquids![0])).toBe(c);
      expect(c.boilingPoints).toEqual([BOILING_POINTS[c.liquids![0]], BOILING_POINTS[c.liquids![1]]]);
      expect(c.name.toLowerCase()).toContain(c.liquids![0]);
      expect(c.name.toLowerCase()).toContain(c.liquids![1]);
    }
    const names = Object.keys(BOILING_POINTS);
    for (const a of names) for (const b of names) {
      if (a === b) continue;
      const c = twoLiquidCase(a, b);
      expect(c.name.toLowerCase()).toContain(a);
      expect(c.name.toLowerCase()).toContain(b);
      expect([...c.liquids!].sort()).toEqual([a, b].sort());
      if (c.kind === 'two-miscible-liquids') expect(c.boilingPoints).toEqual(c.liquids!.map((l) => BOILING_POINTS[l]));
      else expect(chooseMethod(c).method).toBe('separating-funnel');
    }
    expect(twoLiquidCase('chloroform', 'water').parts).toEqual(['water', 'chloroform']); // chloroform sinks
    expect(twoLiquidCase('water', 'benzene').parts).toEqual(['benzene', 'water']); // benzene floats
  });
});

describe('laboratory shell', () => {
  const Counter: React.FC<{ id: string }> = ({ id }) => { const [n, setN] = useState(0); return <button type="button" data-counter={id} onClick={() => setN((x) => x + 1)}>{id} {n}</button>; };
  const views = [
    { id: 'a', label: 'First', render: () => <Counter id="a" /> },
    { id: 'b', label: 'Second', render: () => <Counter id="b" /> },
    { id: 'c', label: 'Third', render: () => <Counter id="c" /> },
  ];
  const renderShell = async (url = '/lab?view=a') => {
    const { SubjectLabShell } = await import('../SubjectLabShell');
    act(() => root.render(<MemoryRouter key={url} initialEntries={[url]}><SubjectLabShell title="Test Laboratory" testId="t-lab" intro="Intro." back={{ href: '/chapter', label: 'Test chapter' }} views={views} assumptions={['One.']} /></MemoryRouter>));
  };
  const tab = (id: string) => q(`[role="tab"][data-view="${id}"]`)!;

  it('keeps each investigation’s settings when switching, and Reset starts only that one again', async () => {
    await renderShell();
    click(q('[data-counter="a"]')); click(q('[data-counter="a"]'));
    expect(q('[data-counter="a"]')!.textContent).toBe('a 2');
    click(tab('b'));
    expect(q('[data-panel="a"]')!.hidden).toBe(true);
    click(q('[data-counter="b"]'));
    click(tab('a'));
    expect(q('[data-counter="a"]')!.textContent).toBe('a 2');
    expect(q('[data-counter="b"]')!.textContent).toBe('b 1');
    click(q('[data-panel="a"] [data-action="reset-activity"]'));
    expect(q('[data-counter="a"]')!.textContent).toBe('a 0');
    expect(q('[data-counter="b"]')!.textContent).toBe('b 1');
  });

  it('links every tab to its panel and supports arrow keys, Home and End', async () => {
    await renderShell();
    const tabs = [...host.querySelectorAll('[role="tab"]')];
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    const panel = q(`#${tab('a').getAttribute('aria-controls')}`)!;
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tab('a').id);
    key(tab('a'), 'ArrowRight');
    expect(tab('b').getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tab('b'));
    key(tab('b'), 'End');
    expect(tab('c').getAttribute('aria-selected')).toBe('true');
    key(tab('c'), 'ArrowRight'); // wraps round
    expect(tab('a').getAttribute('aria-selected')).toBe('true');
    key(tab('a'), 'ArrowLeft');
    expect(tab('c').getAttribute('aria-selected')).toBe('true');
    key(tab('c'), 'Home');
    expect(tab('a').getAttribute('aria-selected')).toBe('true');
  });

  it('the phone picker selects the same investigation as the tabs', async () => {
    await renderShell();
    choose('[data-testid="lab-view-picker"]', 'c');
    expect(tab('c').getAttribute('aria-selected')).toBe('true');
    expect(q('[data-panel="c"]')!.hidden).toBe(false);
  });

  it('offers a way back to the lesson it was opened from', async () => {
    await renderShell('/lab?view=b&ltBack=%2Fchemistry%2Fmixtures%2Flearn%2Fcm-l1');
    expect(q('[data-testid="lab-back-to-lesson"]')!.getAttribute('href')).toBe('/chemistry/mixtures/learn/cm-l1');
    await renderShell('/lab?ltBack=https%3A%2F%2Fevil.example');
    expect(q('[data-testid="lab-back-to-lesson"]')).toBeNull();
  });
});

describe('real laboratories', () => {
  it('the Mixtures laboratory keeps the separation set-up and recorded results across investigations', async () => {
    const { MixturesLabPage } = await import('../../chemistry/mixtures/MixturesPages');
    act(() => root.render(<MemoryRouter initialEntries={['/chemistry/mixtures/lab?view=separation']}><MixturesLabPage /></MemoryRouter>));
    choose('#sep-case', 'oil-water');
    choose('#sep-guess', 'separating-funnel');
    click(q('[data-action="check-method"]'));
    click(q('[data-panel="separation"] [data-action="record"]'));
    expect(host.querySelectorAll('[data-panel="separation"] [data-finding]').length).toBe(1);
    click(q('[role="tab"][data-view="solubility"]'));
    expect(q('[data-testid="mix-solubility"]')).not.toBeNull();
    click(q('[role="tab"][data-view="separation"]'));
    expect(q('[data-testid="mix-separation"]')!.getAttribute('data-case')).toBe('oil-water');
    expect(q('[data-testid="mix-separation"]')!.getAttribute('data-method')).toBe('separating-funnel');
    expect(host.querySelectorAll('[data-panel="separation"] [data-finding]').length).toBe(1);
  });

  it('the Cell laboratory keeps the osmosis set-up when switching to the microscope and back', async () => {
    const { CellLabPage } = await import('../../biology/cell/CellPages');
    act(() => root.render(<MemoryRouter initialEntries={['/biology/cell/lab?view=osmosis']}><CellLabPage /></MemoryRouter>));
    click(q('[data-choice="osm-mode:cell"]'));
    expect(q('[data-testid="osmosis"]')!.getAttribute('data-mode')).toBe('cell');
    click(q('[role="tab"][data-view="microscope"]'));
    click(q('[role="tab"][data-view="osmosis"]'));
    expect(q('[data-testid="osmosis"]')!.getAttribute('data-mode')).toBe('cell');
  });

  it('a lesson embeds an experiment with the same focus mode and Reset as the laboratory', async () => {
    const { VisualHost, VisualRegistryProvider } = await import('../visuals');
    const { OsmosisVisual } = await import('../../biology/cell/CellVisuals');
    act(() => root.render(<VisualRegistryProvider value={{ osmosis: OsmosisVisual }}><VisualHost visual={{ kind: 'osmosis', props: { editable: true, mode: 'potato', outside: 0 }, alt: 'Osmosis' }} /></VisualRegistryProvider>));
    expect([...host.querySelectorAll('.activity-toolbar button')].map((b) => b.textContent)).toEqual(['Focus activity ↗', 'Reset ↺']);
    click(q('[data-choice="osm-mode:cell"]'));
    click(q('[data-action="reset-activity"]'));
    expect(q('[data-testid="osmosis"]')!.getAttribute('data-mode')).toBe('potato');
  });
});

describe('Biology keys and counts', () => {
  it('the branching kingdom and plant paths always end in the model’s answer', async () => {
    const { kingdomPath, plantPath } = await import('../../biology/diversity/DiversityVisuals');
    const { classifyKingdom, classifyPlant } = await import('../../../engine/biology/diversity/model');
    for (const cellular of [true, false]) for (const nucleus of ['true', 'none'] as const) for (const cells of ['uni', 'multi'] as const)
      for (const wall of ['none', 'cellulose', 'chitin', 'other'] as const) for (const nutrition of ['autotrophic', 'heterotrophic', 'both'] as const) {
        const f = { cellular, nucleus, cells, wall, nutrition };
        const leaf = kingdomPath(f).steps.at(-1)!.leaf;
        expect(leaf === 'none (virus)' ? null : leaf).toBe(classifyKingdom(f).kingdom);
      }
    for (const body of ['thallus', 'simple parts', 'roots, stems and leaves'] as const) for (const vascular of [true, false]) for (const seeds of [true, false]) for (const fruits of [true, false]) {
      const f = { body, vascular, seeds, fruits };
      expect(plantPath(f).steps.at(-1)!.leaf).toBe(classifyPlant(f));
    }
  });

  it('subject cards count chapters and investigations from the curriculum, which matches the laboratory pages', async () => {
    const { getSubjectById } = await import('../../../types/subjectRegistry');
    const { chapterById } = await import('../../../engine/curriculum');
    const pages: [string, unknown[]][] = [
      ['mixtures', (await import('../../chemistry/mixtures/MixturesPages')).MIXTURES_LAB_VIEWS],
      ['atom', (await import('../../chemistry/atom/AtomPages')).ATOM_LAB_VIEWS],
      ['atomic-foundations', (await import('../../chemistry/foundations/FoundationsPages')).FOUNDATIONS_LAB_VIEWS],
      ['cell', (await import('../../biology/cell/CellPages')).CELL_LAB_VIEWS],
      ['tissues', (await import('../../biology/tissues/TissuePages')).TISSUE_LAB_VIEWS],
      ['reproduction', (await import('../../biology/reproduction/ReproPages')).REPRODUCTION_LAB_VIEWS],
      ['diversity', (await import('../../biology/diversity/DiversityPages')).DIVERSITY_LAB_VIEWS],
    ];
    for (const [id, views] of pages) expect(chapterById(id)!.implementation.investigations, id).toBe(views.length);
    const chem = getSubjectById('chemistry')!;
    expect(chem.topicsCount).toBe(3);
    expect(chem.experimentsCount).toBe(5 + 4 + 5);
    expect(chem.description).not.toMatch(/thermodynamic|heating curves/i);
    const bio = getSubjectById('biology')!;
    expect(bio.topicsCount).toBe(4);
    expect(bio.experimentsCount).toBe(5 + 6 + 6 + 6);
  });
});
