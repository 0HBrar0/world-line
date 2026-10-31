import raw from '../../data/canon.json';
import { CanonSchema, type Canon } from './schema';

// Parsed strictly in dev and test; the production build already passed scripts/validate-canon.ts.
export const canon: Canon = import.meta.env?.PROD ? (raw as unknown as Canon) : CanonSchema.parse(raw);
