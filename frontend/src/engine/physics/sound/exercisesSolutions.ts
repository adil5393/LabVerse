/**
 * Solutions for the Chapter 10 exercises and Pause and Ponder items that need Sections 10.6 to 10.8 (SND-2 and SND-3).
 * Answers are the verified hand answers of the SND-0 specification (`reports/SOUND_CHAPTER_10_SPEC.md`, 1.5 and 1.6), including
 * the figure readings for Exercises 5, 6, 13, 14 and Pause and Ponder 9. Every number is also checked by
 * `__tests__/characteristics.test.ts`. Wording is original; each solution uses the speed of sound its own problem gives.
 */

import type { SoundSolution } from './exercises';

export const MORE_SOLUTIONS: Record<string, SoundSolution> = {
  'ex4-all': {
    principle: 'A reflection is heard as a separate echo only if it reaches the ear at least about 0.1 s after the original sound. Reflections arriving sooner merge with the original and prolong it (reverberation; the book uses "less than 0.05 s" for this).',
    steps: [
      { text: 'The reflected sound arrives 0.05 s after the original.', why: 'This is the time gap the question gives, measured at the listener.' },
      { text: '0.05 s is less than the 0.1 s needed for a separate echo.', why: 'The ear cannot separate two sounds that close together.' },
      { text: 'So the reflection merges with the original sound and makes it last longer.', why: 'That persistence is reverberation; 0.05 s is at the book’s reverberation figure, which is approximate.' },
    ],
    answer: 'Not an echo: the reflection merges with the original sound (reverberation).',
    meaning: 'You would hear one longer sound, not a repeat.',
    commonMistake: 'Calling it an echo because the sound was reflected: every echo is a reflection, but not every reflection is heard as an echo.',
  },
  'ex5-i': {
    principle: 'The wavelength is the distance from one crest (compression) to the next; on graphs drawn to the same scale, the wider spacing is the longer wavelength.',
    steps: [
      { text: 'Measure crest to crest on each graph along the distance axis.', why: 'That distance is one wavelength.' },
      { text: 'Graph (a) has its crests about 2.4 times as far apart as graph (b).', why: 'Reading of the figure (crest spacing 39 against 16 units, same horizontal scale).' },
    ],
    answer: 'Graph (a) has the greater wavelength.',
    meaning: 'Fewer compressions fit in the same distance in (a).',
    commonMistake: 'Judging wavelength by how tall the curve is: height shows amplitude, not wavelength.',
  },
  'ex5-ii': {
    principle: 'The amplitude is the height of a crest above the average-density line; with equal vertical scales, the shorter crest is the smaller amplitude.',
    steps: [
      { text: 'Measure from the dashed average line up to a crest on each graph.', why: 'That height is the amplitude.' },
      { text: 'Graph (a) rises about 17 units, graph (b) about 26 units, on the same vertical scale.', why: 'Reading of the figure.' },
    ],
    answer: 'Graph (a) has the smaller amplitude.',
    meaning: 'The density in (a) varies less from its average, so that sound is softer.',
    commonMistake: 'Assuming the longer-wavelength wave must also have the larger amplitude: the two quantities are independent.',
  },
  'ex6-a': {
    principle: 'At the same speed, a higher frequency means a shorter wavelength (v = ν λ), so more crests fit in the same distance.',
    steps: [
      { text: 'Count crests over the same distance: green 4, red 3, blue 2.', why: 'Reading of the figure; the curves share one distance axis.' },
      { text: 'The most crests means the shortest wavelength and so the highest frequency.', why: 'ν = v ÷ λ with the same v.' },
    ],
    answer: 'A (greatest frequency) is the green curve.',
    meaning: 'The highest-pitched source makes the most tightly packed compressions.',
    commonMistake: 'Choosing the tallest curve: the curves also differ in amplitude, so height cannot decide frequency.',
  },
  'ex6-b': {
    principle: 'Frequencies are in the same order as the number of crests in a fixed distance.',
    steps: [{ text: 'Green has 4 crests, red 3, blue 2, so red is in the middle.', why: 'Wavelength ratio 3 : 4 : 6 gives frequency ratio 4 : 3 : 2.' }],
    answer: 'B is the red curve.',
    meaning: 'B is between A and C in frequency.',
    commonMistake: 'Ordering by amplitude instead of by wavelength.',
  },
  'ex6-c': {
    principle: 'The least frequency has the longest wavelength: the fewest crests in a fixed distance.',
    steps: [{ text: 'Blue has only 2 crests in the distance where green has 4.', why: 'Longest wavelength, lowest frequency.' }],
    answer: 'C (least frequency) is the blue curve.',
    meaning: 'The lowest-pitched source has the most widely spaced compressions.',
    commonMistake: 'Choosing the flattest curve: low amplitude means soft, not low frequency.',
  },
  'ex7-all': {
    principle: 'A sound-wave graph of density against distance is a smooth wave about the average-density line: the amplitude is its height above that line and the wavelength is the crest-to-crest distance.',
    steps: [
      { text: 'Draw the horizontal axis (distance, in cm) and the vertical axis (density), with a dashed average-density line across the middle.', why: 'Density varies above and below its average value.' },
      { text: 'Mark crests 3 units above the line and troughs 3 units below it.', why: 'The density amplitude is 3 units.' },
      { text: 'Space the crests 4 cm apart (troughs halfway between, 2 cm from each crest), and join them with a smooth curve.', why: 'The wavelength is 4 cm.' },
      { text: 'Label each crest C (compression) and each trough R (rarefaction).', why: 'High density is a compression; low density a rarefaction.' },
    ],
    answer: 'A smooth wave with crests 3 units above and troughs 3 units below the average line, crests 4 cm apart.',
    meaning: 'The graph encodes both numbers: height for the amplitude, spacing for the wavelength.',
    commonMistake: 'Swapping the two (amplitude 4, wavelength 3), or measuring the amplitude from trough to crest (that is twice the amplitude).',
  },
  'ex9-all': {
    principle: 'v = ν λ and T = 1 ÷ ν, so T = λ ÷ v.',
    steps: [
      { text: 'ν = v ÷ λ = 344 m/s ÷ 3.44 m = 100 Hz.', why: 'Eq. 10.2 rearranged.' },
      { text: 'T = 1 ÷ ν = 1 ÷ 100 Hz = 0.01 s.', why: 'Eq. 10.1.' },
    ],
    answer: 'T = 0.01 s.',
    meaning: 'One full oscillation takes a hundredth of a second.',
    commonMistake: 'Computing λ × v instead of λ ÷ v.',
  },
  'ex10-all': {
    principle: 'The sonar pulse goes down and comes back, so the depth is half the distance travelled: d = v t ÷ 2.',
    steps: [
      { text: 'Distance travelled = 1525 m/s × 5 s = 7625 m.', why: 'Distance = speed × time, with the speed the question gives for sea water.' },
      { text: 'Depth = 7625 m ÷ 2 = 3812.5 m.', why: 'Half the path is down, half is back up.' },
    ],
    answer: 'The wreckage is 3812.5 m (about 3.8 km) below the ship.',
    meaning: 'Timing an echo turns into measuring a depth.',
    commonMistake: 'Forgetting to halve: 7625 m is the round trip, not the depth.',
  },
  'ex11-all': {
    principle: 'The pulse travels to the obstacle and back: t = 2 d ÷ v.',
    steps: [
      { text: 'Round-trip distance = 2 × 1.2 m = 2.4 m.', why: 'There and back.' },
      { text: 't = 2.4 m ÷ 345 m/s ≈ 0.00696 s.', why: 'Time = distance ÷ speed, using the 345 m/s the question gives.' },
    ],
    answer: 'About 6.96 × 10⁻³ s (7 milliseconds).',
    meaning: 'The echo returns so fast that the sensor can update many times each second.',
    commonMistake: 'Using 1.2 m instead of 2.4 m, which gives half the right time.',
  },
  'ex12-all': {
    principle: 'Time = distance ÷ speed; a lower speed means a longer time.',
    steps: [
      { text: 'At 344 m/s: t = 1720 ÷ 344 = 5.000 s.', why: 'Warm air (about 22 °C).' },
      { text: 'At 331 m/s: t = 1720 ÷ 331 ≈ 5.196 s.', why: 'Cold air (about 0 °C).' },
      { text: 'Extra time ≈ 5.196 − 5.000 = 0.196 s.', why: 'The difference of the two times.' },
    ],
    answer: 'About 0.20 s longer in the colder air.',
    meaning: 'Sound is slower in colder air, so thunder arrives a little later.',
    commonMistake: 'Subtracting the speeds and dividing (1720 ÷ 13): the difference of times is not distance ÷ difference of speeds.',
  },
  'ex13-l': {
    principle: 'The wavelength is the distance between neighbouring compressions; count how many wavelengths the marked distance covers.',
    steps: [
      { text: 'The 8 cm arrow runs from the centre of one compression to the centre of the third.', why: 'Reading of the dot picture: compressions at about 0, 4 and 8 cm along it.' },
      { text: 'From the first to the third compression is two wavelengths, so λ = 8 cm ÷ 2 = 4 cm = 0.04 m.', why: 'Three compressions in a row are two wavelengths apart.' },
    ],
    answer: 'λ = 4 cm = 0.04 m.',
    meaning: 'Neighbouring compressions are 4 cm apart.',
    commonMistake: 'Taking the whole 8 cm as one wavelength.',
  },
  'ex13-n': {
    principle: 'ν = v ÷ λ (Eq. 10.2).',
    steps: [{ text: 'ν = 340 m/s ÷ 0.04 m = 8500 Hz.', why: 'Use the speed the question gives and λ in metres.' }],
    answer: 'ν = 8500 Hz.',
    meaning: '8500 compressions pass a point each second.',
    commonMistake: 'Using λ in centimetres (340 ÷ 4 = 85 Hz).',
  },
  'ex14-la': {
    principle: 'Read the crest-to-crest distance against the grid.',
    steps: [{ text: 'Wave A has crests at about 0.63, 3.13 and 5.63 cm: 2.5 cm apart.', why: 'Reading of the figure with its axis ticks.' }],
    answer: 'λ_A = 2.5 cm = 0.025 m.', meaning: 'A is the more tightly packed wave.', commonMistake: 'Measuring crest to trough (half a wavelength).',
  },
  'ex14-lb': {
    principle: 'Read the crest-to-crest distance against the grid.',
    steps: [{ text: 'Wave B has crests at about 1.26 and 6.25 cm: 5.0 cm apart.', why: 'Reading of the figure with its axis ticks.' }],
    answer: 'λ_B = 5.0 cm = 0.05 m.', meaning: 'B has twice the wavelength of A.', commonMistake: 'Reading the distance from the y-axis to the first crest.',
  },
  'ex14-na': {
    principle: 'ν = v ÷ λ.',
    steps: [{ text: 'ν_A = 345 m/s ÷ 0.025 m = 13 800 Hz.', why: 'Speed given in the question; λ in metres.' }],
    answer: 'ν_A = 13 800 Hz.', meaning: 'A shorter wavelength at the same speed means a higher frequency.', commonMistake: 'Dividing by λ in centimetres.',
  },
  'ex14-nb': {
    principle: 'ν = v ÷ λ.',
    steps: [{ text: 'ν_B = 345 m/s ÷ 0.05 m = 6900 Hz.', why: 'Speed given in the question; λ in metres.' }],
    answer: 'ν_B = 6900 Hz.', meaning: 'Double the wavelength, half the frequency.', commonMistake: 'Dividing by λ in centimetres.',
  },
  'ex15-all': {
    principle: 'Both sounds travel the same distance to the cliff and back, so speed × time is the same: v_air t_air = v_water t_water.',
    steps: [
      { text: 'v_air ÷ v_water = t_water ÷ t_air.', why: 'Rearranging v_air t_air = v_water t_water.' },
      { text: 't_air = 4.5 t_water, so v_air ÷ v_water = 1 ÷ 4.5 = 2 ÷ 9.', why: 'The longer time belongs to the slower medium.' },
    ],
    answer: 'v_air : v_water = 2 : 9 (about 0.22).',
    meaning: 'Sound in water is 4.5 times as fast as in air.',
    commonMistake: 'Inverting the ratio (9 : 2): the medium with the longer echo time is the slower one.',
  },
  'pp7-all': {
    principle: 'A thinner (lighter) band under the same tension vibrates faster: higher frequency and so shorter time period (T = 1 ÷ ν).',
    steps: [
      { text: 'The thin band vibrates more times each second than the thick band.', why: 'Less mass to move back and forth (the qualitative relation in the Vibration Laboratory).' },
      { text: 'More oscillations per second means each oscillation takes less time.', why: 'T = 1 ÷ ν.' },
    ],
    answer: 'Thin band: higher frequency, shorter time period. Thick band: lower frequency, longer time period.',
    meaning: 'The thin band sounds higher.',
    commonMistake: 'Saying the thin band has the longer period because it "moves more".',
  },
  'pp8-all': {
    principle: 'Frequency counts oscillations per second; a minute has 60 seconds.',
    steps: [{ text: '20 oscillations each second × 60 s = 1200 oscillations.', why: 'Per second times number of seconds.' }],
    answer: '1200 oscillations in one minute.', meaning: 'A low 20 Hz sound still means 1200 compressions a minute.', commonMistake: 'Dividing by 60 instead of multiplying.',
  },
  'pp9-all': {
    principle: 'The wavelength is crest to crest; half a wavelength is crest to the next trough, or one crossing of the average line to the next.',
    steps: [
      { text: 'On the graph the curve crosses the average-density line at 1.5, 3.0 and 4.5 cm.', why: 'Reading of the figure with its axis ticks.' },
      { text: 'Successive crossings are half a wavelength apart: 1.5 cm.', why: 'The curve goes up and comes back down in half a wavelength.' },
    ],
    answer: 'Half the wavelength is 1.5 cm (the wavelength is 3.0 cm).', meaning: 'Neighbouring compressions are 3.0 cm apart.', commonMistake: 'Reporting the whole wavelength.',
  },
  'pp10-all': {
    principle: 'A ratio of speeds is one speed divided by the other.',
    steps: [
      { text: 'Water ÷ air = 1500 ÷ 340 ≈ 4.4.', why: 'Approximate speeds from the table.' },
      { text: 'Steel ÷ water = 5000 ÷ 1500 ≈ 3.3.', why: 'Approximate speeds from the table.' },
    ],
    answer: 'Sound is about 4.4 times as fast in water as in air, and about 3.3 times as fast in steel as in water.', meaning: 'Sound is fastest in solids, slower in liquids, slowest in gases.', commonMistake: 'Subtracting instead of dividing.',
  },
  'pp11-all': {
    principle: 'Time = distance ÷ speed for each path; compare the difference with the 0.1 s the ear needs to separate two sounds.',
    steps: [
      { text: 'Through air: 340 m ÷ 340 m/s = 1 s.', why: 'Speed of sound in air given as 340 m/s.' },
      { text: 'Through steel: 340 m ÷ 5000 m/s ≈ 0.068 s.', why: 'Sound is much faster in steel.' },
      { text: 'Difference ≈ 1 − 0.068 = 0.93 s, more than 0.1 s.', why: 'Two sounds this far apart are heard separately.' },
    ],
    answer: 'About 0.93 s apart, so the two sounds can be told apart.', meaning: 'You hear the tap through the fence first and through the air nearly a second later.', commonMistake: 'Adding the times instead of subtracting.',
  },
  'pp12-all': {
    principle: 'The sound goes to the wall and back: d = v t ÷ 2.',
    steps: [{ text: 'd = 343 m/s × 0.2 s ÷ 2 = 34.3 m.', why: 'Use the speed and the delay the question gives.' }],
    answer: 'The wall must be at least 34.3 m away.', meaning: 'A longer required delay needs a farther wall.', commonMistake: 'Forgetting to halve (68.6 m).',
  },
  'pp13-all': {
    principle: 'Depth = v t ÷ 2 for a pulse that goes down and back.',
    steps: [{ text: 'Depth = 1500 m/s × 4 s ÷ 2 = 3000 m.', why: 'Use the speed the question gives for sea water.' }],
    answer: 'The ocean is 3000 m (3 km) deep there.', meaning: 'Sonar measures depth by timing echoes.', commonMistake: 'Forgetting to halve (6000 m).',
  },
};
