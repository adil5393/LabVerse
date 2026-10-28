import React from 'react';
import type { EduChapter, EduUnit } from '../../engine/education/types';
import { chapterIntroSegments, unitIntroSegments } from '../../engine/narration/segments';
import { Nar, NarrationEnabledProvider, NarrationRegion } from '../narration/NarrationRegion';
import { NarrationPlayer } from '../narration/NarrationPlayer';
import type { NarrationSegment } from '../../engine/narration/controller';


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
  <NarrationEnabledProvider enabled>
  <NarrationRegion segments={chapterIntroSegments(chapter)} resetKey={chapter.id}>
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
        <Nar id={`${chapter.id}:purpose`} className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-sans">
          {chapter.purpose}
        </Nar>
        <NarrationPlayer label="the chapter overview" />
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
  </NarrationRegion>
  </NarrationEnabledProvider>
);

const unitSegments = (unit: EduUnit): NarrationSegment[] => unitIntroSegments(unit);

/** `physics` switches narration on for the unit overview; other subjects keep their pages unchanged until they adopt it. */
export const UnitIntroduction: React.FC<{ unit: EduUnit; narrate?: boolean }> = ({ unit, narrate = false }) => (
  <NarrationEnabledProvider enabled={narrate}>
  <NarrationRegion segments={unitSegments(unit)} resetKey={unit.id}>
  <section
    aria-label={`About unit ${unit.number}`}
    className="space-y-3.5 min-w-0 w-full"
  >
    {/* Unit Header */}
    <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shrink-0">
          Unit {unit.number}
        </span>
        <Nar as="h3" id={`${unit.id}:title`} className="text-base sm:text-xl font-black text-white tracking-tight truncate">{unit.title}</Nar>
      </div>
      <span className="text-xs font-mono text-slate-400 shrink-0">
        {unit.lessonIds.length} {unit.lessonIds.length === 1 ? 'lesson' : 'lessons'}
      </span>
    </div>

    {/* Central Idea: Distinct Level 3 Surface with Accent */}
    <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-lowest/95 border border-surface-border/70 border-l-4 border-l-cyan-400 text-xs sm:text-sm text-slate-200 space-y-1.5 shadow-xs min-w-0">
      <span className="font-bold text-cyan-300 text-xs font-mono uppercase tracking-wide flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">lightbulb</span>
        Central Idea
      </span>
      <Nar id={`${unit.id}:idea`} className="text-slate-200 leading-relaxed font-sans break-words">{unit.centralIdea}</Nar>
      <NarrationPlayer label="the unit overview" />
    </div>

    {/* Vocabulary & Concepts: Subordinate Collapsible Support */}
    <details className="rounded-xl border border-surface-border/50 bg-surface-lowest/50 overflow-hidden group">
      <summary className="cursor-pointer min-h-[42px] px-3.5 py-2 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white transition-colors select-none">
        <span className="flex items-center gap-1.5 font-medium min-w-0">
          <span className="material-symbols-outlined text-[16px] text-amber-400/90 shrink-0">menu_book</span>
          <span className="truncate">Vocabulary &amp; Concepts ({unit.vocabulary.length} terms)</span>
        </span>
        <span className="material-symbols-outlined text-[16px] text-slate-400 group-open:rotate-180 transition-colors shrink-0">expand_more</span>
      </summary>
      <div className="p-3.5 border-t border-surface-border/50 space-y-3 bg-surface-lowest/70 min-w-0">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
          <strong className="text-white font-mono">Connection: </strong>
          {unit.connection}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 min-w-0">
          <List title="You will discover" items={unit.discover} icon="psychology" />
          <div className="space-y-1.5 min-w-0">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">dictionary</span>
              Words to know
            </h4>
            <dl className="space-y-1.5 text-xs">
              {unit.vocabulary.map((v) => (
                <div
                  key={v.term}
                  className="p-2 rounded-lg bg-surface-card/60 border border-surface-border/50 min-w-0"
                >
                  <dt className="inline font-bold text-cyan-300 font-mono">{v.term}</dt>
                  <dd className="inline text-slate-300 break-words">: {v.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </details>
  </section>
  </NarrationRegion>
  </NarrationEnabledProvider>
);
