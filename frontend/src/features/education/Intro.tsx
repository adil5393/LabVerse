import React from 'react';
import type { EduChapter, EduUnit } from '../../engine/education/types';

const List: React.FC<{ title: string; items: string[]; icon?: string }> = ({ title, items, icon }) => (
  <div className="space-y-1.5">
    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
      {icon && <span className="material-symbols-outlined text-[15px]">{icon}</span>}
      {title}
    </h3>
    <ul className="space-y-1 text-xs sm:text-sm text-slate-200">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-amber-400 text-xs mt-0.5">•</span>
          <span>{i}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const ChapterIntroduction: React.FC<{ chapter: EduChapter }> = ({ chapter }) => (
  <section
    aria-label="About this chapter"
    className="rounded-2xl border border-surface-border bg-gradient-to-br from-surface-card via-surface-card/90 to-surface-lowest p-4 md:p-6 space-y-4 shadow-sm"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
        <span className="material-symbols-outlined text-[20px]">explore</span>
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-400/90 block">
          Chapter Overview
        </span>
        <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-sans">
          {chapter.purpose}
        </p>
      </div>
    </div>

    <details className="rounded-xl border border-surface-border bg-surface-lowest/70 overflow-hidden">
      <summary className="cursor-pointer min-h-[44px] px-3.5 py-2 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white transition-colors">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[16px] text-primary">auto_stories</span>
          Curriculum Objectives, Applications & Outcomes
        </span>
        <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
      </summary>
      <div className="p-4 border-t border-surface-border space-y-4">
        <div className="grid gap-5 md:grid-cols-3">
          <List title="What you will learn" items={chapter.learn} icon="school" />
          <List title="Where it shows up" items={chapter.realWorld} icon="public" />
          <List title="You will be able to" items={chapter.outcomes} icon="psychology" />
        </div>
      </div>
    </details>

    <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[13px] text-slate-400">verified</span>
      {chapter.ncertNote}
    </p>
  </section>
);

export const UnitIntroduction: React.FC<{ unit: EduUnit }> = ({ unit }) => (
  <section
    aria-label={`About unit ${unit.number}`}
    className="rounded-2xl border border-surface-border bg-surface-lowest/90 p-4 space-y-3"
  >
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
          Unit {unit.number}
        </span>
        <h3 className="text-base sm:text-lg font-black text-white">{unit.title}</h3>
      </div>
    </div>

    <div className="p-3 rounded-xl bg-surface-card border border-surface-border/70 text-xs sm:text-sm text-slate-200 space-y-1">
      <span className="font-bold text-cyan-300 text-xs font-mono uppercase flex items-center gap-1">
        <span className="material-symbols-outlined text-[15px]">lightbulb</span>
        Central Idea
      </span>
      <p className="text-slate-200 leading-relaxed">{unit.centralIdea}</p>
    </div>

    <details className="rounded-xl border border-surface-border bg-surface-card/40 overflow-hidden">
      <summary className="cursor-pointer min-h-[44px] px-3.5 py-2 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white transition-colors">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-amber-400">menu_book</span>
          Vocabulary & Concepts ({unit.vocabulary.length} terms)
        </span>
        <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
      </summary>
      <div className="p-3.5 border-t border-surface-border space-y-3">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong className="text-white font-mono">Connection: </strong>
          {unit.connection}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <List title="You will discover" items={unit.discover} icon="psychology" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">dictionary</span>
              Words to know
            </h4>
            <dl className="space-y-1.5 text-xs">
              {unit.vocabulary.map((v) => (
                <div
                  key={v.term}
                  className="p-1.5 rounded-lg bg-surface-lowest/90 border border-surface-border/50"
                >
                  <dt className="inline font-bold text-cyan-300 font-mono">{v.term}</dt>
                  <dd className="inline text-slate-300">: {v.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </details>
  </section>
);
