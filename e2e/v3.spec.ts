import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { setTier } from './helpers';

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
  await expect(page.getByRole('dialog')).toContainText(wording.version);
});

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
