import React from 'react';

export interface SceneObject {
  id: string;
  name: string;
  category?: string;
  /** Material Symbols icon name. */
  icon: string;
  badge?: string;
}

export interface OutlinerInvestigation {
  id: string;
  title: string;
  goal?: string;
}

export interface LabOutlinerProps {
  investigations?: OutlinerInvestigation[];
  activeInvestigationId?: string | null;
  onSelectInvestigation?: (id: string | null) => void;
  freeLabel?: string;
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  visibility: Record<string, boolean>;
  onToggleVisibility: (id: string) => void;
  lockMap: Record<string, boolean>;
  onToggleLock: (id: string) => void;
}

const rowBase = 'w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors';
const on = 'bg-primary/10 border-primary text-primary font-bold shadow-sm';
const off = 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500';

/**
 * LabOutliner: the Blender-style left panel every lab shares. The top lists the investigations (presets) with Free Exploration
 * first; below it is the scene hierarchy: click an object to select it (the inspector follows), the eye hides it in the
 * viewport, the padlock stops it being edited.
 */
export const LabOutliner: React.FC<LabOutlinerProps> = ({
  investigations = [],
  activeInvestigationId = null,
  onSelectInvestigation,
  freeLabel = 'Free Exploration',
  objects,
  selectedId,
  onSelect,
  visibility,
  onToggleVisibility,
  lockMap,
  onToggleLock,
}) => (
  <div className="p-3 space-y-4 text-xs font-sans" data-testid="lab-outliner">
    {onSelectInvestigation && (
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigations</span>
          <span className="text-[11px] font-mono text-primary font-bold">{investigations.length} Total</span>
        </div>
        <div role="group" aria-label="Choose an investigation" className="flex flex-col gap-1.5 mt-2">
          <button type="button" aria-pressed={!activeInvestigationId} onClick={() => onSelectInvestigation(null)} className={`${rowBase} min-h-[38px] ${!activeInvestigationId ? on : off}`}>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">{!activeInvestigationId ? 'check_circle' : 'science'}</span>
              <span>{freeLabel}</span>
            </span>
          </button>
          {investigations.map((x) => (
            <button key={x.id} type="button" aria-pressed={activeInvestigationId === x.id} data-experiment={x.id} onClick={() => onSelectInvestigation(x.id)} className={`${rowBase} min-h-[38px] ${activeInvestigationId === x.id ? on : off}`}>
              <span className="flex items-center justify-between">
                <span className="font-semibold">{x.id}. {x.title}</span>
                {activeInvestigationId === x.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </span>
              {x.goal && <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-normal">{x.goal}</span>}
            </button>
          ))}
        </div>
      </div>
    )}

    <div>
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Scene Objects</span>
        <span className="text-[11px] font-mono text-outline">{objects.length} Entities</span>
      </div>
      <ul className="mt-1 space-y-0.5 font-mono" aria-label="Scene objects">
        {objects.map((o) => {
          const selected = selectedId === o.id;
          const visible = visibility[o.id] !== false;
          const locked = Boolean(lockMap[o.id]);
          return (
            <li key={o.id}>
              <div
                data-object={o.id}
                aria-selected={selected}
                onClick={() => onSelect(selected ? null : o.id)}
                className={`pl-2 pr-1.5 py-1 rounded flex items-center justify-between cursor-pointer group transition-colors ${selected ? 'bg-primary-container/25 border-l-2 border-primary text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
                title={o.category ? `${o.name} · ${o.category}` : o.name}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className={`material-symbols-outlined text-[14px] ${selected ? 'text-primary' : 'text-outline'}`}>{o.icon}</span>
                  <span className={`text-[11px] truncate ${selected ? 'font-bold text-white' : ''}`}>{o.name}</span>
                  {o.badge && <span className="text-[9px] text-outline truncate">{o.badge}</span>}
                </span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <button type="button" aria-label={visible ? `Hide ${o.name}` : `Show ${o.name}`} aria-pressed={!visible} onClick={(e) => { e.stopPropagation(); onToggleVisibility(o.id); }} className={`p-0.5 rounded hover:text-white ${visible ? 'text-outline' : 'text-rose-400'}`} title={visible ? 'Hide from viewport' : 'Show in viewport'}>
                    <span className="material-symbols-outlined text-[13px]">{visible ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  <button type="button" aria-label={locked ? `Unlock ${o.name}` : `Lock ${o.name}`} aria-pressed={locked} onClick={(e) => { e.stopPropagation(); onToggleLock(o.id); }} className={`p-0.5 rounded hover:text-white ${locked ? 'text-amber-400' : 'text-outline opacity-40 group-hover:opacity-100'}`} title={locked ? 'Locked (editing disabled)' : 'Unlock to edit'}>
                    <span className="material-symbols-outlined text-[13px]">{locked ? 'lock' : 'lock_open'}</span>
                  </button>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);
