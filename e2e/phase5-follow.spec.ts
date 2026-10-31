import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { setTier, shot, type Tier } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const canon = JSON.parse(readFileSync('data/canon.json', 'utf8'));
const order: Tier[] = ['premise', 'sg_part1', 'sg_part2', 'sg_ending', 'sg0', 'extras'];
const above = (t: string, tier: Tier) => order.indexOf(t as Tier) > order.indexOf(tier);

for (const tier of order) {
  test(`stepping at ${tier} never shows a higher-tier event`, async ({ page }) => {
    test.setTimeout(90_000);
    // Reduced motion shows the chart, whose node ids are checked below.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setTier(page, tier);
    await page.goto('/#/follow/1');
    const media = tier === 'sg0' || tier === 'extras' ? ['vn', 'anime', 'sg0_vn', 'sg0_anime'] : ['vn', 'anime'];
    const visible = canon.events.filter((e: Any) => !above(e.spoilerTier, tier) && e.media.some((m: string) => media.includes(m)));
    const locked = canon.events.filter((e: Any) => above(e.spoilerTier, tier)).map((e: Any) => e.title);
    for (let i = 0; i < visible.length; i += 1) {
      const text = await page.getByTestId('narration').textContent();
      for (const title of locked) expect(text, title).not.toContain(title);
      const nodes = await page.locator('[data-node]').evaluateAll((els) => els.map((e) => e.getAttribute('data-node')));
      for (const id of nodes) expect(canon.events.find((e: Any) => e.id === id && above(e.spoilerTier, tier))).toBeUndefined();
      await page.keyboard.press('ArrowRight');
    }
    if (tier !== 'extras' && tier !== 'sg0') await expect(page.getByTestId('tier-wall')).toBeVisible();
  });
}

test('narration comes from canon, with unlocked reveals appended', async ({ page }) => {
  await setTier(page, 'sg_part2');
  await page.goto('/#/follow/1');
  const first = canon.events.find((e: Any) => e.id === 'ev-0728-arrival');
  await expect(page.getByTestId('narration')).toContainText(first.title);
  await expect(page.getByTestId('narration')).toContainText(first.summary);
  await expect(page.getByTestId('narration')).toContainText(`Later you learn: ${first.reveals[0].text}`);
});

test('keyboard controls and saved progress', async ({ page }) => {
  await page.goto('/#/follow/1');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/follow\/3/);
  await page.keyboard.press('End');
  await expect(page.getByTestId('tier-wall')).toBeVisible();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.goto('/#/');
  await page.goto('/#/follow');
  await expect(page.getByTestId('narration')).toContainText(canon.events.find((e: Any) => e.seq === 2).title);
});

test('play advances on its own', async ({ page }) => {
  // The faked clock fires thousands of frames at once, too many for the 3D views.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/#/follow/1');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.clock.runFor(9000);
  await expect(page).toHaveURL(/follow\/2/);
});

test('the first D-Mail offers its mechanic inline', async ({ page }) => {
  await page.goto('/#/follow/5');
  await page.getByRole('button', { name: 'Watch how this works' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByTestId('caption')).toHaveText(canon.mechanics[0].steps[0].caption);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('screenshots of three steps', async ({ page }, info) => {
  await setTier(page, 'sg_ending');
  for (const step of [5, 14, 36]) {
    await page.goto(`/#/follow/${step}`);
    await page.reload();
    await page.waitForTimeout(1300);
    await page.screenshot({ path: shot('phase-5', `follow-${step}`, info.project.name) });
  }
});
