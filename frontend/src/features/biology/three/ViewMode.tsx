/**
 * The “2D diagram / Explore in 3D” switch and the lazy 3D loader. This file does not import three.js: the 3D viewer and its
 * library are downloaded only when a student chooses 3D. 2D is always the default, and if 3D cannot run (no WebGL, the
 * download fails, or the graphics context cannot start) the student gets a clear message and the 2D diagram.
 */

import React, { Suspense, lazy, useState } from 'react';
import type { ViewerProps } from './Bio3DViewer';

export type ViewMode = '2d' | '3d';

let webgl: boolean | null = null;
/** True when this browser can create a WebGL context. Checked once. */
export function webglAvailable(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    webgl = Boolean(gl);
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

export const ViewModeSwitch: React.FC<{ mode: ViewMode; onChange: (m: ViewMode) => void; what: string }> = ({ mode, onChange, what }) => {
  const can = webglAvailable();
  return (
    <div className="bio-viewmode" role="group" aria-label={`How to show the ${what}`}>
      <button type="button" aria-pressed={mode === '2d'} data-viewmode="2d" onClick={() => onChange('2d')}>
        <span aria-hidden className="material-symbols-outlined text-[18px]">schema</span>2D diagram
      </button>
      <button type="button" aria-pressed={mode === '3d'} data-viewmode="3d" disabled={!can} onClick={() => onChange('3d')}
        title={can ? undefined : '3D needs WebGL, which this browser does not provide'}>
        <span aria-hidden className="material-symbols-outlined text-[18px]">view_in_ar</span>Explore in 3D
      </button>
      {!can && <p className="bio-viewmode__note">3D is not available on this device. The 2D diagram shows every part.</p>}
    </div>
  );
};

const Viewer = lazy(() => import('./Bio3DViewer'));

class Boundary extends React.Component<{ onBack: () => void; children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="bio3d__fallback" role="status">
        <p className="m-0">The 3D model could not be loaded (it may need an internet connection the first time). The 2D diagram shows the same parts.</p>
        <button type="button" className="lab-btn" onClick={this.props.onBack}>Show the 2D diagram</button>
      </div>
    );
  }
}

/** The 3D viewer, loaded on demand. `onBack` returns to 2D if it fails. */
export const Model3D: React.FC<ViewerProps & { onBack: () => void }> = ({ onBack, ...props }) => (
  <Boundary onBack={onBack}>
    <Suspense fallback={<p className="bio3d__loading" role="status">Loading the 3D model…</p>}>
      <Viewer {...props} />
    </Suspense>
  </Boundary>
);

/** State for the switch; always starts in 2D. */
export const useViewMode = () => useState<ViewMode>('2d');
