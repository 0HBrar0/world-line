import { z } from 'zod';

// Mirrors data/canon.json exactly: objects are strict, so a new or misspelled key fails validation.

export const TierSchema = z.enum(['premise', 'sg_part1', 'sg_part2', 'sg_ending', 'sg0', 'extras']);
export const ConfidenceSchema = z.enum(['CONFIRMED', 'INTERPRETATION', 'UNCLEAR']);
export const MediaSchema = z.enum(['vn', 'anime', 'sg0_vn', 'sg0_anime', 'film', 'other']);
export const LaneSchema = z.enum(['sg_main', 'steins_gate', 'sg_vn_ending', 'sg0', 'spinoff']);
export const AttractorSchema = z.enum(['alpha', 'beta', 'steins_gate', 'other', 'unclear']);
export const MechanismSchema = z.enum(['dmail', 'dmail_cancellation', 'time_machine', 'database_erasure', 'other']);
export const CategorySchema = z.enum(['device', 'theory', 'organization', 'operation', 'phenomenon', 'place', 'other']);
const SingleSourceKind = z.enum(['fan_wiki', 'wikipedia', 'other']);

const sourced = {
  confidence: ConfidenceSchema,
  sourceIds: z.array(z.string()),
  singleSource: z.boolean().optional(),
  singleSourceKind: SingleSourceKind.optional(),
};

const Detail = z.strictObject({ text: z.string(), spoilerTier: TierSchema, ...sourced });

export const SourceSchema = z.strictObject({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  tier: z.number(),
  status: z.enum(['fetched', 'wrong-content', 'partial', 'failed', 'search-only']),
  notes: z.string(),
});

const Fate = z.strictObject({
  text: z.string(),
  spoilerTier: TierSchema,
  note: z.string().optional(),
  details: z.array(Detail).optional(),
  ...sourced,
});

export const CharacterSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  nameJapaneseOrder: z.string().nullable(),
  nameKanji: z.string().nullable(),
  aliases: z.array(z.strictObject({ name: z.string(), spoilerTier: TierSchema, ...sourced })),
  labMemberNumber: z.strictObject({ value: z.string().nullable(), note: z.string().optional(), ...sourced }).nullable(),
  role: z.string(),
  relationships: z.array(z.strictObject({ characterId: z.string(), type: z.string(), spoilerTier: TierSchema, ...sourced })),
  readingSteiner: z
    .strictObject({ level: z.enum(['full', 'partial', 'unknown']), notes: z.string(), spoilerTier: TierSchema, ...sourced })
    .nullable(),
  dmailsSent: z.array(z.string()),
  fates: z.strictObject({
    alpha: Fate.nullable(),
    beta: Fate.nullable(),
    steinsGate: Fate.nullable(),
    sg0: Fate.nullable(),
  }),
  firstSpoilerTier: TierSchema,
  media: z.array(MediaSchema),
  reveals: z.array(Detail),
  ...sourced,
});

export const GlossarySchema = z.strictObject({
  id: z.string(),
  term: z.string(),
  aliases: z.array(z.string()),
  plainLanguage: z.string(),
  details: z.string(),
  category: CategorySchema,
  relatedIds: z.array(z.string()),
  spoilerTier: TierSchema,
  reveals: z.array(Detail),
  realWorld: z.boolean().optional(),
  meaningConfidence: ConfidenceSchema.optional(),
  statusConfidence: ConfidenceSchema.optional(),
  numberConfidence: ConfidenceSchema.optional(),
  namingConfidence: ConfidenceSchema.optional(),
  nameConfidence: ConfidenceSchema.optional(),
  ...sourced,
});

const AliveDeadEntry = z.strictObject({
  characterId: z.string(),
  note: z.string(),
  spoilerTier: TierSchema.optional(),
  ...sourced,
});

export const WorldLineSchema = z.strictObject({
  id: z.string(),
  divergence: z.string().nullable(),
  divergenceNumeric: z.number().nullable(),
  attractorField: AttractorSchema,
  label: z.string(),
  whatIsDifferent: z.string(),
  aliveDead: z.strictObject({ alive: z.array(AliveDeadEntry), dead: z.array(AliveDeadEntry) }),
  keyEventIds: z.array(z.string()),
  media: z.array(MediaSchema),
  appearsIn: z.array(z.string()),
  alternateValues: z.array(z.strictObject({ value: z.string().nullable(), note: z.string(), ...sourced })),
  spoilerTier: TierSchema,
  divergenceConfidence: ConfidenceSchema,
  lane: LaneSchema,
  premiseLabel: z.string().optional(),
  reveals: z.array(Detail),
  fieldName: z.string().optional(),
  causeConfidence: ConfidenceSchema.optional(),
  ...sourced,
});

export const EventSchema = z.strictObject({
  id: z.string(),
  seq: z.number(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  dateConfidence: ConfidenceSchema,
  sortDate: z.string(),
  sortDateIsEditorial: z.boolean(),
  location: z.string().nullable(),
  characterIds: z.array(z.string()),
  title: z.string(),
  summary: z.string(),
  whatChanged: z.string().nullable(),
  worldLineBefore: z.string().nullable(),
  worldLineAfter: z.string().nullable(),
  transitionId: z.string().nullable(),
  media: z.array(MediaSchema),
  spoilerTier: TierSchema,
  conflicts: z.array(z.strictObject({ claim: z.string(), sourceIds: z.array(z.string()) })),
  reveals: z.array(Detail),
  lane: LaneSchema,
  timeConfidence: ConfidenceSchema.optional(),
  dateNote: z.string().optional(),
  targetDate: z.string().optional(),
  ...sourced,
});

export const TransitionSchema = z.strictObject({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  cause: z.string(),
  mechanism: MechanismSchema,
  description: z.string(),
  whoRemembers: z.array(z.strictObject({ characterId: z.string(), extent: z.string() })),
  crossesAttractorField: z.boolean(),
  media: z.array(MediaSchema),
  spoilerTier: TierSchema,
  note: z.string().optional(),
  mechanismConfidence: ConfidenceSchema.optional(),
  ...sourced,
});

const Step = z.strictObject({
  order: z.number(),
  caption: z.string(),
  visualHint: z.string(),
  spoilerTier: TierSchema.optional(),
  ...sourced,
});

export const MechanicSchema = z.strictObject({
  id: z.enum(['dmail', 'time_leap', 'reading_steiner', 'attractor_field', 'divergence_meter', 'time_machine']),
  title: z.string(),
  spoilerTier: TierSchema,
  oneLiner: z.string(),
  steps: z.array(Step),
  whatTravels: z.string(),
  whatDoesNotTravel: z.string(),
  limits: z.array(z.strictObject({ text: z.string(), spoilerTier: TierSchema.optional(), ...sourced })),
  commonMisconceptions: z.array(z.strictObject({ claim: z.string(), correction: z.string(), ...sourced })),
});

export const Sg0EndingSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  route: z.string(),
  worldLineId: z.string(),
  value: z.string().nullable(),
  outcome: z.string(),
  howToReach: z.string(),
  isTrueEnd: z.boolean(),
  media: z.array(MediaSchema),
  ...sourced,
});

export const Sg0BranchSchema = z.strictObject({
  branchEventId: z.string(),
  branchWorldLineId: z.string(),
  forkFromWorldLineId: z.string(),
  description: z.string(),
  spoilerTier: TierSchema,
  keyEventIds: z.array(z.string()),
  endings: z.array(Sg0EndingSchema),
  animeVsVn: z.array(z.strictObject({ text: z.string(), ...sourced })),
  reconnection: z.strictObject({
    fromEventId: z.string(),
    toEventId: z.string(),
    unlocksEventId: z.string(),
    description: z.string(),
    spoilerTier: TierSchema,
    arrivalDateNote: z.string(),
    ...sourced,
  }),
  classification: z.strictObject({ text: z.string(), ...sourced }),
  ...sourced,
});

export const EndingSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  chapter: z.string(),
  route: z.string(),
  worldLineId: z.string().nullable(),
  outcome: z.string(),
  howToReach: z.string(),
  media: z.array(MediaSchema),
  spoilerTier: TierSchema,
  worldLineConfidence: ConfidenceSchema.optional(),
  worldLineNote: z.string().optional(),
  isCanonical: z.boolean().optional(),
  ...sourced,
});

export const WorkSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  altTitles: z.array(z.string()),
  type: z.string(),
  releaseJapan: z.string().nullable(),
  releaseWest: z.string().nullable(),
  developerOrStudio: z.string().nullable(),
  canonStatus: z.strictObject({ text: z.string(), ...sourced }),
  placementInTimeline: z.string(),
  sourceIds: z.array(z.string()),
  mediaKey: MediaSchema,
  notes: z.string().optional(),
  titleConfidence: ConfidenceSchema.optional(),
});

export const DisputeSchema = z.strictObject({
  id: z.string(),
  topic: z.string(),
  versions: z.array(z.strictObject({ claim: z.string(), sourceIds: z.array(z.string()) })),
  betterSupported: z.string(),
  uiAction: z.string(),
  spoilerTier: TierSchema,
  confidence: ConfidenceSchema,
});

export const MetaSchema = z.strictObject({
  schemaVersion: z.string(),
  generated: z.string(),
  description: z.string(),
  confidenceLevels: z.record(ConfidenceSchema, z.string()),
  fieldConventions: z.record(z.string(), z.string()),
  mediaKeys: z.record(MediaSchema, z.string()),
  spoilerTiers: z.array(z.strictObject({ id: TierSchema, order: z.number(), label: z.string(), covers: z.string() })),
  decisions: z.array(z.string()),
});

export const CanonSchema = z.strictObject({
  meta: MetaSchema,
  sources: z.array(SourceSchema),
  characters: z.array(CharacterSchema),
  glossary: z.array(GlossarySchema),
  worldLines: z.array(WorldLineSchema),
  events: z.array(EventSchema),
  transitions: z.array(TransitionSchema),
  mechanics: z.array(MechanicSchema),
  sg0Branch: Sg0BranchSchema,
  endings: z.array(EndingSchema),
  works: z.array(WorkSchema),
  disputes: z.array(DisputeSchema),
});

export type Canon = z.infer<typeof CanonSchema>;
export type Tier = z.infer<typeof TierSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Mechanism = z.infer<typeof MechanismSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type GlossaryEntry = z.infer<typeof GlossarySchema>;
export type WorldLine = z.infer<typeof WorldLineSchema>;
export type StoryEvent = z.infer<typeof EventSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type Mechanic = z.infer<typeof MechanicSchema>;
export type Ending = z.infer<typeof EndingSchema>;
export type Sg0Ending = z.infer<typeof Sg0EndingSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Dispute = z.infer<typeof DisputeSchema>;
export type AliveDeadEntry = z.infer<typeof AliveDeadEntry>;
