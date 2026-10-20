import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SCENARIOS, scenarioById } from '../../../engine/physics/motion/profile';
import { GraphStudioView } from './MotionGraphs';
import { WorkspaceShell } from '../../workspace';

export const MotionGraphStudio: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const currentId = params.get('scenario') ?? 'uniform-acc';
  const sc = scenarioById(currentId) ?? scenarioById('uniform-acc')!;

  const selectScenario = (id: string) => {
    setParams({ scenario: id });
  };

  // Outliner: Scenarios & Presets
  const outlinerContent = (
    <div className="p-3 space-y-3 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Motion Scenarios</span>
        <span className="text-[11px] font-mono text-primary font-bold">{SCENARIOS.length} Total</span>
      </div>
      <div role="group" aria-label="Choose a scenario" className="flex flex-col gap-1.5">
        {SCENARIOS.map((x) => (
          <button
            key={x.id}
            type="button"
            data-scenario={x.id}
            aria-pressed={sc.id === x.id}
            onClick={() => selectScenario(x.id)}
            className={`min-h-[38px] w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              sc.id === x.id
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{x.title}</span>
              {sc.id === x.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{x.notice}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Inspector: Kinematics rules & scenario info
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Kinematic Relations</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Position–Time Slope</p>
            <p>v = dx/dt &rarr; Velocity is slope of x–t</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Velocity–Time Slope</p>
            <p>a = dv/dt &rarr; Acceleration is slope of v–t</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Velocity–Time Area</p>
            <p>&Delta;x = &int; v dt &rarr; Area under v–t graph</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Current Scenario</span>
        <div className="p-2.5 rounded bg-surface-card border border-surface-border space-y-1.5">
          <h4 className="font-bold text-white text-xs">{sc.title}</h4>
          <div className="p-2 rounded bg-sky-950/40 border border-sky-500/30 text-[11px] text-sky-300">
            <strong>Key Insight:</strong> {sc.notice}
          </div>
        </div>
      </div>
    </div>
  );

  // Viewport: GraphStudioView
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="motion-graphs">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        <GraphStudioView key={sc.id} scenarioId={sc.id} editable withPrediction />
      </div>
    </div>
  );

  // Analysis Dock: Model & interpretation summary
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-sans">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Graph Telemetry & Interpretation</span>
        <span className="text-outline">Exact Kinematic Integration</span>
      </div>
      <p className="text-slate-300 leading-relaxed">
        These are <em>model</em> graphs of an idealised motion with constant acceleration. The position–time, velocity–time,
        and acceleration–time curves are mathematically synchronized to the time cursor above.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline block text-[10px]">X-T INTERPRETATION</span>
          <span className="text-slate-200">Slope &gt; 0: Forward motion. Flat: At rest.</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline block text-[10px]">V-T INTERPRETATION</span>
          <span className="text-slate-200">Slope: Acceleration. Area: Displacement.</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline block text-[10px]">A-T INTERPRETATION</span>
          <span className="text-slate-200">Constant horizontal step for uniform acceleration.</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="motion"
      labTitle="Motion Graph Studio"
      outlinerTitle="Scenarios & Presets"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Kinematics Inspector"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & Telemetry"
      analysisDock={analysisDockContent}
    />
  );
};
