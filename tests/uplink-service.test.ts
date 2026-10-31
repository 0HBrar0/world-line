// @vitest-environment node
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUplink, type UplinkConfig } from '../uplink-service/app';
import { createLimits } from '../uplink-service/limits';

const ORIGIN = 'https://0hbrar0.github.io';
const NOON = Date.UTC(2026, 9, 31, 12);
const ping = { message: '', contactMethod: 'none', contact: '', website: '' };

let server: Server;
let base: string;
let clock: number;
const ntfy = vi.fn<typeof fetch>();

async function start(overrides: Partial<UplinkConfig> = {}) {
  server = createServer(
    createUplink({ ntfyBaseUrl: 'https://ntfy.test/', ntfyTopic: 'private topic', ntfyToken: 'tok', allowedOrigins: [ORIGIN], trustProxy: false, fetch: ntfy, now: () => clock, ...overrides }),
  );
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${base}/api/uplink`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });

beforeEach(async () => {
  clock = NOON;
  ntfy.mockReset();
  ntfy.mockResolvedValue(new Response('{}'));
  await start();
});
afterEach(() => new Promise((done) => server.close(done)));

describe('POST /api/uplink', () => {
  it('delivers an anonymous ping and confirms only after ntfy accepts', async () => {
    const res = await post(ping);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: 'SIGNAL TRANSMITTED' });
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    const [url, init] = ntfy.mock.calls[0];
    expect(url).toBe('https://ntfy.test/private%20topic');
    expect(init?.body).toBe('NEW TRANSMISSION\n\nType: Anonymous Ping\nMessage: No message provided.\nContact: Not provided');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    expect((init?.headers as Record<string, string>).Title).toBe('WORLD LINE | CREATOR UPLINK');
  });

  it('passes the message and contact on as plain text', async () => {
    await post({ message: '  <b>hi</b> **there**  ', contactMethod: 'email', contact: 'visitor@example.com', website: '' });
    expect(ntfy.mock.calls[0][1]?.body).toBe('NEW TRANSMISSION\n\nType: Message\nMessage:\n<b>hi</b> **there**\n\nContact method: Email\nContact: visitor@example.com');
  });

  it.each([
    ['unknown field', { ...ping, extra: 1 }],
    ['missing field', { message: '', contactMethod: 'none', contact: '' }],
    ['wrong type', { ...ping, message: 5 }],
    ['unknown method', { ...ping, contactMethod: 'phone' }],
    ['long message', { ...ping, message: 'x'.repeat(501) }],
    ['long contact', { ...ping, contactMethod: 'other', contact: 'x'.repeat(255) }],
    ['contact without a method', { ...ping, contact: 'a@b.co' }],
    ['bad email', { ...ping, contactMethod: 'email', contact: 'nope' }],
    ['empty other contact', { ...ping, contactMethod: 'other', contact: '  ' }],
    ['malformed JSON', '{oops'],
    ['an array', '[]'],
  ])('rejects %s without using an allowance', async (_name, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'INVALID_REQUEST' });
    expect((await post(ping)).status).toBe(200);
  });

  it('turns away a filled honeypot without contacting ntfy or using an allowance', async () => {
    const res = await post({ ...ping, website: 'bot' });
    expect(res.status).toBe(403);
    expect(ntfy).not.toHaveBeenCalled();
    expect((await post(ping)).status).toBe(200);
  });

  it('checks origin, method, content type and size', async () => {
    expect((await post(ping, { Origin: 'https://evil.example' })).status).toBe(403);
    expect((await post(ping, { 'Content-Type': 'text/plain' })).status).toBe(415);
    expect((await fetch(`${base}/api/uplink`)).status).toBe(405);
    const big = await post({ ...ping, message: 'x'.repeat(5000) });
    expect(big.status).toBe(413);
    expect(await big.json()).toEqual({ success: false, error: 'PAYLOAD_TOO_LARGE' });
  });

  it('answers the preflight for approved origins only', async () => {
    const yes = await fetch(`${base}/api/uplink`, { method: 'OPTIONS', headers: { Origin: ORIGIN } });
    expect(yes.status).toBe(204);
    expect(yes.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(yes.headers.get('access-control-allow-credentials')).toBeNull();
    expect((await fetch(`${base}/api/uplink`, { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } })).status).toBe(403);
  });

  it('never claims delivery when ntfy fails, and does not retry or refund', async () => {
    ntfy.mockResolvedValueOnce(new Response('', { status: 500 }));
    const refused = await post(ping);
    expect(refused.status).toBe(502);
    expect(await refused.json()).toEqual({ success: false, error: 'NOTIFICATION_FAILED' });
    expect(ntfy).toHaveBeenCalledTimes(1);
    expect((await post(ping)).status).toBe(429);

    clock += 60_000;
    ntfy.mockRejectedValueOnce(new DOMException('slow', 'TimeoutError'));
    const slow = await post(ping);
    expect(slow.status).toBe(504);
    expect(await slow.json()).toEqual({ success: false, error: 'NOTIFICATION_TIMEOUT' });
  });

  it('logs nothing personal', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    ntfy.mockRejectedValueOnce(new Error('https://ntfy.test/private%20topic failed'));
    await post({ message: 'secret words', contactMethod: 'email', contact: 'visitor@example.com', website: '' });
    expect(log.mock.calls.join()).not.toMatch(/secret|visitor|private/);
    log.mockRestore();
  });

  it('reports a 429 with a matching Retry-After', async () => {
    await post(ping);
    const res = await post(ping);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ success: false, error: 'RATE_LIMITED', retryAfter: 60 });
    expect(res.headers.get('retry-after')).toBe('60');
  });

  it('trusts X-Real-IP only behind the proxy', async () => {
    await post(ping, { 'X-Real-IP': '1.1.1.1' });
    clock += 10_000;
    expect((await post(ping, { 'X-Real-IP': '2.2.2.2' })).status).toBe(429);
    await new Promise((done) => server.close(done));
    await start({ trustProxy: true });
    await post(ping, { 'X-Real-IP': '1.1.1.1' });
    clock += 10_000;
    expect((await post(ping, { 'X-Real-IP': '2.2.2.2' })).status).toBe(200);
  });

  it('is unavailable, not broken, without its settings', async () => {
    await new Promise((done) => server.close(done));
    await start({ ntfyTopic: undefined });
    expect((await post(ping)).status).toBe(503);
    expect((await fetch(`${base}/health`)).status).toBe(503);
  });
});

describe('GET /health', () => {
  it('reports status and accepts GET only', async () => {
    const res = await fetch(`${base}/health`);
    expect(await res.json()).toEqual({ status: 'ok' });
    expect((await fetch(`${base}/health`, { method: 'POST' })).status).toBe(405);
  });
});

describe('limits', () => {
  it('holds each visitor to one a minute and five a day, resetting at 00:00 UTC', () => {
    const limits = createLimits();
    let at = NOON;
    for (let i = 0; i < 5; i += 1) {
      expect(limits.take('a', at)).toBe(0);
      expect(limits.take('a', at + 59_000)).toBeGreaterThan(0);
      if (i === 0) expect(limits.take('a', at + 59_000)).toBe(1);
      at += 60_000;
    }
    expect(limits.take('a', at)).toBe(12 * 3600 - 300);
    expect(limits.take('a', Date.UTC(2026, 10, 1))).toBe(0);
  });

  it('holds everyone to one per ten seconds and thirty a day', () => {
    const limits = createLimits();
    let at = NOON;
    expect(limits.take('a', at)).toBe(0);
    expect(limits.take('b', at + 1000)).toBe(9);
    for (let i = 1; i < 30; i += 1) {
      at += 10_000;
      expect(limits.take(`ip${i}`, at)).toBe(0);
    }
    expect(limits.take('new', at + 10_000)).toBe(12 * 3600 - 300);
  });
});
