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
/* global chai:false */

'use strict';

describe('Test swUtils.controlledBySW()', function() {
  const SERVICE_WORKER_PATH = '/test/browser-tests/window-utils/serviceworkers';

  it('should reject when called with no arguments', function(done) {
    return window.goog.swUtils.controlledBySW()
    .then(() => done(new Error('Should have rejected')))
    .catch(() => done());
  });

  it('should reject when called with an array argument', function(done) {
    return window.goog.swUtils.controlledBySW([])
    .then(() => done(new Error('Should have rejected')))
    .catch(() => done());
  });

  it('should reject called with an object argument', function(done) {
    return window.goog.swUtils.controlledBySW({})
    .then(() => done(new Error('Should have rejected')))
    .catch(() => done());
  });

  it('should reject when used with an invalid service worker path', function(done) {
    return window.goog.swUtils.controlledBySW(SERVICE_WORKER_PATH + '/sw-doesnt-exist.js')
    .then(() => done(new Error('Should have rejected')))
    .catch(() => done());
  });

  it('should reject when used with a service worker that fails to install', function(done) {
    return window.goog.swUtils.controlledBySW(SERVICE_WORKER_PATH + '/sw-broken-install.js')
    .then(() => done(new Error('Should have rejected')))
    .catch(() => done());
  });

  it('should resolve once the service worker controls the iframe', function() {
    return window.goog.swUtils.controlledBySW(SERVICE_WORKER_PATH + '/immediate-control.js')
    .then(iframe => {
      chai.expect(iframe.contentWindow.navigator.serviceWorker.controller).to.exist;
    });
  });
});
