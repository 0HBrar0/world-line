import { useEffect } from 'react';
import { href, navigate } from '../../app/router';
import { useSettings } from '../../app/settings';
import { useToast } from '../../components/toast';
import { Linked } from '../../components/Term';
import { Threads } from '../../components/Threads';
import { canon } from '../../data/load';
import { isVisible, mechanicById } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { MechanicExtras, MechanicPlayer } from './MechanicPlayer';

const ART_COLORS = ['#ff8a1f', '#cc79a7', '#7aa7ff', '#e6c84a', '#3ecf8e', '#56b4e9'];

export function MechanicsIndex() {
  const { tier } = useSettings();
  return (
    <main id="main" className="page">
      <h1>How time travel works</h1>
      <ul className="tile-grid mechanic-grid">
        {canon.mechanics.map((m, i) =>
          isVisible(m, tier) ? (
            <li key={m.id}>
              <a className="tile mechanic-tile" href={href(`mechanics/${m.id}`)}>
                <Threads className="mechanic-art" color={ART_COLORS[i % ART_COLORS.length]} seed={i * 3 + 1} />
                <h2>{safeText(m.title, tier)}</h2>
                <p>{safeText(m.oneLiner, tier)}</p>
              </a>
            </li>
          ) : (
            <li key={m.id}>
              <div className="tile tile-locked">🔒 later in the story</div>
            </li>
          ),
        )}
      </ul>
    </main>
  );
}

export function MechanicPage({ id }: { id: string }) {
  const { tier } = useSettings();
  const toast = useToast();
  const mechanic = mechanicById(id);
  const open = !!mechanic && isVisible(mechanic, tier);

  useEffect(() => {
    if (!open) {
      toast.showLocked();
      navigate('mechanics', undefined, true);
    }
  }, [open, toast]);

  if (!mechanic || !open) return null;
  return (
    <main id="main" className="page">
      <p>
        <a href={href('mechanics')}>All mechanics</a>
      </p>
      <h1>{safeText(mechanic.title, tier)}</h1>
      <p className="lede">
        <Linked text={safeText(mechanic.oneLiner, tier)} tier={tier} />
      </p>
      <MechanicPlayer key={mechanic.id} mechanic={mechanic} />
      <MechanicExtras mechanic={mechanic} />
    </main>
  );
}
