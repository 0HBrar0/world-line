import { useEffect, useState } from 'react';
import { navigate } from '../app/router';
import { useReduceMotion, useSettings } from '../app/settings';
import { canon } from '../data/load';
import { characterById, glossaryById, isVisible, publicLineId } from '../data/selectors';

/** A short burst of static, like the screen cutting out when the world line changes. */
export function Blip({ token }: { token: number }) {
  const reduce = useReduceMotion();
  if (reduce || token === 0) return null;
  return <div key={token} className="blip" aria-hidden="true" />;
}

const BUFFER = 24;

/**
 * Things a fan might type anywhere on the site. Each one only opens something the visitor's
 * spoiler level already allows, so a secret can never leak the story.
 */
export function Secrets() {
  const { tier, media } = useSettings();
  const [token, setToken] = useState(0);

  useEffect(() => {
    let typed = '';
    const open = (path: string, query?: Record<string, string>) => {
      typed = '';
      setToken((t) => t + 1);
      navigate(path, query);
    };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      if (target && (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (!/[a-z0-9.]/.test(key)) return;
      typed = (typed + key).slice(-BUFFER);

      const phrase = glossaryById('gl-el-psy-kongroo');
      if (typed.endsWith('elpsykongroo') && phrase && isVisible(phrase, tier)) return open(`glossary/${phrase.id}`);
      const mayuri = characterById('mayuri');
      if (typed.endsWith('tutturu') && mayuri && isVisible(mayuri, tier)) return open(`characters/${mayuri.id}`);
      // Typing a divergence value tunes the map to that world line.
      const value = typed.match(/\d\.\d{6}$/)?.[0];
      const line = value ? canon.worldLines.find((l) => l.divergence === value && isVisible(l, tier, media)) : undefined;
      if (line) open('map', { wl: publicLineId(line.id) });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tier, media]);

  return <Blip token={token} />;
}
