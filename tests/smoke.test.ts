import { describe, expect, it } from 'vitest';
import { href, parseHash } from '../src/app/router';

describe('router', () => {
  it('parses paths and queries', () => {
    const route = parseHash('#/map?wl=a&ev=b');
    expect(route.path).toEqual(['map']);
    expect(route.query.get('ev')).toBe('b');
  });
  it('builds hrefs', () => {
    expect(href('compare', { lines: 'a,b' })).toBe('#/compare?lines=a,b');
  });
});
