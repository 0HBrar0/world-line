import { expect, test } from '@playwright/test';
import { setTier } from './helpers';

test('follow opens in the observer view and can switch to the flight', async ({ page }) => {
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  await expect(page.locator('.entity-eyes')).toBeAttached();
  await page.getByRole('button', { name: 'Flight' }).click();
  await expect(page.locator('.space-canvas')).toBeVisible();
  await expect(page.locator('.entity-eyes')).toHaveCount(0);
});

test('wide screens can switch to the chart', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'the chart is desktop only');
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  await page.getByRole('button', { name: 'Chart' }).click();
  await expect(page.locator('.space-canvas')).toHaveCount(0);
  await expect(page.locator('[data-node]').first()).toBeVisible();
});

test('reduced motion gets the chart, not the flight', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  await expect(page.getByTestId('narration')).toBeVisible();
  await expect(page.locator('.space-canvas')).toHaveCount(0);
});

test('the flight loads three.js on the follow page only', async ({ page }) => {
  const loaded: string[] = [];
  page.on('response', (r) => loaded.push(r.url()));
  await page.goto('/#/map');
  await expect(page.locator('main')).toBeVisible();
  expect(loaded.some((u) => u.includes('SpaceFlight'))).toBe(false);
});
