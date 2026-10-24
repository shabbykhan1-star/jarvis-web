'use strict';
const CACHE = 'jarvis-web-v1-1-2026-10-24';
const FILES = ['./','./index.html','./app.js','./manifest.webmanifest','./icons/jarvis-192.png','./icons/jarvis-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', event => { if(event.request.method !== 'GET')return;const u=new URL(event.request.url);if(u.origin !== self.location.origin)return;event.respondWith(caches.match(event.request).then(hit=>hit || fetch(event.request))); });