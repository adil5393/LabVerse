import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MotionLab } from '../../physics/motion/MotionLab';
import { ForcesLab } from '../../physics/forces/ForcesLab';
import { MotionTrackView } from '../../physics/motion/MotionTrack';
import { ForceCartView } from '../../physics/forces/ForceCart';
import { DockTabs } from '../DockTabs';
import { ViewportFrame } from '../ViewportFrame';

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
  });
});
