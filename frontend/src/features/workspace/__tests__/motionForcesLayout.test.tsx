import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MotionLab } from '../../physics/motion/MotionLab';
import { ForcesLab } from '../../physics/forces/ForcesLab';
import { MotionTrackView } from '../../physics/motion/MotionTrack';
import { ForceCartView } from '../../physics/forces/ForceCart';
import { TwoBodyView } from '../../physics/forces/TwoBody';
import { BrakingDemoView } from '../../physics/forces/BrakingDemo';
import { CircularMotionView } from '../../physics/motion/CircularMotion';
import { DockTabs } from '../DockTabs';
import { ViewportFrame } from '../ViewportFrame';
import { ConceptExplainer } from '../../education/LessonParts';

const render = (ui: React.ReactElement, url = '/') => renderToStaticMarkup(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);

describe('Motion and Forces laboratories are composed from regions, not a legacy page in the viewport', () => {
  it('Motion: the viewport holds the scene and a toolbar, the inspector is editable, the dock has real tabs', () => {
    const html = render(<MotionLab />, '/physics/motion/lab');
    const viewport = html.slice(html.indexOf('data-testid="viewport-region"'), html.indexOf('data-testid="analysis-dock"'));
    expect(viewport).toContain('data-testid="viewport-toolbar"');
    expect(viewport).toContain('data-testid="viewport-select"');
    expect(viewport).toContain('data-testid="viewport-pan"');
    expect(viewport).toContain('data-testid="viewport-zoom-in"');
    expect(viewport).toContain('data-testid="viewport-zoom-out"');
    expect(viewport).toContain('data-testid="viewport-zoom"');
    expect(viewport).toContain('data-testid="viewport-fit"');
    // Grouped at top-left: Camera tools appear before Motion experiment actions in the unified toolbar
    const selectIdx = viewport.indexOf('data-testid="viewport-select"');
    const fitIdx = viewport.indexOf('data-testid="viewport-fit"');
    const leftIdx = viewport.indexOf('Left 5 m');
    expect(selectIdx).toBeLessThan(fitIdx);
    expect(fitIdx).toBeLessThan(leftIdx);
    expect(viewport).toContain('data-testid="motion-track"');
    expect(viewport).toContain('Left 5 m');
    expect(viewport).not.toContain('data-testid="motion-readout"'); // measurements belong to the dock
    expect(viewport).not.toContain('data-testid="motion-history"');
    expect(html).toContain('data-testid="motion-inspector"');
    expect(html).toMatch(/aria-label="Track start in metres"/);
    expect(html).toContain('data-testid="step-size"');
    for (const tab of ['measurements', 'data', 'graphs', 'explanation', 'investigation']) expect(html).toContain(`data-dock-tab="${tab}"`);
    expect(html).toContain('data-readout="distance"');
  });

  it('Motion investigation locks the track numbers and opens the Investigation tab', () => {
    const html = render(<MotionLab />, '/physics/motion/lab?experiment=A');
    expect(html).toContain('Fixed by this investigation');
    expect(html).toContain('data-prediction=');
  });

  it('Forces: scene in the viewport; setup fields in the inspector; measurements, graphs and data in the dock', () => {
    const html = render(<ForcesLab />, '/physics/forces/lab');
    const viewport = html.slice(html.indexOf('data-testid="viewport-region"'), html.indexOf('data-testid="analysis-dock"'));
    expect(viewport).toContain('data-testid="force-track"');
    expect(viewport).toContain('data-testid="force-figure"');
    expect(viewport).not.toContain('data-testid="force-readout"');
    expect(viewport).not.toContain('data-testid="force-listing"');
    expect(html).toContain('data-testid="forces-inspector"');
    for (const f of ['mass', 'velocity', 'forceA', 'forceB', 'pulse']) expect(html).toContain(`data-field="${f}"`);
    expect(html).toContain('data-testid="surface-select"');
    expect(html).toContain('data-testid="force-momentum"');
    expect(html).toContain('data-readout="net"');
  });

  it('Forces: Investigation J (sudden braking) routes scene to viewport, setup to inspector, telemetry to dock', () => {
    const html = render(<ForcesLab />, '/physics/forces/lab?experiment=J');
    const viewport = html.slice(html.indexOf('data-testid="viewport-region"'), html.indexOf('data-testid="analysis-dock"'));
    expect(viewport).toContain('data-testid="braking-scene"');
    expect(viewport).toContain('data-testid="braking-time"');
    expect(viewport).not.toContain('data-testid="braking-controls"'); // Inspector holds setup controls
    expect(html).toContain('data-testid="forces-inspector"');
    expect(html).toContain('data-testid="braking-controls"');
    expect(html).toContain('data-field="speed"');
    expect(html).toContain('data-field="decel"');
    expect(html).toContain('data-field="pmass"');
    for (const tab of ['measurements', 'data', 'graphs', 'explanation', 'investigation']) {
      expect(html).toContain(`data-dock-tab="${tab}"`);
    }
    expect(html).toContain('data-dock-panel="investigation"');
    expect(html).toContain('Investigation J');
  });

  it('keeps the composite lesson views complete', () => {
    const track = render(<MotionTrackView range={[-50, 100]} start={0} moves={[10, 20]} editable show={['position', 'distance', 'displacement']} stepM={5} playback alt="track" />);
    for (const id of ['motion-live', 'motion-readout', 'motion-history', 'motion-controls', 'motion-playback']) expect(track).toContain(`data-testid="${id}"`);
    const cart = render(<ForceCartView graphs />);
    for (const id of ['force-controls', 'force-track', 'force-figure', 'force-time', 'force-readout', 'force-live']) expect(cart).toContain(`data-testid="${id}"`);
  });

  it('shared pieces: dock tabs show the first tab, the viewport frame has fit and zoom', () => {
    const tabs = render(<DockTabs tabs={[{ id: 'a', label: 'A', content: <p>one</p> }, { id: 'b', label: 'B', content: <p>two</p> }]} />);
    expect(tabs).toContain('one');
    expect(tabs).not.toContain('two');
    const frame = render(<ViewportFrame toolbar={<b>tool</b>}><i>scene</i></ViewportFrame>);
    expect(frame).toContain('viewport-fit');
    expect(frame).toContain('tool');
    // Ensure viewport container scrolls without underflowing beneath bottom controls
    expect(frame).toContain('touch-pan-y');
    expect(frame).toContain('overflow-y-auto');
  });

  it('GraphLab: viewport adapts to graph size with responsive touch-friendly layout', async () => {
    const { GraphLab } = await import('../../physics/motion/GraphLab');
    const html = render(
      <GraphLab
        labTitle="Motion Graph Studio"
        outlinerTitle="Scenarios"
        inspectorTitle="Inspector"
        listTitle="Scenarios"
        items={[{ id: 's1', title: 'Uniform Acceleration' }]}
        activeId="s1"
        onPick={() => {}}
        kinds={['xt', 'vt']}
        reference={<div>Ref</div>}
        notes={<div>Notes</div>}
      />,
      '/physics/motion/graphs'
    );
    expect(html).toContain('data-visual="motionGraphs"');
    expect(html).toContain('data-graph="xt"');
    expect(html).toContain('data-graph="vt"');
    expect(html).toContain('data-testid="viewport-experiment-tools"');
    // Scene container uses safe vertical centering without underflowing below transport
    expect(html).toContain('touch-pan-y');
  });

  it('corrective redesign: ForceCartView prioritizes the simulation viewport before setup controls', () => {
    const html = render(<ForceCartView editable graphs />);
    const trackIdx = html.indexOf('data-testid="force-track"');
    const controlsIdx = html.indexOf('data-testid="force-controls"');
    const netBadgeIdx = html.indexOf('data-testid="viewport-net-badge"');
    expect(trackIdx).toBeGreaterThan(0);
    expect(controlsIdx).toBeGreaterThan(0);
    // Track viewport must come before setup controls
    expect(trackIdx).toBeLessThan(controlsIdx);
    // Net force badge is integrated near the viewport
    expect(netBadgeIdx).toBeGreaterThan(0);
    expect(netBadgeIdx).toBeLessThan(controlsIdx);
    // Parameter controls do not contain redundant range sliders
    expect(html).not.toMatch(/aria-label="Cart mass slider"/);
    expect(html).not.toMatch(/aria-label="Starting velocity slider"/);
  });

  it('corrective redesign: MotionTrackView puts direct move controls with the viewport before settings', () => {
    const html = render(<MotionTrackView range={[-50, 100]} start={0} moves={[10]} editable show={['position']} stepM={5} playback alt="track" />);
    const sceneIdx = html.indexOf('data-visual="motionTrack"');
    const moveBtnIdx = html.indexOf('Left 5 m');
    const controlsIdx = html.indexOf('data-testid="motion-controls"');
    expect(sceneIdx).toBeLessThan(moveBtnIdx);
    expect(moveBtnIdx).toBeLessThan(controlsIdx);
  });

  it('corrective redesign: ConceptExplainer renders full-width block for physics simulations', () => {
    const simStep = {
      id: 'step-sim',
      title: 'Balanced Forces Simulation',
      paragraphs: ['A cart moving at constant velocity with balanced forces.'],
      visual: { kind: 'forceCart', props: {}, alt: 'Cart on track' },
    };
    const htmlSim = render(<ConceptExplainer step={simStep} />);
    // Does not force simulation into a 2-column split (max-w-3xl for text, full-width for visual)
    expect(htmlSim).toContain('max-w-3xl');
    expect(htmlSim).not.toContain('grid gap-5 lg:grid-cols-2 items-start');

    // Standard non-simulation visual preserves 2-column layout
    const diagramStep = {
      id: 'step-diag',
      title: 'Static Diagram',
      paragraphs: ['A simple geometric figure.'],
      visual: { kind: 'quadFig', props: {}, alt: 'A rectangle' },
    };
    const htmlDiag = render(<ConceptExplainer step={diagramStep} />);
    expect(htmlDiag).toContain('grid gap-5 lg:grid-cols-2 items-start');
  });

  it('collapsible experiment setup: defaults to collapsed, exposes accessible aria controls and preserves parameters', () => {
    // 1. ForceCartView
    const cartHtml = render(<ForceCartView editable graphs />);
    // Setup button in playback action toolbar
    expect(cartHtml).toContain('data-testid="force-setup-toggle"');
    expect(cartHtml).toContain('aria-expanded="false"');
    expect(cartHtml).toContain('aria-controls="force-cart-setup-panel"');
    // Panel exists in DOM with hidden attribute
    expect(cartHtml).toContain('id="force-cart-setup-panel"');
    expect(cartHtml).toContain('hidden=""');
    // All parameters preserved inside the collapsible panel
    for (const f of ['mass', 'velocity', 'forceA', 'forceB', 'pulse']) {
      expect(cartHtml).toContain(`data-field="${f}"`);
    }
    expect(cartHtml).toContain('data-testid="surface-select"');
    // Readout remains immediately available
    expect(cartHtml).toContain('data-testid="force-readout"');

    // Non-editable ForceCartView must NOT render setup toggle or panel
    const cartNonEditable = render(<ForceCartView editable={false} />);
    expect(cartNonEditable).not.toContain('data-testid="force-setup-toggle"');
    expect(cartNonEditable).not.toContain('id="force-cart-setup-panel"');

    // 2. MotionTrackView
    const trackHtml = render(<MotionTrackView range={[-50, 100]} start={0} moves={[10]} editable show={['position']} stepM={5} playback alt="track" />);
    expect(trackHtml).toContain('data-testid="motion-setup-toggle"');
    expect(trackHtml).toContain('aria-expanded="false"');
    expect(trackHtml).toContain('aria-controls="motion-setup-panel"');
    expect(trackHtml).toContain('id="motion-setup-panel"');
    expect(trackHtml).toContain('hidden=""');
    expect(trackHtml).toContain('data-testid="step-size"');
    expect(trackHtml).toContain('data-testid="motion-reset"');

    // Non-editable MotionTrackView must NOT render setup toggle or panel
    const trackNonEditable = render(<MotionTrackView range={[-50, 100]} start={0} moves={[10]} editable={false} show={['position']} stepM={5} playback={false} alt="track" />);
    expect(trackNonEditable).not.toContain('data-testid="motion-setup-toggle"');
    expect(trackNonEditable).not.toContain('id="motion-setup-panel"');

    // 3. TwoBodyView
    const twoBodyHtml = render(<TwoBodyView editable />);
    expect(twoBodyHtml).toContain('data-testid="two-body-setup-toggle"');
    expect(twoBodyHtml).toContain('aria-expanded="false"');
    expect(twoBodyHtml).toContain('aria-controls="two-body-setup-panel"');
    expect(twoBodyHtml).toContain('id="two-body-setup-panel"');
    expect(twoBodyHtml).toContain('hidden=""');
    expect(twoBodyHtml).toContain('data-field="massA"');
    expect(twoBodyHtml).toContain('data-field="massB"');
    expect(twoBodyHtml).toContain('data-field="force"');

    // 4. BrakingDemoView
    const brakingHtml = render(<BrakingDemoView editable />);
    expect(brakingHtml).toContain('data-testid="braking-setup-toggle"');
    expect(brakingHtml).toContain('aria-expanded="false"');
    expect(brakingHtml).toContain('aria-controls="braking-setup-panel"');
    expect(brakingHtml).toContain('id="braking-setup-panel"');
    expect(brakingHtml).toContain('hidden=""');
    expect(brakingHtml).toContain('data-field="speed"');
    expect(brakingHtml).toContain('data-field="decel"');
    expect(brakingHtml).toContain('data-field="pmass"');

    // 5. CircularMotionView
    const circleHtml = render(<CircularMotionView editable />);
    expect(circleHtml).toContain('data-testid="circle-setup-toggle"');
    expect(circleHtml).toContain('aria-expanded="false"');
    expect(circleHtml).toContain('aria-controls="circular-setup-panel"');
    expect(circleHtml).toContain('id="circular-setup-panel"');
    expect(circleHtml).toContain('hidden=""');
    expect(circleHtml).toContain('data-field="radius"');
    expect(circleHtml).toContain('data-field="period"');
  });
});
