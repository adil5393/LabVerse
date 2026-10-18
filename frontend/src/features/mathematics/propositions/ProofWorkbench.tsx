/**
 * Proof Construction Workbench Component (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useState } from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  CANONICAL_PROOF_TEMPLATES,
  getProofTemplateById,
  validateProofAssembly,
} from '../../../engine/mathematics/propositions/proofEngine';

export const ProofWorkbench: React.FC = () => {
  const {
    selectedProofTemplateId,
    setSelectedProofTemplate,
    assembledProofSteps,
    addProofStep,
    removeProofStep,
    clearProofSteps,
    proofVerificationStatus,
    proofFeedback,
    setProofFeedback,
  } = usePropositionsStore();

  const [selectedStatementId, setSelectedStatementId] = useState<string>('');
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');

  const template =
    getProofTemplateById(selectedProofTemplateId) || CANONICAL_PROOF_TEMPLATES[0];

  const handleAddStep = () => {
    if (!selectedStatementId || !selectedReasonId) return;
    addProofStep(selectedStatementId, selectedReasonId);
    setSelectedStatementId('');
    setSelectedReasonId('');
  };

  const handleVerifyProof = () => {
    const report = validateProofAssembly(template, assembledProofSteps);
    if (report.isFullyValid) {
      setProofFeedback('valid', report.feedbackMessage);
    } else {
      setProofFeedback(
        'invalid',
        `${report.feedbackMessage} ${report.nextHelpfulHint || ''}`
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full font-sans">
      {/* 1. Header & Theorem Selector */}
      <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">account_tree</span>
              <span>Deductive Proof Construction</span>
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              {template.theoremTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Select Theorem:</span>
            <select
              value={selectedProofTemplateId}
              onChange={(e) => setSelectedProofTemplate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-lowest border border-surface-border text-white text-xs font-mono font-bold outline-none focus:border-purple-400"
            >
              {CANONICAL_PROOF_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.theoremTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Claim, Givens & To Prove */}
        <div className="p-4 rounded-xl bg-surface-lowest/90 border border-surface-border/70 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Claim:</span>
            <span className="text-white font-semibold">"{template.claimStatement}"</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-surface-border/40">
            <div>
              <span className="text-emerald-400 font-bold block text-[11px]">Given:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-0.5">
                {template.givens.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-sky-400 font-bold block text-[11px]">To Prove:</span>
              <span className="text-slate-300">{template.toProve}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Step Assembly Station */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-purple-400">add_task</span>
            <span>Assemble Next Proof Step</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">
            Choose Statement + Justification Reason
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Statement Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 font-bold">
              1. Mathematical Statement:
            </label>
            <select
              value={selectedStatementId}
              onChange={(e) => setSelectedStatementId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-lowest border border-surface-border text-slate-200 text-xs font-mono outline-none focus:border-purple-400"
            >
              <option value="">-- Choose statement --</option>
              {template.candidateStatements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.statement}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 font-bold">
              2. Justification Reason:
            </label>
            <select
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-lowest border border-surface-border text-slate-200 text-xs font-mono outline-none focus:border-purple-400"
            >
              <option value="">-- Choose justification reason --</option>
              {template.candidateReasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.text} ({r.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleAddStep}
            disabled={!selectedStatementId || !selectedReasonId}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              selectedStatementId && selectedReasonId
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30'
                : 'bg-surface-elevated text-slate-500 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Step to Proof</span>
          </button>
        </div>
      </div>

      {/* 3. Assembled Proof Steps List */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Proof Argument ({assembledProofSteps.length} of {template.idealSteps.length} Steps)
            </span>
          </div>

          {assembledProofSteps.length > 0 && (
            <button
              onClick={clearProofSteps}
              className="text-[11px] font-mono text-rose-400 hover:text-rose-300 underline"
            >
              Clear All Steps
            </button>
          )}
        </div>

        {assembledProofSteps.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 italic bg-surface-lowest/50 rounded-xl border border-dashed border-surface-border">
            No steps assembled yet. Select statements and reasons above to construct your proof.
          </div>
        ) : (
          <div className="space-y-2">
            {assembledProofSteps.map((step, idx) => {
              const stmt = template.candidateStatements.find(
                (s) => s.id === step.statementId
              );
              const rsn = template.candidateReasons.find(
                (r) => r.id === step.reasonId
              );

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-lowest/90 border border-surface-border flex items-start justify-between gap-3 font-mono text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="text-slate-100 font-medium">
                        {stmt?.statement || step.statementId}
                      </div>
                      <div className="text-[11px] text-amber-400/90 flex items-center gap-1">
                        <span className="text-slate-500">Reason:</span>
                        <span className="font-semibold">{rsn?.text || step.reasonId}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeProofStep(idx)}
                    className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 flex items-center justify-center transition-colors"
                    title="Remove step"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Verification Button & Status Banner */}
        <div className="pt-3 border-t border-surface-border/60 space-y-3">
          <div className="flex justify-end">
            <button
              onClick={handleVerifyProof}
              disabled={assembledProofSteps.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg transition-all ${
                assembledProofSteps.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                  : 'bg-surface-elevated text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>Verify Proof Arguments</span>
            </button>
          </div>

          {proofFeedback && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-mono ${
                proofVerificationStatus === 'valid'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-500/50 text-rose-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                {proofVerificationStatus === 'valid' ? 'check_circle' : 'error'}
              </span>
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold block">
                  {proofVerificationStatus === 'valid'
                    ? 'Proof Verified Successfully!'
                    : 'Logical Validation Issue:'}
                </span>
                <span>{proofFeedback}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
