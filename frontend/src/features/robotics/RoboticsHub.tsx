/**
 * Robotics section (/robotics): LabVerse's dedicated home for electricity, circuits and electronics.
 *
 * Electricity is not part of the CBSE Class 9 Science curriculum (it is Class 10 content), so it lives here rather than under
 * Physics. The section lists only what exists as a link; planned topics are labelled as planned, never as available.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';

interface RoboticsTopic { id: string; title: string; text: string; icon: string; to?: string; cta?: string }

export const ROBOTICS_TOPICS: RoboticsTopic[] = [
  {
    id: 'electricity', icon: 'electrical_services', title: 'Electricity and DC Circuits', to: '/robotics/electricity', cta: 'Open the Electricity Lab',
    text: 'Build circuits on a 400-tie-point breadboard with a battery, resistors and LEDs. A real DC solver shows current and voltage, and warns about short circuits.',
  },
  { id: 'sensors', icon: 'sensors', title: 'Sensors', text: 'Light, distance and temperature sensors and how a circuit reads them.' },
  { id: 'microcontrollers', icon: 'developer_board', title: 'Microcontrollers', text: 'Programming a board to read inputs and switch outputs.' },
  { id: 'motors', icon: 'settings', title: 'Motors and control', text: 'Driving motors safely and using feedback to control motion.' },
];

export const RoboticsHub: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-section="robotics">
    <GlobalHeader />
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
        <span className="text-sky-300 font-bold">Robotics</span>
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-white">Robotics</h1>
        <p className="text-sm text-slate-300 max-w-3xl">Electricity, circuits and electronics: the hands-on side of building machines. This section sits outside the Class 9 syllabus, so explore it whenever you like.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2" data-testid="robotics-topics">
        {ROBOTICS_TOPICS.map((t) => t.to ? (
          <Link key={t.id} to={t.to} data-robotics-topic={t.id} className="block rounded-2xl border border-sky-500/40 bg-surface-card hover:border-sky-400 p-5 space-y-2 min-h-[120px] touch-manipulation">
            <span className="material-symbols-outlined text-sky-300" aria-hidden>{t.icon}</span>
            <h2 className="text-xl font-black text-white">{t.title}</h2>
            <p className="text-sm text-slate-300">{t.text}</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-sky-300">{t.cta}<span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_forward</span></span>
          </Link>
        ) : (
          <div key={t.id} data-robotics-topic={t.id} aria-disabled="true" className="rounded-2xl border border-dashed border-surface-border bg-surface-card/40 p-5 space-y-2 min-h-[120px]">
            <span className="material-symbols-outlined text-slate-400" aria-hidden>{t.icon}</span>
            <h2 className="text-xl font-black text-slate-300">{t.title}</h2>
            <p className="text-sm text-slate-400">{t.text}</p>
            <span className="inline-block text-xs font-mono px-2.5 py-1 rounded-full border border-surface-border text-slate-400">Planned, not built yet</span>
          </div>
        ))}
      </div>
    </main>
  </div>
);
