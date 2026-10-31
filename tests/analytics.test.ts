import { afterEach, describe, expect, it } from 'vitest';
import { startAnalytics } from '../src/app/analytics';

const beacons = () => document.head.querySelectorAll('script[data-cf-beacon]');

afterEach(() => beacons().forEach((script) => script.remove()));

describe('analytics', () => {
  it('counts visits on the live site', () => {
    startAnalytics('0hbrar0.github.io', 'token');
    expect(beacons()).toHaveLength(1);
    expect(beacons()[0].getAttribute('data-cf-beacon')).toBe('{"token":"token"}');
  });

  it('stays off everywhere else, and without a token', () => {
    startAnalytics('localhost', 'token');
    startAnalytics('0hbrar0.github.io', '');
    expect(beacons()).toHaveLength(0);
  });
});
