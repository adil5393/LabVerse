/* Run against the development preview. PLAYWRIGHT_MODULE can point to an existing installation. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5188';
const output = process.env.AUDIT_OUTPUT || '../reports/physics-responsive';

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [], checks = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/physics-audit.html`);
  await page.getByLabel('Curriculum example').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const fixtures = await page.locator('[aria-label="Curriculum example"] option').evaluateAll(options => options.map(o => ({ index: o.value, kind: o.dataset.kind, chapter: o.dataset.chapter, location: o.textContent })));
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  for (const width of [320, 390, 430, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const fixture of fixtures) {
      await page.getByLabel('Curriculum example').selectOption(fixture.index);
      await settle();
      // Inspect secondary controls too, not only the initial collapsed presentation.
      await page.locator('main details').evaluateAll(elements => elements.forEach(el => { el.open = true; }));
      await settle();
      const metrics = await page.locator('main').evaluate(root => {
        const visible = el => el.checkVisibility() && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
        const labels = [...root.querySelectorAll('svg text')].filter(visible).map(el => {
          const matrix = el.getScreenCTM(), svg = el.ownerSVGElement.getBoundingClientRect();
          const rect = el.getBoundingClientRect();
          return { text: el.textContent, font: +(parseFloat(getComputedStyle(el).fontSize) * Math.hypot(matrix.a, matrix.b)).toFixed(1), clipped: rect.left < svg.left - 3 || rect.right > svg.right + 3 || rect.top < svg.top - 3 || rect.bottom > svg.bottom + 3 };
        });
        const targets = [...root.querySelectorAll('button, select, input:not([type=hidden]):not([type=checkbox]):not([type=radio])')].filter(visible).map(el => ({ name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 60), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
        return { viewport: innerWidth, scroll: document.documentElement.scrollWidth, smallLabels: labels.filter(l => l.font < 10.5), clippedLabels: labels.filter(l => l.clipped), smallTargets: targets.filter(t => t.height < 43 || t.width < 30) };
      });
      checks.push({ ...fixture, width, ...metrics });
    }
    console.log(`Checked ${fixtures.length} curriculum instances at ${width}px`);
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ fixtures, checks, errors }, null, 2));
  console.log(JSON.stringify({ instances: fixtures.length, checks: checks.length, errors, overflow: checks.filter(c => c.scroll > c.width).length, smallLabelCases: checks.filter(c => c.smallLabels.length).length, clippedLabelCases: checks.filter(c => c.clippedLabels.length).length, smallTargetCases: checks.filter(c => c.smallTargets.length).length }));
  await browser.close();
  if (errors.length || checks.some(c => c.scroll > c.width || c.smallLabels.length || c.clippedLabels.length || c.smallTargets.length)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
