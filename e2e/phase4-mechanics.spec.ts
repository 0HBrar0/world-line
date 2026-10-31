import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { setTier, shot, type Tier } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const canon = JSON.parse(readFileSync('data/canon.json', 'utf8'));
const order: Tier[] = ['premise', 'sg_part1', 'sg_part2', 'sg_ending', 'sg0', 'extras'];
const openAt = (t: string | undefined, tier: Tier) => order.indexOf((t ?? 'premise') as Tier) <= order.indexOf(tier);

test.describe('captions', () => {
  for (const tier of ['premise', 'sg_part2', 'extras'] as Tier[]) {
    test(`every caption equals canon at ${tier}`, async ({ page }) => {
      await setTier(page, tier);
      for (const m of canon.mechanics as Any[]) {
        if (!openAt(m.spoilerTier, tier)) continue;
        await page.goto(`/#/mechanics/${m.id}`);
        await page.reload();
        await expect(page.locator('.player')).toBeAttached();
        const shown = await page.getByTestId('step-text').allTextContents();
        const expected = m.steps.filter((s: Any) => openAt(s.spoilerTier, tier)).map((s: Any) => s.caption);
        expect(shown).toEqual(expected);
        const html = await page.content();
        for (const s of m.steps as Any[]) {
          expect(html).not.toContain(s.visualHint);
          if (!openAt(s.spoilerTier, tier)) expect(html).not.toContain(s.caption);
        }
      }
    });
  }
});

test('a locked mechanic redirects with a toast', async ({ page }) => {
  await page.goto('/#/mechanics/time_leap');
  await expect(page.getByText('This part is locked at your current spoiler level')).toBeVisible();
  expect(page.url()).not.toContain('time_leap');
});

test('reduced motion: no transforms or rolls, and the step list is visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setTier(page, 'extras');
  for (const id of ['dmail', 'time_leap', 'reading_steiner', 'attractor_field', 'divergence_meter', 'time_machine']) {
    await page.goto(`/#/mechanics/${id}`);
    await page.reload();
    await expect(page.locator('.step-list')).toBeVisible();
    const count = await page.locator('.step-dot').count();
    for (let i = 0; i < count; i += 1) {
      await page.locator('.step-dot').nth(i).click();
      await page.waitForTimeout(40);
      const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
      expect(running, `${id} step ${i}`).toBe(0);
      const moving = await page.evaluate(() => [...document.querySelectorAll('.stage [style*="transform"]')].length);
      expect(moving, `${id} step ${i}`).toBe(0);
    }
    await expect(page.getByRole('button', { name: 'Play' })).toBeDisabled();
  }
});

test('the Nixie settles on the canon value', async ({ page }) => {
  await page.goto('/#/mechanics/dmail');
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.locator('.step-dot').nth(5).click();
  await page.waitForTimeout(1300);
  const digits = await page.locator('.stage .tube-digit').allTextContents();
  expect(digits.join('')).toBe(canon.worldLines.find((w: Any) => w.id === 'wl-alpha-0571024').divergence);
});

test('text-only mode hides the stage and shows the list', async ({ page }) => {
  await page.goto('/#/mechanics/dmail');
  await page.getByRole('button', { name: 'Text only' }).click();
  await expect(page.locator('.stage')).toHaveCount(0);
  await expect(page.locator('.step-list')).toBeVisible();
});

test('misconception cards flip', async ({ page }) => {
  await page.goto('/#/mechanics/dmail');
  const card = page.locator('.flip-face').first();
  await card.click();
  await expect(card).toContainText('Actually');
});

test('screenshots of every storyboard frame', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await setTier(page, 'extras');
  const frames = info.project.name === 'desktop' ? canon.mechanics : canon.mechanics.slice(0, 1);
  for (const m of frames as Any[]) {
    await page.goto(`/#/mechanics/${m.id}`);
    await page.reload();
    await page.getByRole('button', { name: 'Pause' }).click();
    for (let i = 0; i < m.steps.length; i += 1) {
      await page.locator('.step-dot').nth(i).click();
      await page.waitForTimeout(650);
      await page.locator('.player').screenshot({ path: shot('phase-4', `${m.id}-${i + 1}`, info.project.name) });
    }
  }
  await page.goto('/#/mechanics');
  await page.reload();
  await page.screenshot({ path: shot('phase-4', 'index', info.project.name) });
});
