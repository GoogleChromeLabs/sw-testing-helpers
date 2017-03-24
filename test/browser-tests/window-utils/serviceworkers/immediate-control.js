// This is used by the controlled-by-sw.js test.
// It's a service worker that activates & takes control of clients immediately.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
