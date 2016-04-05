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

'use strict';

/* eslint-env browser, worker, mocha */

const mochaUtils = {
  startMochaTest: () => {
    return new Promise(resolve => {
      let passedTests = [];
      let failedTests = [];

      mocha.checkLeaks();

      var runResults = mocha.run();
      // pass, fail and end events allow up to capture results and
      // determine when to publish test results
      runResults.on('pass', test => {
        passedTests.push(mochaUtils.getFriendlyTestResult(test));
      })
      .on('fail', test => {
        failedTests.push(mochaUtils.getFriendlyTestResult(test));
      })
      .on('end', () => {
        resolve({
          testResults: {
            passed: passedTests,
            failed: failedTests
          }
        });
      });

      // No tests so end won't be called
      if (mocha.suite.suites.length === 0) {
        console.warn('No tests found.');
        resolve({
          testResults: {
            passed: passedTests,
            failed: failedTests
          }
        });
      }
    });
  },

  getFriendlyTestResult: testResult => {
    const friendlyResult = {
      parentTitle: testResult.parent.title,
      title: testResult.title,
      state: testResult.state
    };

    if (testResult.err) {
      friendlyResult.errMessage = testResult.err.message;
    }

    return friendlyResult;
  },

  prettyPrintErrors: (identifier, testResults) => {
    // Print test failues
    if (testResults.failed.length > 0) {
      const failedTests = testResults.failed;
      let errorMessage = 'Issues in ' + identifier + '.\n\n' + identifier +
        ' had ' + testResults.failed.length + ' test failures.\n';
      errorMessage += '------------------------------------------------\n';
      errorMessage += failedTests.map((failedTest, i) => {
        return `[Failed Test ${i + 1}]\n` +
               `    - ${failedTest.parentTitle} > ${failedTest.title}\n` +
               `        ${failedTest.errMessage}\n`;
      }).join('\n');
      errorMessage += '------------------------------------------------\n';
      return errorMessage;
    }
    return null;
  }
};

/* eslint-disable no-negated-condition */
if (typeof window !== 'undefined') {
  window.goog = window.goog || {};
  window.goog.MochaUtils = window.goog.MochaUtils || mochaUtils;
} else if (typeof module !== 'undefined') {
  module.exports = mochaUtils;
} else {
  self.goog = self.goog || {};
  self.goog.MochaUtils = self.goog.MochaUtils || mochaUtils;
}
