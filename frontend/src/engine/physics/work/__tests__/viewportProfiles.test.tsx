import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SimulationViewport } from '../../../../features/physics/work/components/SimulationViewport';
import { computeWork, DEFAULT_WORK } from '../workModel';
import { ForceFigure } from '../../../../features/physics/forces/ForceFigure';
import { Track } from '../../../../features/physics/forces/ForceCart';
import { DEFAULT_SETUP } from '../../forces/forceModel';
import { DESKTOP_PROFILE, MOBILE_PROFILE } from '../../../../features/physics/shared/viewportProfiles';

describe('Physics Mobile & Desktop Viewport Profiles', () => {
  it('defines desktop and mobile profiles with clear design tokens and safeguards', () => {
    expect(DESKTOP_PROFILE.type).toBe('desktop');
    expect(DESKTOP_PROFILE.isMobile).toBe(false);
    expect(DESKTOP_PROFILE.minTouchTarget).toBe(32);
    expect(DESKTOP_PROFILE.minFontSize).toBe(11);
    expect(DESKTOP_PROFILE.arrowStrokeWidth).toBe(3);

    expect(MOBILE_PROFILE.type).toBe('mobile');
    expect(MOBILE_PROFILE.isMobile).toBe(true);
    expect(MOBILE_PROFILE.minTouchTarget).toBe(44);
    expect(MOBILE_PROFILE.minFontSize).toBe(13);
    expect(MOBILE_PROFILE.arrowStrokeWidth).toBe(4);
  });

  it('renders desktop profile with CAD toolbar and CART_01 chassis by default on SSR / widescreen', () => {
    const r = computeWork({ ...DEFAULT_WORK, axis: 'vertical', forceN: 50, displacement: 1, massKg: 5 });

    const html = renderToStaticMarkup(
      <SimulationViewport
        result={r}
        progress={0}
        showVertical={true}
        onShowVerticalChange={() => {}}
        alt="Desktop test"
        playing={false}
        onTogglePlay={() => {}}
        onReset={() => {}}
        onProgressChange={() => {}}
      />
    );

    // Desktop toolbar should contain full tool set
    expect(html).toContain('title="Select Tool');
    expect(html).toContain('title="Pan Tool');
    expect(html).toContain('title="Fit to Scene');
    expect(html).toContain('title="Reset Camera');

    // Desktop object should preserve CART_01 wheeled chassis
    expect(html).toContain('id="cart-assembly"');
    expect(html).toContain('CART_01');
    expect(html).toContain('5 kg');
    expect(html).toContain('ACCEL_SENS_X');
  });

  it('preserves mathematical accuracy for Work Lesson 1 Idea 2 physical quantities', () => {
    const r = computeWork({ ...DEFAULT_WORK, axis: 'vertical', forceN: 50, angleDeg: 90, displacement: 1, startPos: 0, massKg: 5 });
    expect(r.appliedWork).toBe(50);
    expect(r.forces.find((f) => f.id === 'weight')?.work).toBe(-50);
    expect(r.netWork).toBe(0);
  });

  it('renders ForceFigure with compact mobile viewBox when compact is true', () => {
    const html = renderToStaticMarkup(
      <ForceFigure
        object="cart"
        arrows={[{ id: 'f1', kind: 'applied', label: 'Push', by: 'hand', on: 'cart', magnitude: 15, direction: 'right', horizontal: 15 }]}
        net={{ id: 'net', kind: 'net', label: 'Net', by: 'all', on: 'cart', magnitude: 15, direction: 'right', horizontal: 15 }}
        showIndividual={true}
        showNet={true}
        alt="Force Figure"
        compact={true}
      />
    );

    expect(html).toContain('viewBox="0 0 420 300"');
    expect(html).toContain('data-magnitude="15"');
    expect(html).toContain('Force 15 N →');
  });

  it('renders ForceCart Track with compact mobile framing when compact is true', () => {
    const html = renderToStaticMarkup(
      <Track
        setup={DEFAULT_SETUP}
        tMax={10}
        t={0}
        compact={true}
      />
    );

    expect(html).toContain('viewBox="0 0 420 120"');
    expect(html).toContain('0 m');
  });
});
