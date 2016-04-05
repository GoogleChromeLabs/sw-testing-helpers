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

/* eslint-env browser, mocha */

describe('Example Tests', function() {
  it('should do nothing', function() {

  });

  it('should be able to identify a Date as a Date', function() {
    (new Date() instanceof Date).should.equal(true);
  });

  it('should throw an error', function() {
    throw new Error('I`m an Error. Hi.');
  });

  it('should run service worker tests', function() {
    const swPath = '/test/browser-tests/service-worker.js';
    return window.goog.WindowUtils.runMochaTests(swPath)
    .then(testResults => {
      testResults.failed.length.should.equal(1);
      testResults.failed[0].errMessage.should.equal('I`m an Error. Hi.');
      testResults.failed[0].parentTitle.should.equal('Example SW Tests');
      testResults.failed[0].state.should.equal('failed');
      testResults.failed[0].title.should.equal('should throw an error');

      const errorMessage = window.goog.MochaUtils.prettyPrintErrors(
        swPath,
        testResults
      );

      (errorMessage.indexOf('I`m an Error. Hi.') !== -1).should.equal(true);
      (errorMessage.indexOf('Example SW Tests') !== -1).should.equal(true);
      (errorMessage.indexOf('should throw an error') !== -1).should.equal(true);
    });
  });
});
