import { useCallback, useEffect, useState } from 'react';

/**
 * Selection, visibility and edit locks for the objects listed in a lab's outliner. Escape clears the selection.
 * Labs read `isVisible` / `isLocked` to decide what to draw and which inspector fields to disable.
 */
export function useSceneState(ids: readonly string[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [locks, setLocks] = useState<Record<string, boolean>>({});

  const toggleVisibility = useCallback((id: string) => setHidden((h) => ({ ...h, [id]: !h[id] })), []);
  const toggleLock = useCallback((id: string) => setLocks((l) => ({ ...l, [id]: !l[id] })), []);
  const select = useCallback((id: string | null) => setSelectedId(id), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (e.key === 'Escape' && tag !== 'input' && tag !== 'textarea' && tag !== 'select') setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibility = Object.fromEntries(ids.map((id) => [id, !hidden[id]])) as Record<string, boolean>;
  const lockMap = Object.fromEntries(ids.map((id) => [id, Boolean(locks[id])])) as Record<string, boolean>;
  return {
    selectedId,
    select,
    visibility,
    lockMap,
    isVisible: (id: string) => !hidden[id],
    isLocked: (id: string) => Boolean(locks[id]),
    toggleVisibility,
    toggleLock,
  };
}
