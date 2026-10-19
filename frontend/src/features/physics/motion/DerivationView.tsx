/**
 * Understand the Derivation (PHY-1F): student-guided derivations of the three equations of motion with a
 * synchronised velocity–time figure. The figure and every number come from the same constant-acceleration
 * profile the Graph Studio and the Equation Laboratory use. Navigating the derivation records nothing and
 * never counts as mastery; steps with a check stay closed until the student supplies the missing reasoning.
 */

import React, { useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { DERIVATIONS, DERIVATION_CASES, derivationById, motionOf, signedPieces, type Derivation, type DerivationStep, type Highlight } from '../../../engine/physics/motion/derivations';
import { fmt, fmtSign, series, totalTime, type Profile } from '../../../engine/physics/motion/profile';
import { QuestionView } from '../../education/QuestionView';
import { PHYS } from './physicsColors';

const W = 520, H = 230, ML = 46, MR = 16, MT = 16, MB = 34;

const Figure: React.FC<{ profile: Profile; uses: Highlight[]; derivation: Derivation }> = ({ profile, uses, derivation }) => {
  const m = motionOf(profile), T = totalTime(profile);
  const pts = series(profile, 80);
  const vs = pts.map((p) => p.v);
  let lo = Math.min(0, ...vs, m.u), hi = Math.max(0, ...vs, m.u);
  const pad = Math.max(1, (hi - lo) * 0.12); lo -= pad; hi += pad;
  const X = (t: number) => ML + (t / T) * (W - ML - MR);
  const Y = (v: number) => MT + (1 - (v - lo) / (hi - lo)) * (H - MT - MB);
  const on = (h: Highlight) => uses.includes(h);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t)},${Y(p.v)}`).join(' ');
  const rect = `M${X(0)},${Y(0)} L${X(T)},${Y(0)} L${X(T)},${Y(m.u)} L${X(0)},${Y(m.u)} Z`;
  const tri = `M${X(0)},${Y(m.u)} L${X(T)},${Y(m.u)} L${X(T)},${Y(m.v)} Z`;
  const whole = `M${X(0)},${Y(0)} ` + pts.map((p) => `L${X(p.t)},${Y(p.v)}`).join(' ') + ` L${X(T)},${Y(0)} Z`;
  const pieces = signedPieces(m);
  const showAreas = derivation.id === 'B';
  const dim = (h: Highlight) => (on(h) ? 1 : 0.18);
  const label = `Velocity–time graph from t = 0 to ${fmt(T)} s: the velocity goes from u = ${fmtSign(m.u)} m/s to v = ${fmtSign(m.v)} m/s with a = ${fmtSign(m.a)} m/s². Rectangle (height u) area ${fmtSign(pieces.rect)} m, triangle (height v − u) area ${fmtSign(pieces.tri)} m, total ${fmtSign(pieces.total)} m.`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="derivation-figure">
      <defs><pattern id="dhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill={PHYS.distance} opacity={0.12} /><line x1="0" y1="0" x2="0" y2="6" stroke={PHYS.distance} strokeWidth="2" opacity={0.7} /></pattern></defs>
      <line x1={ML} y1={Y(0)} x2={W - MR} y2={Y(0)} stroke="#94a3b8" strokeWidth={1.2} />
      <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#94a3b8" strokeWidth={1.2} />
      <text x={W - MR} y={H - MB - 5} textAnchor="end" fontSize={11} fill={PHYS.time}>time (s)</text>
      <text transform={`translate(12 ${H / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill={PHYS.velocity}>velocity (m/s)</text>
      {showAreas && on('total') && <path d={whole} fill={PHYS.displacement} opacity={0.3} />}
      {showAreas && <path d={rect} data-region="rect" fill={m.u < 0 ? 'url(#dhatch)' : PHYS.position} opacity={on('rect') ? 0.5 : 0.08} stroke={PHYS.position} strokeWidth={on('rect') ? 1.5 : 0} />}
      {showAreas && <path d={tri} data-region="tri" fill={m.v < m.u ? 'url(#dhatch)' : PHYS.acceleration} opacity={on('tri') ? 0.55 : 0.08} stroke={PHYS.acceleration} strokeWidth={on('tri') ? 1.5 : 0} />}
      <path d={line} fill="none" stroke={PHYS.velocity} strokeWidth={on('slope') ? 4 : 2.5} />
      <g opacity={dim('u')}><circle cx={X(0)} cy={Y(m.u)} r={5} fill={PHYS.velocity} /><text x={X(0) + 8} y={Y(m.u) - 7} fontSize={12} fontWeight={700} fill={PHYS.velocity}>u = {fmtSign(m.u)}</text></g>
      <g opacity={dim('v')}><circle cx={X(T)} cy={Y(m.v)} r={5} fill={PHYS.velocity} /><text x={X(T) - 8} y={Y(m.v) - 7} textAnchor="end" fontSize={12} fontWeight={700} fill={PHYS.velocity}>v = {fmtSign(m.v)}</text></g>
      <g opacity={dim('t')}><line x1={X(0)} y1={H - MB + 8} x2={X(T)} y2={H - MB + 8} stroke={PHYS.time} strokeWidth={2} /><text x={(X(0) + X(T)) / 2} y={H - MB + 20} textAnchor="middle" fontSize={11} fill={PHYS.time}>t = {fmt(T)} s</text></g>
      {on('slope') && <text x={(X(0) + X(T)) / 2} y={MT + 10} textAnchor="middle" fontSize={11} fill={PHYS.acceleration}>slope = a = {fmtSign(m.a)} m/s²</text>}
    </svg>
  );
};

export const DerivationView: React.FC<{ id?: string; alt?: string }> = ({ id = 'A' }) => {
  const [which, setWhich] = useState<string>(derivationById(id)?.id ?? 'A');
  const d = derivationById(which)!;
  const [caseId, setCaseId] = useState(DERIVATION_CASES[0].id);
  const profile = DERIVATION_CASES.find((c) => c.id === caseId)!.profile;
  const m = motionOf(profile);
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const step: DerivationStep = d.steps[i];
  const gated = Boolean(step.check) && !solved[`${d.id}-${step.id}`];
  const last = i === d.steps.length - 1;
  const skipDivision = Boolean(step.needsNonzeroA) && m.a === 0;
  const rel = step.relation && !skipDivision ? step.relation(m) : null;
  const choose = (x: string) => { setWhich(x); setI(0); };
  const go = (n: number) => setI(Math.min(d.steps.length - 1, Math.max(0, n)));
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'ArrowRight' && !gated) { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };

  return (
    <div className="space-y-3" data-visual="derivation" data-testid="derivation" data-derivation={d.id}>
      <div role="group" aria-label="Choose a derivation" className="flex flex-wrap gap-2">
        {DERIVATIONS.map((x) => <button key={x.id} type="button" data-derivation-tab={x.id} aria-pressed={x.id === d.id} onClick={() => choose(x.id)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: x.id === d.id ? PHYS.prediction : '#334155' }}>{x.id === d.id ? '✓ ' : ''}{x.id}. {x.equation} <span className="text-slate-400">(Eq. {x.textbookNumber})</span></button>)}
      </div>
      <h3 className="text-lg font-bold text-white">{d.title}</h3>
      <div className="rounded-xl border p-3 text-xs text-slate-200 space-y-1" style={{ borderColor: `${PHYS.displacement}66` }} data-testid="derivation-assumptions">
        <strong style={{ color: PHYS.displacement }}>Assumptions</strong>
        <ul className="list-disc pl-5">{d.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <label className="flex items-center gap-2">Case for the figure
          <select value={caseId} onChange={(e) => setCaseId(e.target.value)} aria-label="Case shown in the figure" data-testid="derivation-case" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
            {DERIVATION_CASES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <span>u = {fmtSign(m.u)} m/s, a = {fmtSign(m.a)} m/s², t = {fmt(m.t)} s, v = {fmtSign(m.v)} m/s, s = {fmtSign(m.s)} m (from the motion model)</span>
      </div>
      <Figure profile={profile} uses={step.uses} derivation={d} />

      <div tabIndex={0} onKeyDown={onKey} role="group" aria-label={`Derivation step ${i + 1} of ${d.steps.length}`} className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" data-testid="derivation-step" data-step={step.id}>
        <div className="text-[11px] font-mono text-slate-400">Step {i + 1} of {d.steps.length}</div>
        <h4 className="text-sm font-bold text-white">{step.title}</h4>
        {gated && step.check ? (
          <div className="space-y-2" data-testid="derivation-gate">
            <p className="text-xs" style={{ color: PHYS.prediction }}>{'★'} Supply the missing reasoning first. The mathematics of this step appears after your answer.</p>
            <QuestionView question={step.check} onSubmit={(ev) => { if (ev.correct) setSolved((s) => ({ ...s, [`${d.id}-${step.id}`]: true })); }} />
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-surface-lowest p-2 font-mono text-sm text-white space-y-1" data-testid="derivation-math">{step.math.map((l) => <div key={l}>{l}</div>)}</div>
            <p className="text-xs text-slate-200"><strong>Why this is valid: </strong>{step.why}</p>
            {skipDivision && <p className="text-xs" style={{ color: PHYS.error }}>This case has a = 0, so this step (which divides by a) does not apply. Open the last step of Derivation C for a = 0.</p>}
            {rel && (
              <p className="text-xs rounded-lg p-2 border" style={{ borderColor: `${PHYS.correct}66`, color: '#e2e8f0' }} data-testid="derivation-numbers">
                <strong style={{ color: PHYS.correct }}>{Math.abs(rel.lhs - rel.rhs) < 1e-9 ? '✓ ' : '✗ '}Numerical check for this case: </strong>{rel.label}: {fmt(rel.lhs, 3)} and {fmt(rel.rhs, 3)}. Checking numbers for one case illustrates the step; the algebra above is what proves it for every case.
              </p>
            )}
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm font-bold disabled:opacity-40" data-testid="derivation-prev">{'←'} Previous step</button>
          <button type="button" onClick={() => go(i + 1)} disabled={last || gated} className="min-h-[44px] px-4 rounded-lg text-slate-950 text-sm font-bold disabled:opacity-40" style={{ background: PHYS.position }} data-testid="derivation-next">Next step {'→'}</button>
        </div>
        <p className="text-[11px] text-slate-400">Tip: with this box focused, the left and right arrow keys move between steps.</p>
      </div>

      {last && !gated && (
        <div className="rounded-xl border p-3 space-y-1" style={{ borderColor: `${PHYS.correct}80` }} data-testid="derivation-summary">
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.correct }}>{'✓'} Derivation in brief (for revision)</h4>
          {d.summary.map((l) => <div key={l} className="font-mono text-sm text-white">{l}</div>)}
        </div>
      )}
    </div>
  );
};

export const DerivationVisual: React.FC<VisualProps> = ({ props, alt }) => <DerivationView id={String((props as { id?: string }).id ?? 'A')} alt={alt} />;
