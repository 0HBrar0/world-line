import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateCanon } from '../src/data/validate';

// The Python reference checker and the TypeScript validator must agree.
const shipped = JSON.parse(readFileSync('data/canon.json', 'utf8'));
const python = ['py', 'python'].find((cmd) => spawnSync(cmd, ['--version']).status === 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cases: Array<[string, (c: any) => void]> = [
  ['shipped', () => undefined],
  ['duplicate seq', (c) => (c.events[1].seq = c.events[0].seq)],
  ['empty sources', (c) => (c.events[0].sourceIds = [])],
  ['bad character ref', (c) => (c.events[0].characterIds = ['ghost'])],
  ['dispute tag', (c) => (c.disputes[0].confidence = 'CONFIRMED')],
  ['events out of order', (c) => (c.events[6].sortDate = '2009-01-01')],
  ['line change without transition', (c) => (c.events[10].transitionId = null)],
  ['premise label missing', (c) => delete c.worldLines[0].premiseLabel],
  ['numeric mismatch', (c) => (c.worldLines[1].divergenceNumeric = 0.5)],
  ['alpha band', (c) => Object.assign(c.worldLines[1], { divergence: '1.571024', divergenceNumeric: 1.571024 })],
];

describe.skipIf(!python)('parity with check_canon.py', () => {
  it.each(cases)('agrees on: %s', (_name, change) => {
    const dir = mkdtempSync(join(tmpdir(), 'canon-'));
    try {
      const copy = structuredClone(shipped);
      change(copy);
      const file = join(dir, 'canon.json');
      writeFileSync(file, JSON.stringify(copy));
      const py = spawnSync(python!, ['scripts/reference/check_canon.py', file], { encoding: 'utf8' });
      expect(py.status === 0).toBe(validateCanon(copy).errors.length === 0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
