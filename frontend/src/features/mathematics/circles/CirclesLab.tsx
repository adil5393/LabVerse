/**
 * Circles Laboratory Module Landing Page
 *
 * Implements the curriculum overview and experiment browser for Class 9 Circles:
 * "I'm Up and Down, and Round and Round" (NCERT Ganita Manjari).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { CIRCLE_EXPERIMENTS } from '../../../engine/mathematics/circles/circleExperiments';

export const CirclesLab: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid select-none">
      <GlobalHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Subject Explorer
          </Link>
          <span>/</span>
          <Link to="/mathematics" className="hover:text-amber-400 transition-colors">
            Mathematics
          </Link>
          <span>/</span>
          <span className="text-amber-400 font-bold">Class 9 Circles</span>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-amber-950/40 via-surface-card to-surface-lowest border border-amber-500/30 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                NCERT Ganita Manjari
              </span>
              <span className="text-xs font-mono text-slate-400">Class 9 Mathematics</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Circles: Interactive Constructions & Theorem Proofs
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Explore circle anatomy, chords, central and inscribed angles, cyclic quadrilaterals,
              and tangents through dynamic geometric constructions. Verify mathematical identities and
              step through rigorous Euclidean proofs.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/mathematics/circles/workbench"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                <span>Open Circles Workbench</span>
              </Link>

              <Link
                to="/mathematics"
                className="px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 font-medium text-sm transition-all"
              >
                Other Mathematics Modules
              </Link>
            </div>
          </div>
        </div>

        {/* Experiment Cards Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Experiments & Theorems</h2>
              <p className="text-xs text-slate-400">
                Choose an experiment to open the workbench pre-configured with canonical geometric scenes
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {CIRCLE_EXPERIMENTS.length} Experiments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CIRCLE_EXPERIMENTS.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">radio_button_unchecked</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        exp.curriculumClassification === 'direct_chapter'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : exp.curriculumClassification === 'supporting_prerequisite'
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {exp.curriculumClassification === 'direct_chapter'
                        ? 'Direct Chapter'
                        : exp.curriculumClassification === 'supporting_prerequisite'
                        ? 'Prerequisite'
                        : 'Extension'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                      {exp.title}
                    </h3>
                    <div className="text-xs text-amber-400/80 font-medium">{exp.subtitle}</div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {exp.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {exp.theorems.length} Theorem{exp.theorems.length > 1 ? 's' : ''} • {exp.practiceQuestions.length} Practice
                  </span>

                  <Link
                    to={`/mathematics/circles/workbench?exp=${exp.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-surface-elevated group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
