import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { setTier, shot } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const canon = JSON.parse(readFileSync('data/canon.json', 'utf8'));

test.describe('compare', () => {
  test('characters absent from aliveDead show a dash and nothing is inferred', async ({ page }, info) => {
    await setTier(page, 'sg_ending');
    await page.goto('/#/compare?lines=wl-0571024,wl-1130212,wl-sg-1048596');
    const kurisu = page.getByRole('row', { name: /Kurisu Makise/ });
    await expect(kurisu.getByTestId('fate-none')).toHaveCount(1);
    await expect(kurisu.locator('td').nth(1)).toHaveText('—');
    await expect(page.getByRole('heading', { name: 'Path between these lines' })).toBeVisible();
    await page.waitForTimeout(800);
    await page.screenshot({ path: shot('phase-6', 'compare', info.project.name), fullPage: true });
  });

  test('a low tier hides fates that are tiered higher', async ({ page }) => {
    await page.goto('/#/compare?lines=wl-1130426,wl-0571024');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('row', { name: /Mayuri/ })).toHaveCount(0);
    expect(await page.content()).not.toContain('Alpha');
  });

  test('lines with no mapped path say so', async ({ page }) => {
    await setTier(page, 'sg0');
    await page.goto('/#/compare?lines=wl-1081163,wl-sg-1048596');
    await expect(page.getByTestId('no-path')).toHaveText('No mapped path (see open questions)');
  });

  test('a locked line in the URL redirects', async ({ page }) => {
    await page.goto('/#/compare?lines=wl-sg-1048596');
    await expect(page.getByText('This part is locked at your current spoiler level')).toBeVisible();
    expect(page.url()).not.toContain('1048596');
  });

  test('the picker adds a line', async ({ page }) => {
    await page.goto('/#/compare');
    await page.getByRole('checkbox', { name: '0.571024' }).check();
    await page.getByRole('checkbox', { name: '1.130426' }).check();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page).toHaveURL(/lines=wl-0571024,wl-1130426/);
  });
});

test.describe('glossary', () => {
  test('searching a locked term returns nothing at a low tier', async ({ page }, info) => {
    await page.goto('/#/glossary');
    const search = page.getByLabel('Search terms');
    for (const term of ['Amadeus', 'Rounders', 'Steins Gate world line', 'Time Leap Machine']) {
      await search.fill(term);
      await expect(page.getByTestId('glossary-results').locator('li')).toHaveCount(0);
    }
    await search.fill('D-Mail');
    await expect(page.getByTestId('glossary-results').locator('li').first()).toContainText('D-Mail');
    await search.fill('');
    await page.waitForTimeout(100);
    await page.screenshot({ path: shot('phase-7', 'glossary', info.project.name) });
  });

  test('the same search finds it at a high tier', async ({ page }) => {
    await setTier(page, 'sg0');
    await page.goto('/#/glossary');
    await page.getByLabel('Search terms').fill('Amadeus');
    await expect(page.getByTestId('glossary-results').locator('li').first()).toContainText('Amadeus');
  });

  test('close spellings match', async ({ page }) => {
    await page.goto('/#/glossary');
    await page.getByLabel('Search terms').fill('Steiner');
    await expect(page.getByTestId('glossary-results')).toContainText('Reading Steiner');
    await page.getByLabel('Search terms').fill('Stainer');
    await expect(page.getByTestId('glossary-results')).toContainText('Reading Steiner');
  });

  test('entry page shows plain language first and hides locked related terms', async ({ page }, info) => {
    await page.goto('/#/glossary/gl-phonewave');
    const entry = canon.glossary.find((g: Any) => g.id === 'gl-phonewave');
    await expect(page.locator('.lede')).toHaveText(entry.plainLanguage);
    expect(await page.content()).not.toContain('Time Leap Machine');
    await page.screenshot({ path: shot('phase-7', 'entry', info.project.name) });
  });

  test('a locked entry redirects', async ({ page }) => {
    await page.goto('/#/glossary/gl-amadeus');
    await expect(page.getByText('This part is locked at your current spoiler level')).toBeVisible();
    expect(page.url()).not.toContain('amadeus');
  });

  test('the real-world entry is tagged', async ({ page }) => {
    await page.goto('/#/glossary/gl-john-titor-real-world');
    await expect(page.getByText('Real world').first()).toBeVisible();
  });

  test('term cards open on focus and close on Escape', async ({ page }) => {
    await page.goto('/#/');
    const term = page.locator('.term-link').first();
    await term.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(term).toHaveAttribute('aria-describedby', /.+/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });
});
