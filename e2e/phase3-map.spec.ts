import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { setTier, shot, type Tier } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const canon = JSON.parse(readFileSync('data/canon.json', 'utf8'));
const order: Tier[] = ['premise', 'sg_part1', 'sg_part2', 'sg_ending', 'sg0', 'extras'];
const above = (t: string, tier: Tier) => order.indexOf(t as Tier) > order.indexOf(tier);

test('premise tier has only premise content in the DOM', async ({ page }) => {
  const locked: string[] = [
    ...canon.events.filter((e: Any) => above(e.spoilerTier, 'premise')).map((e: Any) => e.title),
    ...canon.worldLines.filter((w: Any) => above(w.spoilerTier, 'premise') && w.divergence).map((w: Any) => w.divergence),
    ...canon.worldLines.filter((w: Any) => above(w.spoilerTier, 'premise')).map((w: Any) => w.label),
    ...canon.characters.filter((c: Any) => above(c.firstSpoilerTier, 'premise')).map((c: Any) => c.name),
    'Suzuha', 'Alpha', 'Beta', 'Amadeus', 'SERN', 'Steins Gate', 'attractor', 'wl-alpha', 'wl-beta',
  ];
  for (const url of ['/#/map', '/#/']) {
    await page.goto(url);
    await page.reload();
    await page.waitForTimeout(300);
    const html = (await page.content()).replace(/<script[\s\S]*?<\/script>/g, '');
    for (const text of locked) expect(html, text).not.toContain(text);
  }
});

test('a deep link to a locked item redirects with a toast', async ({ page }) => {
  await page.goto('/#/map?ev=ev-0813-raid');
  await expect(page.getByText('This part is locked at your current spoiler level')).toBeVisible();
  expect(page.url()).not.toContain('ev-0813-raid');
});

test('rows open a bottom sheet on mobile', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await setTier(page, 'sg_ending');
  await page.goto('/#/map');
  await expect(page.locator('.vrow').first()).toBeVisible();
  await page.locator('.vrow-main').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: shot('phase-3', 'sheet', info.project.name) });
});

test.describe('desktop map', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 768, 'SVG map only');

  test('toggling the axis moves the July 28 rescue attempts', async ({ page }) => {
    await setTier(page, 'sg_ending');
    await page.goto('/#/map');
    const node = page.locator('[data-node="ev-0728-rescue-attempt-1"]');
    await expect(node).toBeAttached();
    await page.waitForTimeout(300);
    const before = (await node.boundingBox())!.x;
    await page.getByRole('button', { name: "Okabe's order" }).click();
    await page.waitForTimeout(900);
    const after = (await node.boundingBox())!.x;
    expect(after - before).toBeGreaterThan(150);
  });

  for (const tier of order) {
    test(`keyboard reaches every visible node at ${tier}`, async ({ page }) => {
      await setTier(page, tier);
      await page.goto('/#/map');
      const nodes = page.locator('[data-node]');
      await expect(nodes.first()).toBeAttached();
      const ids = await nodes.evaluateAll((els) => els.map((e) => e.getAttribute('data-node')!));
      await page.locator('[data-node][tabindex="0"]').first().focus();
      const seen = new Set<string>();
      for (let i = 0; i <= ids.length; i += 1) {
        const id = await page.evaluate(() => document.activeElement?.getAttribute('data-node'));
        if (id) seen.add(id);
        await page.keyboard.press('ArrowRight');
      }
      for (const id of ids) expect(seen.has(id), id).toBe(true);
    });
  }

  test('Enter opens details, Escape closes, S opens sources', async ({ page }) => {
    await page.goto('/#/map');
    await page.locator('[data-node][tabindex="0"]').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.detail-panel')).toBeVisible();
    await page.locator('[data-node]').first().focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('.detail-panel')).toHaveCount(0);
    await page.keyboard.press('s');
    await expect(page.getByRole('dialog', { name: 'Sources' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('anime-only filter collapses the hidden trips', async ({ page }) => {
    await setTier(page, 'sg_ending', ['anime']);
    await page.goto('/#/map');
    await expect(page.locator('[data-edge^="collapsed:"]').first()).toBeAttached();
  });
});

for (const tier of ['premise', 'sg_part2', 'sg_ending', 'extras'] as Tier[]) {
  test(`screenshot map at ${tier}`, async ({ page }, info) => {
    await setTier(page, tier, tier === 'extras' ? ['vn', 'anime', 'sg0_vn', 'sg0_anime', 'other'] : undefined);
    await page.goto('/#/map');
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot('phase-3', `map-${tier}`, info.project.name) });
  });
}

test('screenshot home and detail', async ({ page }, info) => {
  await page.goto('/');
  await page.waitForTimeout(1700);
  await page.screenshot({ path: shot('phase-3', 'home', info.project.name) });
  if (info.project.name === 'desktop') {
    await page.goto('/#/map?ev=ev-0728-first-dmail');
    await page.waitForTimeout(600);
    await page.screenshot({ path: shot('phase-3', 'detail', info.project.name) });
  }
});
