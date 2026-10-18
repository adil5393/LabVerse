import { describe, it, expect } from 'vitest';

const raw = (g: Record<string, unknown>): [string, string][] => Object.entries(g) as [string, string][];
const engine = raw(import.meta.glob('../*.ts', { query: '?raw', import: 'default', eager: true }));
const features = raw(import.meta.glob('../../../../features/mathematics/understandingData/*.tsx', { query: '?raw', import: 'default', eager: true }));
const store = raw(import.meta.glob('../../../../store/useUnderstandingDataStore.ts', { query: '?raw', import: 'default', eager: true }));
const app = Object.values(import.meta.glob('../../../../App.tsx', { query: '?raw', import: 'default', eager: true }))[0] as string;
const all = [...engine, ...features, ...store];

describe('Understanding Data module isolation', () => {
  it('finds the files it is meant to check', () => {
    expect(engine.length).toBeGreaterThanOrEqual(10);
    expect(features.length).toBeGreaterThanOrEqual(11);
    expect(store).toHaveLength(1);
  });

  it('imports no other chapter store or chapter engine', () => {
    const forbidden = /from\s+['"][^'"]*(useCircle|useQuad|usePropositions|useTwoVariables|useGuidedLearningStore|useMath|useChemistry|useElectric|\/circles\/|\/quadrilaterals\/|\/propositions\/|\/twoVariables\/|mathematics\/coordinates|mathematics\/calculations)[^'"]*['"]/;
    for (const [file, src] of all) expect(forbidden.test(src), file).toBe(false);
  });

  it('shares only the chapter-neutral guided-learning types', () => {
    const shared = all.filter(([, src]) => /guidedLearning\//.test(src)).map(([f]) => f.split('/').pop());
    expect(shared.length).toBeGreaterThan(0);
    for (const [file, src] of all) {
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports.filter((x) => x.includes('guidedLearning'))) expect(i, file).toMatch(/guidedLearning\/types$/);
    }
  });

  it('is loaded only through React.lazy, so it stays out of every initial bundle', () => {
    const staticImports = app.split(/\r?\n/).filter((l) => /^import\s/.test(l) && /understandingData/.test(l));
    expect(staticImports).toEqual([]);
    expect(app).toMatch(/import\('\.\/features\/mathematics\/understandingData\/UnderstandingDataLab'\)/);
    expect(app).toMatch(/import\('\.\/features\/mathematics\/understandingData\/UnderstandingDataWorkbenchPage'\)/);
  });

  it('the pure engine has no React, DOM or store dependency', () => {
    for (const [file, src] of engine) {
      expect(/from\s+['"]react|zustand|document\.|window\./.test(src), file).toBe(false);
    }
  });

  it('no chart library or other new dependency is imported', () => {
    for (const [file, src] of [...features, ...store]) {
      const imports = [...src.matchAll(/from\s+['"]([^'"./][^'"]*)['"]/g)].map((m) => m[1]);
      for (const i of imports) expect(['react', 'react-router-dom', 'zustand'], `${file} imports ${i}`).toContain(i);
    }
  });
});
