import React from 'react';
import type { Setup } from '../../../../engine/physics/forces/forceModel';
import { PHYS } from '../../motion/physicsColors';

export interface NetForceSummaryProps {
  setup: Setup;
  sample?: {
    net: number;
    a: number;
    v: number;
    friction: number;
    frictionKind?: 'none' | 'static' | 'kinetic';
  };
  compact?: boolean;
}

const sg = (n: number, unit = 'N'): string => {
  const r = Math.round(n * 100) / 100;
  if (Math.abs(r) < 1e-9) return `0 ${unit}`;
  return `${r > 0 ? '+' : '−'}${Math.abs(r)} ${unit} (${r > 0 ? 'Right →' : '← Left'})`;
};

/**
 * NetForceSummary: Pedagogical breakdown of applied forces, friction, and net force.
 * Emphasizes that F_net = 0 means zero acceleration (constant velocity), not necessarily zero velocity.
 */
export const NetForceSummary: React.FC<NetForceSummaryProps> = ({
  setup,
  sample,
  compact = false,
}) => {
  const sA = (setup.dirA === 'left' ? -1 : 1) * setup.forceA;
  const sB = (setup.dirB === 'left' ? -1 : 1) * setup.forceB;
  const appliedSum = sA + sB;

  const net = sample ? sample.net : appliedSum;
  const accel = sample ? sample.a : net / setup.massKg;
  const vel = sample ? sample.v : setup.startVelocity;
  const friction = sample ? sample.friction : 0;
  const frictionKind = sample?.frictionKind ?? (setup.surfaceId === 'smooth' ? 'none' : 'static');

  const isZeroNet = Math.abs(net) < 1e-4;
  const isMoving = Math.abs(vel) > 1e-4;

  return (
    <div
      className={`rounded-xl border border-surface-border bg-surface-lowest/80 p-3 space-y-2.5 ${
        compact ? 'text-xs' : 'text-sm'
      }`}
      data-testid="net-force-summary"
    >
      <div className="flex items-center justify-between gap-2 border-b border-surface-border/50 pb-2">
        <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-amber-400 select-none" aria-hidden>
            balance
          </span>
          <span>Live Force Summary</span>
        </span>
        <span
          className="font-mono text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{
            borderColor: isZeroNet ? '#10b981' : PHYS.netForce,
            backgroundColor: isZeroNet ? '#10b98115' : `${PHYS.netForce}15`,
            color: isZeroNet ? '#34d399' : PHYS.netForce,
          }}
        >
          Net F = {Math.round(net * 100) / 100} N
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        <div className="p-2 rounded-lg bg-surface-card border border-surface-border/60">
          <span className="text-slate-400 text-[10px] uppercase block">Force A</span>
          <span className="font-bold text-sky-400">{sg(sA)}</span>
        </div>
        <div className="p-2 rounded-lg bg-surface-card border border-surface-border/60">
          <span className="text-slate-400 text-[10px] uppercase block">Force B</span>
          <span className="font-bold text-indigo-400">{sg(sB)}</span>
        </div>
        {Math.abs(friction) > 1e-4 || frictionKind !== 'none' ? (
          <div className="p-2 rounded-lg bg-surface-card border border-surface-border/60">
            <span className="text-slate-400 text-[10px] uppercase block">
              Friction ({frictionKind})
            </span>
            <span className="font-bold text-amber-300">{sg(friction)}</span>
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-surface-card border border-surface-border/60">
            <span className="text-slate-400 text-[10px] uppercase block">Pushes A + B</span>
            <span className="font-bold text-slate-200">{sg(appliedSum)}</span>
          </div>
        )}
      </div>

      <div className="p-2.5 rounded-lg bg-surface-card/90 border border-surface-border text-xs leading-relaxed text-slate-300">
        {isZeroNet ? (
          <p>
            <strong className="text-emerald-400">Zero Net Force (F<sub>net</sub> = 0 N):</strong>{' '}
            Acceleration is exactly <code className="font-mono text-emerald-300">0 m/s²</code>.{' '}
            {isMoving ? (
              <span>
                By Newton's First Law, the cart continues moving at its constant velocity{' '}
                <code className="font-mono text-cyan-300">{Math.round(vel * 100) / 100} m/s</code> without slowing down.
              </span>
            ) : (
              <span>
                By Newton's First Law, the cart remains at rest because the forces are balanced.
              </span>
            )}
          </p>
        ) : (
          <p>
            <strong style={{ color: PHYS.netForce }}>Unbalanced Net Force ({Math.round(net * 100) / 100} N):</strong>{' '}
            By Newton's Second Law, the cart accelerates at{' '}
            <code className="font-mono text-amber-300">
              a = F<sub>net</sub> ÷ m = {Math.round(accel * 100) / 100} m/s²
            </code>{' '}
            in the direction of the net force ({net > 0 ? 'Right →' : '← Left'}).
          </p>
        )}
      </div>
    </div>
  );
};
