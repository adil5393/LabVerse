/**
 * Turns student-facing text (with physics notation) into text a speech engine reads sensibly. Pure and subject-neutral:
 * the page keeps showing the original characters; only what is spoken changes. Examples:
 *   "a = 9.8 m/s²"      -> "a equals 9.8 metres per second squared"
 *   "K = ½mv²"          -> "K equals one half m v squared"
 *   "v = −5 m/s"        -> "v equals negative 5 metres per second"
 *   "ΔK = K₂ − K₁"      -> "change in K equals K 2 minus K 1"
 * Units are only spoken as units when they follow a number (so "s" stays a variable in "s = ut"), and the one-letter
 * units that are also common variables need a space after the number ("5 s", not "2s").
 */

const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
const SUB: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₐ': 'a', 'ₑ': 'e', 'ₙ': 'n', 'ₓ': 'x' };

const GREEK: Record<string, string> = {
  α: 'alpha', β: 'beta', γ: 'gamma', δ: 'delta', ε: 'epsilon', η: 'eta', θ: 'theta', λ: 'lambda', μ: 'mu', ν: 'nu', π: 'pi',
  ρ: 'rho', σ: 'sigma', τ: 'tau', φ: 'phi', ψ: 'psi', ω: 'omega', Ω: 'omega', Φ: 'phi', Θ: 'theta',
};

/** [singular, plural] */
const NOUNS: Record<string, [string, string]> = {
  kg: ['kilogram', 'kilograms'], g: ['gram', 'grams'], mg: ['milligram', 'milligrams'], m: ['metre', 'metres'], cm: ['centimetre', 'centimetres'],
  mm: ['millimetre', 'millimetres'], km: ['kilometre', 'kilometres'], s: ['second', 'seconds'], ms: ['millisecond', 'milliseconds'],
  min: ['minute', 'minutes'], h: ['hour', 'hours'], N: ['newton', 'newtons'], J: ['joule', 'joules'], kJ: ['kilojoule', 'kilojoules'],
  W: ['watt', 'watts'], kW: ['kilowatt', 'kilowatts'], Hz: ['hertz', 'hertz'], kHz: ['kilohertz', 'kilohertz'], MHz: ['megahertz', 'megahertz'],
  Pa: ['pascal', 'pascals'], rad: ['radian', 'radians'],
};
/** One-letter symbols that are also common variables: spoken as units only after a number and a space. */
const NEEDS_SPACE = new Set(['g', 'm', 's', 'h', 'N', 'J', 'W']);

const num = (v: string): string => v;
const plural = (n: string): boolean => !/^[-−]?1(\.0+)?$/.test(n.trim());

const unitWord = (sym: string, many: boolean): string => { const n = NOUNS[sym]; return n ? (many ? n[1] : n[0]) : sym; };

/** Compound units that are safe to recognise anywhere (they contain a slash or a negative exponent). */
const COMPOUND: [RegExp, string][] = [
  [new RegExp(`\\bkg\\s*m\\s*²\\s*s\\s*(?:⁻²|\\^-2|[–−-]2)`, 'g'), 'kilogram metres squared per second squared'],
  [new RegExp(`\\bkg\\s*m\\s*(?:s\\s*(?:⁻¹|\\^-1|[–−-]1)|/\\s*s)(?![A-Za-z])`, 'g'), 'kilogram metres per second'],
  [new RegExp(`\\bm\\s*/\\s*s\\s*(?:²|\\^2)`, 'g'), 'metres per second squared'],
  [new RegExp(`\\bm\\s*s\\s*(?:⁻²|\\^-2|[–−-]2)`, 'g'), 'metres per second squared'],
  [new RegExp(`\\bm\\s*/\\s*s(?![A-Za-z²])`, 'g'), 'metres per second'],
  [new RegExp(`\\bm\\s*s\\s*(?:⁻¹|\\^-1|[–−-]1)`, 'g'), 'metres per second'],
  [/\bkm\s*\/\s*(?:h|hr)\b/g, 'kilometres per hour'],
  [/\bkg\s*\/\s*m³/g, 'kilograms per cubic metre'],
  [/\bN\s*\/\s*kg\b/g, 'newtons per kilogram'],
  [/\bN\s*\/\s*m\b/g, 'newtons per metre'],
  [/\bJ\s*\/\s*s\b/g, 'joules per second'],
  [/\bm\/s\b/g, 'metres per second'],
  [/\brad\s*\/\s*s\b/g, 'radians per second'],
];

const PRODUCTS = /\b(mgh|mv|ma|Fs|Fd|Fv|Pt|ut|vt)\b/g;
/** Upper-case words that are read as words, not spelled out letter by letter. */
const SPOKEN_WORDS = new Set(['NCERT', 'CBSE', 'SONAR', 'NASA', 'ISRO', 'OK', 'IF', 'THEN', 'AND', 'NOT', 'OR', 'TRUE', 'FALSE', 'YES', 'NO', 'LED', 'RADAR']);
const spaceLetters = (w: string): string => w.split('').join(' ');

const ELEMENT_SYMBOLS = new Set(['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Pb', 'Hg', 'Ba', 'Br', 'I', 'U', 'Co', 'W']);
const DIGIT_WORD: Record<string, string> = { '¹': 'one', '²': 'two', '³': 'three', '⁴': 'four', '⁵': 'five', '⁶': 'six', '⁷': 'seven', '⁸': 'eight', '⁹': 'nine' };
const SUB_DIGIT: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

/**
 * Chemical formulae (H₂O, CaCl₂, Al₂(SO₄)₃, NO₃⁻) and ion charges (Na⁺, Mg²⁺, S²⁻). A token is treated as a formula only if every
 * part is a known element symbol and it has a subscript, a charge or a two-letter symbol, so words such as "NCERT" or "NO" are left
 * alone. Each symbol is spelled ("Ca" → "C A"); a bracketed group is read "… taken 3 times".
 */
function speakChemistry(text: string): string {
  return text.replace(/(?<![A-Za-z0-9])((?:\(|\)[₀-₉]*|[A-Z][a-z]?[₀-₉]*)+)([¹²³⁴⁵⁶⁷⁸⁹]?[⁺⁻])?(?![A-Za-z])/g, (whole: string, body: string, charge?: string) => {
    const symbols = body.match(/[A-Z][a-z]?/g) ?? [];
    if (!symbols.length || !symbols.every((x) => ELEMENT_SYMBOLS.has(x))) return whole;
    const hasSub = /[₀-₉]/.test(body), twoLetter = symbols.some((x) => x.length === 2);
    if (!hasSub && !charge && !(twoLetter && symbols.length >= 2)) return whole;
    const spellGroup = (g: string) => g.replace(/([A-Z][a-z]?)([₀-₉]*)/g, (_m, sym: string, sub: string) => ` ${sym.toUpperCase().split('').join(' ')}${sub ? ' ' + sub.split('').map((d) => SUB_DIGIT[d]).join('') : ''}`);
    let spoken = body.replace(/\(([^()]*)\)([₀-₉]+)/g, (_m, inner: string, n: string) => `${spellGroup(inner)} taken ${n.split('').map((d) => SUB_DIGIT[d]).join('')} times,`);
    spoken = spellGroup(spoken.replace(/[()]/g, ''));
    if (charge) {
      const sign = charge.endsWith('⁺') ? 'plus' : 'minus';
      const n = charge.length > 1 ? `${DIGIT_WORD[charge[0]]} ` : '';
      spoken += ` ${n}${sign}`;
    }
    return ` ${spoken.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim()} `;
  });
}

export function toSpeech(input: string): string {
  let t = ` ${input} `.replace(/[   ]/g, ' ');

  // Marker symbols that mean nothing when read aloud.
  t = t.replace(/[★☆]/g, '').replace(/[✓✔]/g, ' check, ').replace(/[✗✘]/g, ' not matching, ');

  // Abbreviations.
  t = t.replace(/\be\.g\./gi, 'for example').replace(/\bi\.e\./gi, 'that is').replace(/\bEqs\./g, 'Equations').replace(/\bEq\./g, 'Equation')
    .replace(/\bFigs\./g, 'Figures').replace(/\bFig\./g, 'Figure').replace(/\bvs\.?(?=\s)/g, 'versus').replace(/\bapprox\./g, 'approximately');

  // Biology: micrometres and nanometres, microscope powers such as 10X, and "about" for a tilde before a number.
  t = t.replace(/(\d(?:\.\d+)?)\s*µm(?![A-Za-z])/g, (_m, n: string) => `${n} ${plural(n) ? 'micrometres' : 'micrometre'}`).replace(/µm(?![A-Za-z])/g, 'micrometres')
    .replace(/(\d(?:\.\d+)?)\s*nm(?![A-Za-z])/g, (_m, n: string) => `${n} ${plural(n) ? 'nanometres' : 'nanometre'}`)
    .replace(/(\d)X(?![A-Za-z])/g, '$1 times').replace(/~\s*(?=\d)/g, 'about ');

  // Fractions.
  t = t.replace(/½/g, ' one half ').replace(/¼/g, ' one quarter ').replace(/¾/g, ' three quarters ');
  // "one half at squared" would read "at" as a preposition.
  t = t.replace(/one half\s*at(?=²|\b)/g, 'one half a t');

  // Compound units, anywhere.
  for (const [re, w] of COMPOUND) t = t.replace(re, w);
  t = t.replace(/(\d)\s*°\s*C\b/g, '$1 degrees Celsius').replace(/(\d)\s*°/g, '$1 degrees');

  // Simple units after a number ("5 m", "250 kg", "3 Hz"); area and volume forms first.
  t = t.replace(/(\d(?:[.,]\d+)?)\s*(m|cm|km)(²|³)(?![A-Za-z])/g, (_m, n: string, u: string, p: string) => `${num(n)} ${p === '²' ? 'square' : 'cubic'} ${unitWord(u, plural(n))}`);
  t = t.replace(/(\d(?:[.,]\d+)?)(\s*)(kg|mg|cm|mm|km|ms|min|kJ|kW|Hz|kHz|MHz|Pa|rad|g|m|s|h|N|J|W)(²|³)?(?![A-Za-z0-9/])/g,
    (full: string, n: string, sp: string, u: string, p?: string) => {
      if (NEEDS_SPACE.has(u) && sp === '') return full;
      const base = `${num(n)} ${unitWord(u, plural(n))}`;
      return p ? `${base} ${p === '²' ? 'squared' : 'cubed'}` : base;
    });

  // Chemistry: formulae and ion charges, read the way students say them ("C A C L 2", "S O 4 two minus").
  t = speakChemistry(t);

  // Subscripts and superscripts that remain (variables).
  t = t.replace(/[₀-₉ₐₑₙₓ]/g, (c) => ` ${SUB[c]}`);
  t = t.replace(/_\{?([A-Za-z0-9]+)\}?/g, ' $1');
  t = t.replace(/⁻([¹²³⁴⁵⁶⁷⁸⁹])/g, (_m, c: string) => ` to the minus ${SUP[c]} `);
  t = t.replace(/²/g, ' squared ').replace(/³/g, ' cubed ');
  t = t.replace(/[⁰¹⁴-⁹]/g, (c) => ` to the power ${SUP[c]} `);
  t = t.replace(/\^([A-Za-z])(?![A-Za-z])/g, ' to the power $1 ');
  for (let guard = 0; guard < 4 && /\^\(/.test(t); guard++) t = t.replace(/\^\(([^()]*)\)/g, ' to the power of ($1) ');
  t = t.replace(/\^\{?(-?\d+)\}?/g, (_m, n: string) => (n === '2' ? ' squared ' : n === '3' ? ' cubed ' : ` to the power ${n.replace('-', 'minus ')} `));

  // Products of letters that a speech engine would try to pronounce as a word.
  t = t.replace(PRODUCTS, (w) => spaceLetters(w));

  // "frequency (ν)": the word already says it, so do not also say "nu". Elsewhere ν is the symbol and is read "nu".
  t = t.replace(/\b(frequency)\s*\(\s*ν\s*\)/gi, '$1');

  // Greek letters, Δ and Σ.
  t = t.replace(/Δ\s*/g, ' change in ').replace(/Σ\s*/g, ' the sum of ');
  t = t.replace(/[α-ωΩΦΘ]/g, (c) => ` ${GREEK[c] ?? c} `);

  // Signs: negative / positive before a number or a letter at the start of an expression, minus / plus between operands.
  // A hyphen before a word ending ("-ide", "-ous") is not a sign; a sign is followed by a number, Δ, or a single-letter variable.
  t = t.replace(/(^|[\s(=,:;[])[−–-](?=[\d.Δ]|[A-Za-z](?![a-z]))/g, '$1 negative ');
  t = t.replace(/(^|\s)-(?=[a-z]{2,})/g, '$1');
  t = t.replace(/(^|[\s(=,:;[])\+(?=\d)/g, '$1 positive ');
  t = t.replace(/(\d)\s*[–]\s*(\d)/g, '$1 to $2').replace(/([A-Za-z])[–](?=\d)/g, '$1 to ');
  t = t.replace(/\s−\s/g, ' minus ').replace(/−/g, ' minus ').replace(/\s\+\s/g, ' plus ').replace(/\s–\s/g, ', ');

  // Geometry and logic notation (Mathematics). Named points ("AB", "∠PQR") are read letter by letter.
  t = t.replace(/∠\s*/g, ' angle ').replace(/[△▵]\s*/g, ' triangle ').replace(/≅/g, ' is congruent to ').replace(/∥/g, ' is parallel to ')
    .replace(/∦/g, ' is not parallel to ').replace(/[⊥⟂]/g, ' is perpendicular to ').replace(/∼/g, ' is similar to ').replace(/≡/g, ' is identical to ')
    .replace(/⇔/g, ' if and only if ').replace(/∈/g, ' is in ').replace(/∉/g, ' is not in ').replace(/∩/g, ' intersection ').replace(/∪/g, ' union ')
    .replace(/⌢/g, ' arc ').replace(/∵/g, ' because ').replace(/′/g, ' prime ');
  t = t.replace(/(^|[^A-Za-z])([A-Z]{2,4})(?=$|[^A-Za-z])/g, (_m, pre: string, w: string) => (SPOKEN_WORDS.has(w) ? pre + w : `${pre}${spaceLetters(w)}`));

  // Operators and relations.
  t = t.replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/[·⋅]/g, ' times ')
    .replace(/≈/g, ' is approximately ').replace(/≠/g, ' is not equal to ').replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ')
    .replace(/∝/g, ' is proportional to ').replace(/√/g, ' square root of ').replace(/±/g, ' plus or minus ').replace(/∴/g, ' therefore ')
    .replace(/∞/g, ' infinity ').replace(/→/g, ' gives ').replace(/⇒/g, ' so ')
    .replace(/\s=\s?/g, ' equals ').replace(/=/g, ' equals ').replace(/\s<\s/g, ' is less than ').replace(/\s>\s/g, ' is greater than ')
    .replace(/(\d)\s*%/g, '$1 percent');

  // "u + at" (the product a t): "at" after an operator and before the end of the expression is a product, not the word.
  t = t.replace(/\b(plus|minus|equals|times) at(?=\s*(?:$|[,.;:)]|\s(?:plus|minus|equals|squared|divided|times)\b))/g, '$1 a t');

  // Tidy.
  return t.replace(/\s*,\s*,/g, ',').replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

/** Sentence-sized pieces (about 200 characters at most) so a long passage never hits a speech engine's length limit. */
export function chunkForSpeech(text: string, max = 200): string[] {
  const out: string[] = [];
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length <= max) { out.push(s); continue; }
    let cur = '';
    for (const part of s.split(/(?<=[,;:])\s+/)) {
      if (cur && (cur + ' ' + part).length > max) { out.push(cur); cur = part; } else cur = cur ? `${cur} ${part}` : part;
    }
    if (cur) out.push(cur);
  }
  return out.flatMap((c) => {
    if (c.length <= max) return [c];
    const words = c.split(' '); const parts: string[] = []; let cur = '';
    for (const w of words) { if (cur && (cur + ' ' + w).length > max) { parts.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w; }
    if (cur) parts.push(cur);
    return parts;
  });
}

