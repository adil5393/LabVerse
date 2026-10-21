import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { SoundHub, SoundExercises } from '../SoundPages';
import { PhysicsHub } from '../../motion/MotionHub';
import { physicsChapterSummaries } from '../../../../engine/physics/chapterSummary';
import { CHAPTER_REGISTRY } from '../../../workspace/chapterNavigation';
import { SOUND_SYLLABUS } from '../../../../engine/physics/sound/curriculum';
import {
  DESKTOP, MOBILE, particlesInView, presentationFor, profileForWidth, pxPerMetre, SOUND_MOBILE_MAX_PX, xToPx,
} from '../soundViewport';
import { computeWave, DEFAULT_WAVE, PARTICLE_SPACING_M, TUBE_LENGTH_M, WAVE_LIMITS } from '../../../../engine/physics/sound/wave';
import { WaveScene, DensityGraph, markedRestPosition } from '../WaveViews';
import appSource from '../../../../App.tsx?raw';

const at = (el: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>);

describe('Chapter 10 hub: only completed functionality is available', () => {
  const html = at(<SoundHub />);

  it('links to Learn, both laboratories and the NCERT exercises; Chapter Practice is not a link', () => {
    for (const to of ['/physics/sound/learn/ps-l1', '/physics/sound/vibration', '/physics/sound/wave', '/physics/sound/exercises']) expect(html, to).toContain(`href="${to}"`);
    expect(html).toMatch(/data-destination="practice"[^>]*aria-disabled="true"/);
    expect(html).not.toContain('href="/physics/sound/practice"');
    expect(html).toContain('Upcoming (SND-3)');
  });

  it('shows Lessons 1 to 6 as links and Lessons 7 to 12 as planned, with their milestones, and NOT as links', () => {
    for (let n = 1; n <= 6; n++) expect(html).toContain(`data-learn-link="ps-l${n}"`);
    for (let n = 7; n <= 12; n++) { expect(html, `ps-l${n}`).toContain(`data-planned-lesson="ps-l${n}"`); expect(html).not.toContain(`/physics/sound/learn/ps-l${n}`); }
    expect(html).toMatch(/Upcoming · SND-2/); expect(html).toMatch(/Upcoming · SND-3/);
    expect(html).toContain('Upcoming lessons (6)');
    expect(SOUND_SYLLABUS.filter((l) => l.status === 'planned').length).toBe(6);
  });

  it('says plainly that sound is optional and off, and does not require an account', () => {
    expect(html).toMatch(/Sound is optional/);
    expect(html).not.toMatch(/sign up|create an account|onboarding/i);
  });

  it('the chapter map marks the later sections as upcoming and the first five as learn', () => {
    expect(html).toContain('data-map-row="s-freq"'); expect(html).toMatch(/data-map-row="s-speed"[\s\S]*?data-status="planned"/);
    expect(html).toMatch(/data-map-row="s-produce"[\s\S]*?data-status="learn"/);
  });
});

describe('Physics hub and navigation', () => {
  it('the Physics hub has a Sound card whose text comes from the chapter data and claims no more than exists', () => {
    const html = at(<PhysicsHub />);
    expect(html).toContain('data-chapter-card="sound"'); expect(html).toContain('href="/physics/sound"');
    const s = physicsChapterSummaries().find((x) => x.id === 'sound')!;
    expect(s.lessons).toBe(6);
    expect(html).toContain(s.line.replace(/&/g, '&amp;'));
    expect(s.line).toMatch(/6 of 12 lessons/); expect(s.line).toMatch(/4 of 15 NCERT exercises/); expect(s.line).toMatch(/6 lessons upcoming/);
    for (const c of ['motion', 'forces', 'work', 'electricity']) expect(html).toContain(`data-chapter-card="${c}"`);
  });

  it('the chapter is registered for the workspace navigation, with the right number', () => {
    const m = CHAPTER_REGISTRY.sound;
    expect(m).toMatchObject({ id: 'sound', subject: 'physics', chapterUrl: '/physics/sound', defaultLabUrl: '/physics/sound/vibration', defaultExercisesUrl: '/physics/sound/exercises' });
    expect(m.title).toContain('Ch. 10');
    for (const r of ['/physics/sound', '/physics/sound/vibration', '/physics/sound/wave', '/physics/sound/exercises', '/physics/sound/learn/:lessonId']) expect(appSource).toContain(`path="${r}"`);
  });

  it('the Sound routes are behind the same sign-in as the rest of the app, with no new login requirement', () => {
    const i = appSource.indexOf('<Route element={<RequireAuth />}>');
    expect(i).toBeGreaterThan(0);
    expect(appSource.indexOf('path="/physics/sound"')).toBeGreaterThan(i);
    expect(appSource.match(/path="\/login"/g)!.length).toBe(1);
  });
});

describe('NCERT exercises page', () => {
  const html = at(<SoundExercises />);
  it('lists all 15 exercises and all 13 Pause and Ponder items, with the solved counts stated', () => {
    expect(html.match(/data-exercise="exercise-\d+"/g)!.length).toBe(15);
    expect(html.match(/data-exercise="ponder-\d+"/g)!.length).toBe(13);
    expect(html).toMatch(/4 exercises and 6 Pause and Ponder items are solved so far/);
  });
  it('upcoming parts show what they need and no answer; solved parts show a full solution', () => {
    expect((html.match(/data-part-status="upcoming"/g) ?? []).length).toBe(22 - 4 + (13 - 6));   // upcoming exercise parts + upcoming P&P items
    expect(html).toContain('No solution is shown until the lesson that teaches it exists.');
    expect(html).toMatch(/data-exercise="exercise-3"[\s\S]*?\(ii\) 5 Hz/);
    expect(html).toMatch(/data-exercise="ponder-6"[\s\S]*?role="img"/);
  });
});

describe('viewport presentation profiles (mobile-first)', () => {
  it('uses the mobile presentation for a container narrower than 560 px and the desktop presentation at and above it (the width that counts is the laboratory or figure itself)', () => {
    for (const w of [288, 320, 358, 398, 430, 559]) expect(profileForWidth(w), String(w)).toBe('mobile');
    for (const w of [560, 640, 768, 1024, 1248]) expect(profileForWidth(w), String(w)).toBe('desktop');
    expect(SOUND_MOBILE_MAX_PX).toBe(560);
    expect(presentationFor('mobile')).toBe(MOBILE); expect(presentationFor('desktop')).toBe(DESKTOP);
  });

  it('the mobile picture is designed for 320 to 430 px: label text is never smaller than 11 px at 320 px wide, and touch targets are 44 px', () => {
    for (const w of [320, 360, 390, 430]) {
      const scale = Math.min(w - 32, 440) / MOBILE.wave.sceneW;                    // 16 px gutters; the drawing may grow to 440 px wide
      expect(MOBILE.wave.small * scale, `small @${w}`).toBeGreaterThanOrEqual(11);
      expect(MOBILE.wave.font * scale, `font @${w}`).toBeGreaterThanOrEqual(11.5);
      expect(MOBILE.vib.small * scale).toBeGreaterThanOrEqual(11);
    }
    expect(MOBILE.layout.minTouchPx).toBeGreaterThanOrEqual(44);
    expect(MOBILE.wave.small).toBeGreaterThanOrEqual(13); expect(DESKTOP.wave.small).toBeGreaterThanOrEqual(12);
    expect(MOBILE.layout).toMatchObject({ controlsBelow: true, measurementsCollapsed: true, stickyCanvas: true });
    expect(DESKTOP.layout).toMatchObject({ controlsBelow: false, measurementsCollapsed: false, stickyCanvas: false });
  });

  it('camera framing differs (mobile shows half the tube) while the tube and the particle spacing are the same physical quantities', () => {
    expect(DESKTOP.wave.camera).toEqual([0, TUBE_LENGTH_M]);
    expect(MOBILE.wave.camera[1] - MOBILE.wave.camera[0]).toBeCloseTo(TUBE_LENGTH_M / 2, 9);
    expect(particlesInView(MOBILE.wave)).toBeLessThan(particlesInView(DESKTOP.wave));
    expect(particlesInView(DESKTOP.wave)).toBe(Math.round(TUBE_LENGTH_M / PARTICLE_SPACING_M) + 1);
  });

  it('the picture is never so cramped that particles overlap or the wave cannot be seen, across the whole frequency range, on both profiles', () => {
    for (const p of [MOBILE.wave, DESKTOP.wave]) {
      const rowSpacingPx = PARTICLE_SPACING_M * p.rows * pxPerMetre(p);                       // neighbours in the SAME row (other rows are at other heights)
      expect(rowSpacingPx, `${p.markLabel} spacing`).toBeGreaterThan(p.radius * 2 * 1.3);    // dots do not touch at rest
      for (const f of [WAVE_LIMITS.frequencyHz[0], 100, 200, 300, WAVE_LIMITS.frequencyHz[1]]) {
        const w = computeWave({ ...DEFAULT_WAVE, frequencyHz: f });
        const wavelengthPx = w.lambda * pxPerMetre(p);
        expect(wavelengthPx, `${f} Hz`).toBeGreaterThan(p.radius * 2 * 3);                  // at least three dot-widths per wavelength: not a smear
        // the density strip (drawn from the model) carries the wave even where the dots cannot
        expect(wavelengthPx / PARTICLE_SPACING_M / pxPerMetre(p)).toBeGreaterThan(3);
      }
    }
  });

  it('the horizontal mapping is the same function for the tube and the graph, so a compression sits above its crest', () => {
    for (const p of [MOBILE.wave, DESKTOP.wave]) {
      expect(xToPx(p, p.camera[0])).toBe(p.marginL); expect(xToPx(p, p.camera[1])).toBeCloseTo(p.sceneW - p.marginR, 9);
      const m = markedRestPosition(p);
      expect(m).toBeGreaterThan(p.camera[0]); expect(m).toBeLessThan(p.camera[1]);
      expect(Math.round(m / PARTICLE_SPACING_M) % p.rows).toBe(Math.floor(p.rows / 2));      // the marked particle sits in the middle row
    }
  });

  it('both profiles draw from the SAME wave: the same numbers appear in the drawing, only labels and particles differ', () => {
    const w = computeWave(DEFAULT_WAVE);
    const d = renderToStaticMarkup(<WaveScene wave={w} tPhys={0} presentation={DESKTOP.wave} alt="x" />);
    const m = renderToStaticMarkup(<WaveScene wave={w} tPhys={0} presentation={MOBILE.wave} alt="x" />);
    expect(d).toContain('wavelength 3.4 m'); expect(m).not.toContain('wavelength 3.4 m');        // mobile shows one wavelength in view, so the bracket is in the readouts instead
    expect(d).toContain('rest position'); expect(m).toContain('>rest<');
    expect((d.match(/<circle/g) ?? []).length).toBeGreaterThan((m.match(/<circle/g) ?? []).length);
    for (const html of [d, m]) { expect(html).toContain('data-testid="marked-particle"'); expect(html).toContain('data-testid="followed-compression"'); expect(html).toContain('1 m'); expect(html).toContain('wave travels'); }
  });

  it('density graphs label the axes with units and draw the average line on both profiles', () => {
    const w = computeWave(DEFAULT_WAVE);
    for (const p of [MOBILE.wave, DESKTOP.wave]) {
      const g = renderToStaticMarkup(<DensityGraph wave={w} tPhys={0} presentation={p} alt="graph" />);
      expect(g).toContain('Distance from the source (m)'); expect(g).toContain('density (average = 1)'); expect(g).toContain('average density'); expect(g).toContain('data-testid="average-line"');
      const gt = renderToStaticMarkup(<DensityGraph wave={w} tPhys={0.003} presentation={p} mode="time" alt="graph" />);
      expect(gt).toContain('Time at the marked particle'); expect(gt).toContain('milliseconds');
    }
  });
});
