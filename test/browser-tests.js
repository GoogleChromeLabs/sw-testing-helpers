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


const path = require('path');
const seleniumAssistant = require('selenium-assistant');

const SWTestingHelpers = require('../build/index.js');
const mochaUtils = SWTestingHelpers.mochaUtils;
const TestServer = SWTestingHelpers.TestServer;

require('geckodriver');
require('chromedriver');

require('chai').should();

describe('Perform Browser Tests', function() {
  this.timeout(4 * 60 * 1000);
  this.retries(3);

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
        if (testResults.failed.length !== 1) {
          throw new Error('Failing Browser Test(s). See log for details.');
        } else {
          testResults.failed[0].errMessage.should.equal('I`m an Error. Hi.');
          if (testResults.failed[0].stack.indexOf('window-utils/serviceworkers/example-tests.js:41') == -1) {
            throw new Error('The stack trace does not include the correct path of the error.');
          }
        }
      });
    });
  };

  seleniumAssistant.printAvailableBrowserInfo();

  const automatedBrowsers = seleniumAssistant.getLocalBrowsers();
  automatedBrowsers.forEach(browserInfo => {
    switch (browserInfo.getId()) {
      case 'firefox':
        if (browserInfo.getVersionNumber() <= 50) {
          console.warn('Skipping FF version 50 or less due to travis issues.');
          return;
        }
        queueUnitTest(browserInfo);
        break;
      case 'chrome':
        queueUnitTest(browserInfo);
        break;
    }
  });
});
