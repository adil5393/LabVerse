/** A recording fake of the Web Audio API for tests (no sound card, no browser). */
import type { ACompressor, AContext, AGain, ANode, AOsc, AParam, AudioBackend } from '../backend';

export class FParam implements AParam {
  value = 0; calls: string[] = []; peak = 0;
  setValueAtTime(v: number, t: number) { this.calls.push(`set ${v} @${t.toFixed(3)}`); this.peak = Math.max(this.peak, v); }
  linearRampToValueAtTime(v: number, t: number) { this.calls.push(`ramp ${v} @${t.toFixed(3)}`); this.peak = Math.max(this.peak, v); }
  setTargetAtTime(v: number, t: number, tc: number) { this.calls.push(`target ${v} @${t.toFixed(3)} tc${tc}`); }
  cancelScheduledValues(t: number) { this.calls.push(`cancel @${t.toFixed(3)}`); }
}
export class FNode implements ANode { connected: ANode[] = []; disconnected = false; connect(n: ANode) { this.connected.push(n); } disconnect() { this.disconnected = true; } }
export class FGain extends FNode implements AGain { gain = new FParam(); }
export class FOsc extends FNode implements AOsc {
  type = ''; frequency = new FParam(); onended: (() => void) | null = null; started: number | null = null; stoppedAt: number[] = [];
  start(t = 0) { this.started = t; } stop(t = 0) { this.stoppedAt.push(t); }
  /** The frequency the oscillator was started at. */
  get hz(): number { const c = this.frequency.calls[0] ?? ''; return Number(c.split(' ')[1]); }
}
export class FComp extends FNode implements ACompressor { threshold = new FParam(); knee = new FParam(); ratio = new FParam(); attack = new FParam(); release = new FParam(); }
export class FCtx implements AContext {
  currentTime = 1; state = 'running'; destination = new FNode(); oscs: FOsc[] = []; gains: FGain[] = []; comps: FComp[] = [];
  suspended = 0; resumed = 0; closed = 0;
  createGain() { const g = new FGain(); this.gains.push(g); return g; }
  createOscillator() { const o = new FOsc(); this.oscs.push(o); return o; }
  createDynamicsCompressor() { const c = new FComp(); this.comps.push(c); return c; }
  async resume() { this.resumed++; this.state = 'running'; }
  async suspend() { this.suspended++; this.state = 'suspended'; }
  async close() { this.closed++; this.state = 'closed'; }
}
export class FBackend implements AudioBackend {
  supported = true; created: FCtx[] = [];
  create() { const c = new FCtx(); this.created.push(c); return c; }
  get oscillators(): FOsc[] { return this.created.flatMap((c) => c.oscs); }
}
