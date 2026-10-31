import type { Mechanism, StoryEvent, Tier } from '../../data/schema';
import { atLeast, isVisible, tierRank, transitionById, transitionTier, worldLineById } from '../../data/selectors';

/** One star on the flight path. Holds numbers and colours only, so no story text reaches the canvas. */
export interface SpaceStop {
  value: number;
  jumpColor: string | null;
  tint: string;
}

const NEUTRAL = '#3f5fb8';
const FIELD_TINTS = { alpha: '#2f6fd0', beta: '#8a3fc0', steins_gate: '#d8a830', sg0: '#1fa8a8' };
const JUMP_COLORS: Record<Mechanism, string> = {
  dmail: '#ffa52e',
  dmail_cancellation: '#56b4e9',
  time_machine: '#2fe0a8',
  database_erasure: '#ff6a2e',
  other: '#d8d8e0',
};

export function spaceStops(steps: StoryEvent[], tier: Tier): SpaceStop[] {
  let value = 1;
  return steps.map((e) => {
    const line = worldLineById(e.worldLineAfter ?? e.worldLineBefore ?? '');
    const seen = line && isVisible(line, tier) ? line : undefined;
    const parsed = seen?.divergence ? Number(seen.divergence) : NaN;
    if (Number.isFinite(parsed)) value = parsed;
    const t = e.transitionId ? transitionById(e.transitionId) : undefined;
    const jump = t && tierRank(transitionTier(t)) <= tierRank(tier) ? t : undefined;
    // Field colours follow the map's rule: nothing that names a field before sg_part2.
    const field = !seen || !atLeast(tier, 'sg_part2') ? null : seen.lane === 'sg0' ? 'sg0' : seen.attractorField === 'steins_gate' ? 'steins_gate' : value < 1 ? 'alpha' : 'beta';
    return { value, jumpColor: jump ? JUMP_COLORS[jump.mechanism] : null, tint: field ? FIELD_TINTS[field] : NEUTRAL };
  });
}

/** True only with a real graphics chip: on software rendering the 3D views would freeze the page. */
export function supportsWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    if (localStorage.getItem('wl.force3d')) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    return !(info && /swiftshader|llvmpipe|software|basic render/i.test(String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))));
  } catch {
    return false;
  }
}
