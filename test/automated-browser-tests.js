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
const mochaHelper = require('../src/mocha/utils.js');
const SWTestingHelpers = require('../src/node/index.js');
const automatedBrowserTesting = SWTestingHelpers.automatedBrowserTesting;
const testServer = SWTestingHelpers.testServer;

describe('Perform Browser Tests', function() {
  // Browser tests can be slow
  this.timeout(60000);

  let globalDriverReference = null;
  let testServerURL;

  before(function() {
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

    return automatedBrowserTesting.killWebDriver(globalDriverReference);
  });

  const queueUnitTest = browserInfo => {
    it(`should pass all tests in ${browserInfo.prettyName}`, () => {
      globalDriverReference = browserInfo.getSeleniumDriver();

      return automatedBrowserTesting.runMochaTests(
        browserInfo.prettyName,
        globalDriverReference,
        `${testServerURL}/test/browser-tests/`
      )
      .then(testResults => {
        testResults.failed.length.should.equal(1);
        testResults.failed[0].errMessage.should.equal('I`m an Error. Hi.');
        testResults.failed[0].parentTitle.should.equal('Example Tests');
        testResults.failed[0].state.should.equal('failed');
        testResults.failed[0].title.should.equal('should throw an error');

        const errorMessage = mochaHelper.prettyPrintErrors(
          browserInfo.prettyName,
          testResults
        );

        (errorMessage.indexOf('I`m an Error. Hi.') !== -1).should.equal(true);
        (errorMessage.indexOf('Example Tests') !== -1).should.equal(true);
        (errorMessage.indexOf('should throw an error') !== -1).should.equal(true);
      });
    });
  };

  const automatedBrowsers = automatedBrowserTesting.getAutomatedBrowsers();
  automatedBrowsers.forEach(browserInfo => {
    if (browserInfo.releaseName === 'unstable') {
      return;
    }

    queueUnitTest(browserInfo);
  });
});
