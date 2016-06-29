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

/* eslint-env node */

const TestServer = require('./node/test-server');
const mochaUtils = require('./utils/mocha');

/**
 * <p>sw-testing-helpers can be used in node, a browser or in a service worker.
 * Different classes are exposed depending on what is imported and where.</p>
 *
 * <p>When you require `sw-testing-helpers` you'll have access to a few
 * parameters</p>
 *
 * <p><pre><code>require('sw-testing-helpers').TestServer;
 * require('sw-testing-helpers').mochaUtils;</code></pre></p>
 *
 * @module sw-testing-helpers
 * @property {TestServer} TestServer                             The TestServer class
 * that can be extended and instantiated.
 * @property {MochaUtils} mochaUtils                             An instance of
 * the MochaUtils class.
 */
module.exports = {
  TestServer: TestServer,
  mochaUtils: mochaUtils
};
