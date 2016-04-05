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
 * <p>WindowUtils can be used in a *webpage only* i.e. must have access to a
 * window object.</p>
 *
 * <p>Accessible via: window.goog.WindowUtils</p>
 *
 * <p>The main uses for these utils are:</p>
 * <ul>
 * <li>Managing service workers by loading pages in an iframe to reduce scope</li>
 * <li>Helpers to unregister service workers and remove caches</li>
 * <li>Run mocha tests in a service worker. If you use this, it's expected you'll
 * also make use of the SWUtils inside the service worker.</li>
 * </ul>
 */
class WindowUtils {
  constructor() {
    // The test counter ensures a unique scope between each test.
    // testTime is used to ensure a unique scope between runs of
    // the test suite - useful if manual testing parts of the
    // suite in different tabs at the same time.
    this._testCounter = 0;
    this._testTime = new Date().getTime();
    this._messageListeners = [];
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
        throw new Error('Service worker is not installing.');
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
   * <p>When a service worker is installed / activated using WindowUtils
   * it'lls be registered with a unqiue scope and an iframe will be
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
      newIframe.src = `/test/iframe/${this._testTime}${this._testCounter}`;
      newIframe.addEventListener('load', () => {
        resolve(newIframe);
      });
      document.body.appendChild(newIframe);
    });
  }

  /**
   * Loop through all registrations for the current origin and unregister them.
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
   * Loop over all caches for the current origin and delete them
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
   * <p>This method registers a service worker to a unique scope and
   * creates an iframe it can control and waits until the service workers
   * install step has completed.</p>
   *
   * <p>This is useful for scenarios where you only care
   * about testing events that have occured in the install event (i.e.
   * pre-caching assets).</p>
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
          options = {scope: iframe.contentWindow.location.pathname};
          iframe = newIframe;
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
   * <p>Similar to installSW. This method registers a service worker to a unique scope and
   * creates an iframe it can control and waits until the service workers
   * activate step has completed.</p>
   *
   * <p>Useful when you want to test fetch events that can't happen until the
   * service worker has activated.</p>
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
   * <p>This is limited to text at the moment.</p>
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
      .then(cacheKeys => {
        return Promise.all(cacheKeys.map(cacheKey => {
          return cache.match(cacheKey);
        }));
      })
      .then(cacheResponses => {
        // This method extracts the response streams and pairs
        // them with a url.
        var output = {};
        cacheResponses.forEach(response => {
          output[response.url] = response;
        });
        return output;
      });
  }

  /**
   * Helper to unregister all service workers and clean all caches.
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
    })
    .then(() => {
      this.messageListeners.forEach(function(listener) {
        navigator.serviceWorker.removeEventListener('message', listener);
      });
    });
  }

  /**
   * Helper to track added message listeners on a service worker and delete
   * them whne cleanState is called
   * @param {Function} cb The function to call when a message is received
   */
  addMessageListener(cb) {
    var messageListener = function(event) {
      cb(JSON.parse(event.data));
    };

    this.messageListeners.push(messageListener);

    navigator.serviceWorker.addEventListener('message', messageListener);
  }

  /**
   * The complete Triforce, or one or more components of the Triforce.
   * @typedef {Object} TestResult
   * @property {String} parentTitle - Title of the parent test suite
   * @property {String} state - Will be 'passed' or 'failed'
   * @property {String} title - Title of the test
   * @property {String} errMessage - Optional parameter if the test has failed
   */

  /**
   * The complete Triforce, or one or more components of the Triforce.
   * @typedef {Object} TestResults
   * @property {Array.<TestResult>} passed - Array of passed tests
   * @property {Array.<TestResult>} failed - Array of failed tests
   */

  /**
   * Method to send a message to a service worker to begin mocha tests.
   * It's expected that the service worker will import sw-utils in the service
   * worker to make this work seamlessly.
   * @param  {String} swPath The path to a service worker
   * @return {Promise.<TestResults>}        Promise resolves when the tests
   * in the service worker have completed.
   */
  runMochaTests(swPath) {
    const sendMessage = (swController, testName) => {
      return new Promise(function(resolve, reject) {
        var messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function(event) {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data);
          }
        };

        swController.postMessage(testName,
          [messageChannel.port2]);
      });
    };

    return window.goog.WindowUtils.activateSW(swPath)
    .then(iframe => {
      return iframe.contentWindow.navigator.serviceWorker.ready
      .then(registration => {
        return registration.active;
      })
      .then(sw => {
        return sendMessage(sw, 'start-tests');
      })
      .then(msgResponse => {
        if (!msgResponse.testResults) {
          throw new Error('Unexpected test result: ' + msgResponse);
        }

        // Print test failues
        return msgResponse.testResults;
      });
    });
  }
}

window.goog = window.goog || {};
window.goog.WindowUtils = window.goog.WindowUtils || new WindowUtils();
