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

/* eslint-env node, browser, worker, mocha */

/**
 * The results from a set of Mocha tests
 *
 * @typedef {Object} MochaTestResults
 * @property {Array<MochaTestResult>} passed   Tests that have passed
 * @property {Array<MochaTestResult>} failed   Tests that have failed
 */

 /**
  * @typedef {Object} MochaTestResult
  * @property {String} parentTitle  Title of the parent test suite
  * @property {String} title        Title of the test case
  * @property {String} state        State of the test - 'passed' or 'failed'
  * @property {String} errMessage   This is defined if the test threw an error
  */

/**
 * <p>This class is a helper that will run Mocha tests and offers consistent
 * error reporting.</p>
 *
 * @example <caption>Usage in Browser Window</caption>
 * <script src="/node_modules/sw-testing-helpers/browser/mocha-utils.js"></script>
 * <script>
 * console.log(window.goog.mochaUtils);
 * </script>
 *
 * @example <caption>Usage in Service Worker</caption>
 * importScripts('/node_modules/sw-testing-helpers/browser/mocha-utils.js');
 * console.log(self.goog.mochaUtils);
 *
 * @example <caption>Usage in Node</caption>
 * const mochaUtils = require('sw-testing-helpers').mochaUtils;
 * console.log(mochaUtils);
 */
class MochaUtils {
  /**
   * Start Mocha tests in a browser, checking for leaks and
   * collect passed / failed results, resolving the promise with the results
   * in a friendly format.
   *
   * @return {Promise<MochaTestResults>} The resutls from the Mocha test
   */
  startInBrowserMochaTests() {
    return new Promise(resolve => {
      let passedTests = [];
      let failedTests = [];

      mocha.checkLeaks();

      var runResults = mocha.run();

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
      runResults.on('pass', test => {
        passedTests.push(this._getFriendlyTestResult(test));
      })
      .on('fail', test => {
        failedTests.push(this._getFriendlyTestResult(test));
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
  }

  /**
   * <p>Register a service worker and send a message to the service
   * worker to start running Mocha tests in the worker.</p>
   *
   * <p>It's expected that the service worker will import `mocha-utils.js` to
   * make this work seamlessly.</p>
   *
   * <p>This requires `window-utils.js` to be added to the page.</p>
   *
   * @param  {String} swPath The path to a service worker
   * @return {Promise.<MochaTestResults>}        Promise resolves when the tests
   * in the service worker have completed, returned the results.
   */
  startServiceWorkerMochaTests(swPath) {
    const sendMessage = (swController, testName, timeout) => {
      return new Promise((resolve, reject) => {
        var messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function(event) {
          resolve(event.data);
        };

        swController.postMessage(testName,
          [messageChannel.port2]);

        if (timeout) {
          setTimeout(() => reject(new Error('Message Timeout')), timeout);
        }
      });
    };

    return window.goog.swUtils.activateSW(swPath)
    .then(iframe => {
      return iframe.contentWindow.navigator.serviceWorker.ready
      .then(registration => {
        return registration.active;
      })
      .then(sw => {
        return sendMessage(sw, 'ready-check', 400)
        .then(msgResponse => {
          if (!msgResponse.ready) {
            return Promise.reject();
          }

          return sw;
        })
        .catch(() => {
          throw new Error('Service worker failed to respond to the ready ' +
            'check. Have you imported browser/mocha-utils.js in the SW?');
        });
      })
      .then(sw => {
        return sendMessage(sw, 'start-tests');
      })
      .then(msgResponse => {
        if (!msgResponse.testResults) {
          throw new Error('Unexpected test result: ' + msgResponse);
        }

        // Print test failues
        return msgResponse.testResults;
      });
    });
  }

  /**
   * <p>Print the User Agent of the browser, load the page
   * the Mocha tests are in and wait for the results.</p>
   *
   * @param  {String} browserName Name to be printed with the browsers UserAgent
   * @param  {WebDriver} driver   Instance of a {@link http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebDriver.html | WebDriver}
   * @param  {String} url         URL of that has mocha tests.
   * @return {Promise<MochaTestResults>}   Returns the results from the browsers tests
   */
  startWebDriverMochaTests(browserName, driver, url) {
    // The driver methods are wrapped in a new promise because the
    // selenium-webdriver API seems to using some custom promise
    // implementation that has slight behaviour differences.
    return new Promise((resolve, reject) => {
      const driverPromise = driver.get(url)
      .then(() => {
        return driver.executeScript(function() {
          return window.navigator.userAgent;
        });
      })
      .then(userAgent => {
        // This is just to help with debugging so we can get the browser version
        console.log('        [' + browserName + ' UA]: ' + userAgent);
      })
      .then(() => {
        // We get webdriver to wait until window.testsuite.testResults is defined.
        // This is set in the in browser mocha tests when the tests have finished
        // successfully
        return driver.wait(function() {
          return driver.executeScript(function() {
            return (typeof window.testsuite !== 'undefined') &&
              (typeof window.testsuite.testResults !== 'undefined');
          });
        });
      })
      .then(() => {
        // This simply retrieves the test results from the inbrowser mocha tests
        return driver.executeScript('return window.testsuite.testResults;');
      })
      .then(testResults => {
        // Resolve the outer promise to get out of the webdriver promise chain
        resolve(testResults);
      });

      if (driverPromise.thenCatch) {
        driverPromise.thenCatch(reject);
      } else {
        driverPromise.catch(reject);
      }
    });
  }

  _getFriendlyTestResult(testResult) {
    const friendlyResult = {
      parentTitle: testResult.parent.title,
      title: testResult.title,
      state: testResult.state
    };

    if (testResult.err) {
      friendlyResult.errMessage = testResult.err.message;
    }

    return friendlyResult;
  }

  /**
   * Present any failed tests in a friendly format. Useful if you are running
   * tests on a CI like Travis and want to be able to understand the errors
   * quickly.
   *
   * @param  {String} identifier  This will be printed at the top of the output.
   * It should be something that will help you identify which tests these logs
   * belong to (i.e. the service worker file, or browser name).
   * @param  {MochaTestRestuls} testResults The results to log.
   * @return {String}           The return is a string that can be prited to
   * standard out. If there are any errors this method will return null.
   */
  prettyPrintErrors(identifier, testResults) {
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
}

if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
  throw new Error('To use MochaUtils in the browser please use the ' +
    'browser/mocha-utils.js file');
}

module.exports = new MochaUtils();
