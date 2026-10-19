/**
 * The equation panel of the Equation Laboratory (PHY-1D): substitutions with signs, what each result means,
 * the assumptions, and a check against the exact model. It never applies the constant-acceleration
 * equations across a change of acceleration.
 */

import React from 'react';
import { checkAgainstProfile, equationsApply, equationValues, substitutions } from '../../../engine/physics/motion/equations';
import { fmt, fmtSign, stateAt, totalTime, turningTimes, type Profile } from '../../../engine/physics/motion/profile';
import { PHYS } from './physicsColors';

export const EquationPanel: React.FC<{ profile: Profile; t: number }> = ({ profile, t }) => {
  const applies = equationsApply(profile);
  const T = totalTime(profile);
  const tt = Math.min(Math.max(0, t), T);
  const model = stateAt(profile, tt);

  if (!applies.ok) {
    const naive = equationValues(profile.v0, profile.segments[0].a, tt);
    return (
      <section aria-label="Equations of motion" className="rounded-xl border p-3 space-y-2 text-sm text-slate-100" style={{ borderColor: PHYS.error, background: `${PHYS.error}10` }} data-testid="equation-panel" data-applies="false">
        <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.error }}>✗ The equations do not apply to the whole motion</h3>
        <p>{applies.reason}</p>
        <p className="text-xs text-slate-300">If you used v = u + at with the first stage&apos;s acceleration for all {fmt(tt)} s you would get {fmtSign(naive.v)} m/s. The model, which follows the real change of acceleration, gives {fmtSign(model.v)} m/s. Use the equations on one stage at a time, and take the final velocity of stage one as the initial velocity of stage two.</p>
      </section>
    );
  }

  const g = profile.segments[0];
  const e = equationValues(profile.v0, g.a, tt);
  const subs = substitutions(e);
  const err = checkAgainstProfile(profile, tt);
  const turned = turningTimes(profile).some((x) => x < tt);
  return (
    <section aria-label="Equations of motion" className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-testid="equation-panel" data-applies="true">
      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Equations of motion at t = {fmt(tt)} s (u = {fmtSign(profile.v0)} m/s, a = {fmtSign(g.a)} m/s²)</h3>
      <ol className="space-y-2">
        {subs.map((s, i) => (
          <li key={s.law} className="rounded-lg border border-surface-border bg-surface-lowest p-2 text-sm space-y-0.5" data-equation={i + 1}>
            <div className="font-mono font-bold" style={{ color: i === 0 ? PHYS.velocity : i === 1 ? PHYS.displacement : PHYS.acceleration }}>{s.law}</div>
            <div className="font-mono text-slate-200">{s.working}</div>
            <div className="font-mono font-bold text-white" data-eq-result={i + 1}>{s.result}</div>
            <div className="text-xs text-slate-300">{s.meaning}</div>
          </li>
        ))}
      </ol>
      <p className="text-xs rounded-lg p-2" style={{ border: `1px solid ${PHYS.correct}80`, color: '#e2e8f0' }} data-testid="equation-check">
        <strong style={{ color: PHYS.correct }}>{err < 1e-9 ? '✓ ' : '✗ '}Model check: </strong>the exact motion model gives v = {fmtSign(model.v)} m/s and displacement {fmtSign(model.displacement)} m at this time, {err < 1e-9 ? 'the same as the equations' : 'which differs from the equations'}. Position = start position + s = {fmtSign(profile.x0 + e.s)} m.
      </p>
      {turned && <p className="text-xs text-slate-200 rounded-lg p-2 border" style={{ borderColor: PHYS.distance }}>The object has turned back, so <strong>s is the displacement ({fmtSign(model.displacement)} m)</strong> while the distance travelled is larger ({fmt(model.distance)} m). The equations give s, not the distance.</p>}
      <details className="text-xs text-slate-300">
        <summary className="cursor-pointer min-h-[44px] flex items-center font-medium text-slate-200">Sign convention and assumptions</summary>
        <ul className="list-disc pl-5 space-y-1 pb-2">
          <li>Right is positive and left is negative, for u, v, a and s alike.</li>
          <li>The acceleration is constant: the same value from the first instant to the last.</li>
          <li>The motion is along one straight line.</li>
          <li>s is the displacement (final position − initial position), not the distance travelled.</li>
          <li>v² = u² + 2as gives v² only; take the sign of v from v = u + at.</li>
        </ul>
      </details>
    </section>
  );
};
