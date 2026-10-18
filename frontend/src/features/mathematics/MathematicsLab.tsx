/**
 * Mathematics Laboratory Landing Page
 *
 * Implements the subject-level module selector for Mathematics (Classes 9–10).
 * Presents the 4 foundational mathematics modules with Coordinate Geometry
 * as the first active laboratory.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';

interface MathModule {
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

const MATH_MODULES: MathModule[] = [
  {
    id: 'coordinate-geometry',
    title: 'Coordinate Geometry',
    subtitle: 'Cartesian Planes & Distance Metrics',
    category: 'Class 9–10 Mathematics',
    description:
      'Explore points, segments, horizontal and vertical differences, and Euclidean distance on the 2D Cartesian plane using the Pythagorean theorem.',
    icon: 'square_foot',
    status: 'active',
    experimentsCount: 1,
    route: '/mathematics/workbench?module=coordinate-geometry&experiment=distance',
    badge: 'Active Laboratory',
  },
  {
    id: 'circles',
    title: 'Circles & Geometric Theorems',
    subtitle: "I'm Up and Down, and Round and Round",
    category: 'Class 9 NCERT Ganita Manjari',
    description:
      'Explore circle anatomy, chords, central and inscribed angles, angles in the same segment, cyclic quadrilaterals, and tangents with interactive proofs.',
    icon: 'radio_button_unchecked',
    status: 'active',
    experimentsCount: 6,
    route: '/mathematics/circles',
    badge: 'Active Laboratory',
  },
  {
    id: 'quadrilaterals',
    title: 'Quadrilaterals',
    subtitle: 'Parallelograms, Midpoint Theorem & Varignon',
    category: 'Class 9 NCERT Ganita Manjari',
    description:
      'Investigate parallelogram invariants, the Midpoint Theorem, triangle medians & centroids, Varignon parallelograms, and plane tiling with interactive proofs.',
    icon: 'crop_square',
    status: 'active',
    experimentsCount: 14,
    route: '/mathematics/quadrilaterals',
    badge: 'Active Laboratory',
  },
  {
    id: 'propositions',
    title: 'Propositions & Converses',
    subtitle: 'Logic, Counterexamples & Deductive Proofs',
    category: 'Class 9 NCERT Ganita Manjari',
    description:
      'Master mathematical statements, hypotheses & conclusions, converse formation, counterexample discovery, Baudhāyana-Pythagoras reasoning, and step-by-step deductive proofs.',
    icon: 'psychology',
    status: 'active',
    experimentsCount: 12,
    route: '/mathematics/propositions',
    badge: 'Active Laboratory',
  },
  {
    id: 'linear-equations',
    title: 'Two Variables, One Line',
    subtitle: 'Linear Graphs, Slopes & Intercepts',
    category: 'Class 9 Mathematics',
    description:
      'Plot linear equations ax + by + c = 0, find solutions, and explore geometric intersections on the Cartesian plane.',
    icon: 'show_chart',
    status: 'upcoming',
    experimentsCount: 3,
    badge: 'Upcoming Module',
  },
  {
    id: 'surface-area-volume',
    title: 'Math of Space: Surface Area & Volume',
    subtitle: 'Spheres, Cylinders, Cones & Hemispheres',
    category: 'Class 9 Mathematics',
    description:
      '3D geometric slicing, lateral surface unfolds, and volumetric immersion comparisons for solid geometric figures.',
    icon: 'view_in_ar',
    status: 'upcoming',
    experimentsCount: 5,
    badge: 'Upcoming Module',
  },
  {
    id: 'data-quantities',
    title: 'How Quantities Combine: Understanding Data',
    subtitle: 'Histograms, Means & Frequency Polygons',
    category: 'Class 9 Mathematics',
    description:
      'Interactive data collection, central tendency calculations, and dynamic frequency distributions.',
    icon: 'bar_chart',
    status: 'upcoming',
    experimentsCount: 3,
    badge: 'Upcoming Module',
  },
];

export const MathematicsLab: React.FC = () => {
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
            <span className="text-white font-semibold">Mathematics</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">Classes 9–10</span>
          </nav>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-surface-container border border-surface-border">
              6 Modules • 3 Active Laboratories
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 lg:py-10 flex flex-col gap-10">
        {/* Subject Header Banner */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-surface-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">calculate</span>
              <span>Mathematics Interactive Laboratory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Mathematics Workbench
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Explore dynamic coordinate geometry, algebraic functions, and geometric theorems on an interactive Cartesian plane. Real-time calculations with zero approximations.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              to="/mathematics/workbench?module=coordinate-geometry&experiment=distance"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Launch Coordinate Geometry</span>
            </Link>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-xl">category</span>
              <span>Core Mathematics Modules</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Classes 9–10 Syllabus</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MATH_MODULES.map((mod) => {
              const isActive = mod.status === 'active';

              if (isActive && mod.route) {
                return (
                  <Link
                    key={mod.id}
                    to={mod.route}
                    className="rounded-2xl bg-gradient-to-b from-surface-card to-surface-low border-2 border-purple-500/60 hover:border-purple-400 transition-all p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-purple-500/5 group relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold">
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                          {mod.badge}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {mod.experimentsCount} Interactive Experiment
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                          <span className="material-symbols-outlined text-purple-400 text-2xl">
                            {mod.icon}
                          </span>
                          <span>{mod.title}</span>
                        </h3>
                        <p className="text-xs font-mono text-purple-400 mt-1">{mod.subtitle}</p>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {mod.description}
                      </p>

                      <div className="p-3 rounded-xl bg-surface-lowest/80 border border-purple-500/20 space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 block uppercase">
                          Featured Experiment:
                        </span>
                        <span className="text-xs font-mono text-slate-200 font-semibold block">
                          Distance Between Two Points A(2,3) & B(7,6)
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-surface-border mt-4 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Ready to Launch</span>
                      <span className="px-4 py-2 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-md">
                        <span>Open Lab</span>
                        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              }

              // Upcoming Module Card
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl bg-surface-card/40 border border-surface-border/60 p-6 sm:p-7 flex flex-col justify-between relative opacity-85"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-surface-border text-slate-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        {mod.badge}
                      </span>
                      <span className="text-xs font-mono text-slate-500">Planned for M2</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 text-2xl">
                          {mod.icon}
                        </span>
                        <span>{mod.title}</span>
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-1">{mod.subtitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-surface-border/40 mt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Curriculum in Design</span>
                    <span className="px-3 py-1.5 rounded-lg bg-surface-lowest text-slate-500 border border-surface-border/40">
                      Coming Soon
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
