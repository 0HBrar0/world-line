import { useEffect } from 'react';
import { href, navigate } from '../../app/router';
import { useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { CharacterGlyph } from '../../components/glyphs';
import { useToast } from '../../components/toast';
import { canon } from '../../data/load';
import type { Character, Tier } from '../../data/schema';
import { characterById, effectiveTier, eventById, isVisible, tierRank } from '../../data/selectors';
import { isTextSafe, safeText } from '../../data/tierGuard';
import { MediaList, Reveals } from '../map/DetailPanel';

const open = (obj: { spoilerTier?: Tier }, c: Character, tier: Tier) => tierRank(effectiveTier(obj, c)) <= tierRank(tier);

const characterTarget = (c: Character) => ({ id: c.id, title: c.name, confidence: c.confidence, sourceIds: c.sourceIds, singleSource: c.singleSource, singleSourceKind: c.singleSourceKind });

const FATE_LABELS = [
  ['alpha', 'On Alpha lines'],
  ['beta', 'On Beta lines'],
  ['steinsGate', 'On the Steins Gate line'],
  ['sg0', 'In Steins;Gate 0'],
] as const;

export function CharactersIndex() {
  const { tier } = useSettings();
  const shown = canon.characters.filter((c) => isVisible(c, tier));
  return (
    <main id="main" className="page">
      <h1>Characters</h1>
      <ul className="tile-grid">
        {shown.map((c) => (
          <li key={c.id}>
            <a className="tile character-tile" href={href(`characters/${c.id}`)}>
              <CharacterGlyph id={c.id} size={44} />
              <span>
                <h2>{c.name}</h2>
                <p>{safeText(c.role, tier)}</p>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CharacterPage({ id }: { id: string }) {
  const { tier } = useSettings();
  const toast = useToast();
  const c = characterById(id);
  const visible = !!c && isVisible(c, tier);

  useEffect(() => {
    if (!visible) {
      toast.showLocked();
      navigate('characters', undefined, true);
    }
  }, [visible, toast]);

  if (!c || !visible) return null;
  const role = safeText(c.role, tier);
  const aliases = c.aliases.filter((a) => open(a, c, tier));
  const relationships = c.relationships.filter((r) => {
    const other = characterById(r.characterId);
    return open(r, c, tier) && other && isVisible(other, tier) && isTextSafe(r.type, tier);
  });
  const steiner = c.readingSteiner && open(c.readingSteiner, c, tier) && isTextSafe(c.readingSteiner.notes, tier) ? c.readingSteiner : null;
  const fates = FATE_LABELS.flatMap(([key, label]) => {
    const fate = c.fates[key];
    return fate && open(fate, c, tier) ? [{ key, label, fate }] : [];
  });
  const sent = c.dmailsSent.flatMap((eid) => {
    const e = eventById(eid);
    return e && isVisible(e, tier) ? [e] : [];
  });
  const number = c.labMemberNumber;

  return (
    <main id="main" className="page entry">
      <p>
        <a href={href('characters')}>All characters</a>
      </p>
      <div className="character-head">
        <CharacterGlyph id={c.id} size={64} />
        <div>
          <h1>{c.name}</h1>
          <p className="detail-meta">
            {c.nameJapaneseOrder && isTextSafe(c.nameJapaneseOrder, tier) && <span lang="ja-Latn">{c.nameJapaneseOrder}</span>}
            {c.nameKanji && isTextSafe(c.nameJapaneseOrder ?? '', tier) && (
              <>
                {' · '}
                <span lang="ja">{c.nameKanji}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <p className="row">
        <Badge target={characterTarget(c)} />
        <MediaList media={c.media.filter((m) => tier !== 'premise' || m === 'vn' || m === 'anime')} />
      </p>
      {role && <p className="lede">{role}</p>}
      {number?.value && (
        <p>
          Lab Mem {number.value} <Badge compact target={{ id: c.id, title: 'Lab Mem number', ...number }} />
          {number.note && safeText(number.note, tier) && <span className="detail-meta"> {safeText(number.note, tier)}</span>}
        </p>
      )}
      {aliases.length > 0 && (
        <section>
          <h2>Also known as</h2>
          <ul className="fact-list">
            {aliases.map((a) => (
              <li key={a.name}>
                {a.name} <Badge compact target={{ id: c.id, title: a.name, ...a }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {relationships.length > 0 && (
        <section>
          <h2>Relationships</h2>
          <ul className="fact-list">
            {relationships.map((r, i) => (
              <li key={i} className="row">
                <a href={href(`characters/${r.characterId}`)}>
                  <CharacterGlyph id={r.characterId} size={26} />
                </a>
                <span>
                  <strong>{characterById(r.characterId)?.name}:</strong> {r.type}
                </span>
                <Badge compact target={{ id: c.id, title: r.type, ...r }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {steiner && (
        <section>
          <h2>Reading Steiner</h2>
          <p>
            {steiner.notes} <Badge compact target={{ id: c.id, title: 'Reading Steiner', ...steiner }} />
          </p>
        </section>
      )}
      {fates.length > 0 && (
        <section>
          <h2>Fates by field</h2>
          {fates.map(({ key, label, fate }) => (
            <div key={key} className="fate-block">
              <h3>{label}</h3>
              <p>
                {safeText(fate.text, tier)} <Badge compact target={{ id: c.id, title: label, ...fate }} />
              </p>
              {fate.details
                ?.filter((d) => tierRank(d.spoilerTier) <= tierRank(tier) && isTextSafe(d.text, tier))
                .map((d, i) => (
                  <p key={i} className="detail-meta">
                    {d.text} <Badge compact target={{ id: c.id, title: label, ...d }} />
                  </p>
                ))}
            </div>
          ))}
        </section>
      )}
      {sent.length > 0 && (
        <section>
          <h2>D-Mails sent</h2>
          <ul className="fact-list">
            {sent.map((e) => (
              <li key={e.id}>
                <a href={href('map', { ev: e.id })}>{safeText(e.title, tier)}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Reveals reveals={c.reveals} tier={tier} ancestorId={c.id} />
    </main>
  );
}
