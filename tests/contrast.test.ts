import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const token = (name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)![1];

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const SURFACES = ['bg-0', 'bg-1', 'bg-2'];

describe('token contrast', () => {
  it.each(['ink-0', 'ink-1', 'nixie', 'conf-confirmed', 'conf-interp', 'conf-unclear', 'danger'])('%s is readable text on every surface', (name) => {
    for (const s of SURFACES) expect(ratio(token(name), token(s)), `${name} on ${s}`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['edge-dmail', 'edge-cancel', 'edge-machine', 'edge-leap', 'edge-erasure', 'edge-other', 'edge-reconnect'])('%s meets 3:1 on the map bands', (name) => {
    for (const s of ['bg-1', 'band-alpha', 'band-beta', 'band-sg', 'band-sg0']) expect(ratio(token(name), token(s)), `${name} on ${s}`).toBeGreaterThanOrEqual(3);
  });

  it('text on the band tints stays readable', () => {
    for (const s of ['band-alpha', 'band-beta', 'band-sg', 'band-sg0']) expect(ratio(token('ink-1'), token(s)), s).toBeGreaterThanOrEqual(4.5);
  });
});
