/**
 * Particle Chamber Canvas Component for States of Matter Simulator
 *
 * Implements high-performance 2D Canvas rendering of particles,
 * movable piston with interactive drag handle, animated heating flame/ice cooler,
 * bonds/vectors/trails visual diagnostics, and live HUD overlay.
 */

import React, { useRef, useEffect } from 'react';
import { useChemistryStore } from '../../store/useChemistryStore';
import { SUBSTANCES } from '../../engine/chemistry/substances';
import { stepSimulation } from '../../engine/chemistry/simulation';
import { createParticles } from '../../engine/chemistry/particles';
import type { Particle } from '../../engine/chemistry/types';
import {
  CHAMBER_WIDTH,
  CHAMBER_HEIGHT_MAX,
  CHAMBER_HEIGHT_MIN,
} from '../../engine/chemistry/constants';

const CANVAS_WIDTH = 580;
const CANVAS_HEIGHT = 520;
const OFFSET_X = (CANVAS_WIDTH - CHAMBER_WIDTH) / 2; // 40px margin
const OFFSET_Y = 30; // 30px top margin
const FLOOR_Y = CHAMBER_HEIGHT_MAX; // 420px in simulation space

export const ParticleChamber: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Zustand Store
  const {
    substanceId,
    thermoState,
    config,
    advanceThermalTime,
    setPistonHeight,
    recordWallImpulse,
  } = useChemistryStore();

  const currentSubstance = SUBSTANCES[substanceId];

  // Particle state kept in a ref to avoid React state re-render overhead at 60 FPS
  const particlesRef = useRef<Particle[]>([]);
  const prevSubstanceRef = useRef(substanceId);
  const prevCountRef = useRef(config.particleCount);
  const isDraggingPistonRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(config.pistonHeight);

  // Reinitialize particles when substance or count changes
  useEffect(() => {
    particlesRef.current = createParticles(
      config.particleCount,
      currentSubstance,
      thermoState.phase,
      config.containerWidth,
      config.pistonHeight,
      thermoState.temperatureK
    );
    prevSubstanceRef.current = substanceId;
    prevCountRef.current = config.particleCount;
  }, [substanceId, config.particleCount]);

  // Main 60 FPS Animation & Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let flamePhase = 0;

    const render = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      flamePhase += dt * 8;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // 1. Advance thermal energy if heating or cooling is active
      if (!config.isPaused && thermoState.heatingState !== 'off') {
        advanceThermalTime(dt * config.simulationSpeed);
      }

      // 2. Physics & Particle Dynamics Step
      if (!config.isPaused && particlesRef.current.length > 0) {
        const stepResult = stepSimulation(
          particlesRef.current,
          dt,
          currentSubstance,
          thermoState.phase,
          thermoState.temperatureK,
          config
        );
        particlesRef.current = stepResult.particles;
        if (stepResult.wallImpulseAccumulated > 0) {
          recordWallImpulse(stepResult.wallImpulseAccumulated, dt);
        }
      }

      // 3. Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Simulation coordinates to canvas coordinates mapping
      const toCanvasX = (simX: number) => OFFSET_X + simX;
      const toCanvasY = (simY: number) => OFFSET_Y + simY;

      const containerLeft = OFFSET_X;
      const containerRight = OFFSET_X + CHAMBER_WIDTH;
      const containerFloorY = OFFSET_Y + FLOOR_Y;
      const pistonTopY = OFFSET_Y + Math.max(20, FLOOR_Y - config.pistonHeight);

      // 4. Draw Chamber Background & Grid
      ctx.save();
      ctx.fillStyle = 'rgba(10, 15, 29, 0.7)';
      ctx.fillRect(containerLeft, pistonTopY, CHAMBER_WIDTH, containerFloorY - pistonTopY);

      // Chamber glass border styling
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Left wall
      ctx.moveTo(containerLeft, pistonTopY - 10);
      ctx.lineTo(containerLeft, containerFloorY);
      // Floor
      ctx.lineTo(containerRight, containerFloorY);
      // Right wall
      ctx.lineTo(containerRight, pistonTopY - 10);
      ctx.stroke();

      // Measurement tick marks along left wall
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      for (let h = CHAMBER_HEIGHT_MIN; h <= CHAMBER_HEIGHT_MAX; h += 70) {
        const tickY = OFFSET_Y + FLOOR_Y - h;
        ctx.beginPath();
        ctx.moveTo(containerLeft, tickY);
        ctx.lineTo(containerLeft + 8, tickY);
        ctx.stroke();
        const volLiters = ((h / CHAMBER_HEIGHT_MAX) * 1.0).toFixed(1);
        ctx.fillText(`${volLiters} L`, containerLeft - 6, tickY + 3);
      }
      ctx.restore();

      // 5. Draw Particle Trails (if enabled)
      if (config.showTrails) {
        ctx.save();
        ctx.strokeStyle = currentSubstance.color;
        ctx.lineWidth = 1.5;
        for (const p of particlesRef.current) {
          ctx.beginPath();
          ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
          ctx.lineTo(toCanvasX(p.x - p.vx * 0.04), toCanvasY(p.y - p.vy * 0.04));
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Draw Inter-particle bonds (in solid phase or if toggle is on)
      if (thermoState.phase === 'solid' || thermoState.phase === 'solid-liquid' || config.showInteractions) {
        ctx.save();
        ctx.lineWidth = 1;
        const particles = particlesRef.current;
        const maxBondDist = currentSubstance.particleRadius * 2.8;
        const maxDistSq = maxBondDist * maxBondDist;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          if (p1.localPhase === 'gas') continue;
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p2.localPhase === 'gas') continue;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < maxDistSq) {
              const alpha = Math.max(0, 1 - Math.sqrt(distSq) / maxBondDist) * 0.45;
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(toCanvasX(p1.x), toCanvasY(p1.y));
              ctx.lineTo(toCanvasX(p2.x), toCanvasY(p2.y));
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // 7. Draw Particles
      ctx.save();
      for (const p of particlesRef.current) {
        const cx = toCanvasX(p.x);
        const cy = toCanvasY(p.y);
        const r = p.radius;

        // Choose color based on phase
        let baseColor = currentSubstance.color;
        let glowColor = currentSubstance.glowColor;
        if (p.localPhase === 'solid') {
          baseColor = '#38bdf8'; // Frosty cyan
          glowColor = 'rgba(56, 189, 248, 0.4)';
        } else if (p.localPhase === 'liquid') {
          baseColor = '#0284c7'; // Deep fluid blue
          glowColor = 'rgba(2, 132, 199, 0.4)';
        } else if (p.localPhase === 'gas') {
          baseColor = '#f59e0b'; // Energetic warm amber/orange
          glowColor = 'rgba(245, 158, 11, 0.5)';
        }

        // Radial 3D sphere gradient
        const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, baseColor);
        grad.addColorStop(1, '#0f172a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Subtle outer border
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 8. Draw Velocity Vectors (if enabled)
        if (config.showVectors) {
          const vScale = 0.08;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + p.vx * vScale, cy + p.vy * vScale);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 9. Draw Movable Piston
      ctx.save();
      // Piston crossbar
      const pistonHeightPx = 14;
      const pistonBarY = pistonTopY - pistonHeightPx;
      const pistonGrad = ctx.createLinearGradient(0, pistonBarY, 0, pistonTopY);
      pistonGrad.addColorStop(0, '#64748b');
      pistonGrad.addColorStop(0.5, '#94a3b8');
      pistonGrad.addColorStop(1, '#334155');

      ctx.fillStyle = pistonGrad;
      ctx.fillRect(containerLeft + 1, pistonBarY, CHAMBER_WIDTH - 2, pistonHeightPx);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(containerLeft + 1, pistonBarY, CHAMBER_WIDTH - 2, pistonHeightPx);

      // Piston rod
      const rodWidth = 24;
      const rodX = containerLeft + CHAMBER_WIDTH / 2 - rodWidth / 2;
      const rodTopY = Math.max(5, pistonBarY - 26);
      ctx.fillStyle = '#475569';
      ctx.fillRect(rodX, rodTopY, rodWidth, pistonBarY - rodTopY);
      ctx.strokeRect(rodX, rodTopY, rodWidth, pistonBarY - rodTopY);

      // Piston Handle
      const handleWidth = 70;
      const handleHeight = 10;
      const handleX = containerLeft + CHAMBER_WIDTH / 2 - handleWidth / 2;
      ctx.fillStyle = isDraggingPistonRef.current ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      ctx.roundRect(handleX, rodTopY - handleHeight, handleWidth, handleHeight, 4);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      // Drag icon / text on handle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DRAG PISTON', handleX + handleWidth / 2, rodTopY - 2);
      ctx.restore();

      // 10. Draw Bottom Heater / Cooler Burner Plate
      ctx.save();
      const heaterTopY = containerFloorY + 2;

      // Base plate
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(containerLeft - 10, heaterTopY, CHAMBER_WIDTH + 20, 10);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(containerLeft - 10, heaterTopY, CHAMBER_WIDTH + 20, 10);

      const isHeating = thermoState.heatingState === 'heating' || thermoState.heatingState === 'heat';
      const isCooling = thermoState.heatingState === 'cooling' || thermoState.heatingState === 'cool';

      if (isHeating) {
        // Bunsen Burner / Flame graphic
        const flameCount = 9;
        const flameSpacing = (CHAMBER_WIDTH - 40) / (flameCount - 1);
        for (let i = 0; i < flameCount; i++) {
          const fx = containerLeft + 20 + i * flameSpacing;
          const fy = heaterTopY + 10;
          const flicker = Math.sin(flamePhase + i * 1.5) * 6;
          const flameH = 26 + flicker;

          // Outer orange flame
          ctx.beginPath();
          ctx.moveTo(fx - 10, fy);
          ctx.quadraticCurveTo(fx - 12, fy + flameH * 0.5, fx, fy + flameH);
          ctx.quadraticCurveTo(fx + 12, fy + flameH * 0.5, fx + 10, fy);
          ctx.closePath();
          ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
          ctx.fill();

          // Inner yellow flame
          ctx.beginPath();
          ctx.moveTo(fx - 5, fy);
          ctx.quadraticCurveTo(fx - 6, fy + flameH * 0.4, fx, fy + flameH * 0.7);
          ctx.quadraticCurveTo(fx + 6, fy + flameH * 0.4, fx + 5, fy);
          ctx.closePath();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.95)';
          ctx.fill();

          // Core blue flame
          ctx.beginPath();
          ctx.arc(fx, fy + 4, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
          ctx.fill();
        }
      } else if (isCooling) {
        // Cryo Cooler / Ice frost graphic
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(containerLeft, heaterTopY + 10, CHAMBER_WIDTH, 22);

        // Frost crystal sparkles
        ctx.fillStyle = '#bae6fd';
        for (let i = 0; i < 14; i++) {
          const sparkX = containerLeft + 15 + i * 36 + Math.sin(flamePhase + i) * 6;
          const sparkY = heaterTopY + 16 + (i % 3) * 5;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Neutral Off State
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HEAT SOURCE IDLE (SELECT HEAT OR COOL)', containerLeft + CHAMBER_WIDTH / 2, heaterTopY + 24);
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    currentSubstance,
    thermoState.phase,
    thermoState.temperatureK,
    thermoState.heatingState,
    config,
    advanceThermalTime,
    recordWallImpulse,
  ]);

  // Pointer drag interaction for movable piston
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Check if clicked near piston handle or crossbar
    const pistonTopY = OFFSET_Y + Math.max(20, FLOOR_Y - config.pistonHeight);
    const containerLeft = OFFSET_X;
    const containerRight = OFFSET_X + CHAMBER_WIDTH;

    if (
      clientX >= containerLeft &&
      clientX <= containerRight &&
      clientY >= pistonTopY - 40 &&
      clientY <= pistonTopY + 15
    ) {
      isDraggingPistonRef.current = true;
      dragStartYRef.current = clientY;
      dragStartHeightRef.current = config.pistonHeight;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingPistonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = e.clientY - rect.top;

    // Dragging down decreases cavity height; dragging up increases cavity height
    const deltaY = clientY - dragStartYRef.current;
    const newHeight = Math.max(
      CHAMBER_HEIGHT_MIN,
      Math.min(CHAMBER_HEIGHT_MAX, dragStartHeightRef.current - deltaY)
    );

    // Liquids and solids resist extreme compression (incompressibility principle)
    if (thermoState.phase === 'solid' || thermoState.phase === 'liquid') {
      const minIncompressibleHeight = 180;
      setPistonHeight(Math.max(minIncompressibleHeight, newHeight));
    } else {
      setPistonHeight(newHeight);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingPistonRef.current) {
      isDraggingPistonRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // Phase Display Name
  const getPhaseName = () => {
    switch (thermoState.phase) {
      case 'solid':
        return 'Solid (Crystalline Lattice)';
      case 'solid-liquid':
        return 'Solid-Liquid Coexistence (Melting Plateau)';
      case 'liquid':
        return 'Liquid (Dense Fluid)';
      case 'liquid-gas':
        return 'Liquid-Gas Coexistence (Boiling Plateau)';
      case 'gas':
        return 'Gas (Free Thermal Dispersion)';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-3 bg-surface-lowest overflow-hidden">
      {/* Top HUD Badges */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          {/* Temperature HUD */}
          <div className="bg-surface-elevated/90 backdrop-blur-md border border-surface-border px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg">device_thermostat</span>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Temperature</div>
              <div className="text-base font-mono font-bold text-white">
                {thermoState.temperatureC.toFixed(1)}°C{' '}
                <span className="text-xs text-slate-400 font-normal">({thermoState.temperatureK.toFixed(1)} K)</span>
              </div>
            </div>
          </div>

          {/* Phase HUD */}
          <div className="bg-surface-elevated/90 backdrop-blur-md border border-surface-border px-3.5 py-1.5 rounded-xl shadow-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400">Phase State</div>
            <div className="text-sm font-bold text-emerald-400">{getPhaseName()}</div>
          </div>
        </div>

        {/* Phase Coexistence Fraction (when melting or boiling) */}
        {(thermoState.phase === 'solid-liquid' || thermoState.phase === 'liquid-gas') && (
          <div className="bg-surface-elevated/90 backdrop-blur-md border border-amber-500/40 px-4 py-1.5 rounded-xl shadow-lg flex flex-col gap-1 w-56">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-amber-300 font-bold">
                {thermoState.phase === 'solid-liquid' ? 'Melting Progress' : 'Boiling Progress'}
              </span>
              <span className="text-slate-300 font-bold">
                {(
                  (thermoState.phase === 'solid-liquid'
                    ? thermoState.phaseFractions.liquid
                    : thermoState.phaseFractions.gas) * 100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-150"
                style={{
                  width: `${
                    (thermoState.phase === 'solid-liquid'
                      ? thermoState.phaseFractions.liquid
                      : thermoState.phaseFractions.gas) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2D Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-surface-border shadow-2xl bg-surface-card/60">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-default select-none block"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Bottom Hint */}
      <div className="text-[11px] font-mono text-slate-500 mt-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px]">touch_app</span>
        <span>Drag the top piston to compress/expand volume. Toggle Heat/Cool on the left panel.</span>
      </div>
    </div>
  );
};
