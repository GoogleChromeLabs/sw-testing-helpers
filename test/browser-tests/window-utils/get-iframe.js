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

describe('Test swUtils.getIframe()', function() {
  let firstIframeSrc = null;

  beforeEach(function() {
    return window.goog.swUtils.cleanState();
  });

  after(function() {
    return window.goog.swUtils.cleanState();
  });

  it('should create a new iframe with a src starting with /test/iframe', function() {
    return window.goog.swUtils.getIframe()
    .then(iframe => {
      iframe.should.be.defined;
      iframe.src.should.be.defined;
      iframe.src.indexOf('/test/iframe/').should.not.equal(-1);

      firstIframeSrc = iframe.src;
    });
  });

  it('should create a new iframe with unique src', function() {
    return window.goog.swUtils.getIframe()
    .then(iframe => {
      firstIframeSrc.should.not.equal(iframe.src);
    });
  });

  it('should return the same iframe in the same test', function() {
    let firstIframe = 0;
    return window.goog.swUtils.getIframe()
    .then(iframe => {
      firstIframe = iframe;
      return window.goog.swUtils.getIframe();
    })
    .then(iframe => {
      iframe.should.equal(firstIframe);
    });
  });
});
