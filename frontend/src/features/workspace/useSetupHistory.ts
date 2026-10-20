import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Undo/redo for a lab's parameter setup. Changes that arrive in a quick burst (a drag, or typing a number) are
 * coalesced into one undo step: the entry recorded is the setup from before the burst began.
 */
export function useSetupHistory<T>(coalesceMs = 600) {
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const lastAt = useRef(0);

  /** Call with the setup as it was BEFORE the change being applied. */
  const record = useCallback((previous: T) => {
    const now = Date.now();
    const startsBurst = now - lastAt.current > coalesceMs;
    lastAt.current = now;
    setFuture([]);
    if (startsBurst) setPast((p) => [...p.slice(-99), previous]);
  }, [coalesceMs]);

  /** Returns the setup to restore, or undefined when there is nothing to undo. */
  const undo = useCallback((current: T): T | undefined => {
    if (past.length === 0) return undefined;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [...f, current]);
    lastAt.current = 0;
    return previous;
  }, [past]);

  const redo = useCallback((current: T): T | undefined => {
    if (future.length === 0) return undefined;
    const next = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setPast((p) => [...p, current]);
    lastAt.current = 0;
    return next;
  }, [future]);

  const clear = useCallback(() => { setPast([]); setFuture([]); lastAt.current = 0; }, []);

  return { record, undo, redo, clear, canUndo: past.length > 0, canRedo: future.length > 0 };
}

/** Ctrl/Cmd+Z undoes; Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z redoes. Ignored while typing in a field. */
export function useUndoShortcuts(onUndo: () => void, onRedo: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); onUndo(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); onRedo(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onUndo, onRedo]);
}
