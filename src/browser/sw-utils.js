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

/* eslint-env worker, serviceworker */

const mochaUtils = require('../mocha/utils.js');

self.goog = self.goog || {};
self.goog.SWUtils = self.goog.SWUtils || {
  runMochaTests: function() {
    return new Promise(resolve => {
      const passedTests = [];
      const failedTests = [];

      var runResults = self.mocha.run();

      if (runResults.total === 0) {
        resolve({
          testResults: {
            passed: passedTests,
            failed: failedTests
          }
        });
        return;
      }

      // pass, fail and end events allow up to capture results and
      // determine when to publish test results
      runResults.on('pass', function(test) {
        passedTests.push(mochaUtils.getFriendlyTestResult(test));
      })
      .on('fail', function(test) {
        failedTests.push(mochaUtils.getFriendlyTestResult(test));
      })
      .on('end', function() {
        resolve({
          testResults: {
            passed: passedTests,
            failed: failedTests
          }
        });
      });
    });
  }
};

self.addEventListener('message', event => {
  switch (event.data) {
    case 'ready-check':
      event.ports[0].postMessage({
        ready: true
      });
      break;
    case 'start-tests':
      self.goog.SWUtils.runMochaTests()
      .then(results => {
        event.ports[0].postMessage(results);
      });
      break;
    default:
      event.ports[0].postMessage({
        error: 'Unknown test name: ' + event.data
      });
      break;
  }
});
