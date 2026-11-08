import { useEffect, useRef } from 'react';
import { useRoute } from '../../app/router';
import { useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { formatDate } from '../../components/format';
import { Nixie } from '../../components/Nixie';
import { useFocusTrap } from '../../components/useFocusTrap';
import { canon } from '../../data/load';
import type { StoryEvent, Tier } from '../../data/schema';
import { characterById, isVisible, tierRank, transitionById, transitionTier, visibleEvents, worldLineById } from '../../data/selectors';
import { isTextSafe, safeText } from '../../data/tierGuard';
import { eventTarget } from '../map/targets';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** A D-Mail is an event whose jump was made by sending one or by cancelling one. */
export function isDmail(e: StoryEvent): boolean {
  const t = e.transitionId ? transitionById(e.transitionId) : undefined;
  return t?.mechanism === 'dmail' || t?.mechanism === 'dmail_cancellation';
}

function landsOn(date: string): string {
  const [year, month, day] = date.split('-');
  if (day) return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

const shownLine = (id: string | null, tier: Tier) => {
  const line = id ? worldLineById(id) : undefined;
  return line && isVisible(line, tier) ? line : undefined;
};

/** One D-Mail as a file: when it went, where it landed, what it said, and what it moved. */
export function DmailFile({ event, tier, headingLevel = 2 }: { event: StoryEvent; tier: Tier; headingLevel?: 2 | 3 }) {
  const transition = event.transitionId ? transitionById(event.transitionId) : undefined;
  const open = transition && tierRank(transitionTier(transition)) <= tierRank(tier) ? transition : undefined;
  const cancelling = transition?.mechanism === 'dmail_cancellation';
  const people = event.characterIds.flatMap((id) => {
    const c = characterById(id);
    return c && isVisible(c, tier) ? [c.name] : [];
  });
  const exact = event.dmailText ? safeText(event.dmailText.text, tier) : '';
  const happened = safeText(event.summary, tier);
  const changed = event.whatChanged ? safeText(event.whatChanged, tier) : '';
  const arrivals = event.conflicts.filter((c) => isTextSafe(c.claim, tier));
  const location = event.location ? safeText(event.location, tier) : '';
  const from = open ? shownLine(open.from, tier) : undefined;
  const to = open ? shownLine(open.to, tier) : undefined;
  const Title = `h${headingLevel}` as const;
  const Sub = `h${headingLevel + 1}` as 'h3' | 'h4';

  return (
    <article className="dmail-file" id={`dmail-${event.id}`} aria-labelledby={`dmail-title-${event.id}`}>
      <p className="dmail-kind">{cancelling ? 'Cancelling D-Mail' : 'D-Mail'}</p>
      <Title id={`dmail-title-${event.id}`}>{safeText(event.title, tier)}</Title>
      <dl className="dmail-meta">
        <div>
          <dt>Sent</dt>
          <dd>
            {formatDate(event)}
            {location && `, ${location}`}
          </dd>
        </div>
        {event.targetDate && (
          <div>
            <dt>Lands</dt>
            <dd>{landsOn(event.targetDate)}</dd>
          </div>
        )}
        {people.length > 0 && (
          <div>
            <dt>People</dt>
            <dd>{people.join(', ')}</dd>
          </div>
        )}
      </dl>
      <div className="dmail-screen">
        {exact ? (
          <>
            <p className="dmail-label">The message, as sent</p>
            <blockquote>{exact}</blockquote>
            <Badge compact target={{ id: event.id, title: 'Message text', ...event.dmailText! }} />
          </>
        ) : (
          <>
            <p className="dmail-label">What happened</p>
            <p>{happened}</p>
            <p className="dmail-note">The exact wording isn't on file yet</p>
          </>
        )}
      </div>
      {(changed || (from && to)) && (
        <section className="dmail-result">
          <Sub>What it changed</Sub>
          {from && to && from.id !== to.id && (
            <p className="line-move">
              <Nixie value={from.divergence} size="sm" /> <span aria-hidden="true">→</span> <span className="sr-only">changes to</span>{' '}
              <Nixie value={to.divergence} size="sm" />
            </p>
          )}
          {changed && <p>{changed}</p>}
        </section>
      )}
      {arrivals.length > 0 && (
        <section>
          <Sub>Where sources disagree</Sub>
          <ul className="fact-list">
            {arrivals.map((c) => (
              <li key={c.claim}>{c.claim}</li>
            ))}
          </ul>
        </section>
      )}
      <Badge target={eventTarget(event, tier)} />
    </article>
  );
}

/** The file opened over another page, such as Follow. */
export function DmailDialog({ event, tier, onClose }: { event: StoryEvent; tier: Tier; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);
  return (
    <div className="sheet-layer interlude-layer">
      <div ref={ref} className="interlude dmail-dialog" role="dialog" aria-modal="true" aria-labelledby={`dmail-title-${event.id}`}>
        <button type="button" className="btn detail-close" onClick={onClose}>
          Close
        </button>
        <DmailFile event={event} tier={tier} />
      </div>
    </div>
  );
}

/** Every D-Mail the chosen spoiler level allows, in the order Okabe lived them. */
export function DmailsPage() {
  const { tier, media } = useSettings();
  const route = useRoute();
  const wanted = route.query.get('ev');
  const shown = visibleEvents(tier, media, 'seq').filter(isDmail);
  const locked = canon.events.filter((e) => isDmail(e) && !isVisible(e, tier, media)).length;

  useEffect(() => {
    if (wanted) document.getElementById(`dmail-${wanted}`)?.scrollIntoView({ block: 'start' });
  }, [wanted]);

  return (
    <main id="main" className="page dmails">
      <h1>D-Mails</h1>
      <p className="lede">Every message sent to the past, in the order Okabe lived them</p>
      <ol className="dmail-list">
        {shown.map((e) => (
          <li key={e.id} className={e.id === wanted ? 'is-wanted' : undefined}>
            <DmailFile event={e} tier={tier} />
          </li>
        ))}
      </ol>
      {locked > 0 && (
        <p className="detail-meta">
          {locked} more {locked === 1 ? 'D-Mail unlocks' : 'D-Mails unlock'} later in the story
        </p>
      )}
    </main>
  );
}
