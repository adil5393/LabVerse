import React from 'react';
import { fmt, fmtSigned, RELATION_TEXT, type ForceKind, type WorkResult } from '../../../../engine/physics/work/workModel';
import { PHYS } from '../../motion/physicsColors';

const COLOR: Record<ForceKind, string> = {
  applied: PHYS.force,
  friction: PHYS.friction,
  weight: PHYS.vertical,
  normal: PHYS.vertical,
};

export interface CalculationPanelProps {
  result: WorkResult;
  displacement: number;
  description: string;
  graph?: boolean;
  alt?: string;
  FsGraphComponent?: React.FC<{ r: WorkResult }>;
}

/**
 * CalculationPanel: Detailed Calculations & Force Work Analysis.
 * Organizes the mathematical formula breakdown, force-by-force work accounting table,
 * net work summation, kinematic model notes, and force-displacement graph.
 */
export const CalculationPanel: React.FC<CalculationPanelProps> = ({
  result: r,
  displacement: s,
  description,
  graph = false,
  alt,
  FsGraphComponent,
}) => {
  return (
    <section
      aria-label="Work done by each force"
      className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-sm"
      data-testid="work-readout"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-primary font-mono text-sm font-bold">
            ∑
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Detailed Calculations & Force Analysis
            </h3>
            <p className="text-[11px] text-slate-400">
              Force-by-force work accounting and net energy transfer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-surface-lowest text-slate-300 border border-surface-border">
            W = F &middot; s &middot; cos(θ)
          </span>
        </div>
      </div>

      {/* Applied Force Formula Banner */}
      <div
        className="rounded-xl border p-3.5 text-slate-100 font-mono text-xs sm:text-sm bg-gradient-to-r from-indigo-950/30 to-surface-lowest flex items-center flex-wrap gap-2"
        style={{ borderColor: `${PHYS.force}66` }}
        data-testid="work-formula"
      >
        <span
          className="font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded border"
          style={{
            color: PHYS.force,
            borderColor: `${PHYS.force}44`,
            backgroundColor: `${PHYS.force}15`,
          }}
        >
          Applied force
        </span>
        <span className="text-slate-300 font-sans">:</span>
        <span>
          W = F &times; s = ({fmtSigned(r.applied.alongAxis)} N) &times; ({fmtSigned(s)} m) ={' '}
          <strong className="font-bold text-white text-base" style={{ color: PHYS.force }}>
            {fmtSigned(r.appliedWork)} J
          </strong>
        </span>
      </div>

      {/* Accounting Table */}
      <div
        className="overflow-x-auto rounded-xl border border-surface-border bg-surface-lowest/60"
        role="region"
        aria-label="Work table"
        tabIndex={0}
      >
        <table className="w-full text-xs">
          <caption className="sr-only">
            Each force on the object, how it is related to the displacement and the work it does, with the net work.
          </caption>
          <thead>
            <tr className="bg-surface-elevated/70 text-slate-300 border-b border-surface-border text-left">
              <th scope="col" className="p-3 font-semibold">Force (exerted by)</th>
              <th scope="col" className="p-3 font-semibold">Size and direction</th>
              <th scope="col" className="p-3 font-semibold">Compared with displacement</th>
              <th scope="col" className="p-3 font-semibold text-right">Work Done</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {r.forces.map((f) => (
              <tr
                key={f.id}
                className="hover:bg-surface-card/40 transition-colors align-middle"
                data-force-row={f.id}
              >
                <td className="p-3 font-bold" style={{ color: COLOR[f.id] }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: COLOR[f.id] }}
                    />
                    <span>{f.label}</span>
                    <span className="font-normal text-slate-400 font-mono text-[11px]">
                      ({f.by})
                    </span>
                  </div>
                </td>
                <td className="p-3 text-slate-200 font-mono">
                  {fmt(f.magnitude)} N{' '}
                  <span className="text-slate-400 font-sans">
                    {f.magnitude === 0
                      ? ''
                      : f.fy === 0
                      ? f.fx > 0
                        ? 'right'
                        : 'left'
                      : f.fx === 0
                      ? f.fy > 0
                        ? 'up'
                        : 'down'
                      : 'at an angle'}
                  </span>
                </td>
                <td className="p-3 text-slate-300">
                  <span className="bg-surface-container px-2 py-0.5 rounded border border-surface-border text-[11px]">
                    {RELATION_TEXT[f.relation]}
                  </span>
                </td>
                <td
                  className="p-3 font-mono font-bold text-right"
                  data-work={f.work}
                  style={{
                    color: f.work > 0 ? PHYS.correct : f.work < 0 ? PHYS.error : '#CBD5E1',
                  }}
                >
                  <span className="text-sm">{fmtSigned(f.work)} J</span>{' '}
                  <span className="font-sans font-normal text-[11px] opacity-80">
                    {f.work > 0 ? '(positive)' : f.work < 0 ? '(negative)' : '(zero)'}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-surface-border bg-surface-elevated/40" data-force-row="net">
              <th scope="row" className="p-3 text-left font-bold text-white">
                Net work (all forces added)
              </th>
              <td className="p-3 text-slate-400 font-mono text-[11px]" colSpan={2}>
                ∑ W = {r.forces.map((f) => fmt(f.work)).join(' + ')}
              </td>
              <td
                className="p-3 font-mono font-bold text-right text-base text-white"
                data-testid="net-work"
                data-work={r.netWork}
              >
                {fmtSigned(r.netWork)} J
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Model Description & Graph */}
      <div className="space-y-3 pt-2">
        {!alt && (
          <p className="text-xs text-slate-300 bg-surface-lowest/70 p-3 rounded-lg border border-surface-border leading-relaxed" data-testid="work-description">
            {description}
          </p>
        )}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          This is a <strong>kinematic work model</strong>: you choose the displacement, the model does not solve Newton&apos;s second law. It reports the work each constant force does over that displacement.
        </p>

        {graph && FsGraphComponent && (
          <div className="pt-2 border-t border-surface-border/60">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Force-Displacement Graph (W = Area under F(s))
            </h4>
            <FsGraphComponent r={r} />
          </div>
        )}
      </div>
    </section>
  );
};
