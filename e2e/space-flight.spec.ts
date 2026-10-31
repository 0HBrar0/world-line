import { expect, test, type Page } from '@playwright/test';
import { force3d, setTier } from './helpers';

const local = () => test.skip(!!process.env.CI, 'needs local 3D');

test('follow opens in the observer view and can switch to the flight', async ({ page }) => {
  local();
  await force3d(page);
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  await expect(page.locator('.entity-eyes')).toBeAttached();
  await page.getByRole('button', { name: 'Flight' }).click();
  await expect(page.locator('.space-canvas')).toBeVisible();
  await expect(page.locator('.entity-eyes')).toHaveCount(0);
});

test('wide screens can switch to the chart', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'the chart is desktop only');
  local();
  await force3d(page);
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  await page.getByRole('button', { name: 'Chart' }).click();
  await expect(page.locator('.space-canvas')).toHaveCount(0);
  await expect(page.locator('[data-node]').first()).toBeVisible();
});

test('software graphics get the chart, not the flight', async ({ page }) => {
  await setTier(page, 'extras');
  await page.goto('/#/follow/1');
  await expect(page.getByTestId('narration')).toBeVisible();
  await expect(page.locator('.space-canvas')).toHaveCount(0);
});

test('reduced motion gets the chart, not the flight', async ({ page }) => {
  await force3d(page);
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

const flightPoint = (page: Page, id: 'drifter' | 'rocket' | 'mars') =>
  page.evaluate((what) => (window as unknown as { worldLineFlight: { pointOf: (w: string) => { x: number; y: number } | null } }).worldLineFlight.pointOf(what), id);

test('a floating object tells its story and a rocket ends the world, briefly', async ({ page }, info) => {
  test.skip(!!process.env.CI, 'needs local 3D');
  test.skip(info.project.name === 'mobile', 'pointing needs a mouse');
  test.setTimeout(150_000);
  await force3d(page);
  await setTier(page, 'extras');
  await page.addInitScript(() => localStorage.setItem('wl.prefs', JSON.stringify({ driftPace: 'lots', quality: 'low' })));
  await page.goto('/#/follow/44');
  await page.getByRole('button', { name: 'Observer', exact: true }).click();
  await expect(page.locator('.space-canvas')).toBeVisible();

  await expect.poll(() => flightPoint(page, 'drifter'), { timeout: 40_000 }).not.toBeNull();
  const thing = (await flightPoint(page, 'drifter'))!;
  await page.mouse.move(thing.x, thing.y);
  await page.waitForTimeout(800);
  const held = (await flightPoint(page, 'drifter'))!;
  await page.mouse.move(held.x, held.y);
  await page.mouse.click(held.x, held.y);
  await expect(page.locator('.oddity-note p').first()).not.toBeEmpty();
  await expect(page.locator('.oddity-hint')).toHaveText('Right-click to destroy');

  await page.evaluate(() => (window as unknown as { worldLineFlight: { launchRocket: () => void } }).worldLineFlight.launchRocket());
  await page.waitForTimeout(600);
  const rocket = (await flightPoint(page, 'rocket'))!;
  await page.mouse.move(rocket.x, rocket.y);
  await page.waitForTimeout(600);
  const slowed = (await flightPoint(page, 'rocket'))!;
  await page.mouse.click(slowed.x, slowed.y, { button: 'right' });
  await expect(page.locator('.world-lost h2')).toHaveText('World line lost', { timeout: 30_000 });
  await expect(page.locator('.world-lost-count b')).toHaveText('1', { timeout: 15_000 });
  await expect(page.locator('.world-lost')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator('.space-canvas')).toBeVisible();
});

test('scrolling up on Mars carries the camera down to watch him', async ({ page }, info) => {
  test.skip(!!process.env.CI, 'needs local 3D');
  test.skip(info.project.name === 'mobile', 'pointing needs a mouse');
  test.setTimeout(150_000);
  await force3d(page);
  await setTier(page, 'extras');
  await page.addInitScript(() => localStorage.setItem('wl.prefs', JSON.stringify({ quality: 'low' })));
  await page.goto('/#/follow/44');
  await page.getByRole('button', { name: 'Observer', exact: true }).click();
  await expect(page.locator('.space-canvas')).toBeVisible();
  await page.waitForTimeout(5000);

  await expect(async () => {
    const man = (await flightPoint(page, 'mars'))!;
    await page.mouse.move(man.x, man.y + 34);
    await expect(page.locator('.mars-hint')).toBeVisible({ timeout: 3000 });
    await page.mouse.wheel(0, -120);
    await expect(page.locator('.mars-hint')).toHaveCount(0, { timeout: 3000 });
  }).toPass({ timeout: 90_000 });

  await page.mouse.wheel(0, -120);
  await page.mouse.wheel(0, -120);
  await page.mouse.wheel(0, -120);
  await expect(page.locator('.mars-words strong')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('.space-canvas')).toBeVisible();
  const first = await page.locator('.mars-words strong').innerText();
  await expect(async () => {
    await page.mouse.wheel(0, -120);
    await expect(page.locator('.mars-words strong')).not.toHaveText(first, { timeout: 2000 });
  }).toPass({ timeout: 40_000 });
  await page.getByRole('button', { name: 'Back to space' }).click();
  await expect(page.locator('.mars-words')).toHaveCount(0, { timeout: 5000 });
});
