import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { RoboticsHub, ROBOTICS_TOPICS } from '../RoboticsHub';
import { CHAPTER_REGISTRY } from '../../workspace/chapterNavigation';
import { ACTIVE_CURRICULUM } from '../../../engine/curriculum';

describe('Robotics section', () => {
  it('links to the Electricity lab and marks planned topics as planned, not available', () => {
    const html = renderToStaticMarkup(<MemoryRouter><RoboticsHub /></MemoryRouter>);
    expect(html).toContain('href="/robotics/electricity"');
    const planned = ROBOTICS_TOPICS.filter((t) => !t.to);
    expect(planned.length).toBeGreaterThan(0);
    expect((html.match(/Planned, not built yet/g) ?? []).length).toBe(planned.length);
    expect(html).not.toContain('/physics/electricity');
  });
  it('the Electricity workspace belongs to Robotics, not Physics', () => {
    expect(CHAPTER_REGISTRY.electricity).toMatchObject({ subject: 'robotics', subjectUrl: '/robotics', chapterUrl: '/robotics/electricity', defaultLabUrl: '/robotics/electricity/workbench' });
  });
  it('the Class 9 curriculum keeps Electricity only as supporting material in Robotics', () => {
    const e = ACTIVE_CURRICULUM.supportingMaterial.find((m) => m.id === 'electricity')!;
    expect(e).toMatchObject({ subject: 'robotics', route: '/robotics/electricity' });
    expect(ACTIVE_CURRICULUM.chapters.some((c) => c.id === 'electricity')).toBe(false);
  });
});
