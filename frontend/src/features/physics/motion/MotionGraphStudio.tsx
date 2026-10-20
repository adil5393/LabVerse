import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SCENARIOS, scenarioById } from '../../../engine/physics/motion/profile';
import { LabInspectorSection } from '../../workspace/controls';
import { GraphLab } from './GraphLab';

export const MotionGraphStudio: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const currentId = params.get('scenario') ?? 'uniform-acc';
  const sc = scenarioById(currentId) ?? scenarioById('uniform-acc')!;

  return (
    <GraphLab
      key={sc.id}
      labTitle="Motion Graph Studio"
      outlinerTitle="Scenarios & Presets"
      inspectorTitle="Kinematics Inspector"
      listTitle="Motion Scenarios"
      items={SCENARIOS.map((x) => ({ id: x.id, title: x.title, goal: x.notice }))}
      activeId={sc.id}
      onPick={(id) => setParams({ scenario: id })}
      scenarioId={sc.id}
      kinds={['xt', 'vt', 'at']}
      withPrediction
      insight={(
        <LabInspectorSection title={`Scenario · ${sc.title}`} icon={<span className="material-symbols-outlined text-[15px] text-primary">school</span>}>
          <div className="p-2 rounded bg-sky-950/40 border border-sky-500/30 text-[11px] text-sky-300"><strong>Key insight:</strong> {sc.notice}</div>
        </LabInspectorSection>
      )}
      reference={(
        <LabInspectorSection title="Kinematic relations" icon={<span className="material-symbols-outlined text-[15px]">functions</span>}>
          <div className="space-y-2 font-mono text-slate-300">
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Position–time slope</p><p>v = dx/dt &rarr; velocity is the slope of x–t</p></div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Velocity–time slope</p><p>a = dv/dt &rarr; acceleration is the slope of v–t</p></div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Velocity–time area</p><p>&Delta;x = &int; v dt &rarr; the area under the v–t graph</p></div>
          </div>
        </LabInspectorSection>
      )}
      notes={(
        <>
          <p className="font-mono text-primary font-bold">Graph telemetry and interpretation · exact kinematic integration</p>
          <p>These are <em>model</em> graphs of an idealised motion with constant acceleration. The position–time, velocity–time and acceleration–time curves are mathematically synchronised to the time cursor.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>x–t:</strong> a slope above zero is forward motion; a flat line is at rest.</li>
            <li><strong>v–t:</strong> the slope is the acceleration; the area is the displacement.</li>
            <li><strong>a–t:</strong> a constant horizontal line means uniform acceleration.</li>
          </ul>
        </>
      )}
    />
  );
};
