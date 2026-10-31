import type { SourceTarget } from '../../components/drawer';
import type { StoryEvent, Transition, WorldLine } from '../../data/schema';
import { lineLabel } from '../../data/selectors';
import type { Tier } from '../../data/schema';
import { safeText } from '../../data/tierGuard';

export const eventTarget = (e: StoryEvent, tier: Tier): SourceTarget => ({
  id: e.id,
  title: safeText(e.title, tier),
  confidence: e.confidence,
  sourceIds: e.sourceIds,
  singleSource: e.singleSource,
  singleSourceKind: e.singleSourceKind,
  conflicts: e.conflicts,
});

export const lineTarget = (l: WorldLine, tier: Tier): SourceTarget => ({
  id: l.id,
  title: lineLabel(l, tier),
  confidence: l.confidence,
  sourceIds: l.sourceIds,
  singleSource: l.singleSource,
  singleSourceKind: l.singleSourceKind,
  alternates: l.alternateValues,
});

export const transitionTarget = (t: Transition, tier: Tier): SourceTarget => ({
  id: t.id,
  title: safeText(t.description, tier),
  confidence: t.confidence,
  sourceIds: t.sourceIds,
  singleSource: t.singleSource,
  singleSourceKind: t.singleSourceKind,
});
