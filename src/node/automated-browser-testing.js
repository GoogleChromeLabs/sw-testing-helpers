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
const fs = require('fs');
const chromeOptions = require('selenium-webdriver/chrome');
const firefoxOptions = require('selenium-webdriver/firefox');
const webdriver = require('selenium-webdriver');

class AutomatedBrowserTesting {
  getAutomatedBrowsers() {
    const browserExecutables = [
      {
        prettyName: 'Google Chrome',
        releaseName: 'stable',
        seleniumBrowserId: 'chrome',
        seleniumOptions: new chromeOptions.Options(),
        getExecutableName: () => {
          switch (process.platform) {
            case 'darwin': {
              const osXPath = '/Applications/Google Chrome.app/Contents/' +
                'MacOS/Google Chrome';

              // This will throw if it's not found
              fs.lstatSync(osXPath);

              return osXPath;
            }
            case 'linux':
              return which.sync('google-chrome');
            default:
              throw new Error('Sorry, this platform is ' +
                'unsupported at the moment');
          }
        }
      },
      {
        prettyName: 'Google Chrome Beta',
        seleniumBrowserId: 'chrome',
        releaseName: 'beta',
        seleniumOptions: new chromeOptions.Options(),
        getExecutableName: () => {
          switch (process.platform) {
            case 'darwin': {
              const osXPath = '/Applications/Google Chrome Beta.app/' +
                'Contents/MacOS/Google Chrome Beta';

              // This will throw if it's not found
              fs.lstatSync(osXPath);

              return osXPath;
            }
            case 'linux':
              return which.sync('google-chrome-beta');
            default:
              throw new Error('Sorry, this platform is ' +
                'unsupported at the moment');
          }
        }
      },
      {
        prettyName: 'Google Chrome Unstable',
        seleniumBrowserId: 'chrome',
        releaseName: 'unstable',
        seleniumOptions: new chromeOptions.Options(),
        getExecutableName: () => {
          switch (process.platform) {
            case 'darwin': {
              const osXPath = '/Applications/Google Chrome Canary.app/' +
                'Contents/MacOS/Google Chrome Canary';

              // This will throw if it's not found
              fs.lstatSync(osXPath);

              return osXPath;
            }
            case 'linux':
              return which.sync('google-chrome-unstable');
            default:
              throw new Error('Sorry, this platform is ' +
                'unsupported at the moment');
          }
        }
      },
      {
        prettyName: 'Firefox',
        seleniumBrowserId: 'firefox',
        releaseName: 'stable',
        seleniumOptions: new firefoxOptions.Options(),
        getExecutableName: () => {
          switch (process.platform) {
            case 'darwin': {
              const osXPath = '/Applications/Firefox.app/Contents/' +
                'MacOS/firefox';
              // This will throw if it's not found
              fs.lstatSync(osXPath);
              return osXPath;
            }
            case 'linux':
              return which.sync('firefox');
            default:
              throw new Error('Sorry, this platform is ' +
                'unsupported at the moment');
          }
        }
      },
      {
        prettyName: 'Firefox Beta',
        seleniumBrowserId: 'firefox',
        releaseName: 'beta',
        seleniumOptions: new firefoxOptions.Options(),
        getExecutableName: () => {
          switch (process.platform) {
            case 'linux':
              if (process.env.FF_BETA_PATH) {
                fs.lstatSync(process.env.FF_BETA_PATH);
                return process.env.FF_BETA_PATH;
              }
              throw new Error('FF_BETA_PATH must be set to run on Linux');
            default:
              throw new Error('Sorry, this platform is ' +
                'unsupported at the moment');
          }
        }
      },
      {
        prettyName: 'Firefox Nightly',
        seleniumBrowserId: 'firefox',
        releaseName: 'unstable',
        seleniumOptions: new firefoxOptions.Options(),
        getExecutableName: () => {
          switch (process.platform) {
            case 'darwin': {
              const osXPath = '/Applications/FirefoxNightly.app/Contents/' +
                'MacOS/firefox';
              // This will throw if it's not found
              fs.lstatSync(osXPath);
              return osXPath;
            }
            case 'linux':
              if (process.env.FF_NIGHTLY_PATH) {
                fs.lstatSync(process.env.FF_NIGHTLY_PATH);
                return process.env.FF_NIGHTLY_PATH;
              }
              throw new Error('FF_NIGHTLY_PATH must be set to run on Linux');
            default:
              throw new Error('Sorry, this platform is ' +
                'unsupported at the moment');
          }
        }
      }
    ];

    const discoverableBrowsers = [];
    browserExecutables.forEach(browserInfo => {
      try {
        const executablePath = browserInfo.getExecutableName();
        const seleniumOptions = browserInfo.seleniumOptions;

        if (seleniumOptions.setChromeBinaryPath) {
          seleniumOptions.setChromeBinaryPath(executablePath);
        } else if (seleniumOptions.setBinary) {
          seleniumOptions.setBinary(executablePath);
        } else {
          throw new Error('Unknown selenium options object');
        }

        browserInfo.getSeleniumDriver = () => {
          return new webdriver
            .Builder()
            .forBrowser(browserInfo.seleniumBrowserId)
            .setChromeOptions(browserInfo.seleniumOptions)
            .setFirefoxOptions(browserInfo.seleniumOptions)
            .build();
        };

        discoverableBrowsers.push(browserInfo);
      } catch (err) {
        // Unable to find the browser - chances are this isn't an error
        // but instead the browser is just not installed
      }
    });

    return discoverableBrowsers;
  }

  runMochaTests(browserName, driver, url) {
    // The driver methods are wrapped in a new promise because the
    // selenium-webdriver API seems to using some custom promise
    // implementation that has slight behaviour differences.
    return new Promise((resolve, reject) => {
      driver.get(url)
      .then(() => {
        return driver.executeScript('return window.navigator.userAgent;');
      })
      .then(userAgent => {
        // This is just to help with debugging so we can get the browser version
        console.log('        [' + browserName + ' UA]: ' + userAgent);
      })
      .then(() => {
        // We get webdriver to wait until window.testsuite.testResults is defined.
        // This is set in the in browser mocha tests when the tests have finished
        // successfully
        return driver.wait(function() {
          return driver.executeScript('return ((typeof window.testsuite !== ' +
            '\'undefined\') && window.testsuite.testResults !== ' +
            '\'undefined\');');
        });
      })
      .then(() => {
        // This simply retrieves the test results from the inbrowser mocha tests
        return driver.executeScript('return window.testsuite.testResults;');
      })
      .then(testResults => {
        // Resolve the outer promise to get out of the webdriver promise chain
        resolve(testResults);
      })
      .thenCatch(reject);
    });
  }

  killWebDriver(driver) {
    return new Promise(resolve => {
      if (driver === null) {
        return resolve();
      }

      // Suggested as fix to 'chrome not reachable'
      // http://stackoverflow.com/questions/23014220/webdriver-randomly-produces-chrome-not-reachable-on-linux-tests
      const timeoutGapCb = function() {
        setTimeout(resolve, 2000);
      };

      driver.quit()
      .then(() => {
        timeoutGapCb();
      })
      .thenCatch(() => {
        timeoutGapCb();
      });
    });
  }
}

module.exports = AutomatedBrowserTesting;
