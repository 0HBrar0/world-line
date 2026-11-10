import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setTier, showSources } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const canon = JSON.parse(readFileSync('data/canon.json', 'utf8'));
const event = (id: string) => canon.events.find((e: Any) => e.id === id);
const glossary = (id: string) => canon.glossary.find((g: Any) => g.id === id);

test('the chronicle numbers each jump and names what it moved', async ({ page }) => {
  await setTier(page, 'sg_part1');
  await page.goto('/#/follow/1');
  const first = page.locator('.band').first();
  await expect(first).toHaveClass(/band-dmail/);
  await expect(first.locator('.band-no')).toContainText('01');
  await expect(first).toContainText(event('ev-0728-first-dmail').title);
  await expect(first.getByRole('img', { name: 'Divergence 1.130426' })).toBeVisible();
  await expect(first.getByRole('img', { name: 'Divergence 0.571024' })).toBeVisible();
  await expect(page.locator('.band-dmail .band-no')).toHaveCount(6);
});

test('a time leap is a band that stays on its world line', async ({ page }) => {
  await setTier(page, 'sg_part2');
  await page.goto('/#/follow/1');
  const leap = page.locator('li.band.band-time_leap');
  await expect(leap).toContainText(event('ev-0813-time-leap-loop').title);
  await expect(leap).toContainText('Same world line');
});

test('jump kinds the visitor has not reached stay out of the legend', async ({ page }) => {
  await page.goto('/#/follow/1');
  await expect(page.locator('.jump-legend li')).toHaveText(['D-Mail']);
  const html = await page.content();
  expect(html).not.toContain('Time leap');
  expect(html).not.toContain('Time machine');
});

test('the story clock shows a sourced time and leaves vague ones without hands', async ({ page }) => {
  await page.goto('/#/follow/1');
  await expect(page.locator('.now-clock .clock-hand')).toHaveCount(2);
  await expect(page.locator('.now-clock')).toContainText('11:43');
  await page.goto('/#/follow/6');
  await expect(page.locator('.now-clock .clock-hand')).toHaveCount(0);
});

test('reading a D-Mail from its band opens the file', async ({ page }) => {
  await page.goto('/#/follow/5');
  await page.getByRole('button', { name: 'Read the D-Mail' }).click();
  await expect(page.getByRole('dialog')).toContainText(event('ev-0728-first-dmail').summary);
  const wording = event('ev-0728-first-dmail').dmailText;
  await expect(page.getByRole('dialog').locator('blockquote')).toHaveText(wording.text);
  // Which translation it is counts as a source note, so it waits for the Sources switch.
  await expect(page.getByRole('dialog')).not.toContainText(wording.version);
});

test('source notes are off until the visitor switches them on', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('.badge')).toHaveCount(0);
  await expect(page.locator('.legend')).toHaveCount(0);
  const toggle = page.getByRole('button', { name: 'Sources', exact: true });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.home-grid .badge').first()).toBeVisible();
  // The choice is kept for the next visit.
  await page.reload();
  await expect(page.locator('.home-grid .badge').first()).toBeVisible();
});

test('a D-Mail file keeps its source notes for the Sources switch', async ({ page }) => {
  const first = event('ev-0728-first-dmail');
  await page.goto('/#/follow/5');
  await page.getByRole('button', { name: 'Read the D-Mail' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('blockquote')).toHaveText(first.dmailText.text);
  await expect(dialog).not.toContainText('Where sources disagree');
  await expect(dialog.locator('.badge')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Sources', exact: true }).click();
  await page.getByRole('button', { name: 'Read the D-Mail' }).click();
  await expect(dialog).toContainText(first.dmailText.version);
  await expect(dialog).toContainText('Where sources disagree');
  await expect(dialog).toContainText(first.conflicts[0].claim);
});

for (const url of ['/#/', '/#/follow/5', '/#/dmails', '/#/map']) {
  test(`with sources on, ${url} passes accessibility checks`, async ({ page }) => {
    await showSources(page);
    await page.goto(url);
    await page.waitForTimeout(800);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
}

test('D-Mail wording from later in the story stays out of the page', async ({ page }) => {
  await page.goto('/#/dmails');
  const html = await page.content();
  expect(html).not.toContain(event('ev-0804-dmail-moeka').dmailText.text);
  expect(html).not.toContain(event('ev-0815-undo-luka').dmailText.text);
});

test('typing a divergence value tunes the map to that world line', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await page.keyboard.type('0.571024');
  await expect(page).toHaveURL(/#\/map\?wl=wl-0571024/);
});

test('a value from later in the story does nothing', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await page.keyboard.type('1.048596');
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(/#\/glossary$/);
});

test('the lab motto opens its glossary entry', async ({ page }) => {
  await page.goto('/#/about');
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await page.keyboard.type('El Psy Kongroo');
  await expect(page).toHaveURL(/glossary\/gl-el-psy-kongroo/);
});

test('typing in a text box never sets a secret off', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.locator('#glossary-search').fill('');
  await page.locator('#glossary-search').pressSequentially('0.571024');
  await expect(page).toHaveURL(/#\/glossary/);
});

test('things on the lab bench open their glossary note', async ({ page }) => {
  await page.goto('/#/');
  const entry = glossary('gl-gel-banana');
  await page.getByRole('button', { name: entry.term }).click();
  await expect(page.locator('.bench-note')).toContainText(entry.plainLanguage);
  await expect(page.locator('.lab-banana')).toHaveClass(/is-gel/);
});

test('reduced motion gets no static and no turning gears', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/follow/4');
  await expect(page.getByTestId('narration')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/follow\/5/);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/follow\/6/);
  await expect(page.locator('.blip')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  expect(await page.locator('.backdrop .gear-spin').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test.describe('the rope map', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 768, 'SVG map only');

  test('opens in the order lived, with one numbered hop on the red strand', async ({ page }) => {
    await page.goto('/#/map');
    await expect(page.getByRole('button', { name: "Okabe's order" })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.thread').first()).toBeAttached();
    await expect(page.locator('[data-edge] .hop-mark text')).toHaveText(['01']);
    await expect(page.locator('.map-node.is-latest')).toHaveCount(1);
    const key = page.getByRole('list', { name: 'How to read the map' });
    await expect(key).toContainText('Red strand');
    // Ropes and knots belong to a later part of the story, so the key does not name them yet.
    await expect(key).not.toContainText('knot');
    await expect(page.locator('.rope-knot')).toHaveCount(0);
  });

  test('hops are numbered the way the Chronicle numbers them', async ({ page }) => {
    await setTier(page, 'sg_part2');
    await page.goto('/#/map');
    const marks = await page.locator('[data-edge] .hop-mark text').allTextContents();
    expect(marks.filter((m) => m === '01')).toHaveLength(2);
    expect(marks).toContain('06');
    await expect(page.locator('[data-edge] .hop-mark.is-hollow')).toHaveCount(4);
  });

  test('from part 2 each rope ends in a knot that opens its glossary entry', async ({ page }) => {
    await setTier(page, 'sg_part2');
    await page.goto('/#/map');
    await expect(page.locator('.rope-knot')).toHaveCount(2);
    await expect(page.getByRole('list', { name: 'How to read the map' })).toContainText('Rope and knot');
    await page.locator('[data-knot="alpha"]').hover();
    await expect(page.locator('.hover-card')).toContainText(glossary('gl-alpha-field').plainLanguage);
    await page.locator('[data-knot="alpha"]').click();
    await expect(page).toHaveURL(/glossary\/gl-alpha-field/);
  });

  test('an ending off the main path is a dotted hop', async ({ page }) => {
    await setTier(page, 'sg_ending');
    await page.goto('/#/map');
    await expect(page.locator('.map-edge.is-branch')).not.toHaveCount(0);
    await expect(page.getByRole('list', { name: 'How to read the map' })).toContainText('Free thread');
  });
});

test.describe('motion', () => {
  test('the clockwork behind the page turns, and keeps still when motion is off', async ({ page }) => {
    await page.goto('/#/glossary');
    const wheels = page.locator('.backdrop .bd-wheel.gear-spin');
    expect(await wheels.count()).toBeGreaterThan(8);
    expect(await wheels.first().evaluate((el) => getComputedStyle(el).animationName)).toBe('gear-turn');
    // The page colour must not be painted over the clockwork.
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    expect(await wheels.first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    expect(await page.locator('main h1').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });

  test('the reading thread grows as a long page is scrolled', async ({ page }) => {
    await setTier(page, 'sg_part2');
    await page.goto('/#/glossary');
    const thread = page.locator('.reading-thread');
    const scale = () => thread.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(await scale()).toBe(0);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(scale).toBeGreaterThan(0.95);
  });

  test('a D-Mail file shows the message leaving, as decoration only', async ({ page }) => {
    await page.goto('/#/dmails');
    await expect(page.locator('.dmail-send').first()).toHaveAttribute('aria-hidden', 'true');
  });
});
