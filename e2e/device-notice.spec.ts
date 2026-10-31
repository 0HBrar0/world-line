import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('a first visit on a device that misses features is told once', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'desktop depends on the graphics chip');
  await page.goto('/');
  const notice = page.getByRole('dialog', { name: 'World Line is made for a computer' });
  await expect(notice).toBeVisible();
  await page.getByRole('button', { name: 'Continue anyway' }).click();
  await expect(notice).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.page, main').first()).toBeVisible();
  await expect(notice).toHaveCount(0);
});
