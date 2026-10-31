import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreatorUplink } from '../src/components/CreatorUplink';

const answer = (status: number, body: object) => new Response(JSON.stringify(body), { status });

function openPanel() {
  render(<CreatorUplink />);
  fireEvent.click(screen.getByRole('button', { name: 'Creator Uplink' }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  delete window.turnstile;
});

describe('support link', () => {
  it('stays away until it has somewhere to go', () => {
    openPanel();
    expect(screen.queryByRole('link', { name: 'Support World Line' })).toBeNull();
  });

  it('opens safely in a new tab once set', () => {
    vi.stubEnv('VITE_SUPPORT_URL', 'https://example.com/support');
    openPanel();
    const link = screen.getByRole('link', { name: 'Support World Line' });
    expect(link).toHaveAttribute('href', 'https://example.com/support');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('human check', () => {
  const refused = { success: false, error: 'RATE_LIMITED', retryAfter: 50, challenge: true };

  it('runs after a refusal and resends by itself with the token', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key');
    const render = vi.fn((_host: HTMLElement, options: Record<string, unknown>) => {
      queueMicrotask(() => (options.callback as (token: string) => void)('tok'));
      return 'widget';
    });
    window.turnstile = { render, remove: vi.fn() };
    const post = vi.fn<typeof fetch>().mockResolvedValueOnce(answer(429, refused)).mockResolvedValueOnce(answer(200, { success: true }));
    vi.stubGlobal('fetch', post);
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'TRANSMIT SIGNAL' }));
    await screen.findByText('SIGNAL TRANSMITTED');
    expect(render.mock.calls[0][1].sitekey).toBe('site-key');
    expect(JSON.parse(post.mock.calls[0][1]?.body as string).turnstileToken).toBeUndefined();
    expect(JSON.parse(post.mock.calls[1][1]?.body as string).turnstileToken).toBe('tok');
  });

  it('falls back to the wait message without a site key', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(answer(429, refused)));
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'TRANSMIT SIGNAL' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('too many signals'));
  });

  it('falls back to the wait message when the check cannot load', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key');
    window.turnstile = {
      render: (_host, options) => {
        queueMicrotask(() => (options['error-callback'] as () => void)());
        return 'widget';
      },
      remove: vi.fn(),
    };
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(answer(429, refused)));
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'TRANSMIT SIGNAL' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('too many signals'));
  });
});
