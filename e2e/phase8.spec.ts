import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { setTier, shot, type Tier } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const canon = JSON.parse(readFileSync('data/canon.json', 'utf8'));

test('S;G 0 is locked below sg0', async ({ page }) => {
  for (const url of ['/#/sg0']) {
    await page.goto(url);
    await expect(page.getByText("Steins;Gate 0: the sequel's branch")).toBeVisible();
    const html = await page.content();
    expect(html).not.toContain(canon.sg0Branch.description);
    expect(html).not.toContain('Gehenna');
  }
});

test.describe('at sg0', () => {
  test.beforeEach(async ({ page }) => {
    await setTier(page, 'sg0');
    await page.goto('/#/sg0');
  });

  test('the fork, tiles, tree and lists come from canon', async ({ page }) => {
    await expect(page.getByText(canon.sg0Branch.description.slice(0, 60))).toBeVisible();
    await page.getByRole('tab', { name: 'Endings' }).click();
    for (const ending of canon.sg0Branch.endings) await expect(page.locator('.ending-tile').filter({ has: page.getByRole('heading', { name: ending.name }) })).toBeVisible();
    await expect(page.locator('.ending-tile').filter({ has: page.getByRole('heading', { name: 'Milky-way Crossing' }) })).toContainText('No value listed');
    await expect(page.getByRole('heading', { name: 'VN choice tree (simplified)' })).toBeVisible();
    await page.getByRole('tab', { name: 'Lines' }).click();
    await expect(page.getByText('Route links not mapped').first()).toBeVisible();
    await page.getByRole('tab', { name: 'Anime and VN' }).click();
    for (const item of canon.sg0Branch.animeVsVn.slice(0, 3)) await expect(page.getByText(item.text)).toBeVisible();
  });

  test('every VN ending sits on the tree with its route text verbatim', async ({ page }) => {
    await page.getByRole('tab', { name: 'Endings' }).click();
    const tree = page.locator('.choice-leaf');
    for (const e of canon.sg0Branch.endings) await expect(tree.filter({ has: page.getByText(`${e.name}:`, { exact: true }) })).toContainText(e.howToReach);
  });

  test('the loop-back has a text alternative', async ({ page }, info) => {
    await expect(page.getByText(canon.sg0Branch.reconnection.description)).toBeVisible();
    const list = page.getByRole('list', { name: 'The loop back, step by step' });
    await expect(list.locator('li')).toHaveCount(3);
    await page.waitForTimeout(4200);
    await page.screenshot({ path: shot('phase-8', 'sg0', info.project.name), fullPage: true });
  });
});

const PAGES: Array<[string, string, Tier]> = [
  ['endings', '/#/endings', 'sg_ending'],
  ['characters', '/#/characters', 'sg_part2'],
  ['character', '/#/characters/suzuha', 'sg_ending'],
  ['works', '/#/works', 'sg_ending'],
  ['disputes', '/#/disputes', 'sg_part2'],
  ['about', '/#/about', 'premise'],
];
for (const [name, url, tier] of PAGES) {
  test(`screenshot ${name}`, async ({ page }, info) => {
    await setTier(page, tier);
    await page.goto(url);
    await page.waitForTimeout(300);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: shot('phase-8', name, info.project.name) });
  });
}

test('endings lock below sg_ending', async ({ page }) => {
  await page.goto('/#/endings');
  await expect(page.getByText('later in the story')).toBeVisible();
  expect(await page.content()).not.toContain(canon.endings[0].outcome);
});

test('a premise character page holds no later content', async ({ page }) => {
  await page.goto('/#/characters/daru');
  const html = (await page.content()).replace(/<script[\s\S]*?<\/script>/g, '');
  for (const text of ['Suzuha', 'Barrel Titor', 'Alpha', 'Kagari', 'sg0_vn']) expect(html, text).not.toContain(text);
});

test('later characters do not appear at premise', async ({ page }) => {
  await page.goto('/#/characters');
  const html = await page.content();
  for (const c of canon.characters.filter((x: Any) => x.firstSpoilerTier !== 'premise')) expect(html, c.name).not.toContain(c.name);
});

test('works hides the disputed episode titles and locked placements', async ({ page }) => {
  await page.goto('/#/works');
  const html = await page.content();
  expect(html).not.toContain('Divide by Zero');
  expect(html).not.toContain('Open the Missing Link');
  expect(html).not.toContain(canon.works.find((w: Any) => w.id === 'work-reboot-gamma').placementInTimeline);
});

test('the about page carries the disclaimer', async ({ page }) => {
  await page.goto('/#/about');
  await expect(page.getByText('An unofficial fan explainer')).toBeVisible();
  await expect(page.getByText('not affiliated with MAGES.', { exact: false })).toBeVisible();
});
