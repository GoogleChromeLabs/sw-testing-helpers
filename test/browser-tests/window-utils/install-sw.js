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

describe('Test swUtils.installSW()', function() {

  const SERVICE_WORKER_PATH = '/test/browser-tests/window-utils/serviceworkers';

  before(function() {
    return new Promise((resolve, reject) => {
      // By leaks this is referring to the only thing Propel
      // should add to the global scope (i.e. window) is goog
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'text/javascript');
      scriptElement.src = '/build/browser/sw-utils.js';
      document.querySelector('head').appendChild(scriptElement);
      scriptElement.onerror = () => {
        reject(new Error('Unable to load script.'));
      };
      scriptElement.onload = resolve;
    });
  });

  beforeEach(function() {
    return window.goog.swUtils.cleanState();
  });

  after(function() {
    return window.goog.swUtils.cleanState();
  });

  it('should reject with no arugments', function() {
    return window.goog.swUtils.installSW()
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with array arugment', function() {
    return window.goog.swUtils.installSW([])
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with object arugment', function() {
    return window.goog.swUtils.installSW({})
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with invalid sw path', function() {
    return window.goog.swUtils.installSW(SERVICE_WORKER_PATH + '/sw-doesnt-exist.js')
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with sw that fails to install', function() {
    return window.goog.swUtils.installSW(SERVICE_WORKER_PATH + '/sw-broken-install.js')
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should resolve once the sw installs', function() {
    return window.goog.swUtils.installSW(SERVICE_WORKER_PATH + '/sw-1.js')
    .then(iframe => {
      iframe.should.not.be.null;
    })
    .then(() => {
      return navigator.serviceWorker.getRegistrations();
    })
    .then(registrations => {
      registrations.length.should.equal(1);

      registrations[0].active.should.be.defined;
    });
  });
});
