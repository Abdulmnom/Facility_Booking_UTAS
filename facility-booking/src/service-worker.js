/* eslint-disable no-restricted-globals */

// CRA 5 processes this file through workbox-webpack-plugin's InjectManifest.
// It replaces self.__WB_MANIFEST with the list of precache entries at build time.
// All workbox-* imports are resolved from CRA's own node_modules — no npm install needed.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';

clientsClaim();

// Precache all static assets emitted by the CRA build (injected by webpack plugin at build time)
precacheAndRoute(self.__WB_MANIFEST);

// Navigation fallback — any same-origin navigation that isn't a static asset file
// returns the precached index.html so React Router handles routing offline.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Static assets (JS bundles, CSS) — cache-first (content-hashed by CRA, never stale)
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new CacheFirst({
    cacheName: 'ufbs-static-v1',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// API GET requests — network-first with 3-second timeout, fall back to cache.
// POST/PUT/DELETE are intentionally excluded (mutation responses must not be served stale).
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'ufbs-api-v1',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  }),
  'GET'
);

// Images — stale-while-revalidate (show cached immediately, update in background)
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'ufbs-images-v1',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);
