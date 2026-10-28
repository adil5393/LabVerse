import { describe, expect, it } from 'vitest';
import { toSpeech } from '../speechText';

describe('biology is read the way students say it', () => {
  it('micrometres and nanometres are read as words', () => {
    expect(toSpeech('A cell of 200 µm')).toBe('A cell of 200 micrometres');
    expect(toSpeech('1 µm')).toBe('1 micrometre');
    expect(toSpeech('in µm')).toBe('in micrometres');
    expect(toSpeech('7 to 10 nm thick')).toBe('7 to 10 nanometres thick');
  });
  it('microscope powers and approximate values', () => {
    expect(toSpeech('a 10X eyepiece')).toBe('a 10 times eyepiece');
    expect(toSpeech('about 400X')).toBe('about 400 times');
    expect(toSpeech('~28 days')).toBe('about 28 days');
  });
  it('abbreviations and names are not mistaken for chemical formulae', () => {
    expect(toSpeech('ATP and DNA')).toBe('A T P and D N A');
    expect(toSpeech('Panthera tigris')).toBe('Panthera tigris');
    expect(toSpeech('Homo sapiens')).toBe('Homo sapiens');
  });
});
