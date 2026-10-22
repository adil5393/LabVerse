import type { VisualRef } from '../engine/education/types';
import { MOTION_CHAPTER } from '../engine/physics/motion/learn/content';
import { FORCES_CHAPTER } from '../engine/physics/forces/learn/content';
import { WORK_CHAPTER } from '../engine/physics/work/learn/content';
import { SOUND_CHAPTER } from '../engine/physics/sound/learn/content';
import { MOTION_VISUALS } from '../features/physics/motion/MotionTrack';
import { FORCE_VISUALS } from '../features/physics/forces/ForcesPages';
import { WORK_VISUALS } from '../features/physics/work/visuals';
import { SOUND_VISUALS } from '../features/physics/sound/SoundVisuals';
import { PRACTICE_ITEMS } from '../engine/physics/motion/practice';
import { FORCE_PRACTICE_ITEMS } from '../engine/physics/forces/practice';
import { WORK_PRACTICE_ITEMS } from '../engine/physics/work/practice';

export const physicsRegistry = { ...MOTION_VISUALS, ...FORCE_VISUALS, ...WORK_VISUALS, ...SOUND_VISUALS };
export interface PhysicsFixture { id: string; chapter: string; location: string; visual: VisualRef }
export const physicsFixtures: PhysicsFixture[] = [];
function collect(value: unknown, chapter: string, location: string) {
  if (!value || typeof value !== 'object') return;
  const entry = value as Record<string, unknown>;
  if (typeof entry.kind === 'string' && entry.kind in physicsRegistry && typeof entry.alt === 'string') {
    physicsFixtures.push({ id: `${chapter}-${physicsFixtures.length}`, chapter, location, visual: value as VisualRef });
    return;
  }
  for (const [key, child] of Object.entries(entry)) collect(child, chapter, `${location}.${key}`);
}
for (const [chapter, data] of Object.entries({ motion: MOTION_CHAPTER, forces: FORCES_CHAPTER, work: WORK_CHAPTER, sound: SOUND_CHAPTER })) collect(data, chapter, 'chapter');
for (const [chapter, data] of Object.entries({ motion: PRACTICE_ITEMS, forces: FORCE_PRACTICE_ITEMS, work: WORK_PRACTICE_ITEMS })) collect(data, chapter, 'practice');
