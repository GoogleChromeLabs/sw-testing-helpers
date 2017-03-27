/* global self:false */

// This is used by the controlled-by-sw.js test.
// It's a service worker that activates & takes control of clients immediately.
// It specifically does not wrap the calls with event.waitUntil();
// see https://github.com/GoogleChrome/sw-testing-helpers/pull/54#discussion_r107965709

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
