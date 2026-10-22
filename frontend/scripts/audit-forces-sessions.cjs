const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5188';
const output = process.env.AUDIT_OUTPUT || '../reports/forces-sessions';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const errors = [], checks = [], flows = [], findings = [];
  const inspect = async (example, width, state) => {
    const problems = await page.locator('main').evaluate(root => {
      const visible = el => el.checkVisibility() && el.getBoundingClientRect().width > 0;
      return [...root.querySelectorAll('svg text')].filter(visible).flatMap(el => {
        const matrix = el.getScreenCTM(), rect = el.getBoundingClientRect(), svg = el.ownerSVGElement.getBoundingClientRect();
        const font = parseFloat(getComputedStyle(el).fontSize) * Math.hypot(matrix.a, matrix.b);
        const clipped = rect.left < svg.left - 3 || rect.right > svg.right + 3 || rect.top < svg.top - 3 || rect.bottom > svg.bottom + 3;
        return font < 10.5 || clipped ? [{ text: el.textContent, font, clipped }] : [];
      });
    });
    if (problems.length) findings.push({ ...example, width, state, problems });
  };
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/physics-audit.html');
  const picker = page.getByLabel('Curriculum example');
  await picker.waitFor();
  const examples = await picker.locator('option[data-chapter=forces]').evaluateAll(options => options.map(o => ({ index: o.value, kind: o.dataset.kind })));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const example of examples) {
      await picker.selectOption(example.index);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await inspect(example, width, 'initial');
      if (['forceCart', 'twoBody'].includes(example.kind)) {
        const time = page.locator('input[aria-label="Simulated time scrub"]');
        await time.press('End');
        const before = await time.inputValue();
        await page.getByRole('button', { name: 'See forces', exact: true }).tap();
        assert.equal(await time.inputValue(), before, 'View switch reset the experiment');
        assert(await page.getByTestId('force-figure').first().isVisible());
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        await inspect(example, width, 'forces');
        if (width < 640 && example.kind === 'twoBody') {
          await page.getByRole('button', { name: 'Cart B', exact: true }).tap();
          assert.equal(await page.getByTestId('force-figure').count(), 1);
          assert(await page.getByRole('img', { name: /Forces on cart B only/ }).isVisible());
        }
        await page.getByRole('button', { name: 'Watch motion', exact: true }).tap();
        assert.equal(await time.inputValue(), before);
      }
      if (example.kind === 'pairIdentify' && await page.getByRole('checkbox').count()) {
        const choices = page.getByRole('checkbox');
        await choices.nth(0).tap(); await choices.nth(1).tap();
        await page.getByTestId('pair-check').tap();
        assert(await page.getByTestId('pair-feedback').isVisible());
      }
      checks.push({ width, ...example });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/physics/forces/lab', '/physics/forces/interactions']) {
    await page.goto(base + route);
    await page.getByLabel('Choose an activity').waitFor();
    const options = await page.getByLabel('Choose an activity').locator('option').evaluateAll(items => items.map(o => o.value));
    for (const id of options) {
      await page.getByLabel('Choose an activity').selectOption(id);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
      assert.equal(new URL(page.url()).searchParams.get('experiment') || '', id);
      flows.push({ route, activity: id || 'free' });
    }
    await page.getByLabel('Choose an activity').selectOption('');
    if (route.endsWith('interactions')) {
      await page.getByTestId('two-body-track').waitFor();
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const carts = await page.getByTestId('two-body-track').locator('rect').all();
      assert.equal(carts.length, 2);
      const a = await carts[0].boundingBox(), b = await carts[1].boundingBox();
      assert(a.x + a.width <= b.x || b.x + b.width <= a.x, 'The two carts overlap in the initial phone view');
    }
    await page.screenshot({ path: `${output}/${route.split('/').pop()}-phone.png` });
  }
  fs.writeFileSync(`${output}/results.json`, JSON.stringify({ checks, flows, errors, findings }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ examples: examples.length, renderAndInteractionChecks: checks.length, activityChanges: flows.length, errors, findings }));
  assert.equal(errors.length, 0, errors.join('\n'));
  assert.equal(findings.length, 0, 'Some diagrams have clipped or small labels');
})().catch(e => { console.error(e); process.exit(1); });
