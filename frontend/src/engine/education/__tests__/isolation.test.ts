import { describe, it, expect } from 'vitest';

const raw = import.meta.glob(
  [
    '../*.ts',
    '../../../features/education/*.tsx',
    '../../../store/useEducationStore.ts',
    '../../../features/mathematics/coordinateGeometry/*.tsx',
    '../../../features/mathematics/circles/learn/*.tsx',
    '../../mathematics/coordinateGeometry/*.ts',
    '../../mathematics/circles/learn/*.ts',
    '../../../App.tsx',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const entries = Object.entries(raw);
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const where = (re: RegExp) => entries.filter(([f]) => re.test(f));

describe('EDU-1 architecture: isolation, offline-first, lazy loading', () => {
  it('found the files it is supposed to scan', () => {
    expect(entries.length).toBeGreaterThan(20);
    expect(where(/features\/education\//).length).toBeGreaterThanOrEqual(7);
  });

  it('the shared framework imports no chapter code (a chapter supplies data and a visual registry)', () => {
    for (const [f, src] of [...where(/engine\/education\/[^/]+\.ts$/), ...where(/features\/education\//)]) {
      const code = strip(src);
      expect(code, f).not.toMatch(/from\s+['"][^'"]*(coordinateGeometry|circles|quadrilaterals|propositions|twoVariables|understandingData|chemistry)[^'"]*['"]/);
    }
  });

  it('the pure education engine does not depend on React, the DOM, stores or features', () => {
    for (const [f, src] of where(/engine\/education\/[^/]+\.ts$/)) {
      const code = strip(src);
      expect(code, f).not.toMatch(/from\s+['"]react/);
      expect(code, f).not.toMatch(/from\s+['"][^'"]*(store|features)[^'"]*['"]/);
      expect(code, f).not.toMatch(/\b(document|window|localStorage)\b/);
    }
  });

  it('no network, CDN or remote-content use in any EDU-1 code (offline-first, PWA/Capacitor friendly)', () => {
    for (const [f, src] of entries.filter(([f]) => !/App\.tsx$/.test(f))) {
      const code = strip(src);
      expect(code, f).not.toMatch(/https?:\/\//);
      expect(code, f).not.toMatch(/\bfetch\s*\(/);
      expect(code, f).not.toMatch(/XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
      expect(code, f).not.toMatch(/<script|<link\s/);
    }
  });

  it('progress is stored only in localStorage under the versioned key, with try/catch fallbacks', () => {
    const store = raw['../../../store/useEducationStore.ts'];
    expect(store).toContain("'labverse_edu_progress_v1'");
    expect(store).toMatch(/migratePersisted/);
    expect((store.match(/try\s*\{/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(store).not.toMatch(/sessionStorage|indexedDB|document\.cookie/);
  });

  it('chapter pages are loaded lazily: App.tsx never imports them statically, so the entry bundle does not grow', () => {
    const app = raw['../../../App.tsx'];
    expect(app).toBeDefined();
    const staticImports = app.split('\n').filter((l) => /^import\s/.test(l));
    for (const l of staticImports) {
      expect(l).not.toMatch(/education|coordinateGeometry|circles\/learn|CirclesLearn|CoordinateGeometryPages/);
    }
    for (const name of ['CoordinateGeometryPages', 'CirclesLearn']) expect(app, name).toMatch(new RegExp(`lazy\\(\\(\\) =>\\s*import\\('[^']*${name}'\\)`));
    expect(app).toMatch(/path="\/mathematics\/coordinate-geometry"/);
    expect(app).toMatch(/path="\/mathematics\/coordinate-geometry\/learn\/:lessonId"/);
    expect(app).toMatch(/path="\/mathematics\/circles\/learn\/:lessonId"/);
  });

  it('educational overlays are separate from the core geometry engines (Circles geometry.ts and the CG calculations are not modified by or dependent on them)', () => {
    const geometry = import.meta.glob('../../mathematics/circles/geometry.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const src = Object.values(geometry)[0];
    expect(strip(src)).not.toMatch(/from\s+['"][^'"]*(education|learn)[^'"]*['"]/);
    const calc = import.meta.glob('../../mathematics/calculations.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    expect(strip(Object.values(calc)[0])).not.toMatch(/from\s+['"][^'"]*(education|coordinateGeometry)[^'"]*['"]/);
  });

  it('every page that renders shared lesson components supplies the chapter visual registry (a missing registry silently drops diagrams)', () => {
    const pages = [...where(/features\/mathematics\/(coordinateGeometry|circles\/learn)\/[A-Za-z]+\.tsx$/), ...where(/features\/education\/(ChapterHub|LearnLessonPage)\.tsx$/)];
    expect(pages.length).toBeGreaterThanOrEqual(4);
    for (const [f, src] of pages) {
      const code = strip(src);
      if (/<ChapterHub/.test(code)) expect(code, f).toMatch(/registry=\{/);
      if (/<LearnLessonPage/.test(code)) expect(code, f).toMatch(/registry=\{/);
      if (/<(ChapterPrerequisites|UnitPrerequisites|IndependentPractice)/.test(code) && !/features\/education\/ChapterHub/.test(f)) expect(code, f).toMatch(/VisualRegistryProvider/);
      if (/features\/education\/ChapterHub/.test(f)) expect(code, f).toMatch(/<VisualRegistryProvider value=\{registry\}>/);
      if (/features\/education\/LearnLessonPage/.test(f)) expect(code, f).toMatch(/<VisualRegistryProvider value=\{registry\}>/);
    }
  });

  it('no decorative animation in EDU-1 UI: nothing animates by itself, so reduced-motion users lose nothing', () => {
    for (const [f, src] of entries.filter(([f]) => /\.tsx$/.test(f) && !/App\.tsx$/.test(f))) {
      const code = strip(src);
      expect(code, f).not.toMatch(/animate-(pulse|bounce|spin|ping)|@keyframes|requestAnimationFrame|setInterval|<animate/);
      expect(code, f).not.toMatch(/transition-(all|transform)|duration-\d+/);
    }
  });

  it('draggable handles show a keyboard focus ring through the group-focus pattern (the child-focus variant never matched)', () => {
    for (const f of ['../../../features/mathematics/coordinateGeometry/visuals.tsx', '../../../features/mathematics/circles/learn/CircleVisual.tsx']) {
      const src = raw[f];
      expect(src, f).not.toMatch(/focus:\[&>/);
      expect(src, f).toMatch(/className="group"/);
      expect(src, f).toMatch(/group-focus:stroke-white/);
    }
  });

  it('the Learn visuals memoize geometry so instruction components do not remount while dragging', () => {
    const plane = raw['../../../features/mathematics/coordinateGeometry/visuals.tsx'];
    const circle = raw['../../../features/mathematics/circles/learn/CircleVisual.tsx'];
    expect(plane).toMatch(/useMemo\(\(\) => makePlaneView/);
    expect(circle).toMatch(/useMemo\(\(\) => Object\.entries\(over\)/);
    // drag state lives inside the visual, not in the lesson page: no store write per pointer move
    for (const src of [plane, circle]) expect(strip(src)).not.toMatch(/useEducationStore/);
  });
});
