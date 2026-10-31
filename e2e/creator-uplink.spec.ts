import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { force3d } from './helpers';

const ok = { status: 200, contentType: 'application/json', body: '{"success":true,"message":"SIGNAL TRANSMITTED"}' };

/** Records every call to the service, answering with `reply`. */
async function serve(page: Page, reply: (body: Record<string, string>) => Parameters<import('@playwright/test').Route['fulfill']>[0] | 'drop' = () => ok) {
  const calls: Array<Record<string, string>> = [];
  await page.route('**/api/uplink', async (route) => {
    const body = route.request().postDataJSON();
    calls.push(body);
    const answer = reply(body);
    await (answer === 'drop' ? route.abort() : route.fulfill(answer));
  });
  return calls;
}

const opener = (page: Page) => page.getByRole('button', { name: 'Creator Uplink' });
const panel = (page: Page) => page.getByRole('dialog', { name: 'CREATOR UPLINK' });

test('one icon on every page, and no request until send', async ({ page }) => {
  const calls = await serve(page);
  for (const route of ['#/', '#/map', '#/follow', '#/mechanics', '#/compare', '#/glossary']) {
    await page.goto(route);
    await expect(opener(page)).toHaveCount(1);
  }
  await opener(page).click();
  await page.getByLabel('Your message').fill('typing is not sending');
  expect(calls).toEqual([]);
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(panel(page)).toHaveCount(0);
  expect(calls).toEqual([]);
});

test('a one-click ping is delivered and confirmed', async ({ page }) => {
  const calls = await serve(page);
  await page.goto('#/');
  await opener(page).click();
  await page.getByRole('button', { name: 'TRANSMIT SIGNAL' }).click();
  await expect(page.getByRole('status')).toContainText('SIGNAL TRANSMITTED');
  expect(calls).toEqual([{ message: '', contactMethod: 'none', contact: '', website: '' }]);
});

test('a bad email stays local, and a failure keeps the words for a retry', async ({ page }) => {
  let down = true;
  const calls = await serve(page, () => (down ? 'drop' : ok));
  await page.goto('#/');
  await opener(page).click();
  await page.getByLabel('Your message').fill('Hello');
  await page.getByRole('button', { name: 'Email' }).click();
  const contact = page.getByLabel('Your email or preferred contact');
  await contact.fill('nope');
  await page.getByRole('button', { name: 'TRANSMIT SIGNAL' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Please check your information' })).toBeVisible();
  expect(calls).toEqual([]);

  await contact.fill('visitor@example.com');
  await page.getByRole('button', { name: 'TRANSMIT SIGNAL' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to transmit' })).toBeVisible();
  await expect(page.getByLabel('Your message')).toHaveValue('Hello');
  await expect(contact).toHaveValue('visitor@example.com');

  down = false;
  await page.getByRole('button', { name: 'TRANSMIT SIGNAL' }).click();
  await expect(page.getByRole('status')).toContainText('SIGNAL TRANSMITTED');
  expect(calls.at(-1)).toEqual({ message: 'Hello', contactMethod: 'email', contact: 'visitor@example.com', website: '' });
});

test('service answers become clear messages', async ({ page }) => {
  const answers: Array<[number, string]> = [[429, 'too many signals'], [403, 'could not be accepted'], [502, 'temporarily unavailable']];
  let turn = 0;
  await serve(page, () => ({ status: answers[turn][0], contentType: 'application/json', body: '{"success":false,"error":"X","retryAfter":60}' }));
  await page.goto('#/');
  await opener(page).click();
  for (; turn < answers.length; turn += 1) {
    await page.getByRole('button', { name: 'TRANSMIT SIGNAL' }).click();
    await expect(page.getByRole('alert').filter({ hasText: answers[turn][1] })).toBeVisible();
  }
});

test('works by keyboard, keeps focus inside and hands it back', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard flow');
  await page.goto('#/');
  await opener(page).focus();
  await expect(page.locator('.uplink-label')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(panel(page)).toBeVisible();
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('.uplink-panel') && (document.activeElement as HTMLInputElement).name !== 'website')).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(opener(page)).toBeFocused();
});

test('clicking outside closes it and keeps the draft', async ({ page }) => {
  await page.goto('#/');
  await opener(page).click();
  await page.getByLabel('Your message').fill('Draft');
  await page.mouse.click(5, 300);
  await expect(panel(page)).toHaveCount(0);
  await opener(page).click();
  await expect(page.getByLabel('Your message')).toHaveValue('Draft');
});

test('fits the screen and passes accessibility checks', async ({ page }) => {
  await page.goto('#/');
  await opener(page).click();
  await expect(panel(page)).toBeVisible();
  await page.waitForTimeout(250);
  const size = page.viewportSize()!;
  const box = (await panel(page).boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(size.width);
  expect(box.y + box.height).toBeLessThanOrEqual(size.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const { violations } = await new AxeBuilder({ page }).include('.uplink').analyze();
  expect(violations).toEqual([]);
});

test('the content policy blocks nothing the site uses', async ({ page }) => {
  await force3d(page);
  const blocked: string[] = [];
  page.on('console', (message) => {
    if (message.text().includes('Content Security Policy')) blocked.push(message.text());
  });
  for (const route of ['#/', '#/map', '#/follow', '#/characters', '#/mechanics']) {
    await page.goto(route);
    await page.waitForTimeout(800);
  }
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').count()).toBe(1);
  expect(blocked).toEqual([]);
});

test('reduced motion stills the signal ring', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#/');
  await expect(page.locator('.uplink')).toHaveClass(/is-still/);
  await opener(page).click();
  await expect(panel(page)).toHaveCSS('animation-name', 'none');
});
