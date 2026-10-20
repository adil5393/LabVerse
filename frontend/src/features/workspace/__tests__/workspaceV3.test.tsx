import { describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import {
  useChapterNavigationStore,
  CHAPTER_REGISTRY,
} from '../chapterNavigation';
import { ChapterWorkspaceNav } from '../ChapterWorkspaceNav';
import { GlobalBlackboard } from '../GlobalBlackboard';
import { WorkspaceShell } from '../WorkspaceShell';

describe('LabVerse Workspace V3 — Navigation & Context Preservation', () => {
  beforeEach(() => {
    // Clear storage and state before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    useChapterNavigationStore.setState({ contexts: {} });
  });

  it('provides verified canonical fallback destinations for every chapter when unvisited', () => {
    const chapters = Object.keys(CHAPTER_REGISTRY);
    expect(chapters.length).toBeGreaterThan(5);

    for (const chId of chapters) {
      const dest = useChapterNavigationStore.getState().getLabDestination(chId);
      expect(dest.url).toBeDefined();
      expect(dest.url.startsWith('/')).toBe(true);
      expect(dest.title).toBeDefined();
      expect(dest.isResumed).toBe(false);
    }
  });

  it('preserves and restores exact laboratory URL and experiment state on return trip', () => {
    const { setLabContext, getLabDestination, getLabSetup } = useChapterNavigationStore.getState();

    // 1. Student configures a custom experiment in Work Laboratory
    const customSetup = { massKg: 5, forceN: 75, angleDeg: 30, displacementM: 6 };
    setLabContext('work', {
      labUrl: '/physics/work/lab?experiment=exp-custom',
      labTitle: 'Work Laboratory (Custom)',
      setup: customSetup,
    });

    // 2. Student opens exercises, then asks for return destination
    const returnDest = getLabDestination('work');
    expect(returnDest.url).toBe('/physics/work/lab?experiment=exp-custom');
    expect(returnDest.title).toBe('Work Laboratory (Custom)');
    expect(returnDest.isResumed).toBe(true);

    // 3. Stored experiment setup is accurately preserved
    const restoredSetup = getLabSetup<typeof customSetup>('work');
    expect(restoredSetup).toEqual(customSetup);
  });

  it('prevents external or dangerous URL injection in lab return routes', () => {
    const { setLabContext, getLabDestination } = useChapterNavigationStore.getState();

    // Malicious or invalid external URLs
    setLabContext('work', {
      labUrl: 'https://evil.com/phish',
      labTitle: 'Attacker',
    });

    const safeDest = getLabDestination('work');
    // Must fall back to safe default internal route
    expect(safeDest.url).toBe('/physics/work/lab');
    expect(safeDest.url.startsWith('https://')).toBe(false);
  });

  it('isolates chapter contexts so Physics does not leak into Mathematics or Chemistry', () => {
    const { setLabContext, getLabDestination } = useChapterNavigationStore.getState();

    setLabContext('motion', {
      labUrl: '/physics/motion/lab?experiment=accel-1',
      labTitle: 'Motion Lab',
    });

    setLabContext('circles', {
      labUrl: '/mathematics/circles/workbench?exp=chord-1',
      labTitle: 'Circles Workbench',
    });

    const motionDest = getLabDestination('motion');
    const circleDest = getLabDestination('circles');
    const forcesDest = getLabDestination('forces');

    expect(motionDest.url).toContain('/physics/motion/lab');
    expect(circleDest.url).toContain('/mathematics/circles/workbench');
    // Forces was unvisited, should return its own canonical default, unaffected by motion
    expect(forcesDest.url).toBe('/physics/forces/lab');
    expect(forcesDest.isResumed).toBe(false);
  });
});

describe('LabVerse Workspace V3 — Navigation UI & Blackboard', () => {
  it('renders ChapterWorkspaceNav with prominent Back to Lab button', () => {
    // Seed an active lab context
    useChapterNavigationStore.getState().setLabContext('work', {
      labUrl: '/physics/work/lab',
      labTitle: 'Work Laboratory',
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ChapterWorkspaceNav
          chapterId="work"
          currentPageTitle="NCERT Exercises"
          currentMode="exercises"
          showBackToLab={true}
        />
      </MemoryRouter>
    );

    expect(html).toContain('Back to Work Laboratory');
    expect(html).toContain('NCERT Exercises');
    expect(html).toContain('Explorer');
    expect(html).toContain('Physics');
  });

  it('renders GlobalBlackboard with chalk tools, palette, and return action', () => {
    const html = renderToStaticMarkup(
      <GlobalBlackboard
        namespace="physics-test"
        onReturnToExperiment={() => {}}
      />
    );

    expect(html).toContain('Back to Lab');
    expect(html).toContain('Scientific Chalkboard');
    expect(html).toContain('Chalk White');
    expect(html).toContain('Force Violet');
    expect(html).toContain('canvas');
  });

  it('renders WorkspaceShell with slotted components and mode tabs', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <WorkspaceShell
          chapterId="work"
          labTitle="Work Laboratory"
          activeTab="experiment"
          viewport={<div id="test-viewport">Apparatus Viewport</div>}
          outliner={<div id="test-outliner">Scene Outliner</div>}
          inspector={<div id="test-inspector">Properties Inspector</div>}
          analysisDock={<div id="test-dock">Analysis Bento</div>}
        />
      </MemoryRouter>
    );

    expect(html).toContain('Apparatus Viewport');
    expect(html).toContain('Scene Outliner');
    expect(html).toContain('Properties Inspector');
    expect(html).toContain('Analysis Bento');
    expect(html).toContain('LabVerse');
    expect(html).toContain('Experiment');
    expect(html).toContain('Analyze');
    expect(html).toContain('Blackboard');
  });
});
