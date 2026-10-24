'use strict';
// Cache public shell files only, never private APIs.
const CACHE = 'jarvis-web-v1-2-network-first-2026-10-24';
const FILES = ['./','./index.html','./app.js','./manifest.webmanifest','./icons/jarvis-192.png','./icons/jarvis-512.png'];
const SHELL_PATHS = new Set(FILES.map(path => new URL(path, self.registration.scope).pathname));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !SHELL_PATHS.has(url.pathname)) return;
  // Prefer fresh online files; fall back to the last cached shell offline.
  const cacheKey = url.origin + url.pathname; // Ignore tracking/query parameters.
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        try { const cache = await caches.open(CACHE); await cache.put(cacheKey, response.clone()); }
        catch { /* Cache failures must not break online use. */ }
      }
      return response;
    } catch {
      return (await caches.match(cacheKey)) ||
        (event.request.mode === 'navigate' ? await caches.match(new URL('./index.html', self.registration.scope).href) : null) ||
        Response.error();
    }
  })());
});
