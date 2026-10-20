import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LabOutliner } from '../../../../features/workspace/LabOutliner';
import { WorkstationHeader } from '../../../../features/physics/work/components/WorkstationHeader';
import { EnergyScene, EnergyReadout } from '../../../../features/physics/work/EnergyView';
import { KineticScene, KineticReadout } from '../../../../features/physics/work/KineticView';
import { LeverView, PulleyView, RampView } from '../../../../features/physics/work/MachineViews';
import { PowerView } from '../../../../features/physics/work/PowerView';
import { computeEnergy, DEFAULT_ENERGY, energyAtTime } from '../energyLab';
import { computeKinetic, DEFAULT_KINETIC, kineticAt } from '../kineticModel';
import { DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP } from '../machines';
import { DEFAULT_POWER } from '../power';

const none = () => {};
const ix = { selectedId: null as string | null, onSelect: none, locks: {} as Record<string, boolean>, visibility: {} as Record<string, boolean> };

describe('shared lab workstation', () => {
  it('the outliner lists investigations and scene objects with select, hide and lock controls', () => {
    const html = renderToStaticMarkup(
      <LabOutliner
        investigations={[{ id: 'A', title: 'First', goal: 'goal A' }]}
        activeInvestigationId="A"
        onSelectInvestigation={none}
        objects={[{ id: 'ball', name: 'BALL_01', icon: 'circle' }]}
        selectedId="ball"
        onSelect={none}
        visibility={{ ball: false }}
        onToggleVisibility={none}
        lockMap={{ ball: true }}
        onToggleLock={none}
      />,
    );
    expect(html).toContain('Free Exploration');
    expect(html).toContain('data-experiment="A"');
    expect(html).toContain('data-object="ball"');
    expect(html).toContain('aria-label="Show BALL_01"');
    expect(html).toContain('aria-label="Unlock BALL_01"');
    expect(html).toContain('aria-selected="true"');
  });

  it('the header shows only the controls a lab has wired (no dead buttons)', () => {
    const bare = renderToStaticMarkup(<MemoryRouter><WorkstationHeader activeTab="experiment" onTabChange={none} /></MemoryRouter>);
    expect(bare).not.toContain('Run Sim');
    expect(bare).not.toContain('>Reset<');
    expect(bare).not.toContain('Beginner');
    expect(bare).not.toContain('Undo parameter change');
    const wired = renderToStaticMarkup(<MemoryRouter><WorkstationHeader activeTab="experiment" onTabChange={none} onTogglePlay={none} onReset={none} onUndo={none} onRedo={none} onToggleBeginnerMode={none} beginnerMode={false} /></MemoryRouter>);
    expect(wired).toContain('Run Sim');
    expect(wired).toContain('Reset');
    expect(wired).toContain('Beginner');
    expect(wired).toContain('Undo parameter change');
  });

  it('the energy scene offers drag handles only when it is interactive, and honours hidden objects', () => {
    const r = computeEnergy({ ...DEFAULT_ENERGY, angleDeg: 30, refHeight: 1 });
    const st = energyAtTime(r, 0);
    const plain = renderToStaticMarkup(<EnergyScene r={r} st={st} alt="x" />);
    expect(plain).not.toContain('data-handle');
    const live = renderToStaticMarkup(<EnergyScene r={r} st={st} alt="x" interaction={{ ...ix, onHeight: none, onReference: none }} />);
    expect(live).toContain('data-handle="height"');
    expect(live).toContain('data-handle="reference"');
    expect(live).toContain('touch-action:none');
    const hidden = renderToStaticMarkup(<EnergyScene r={r} st={st} alt="x" interaction={{ ...ix, visibility: { ball: false, ramp: false }, onHeight: none, onReference: none }} />);
    expect(hidden).not.toContain('data-handle="height"');
    expect(hidden).not.toContain('data-testid="ramp"');
    expect(renderToStaticMarkup(<EnergyReadout r={r} st={st} />)).toContain('data-testid="energy-total"');
  });

  it('the kinetic scene offers force and displacement handles and a separate readout', () => {
    const r = computeKinetic(DEFAULT_KINETIC);
    const live = renderToStaticMarkup(<KineticScene r={r} t={0} alt="x" interaction={{ ...ix, onForce: none, onDisplacement: none }} />);
    expect(live).toContain('data-handle="force"');
    expect(live).toContain('data-handle="displacement"');
    const hidden = renderToStaticMarkup(<KineticScene r={r} t={0} alt="x" interaction={{ ...ix, visibility: { force: false }, onForce: none, onDisplacement: none }} />);
    expect(hidden).not.toContain('data-handle="force"');
    expect(renderToStaticMarkup(<KineticReadout r={r} t={kineticAt(r, 0).t} />)).toContain('data-testid="kinetic-theorem"');
  });

  it('each machine view splits into a scene part and a readout part', () => {
    const views = [
      ['ramp', (part: 'scene' | 'readout') => <RampView initial={DEFAULT_RAMP} part={part} />],
      ['pulley', (part: 'scene' | 'readout') => <PulleyView initial={DEFAULT_PULLEY} part={part} />],
      ['lever', (part: 'scene' | 'readout') => <LeverView initial={DEFAULT_LEVER} part={part} />],
    ] as const;
    for (const [name, make] of views) {
      const scene = renderToStaticMarkup(make('scene'));
      const readout = renderToStaticMarkup(make('readout'));
      expect(scene).toContain(`data-testid="${name}-svg"`);
      expect(scene).not.toContain(`data-testid="${name}-readout"`);
      expect(readout).toContain(`data-testid="${name}-readout"`);
      expect(readout).not.toContain(`data-testid="${name}-svg"`);
    }
  });

  it('the lever and ramp scenes carry their drag handles when interactive', () => {
    const lever = renderToStaticMarkup(<LeverView initial={DEFAULT_LEVER} part="scene" interaction={ix} />);
    expect(lever).toContain('data-handle="load-arm"');
    expect(lever).toContain('data-handle="effort-arm"');
    const ramp = renderToStaticMarkup(<RampView initial={DEFAULT_RAMP} part="scene" interaction={ix} />);
    expect(ramp).toContain('data-handle="height"');
    expect(renderToStaticMarkup(<RampView initial={DEFAULT_RAMP} part="scene" />)).not.toContain('data-handle');
  });

  it('the power view splits into the graph and the readout', () => {
    expect(renderToStaticMarkup(<PowerView initial={DEFAULT_POWER} part="scene" />)).toContain('data-graph="power-graph"');
    expect(renderToStaticMarkup(<PowerView initial={DEFAULT_POWER} part="scene" />)).not.toContain('data-testid="power-readout"');
    expect(renderToStaticMarkup(<PowerView initial={DEFAULT_POWER} part="readout" />)).toContain('data-testid="power-readout"');
  });

  it('small screens get an overflow menu for the modes and secondary actions, and the mode tabs only show from md up', () => {
    const html = renderToStaticMarkup(<MemoryRouter><WorkstationHeader activeTab="experiment" onTabChange={none} onTogglePlay={none} onReset={none} onUndo={none} onToggleBeginnerMode={none} onOpenInspector={none} labTitle="Force Laboratory" /></MemoryRouter>);
    expect(html).toContain('data-testid="header-menu-button"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('class="hidden md:flex items-center space-x-3 h-full');
    expect(html).toContain('Force Laboratory');
  });
});
