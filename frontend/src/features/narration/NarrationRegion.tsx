/**
 * Narration wiring for React. `NarrationRegion` owns one controller for the content inside it, gives its segments to the
 * controller, and makes the controller available to `NarrationPlayer` (the controls) and `Nar` (the text that gets highlighted).
 * Narration is opt-in per subject through `NarrationEnabledProvider`; outside an enabled region the player and the highlight
 * render nothing, so subjects that have not adopted narration are unchanged.
 *
 * The hook and contexts live in `narrationContext.ts`.
 */

import React from 'react';
import type { NarrationSegment } from '../../engine/narration/controller';
import { EnabledContext, RegionContext, useNarration, useNarrationEnabled, useNarrationRegion } from './narrationContext';

export const NarrationEnabledProvider: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => (
  <EnabledContext.Provider value={enabled}>{children}</EnabledContext.Provider>
);
const Inner: React.FC<{ segments: NarrationSegment[]; resetKey?: string; children: React.ReactNode }> = ({ segments, resetKey, children }) => {
  const value = useNarration(segments, resetKey);
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export const NarrationRegion: React.FC<{ segments: NarrationSegment[]; resetKey?: string; enabled?: boolean; children: React.ReactNode }> = ({ segments, resetKey, enabled, children }) => {
  const ctx = useNarrationEnabled();
  if (!(enabled ?? ctx)) return <>{children}</>;
  return <Inner segments={segments} resetKey={resetKey}>{children}</Inner>;
};

/**
 * Text that belongs to a narration segment. It carries `data-narration-id` (so tests and tools can find it) and is highlighted
 * while that segment is being read. Outside a region it is a plain element.
 */
export function Nar<T extends keyof React.JSX.IntrinsicElements = 'p'>({ id, domId, as, className, children, ...rest }: { id: string; domId?: string; as?: T; className?: string; children: React.ReactNode } & Omit<React.JSX.IntrinsicElements[T], 'className' | 'children' | 'id'>): React.ReactElement {
  const region = useNarrationRegion();
  const active = region?.snapshot.activeId === id;
  const Tag = (as ?? 'p') as React.ElementType;
  return <Tag {...rest} id={domId} data-narration-id={id} data-narrating={active ? 'true' : undefined} className={`${className ?? ''}${active ? ' narr-active' : ''}`.trim() || undefined}>{children}</Tag>;
}
