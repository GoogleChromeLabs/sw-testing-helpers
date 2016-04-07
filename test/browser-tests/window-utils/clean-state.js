/*
  Copyright 2016 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// This is a test and we want descriptions to be useful, if this
// breaks the max-length, it's ok.

/* eslint-disable max-len, no-unused-expressions */
/* eslint-env browser, mocha */

'use strict';

describe('Test WindowUtils.cleanState()', function() {

  const SERVICE_WORKER_PATH = '/test/browser-tests/window-utils/serviceworkers';

  it('should resolve with nothing to clean', function() {
    return window.goog.WindowUtils.cleanState();
  });

  it('should resolve after unregistering service workers', function() {
    return navigator.serviceWorker.register(SERVICE_WORKER_PATH + '/sw-1.js')
    .then(() => {
      return navigator.serviceWorker.register(SERVICE_WORKER_PATH + '/sw-2.js');
    })
    .then(() => {
      return window.goog.WindowUtils.cleanState();
    })
    .then(() => {
      return navigator.serviceWorker.getRegistrations();
    })
    .then(registrations => {
      registrations.length.should.equal(0);
    });
  });

  it('should resolve after deleting all caches', function() {
    return window.caches.open('hello')
    .then(cache => {
      return cache.put('/', new Response('hello'));
    })
    .then(() => {
      return window.caches.open('hello-2');
    })
    .then(cache => {
      return cache.put('/', new Response('hello-2'));
    })
    .then(() => {
      return window.goog.WindowUtils.cleanState();
    })
    .then(() => {
      return window.caches.keys();
    })
    .then(cacheKeys => {
      cacheKeys.length.should.equal(0);
    });
  });

  it('should resolve after unregistering all SW and deleting all caches', function() {
    return window.caches.open('hello')
    .then(cache => {
      return cache.put('/', new Response('hello'));
    })
    .then(() => {
      return window.caches.open('hello-2');
    })
    .then(cache => {
      return cache.put('/', new Response('hello-2'));
    })
    .then(() => {
      return navigator.serviceWorker.register(SERVICE_WORKER_PATH + '/sw-1.js');
    })
    .then(() => {
      return navigator.serviceWorker.register(SERVICE_WORKER_PATH + '/sw-2.js');
    })
    .then(() => {
      return window.goog.WindowUtils.cleanState();
    })
    .then(() => {
      return window.caches.keys();
    })
    .then(cacheKeys => {
      cacheKeys.length.should.equal(0);
    })
    .then(() => {
      return navigator.serviceWorker.getRegistrations();
    })
    .then(registrations => {
      registrations.length.should.equal(0);
    });
  });

});
