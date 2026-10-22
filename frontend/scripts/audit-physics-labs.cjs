const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5188';
const output = process.env.AUDIT_OUTPUT || '../reports/physics-responsive';
const routes = ['/physics/motion/lab', '/physics/motion/graphs', '/physics/motion/equations', '/physics/motion/circular', '/physics/motion/derivations', '/physics/forces/lab', '/physics/forces/interactions', '/physics/forces/derivations', '/physics/work/lab', '/physics/work/kinetic', '/physics/work/energy', '/physics/work/machines', '/physics/work/power', '/physics/work/derivations', '/physics/sound/vibration', '/physics/sound/wave', '/physics/electricity', '/physics/electricity/workbench'];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [], checks = [], flows = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 390, 844, 1440]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    for (const route of routes) {
      await page.goto(base + route);
      await page.locator('h1').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      assert(size.content <= width, `${route}: overflow at ${width}`);
      checks.push({ route, width, ...size });
      if (width === 390) {
        const launcher = page.locator('[data-testid="mobile-lab-toolbar"]').getByRole('button', { name: /Setup|Parameters|Scenarios & Edit|Edit Orbit/ }).first();
        if (await launcher.count() && await launcher.isVisible()) {
          await launcher.tap();
          const sheet = page.getByRole('dialog');
          if (await sheet.count()) {
            assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
            assert((await sheet.boundingBox()).width <= width);
            flows.push(`${route}: setup opens and Escape closes`);
            await page.keyboard.press('Escape');
            assert.equal(await page.getByRole('dialog').count(), 0);
          }
        }
        await page.screenshot({ path: path.join(output, route.slice(1).replaceAll('/', '-') + '.png'), animations: 'disabled' });
      }
    }
    console.log(`Checked ${routes.length} lab and derivation routes at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/physics-audit.html');
  const options = await page.locator('[aria-label="Curriculum example"] option').evaluateAll(options => options.map(o => ({ value: o.value, kind: o.dataset.kind })));
  for (const kind of [...new Set(options.map(o => o.kind))]) {
    await page.getByLabel('Curriculum example').selectOption(options.find(o => o.kind === kind).value);
    const content = page.locator('.activity-content');
    const handle = await content.elementHandle();
    await page.getByRole('button', { name: 'Focus activity' }).tap();
    await page.getByRole('dialog', { name: 'Physics activity' }).waitFor();
    assert(await handle.evaluate(el => el.isConnected), `${kind}: simulation remounted`);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert(await handle.evaluate(el => el.isConnected));
    flows.push(`${kind}: focus and return without remounting`);
  }
  await page.goto(base + '/physics/work/lab');
  const cart = page.getByRole('button', { name: /^Cart,/ });
  const before = await cart.boundingBox();
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width / 2 + 60, before.y + before.height / 2, { steps: 8 });
  await page.mouse.up();
  const after = await cart.boundingBox();
  assert(after.x > before.x + 20, 'Phone cart drag did not update the apparatus');
  flows.push('work lab: direct cart drag updates position');
  await page.goto(base + '/physics/sound/vibration');
  await page.locator('[data-action="pluck"]').tap();
  assert.equal(await page.getByTestId('readout-sound').textContent(), 'yes');
  assert.equal(await page.getByTestId('sound-toggle').getAttribute('aria-checked'), 'false');
  flows.push('vibration lab: pluck updates the silent simulation');
  await page.goto(base + '/physics/sound/wave');
  await page.locator('details').evaluateAll(elements => elements.forEach(el => { el.open = true; }));
  const oldFrequency = await page.getByTestId('readout-nu').textContent();
  await page.locator('#wave-freq').press('End');
  assert.notEqual(await page.getByTestId('readout-nu').textContent(), oldFrequency);
  flows.push('wave lab: changing frequency updates the measurement');
  fs.writeFileSync(path.join(output, 'labs.json'), JSON.stringify({ checks, flows, errors }, null, 2));
  console.log(JSON.stringify({ checks: checks.length, flows: flows.length, errors }));
  await browser.close();
  assert.equal(errors.length, 0, errors.join('\n'));
})().catch(error => { console.error(error); process.exit(1); });
