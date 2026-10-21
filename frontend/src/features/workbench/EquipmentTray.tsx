import React, { useState } from 'react';
import type { GenericEquipmentDefinition } from '../../types/workbench';

interface EquipmentTrayProps {
  catalog: GenericEquipmentDefinition[];
  onAddEquipment: (def: GenericEquipmentDefinition) => void;
}

export const EquipmentTray: React.FC<EquipmentTrayProps> = ({ catalog, onAddEquipment }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Extract unique categories
  const categories = Array.from(new Set(catalog.map((item) => item.category)));

  const filteredItems = catalog.filter((item) => {
    if (!`${item.name} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <aside
      className={`equipment-tray bg-surface-low border-r border-surface-border flex flex-col shrink-0 transition-all duration-200 z-20 select-none ${collapsed ? 'w-12' : 'w-64 sm:w-72'
        }`}
    >
      {/* Header bar of drawer */}
      <div className="h-11 px-3 border-b border-surface-border flex items-center justify-between bg-surface-lowest">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Equipment
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-card text-slate-400 border border-surface-border">
              {catalog.length}
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors ml-auto"
          title={collapsed ? 'Expand Equipment Tray' : 'Collapse Equipment Tray'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* When collapsed, show icon strip */}
      {collapsed ? (
        <div className="flex-1 py-3 flex flex-col items-center gap-2">
          {catalog.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddEquipment(item)}
              className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border flex items-center justify-center text-primary transition-all group relative"
              title={`Add ${item.name}`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {/* Tooltip */}
              <div className="absolute left-10 hidden group-hover:flex px-2 py-1 bg-surface-card text-white text-xs rounded border border-surface-border shadow-lg whitespace-nowrap z-50">
                {item.name}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <label className="flex items-center gap-2 border border-surface-border rounded-xl mx-2 mt-3 px-3 bg-surface">
            <span className="material-symbols-outlined text-slate-400" aria-hidden>search</span>
            <input type="search" aria-label="Find equipment" placeholder="Find equipment" value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-11 min-w-0 w-full bg-transparent text-sm outline-none" />
          </label>
          {/* Category filter tabs */}
          <div className="p-2 border-b border-surface-border/70 flex gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${activeCategory === 'all'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-surface-card'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${activeCategory === cat
                    ? 'bg-primary text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-surface-card'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Component list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-surface-card hover:bg-surface-elevated/70 border border-surface-border transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{item.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-surface-border/50 text-[10px] font-mono text-slate-400">
                  <span>
                    {item.dimensionsMM.width} × {item.dimensionsMM.height} mm
                  </span>
                  <button
                    onClick={() => onAddEquipment(item)}
                    aria-label={`Add ${item.name}`}
                    className="px-2.5 py-1 rounded-lg bg-surface-high hover:bg-primary text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all border border-surface-border hover:border-primary"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!filteredItems.length && <p role="status" className="p-4 text-sm text-slate-400">No equipment matches your search.</p>}
        </>
      )}
    </aside>
  );
};
