import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('settings open next to Filters, are saved, and reset', async ({ page }) => {
  await page.goto('/#/mechanics');
  const toggle = page.getByRole('button', { name: 'Settings' });
  const filters = (await page.locator('.filters-toggle').boundingBox())!;
  expect((await toggle.boundingBox())!.x).toBeGreaterThan(filters.x);
  await toggle.click();
  const drifters = page.getByRole('switch', { name: /Things drifting off Earth/ });
  await expect(drifters).toBeChecked();
  await drifters.click();
  await expect(page.getByLabel('How often')).toHaveCount(0);
  const results = await new AxeBuilder({ page }).include('.settings-panel').analyze();
  expect(results.violations).toEqual([]);
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('switch', { name: /Things drifting off Earth/ })).not.toBeChecked();
  await page.getByRole('button', { name: 'Reset to defaults' }).click();
  await expect(page.getByRole('switch', { name: /Things drifting off Earth/ })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.locator('.settings-panel')).toHaveCount(0);
});

test('mechanics can be set not to play on their own', async ({ page }) => {
  await page.goto('/#/mechanics/dmail');
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('switch', { name: 'Play mechanics automatically' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
});
