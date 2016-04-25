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

/* eslint-env browser */

/**
 * <p>SWUtils can be used in a <strong>webpage only</strong>.</p>
 *
 * <p>This is helpful for managing service worker registrations and
 * cache creation / clean up between unit tests.</p>
 *
 * @example
 * <script src="/node_modules/sw-testing-helper/browser/sw-utils.js"></script>
 *
 * <script>
 * 	console.log(window.goog.swUtils);
 * </script>
 */
class SWUtils {
  constructor() {
    // The test counter ensures a unique scope between each test.
    // testTime is used to ensure a unique scope between runs of
    // the test suite - useful if manual testing parts of the
    // suite in different tabs at the same time.
    this._testCounter = 0;
    this._testTime = new Date().getTime();
  }

  /**
   * Helper method to determine when a specific state is achieved within
   * a service worker (i.e. it becomes installed or activated).
   *
   * @private
   *
   * @param  {ServiceWorkerRegistration} registration registration to watch
   *   for state changes
   * @param  {String} desiredState Name of the desired state to wait for
   * @return {Promise}        Resolves when the desired state is reached
   */
  _onStateChangePromise(registration, desiredState) {
    return new Promise((resolve, reject) => {
      if (registration.installing === null) {
        throw new Error('Service worker is not installing. Did you call ' +
          'cleanState() to unregister this service?');
      }

      var serviceWorker = registration.installing;

      // We unregister all service workers after each test - this should
      // always trigger an install state change
      var stateChangeListener = function() {
        if (this.state === desiredState) {
          serviceWorker.removeEventListener('statechange', stateChangeListener);
          resolve();
          return;
        }

        if (this.state === 'redundant') {
          serviceWorker.removeEventListener('statechange', stateChangeListener);

          // Must call reject rather than throw error here due to this
          // being inside the scope of the callback function stateChangeListener
          reject(new Error('Installing servier worker became redundant'));
          return;
        }
      };

      serviceWorker.addEventListener('statechange', stateChangeListener);
    });
  }

  /**
   * <p>When a service worker is installed / activated using SWUtils,
   * it'll be registered with a unqiue scope and an iframe will be
   * created matching that scope (allowing it to be controlled by that
   * service worker only).</p>
   *
   * <p>This method will get you the current iframe (if in the middle of a test)
   * or create a new iframe.</p>
   *
   * @return {Promise.<HTMLElement>} Resolves to the current iframe being
   * used for tests.
   */
  getIframe() {
    return new Promise(resolve => {
      var existingIframe = document.querySelector('.js-test-iframe');
      if (existingIframe) {
        return resolve(existingIframe);
      }

      // This will be used as a unique service worker scope
      this._testCounter++;

      var newIframe = document.createElement('iframe');
      newIframe.classList.add('js-test-iframe');
      newIframe.addEventListener('load', () => {
        resolve(newIframe);
      });
      newIframe.src = `/test/iframe/${this._testTime}${this._testCounter}`;
      document.body.appendChild(newIframe);
    });
  }

  /**
   * Loop through all registrations for the current origin and unregister them.
   *
   * @return {Promise} Resolves once all promises are unregistered
   */
  unregisterAllRegistrations() {
    return navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        return Promise.all(registrations.map(registration => {
          return registration.unregister();
        }));
      });
  }

  /**
   * Loop over all caches for the current origin and delete them.
   *
   * @return {Promise} Resolves once all caches are deleted
   */
  clearAllCaches() {
    return window.caches.keys()
      .then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
          return window.caches.delete(cacheName);
        }));
      });
  }

  /**
   * <p>Register a service worker to a unique scope and
   * create an iframe it can control, wait until the service worker's
   * install step has completed.</p>
   *
   * <p>Useful for testing events that occur in the install event (i.e.
   * pre-caching of assets).</p>
   *
   * @param  {String} swUrl The url to a service worker file to register
   * @return {Promise.<HTMLElement>}       Resolves once the service worker is
   * installed and returns the iframe it controls.
   */
  installSW(swUrl) {
    return new Promise((resolve, reject) => {
      var iframe;
      this.getIframe()
      .then(newIframe => {
        var options = null;
        if (newIframe) {
          iframe = newIframe;
          options = {scope: newIframe.contentWindow.location.pathname};
        }

        return navigator.serviceWorker.register(swUrl, options);
      })
      .then(registration => {
        return this._onStateChangePromise(registration, 'installed');
      })
      .then(() => resolve(iframe))
      .catch(err => reject(err));
    });
  }

  /**
   * <p>Register a service worker with a unique scope and
   * create an iframe that can be controlled by that service worker, then
   * wait until the service worker's activate step has completed.</p>
   *
   * <p>Useful for testing fetch events that can't occur until after the
   * service worker has activated.</p>
   *
   * @param  {String} swUrl The url to a service worker file to register
   * @return {Promise.<HTMLElement>}       Resolves once the service worker is
   * activated and returns the iframe it controls.
   */
  activateSW(swUrl) {
    return new Promise((resolve, reject) => {
      var iframe;
      this.getIframe()
      .then(newIframe => {
        var options = null;
        if (newIframe) {
          options = {scope: newIframe.contentWindow.location.pathname};
          iframe = newIframe;
        }
        return navigator.serviceWorker.register(swUrl, options);
      })
      .then(registration => {
        return this._onStateChangePromise(registration, 'activated');
      })
      .then(() => resolve(iframe))
      .catch(err => reject(err));
    });
  }

  /**
   * <p>Helper method that checks a cache with a specific name exists before
   * retrieving all the cached responses inside of it.</p>
   *
   * <p>This is limited to text responses at the moment.</p>
   *
   * <p><strong>NOTE: </strong>This will reject if the cache doesn't exist.</p>
   *
   * @param  {String} cacheName The name of the cache to get the contents from.
   * @return {Promise.<Object>}           Resolves to an object where the keys
   * are URLs for the cache responses and the value is the text from the response.
   * The promise rejects if the cache doesn't exist.
   */
  getAllCachedAssets(cacheName) {
    var cache = null;
    return window.caches.has(cacheName)
      .then(hasCache => {
        if (!hasCache) {
          throw new Error('Cache doesn\'t exist.');
        }

        return window.caches.open(cacheName);
      })
      .then(openedCache => {
        cache = openedCache;
        return cache.keys();
      })
      .then(cachedRequests => {
        return Promise.all(cachedRequests.map(cachedRequest => {
          return cache.match(cachedRequest)
          .then(response => {
            return {
              request: cachedRequest,
              response: response
            };
          });
        }));
      })
      .then(cacheRequestResponsePairs => {
        // This method extracts the response streams and pairs
        // them with a url.
        var output = {};
        cacheRequestResponsePairs.forEach(cacheRequestResponsePair => {
          output[cacheRequestResponsePair.request.url] =
            cacheRequestResponsePair.response;
        });

        return output;
      });
  }

  /**
   * Helper to unregister all service workers and clear all caches.
   *
   * @return {Promise} Resolves once service workers are unregistered and caches
   * are deleted.
   */
  cleanState() {
    return Promise.all([
      this.unregisterAllRegistrations(),
      this.clearAllCaches()
    ])
    .then(() => {
      var iframeList = document.querySelectorAll('.js-test-iframe');
      for (var i = 0; i < iframeList.length; i++) {
        iframeList[i].parentElement.removeChild(iframeList[i]);
      }
    });
  }
}

window.goog = window.goog || {};
window.goog.swUtils = window.goog.swUtils || new SWUtils();
