import { defineConfig } from '@playwright/test';

// Chromium is installed inside node_modules so nothing lands outside the project.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= '0';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: 4,
  timeout: 45_000,
  reporter: [['line']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    screenshot: 'off',
    // Every test starts past the first-visit device notice; device-notice.spec.ts covers it.
    storageState: { cookies: [], origins: [{ origin: 'http://localhost:4173', localStorage: [{ name: 'wl.deviceNotice', value: 'true' }] }] },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
