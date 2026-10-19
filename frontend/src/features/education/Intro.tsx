import React from 'react';
import type { EduChapter, EduUnit } from '../../engine/education/types';

const List: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div>
    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5">{title}</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-200">{items.map((i) => <li key={i}>{i}</li>)}</ul>
  </div>
);

export const ChapterIntroduction: React.FC<{ chapter: EduChapter }> = ({ chapter }) => (
  <section aria-label="About this chapter" className="rounded-2xl border border-surface-border bg-surface-card p-4 md:p-6 space-y-4">
    <p className="text-sm md:text-base text-slate-200 max-w-3xl leading-relaxed">{chapter.purpose}</p>
    <div className="grid gap-5 md:grid-cols-3">
      <List title="What you will learn" items={chapter.learn} />
      <List title="Where it shows up" items={chapter.realWorld} />
      <List title="You will be able to" items={chapter.outcomes} />
    </div>
    <p className="text-[11px] font-mono text-slate-500">{chapter.ncertNote}</p>
  </section>
);

export const UnitIntroduction: React.FC<{ unit: EduUnit }> = ({ unit }) => (
  <section aria-label={`About unit ${unit.number}`} className="rounded-2xl border border-surface-border bg-surface-lowest p-4 space-y-3">
    <h3 className="text-lg font-black text-white">Unit {unit.number}: {unit.title}</h3>
    <p className="text-sm text-slate-200"><strong className="text-cyan-300">Central idea: </strong>{unit.centralIdea}</p>
    <p className="text-sm text-slate-300"><strong className="text-white">How it connects: </strong>{unit.connection}</p>
    <div className="grid gap-4 md:grid-cols-2">
      <List title="You will discover" items={unit.discover} />
      <div>
        <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5">Words to know</h4>
        <dl className="space-y-1 text-sm">
          {unit.vocabulary.map((v) => <div key={v.term}><dt className="inline font-bold text-cyan-300">{v.term}</dt> <dd className="inline text-slate-300">: {v.meaning}</dd></div>)}
        </dl>
      </div>
    </div>
  </section>
);
