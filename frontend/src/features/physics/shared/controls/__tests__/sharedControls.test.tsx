import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ParameterControl,
  DirectionSelector,
  ExperimentSetupGroup,
  NetForceSummary,
  ModelAssumptions,
  SimulationPlaybackControls,
} from '../index';
import { DEFAULT_SETUP } from '../../../../../engine/physics/forces/forceModel';

describe('Shared Physics Simulation Educational Controls', () => {
  it('ParameterControl renders direct numeric input, unit badge, and tactile steppers', () => {
    const handleChange = vi.fn();
    const html = renderToStaticMarkup(
      <ParameterControl
        id="mass"
        label="Cart Mass"
        value={2.5}
        unit="kg"
        step={0.5}
        min={0.5}
        max={20}
        symbol="m"
        showSlider
        onChange={handleChange}
      />
    );

    expect(html).toContain('data-field="mass"');
    expect(html).toContain('value="2.5"');
    expect(html).toContain('Cart Mass');
    expect(html).toContain('kg');
    expect(html).toContain('type="range"');
    expect(html).toContain('min-h-[44px]');
  });

  it('DirectionSelector renders accessible segmented control with arrows and data-dir attributes', () => {
    const handleChange = vi.fn();
    const html = renderToStaticMarkup(
      <DirectionSelector
        label="A"
        value="right"
        onChange={handleChange}
      />
    );

    expect(html).toContain('data-dir="A-left"');
    expect(html).toContain('data-dir="A-right"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Right');
    expect(html).toContain('Left');
    expect(html).toContain('→');
    expect(html).toContain('←');
  });

  it('ExperimentSetupGroup organizes controls into scientific hierarchy with responsive grid', () => {
    const html = renderToStaticMarkup(
      <ExperimentSetupGroup
        title="Cart Setup"
        icon="directions_car"
        description="Physical properties of the cart and track."
        badge="Active"
        columns={2}
      >
        <div>Control 1</div>
        <div>Control 2</div>
      </ExperimentSetupGroup>
    );

    expect(html).toContain('Cart Setup');
    expect(html).toContain('directions_car');
    expect(html).toContain('Physical properties of the cart and track.');
    expect(html).toContain('Active');
    expect(html).toContain('grid-cols-1 sm:grid-cols-2');
  });

  it('NetForceSummary shows signed-force breakdown and explains First Law when net force is zero', () => {
    // Balanced forces: Force A = 10 N right, Force B = 10 N left -> Net = 0 N
    const setup = {
      ...DEFAULT_SETUP,
      forceA: 10,
      dirA: 'right' as const,
      forceB: 10,
      dirB: 'left' as const,
      startVelocity: 5,
    };

    const html = renderToStaticMarkup(
      <NetForceSummary
        setup={setup}
        sample={{ net: 0, a: 0, v: 5, friction: 0, frictionKind: 'none' }}
      />
    );

    expect(html).toContain('Live Force Summary');
    expect(html).toContain('Net F = 0 N');
    expect(html).toContain('Force A');
    expect(html).toContain('Force B');
    expect(html).toContain('Zero Net Force');
    expect(html).toContain('0 m/s²');
    expect(html).toContain('constant velocity');
  });

  it('NetForceSummary explains Second Law acceleration when net force is unbalanced', () => {
    // Unbalanced forces: Force A = 15 N right, Force B = 5 N left -> Net = 10 N
    const setup = {
      ...DEFAULT_SETUP,
      massKg: 2,
      forceA: 15,
      dirA: 'right' as const,
      forceB: 5,
      dirB: 'left' as const,
    };

    const html = renderToStaticMarkup(
      <NetForceSummary
        setup={setup}
        sample={{ net: 10, a: 5, v: 2, friction: 0, frictionKind: 'none' }}
      />
    );

    expect(html).toContain('Unbalanced Net Force');
    expect(html).toContain('Net F = 10 N');
    expect(html).toContain('a = F<sub>net</sub> ÷ m = 5 m/s²');
  });

  it('ModelAssumptions displays single concise sentence with expandable technical details', () => {
    const html = renderToStaticMarkup(
      <ModelAssumptions
        summary="This experiment uses an idealized cart model."
        assumptions={[
          'Horizontal track: Weight is balanced by normal force (W = N = mg).',
          'Right is positive (+x).',
          'No air resistance.',
        ]}
        limits={{
          massRange: [0.5, 20],
          forceRange: [0, 50],
        }}
      />
    );

    expect(html).toContain('This experiment uses an idealized cart model.');
    expect(html).toContain('About this model');
  });

  it('SimulationPlaybackControls renders accessible play/pause, scrub slider, and speed select', () => {
    const html = renderToStaticMarkup(
      <SimulationPlaybackControls
        time={3.5}
        maxTime={10}
        playing={false}
        rate={1}
        onTogglePlay={() => {}}
        onStepBack={() => {}}
        onStepForward={() => {}}
        onReset={() => {}}
        onScrub={() => {}}
        onRateChange={() => {}}
        onMaxTimeChange={() => {}}
        testId="force-time"
        playTestId="force-play"
        resetTestId="force-reset"
      />
    );

    expect(html).toContain('data-testid="force-time"');
    expect(html).toContain('data-testid="force-play"');
    expect(html).toContain('data-testid="force-reset"');
    expect(html).toContain('Play');
    expect(html).toContain('3.5 s / 10 s');
    expect(html).toContain('type="range"');
  });
});
