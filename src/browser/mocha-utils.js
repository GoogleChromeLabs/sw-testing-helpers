/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-env browser */

(() => {
  const mochaUtils = require('../utils/mocha.js');

  /* eslint-disable no-negated-condition */
  if (typeof window === 'undefined') {
    self.goog = self.goog || {};
    self.goog.mochaUtils = self.goog.mochaUtils || mochaUtils;

    self.addEventListener('message', event => {
      switch (event.data) {
        case 'ready-check': {
          event.ports[0].postMessage({
            ready: true
          });
          break;
        }
        case 'start-tests': {
          self.goog.mochaUtils.startInBrowserMochaTests()
          .then(results => {
            event.ports[0].postMessage(results);
          });
          break;
        }
        default: {
          event.ports[0].postMessage({
            error: 'Unknown test name: ' + event.data
          });
          break;
        }
      }
    });
  } else {
    window.goog = window.goog || {};
    window.goog.mochaUtils = window.goog.mochaUtils || mochaUtils;
  }
})();
