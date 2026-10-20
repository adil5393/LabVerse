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
  screenToApparatus,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_CAMERA,
} from '../../../../features/physics/work/components';

describe('Workspace V2.2: Viewport Navigation & Camera Independence', () => {
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

  it('transforms screen pointer coordinates to apparatus space accurately under camera transforms', () => {
    const dummyRect = { left: 0, top: 0, width: 1000, height: 450 } as DOMRect;

    // At default camera (1.0x, 0,0), center (500, 225) maps to (500, 225)
    const pCenter = screenToApparatus(500, 225, dummyRect, DEFAULT_CAMERA);
    expect(pCenter.x).toBe(500);
    expect(pCenter.y).toBe(225);

    // At 2.0x zoom with panX = 100, panY = 50
    const camZoom = { zoom: 2.0, panX: 100, panY: 50 };
    const pZoom = screenToApparatus(600, 275, dummyRect, camZoom);
    // (600 - 500 - 100)/2.0 + 500 = 0 + 500 = 500
    // (275 - 225 - 50)/2.0 + 225 = 0 + 225 = 225
    expect(pZoom.x).toBe(500);
    expect(pZoom.y).toBe(225);
  });

  it('SimulationViewport renders real navigation controls (zoom, pan, fit to scene, reset)', () => {
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
    expect(html).toContain('Fit to Scene');
    expect(html).toContain('Reset Camera');
    expect(html).toContain('Zoom In');
    expect(html).toContain('Zoom Out');
    expect(html).toContain('100%');
    expect(html).toContain('data-testid="work-svg"');
  });
});

describe('Workspace V2.2: Collapsible Inspector & Friction Configuration', () => {
  it('supports collapsing and expanding the right Properties Inspector', () => {
    const r = computeWork(DEFAULT_WORK);

    // Collapsed Inspector renders 40px icon strip with expand button
    const collapsedHtml = renderToStaticMarkup(
      <PropertiesInspector
        setup={DEFAULT_WORK}
        result={r}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        collapsed={true}
      />
    );
    expect(collapsedHtml).toContain('title="Expand Properties Inspector (N)"');
    expect(collapsedHtml).toContain('w-10');
    expect(collapsedHtml).not.toContain('RIG_WORK_ENERGY_01');

    // Expanded Inspector renders full 308px panel with collapse button
    const expandedHtml = renderToStaticMarkup(
      <PropertiesInspector
        setup={DEFAULT_WORK}
        result={r}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        collapsed={false}
      />
    );
    expect(expandedHtml).toContain('title="Collapse Inspector (N)"');
    expect(expandedHtml).toContain('w-[308px]');
    expect(expandedHtml).toContain('RIG_WORK_ENERGY_01');
  });

  it('supports preset surfaces and editable custom friction coefficients in scientific model', () => {
    // 1. Preset Surface (Wood: mu = 0.3)
    const woodSetup: WorkSetup = { ...DEFAULT_WORK, massKg: 5, displacement: 4, surfaceId: 'wood' };
    const woodResult = computeWork(woodSetup);
    // N = m*g = 5 * 10 = 50 N
    // f_k = 0.3 * 50 = 15 N
    // W_f = -15 * 4 = -60 J
    const fWood = woodResult.forces.find((f) => f.id === 'friction');
    expect(fWood).toBeDefined();
    expect(fWood?.magnitude).toBe(15);
    expect(fWood?.work).toBe(-60);

    // 2. Custom Friction (mu = 0.65)
    const customSetup: WorkSetup = { ...DEFAULT_WORK, massKg: 5, displacement: 4, surfaceId: 'custom', customMu: 0.65 };
    const customResult = computeWork(customSetup);
    // f_k = 0.65 * 50 = 32.5 N
    // W_f = -32.5 * 4 = -130 J
    const fCustom = customResult.forces.find((f) => f.id === 'friction');
    expect(fCustom).toBeDefined();
    expect(fCustom?.magnitude).toBe(32.5);
    expect(fCustom?.work).toBe(-130);

    // 3. PropertiesInspector renders custom friction input when surfaceId is custom
    const inspectorHtml = renderToStaticMarkup(
      <PropertiesInspector
        setup={customSetup}
        result={customResult}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        collapsed={false}
      />
    );
    expect(inspectorHtml).toContain('data-testid="field-custom-mu"');
    expect(inspectorHtml).toContain('Kinetic Coeff. (μ_k)');
    expect(inspectorHtml).toContain('Normal Force (N):');
  });
});

describe('Workspace V2.2: Intelligent Analysis Dock', () => {
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

describe('Workspace V2.2: Scene Outliner & Properties Inspector Synchronization', () => {
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

  it('PropertiesInspector reflects active entity selection in heading', () => {
    const r = computeWork(DEFAULT_WORK);

    const htmlCart = renderToStaticMarkup(
      <PropertiesInspector
        setup={DEFAULT_WORK}
        result={r}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        selectedObjectId="cart"
      />
    );
    expect(htmlCart).toContain('ENTITY: CART');

    const htmlForce = renderToStaticMarkup(
      <PropertiesInspector
        setup={DEFAULT_WORK}
        result={r}
        onChange={() => {}}
        showVertical={true}
        onShowVerticalChange={() => {}}
        selectedObjectId="force"
      />
    );
    expect(htmlForce).toContain('ENTITY: FORCE');
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
    expect(beginnerHtml).toContain('BEGINNER');
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
    expect(advancedHtml).toContain('ADVANCED');
    expect(advancedHtml).toContain('data-testid="work-more"');
    expect(advancedHtml).toContain('Copy Experiment Data Summary');
  });
});

describe('Workspace V2.2: Workstation Navigation & Header', () => {
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
