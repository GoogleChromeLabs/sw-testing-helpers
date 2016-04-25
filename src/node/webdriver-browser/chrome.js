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

const which = require('which');
const chromeOptions = require('selenium-webdriver/chrome');
const WebDriverBrowser = require('./web-driver-browser');

/**
 * <p>Handles the prettyName and executable path for Chrome browser.</p>
 *
 * @private
 * @extends WebDriverBrowser
 */
class ChromeWebDriverBrowser extends WebDriverBrowser {
  constructor(release) {
    let prettyName = 'Google Chrome';

    if (release === 'beta') {
      prettyName += ' Beta';
    } else if (release === 'unstable') {
      prettyName += ' Dev / Canary';
    }

    super(
      prettyName,
      release,
      'chrome',
      new chromeOptions.Options()
    );
  }

  _getExecutablePath(release) {
    try {
      if (release === 'stable') {
        if (process.platform === 'darwin') {
          return '/Applications/Google Chrome.app/' +
            'Contents/MacOS/Google Chrome';
        } else if (process.platform === 'linux') {
          return which.sync('google-chrome');
        }
      } else if (release === 'beta') {
        if (process.platform === 'darwin') {
          return '/Applications/Google Chrome Beta.app/' +
            'Contents/MacOS/Google Chrome Beta';
        } else if (process.platform === 'linux') {
          return which.sync('google-chrome-beta');
        }
      } else if (release === 'unstable') {
        if (process.platform === 'darwin') {
          return '/Applications/Google Chrome Canary.app/' +
            'Contents/MacOS/Google Chrome Canary';
        } else if (process.platform === 'linux') {
          return which.sync('google-chrome-unstable');
        }
      }
    } catch (err) {}

    return null;
  }
}

module.exports = ChromeWebDriverBrowser;
