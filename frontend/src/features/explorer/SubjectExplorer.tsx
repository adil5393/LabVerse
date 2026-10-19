import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import {
  LABVERSE_SUBJECTS,
  type SubjectId,
  getAllSubjects,
  getAvailableSubjects,
  getInDevelopmentSubjects,
} from '../../types/subjectRegistry';

type FilterType = 'all' | 'ready' | 'dev';

export const SubjectExplorer: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const filteredSubjects = LABVERSE_SUBJECTS.filter((subj) => {
    if (activeFilter === 'ready') return subj.status === 'ready';
    if (activeFilter === 'dev') return subj.status === 'in_development';
    return true;
  });

  const getSubjectColorStyles = (id: SubjectId) => {
    switch (id) {
      case 'physics':
        return {
          border: 'border-sky-500/50 hover:border-sky-400',
          iconBg: 'bg-sky-500/20 text-sky-400',
          categoryText: 'text-sky-400',
          btnBg: 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/25',
          featureIcon: 'text-sky-400',
        };
      case 'chemistry':
        return {
          border: 'border-emerald-500/50 hover:border-emerald-400',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          categoryText: 'text-emerald-400',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25',
          featureIcon: 'text-emerald-400',
        };
      case 'mathematics':
        return {
          border: 'border-purple-500/50 hover:border-purple-400',
          iconBg: 'bg-purple-500/20 text-purple-400',
          categoryText: 'text-purple-400',
          btnBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25',
          featureIcon: 'text-purple-400',
        };
      default:
        return {
          border: 'border-surface-border',
          iconBg: 'bg-surface-elevated text-slate-400',
          categoryText: 'text-slate-400',
          btnBg: 'bg-surface-elevated text-slate-400',
          featureIcon: 'text-slate-400',
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 lab-grid select-none">
      <GlobalHeader onOpenGuide={() => setGuideModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-10 lg:py-12 flex flex-col gap-10">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Interactive Virtual STEM Laboratories</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Choose a Subject to Explore
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Open-ended virtual laboratory workbenches for students and educators. Real physical geometry, live circuit simulation, thermodynamic modeling, and zero login barriers.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-surface-card border border-surface-border rounded-xl self-start md:self-auto shadow-inner">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Subjects ({getAllSubjects().length})
            </button>
            <button
              onClick={() => setActiveFilter('ready')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === 'ready'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available Now ({getAvailableSubjects().length})
            </button>
            <button
              onClick={() => setActiveFilter('dev')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === 'dev'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Development ({getInDevelopmentSubjects().length})
            </button>
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((subject) => {
            const isReady = subject.status === 'ready';
            const colors = getSubjectColorStyles(subject.id);

            if (isReady && subject.route) {
              return (
                <article
                  key={subject.id}
                  className={`md:col-span-2 lg:col-span-2 rounded-2xl bg-gradient-to-b from-surface-card to-[#121620] border-2 ${colors.border} transition-all duration-300 shadow-xl shadow-primary/5 flex flex-col justify-between overflow-hidden relative group`}
                >
                  {/* Top Bar Banner */}
                  <div className="px-6 py-4 bg-surface-elevated/70 border-b border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[22px]">{subject.icon}</span>
                      </div>
                      <div>
                        <span className={`text-xs font-mono font-medium tracking-wider ${colors.categoryText} uppercase`}>
                          {subject.name} Laboratory
                        </span>
                        <h2 className="text-xl font-bold text-white tracking-tight">{subject.category}</h2>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {subject.badgeText}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                      {subject.description}
                    </p>

                    {/* Active Lab Topics Preview */}
                    {subject.features && subject.features.length > 0 && (
                      <div
                        className={`grid grid-cols-1 ${
                          subject.features.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                        } gap-4`}
                      >
                        {subject.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-surface-lowest/70 border border-surface-border/80 flex items-start gap-3"
                          >
                            <span className={`material-symbols-outlined ${colors.featureIcon} text-xl mt-0.5`}>
                              {feat.icon}
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {feat.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="px-6 py-4 bg-surface-lowest/80 border-t border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-500">grid_view</span>
                        {subject.topicsCount} Core {subject.topicsCount === 1 ? 'Topic' : 'Modules'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-500">science</span>
                        {subject.experimentsCount} Experiments
                      </span>
                    </div>

                    <Link
                      to={subject.route}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ${colors.btnBg} text-white font-semibold text-sm shadow-lg transition-all group-hover:gap-3`}
                    >
                      <span>{subject.buttonText}</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                    {subject.id === 'physics' && (
                      <Link
                        to="/physics"
                        data-testid="physics-chapters-link"
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 font-semibold text-sm"
                      >
                        <span>All physics chapters</span>
                      </Link>
                    )}
                  </div>
                </article>
              );
            }

            // In Development Card
            return (
              <article
                key={subject.id}
                className="rounded-2xl bg-surface-card/60 border border-surface-border flex flex-col justify-between overflow-hidden opacity-85 hover:opacity-100 transition-opacity"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-surface-elevated text-slate-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{subject.icon}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-surface-elevated text-slate-400 border border-surface-border">
                      {subject.badgeText}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{subject.name}</h3>
                    <p className="text-xs text-primary font-mono mt-0.5">{subject.category}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {subject.description}
                  </p>
                </div>

                <div className="px-6 py-3.5 bg-surface-lowest/40 border-t border-surface-border flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
                    {subject.topicsCount} Topics Planned
                  </span>
                  <button
                    disabled
                    className="text-xs font-medium text-slate-500 cursor-not-allowed flex items-center gap-1"
                    title={`${subject.name} is currently in development`}
                  >
                    <span>{subject.buttonText}</span>
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Value Proposition Features Banner */}
        <section className="mt-6 rounded-2xl bg-surface-card/40 border border-surface-border p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5">no_accounts</span>
            <div>
              <h4 className="text-sm font-semibold text-white">Zero Authentication</h4>
              <p className="text-xs text-slate-400 mt-1">
                No login, no passwords, and no user tracking. Starts immediately in any modern browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-2xl mt-0.5">precision_manufacturing</span>
            <div>
              <h4 className="text-sm font-semibold text-white">Scientific Physical Modeling</h4>
              <p className="text-xs text-slate-400 mt-1">
                Authoritative calculations from real electrical graph topology, thermodynamic kinematics, and Euclidean geometry.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-purple-400 text-2xl mt-0.5">save</span>
            <div>
              <h4 className="text-sm font-semibold text-white">Browser Local Storage</h4>
              <p className="text-xs text-slate-400 mt-1">
                Saved experiments persist locally in your browser with exportable JSON `.lab` files.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Guide / Documentation Modal */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span>
                About LabVerse
              </h3>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface-elevated"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              LabVerse is a scientific educational laboratory platform. It allows students to assemble real circuits using solderless breadboards, explore thermodynamic states of matter, and interact with Class 9 Euclidean geometry laboratories with authoritative physical solvers.
            </p>

            <div className="p-3 rounded-lg bg-surface-lowest border border-surface-border text-xs text-slate-400 space-y-1 font-mono">
              <div>• Subject Explorer: (/)</div>
              <div>• Physics Electricity: (/physics/electricity)</div>
              <div>• Chemistry States of Matter: (/chemistry)</div>
              <div>• Mathematics Lab Hub: (/mathematics)</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-dim text-white text-xs font-semibold rounded-lg"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
