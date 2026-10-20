import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MobileLabViewport,
  MobileLabTransport,
  MobileLabToolbar,
  MobileLabParameterSheet,
  MobileLabAnalysisSheet,
  MobileLabShell,
} from '../index';

describe('MobileLabShell and Reusable Mobile Components', () => {
  it('renders MobileLabViewport with children and telemetry', () => {
    const html = renderToStaticMarkup(
      <MobileLabViewport
        telemetry={<span data-testid="test-telemetry">v = 2.0 m/s</span>}
        overlayControls={<button type="button">Reset</button>}
      >
        <div data-testid="sim-canvas">Simulation Canvas</div>
      </MobileLabViewport>
    );

    expect(html).toContain('data-testid="mobile-lab-viewport"');
    expect(html).toContain('v = 2.0 m/s');
    expect(html).toContain('Simulation Canvas');
  });

  it('renders MobileLabTransport with 2-row playback & full-width scrubber', () => {
    const onTogglePlay = vi.fn();
    const onScrub = vi.fn();

    const html = renderToStaticMarkup(
      <MobileLabTransport
        playing={false}
        onTogglePlay={onTogglePlay}
        onStepBack={vi.fn()}
        onStepForward={vi.fn()}
        onReset={vi.fn()}
        time={5.2}
        maxTime={20}
        onScrub={onScrub}
      />
    );

    expect(html).toContain('data-testid="mobile-lab-transport"');
    expect(html).toContain('data-testid="mobile-play-button"');
    expect(html).toContain('data-testid="mobile-step-back"');
    expect(html).toContain('data-testid="mobile-step-forward"');
    expect(html).toContain('data-testid="mobile-reset-button"');
    expect(html).toContain('data-testid="mobile-time-scrubber"');
    expect(html).toContain('5.2 s');
    expect(html).toContain('/ 20 s');
  });

  it('renders MobileLabToolbar with toggle switches and secondary row', () => {
    const html = renderToStaticMarkup(
      <MobileLabToolbar
        toggles={[
          { id: 'forces', label: 'Forces', active: true, onToggle: vi.fn() },
          { id: 'net', label: 'Net Force', active: false, onToggle: vi.fn() },
        ]}
        secondaryRow={<button type="button" data-testid="secondary-chip">Surface: Ice</button>}
      />
    );

    expect(html).toContain('data-testid="mobile-lab-toolbar"');
    expect(html).toContain('Forces');
    expect(html).toContain('Net Force');
    expect(html).toContain('Surface: Ice');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('aria-checked="false"');
  });

  it('renders MobileLabParameterSheet when open', () => {
    const closedHtml = renderToStaticMarkup(
      <MobileLabParameterSheet isOpen={false} onClose={vi.fn()}>
        <div>Parameters Content</div>
      </MobileLabParameterSheet>
    );
    expect(closedHtml).toBe('');

    const openHtml = renderToStaticMarkup(
      <MobileLabParameterSheet isOpen={true} onClose={vi.fn()} title="Forces Inspector">
        <div>Parameters Content</div>
      </MobileLabParameterSheet>
    );

    expect(openHtml).toContain('data-testid="mobile-parameter-sheet"');
    expect(openHtml).toContain('Forces Inspector');
    expect(openHtml).toContain('Parameters Content');
    expect(openHtml).toContain('data-testid="close-parameter-sheet"');
  });

  it('renders MobileLabAnalysisSheet with tabs and summary chip', () => {
    const html = renderToStaticMarkup(
      <MobileLabAnalysisSheet
        tabs={[
          { id: 'measurements', label: 'Measurements', content: <div>Measurements Data</div> },
          { id: 'graphs', label: 'Graphs', content: <div>Graphs Data</div> },
        ]}
        title="Analysis & Data"
        summaryChip={<span>Live Summary</span>}
        initialExpanded={true}
      />
    );

    expect(html).toContain('data-testid="mobile-analysis-sheet"');
    expect(html).toContain('Analysis &amp; Data');
    expect(html).toContain('Measurements Data');
    expect(html).toContain('role="tablist"');
  });

  it('renders full MobileLabShell assembling slots', () => {
    const html = renderToStaticMarkup(
      <MobileLabShell
        viewport={<div data-testid="slot-viewport">Viewport</div>}
        transport={<div data-testid="slot-transport">Transport</div>}
        toolbar={<div data-testid="slot-toolbar">Toolbar</div>}
        analysisSheet={<div data-testid="slot-analysis">Analysis</div>}
      />
    );

    expect(html).toContain('data-testid="mobile-lab-shell"');
    expect(html).toContain('data-testid="slot-viewport"');
    expect(html).toContain('data-testid="slot-transport"');
    expect(html).toContain('data-testid="slot-toolbar"');
    expect(html).toContain('data-testid="slot-analysis"');
  });
});
