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

'use strict';

// These tests make use of selenium-webdriver. You can find the relevant
// documentation here: http://selenium.googlecode.com/git/docs/api/javascript/index.html

require('chai').should();
const path = require('path');
const seleniumAssistant = require('selenium-assistant');

const mochaHelper = require('../build/utils/mocha.js');
const SWTestingHelpers = require('../build/index.js');
const mochaUtils = SWTestingHelpers.mochaUtils;
const TestServer = SWTestingHelpers.TestServer;

describe('Perform Browser Tests', function() {
  if (process.env.TRAVIS && process.platform === 'darwin') {
    console.warn('Skipping automated browser tests on Travis OS X.');
    return;
  }

  // Browser tests can be slow
  this.timeout(60000);

  let globalDriverReference = null;
  let testServer = null;
  let testServerURL;

  before(function() {
    testServer = new TestServer();
    return testServer.startServer(path.join(__dirname, '..'))
    .then(portNumber => {
      testServerURL = `http://localhost:${portNumber}`;
    });
  });

  after(function() {
    testServer.killServer();
  });

  afterEach(function() {
    this.timeout(10000);

    if (!globalDriverReference) {
      return;
    }

    return seleniumAssistant.killWebDriver(globalDriverReference)
    .then(() => {
      globalDriverReference = null;
    });
  });

  const queueUnitTest = browserInfo => {
    it(`should pass all tests in ${browserInfo.getPrettyName()}`, () => {
      return browserInfo.getSeleniumDriver()
      .then(driver => {
        globalDriverReference = driver;
      })
      .then(() => {
        return mochaUtils.startWebDriverMochaTests(
          browserInfo.getPrettyName(),
          globalDriverReference,
          `${testServerURL}/test/browser-tests/`
        );
      })
      .then(testResults => {
        if (testResults.failed.length > 0) {
          const errorMessage = mochaHelper.prettyPrintErrors(
            browserInfo.getPrettyName(),
            testResults
          );

          throw new Error(errorMessage);
        }
      });
    });
  };

  const automatedBrowsers = seleniumAssistant.getAvailableBrowsers();
  automatedBrowsers.forEach(browserInfo => {
    // Only skip bad tests on Travis - not locally
    if (process.env.TRAVIS || process.env.RELEASE_SCRIPT) {
      if (browserInfo.getSeleniumBrowserId() === 'firefox' &&
        browserInfo.getVersionNumber() <= 50) {
        return;
      } else if (browserInfo.getSeleniumBrowserId() === 'opera' &&
        browserInfo.getVersionNumber() <= 39) {
        // Opera can't unregister server workers when run with selenium
        return;
      }
    }

    // Skip bad tests locally
    if (browserInfo.getSeleniumBrowserId() === 'firefox' &&
      browserInfo.getVersionNumber() <= 47) {
      // There is a bug in FF 47 that prevents Marionette working - skipping;
      return;
    }

    if (browserInfo.getReleaseName() === 'unstable') {
      // Stick to stable and beta for reliable tests
      return;
    }

    queueUnitTest(browserInfo);
  });
});
