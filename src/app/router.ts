import { useEffect, useState } from 'react';

export interface Route {
  path: string[];
  query: URLSearchParams;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '');
  const [pathPart = '', queryPart = ''] = raw.split('?');
  return { path: pathPart.split('/').filter(Boolean), query: new URLSearchParams(queryPart) };
}

export function href(path: string, query?: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const qs = q.toString().replace(/%2C/g, ',');
  return `#/${path.replace(/^\//, '')}${qs ? `?${qs}` : ''}`;
}

export function navigate(path: string, query?: Record<string, string | undefined>, replace = false): void {
  const next = href(path, query);
  if (replace) {
    window.history.replaceState(null, '', next);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = next;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
