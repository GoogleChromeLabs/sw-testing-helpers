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

/* eslint-env worker, serviceworker, mocha */

importScripts('/node_modules/mocha/mocha.js');
importScripts('/node_modules/chai/chai.js');
importScripts('/build/browser/mocha-utils.js');

self.chai.should();
mocha.setup({
  ui: 'bdd',
  reporter: null
});

mocha.checkLeaks();
mocha.globals(['goog']);

describe('Example SW Tests', function() {
  it('should do nothing', function() {

  });

  it('should be able to identify a Date as a Date', function() {
    (new Date() instanceof Date).should.equal(true);
  });

  it('[NOTE: This is designed to be an error in SW. Used to test that errors bubble up same as passed tests. Passing tests while printing a failing error is by design and is "A OK".]', function() {
    throw new Error('I`m an Error. Hi.');
  });
});
