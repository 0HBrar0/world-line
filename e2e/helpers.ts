import type { Page } from '@playwright/test';

export type Tier = 'premise' | 'sg_part1' | 'sg_part2' | 'sg_ending' | 'sg0' | 'extras';

/** Starts the app at a spoiler level by seeding the stored setting before load. */
export async function setTier(page: Page, tier: Tier, media?: string[]) {
  await page.addInitScript(
    ([t, m]) => {
      window.localStorage.setItem('wl.tier', JSON.stringify(t));
      if (m) window.localStorage.setItem('wl.media', JSON.stringify(m));
      else if (t === 'sg0' || t === 'extras') window.localStorage.setItem('wl.media', JSON.stringify(['vn', 'anime', 'sg0_vn', 'sg0_anime']));
    },
    [tier, media ?? null] as const,
  );
}

export const shot = (phase: string, name: string, project: string) => `e2e/__screenshots__/${phase}/${name}-${project}.png`;
