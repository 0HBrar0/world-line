import { expect, test } from '@playwright/test';
import { setTier } from './helpers';

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

for (const view of ['Observer', 'Flight', 'Chart']) {
  test(`the glass arrows work in ${view}`, async ({ page }, info) => {
    test.skip(view === 'Chart' && info.project.name === 'mobile', 'the chart is desktop only');
    await setTier(page, 'extras');
    await page.goto('/#/follow/1');
    await page.getByRole('button', { name: view, exact: true }).click();
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(page).toHaveURL(/follow\/2/);
    await page.getByRole('button', { name: 'Previous step' }).click();
    await expect(page).toHaveURL(/follow\/1/);
  });
}
