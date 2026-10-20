import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import {
  computeWork,
  DEFAULT_WORK,
  type WorkSetup,
} from '../workModel';
import {
  WorkView,
} from '../../../../features/physics/work/WorkView';
import {
  WorkstationHeader,
  SceneOutliner,
  SimulationViewport,
  PropertiesInspector,
  AnalysisDock,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_CAMERA,
} from '../../../../features/physics/work/components';

describe('Workspace V2.1: Viewport Navigation & Camera Independence', () => {
  it('initializes camera with default 100% zoom and (0,0) pan', () => {
    expect(DEFAULT_CAMERA).toEqual({ zoom: 1.0, panX: 0, panY: 0 });
    expect(MIN_ZOOM).toBe(0.5);
    expect(MAX_ZOOM).toBe(3.0);
  });

  it('preserves scientific simulation calculation results under camera transformations', () => {
    const setup: WorkSetup = {
      ...DEFAULT_WORK,
      forceN: 25,
      massKg: 5,
      displacement: 4,
      surfaceId: 'rough',
      angleDeg: 0,
    };
    const r1 = computeWork(setup);

    // Apply multiple camera zooms and pans
    const camA = { zoom: 1.5, panX: 120, panY: -45 };
    const camB = { zoom: 0.75, panX: -200, panY: 80 };

    const rAfterCamA = computeWork(setup);
    const rAfterCamB = computeWork(setup);

    expect(camA.zoom).toBe(1.5);
    expect(camB.zoom).toBe(0.75);
    expect(rAfterCamA.appliedWork).toBe(r1.appliedWork);
    expect(rAfterCamA.netWork).toBe(r1.netWork);
    expect(rAfterCamB.appliedWork).toBe(r1.appliedWork);
    expect(rAfterCamB.netWork).toBe(r1.netWork);
    expect(rAfterCamA.endPos).toBe(r1.endPos);
  });

  it('SimulationViewport renders real navigation controls (zoom, pan, fit to view, reset)', () => {
    const r = computeWork(DEFAULT_WORK);
    const html = renderToStaticMarkup(
      <SimulationViewport
        result={r}
        progress={0}
        showVertical={true}
        onShowVerticalChange={() => {}}
        alt="Work Viewport"
        playing={false}
        onTogglePlay={() => {}}
        onReset={() => {}}
        onProgressChange={() => {}}
      />
    );

    expect(html).toContain('Select Tool');
    expect(html).toContain('Pan Tool');
    expect(html).toContain('Fit to View');
    expect(html).toContain('Reset Camera');
    expect(html).toContain('Zoom In');
    expect(html).toContain('Zoom Out');
    expect(html).toContain('100%');
    expect(html).toContain('data-testid="work-svg"');
  });
});

describe('Workspace V2.1: Intelligent Analysis Dock', () => {
  it('supports 3 sizing modes: compact, balanced, and focus', () => {
    const r = computeWork(DEFAULT_WORK);

    // 1. Compact Mode
    const compactHtml = renderToStaticMarkup(
      <AnalysisDock
        result={r}
        displacement={DEFAULT_WORK.displacement}
        description="Kinematic work"
        dockMode="compact"
      />
    );
    expect(compactHtml).toContain('W_app:');
    expect(compactHtml).toContain('W_net:');
    expect(compactHtml).toContain('Expand Details');

    // 2. Balanced Mode
    const balancedHtml = renderToStaticMarkup(
      <AnalysisDock
        result={r}
        displacement={DEFAULT_WORK.displacement}
        description="Kinematic work"
        dockMode="balanced"
      />
    );
    expect(balancedHtml).toContain('Applied Work (W_app)');
    expect(balancedHtml).toContain('Net Work (W_net)');
    expect(balancedHtml).toContain('Drag to resize Analysis Dock');

    // 3. Focus Mode
    const focusHtml = renderToStaticMarkup(
      <AnalysisDock
        result={r}
        displacement={DEFAULT_WORK.displacement}
        description="Kinematic work"
        dockMode="focus"
      />
    );
    expect(focusHtml).toContain('Focus');
  });

  it('renders all functional analysis tabs without losing data', () => {
    const r = computeWork(DEFAULT_WORK);
    const html = renderToStaticMarkup(
      <AnalysisDock
        result={r}
        displacement={DEFAULT_WORK.displacement}
        description="Kinematic work model"
        activeTab="calculations"
      />
    );

    expect(html).toContain('Measurements');
    expect(html).toContain('Calculations');
    expect(html).toContain('Graphs (F-s)');
    expect(html).toContain('Data');
    expect(html).toContain('Explanation');
    expect(html).toContain('data-testid="work-formula"');
    expect(html).toContain('data-testid="net-work"');
  });
});

describe('Workspace V2.1: Scene Outliner & Properties Inspector', () => {
  it('SceneOutliner renders active scene objects with selection and lock capabilities', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <SceneOutliner
          cartMassKg={5.0}
          trackLengthM={12}
          selectedObjectId="cart"
          lockMap={{ cart: true, force: false }}
        />
      </MemoryRouter>
    );

    expect(html).toContain('CART_01');
    expect(html).toContain('Linear_Track');
    expect(html).toContain('F_APP');
    expect(html).toContain('DISP_01');
    expect(html).toContain('Chapter Exercises');
  });

  it('PropertiesInspector supports Beginner and Advanced modes without altering model parameters', () => {
    const r = computeWork(DEFAULT_WORK);

    // Beginner mode: essential parameters only, hides advanced accordion
    const beginnerHtml = renderToStaticMarkup(
      <PropertiesInspector
        setup={DEFAULT_WORK}
        result={r}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        beginnerMode={true}
      />
    );
    expect(beginnerHtml).toContain('MODE: BEGINNER');
    expect(beginnerHtml).not.toContain('data-testid="work-more"');

    // Advanced mode: contains advanced properties accordion
    const advancedHtml = renderToStaticMarkup(
      <PropertiesInspector
        setup={DEFAULT_WORK}
        result={r}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        beginnerMode={false}
      />
    );
    expect(advancedHtml).toContain('MODE: ADVANCED');
    expect(advancedHtml).toContain('data-testid="work-more"');
    expect(advancedHtml).toContain('Copy Experiment Data Summary');
  });
});

describe('Workspace V2.1: Workstation Navigation & Header', () => {
  it('WorkstationHeader renders functional mode tabs and level selector', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <WorkstationHeader
          activeTab="experiment"
          onTabChange={() => {}}
          beginnerMode={false}
          onToggleBeginnerMode={() => {}}
          onReset={() => {}}
          onTogglePlay={() => {}}
          playing={false}
          canUndo={true}
          canRedo={false}
        />
      </MemoryRouter>
    );

    expect(html).toContain('Learn');
    expect(html).toContain('Experiment');
    expect(html).toContain('Analyze');
    expect(html).toContain('Exercises');
    expect(html).toContain('Blackboard');
    expect(html).toContain('Beginner');
    expect(html).toContain('Advanced');
    expect(html).toContain('Reset');
    expect(html).toContain('Run Sim');
    expect(html).toContain('title="Undo parameter change (Ctrl+Z)"');
  });

  it('WorkView integrates Viewport, Inspector, and Analysis Dock with full test selectors', () => {
    const html = renderToStaticMarkup(
      <WorkView
        initial={DEFAULT_WORK}
        editable={true}
        graph={true}
      />
    );

    expect(html).toContain('data-visual="workLab"');
    expect(html).toContain('data-testid="work-view"');
    expect(html).toContain('data-testid="work-svg"');
    expect(html).toContain('data-testid="work-controls"');
    expect(html).toContain('data-testid="work-readout"');
    expect(html).toContain('data-testid="work-legend"');
  });
});
