import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import {
  LABVERSE_SUBJECTS,
  type SubjectId,
} from '../../types/subjectRegistry';

type SubjectFilter = 'all' | 'physics' | 'chemistry' | 'mathematics';

interface MobileNavItem {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  title: string;
  subtitle: string;
  route?: string;
  badge: string;
  isReady: boolean;
  icon: string;
  testId?: string;
  accent: {
    border: string;
    iconBg: string;
    text: string;
    badgeColor: string;
  };
}

export const SubjectExplorer: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<SubjectFilter>('all');
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const filteredSubjects = LABVERSE_SUBJECTS.filter((subj) => {
    if (activeFilter === 'all') return true;
    return subj.id === activeFilter;
  });

  const getSubjectColorStyles = (id: SubjectId) => {
    switch (id) {
      case 'physics':
        return {
          border: 'border-sky-500/40 hover:border-sky-400',
          iconBg: 'bg-sky-500/20 text-sky-400',
          categoryText: 'text-sky-400',
          btnBg: 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/25',
          featureIcon: 'text-sky-400',
        };
      case 'chemistry':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          categoryText: 'text-emerald-400',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25',
          featureIcon: 'text-emerald-400',
        };
      case 'mathematics':
        return {
          border: 'border-purple-500/40 hover:border-purple-400',
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

  // Mobile-first compact launcher destinations
  const mobileNavItems: MobileNavItem[] = [
    {
      id: 'physics-electricity',
      subjectId: 'physics',
      subjectName: 'Physics',
      title: 'Electricity & Circuits',
      subtitle: 'DC loops, solderless breadboard & solver',
      route: '/physics/electricity',
      badge: 'Active Lab',
      isReady: true,
      icon: 'electric_bolt',
      accent: {
        border: 'border-sky-500/40 hover:border-sky-400',
        iconBg: 'bg-sky-500/20 text-sky-400',
        text: 'text-sky-400',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      },
    },
    {
      id: 'physics-chapters',
      subjectId: 'physics',
      subjectName: 'Physics',
      title: 'All Physics Chapters',
      subtitle: 'Class 9 Motion, Forces, Work & Electricity',
      route: '/physics',
      badge: '4 Chapters',
      isReady: true,
      icon: 'auto_stories',
      testId: 'physics-chapters-link',
      accent: {
        border: 'border-sky-500/40 hover:border-sky-400',
        iconBg: 'bg-sky-500/15 text-sky-300',
        text: 'text-sky-300',
        badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      },
    },
    {
      id: 'chemistry-matter',
      subjectId: 'chemistry',
      subjectName: 'Chemistry',
      title: 'States of Matter',
      subtitle: 'Molecular kinematics & phase transitions',
      route: '/chemistry',
      badge: 'Active Lab',
      isReady: true,
      icon: 'science',
      accent: {
        border: 'border-emerald-500/40 hover:border-emerald-400',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
        text: 'text-emerald-400',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      },
    },
    {
      id: 'mathematics-hub',
      subjectId: 'mathematics',
      subjectName: 'Mathematics',
      title: 'Mathematics Lab Hub',
      subtitle: '6 Class 9 labs: Geometry, Circles, Logic & Data',
      route: '/mathematics',
      badge: '6 Labs',
      isReady: true,
      icon: 'calculate',
      accent: {
        border: 'border-purple-500/40 hover:border-purple-400',
        iconBg: 'bg-purple-500/20 text-purple-400',
        text: 'text-purple-400',
        badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      },
    },
    {
      id: 'biology-planned',
      subjectId: 'biology',
      subjectName: 'Biology',
      title: 'Biology Laboratories',
      subtitle: 'Virtual microscopy, genetics & physiology',
      badge: 'Coming Soon',
      isReady: false,
      icon: 'biotech',
      accent: {
        border: 'border-surface-border',
        iconBg: 'bg-surface-elevated text-slate-400',
        text: 'text-slate-400',
        badgeColor: 'bg-surface-elevated text-slate-400 border-surface-border',
      },
    },
    {
      id: 'robotics-planned',
      subjectId: 'robotics',
      subjectName: 'Robotics',
      title: 'Robotics & Control Logic',
      subtitle: 'Microcontrollers, sensors & motor drivers',
      badge: 'Coming Soon',
      isReady: false,
      icon: 'precision_manufacturing',
      accent: {
        border: 'border-surface-border',
        iconBg: 'bg-surface-elevated text-slate-400',
        text: 'text-slate-400',
        badgeColor: 'bg-surface-elevated text-slate-400 border-surface-border',
      },
    },
  ];

  const filteredMobileItems = mobileNavItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.subjectId === activeFilter;
  });

  const filterTabs: { id: SubjectFilter; label: string; mobileLabel: string }[] = [
    { id: 'all', label: 'All Subjects', mobileLabel: 'All' },
    { id: 'physics', label: 'Physics', mobileLabel: 'Physics' },
    { id: 'chemistry', label: 'Chemistry', mobileLabel: 'Chemistry' },
    { id: 'mathematics', label: 'Mathematics', mobileLabel: 'Math' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 lab-grid select-none">
      <GlobalHeader onOpenGuide={() => setGuideModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8">
        {/* Compact Hero Section */}
        {/* Hero & Subject Filter Bar */}
        <section className="flex flex-col gap-4 sm:gap-5 pb-4 sm:pb-6 border-b border-surface-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">school</span>
              <span>Interactive Virtual STEM Laboratories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Choose a Laboratory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Virtual workbenches with real physical solvers for NCERT Class 9–10. Choose a subject below to begin exploring immediately.
            </p>
          </div>

          {/* Subject Navigation Filter Bar */}
          <div
            className="flex items-center gap-1.5 p-1 bg-surface-card border border-surface-border rounded-xl self-start shadow-inner overflow-x-auto no-scrollbar max-w-full"
            role="tablist"
            aria-label="Filter by subject"
          >
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  role="tab"
                  aria-selected={active}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[34px] flex items-center justify-center transition-all ${
                    active
                      ? 'bg-primary text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-surface-elevated/60'
                  }`}
                >
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 1. MOBILE-FIRST COMPACT APPLICATION LAUNCHER (< 640px) */}
        <section className="block sm:hidden space-y-2.5" aria-label="Laboratories launcher">
          {filteredMobileItems.map((item) => {
            if (item.isReady && item.route) {
              return (
                <Link
                  key={item.id}
                  to={item.route}
                  data-testid={item.testId}
                  className={`flex items-center justify-between p-3.5 rounded-xl border bg-gradient-to-r from-surface-card to-[#121620] ${item.accent.border} transition-all active:scale-[0.99] gap-3 min-h-[76px] shadow-sm`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${item.accent.iconBg} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{item.title}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 ${item.accent.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">chevron_right</span>
                  </div>
                </Link>
              );
            }

            // In Development Row on Mobile
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-card/60 opacity-70 gap-3 min-h-[72px]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated text-slate-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-300 truncate">{item.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-slate-400 border border-surface-border shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-500 shrink-0">lock</span>
              </div>
            );
          })}
        </section>

        {/* 2. TABLET & DESKTOP BALANCED GRID (>= 640px) */}
        <section className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredSubjects.map((subject) => {
            const isReady = subject.status === 'ready';
            const colors = getSubjectColorStyles(subject.id);

            if (isReady && subject.route) {
              return (
                <article
                  key={subject.id}
                  className={`rounded-2xl bg-gradient-to-b from-surface-card to-[#121620] border-2 ${colors.border} transition-all duration-300 shadow-lg flex flex-col justify-between overflow-hidden relative group`}
                >
                  {/* Top Bar */}
                  <div className="px-5 py-3.5 bg-surface-elevated/70 border-b border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[20px]">{subject.icon}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-mono font-bold tracking-wider ${colors.categoryText} uppercase`}>
                          {subject.name}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">{subject.name} Laboratory</h2>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {subject.badgeText}
                    </span>
                  </div>

                  {/* Body Content with Progressive Disclosure */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-mono text-primary font-semibold uppercase tracking-wider">{subject.category}</p>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1 line-clamp-3">
                        {subject.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-2 border-t border-surface-border/50">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-slate-500">grid_view</span>
                        {subject.topicsCount} {subject.topicsCount === 1 ? 'Topic' : 'Modules'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-slate-500">science</span>
                        {subject.experimentsCount} Experiments
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-5 py-3 bg-surface-lowest/80 border-t border-surface-border flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={subject.route}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${colors.btnBg} text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95`}
                    >
                      <span>{subject.buttonText}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>

                    {subject.id === 'physics' && (
                      <Link
                        to="/physics"
                        data-testid="physics-chapters-link"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 font-semibold text-xs transition-colors"
                      >
                        <span>All physics chapters</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                      </Link>
                    )}
                  </div>
                </article>
              );
            }

            // In Development Card on Tablet/Desktop
            return (
              <article
                key={subject.id}
                className="rounded-2xl bg-surface-card/60 border border-surface-border flex flex-col justify-between overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated text-slate-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">{subject.icon}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-slate-400 border border-surface-border">
                      {subject.badgeText}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{subject.name}</h3>
                    <p className="text-xs text-primary font-mono mt-0.5">{subject.category}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {subject.description}
                  </p>
                </div>

                <div className="px-5 py-3 bg-surface-lowest/40 border-t border-surface-border flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
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

        {/* Compact Value Proposition Features Footer Banner */}
        <section className="mt-2 sm:mt-4 rounded-xl bg-surface-card/40 border border-surface-border p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0">no_accounts</span>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Zero Authentication</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Your work is saved in this browser, with no tracking. Sign out from the header when you are done.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5 shrink-0">precision_manufacturing</span>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Authoritative Physical Modeling</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Real electrical circuit solvers, molecular kinematics, and Euclidean geometry.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-purple-400 text-xl mt-0.5 shrink-0">save</span>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Local Browser Autosave</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Experiments persist locally with exportable JSON `.lab` files.
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

