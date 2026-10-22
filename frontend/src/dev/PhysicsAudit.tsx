/** Development-only HTML entry: real curriculum fixtures, not a production route. */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { VisualHost, VisualRegistryProvider } from '../features/education/visuals';
import { physicsFixtures, physicsRegistry } from './physicsFixtures';
import '../index.css';
import '../experience.css';

function Audit() {
  const [index, setIndex] = useState(Number(new URLSearchParams(location.search).get('case')) || 0);
  const fixture = physicsFixtures[index];
  return <MemoryRouter><VisualRegistryProvider value={physicsRegistry}><div className="reading-surface bg-background min-h-dvh text-on-surface">
    <header className="p-4 space-y-2"><h1 className="font-bold">Physics interaction review</h1><label className="block text-sm">Curriculum example<select aria-label="Curriculum example" value={index} onChange={(e) => setIndex(Number(e.target.value))} className="w-full min-h-12 bg-surface border rounded-lg text-sm">
      {physicsFixtures.map((f, i) => <option key={f.id} value={i} data-kind={f.visual.kind} data-chapter={f.chapter}>{f.chapter} / {f.visual.kind} / {f.location}</option>)}
    </select></label></header>
    {fixture && <main className="p-4" data-fixture={fixture.id}><article className="p-4 rounded-2xl bg-surface border border-surface-border"><VisualHost key={fixture.id} visual={fixture.visual} /></article></main>}
  </div></VisualRegistryProvider></MemoryRouter>;
}

createRoot(document.getElementById('root')!).render(<Audit />);
