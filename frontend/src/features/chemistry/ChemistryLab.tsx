/**
 * Chemistry Laboratory Landing Page
 *
 * Implements the subject-level module selector for Chemistry (Class 9).
 * Features "States of Matter & Particle Motion" as the first active laboratory,
 * and displays upcoming curriculum modules in clearly disabled states.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';

interface ChemistryModule {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  icon: string;
  status: 'active' | 'upcoming';
  experimentsCount: number;
  route?: string;
  badge: string;
}

const CHEMISTRY_MODULES: ChemistryModule[] = [
  {
    id: 'states-of-matter',
    title: 'States of Matter & Particle Motion',
    subtitle: 'Kinetic Theory, Latent Heat & Phase Transitions',
    category: 'Class 9 Chemistry',
    description:
      'Investigate microscopic particle arrangement in solids, liquids, and gases. Explore melting, boiling, latent heat plateaus, and gas compressibility with real physical thermodynamic modeling.',
    icon: 'bubble_chart',
    status: 'active',
    experimentsCount: 1,
    route: '/chemistry/states-of-matter',
    badge: 'Active Laboratory',
  },
  {
    id: 'diffusion-mixing',
    title: 'Diffusion & Mixing',
    subtitle: 'Intermolecular Transport & Graham’s Law',
    category: 'Class 9 Chemistry',
    description:
      'Simulate the spontaneous intermingling of gas and liquid particles driven by thermal kinetic motion and concentration gradients.',
    icon: 'grain',
    status: 'upcoming',
    experimentsCount: 3,
    badge: 'Upcoming Module',
  },
  {
    id: 'mixtures-separation',
    title: 'Mixtures & Separation',
    subtitle: 'Homogeneous & Heterogeneous Systems',
    category: 'Class 9 Chemistry',
    description:
      'Explore solutions, suspensions, colloids, fractional distillation, chromatography, and centrifugation separation techniques.',
    icon: 'filter_alt',
    status: 'upcoming',
    experimentsCount: 4,
    badge: 'Upcoming Module',
  },
  {
    id: 'atomic-structure',
    title: 'Atomic Structure',
    subtitle: 'Subatomic Particles & Bohr Model',
    category: 'Class 9 Chemistry',
    description:
      'Interactive Rutherford gold foil scattering, protons, neutrons, electrons, electron shell configurations, and valency.',
    icon: 'blur_on',
    status: 'upcoming',
    experimentsCount: 3,
    badge: 'Upcoming Module',
  },
  {
    id: 'atoms-molecules',
    title: 'Atoms & Molecules',
    subtitle: 'Laws of Chemical Combination & Mole Concept',
    category: 'Class 9 Chemistry',
    description:
      'Stoichiometric ratios, molecular mass calculations, chemical formula builder, and Avogadro’s constant interactive sandbox.',
    icon: 'hub',
    status: 'upcoming',
    experimentsCount: 4,
    badge: 'Upcoming Module',
  },
  {
    id: 'conservation-mass',
    title: 'Conservation of Mass',
    subtitle: 'Lavoisier Reaction Chamber & Mass Balance',
    category: 'Class 9 Chemistry',
    description:
      'Verify that mass is neither created nor destroyed in a closed chemical reaction system using precision analytical balances.',
    icon: 'balance',
    status: 'upcoming',
    experimentsCount: 2,
    badge: 'Upcoming Module',
  },
];

export const ChemistryLab: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid select-none">
      <GlobalHeader />

      {/* Breadcrumb strip */}
      <div className="bg-surface-low border-b border-surface-border px-6 lg:px-10 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
          <nav className="flex items-center gap-2 font-medium">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-light transition-colors group"
            >
              <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>All Subjects</span>
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-white font-semibold">Chemistry</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">Class 9</span>
          </nav>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Chemistry Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 lg:py-10 flex flex-col gap-8">
        {/* Module Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <span className="material-symbols-outlined text-[15px]">science</span>
              <span>Laboratory Curriculum · Class 9</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Chemistry Laboratory
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore the particulate nature of matter, phase change thermodynamics, latent heat plateaus, and molecular kinetics through real-time physical simulation.
            </p>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHEMISTRY_MODULES.map((mod) => {
            const isActive = mod.status === 'active';

            const cardContent = (
              <div
                className={`relative h-full flex flex-col p-6 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-card hover:bg-surface-elevated border-surface-border hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20 cursor-pointer group'
                    : 'bg-surface-card/40 border-surface-border/40 opacity-70 cursor-not-allowed select-none'
                }`}
              >
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                      isActive
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105'
                        : 'bg-surface-low border border-surface-border/40 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {mod.icon}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-surface-low border-surface-border/50 text-slate-500'
                    }`}
                  >
                    {mod.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1 mb-3">
                  <span className="text-[11px] font-mono text-emerald-400/90 font-medium tracking-wide uppercase">
                    {mod.category}
                  </span>
                  <h2
                    className={`text-lg font-bold transition-colors ${
                      isActive
                        ? 'text-white group-hover:text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {mod.title}
                  </h2>
                  <p className="text-xs font-mono text-slate-400">{mod.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/80 leading-relaxed line-clamp-3 mb-6">
                  {mod.description}
                </p>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">
                    {mod.experimentsCount} {mod.experimentsCount === 1 ? 'Simulation' : 'Experiments'}
                  </span>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Launch Laboratory</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px]">
                      Curriculum Pipeline
                    </span>
                  )}
                </div>
              </div>
            );

            if (isActive && mod.route) {
              return (
                <Link key={mod.id} to={mod.route} className="block h-full">
                  {cardContent}
                </Link>
              );
            }

            return <div key={mod.id}>{cardContent}</div>;
          })}
        </section>
      </main>
    </div>
  );
};
