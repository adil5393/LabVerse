/**
 * Chart for an Understanding Data practice question (`udQuestionChart` visual). Shows the question's own dataset with the older
 * chart components. When the question is answered on the chart (`answer: 'segment' | 'bar'`), tapping a segment or bar reports
 * the choice as `group|category` (or `group`), exactly as the older workbench practice did.
 */

import React, { useState } from 'react';
import type { VisualProps } from '../../../education/visuals';
import { getPracticeQuestionById } from '../../../../engine/mathematics/understandingData/practiceBank';
import { StackedChart, Legend } from '../StackedChart';
import { PieChart } from '../PieChart';
import { ClusteredChart } from '../ClusteredChart';

interface Props { questionId: string; answer?: 'none' | 'segment' | 'bar' }

export const UdQuestionChart: React.FC<VisualProps> = ({ props, alt, onAnswer, locked }) => {
  const props_ = props as unknown as Props;
  const chart = getPracticeQuestionById(props_.questionId)?.chart;
  const [sel, setSel] = useState<{ groupId: string; categoryId: string } | null>(null);
  if (!chart) return <p className="text-xs text-slate-400 p-3">{alt}</p>;
  const p = { ...chart, answer: props_.answer };
  const answerMode = locked || !onAnswer ? 'none' : p.answer ?? 'none';
  const seg = (g: string, c: string) => { setSel({ groupId: g, categoryId: c }); onAnswer?.(`${g}|${c}`); };
  const bar = (g: string) => onAnswer?.(g);
  return (
    <div className="space-y-2 p-2" data-testid="ud-question-chart" aria-label={alt}>
      {p.mode === 'pie'
        ? <PieChart dataset={p.dataset} groupId={p.pieGroupId ?? p.dataset.groups[0]?.id ?? ''} selected={sel} onSelect={seg} answerMode={answerMode === 'segment' ? 'segment' : 'none'} />
        : p.mode === 'clustered'
          ? <ClusteredChart dataset={p.dataset} by={p.clusterBy ?? 'group'} selected={sel} onSelect={seg} onSelectBar={bar} answerMode={answerMode as never} />
          : <StackedChart dataset={p.dataset} mode={p.mode} selected={sel} onSelect={seg} onSelectBar={bar} answerMode={answerMode} />}
      <Legend ds={p.dataset} />
      {answerMode !== 'none' && <p className="text-xs text-slate-300">Answer by tapping the {answerMode === 'bar' ? 'bar' : 'segment'} on the chart.</p>}
    </div>
  );
};
