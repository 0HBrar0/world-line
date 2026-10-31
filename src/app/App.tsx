import { useEffect, useMemo, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useRoute } from './router';
import { SettingsProvider, useReduceMotion, useSettings } from './settings';
import { ConfidenceLegend } from '../components/Badge';
import { SourceDrawerProvider } from '../components/drawer';
import { ToastProvider } from '../components/toast';
import { TopBar } from '../components/TopBar';
import { isVisible, worldLineById } from '../data/selectors';
import { CharacterPage, CharactersIndex } from '../features/characters/CharacterPages';
import { ComparePage } from '../features/compare/ComparePage';
import { FollowPage } from '../features/follow/FollowPage';
import { GlossaryEntryPage, GlossaryIndex } from '../features/glossary/GlossaryPages';
import { HomePage } from '../features/HomePage';
import { MapPage } from '../features/map/MapPage';
import { MechanicPage, MechanicsIndex } from '../features/mechanics/MechanicsPages';
import { Sg0Page } from '../features/sg0/Sg0Page';
import { AboutPage, DisputesPage, EndingsPage, WorksPage } from '../features/works/InfoPages';

const TITLES: Record<string, string> = {
  '': 'Home',
  map: 'World-line map',
  follow: 'Follow the story',
  mechanics: 'How time travel works',
  compare: 'Compare world lines',
  glossary: 'Glossary',
  characters: 'Characters',
  sg0: 'Steins;Gate 0',
  endings: 'Endings',
  works: 'Works',
  disputes: 'Disputes',
  about: 'About',
};

/** Moves focus directly: a plain #main href would be read as a route by the hash router. */
function SkipLink({ target, children }: { target: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="skip-link"
      onClick={() => {
        const el = document.getElementById(target);
        el?.setAttribute('tabindex', '-1');
        el?.focus();
      }}
    >
      {children}
    </button>
  );
}

function NotFound() {
  return (
    <main id="main" className="page">
      <h1>Not found</h1>
      <p>There is nothing at this address.</p>
    </main>
  );
}

function renderRoute(name: string, rest: string[]): ReactNode {
  switch (name) {
    case '':
      return <HomePage />;
    case 'map':
      return <MapPage />;
    case 'follow':
      return <FollowPage />;
    case 'compare':
      return <ComparePage />;
    case 'glossary':
      return rest[0] ? <GlossaryEntryPage id={rest[0]} /> : <GlossaryIndex />;
    case 'mechanics':
      return rest[0] ? <MechanicPage id={rest[0]} /> : <MechanicsIndex />;
    case 'characters':
      return rest[0] ? <CharacterPage id={rest[0]} /> : <CharactersIndex />;
    case 'sg0':
      return <Sg0Page />;
    case 'endings':
      return <EndingsPage />;
    case 'works':
      return <WorksPage />;
    case 'disputes':
      return <DisputesPage />;
    case 'about':
      return <AboutPage />;
    default:
      return <NotFound />;
  }
}

function Shell() {
  const route = useRoute();
  const reduce = useReduceMotion();
  const { tier, focusedLine, legendOpen, setLegendOpen } = useSettings();
  const name = route.path[0] ?? '';

  useEffect(() => {
    document.title = `${TITLES[name] ?? 'Not found'} · World Line`;
  }, [name]);

  useEffect(() => setLegendOpen(false), [name, setLegendOpen]);

  const readout = useMemo(() => {
    const line = focusedLine ? worldLineById(focusedLine) : undefined;
    return line && isVisible(line, tier) ? line.divergence : null;
  }, [focusedLine, tier]);

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <SkipLink target="main">Skip to content</SkipLink>
      {name === 'map' && <SkipLink target="map-list">Skip to map list</SkipLink>}
      <TopBar readout={readout} />
      {legendOpen && <ConfidenceLegend />}
      <div className="sr-only" aria-live="polite">
        {readout ? `World line now ${readout}` : ''}
      </div>
      {renderRoute(name, route.path.slice(1))}
    </MotionConfig>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <SourceDrawerProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </SourceDrawerProvider>
    </SettingsProvider>
  );
}
