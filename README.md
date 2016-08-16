# sw-testing-helpers

[![Build Status](https://travis-ci.org/GoogleChrome/sw-testing-helpers.svg?branch=master)](https://travis-ci.org/GoogleChrome/sw-testing-helpers) [![Dependency Status](https://david-dm.org/GoogleChrome/sw-testing-helpers.svg)](https://david-dm.org/GoogleChrome/sw-testing-helpers) [![devDependency Status](https://david-dm.org/GoogleChrome/sw-testing-helpers/dev-status.svg)](https://david-dm.org/GoogleChrome/sw-testing-helpers#info=devDependencies)

## Running Cross Browser Tests

1. Get the discoverable browsers in the current environment:

    ``` javascript
    const automatedBrowserTesting = require('sw-testing-helpers').automatedBrowserTesting;
    const discoverableBrowsers = automatedBrowserTesting.getDiscoverableBrowsers();
    discoverableBrowsers.forEach(webDriverBrowser => {
      // See WebDriverBrowser docs for more info
    });
    ```

1. Start a mocha test in a browser like so:

    ``` javascript
    const mochaUtils = require('sw-testing-helpers').mochaUtils;
    mochaUtils.startWebDriverMochaTests(
      browserInfo.getPrettyName(),
      globalDriverReference,
      `${testServerURL}/test/browser-tests/`
    )
    .then(testResults => {
      if (testResults.failed.length > 0) {
        const errorMessage = mochaHelper.prettyPrintErrors(
          browserInfo.getPrettyName(),
          testResults
        );

        throw new Error(errorMessage);
      }
    });
    ```

## Browser Mocha Tests

To run tests in the browser that will automatically return the results
in a friendly format add the following to your mocha test page:

``` html
<!-- sw-testing-helper -->
<script src="/node_modules/sw-testing-helper/browser/mocha-utils.js"></script>

<script>mocha.setup({
  ui: 'bdd'
})</script>

<!-- Add test scripts here -->

<script>
  (function() {
    // should adds objects to prototypes which requires this call to be made
    // before any tests are run.
    window.chai.should();

    window.goog.mochaUtils.startInBrowserMochaTests()
    .then(results => {
      window.testsuite = results;
    });
  })();
</script>
```

## Service Worker Mocha Tests

If you want to run a set of unit tests in a service worker you can start them
and get the results as follows:

1. In your web page create your unit test as follows:

    ```javascript
    it('should perform sw tests', function() {
      return window.goog.mochaUtils.startServiceWorkerMochaTests(SERVICE_WORKER_PATH + '/test-sw.js')
      .then(testResults => {
        if (testResults.failed.length > 0) {
          const errorMessage = window.goog.mochaUtils
            .prettyPrintErrors(loadedSW, testResults);
          throw new Error(errorMessage);
        }
      });
    }
    ```

1. Inside your service worker you need to import, mocha, chai and
mocha-utils.js (Note: mocha.run() will be automatically called
by mocha-utils.js):

    ``` javascript
    importScripts('/node_modules/mocha/mocha.js');
    importScripts('/node_modules/chai/chai.js');
    importScripts('/node_modules/sw-testing-helpers/browser/mocha-utils.js');

    self.chai.should();
    mocha.setup({
      ui: 'bdd',
      reporter: null
    });

    describe('Test Suite in Service Worker', function() {
      it('shoud ....', function() {

      });
    });
    ```

## Publishing Docs

If you wish to automatically publish docs when master is updated and add
a versioned UI on github pages for release docs, you can make use of the
`publish-docs.sh` script.

1. Travis will need to commit to gh-pages, this done by:
    1. Create Github token here: https://github.com/settings/tokens/new
    1. Copy the Github Token and encrypt it with the Travis CLI:
        1. `gem install travis`
        1. `travis encrypt GH_TOKEN=<Github Token Here>`
    1. Copy the `secure: "<Secure String>"` output
    1. In your `.travis.yml` file, add secure to your environment variables with
    a GH_REF variable so your environments look like the following:

        ```
        env:
          global:
            - secure: "<Output from travis encrypt command>"
            - GH_REF: github.com/<username>/<repo>.git
        ```

1. In your `.travis.yml` file add the following to end of your script:

    ```
    script:
      - ..........
      - if [[ "$TRAVIS_BRANCH" = "master" && "$TRAVIS_OS_NAME" = "linux" && "$TRAVIS_PULL_REQUEST" = "false" ]]; then
        ./node_modules/sw-testing-helpers/project/publish-docs.sh master;
      fi
    ```

1. In your `package.json` file add a `build-docs` run-script that creates
your docs in a directory called `./docs/`:

    ```
    "scripts": {
      "build-docs": "jsdoc -c ./jsdoc.conf"
    }
    ```

> PLEASE NOTE: You <strong>MUST</strong> build the docs into the `./docs/`
> directory!

If you use the `publish-release.sh` script, it will build the docs
and automatically publish them on github pages under a revisioned name.

<strong>Doc Template</strong>

The UI used by `publish-docs.sh` is the sample project from a
Jekyll project customised to support versioned docs and will be updated
in the project whenever sw-testing-helpers is updated.

## Publishing a New Release

When publishing to NPM and / or Bower, there are a few common steps that should
be taken:

1. Build new version of the source if needed
1. Ensure that the tests are passing
1. Bump the version number
1. Build docs to publish with the new versions
1. Create a bundle of the necessary files to release
1. Tag the release on Git and publish on NPM
1. Publish the docs to Github Pages

The `publish-release.sh` does all of the above. It takes a single
argument of `patch`, `minor` or `major` and will create a new release
bumping the semver version based on the above argument.

You need to ensure you have the following npm run-scripts:

1. build
    * This is a chance to perform any build steps your project needs
    (i.e. `gulp build`).
1. build-docs
    * This is a chance to build the docs for the current state of the project.
1. test
    * Run tests based on the previous steps to ensure what is release works.
1. bundle
    * This command passes in an argument that is the path you should copy
    files to publish (i.e. src, build, docs, README, LICENSE).

With this you can add the publish-releash script to an npm script:

```
"scripts": {
  "publish-release": "./node_modules/sw-testing-helpers/project/publish-release.sh",
  ....
}
```

To publish a patch release:

```
npm run publish-release patch
```

## sw-testing-helpers Docs

You can [find docs here](http://googlechrome.github.io/sw-testing-helpers/).

Any and all help welcome with this grab bag of stuff.

## License

Copyright 2015 Google, Inc.

Licensed under the [Apache License, Version 2.0](LICENSE) (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
