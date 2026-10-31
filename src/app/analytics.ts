const LIVE_HOST = '0hbrar0.github.io';
const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js';

/** Cloudflare Web Analytics, on the live site only so local builds and tests never count as visits. */
export function startAnalytics(host = window.location.hostname, token = import.meta.env.VITE_ANALYTICS_TOKEN) {
  if (host !== LIVE_HOST || !token) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = BEACON;
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.append(script);
}
