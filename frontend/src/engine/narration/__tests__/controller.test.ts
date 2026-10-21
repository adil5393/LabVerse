import { describe, it, expect, beforeEach } from 'vitest';
import { NarrationController, clampRate, type NarrationSegment } from '../controller';
import { pickVoice, type SpeakCallbacks, type SpeakRequest, type SpeechProvider, type VoiceInfo } from '../provider';

/** A scripted speech engine: it records every request and lets the test finish or fail an utterance whenever it likes. */
class FakeProvider implements SpeechProvider {
  supported = true;
  spoken: SpeakRequest[] = [];
  cancels = 0;
  live: { req: SpeakRequest; cb: SpeakCallbacks; cancelled: boolean }[] = [];
  speak(req: SpeakRequest, cb: SpeakCallbacks) {
    const u = { req, cb, cancelled: false };
    this.spoken.push(req);
    this.live.push(u);
    return () => { u.cancelled = true; this.cancels++; };
  }
  cancel() { this.cancels++; }
  voices(): VoiceInfo[] { return []; }
  onVoicesChanged() { return () => {}; }
  /** The most recent utterance that has not been cancelled. */
  get active() { return [...this.live].reverse().find((u) => !u.cancelled); }
  /** The engine reports the end of the given utterance (even a cancelled one: browsers do this late). */
  end(u = this.live[this.live.length - 1]) { u.cb.onEnd(); }
}

const SEGS: NarrationSegment[] = [
  { id: 'a', text: 'First idea. It has two sentences.' },
  { id: 'b', text: 'Force is measured in N, for example 10 N.' },
  { id: 'c', text: 'Last.' },
];

let p: FakeProvider;
let c: NarrationController;
beforeEach(() => { p = new FakeProvider(); c = new NarrationController({ provider: p }); c.setSegments(SEGS); });

describe('NarrationController: no autoplay', () => {
  it('speaks nothing until play is called', () => {
    expect(p.spoken).toEqual([]);
    expect(c.getSnapshot().status).toBe('idle');
    c.setSegments([...SEGS, { id: 'd', text: 'More.' }]);
    c.setRate(1.5);
    c.setVoice('x');
    expect(p.spoken).toEqual([]);
  });
});

describe('NarrationController: transport', () => {
  it('plays sentence by sentence, in order, and returns to idle at the end', () => {
    c.play();
    expect(c.getSnapshot().status).toBe('playing');
    expect(c.getSnapshot().activeId).toBe('a');
    p.end(); expect(c.getSnapshot().activeId).toBe('a'); // second sentence of the same segment
    p.end(); expect(c.getSnapshot().activeId).toBe('b');
    p.end(); expect(c.getSnapshot().activeId).toBe('c');
    p.end();
    expect(c.getSnapshot().status).toBe('idle');
    expect(c.getSnapshot().activeId).toBeNull();
    expect(p.spoken.map((r) => r.text)).toEqual(['First idea.', 'It has two sentences.', 'Force is measured in N, for example 10 newtons.', 'Last.']);
  });

  it('speaks physics notation in its spoken form but shows the original text', () => {
    c.play(); p.end(); p.end();
    expect(p.spoken[2].text).toBe('Force is measured in N, for example 10 newtons.');
    expect(c.getSnapshot().activeText).toBe('Force is measured in N, for example 10 N.');
  });

  it('pause stops speech and resume repeats the sentence it was in', () => {
    c.play(); p.end(); // now in "It has two sentences."
    c.pause();
    expect(c.getSnapshot().status).toBe('paused');
    expect(p.active).toBeUndefined();
    const before = p.spoken.length;
    c.resume();
    expect(c.getSnapshot().status).toBe('playing');
    expect(p.spoken.length).toBe(before + 1);
    expect(p.spoken[before].text).toBe('It has two sentences.');
  });

  it('stop cancels and clears the highlight; replay starts again from the first sentence', () => {
    c.play(); p.end(); p.end();
    c.stop();
    expect(c.getSnapshot()).toMatchObject({ status: 'idle', activeId: null });
    expect(p.active).toBeUndefined();
    const n = p.spoken.length;
    c.replay();
    expect(p.spoken[n].text).toBe('First idea.');
    expect(c.getSnapshot().activeId).toBe('a');
  });

  it('play while paused resumes instead of restarting', () => {
    c.play(); p.end(); c.pause();
    const n = p.spoken.length;
    c.play();
    expect(p.spoken[n].text).toBe('It has two sentences.');
  });

  it('changing the speed while playing restarts the current sentence at the new speed; while idle it only stores it', () => {
    c.setRate(1.25);
    expect(p.spoken).toEqual([]);
    c.play();
    c.setRate(1.5);
    expect(p.spoken.length).toBe(2);
    expect(p.spoken[1]).toMatchObject({ text: 'First idea.', rate: 1.5 });
  });

  it('clamps speed to a sensible range', () => {
    expect(clampRate(10)).toBe(2);
    expect(clampRate(0)).toBe(0.5);
    expect(clampRate(Number.NaN)).toBe(1);
  });
});

describe('NarrationController: no overlap and no stale events', () => {
  it('a late "end" from a cancelled utterance cannot advance or restart the current one', () => {
    c.play();
    const first = p.live[0];
    c.replay();               // cancels the first utterance, speaks a new one
    const spokenNow = p.spoken.length;
    p.end(first);             // the browser reports the old utterance finishing
    expect(p.spoken.length).toBe(spokenNow);
    expect(c.getSnapshot().activeId).toBe('a');
  });

  it('a late "canceled" error after pause is ignored and does not turn into a failure', () => {
    c.play();
    const first = p.live[0];
    c.pause();
    first.cb.onError('canceled');
    first.cb.onError('interrupted');
    expect(c.getSnapshot()).toMatchObject({ status: 'paused', error: null });
  });

  it('only one utterance is live at any time through a long mixed sequence', () => {
    c.play(); p.end(); c.pause(); c.resume(); c.setRate(1.25); c.replay(); p.end(); c.stop(); c.play();
    expect(p.live.filter((u) => !u.cancelled).length).toBe(1);
  });

  it('end events after stop do nothing', () => {
    c.play();
    const u = p.live[0];
    c.stop();
    p.end(u);
    expect(p.spoken.length).toBe(1);
    expect(c.getSnapshot().status).toBe('idle');
  });
});

describe('NarrationController: lifecycle', () => {
  it('replacing the segments stops playback; an identical list does not', () => {
    c.play();
    c.setSegments(SEGS.map((s) => ({ ...s })));
    expect(c.getSnapshot().status).toBe('playing');
    c.setSegments([{ id: 'z', text: 'Another lesson.' }]);
    expect(c.getSnapshot().status).toBe('idle');
    expect(p.active).toBeUndefined();
  });

  it('dispose cancels speech (unmount, navigation) and the controller stays usable', () => {
    c.play();
    c.dispose();
    expect(p.active).toBeUndefined();
    expect(c.getSnapshot().status).toBe('idle');
    c.play();
    expect(c.getSnapshot().status).toBe('playing');
  });

  it('notifies subscribers and stops notifying after unsubscribe', () => {
    let n = 0;
    const off = c.subscribe(() => { n++; });
    c.play();
    expect(n).toBeGreaterThan(0);
    off();
    const m = n; c.stop();
    expect(n).toBe(m);
  });
});

describe('NarrationController: unsupported and failing engines', () => {
  it('does nothing when the browser has no speech support', () => {
    const off = new FakeProvider(); off.supported = false;
    const u = new NarrationController({ provider: off });
    u.setSegments(SEGS);
    u.play();
    expect(off.spoken).toEqual([]);
    expect(u.getSnapshot()).toMatchObject({ supported: false, status: 'idle' });
  });

  it('turns an engine failure into a readable message and goes idle', () => {
    c.play();
    p.live[0].cb.onError('synthesis-failed');
    expect(c.getSnapshot().status).toBe('idle');
    expect(c.getSnapshot().error).toMatch(/text is on the page/i);
    c.play();
    expect(c.getSnapshot().error).toBeNull();
  });

  it('explains a browser that blocks sound until a gesture', () => {
    c.play();
    p.live[0].cb.onError('not-allowed');
    expect(c.getSnapshot().error).toMatch(/blocked/i);
  });

  it('plays nothing for an empty content list', () => {
    c.setSegments([]);
    c.play();
    expect(p.spoken).toEqual([]);
  });
});

describe('pickVoice', () => {
  const v = (uri: string, lang: string): VoiceInfo => ({ uri, name: uri, lang, local: true });
  const voices = [v('de', 'de-DE'), v('us', 'en-US'), v('in', 'en-IN'), v('gb', 'en_GB')];
  it('uses the stored voice when it still exists', () => expect(pickVoice(voices, 'en', 'us')?.uri).toBe('us'));
  it('falls back when the stored voice is gone', () => expect(pickVoice(voices, 'en', 'missing')?.uri).toBe('in'));
  it('prefers Indian English, then British, then US, then any English', () => {
    expect(pickVoice([v('us', 'en-US'), v('gb', 'en-GB')], 'en', null)?.uri).toBe('gb');
    expect(pickVoice([v('au', 'en-AU')], 'en', null)?.uri).toBe('au');
  });
  it('returns null when there are no voices or no match, so the engine default is used', () => {
    expect(pickVoice([], 'en', null)).toBeNull();
    expect(pickVoice([v('de', 'de-DE')], 'en', null)).toBeNull();
  });
});
