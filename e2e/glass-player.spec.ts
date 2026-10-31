import { expect, test } from '@playwright/test';
import { force3d, setTier } from './helpers';

test('the overview box moves while the map is still being dragged', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'the map canvas is desktop only');
  await setTier(page, 'extras');
  await page.goto('/#/map');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  const box = page.locator('.mini-view');
  const before = Number(await box.getAttribute('x'));
  const map = (await page.locator('.map-svg').boundingBox())!;
  await page.mouse.move(map.x + map.width - 80, map.y + 40);
  await page.mouse.down();
  await page.mouse.move(map.x + map.width - 320, map.y + 40, { steps: 6 });
  expect(Number(await box.getAttribute('x'))).toBeGreaterThan(before);
  await page.mouse.up();
});

test('the glass arrows and play step along the map', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'the map canvas is desktop only');
  await setTier(page, 'extras');
  await page.goto('/#/map');
  await page.getByRole('button', { name: 'Next step' }).click();
  const first = await page.locator('.glass-now strong').textContent();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('.glass-now strong')).not.toHaveText(first!);
  await page.getByRole('button', { name: 'Previous step' }).click();
  await expect(page.locator('.glass-now strong')).toHaveText(first!);
  await page.locator('.glass-pace select').selectOption('2');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('.glass-now strong')).not.toHaveText(first!, { timeout: 4000 });
  await page.getByRole('button', { name: 'Pause' }).click();
});

test('points on the chart name themselves and take the story there', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'the chart is desktop only');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  const point = page.locator('.follow-map [data-node]').nth(2);
  await point.hover();
  await expect(page.locator('.hover-card strong')).not.toBeEmpty();
  await point.click();
  await expect(page).toHaveURL(/follow\/\d+/);
  await expect(page).not.toHaveURL(/follow\/1$/);
});

for (const view of ['Observer', 'Flight']) {
  test(`points in ${view} name themselves and take the story there`, async ({ page }, info) => {
    test.skip(!!process.env.CI, 'needs local 3D');
    test.skip(info.project.name === 'mobile', 'pointing needs a mouse');
    test.setTimeout(120_000);
    await force3d(page);
    await setTier(page, 'extras');
    await page.goto('/#/follow/10');
    await page.getByRole('button', { name: view, exact: true }).click();
    const canvas = page.locator('.space-canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(2500);
    const under = await page.evaluate(() => {
      const r = document.querySelector('.follow-card h2')!.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.tagName;
    });
    expect(under).toBe('CANVAS');
    const box = (await canvas.boundingBox())!;
    const current = await page.locator('.follow-card h2').textContent();
    let found = false;
    for (let y = 120; y < box.height - 120 && !found; y += 22) {
      for (let x = 540; x < box.width - 30 && !found; x += 22) {
        await page.mouse.move(x, y);
        await page.waitForTimeout(30);
        const card = page.locator('.hover-card strong');
        // The star for the current step would go nowhere, so keep looking past it.
        found = (await card.count()) > 0 && (await card.textContent()) !== current;
      }
    }
    expect(found).toBe(true);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page).not.toHaveURL(/follow\/10$/);
  });
}

for (const view of ['Observer', 'Flight', 'Chart']) {
  test(`the glass arrows work in ${view}`, async ({ page }, info) => {
    test.skip(view === 'Chart' && info.project.name === 'mobile', 'the chart is desktop only');
    test.skip(!!process.env.CI, 'needs local 3D');
    test.setTimeout(120_000);
    await force3d(page);
    await setTier(page, 'extras');
    await page.goto('/#/follow/1');
    await page.getByRole('button', { name: view, exact: true }).click();
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(page).toHaveURL(/follow\/2/);
    await page.getByRole('button', { name: 'Previous step' }).click();
    await expect(page).toHaveURL(/follow\/1/);
  });
}
