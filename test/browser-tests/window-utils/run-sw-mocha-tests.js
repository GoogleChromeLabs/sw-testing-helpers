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

describe('Test MochaUtils.startServiceWorkerMochaTests()', function() {

  const SERVICE_WORKER_PATH = '/test/browser-tests/window-utils/serviceworkers';

  beforeEach(function() {
    return window.goog.swUtils.cleanState();
  });

  after(function() {
    return window.goog.swUtils.cleanState();
  });

  it('should reject with no arugments', function() {
    return window.goog.mochaUtils.startServiceWorkerMochaTests()
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with array arugment', function() {
    return window.goog.mochaUtils.startServiceWorkerMochaTests([])
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with object arugment', function() {
    return window.goog.mochaUtils.startServiceWorkerMochaTests({})
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with invalid sw path', function() {
    return window.goog.mochaUtils.startServiceWorkerMochaTests(SERVICE_WORKER_PATH + '/sw-doesnt-exist.js')
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with sw that has no message listener', function() {
    return window.goog.mochaUtils.startServiceWorkerMochaTests(SERVICE_WORKER_PATH + '/sw-1.js')
    .then(() => new Error('Should have rejected'), err => {
      err.message.should.contain('mocha-utils');
    });
  });

  it('should resolve with sw that has no tests', function() {
    return window.goog.mochaUtils.startServiceWorkerMochaTests(SERVICE_WORKER_PATH + '/sw-no-tests.js')
    .then(testResults => {
      testResults.passed.should.be.defined;
      testResults.failed.should.be.defined;

      testResults.passed.length.should.equal(0);
      testResults.failed.length.should.equal(0);
    });
  });

  it('should resolve with tests from example tests', function() {
    this.timeout(6000);
    return window.goog.mochaUtils.startServiceWorkerMochaTests(SERVICE_WORKER_PATH + '/example-tests.js')
    .then(testResults => {
      testResults.failed.length.should.equal(1);
      testResults.failed[0].errMessage.should.equal('I`m an Error. Hi.');
      testResults.failed[0].parentTitle.should.equal('Example SW Tests');
      testResults.failed[0].state.should.equal('failed');
      testResults.failed[0].title.should.equal('should throw an error');

      const errorMessage = window.goog.mochaUtils.prettyPrintErrors(
        '/test/browser-tests/service-worker.js',
        testResults
      );

      (errorMessage.indexOf('I`m an Error. Hi.') !== -1).should.equal(true);
      (errorMessage.indexOf('Example SW Tests') !== -1).should.equal(true);
      (errorMessage.indexOf('should throw an error') !== -1).should.equal(true);
    });
  });

});
