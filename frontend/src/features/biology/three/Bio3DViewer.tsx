/**
 * The optional 3D viewer for Biology models. This module (and three.js with it) is loaded only when a student chooses
 * “Explore in 3D”; the 2D diagram stays the default.
 *
 * Design rules:
 *  - Renders only when something changes (a drag, a button, a slider). There is no animation loop and nothing turns by
 *    itself, so reduced-motion users lose nothing and a phone is not kept busy.
 *  - Touch: one finger turns the model, two fingers pinch to zoom. The mouse wheel scrolls the page unless Ctrl (or a
 *    trackpad pinch) is held, so the page never gets stuck on the model. The model area is shorter than the screen, so
 *    there is always page around it to scroll with.
 *  - Every action has a button and a keyboard alternative: turn, tilt, zoom, reset view, choose a part.
 *  - When the viewer closes it releases the WebGL context, geometries and materials.
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AmbientLight, Box3, Color, DirectionalLight, HemisphereLight, Mesh, PerspectiveCamera, Raycaster, Scene, Sphere, Spherical, Vector2, Vector3, WebGLRenderer, type Material, type Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildModel, type Built, type JointAngles, type ModelSpec } from './models';
import { SELECTED } from '../shared/bioPalette';
import { JOINT_RANGES, type JointAxis } from '../../../engine/biology/tissues/model';

export interface ViewerProps {
  spec: ModelSpec;
  /** Accessible name, e.g. “3D model of a plant cell”. */
  title: string;
  parts: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  /** Reported once the first frame is drawn (used by the performance check). */
  onReady?: (stats: ViewerStats) => void;
}

export interface ViewerStats { buildMs: number; firstFrameMs: number; triangles: number; drawCalls: number; pixelRatio: number }

const AXIS_LABEL: Record<JointAxis, string> = { bend: 'Bend forwards and back', sideways: 'Swing sideways', turn: 'Turn (rotate)' };
const NOT_ALLOWED: Record<JointAxis, string> = { bend: 'This joint cannot bend.', sideways: 'This joint cannot swing sideways.', turn: 'This joint cannot turn.' };

declare global {
  interface Window { __labverse3d?: { live: number; created: number; last?: ViewerStats } }
}
const registry = () => {
  if (typeof window === 'undefined') return { live: 0, created: 0 };
  window.__labverse3d ??= { live: 0, created: 0 };
  return window.__labverse3d;
};

export default function Bio3DViewer({ spec, title, parts, selected, onSelect, onReady }: ViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<{ renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera; controls: OrbitControls; model: Built; render: () => void; fit: () => void } | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [layers, setLayers] = useState<Record<string, boolean>>({});
  const [cut, setCut] = useState(0);
  const [angles, setAngles] = useState<JointAngles>({ bend: 0, sideways: 0, turn: 0 });
  const [failed, setFailed] = useState<string | null>(null);
  const [layerList, setLayerList] = useState<{ id: string; label: string }[]>([]);
  const [cutLabel, setCutLabel] = useState<string | null>(null);
  const helpId = useId();
  /** Once the student turns or zooms, resizing no longer re-frames the model. */
  const interacted = useRef(false);
  const specKey = JSON.stringify(spec);

  // Create the renderer and the model. Recreated only when the model itself changes (e.g. plant cell → animal cell).
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const t0 = performance.now();
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: window.devicePixelRatio < 2, alpha: false, powerPreference: 'low-power' });
    } catch {
      setFailed('This device could not start 3D graphics.');
      return;
    }
    const stats = registry();
    stats.live += 1; stats.created += 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(new Color('#0a0e16'));
    renderer.localClippingEnabled = true;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'bio3d__canvas';
    host.prepend(canvas);

    const scene = new Scene();
    scene.add(new HemisphereLight('#e0f2fe', '#1e293b', 1.4));
    scene.add(new AmbientLight('#ffffff', 0.35));
    const sun = new DirectionalLight('#ffffff', 1.6); sun.position.set(5, 8, 6); scene.add(sun);
    const model = buildModel(spec);
    scene.add(model.root);
    const camera = new PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.copy(model.camera.position);
    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(model.camera.target);
    controls.enableDamping = false; // damping needs a running animation loop
    controls.enablePan = false;
    controls.minDistance = model.camera.min;
    controls.maxDistance = model.camera.max;
    // Frame the whole model whatever the shape of the screen (a tall phone needs the camera further away).
    const bounds = model.frame ? new Sphere(model.frame.centre, model.frame.radius) : new Box3().setFromObject(model.root).getBoundingSphere(new Sphere());
    const fit = () => {
      const v = (camera.fov * Math.PI) / 180;
      const h = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
      const dist = (bounds.radius / Math.sin(Math.min(v, h) / 2)) * (model.frame ? 1 : 0.85);
      const dir = new Vector3().subVectors(model.camera.position, model.camera.target).normalize();
      controls.target.copy(model.camera.target);
      controls.maxDistance = Math.max(model.camera.max, dist * 1.6);
      camera.position.copy(model.camera.target).addScaledVector(dir, Math.max(dist, controls.minDistance));
      controls.update();
    };
    interacted.current = false;
    controls.addEventListener('start', () => { interacted.current = true; });

    let pending = 0;
    const drawLabel = () => {
      const label = labelRef.current;
      const id = selectedRef.current;
      const anchor = id ? model.anchors.get(id) : undefined;
      if (!label) return;
      if (!anchor || !id) { label.hidden = true; return; }
      const p = anchor.object.localToWorld(anchor.at.clone()).project(camera);
      const w = host.clientWidth, h = canvas.clientHeight;
      const x = Math.min(Math.max((p.x * 0.5 + 0.5) * w, 8), w - 8), y = Math.min(Math.max((-p.y * 0.5 + 0.5) * h, 8), h - 8);
      label.hidden = p.z > 1;
      // Keep the whole label inside the view: start it at the point, but slide it left if it would run off the edge.
      const lw = label.offsetWidth;
      const left = Math.max(4, Math.min(x - 12, w - lw - 4));
      label.style.transform = `translate(${left}px, ${Math.max(4, y - label.offsetHeight - 10)}px)`;
    };
    const draw = () => { pending = 0; renderer.render(scene, camera); drawLabel(); };
    const render = () => { if (!pending) pending = requestAnimationFrame(draw); };
    controls.addEventListener('change', render);

    const resize = () => {
      const w = Math.max(1, host.clientWidth), h = Math.max(200, host.clientHeight);
      renderer.setSize(w, h, true);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (!interacted.current) fit();
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // Tap or click a structure to select it. A drag (to turn) is not a tap.
    const ray = new Raycaster();
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 600) { down = null; return; }
      down = null;
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObject(model.root, true).find((i) => {
        let o: Object3D | null = i.object; let visible = true;
        while (o) { if (!o.visible) visible = false; o = o.parent; }
        const m = (i.object as Mesh).material as Material;
        const clipped = m.clippingPlanes?.some((pl) => pl.distanceToPoint(i.point) < 0);
        return visible && !clipped && i.object.userData.part;
      });
      if (hit) onSelectRef.current(hit.object.userData.part as string);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    // The wheel scrolls the page unless Ctrl is held (a trackpad pinch also sends Ctrl + wheel).
    const onWheel = (e: WheelEvent) => { if (!e.ctrlKey) e.stopPropagation(); };
    host.addEventListener('wheel', onWheel, { capture: true });

    ctx.current = { renderer, scene, camera, controls, model, render, fit };
    setLayers(Object.fromEntries(model.layers.map((l) => [l.id, l.on])));
    setLayerList(model.layers.map(({ id, label }) => ({ id, label })));
    setCutLabel(model.cut?.label ?? null);
    setCut(0);
    setAngles({ bend: 0, sideways: 0, turn: 0 });
    const buildMs = performance.now() - t0;
    requestAnimationFrame(() => {
      if (ctx.current?.renderer !== renderer) return;
      draw();
      const s: ViewerStats = { buildMs: Math.round(buildMs), firstFrameMs: Math.round(performance.now() - t0), triangles: renderer.info.render.triangles, drawCalls: renderer.info.render.calls, pixelRatio: renderer.getPixelRatio() };
      registry().last = s;
      onReady?.(s);
    });

    return () => {
      if (pending) cancelAnimationFrame(pending);
      ro.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      // OrbitControls adds its Ctrl-key listeners to `canvas.getRootNode()`, the document, but removes them from the root
      // node at dispose time. React has already taken the viewer out of the page by then, so that root is no longer the
      // document and the listeners (which hold the whole scene) would stay behind. Remove them from the document directly.
      const intercept = controls as unknown as { _interceptControlDown: EventListener; _interceptControlUp: EventListener };
      document.removeEventListener('keydown', intercept._interceptControlDown, { capture: true });
      document.removeEventListener('keyup', intercept._interceptControlUp, { capture: true });
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      host.removeEventListener('wheel', onWheel, { capture: true });
      const geos = new Set<{ dispose: () => void }>();
      const mats = new Set<Material>();
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.geometry) geos.add(m.geometry);
        if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x));
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      ctx.current = null;
      registry().live -= 1;
    };
    // The model is rebuilt only when the spec changes; `specKey` captures that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey]);

  // Highlight the selected part.
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    const lit = new Set(selected ? c.model.parts.get(selected) ?? [] : []);
    const glow = new Color(SELECTED).multiplyScalar(0.55);
    const black = new Color(0, 0, 0);
    c.model.parts.forEach((meshes) => meshes.forEach((m) => {
      const mat = m.material as Material & { emissive?: Color };
      mat.emissive?.copy(lit.has(m) ? glow : black);
    }));
    c.render();
  }, [selected, specKey]);

  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    c.model.layers.forEach((l) => l.objects.forEach((o) => { o.visible = layers[l.id] ?? l.on; }));
    if (c.model.cut) c.model.cut.plane.constant = c.model.cut.max * (1 - cut);
    c.model.pose?.(angles);
    c.render();
  }, [layers, cut, angles, specKey]);

  const turn = (dAz: number, dPolar = 0) => {
    const c = ctx.current;
    if (!c) return;
    interacted.current = true;
    const offset = new Vector3().subVectors(c.camera.position, c.controls.target);
    const s = new Spherical().setFromVector3(offset);
    s.theta += dAz; s.phi = Math.min(Math.max(s.phi + dPolar, 0.15), Math.PI - 0.15);
    c.camera.position.copy(c.controls.target).add(new Vector3().setFromSpherical(s));
    c.controls.update();
  };
  const zoom = (k: number) => {
    const c = ctx.current;
    if (!c) return;
    interacted.current = true;
    const offset = new Vector3().subVectors(c.camera.position, c.controls.target);
    offset.setLength(Math.min(Math.max(offset.length() * k, c.controls.minDistance), c.controls.maxDistance));
    c.camera.position.copy(c.controls.target).add(offset);
    c.controls.update();
  };
  const reset = () => {
    const c = ctx.current;
    if (!c) return;
    interacted.current = false;
    c.fit();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = { ArrowLeft: () => turn(-0.3), ArrowRight: () => turn(0.3), ArrowUp: () => turn(0, -0.2), ArrowDown: () => turn(0, 0.2), '+': () => zoom(0.8), '=': () => zoom(0.8), '-': () => zoom(1.25), '0': reset };
    const f = keys[e.key];
    if (f) { e.preventDefault(); f(); }
  };

  const ranges = spec.kind === 'joint' ? JOINT_RANGES[spec.joint] : null;
  const selectedName = useMemo(() => parts.find((p) => p.id === selected)?.name ?? '', [parts, selected]);

  if (failed) return <p className="bio3d__fallback" role="status">{failed} The 2D diagram shows the same parts.</p>;

  return (
    <div className="bio3d" data-testid="bio3d" data-model={spec.kind === 'cell' ? `cell-${spec.cell}` : spec.kind === 'joint' ? `joint-${spec.joint}` : 'flower'}>
      <div ref={hostRef} className="bio3d__stage" tabIndex={0} role="img" aria-label={`${title}. ${selectedName ? `Selected: ${selectedName}.` : ''}`} aria-describedby={helpId} onKeyDown={onKey}>
        <div ref={labelRef} className="bio3d__label" hidden aria-hidden>{selectedName}</div>
      </div>
      <p className="bio3d__help" id={helpId}>Drag to turn · pinch or + − to zoom · tap a part to select it. Scroll the page outside the model. Keyboard: arrow keys turn, + and − zoom, 0 resets.</p>
      <div className="bio3d__tools" role="group" aria-label="View">
        <button type="button" className="lab-btn" onClick={() => turn(-0.4)} aria-label="Turn left" data-action="turn-left"><span aria-hidden className="material-symbols-outlined">rotate_left</span></button>
        <button type="button" className="lab-btn" onClick={() => turn(0.4)} aria-label="Turn right" data-action="turn-right"><span aria-hidden className="material-symbols-outlined">rotate_right</span></button>
        <button type="button" className="lab-btn" onClick={() => zoom(1.25)} aria-label="Zoom out" data-action="zoom-out"><span aria-hidden className="material-symbols-outlined">zoom_out</span></button>
        <button type="button" className="lab-btn" onClick={() => zoom(0.8)} aria-label="Zoom in" data-action="zoom-in"><span aria-hidden className="material-symbols-outlined">zoom_in</span></button>
        <button type="button" className="lab-btn" onClick={reset} data-action="reset-view"><span aria-hidden className="material-symbols-outlined">center_focus_strong</span>Reset view</button>
      </div>
      <label className="lab-field bio3d__pick">
        <span>Inspect a part</span>
        <select value={selected ?? ''} onChange={(e) => e.target.value && onSelect(e.target.value)} data-testid="bio3d-part">
          {!selected && <option value="">Choose a part…</option>}
          {parts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      {(layerList.length > 0 || cutLabel) && (
        <fieldset className="bio3d__layers">
          <legend>Show and cut away</legend>
          {layerList.map((l) => (
            <label key={l.id} className="bio3d__check"><input type="checkbox" checked={layers[l.id] ?? true} onChange={(e) => setLayers((s) => ({ ...s, [l.id]: e.target.checked }))} data-layer={l.id} />{l.label}</label>
          ))}
          {cutLabel && (
            <label className="bio3d__range"><span>{cutLabel}: <strong>{Math.round(cut * 100)} %</strong></span>
              <input type="range" min={0} max={1} step={0.05} value={cut} onChange={(e) => setCut(Number(e.target.value))} data-testid="bio3d-cut" /></label>
          )}
        </fieldset>
      )}
      {ranges && (
        <fieldset className="bio3d__layers" data-testid="bio3d-movements">
          <legend>Move the joint</legend>
          {(['bend', 'sideways', 'turn'] as JointAxis[]).map((axis) => {
            const r = ranges[axis];
            return r
              ? <label key={axis} className="bio3d__range"><span>{AXIS_LABEL[axis]}: <strong>{angles[axis]}°</strong> <span className="text-slate-400">(about {r[0]}° to {r[1]}°)</span></span>
                <input type="range" min={r[0]} max={r[1]} step={5} value={angles[axis]} onChange={(e) => setAngles((a) => ({ ...a, [axis]: Number(e.target.value) }))} data-axis={axis} /></label>
              : <p key={axis} className="bio3d__blocked" data-axis-blocked={axis}><span aria-hidden className="material-symbols-outlined text-[16px]">block</span>{AXIS_LABEL[axis]}: not possible. {NOT_ALLOWED[axis]}</p>;
          })}
        </fieldset>
      )}
    </div>
  );
}
