import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';

export const ElectricityLab: React.FC = () => {
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
            <Link to="/robotics" className="text-slate-400 hover:text-primary transition-colors">Robotics</Link>
            <span className="text-slate-500">/</span>
            <span className="text-white font-semibold">Electricity & DC Circuits</span>
          </nav>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-surface-container border border-surface-border">
              Topic 01 • Solderless Breadboarding
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 lg:py-10 flex flex-col gap-10">
        {/* Topic Header Banner */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-surface-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
              <span>Robotics Laboratory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Electricity & DC Circuits
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Assemble physical circuits on a 400-tie-point virtual breadboard. Understand closed loops, forward-biased semiconductor LEDs, and Ohm's law with live scientific calculations.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              to="/robotics/electricity/workbench?mode=free"
              className="px-4 py-2.5 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-elevated text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Free Workbench</span>
            </Link>
            <Link
              to="/robotics/electricity/workbench?mode=guided"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dim text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Start Guided Lab</span>
            </Link>
          </div>
        </section>

        {/* Experiment Selection Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">biotech</span>
              <span>Select an Experiment or Workbench</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">2 Modes Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Guided Experiment */}
            <article className="rounded-2xl bg-gradient-to-b from-surface-card to-surface-low border-2 border-primary/60 hover:border-primary transition-all p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-primary/5 group relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-[15px]">school</span>
                    Guided Lab Experiment
                  </span>
                  <span className="text-xs font-mono text-slate-400">6 Steps • ~10 mins</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">
                    Build Your First LED Circuit
                  </h3>
                  <p className="text-xs font-mono text-primary mt-1">Experiment 01 • Foundational Electronics</p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Step-by-step interactive tutorial guiding you through placing a 400-tie breadboard, connecting a 5V DC source, inserting a current-limiting 330Ω resistor, orienting a 5mm Red LED (anode/cathode), and completing the loop with jumper wires.
                </p>

                {/* Equipment checklist */}
                <div className="pt-2">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Required Equipment</h5>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-300">
                    <span className="px-2.5 py-1 rounded bg-surface-lowest border border-surface-border flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      400-Point Breadboard
                    </span>
                    <span className="px-2.5 py-1 rounded bg-surface-lowest border border-surface-border flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      5V DC Bench Source
                    </span>
                    <span className="px-2.5 py-1 rounded bg-surface-lowest border border-surface-border flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      330Ω Resistor
                    </span>
                    <span className="px-2.5 py-1 rounded bg-surface-lowest border border-surface-border flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      5mm Red LED
                    </span>
                    <span className="px-2.5 py-1 rounded bg-surface-lowest border border-surface-border flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Jumper Wires
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-surface-border flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Topological Step Validator</span>
                <Link
                  to="/robotics/electricity/workbench?mode=guided"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dim text-white text-xs font-semibold transition-all shadow-md shadow-primary/20 group-hover:gap-3"
                >
                  <span>Launch Guided Lab</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </article>

            {/* Card 2: Free Workbench */}
            <article className="rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 transition-all p-6 sm:p-7 flex flex-col justify-between shadow-lg group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-surface-border text-slate-300 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[15px]">design_services</span>
                    Open Sandbox
                  </span>
                  <span className="text-xs font-mono text-slate-400">Unrestricted</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">
                    Free DC Circuit Workbench
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">Creative Prototyping & Diagnostics</p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Full access to the virtual breadboard without guided step prompts. Place arbitrary DC components, customize resistance, wire parallel and series branches, and inspect node voltages and branch currents via the live inspector.
                </p>

                {/* Features list */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                    <span>Direct short-circuit protection and safe fault indicators</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                    <span>Beginner & Advanced mode toggling with node IDs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                    <span>Local experiment save, export, and reset</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-surface-border flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Independent Experimentation</span>
                <Link
                  to="/robotics/electricity/workbench?mode=free"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-high border border-surface-border text-white text-xs font-semibold transition-all group-hover:gap-3"
                >
                  <span>Open Free Workbench</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Scientific Topology Reference Specifications */}
        <section className="rounded-2xl bg-surface-card/60 border border-surface-border p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">description</span>
            <span>Educational Physics Model Specifications (MVP 0.1)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/70 space-y-1">
              <span className="text-slate-400">Breadboard Topology</span>
              <p className="text-white font-semibold">400 Tie-Points</p>
              <p className="text-slate-400 text-[11px]">30 columns, rows a–e & f–j, 2.54mm pitch</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/70 space-y-1">
              <span className="text-slate-400">DC Bench Supply</span>
              <p className="text-white font-semibold">5.0 V Regulated</p>
              <p className="text-slate-400 text-[11px]">Direct short-circuit graph pre-check</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/70 space-y-1">
              <span className="text-slate-400">Piecewise Diode Model</span>
              <p className="text-white font-semibold">V_forward = 2.0 V</p>
              <p className="text-slate-400 text-[11px]">Reverse leakage blocking, &gt;30mA overcurrent</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/70 space-y-1">
              <span className="text-slate-400">Reference Benchmark</span>
              <p className="text-tertiary font-semibold">I ≈ 9.09 mA</p>
              <p className="text-slate-400 text-[11px]">Calculated: (5.0V - 2.0V) / 330Ω</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
