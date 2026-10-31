// CI validator: exits non-zero on any error. Usage: tsx scripts/validate-canon.ts data/canon.json
import { readFileSync } from 'node:fs';
import { validateCanon } from '../src/data/validate';

const path = process.argv[2] ?? 'data/canon.json';

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`ERRORS: 1\n  ${path}: does not parse: ${String(error)}`);
  process.exit(1);
}

const { errors, warnings, counts, unusedSources } = validateCanon(raw);
console.log(`ERRORS: ${errors.length}`);
errors.slice(0, 80).forEach((e) => console.log(`  ${e}`));
console.log(`WARNINGS: ${warnings.length}`);
warnings.forEach((w) => console.log(`  ${w}`));
console.log(`sources never cited: ${unusedSources.length}`);
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', '));
process.exit(errors.length > 0 ? 1 : 0);
