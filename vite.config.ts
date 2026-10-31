import { defineConfig } from 'vitest/config';
import { loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const CLOUDFLARE = 'https://challenges.cloudflare.com';
const ANALYTICS_SCRIPT = 'https://static.cloudflareinsights.com';
const ANALYTICS_REPORT = 'https://cloudflareinsights.com';

/** Added to built pages only, because the dev server needs inline scripts. */
function contentPolicy(uplinkUrl: string): Plugin {
  const policy = [
    `default-src 'self'`,
    `script-src 'self' ${CLOUDFLARE} ${ANALYTICS_SCRIPT}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${uplinkUrl} ${CLOUDFLARE} ${ANALYTICS_REPORT}`,
    `frame-src ${CLOUDFLARE}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'none'`,
  ].join('; ');
  return {
    name: 'content-policy',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' }],
  };
}

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), contentPolicy(loadEnv(mode, process.cwd(), 'VITE_').VITE_UPLINK_URL ?? '')],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    globals: false,
  },
}));
