import { useCallback, useState } from 'react';
import { useSetupHistory, useUndoShortcuts } from './useSetupHistory';

/**
 * A lab's parameter setup with undo/redo. `change` edits the setup (bursts coalesce into one undo step), `replace` loads a
 * preset (clears history and restarts the scene), `restart` re-mounts the scene with the current setup.
 */
export function useLabSetup<S extends object>(initial: S, options: { shortcuts?: boolean } = {}) {
  const [state, setState] = useState<{ setup: S; key: number }>({ setup: initial, key: 0 });
  const history = useSetupHistory<S>();

  const change = useCallback((patch: Partial<S>) => {
    history.record(state.setup);
    setState((s) => ({ ...s, setup: { ...s.setup, ...patch } }));
  }, [history.record, state.setup]);

  const replace = useCallback((next: S) => {
    history.clear();
    setState((s) => ({ setup: next, key: s.key + 1 }));
  }, [history.clear]);

  const restart = useCallback(() => setState((s) => ({ ...s, key: s.key + 1 })), []);

  const undo = useCallback(() => {
    const previous = history.undo(state.setup);
    if (previous) setState((s) => ({ ...s, setup: previous }));
  }, [history.undo, state.setup]);

  const redo = useCallback(() => {
    const next = history.redo(state.setup);
    if (next) setState((s) => ({ ...s, setup: next }));
  }, [history.redo, state.setup]);

  // A page that holds several setups (the machines lab) registers one shortcut handler itself.
  useUndoShortcuts(options.shortcuts === false ? () => {} : undo, options.shortcuts === false ? () => {} : redo);

  return { setup: state.setup, key: state.key, change, replace, restart, undo, redo, canUndo: history.canUndo, canRedo: history.canRedo };
}
