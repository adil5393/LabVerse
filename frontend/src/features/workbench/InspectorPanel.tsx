import React from 'react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import type { GenericEquipmentDefinition } from '../../types/workbench';
import type { ElectricalNode } from '../../types/connections';
import { getEndpointKey } from '../../engine/connectivity/endpointGeometry';

interface InspectorPanelProps {
  catalog: GenericEquipmentDefinition[];
  nodes: ElectricalNode[];
  selectedWireId?: string | null;
  onSelectWire?: (wireId: string | null) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  catalog,
  nodes,
  selectedWireId,
  onSelectWire,
}) => {
  const {
    isInspectorOpen,
    setInspectorOpen,
    selectedInstanceId,
    instances,
    attachments,
    wires,
    userMode,
    highlightedNodeId,
    setHighlightedNodeId,
    updateInstanceProperties,
    updateInstanceRotation,
    removeInstance,
    removeWire,
  } = useWorkbenchStore();

  if (!isInspectorOpen) return null;

  const selectedInstance = instances.find((inst) => inst.instanceId === selectedInstanceId);
  const definition = selectedInstance
    ? catalog.find((def) => def.id === selectedInstance.definitionId)
    : null;

  const selectedWire = wires.find((w) => w.id === selectedWireId);

  // Attachments for selected component
  const instanceAttachments = selectedInstance
    ? attachments.filter((att) => att.instanceId === selectedInstance.instanceId)
    : [];

  return (
    <aside className="w-72 sm:w-80 bg-surface-low border-l border-surface-border flex flex-col shrink-0 z-20 select-none overflow-y-auto">
      {/* Header */}
      <div className="h-11 px-3 border-b border-surface-border flex items-center justify-between bg-surface-lowest">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Inspector & Connectivity
          </span>
        </div>

        <button
          onClick={() => setInspectorOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
          title="Close Inspector"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 flex-1">
        {/* SELECTED WIRE INSPECTOR */}
        {selectedWire ? (
          <div className="space-y-3 p-3 rounded-xl bg-surface-card border border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">
                Jumper Wire
              </span>
              <button
                onClick={() => onSelectWire?.(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-white"
                  style={{ backgroundColor: selectedWire.color }}
                />
                <span className="text-xs font-mono text-white font-semibold">
                  Wire ID: {selectedWire.id.slice(0, 8)}
                </span>
              </div>
            </div>

            {/* Wire Recolor Palette */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Change Wire Color
              </span>
              <div className="flex items-center gap-2">
                {[
                  { id: 'red', hex: '#ef4444' },
                  { id: 'black', hex: '#1f2937' },
                  { id: 'blue', hex: '#3b82f6' },
                  { id: 'green', hex: '#22c55e' },
                  { id: 'yellow', hex: '#eab308' },
                  { id: 'white', hex: '#f8fafc' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => useWorkbenchStore.getState().updateWireColor(selectedWire.id, c.hex)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      selectedWire.color === c.hex
                        ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-surface-card'
                        : 'hover:scale-110 opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`Color ${c.id}`}
                  />
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-300 space-y-1 pt-1 bg-surface-lowest p-2 rounded border border-surface-border">
              <div className="truncate"><span className="text-slate-500">Endpoint A:</span> {getEndpointKey(selectedWire.from)}</div>
              <div className="truncate"><span className="text-slate-500">Endpoint B:</span> {getEndpointKey(selectedWire.to)}</div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Tip: Drag either endpoint handle on the canvas to reconnect this wire. Press Delete or Backspace to remove it.
            </p>

            <button
              onClick={() => {
                removeWire(selectedWire.id);
                onSelectWire?.(null);
              }}
              className="w-full py-1.5 px-3 bg-error/10 hover:bg-error/20 border border-error/30 rounded-lg text-xs font-medium text-error flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">delete</span>
              <span>Delete Wire</span>
            </button>
          </div>
        ) : null}

        {/* SELECTED COMPONENT INSPECTOR */}
        {selectedInstance && definition ? (
          <div className="space-y-4">
            {/* Component Header Card */}
            <div className="p-3 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-high border border-surface-border text-primary font-semibold uppercase">
                  {definition.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {selectedInstance.instanceId.slice(0, 8)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{definition.name}</h3>
              <p className="text-xs text-slate-400">{definition.description}</p>

              {definition.id.includes('breadboard') && (
                <div className="p-2 rounded-lg bg-surface-lowest border border-surface-border text-[11px] text-slate-300 font-mono space-y-1">
                  <div className="text-tertiary font-semibold">• 400 Addressable Holes</div>
                  <div>• Rows a–e & f–j (30 columns)</div>
                  <div>• Dual Power Rails (+, -)</div>
                </div>
              )}
            </div>

            {/* Position & Orientation Controls */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Transform Coordinates
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-surface-lowest border border-surface-border/80">
                  <span className="text-slate-400 block text-[10px]">Position (X, Y)</span>
                  <span className="text-white font-semibold">
                    {Math.round(selectedInstance.positionMM.x)} mm, {Math.round(selectedInstance.positionMM.y)} mm
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-lowest border border-surface-border/80">
                  <span className="text-slate-400 block text-[10px]">Rotation</span>
                  <span className="text-white font-semibold">{selectedInstance.rotationDeg}°</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() =>
                    updateInstanceRotation(
                      selectedInstance.instanceId,
                      (selectedInstance.rotationDeg + 90) % 360
                    )
                  }
                  className="flex-1 py-1.5 px-2 bg-surface-card hover:bg-surface-elevated border border-surface-border rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">rotate_right</span>
                  <span>Rotate 90°</span>
                </button>
                <button
                  onClick={() => removeInstance(selectedInstance.instanceId)}
                  className="py-1.5 px-3 bg-error/10 hover:bg-error/20 border border-error/30 rounded-lg text-xs font-medium text-error flex items-center justify-center gap-1 transition-colors"
                  title="Remove Component"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Configurable Properties */}
            {Object.keys(selectedInstance.properties).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Component Parameters
                </h4>
                <div className="p-3 rounded-lg bg-surface-lowest border border-surface-border/80 space-y-3">
                  {Object.entries(selectedInstance.properties).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-white font-mono font-semibold">{String(val)}</span>
                      </div>
                      {typeof val === 'number' && (
                        <input
                          type="range"
                          min={key.toLowerCase().includes('voltage') ? 1 : 10}
                          max={key.toLowerCase().includes('voltage') ? 24 : 1000}
                          value={val}
                          onChange={(e) =>
                            updateInstanceProperties(selectedInstance.instanceId, {
                              [key]: Number(e.target.value),
                            })
                          }
                          className="w-full accent-primary h-1.5 bg-surface-high rounded-lg cursor-pointer"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physical Terminal Attachments & Breadboard Snapping Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Terminals & Breadboard Attachments
              </h4>
              <div className="space-y-1.5">
                {definition.terminals.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono p-2 rounded bg-surface-lowest border border-surface-border">
                    Internal addressable grid (400 holes)
                  </p>
                ) : (
                  definition.terminals.map((term) => {
                    const attachment = instanceAttachments.find((att) => att.terminalId === term.id);
                    return (
                      <div
                        key={term.id}
                        className="p-2 rounded bg-surface-lowest border border-surface-border text-xs flex items-center justify-between font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                term.polarity === 'positive'
                                  ? '#ef4444'
                                  : term.polarity === 'negative'
                                  ? '#1f2937'
                                  : '#4edea3',
                            }}
                          />
                          <span className="text-white">{term.label}</span>
                        </div>
                        <span className="text-[11px] text-primary">
                          {attachment ? `Plugged: ${attachment.holeId}` : 'Free Floating'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : !selectedWire ? (
          /* Empty Component State */
          <div className="py-8 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-card border border-surface-border text-slate-500 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">touch_app</span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              No Component Selected
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any equipment or wire to inspect properties, or click a terminal to connect wires.
            </p>
          </div>
        ) : null}

        {/* ELECTRICAL NODES CONNECTIVITY GRAPH (DEBUGGING & VERIFICATION) */}
        <div className="pt-4 border-t border-surface-border space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-sm">hub</span>
              <span>Electrical Nodes ({nodes.length})</span>
            </h4>
            {highlightedNodeId && (
              <button
                onClick={() => setHighlightedNodeId(null)}
                className="text-[10px] font-mono text-slate-400 hover:text-white"
              >
                Clear Glow
              </button>
            )}
          </div>

          {nodes.length === 0 ? (
            <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border text-xs font-mono text-slate-500">
              No electrical nodes active. Place components, attach to breadboard, or connect wires.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {nodes.map((node) => {
                const isNodeHighlighted = highlightedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() =>
                      setHighlightedNodeId(isNodeHighlighted ? null : node.id)
                    }
                    className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      isNodeHighlighted
                        ? 'border-white bg-surface-card shadow-md'
                        : 'border-surface-border bg-surface-lowest hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: node.color }}
                        />
                        <span className="text-white font-semibold">{node.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {node.endpoints.length} endpoints
                      </span>
                    </div>

                    {userMode === 'advanced' && (
                      <div className="text-[10px] text-slate-400 mt-1 pl-4 truncate">
                        {node.endpoints.map((ep) => getEndpointKey(ep)).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[10px] text-slate-500 leading-tight">
            *Click any node above to highlight all its connected breadboard holes, terminals, and wires on the workbench.
          </p>
        </div>
      </div>
    </aside>
  );
};
