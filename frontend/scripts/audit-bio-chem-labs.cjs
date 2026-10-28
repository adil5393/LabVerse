// Browser audit of the Chemistry and Biology laboratories.
// Usage: PLAYWRIGHT_MODULE=<path to playwright> PREVIEW_URL=http://127.0.0.1:5190 node scripts/audit-bio-chem-labs.cjs [outputDir]
// Checks every investigation at 390 × 844 and representative ones at 320, 360, 768 and 1440 px wide: horizontal overflow,
// whether the first main control is on screen together with the experiment, touch targets under 44 px, the smallest
// rendered label in each drawing, reduced motion, and focus mode. Saves a screenshot of each.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5190';
const out = process.argv[2] || '../reports/bio-chem-labs/after';
const LABS = {
  '/biology/cell/lab': ['microscope', 'osmosis', 'cells', 'division', 'sizes'],
  '/biology/tissues/lab': ['roots', 'stem', 'animal', 'joints', 'rings', 'microscope'],
  '/biology/reproduction/lab': ['microscope', 'beads', 'flower', 'pollination', 'strategies', 'cycle'],
  '/biology/diversity/lab': ['microscope', 'kingdoms', 'plants', 'animals', 'hierarchy', 'names'],
  '/chemistry/mixtures/lab': ['beam', 'concentration', 'solubility', 'separation', 'chromatography'],
  '/chemistry/atom/lab': ['models', 'builder', 'foil', 'isotopes'],
  '/chemistry/atomic-foundations/lab': ['balance', 'bonds', 'formula', 'mass', 'properties'],
};
const REPRESENTATIVE = ['/biology/cell/lab?view=osmosis', '/biology/cell/lab?view=microscope', '/biology/reproduction/lab?view=pollination', '/chemistry/mixtures/lab?view=separation', '/chemistry/mixtures/lab?view=solubility', '/chemistry/atom/lab?view=foil'];

async function inspect(page, width) {
  return page.evaluate((w) => {
    const panel = [...document.querySelectorAll('[role="tabpanel"]')].find((p) => !p.hidden);
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const first = panel && [...panel.querySelectorAll('.lab-actions button, .lab-controls button, .lab-controls select, .lab-controls input, .lab-scene [role="button"], .lab-scene button')].find(visible);
    const scene = panel && panel.querySelector('.lab-scene');
    const small = [];
    for (const el of panel ? panel.querySelectorAll('button, select, input:not([type="checkbox"]):not([type="radio"]), summary, a[href], [role="button"]') : []) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const isRange = el.matches('input[type="range"]');
      if (r.height < 43.5 || (!isRange && r.width < 43.5)) small.push(`${el.tagName.toLowerCase()}${el.dataset.action ? `[${el.dataset.action}]` : ''} ${Math.round(r.width)}×${Math.round(r.height)} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}"`);
    }
    let minFont = Infinity, minText = '';
    for (const svg of panel ? panel.querySelectorAll('.lab-scene > svg') : []) {
      if (!visible(svg) || !svg.viewBox?.baseVal?.width) continue;
      const k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      for (const t of svg.querySelectorAll('text')) {
        if (!t.textContent.trim()) continue;
        const fs = parseFloat(t.getAttribute('font-size') || getComputedStyle(t).fontSize) * k;
        if (fs < minFont) { minFont = fs; minText = t.textContent.trim().slice(0, 30); }
      }
    }
    return {
      overflow: document.documentElement.scrollWidth > w,
      firstControlTop: first ? Math.round(first.getBoundingClientRect().top + window.scrollY) : null,
      firstControlBottom: first ? Math.round(first.getBoundingClientRect().bottom + window.scrollY) : null,
      sceneTop: scene ? Math.round(scene.getBoundingClientRect().top + window.scrollY) : null,
      small: small.slice(0, 6), smallCount: small.length,
      minFont: Number.isFinite(minFont) ? Math.round(minFont * 10) / 10 : null, minText,
    };
  }, width);
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];
  const run = async (width, height, routes, shots) => {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 800, hasTouch: width < 800, reducedMotion: 'reduce' });
    page.on('pageerror', (e) => errors.push(`${width}px: ${e.message}`));
    for (const route of routes) {
      await page.goto(base + route);
      await page.locator('[role="tabpanel"]:not([hidden]) .lab-stage').first().waitFor({ timeout: 20000 });
      await page.evaluate(() => document.fonts.ready);
      const r = await inspect(page, width);
      const onScreen = r.firstControlBottom !== null && r.firstControlBottom <= height;
      results.push({ width, route, ...r, controlOnFirstScreen: onScreen });
      if (shots) await page.screenshot({ path: path.join(out, `${route.replace(/^\//, '').replace(/[/?=&]/g, '-')}-${width}.png`), animations: 'disabled' });
    }
    await page.close();
  };
  const all = Object.entries(LABS).flatMap(([lab, views]) => views.map((v) => `${lab}?view=${v}`));
  await run(390, 844, all, true);
  for (const [w, h] of [[320, 640], [360, 780], [768, 1024], [1440, 900]]) await run(w, h, REPRESENTATIVE, true);

  // Reduced motion, focus mode and keyboard on one laboratory.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(base + '/biology/cell/lab?view=osmosis');
  await page.locator('#osm-outside').fill('10');
  const anim = await page.evaluate(() => [...document.querySelectorAll('.lab-anim-flow, .lab-anim-rise')].map((el) => getComputedStyle(el).animationName));
  const focus = page.locator('[role="tabpanel"]:not([hidden]) .activity-toolbar button', { hasText: 'Focus activity' });
  await focus.click();
  const dialog = await page.getByRole('dialog').getAttribute('aria-label');
  await page.keyboard.press('Escape');
  const closed = (await page.getByRole('dialog').count()) === 0;
  const flows = { reducedMotionAnimations: [...new Set(anim)], focusDialogLabel: dialog, escapeCloses: closed };
  await browser.close();

  fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify({ results, flows, errors }, null, 2));
  const at390 = results.filter((r) => r.width === 390);
  console.log(`Checked ${at390.length} investigations at 390px and ${results.length - at390.length} representative views at 320/360/768/1440px.`);
  console.log('Overflow:', results.filter((r) => r.overflow).map((r) => `${r.width} ${r.route}`));
  console.log('Main control NOT on the first 390×844 screen:', at390.filter((r) => !r.controlOnFirstScreen).map((r) => `${r.route} (control at ${r.firstControlTop}px)`));
  console.log('Targets under 44px:', results.filter((r) => r.smallCount).map((r) => `${r.width} ${r.route}: ${r.small.join('; ')}`));
  console.log('Smallest drawing label (px) per width:', Object.fromEntries([320, 360, 390, 768, 1440].map((w) => { const xs = results.filter((r) => r.width === w && r.minFont); const m = xs.reduce((a, b) => (b.minFont < a.minFont ? b : a), xs[0]); return [w, m ? `${m.minFont} (${m.route} "${m.minText}")` : null]; })));
  console.log('Flows:', flows);
  console.log('Page errors:', errors);
})().catch((e) => { console.error(e); process.exit(1); });
