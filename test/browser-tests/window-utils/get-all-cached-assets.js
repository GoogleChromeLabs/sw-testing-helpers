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

describe('Test swUtils.getAllCachedAssets()', function() {

  beforeEach(function() {
    return window.goog.swUtils.cleanState();
  });

  after(function() {
    return window.goog.swUtils.cleanState();
  });

  it('should reject with no arugments', function() {
    return window.goog.swUtils.getAllCachedAssets()
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with array arugment', function() {
    return window.goog.swUtils.getAllCachedAssets([])
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject with object arugment', function() {
    return window.goog.swUtils.getAllCachedAssets({})
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should reject when a non-existant cache name is given', function() {
    return window.goog.swUtils.getAllCachedAssets('no-cache-here')
    .then(() => {
      throw new Error('Should have rejected');
    }, () => {
      // Expected error thrown
    });
  });

  it('should resolve when an existing cache name is given', function() {
    return window.caches.open('hello')
    .then(cache => {
      return cache.put('/', new Response('hello'));
    })
    .then(() => {
      return window.caches.open('hello-2');
    })
    .then(cache => {
      return Promise.all([
        cache.put('/', new Response('hello-2')),
        cache.put('/2', new Response('hello-2-2'))
      ]);
    })
    .then(() => {
      return window.goog.swUtils.getAllCachedAssets('hello');
    })
    .then(assets => {
      const assetUrls = Object.keys(assets);
      assetUrls.length.should.equal(1);
      assetUrls.indexOf(window.location.origin + '/').should.not.equal(-1);

      return Promise.all([
        assets[window.location.origin + '/'].text()
        .then(textResponse => {
          textResponse.should.equal('hello');
        })
      ]);
    })
    .then(() => {
      return window.goog.swUtils.getAllCachedAssets('hello-2');
    })
    .then(assets => {
      const assetUrls = Object.keys(assets);
      assetUrls.length.should.equal(2);
      assetUrls.indexOf(window.location.origin + '/').should.not.equal(-1);
      assetUrls.indexOf(window.location.origin + '/2').should.not.equal(-1);

      return Promise.all([
        assets[window.location.origin + '/'].text()
        .then(textResponse => {
          textResponse.should.equal('hello-2');
        }),
        assets[window.location.origin + '/2'].text()
        .then(textResponse => {
          textResponse.should.equal('hello-2-2');
        })
      ]);
    });
  });
});
