import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { setTier, shot, type Tier } from './helpers';

const ROUTES: Array<[string, string]> = [
  ['home', '/#/'],
  ['map', '/#/map'],
  ['follow', '/#/follow/5'],
  ['mechanics', '/#/mechanics'],
  ['mechanic', '/#/mechanics/dmail'],
  ['compare', '/#/compare?lines=wl-1130426,wl-0571024'],
  ['glossary', '/#/glossary'],
  ['glossary-entry', '/#/glossary/gl-dmail'],
  ['characters', '/#/characters'],
  ['character', '/#/characters/okabe'],
  ['sg0', '/#/sg0'],
  ['endings', '/#/endings'],
  ['works', '/#/works'],
  ['disputes', '/#/disputes'],
  ['about', '/#/about'],
];

for (const tier of ['premise', 'extras'] as Tier[]) {
  for (const [name, url] of ROUTES) {
    test(`axe: ${name} at ${tier}`, async ({ page }) => {
      await setTier(page, tier);
      await page.goto(url);
      await page.waitForTimeout(1000);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
}

test('axe: source drawer and tier dialog', async ({ page }) => {
  await page.goto('/#/');
  await page.locator('.badge').first().click();
  await expect(page.getByRole('dialog', { name: 'Sources' })).toBeVisible();
  await page.waitForTimeout(400);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

test('drawer traps focus and restores it to the badge', async ({ page }) => {
  await page.goto('/#/');
  const badge = page.locator('.home-grid .badge').first();
  await badge.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Sources' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(badge).toBeFocused();
});

test('the tier confirmation traps focus and Escape cancels it', async ({ page }) => {
  await page.goto('/#/');
  await page.getByLabel(/How far|spoiler level/i).selectOption('sg_ending');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, reveal' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel(/How far|spoiler level/i)).toHaveValue('premise');
});

test('skip link moves focus without changing the route', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Glossary', level: 1 })).toBeVisible();
  expect(page.url()).toContain('#/glossary');
});

test('media chips land in the URL', async ({ page }) => {
  await page.goto('/#/map');
  await page.locator('.filters-toggle:visible').click({ timeout: 500 }).catch(() => undefined);
  await page.getByRole('button', { name: 'Other', exact: true }).click();
  await expect(page).toHaveURL(/m=vn,anime,other/);
});

test.describe('layout', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 768, 'runs once');

  for (const [width, height, label] of [[720, 450, '200% zoom'], [1024, 768, 'tablet']] as const) {
    test(`no sideways page scroll at ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await setTier(page, 'extras');
      for (const [name, url] of ROUTES) {
        await page.goto(url);
        await page.reload();
        await page.waitForTimeout(150);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, name).toBeLessThanOrEqual(0);
        await expect(page.locator('h1').first()).toBeAttached();
      }
    });
  }

  test('panning the map keeps frame times low and does not re-render nodes', async ({ page }, info) => {
    await setTier(page, 'extras');
    await page.goto('/#/map');
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    const svg = (await page.locator('.map-svg').boundingBox())!;
    await page.locator('.map-svg').hover();
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, -200);
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const w = window as unknown as { __frames: number[]; __run: boolean };
      w.__frames = [];
      w.__run = true;
      let last = performance.now();
      const tick = (now: number) => {
        w.__frames.push(now - last);
        last = now;
        if (w.__run) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      const nodes = document.querySelectorAll('[data-node]');
      (window as unknown as { __mut: number }).__mut = 0;
      new MutationObserver((m) => ((window as unknown as { __mut: number }).__mut += m.length)).observe(nodes[0], { attributes: true, subtree: true });
    });
    const y = svg.y + svg.height / 2;
    await page.mouse.move(svg.x + 900, y);
    await page.mouse.down();
    for (let i = 0; i < 90; i += 1) {
      await page.mouse.move(svg.x + 900 - i * 7, y);
      await page.waitForTimeout(8);
    }
    const stats = await page.evaluate(() => {
      const w = window as unknown as { __frames: number[]; __run: boolean; __mut: number };
      w.__run = false;
      const f = w.__frames.slice(2).sort((a, b) => a - b);
      return { frames: f.length, median: f[Math.floor(f.length / 2)], p95: f[Math.floor(f.length * 0.95)], mutations: w.__mut };
    });
    await page.mouse.up();
    console.log(`pan frame stats (${info.project.name}):`, JSON.stringify(stats));
    // Ninety drag steps must not touch node attributes on each step; a stray hover may land once.
    expect(stats.mutations).toBeLessThan(5);
    expect(stats.median).toBeLessThan(20);
  });
});

const FINAL_TIER: Record<string, Tier> = { sg0: 'sg0', endings: 'sg_ending', compare: 'sg_ending' };
for (const [name, url] of ROUTES) {
  test(`final screenshot: ${name}`, async ({ page }, info) => {
    await setTier(page, FINAL_TIER[name] ?? (name === 'map' || name === 'follow' ? 'extras' : 'premise'));
    await page.goto(url);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: shot('final', name, info.project.name), fullPage: name !== 'map' && name !== 'follow' });
  });
}
