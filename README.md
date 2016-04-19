# sw-testing-helpers

[![Build Status](https://travis-ci.org/GoogleChrome/sw-testing-helpers.svg?branch=master)](https://travis-ci.org/GoogleChrome/sw-testing-helpers) [![Dependency Status](https://david-dm.org/GoogleChrome/sw-testing-helpers.svg)](https://david-dm.org/GoogleChrome/sw-testing-helpers) [![devDependency Status](https://david-dm.org/GoogleChrome/sw-testing-helpers/dev-status.svg)](https://david-dm.org/GoogleChrome/sw-testing-helpers#info=devDependencies)

This Repo is largely to share code across several libraries being developed
by the Web DevRel team.

One thing to note, these helper methods exist to layer on helpers around the
the tests.

A typical test suite would do the following:
- Start a browser using helper methods from `automated-browser-testing.js`
- Load a page in that browser which will run mocha tests.
    - In the page use `window.goog.MochaUtils.startMochaTest()` which runs
    the mocha tests and returns a predefined format of tests to set
    on the window object.
    - Some tests in a page may use
    `window.goog.WindowUtils.runSWMochaTests('/sw.js')` to run mocha tests in a
    service worker and wait for the result.
      - In the service worker import `/build/browser/sw-utils.js` to manage
      messaging between the page and the service worker.

## Running Cross Browser Tests

For examples of how to start tests in Chrome and Firefox in an automated
fashion look at `/test/automated-browser-tests.js`.

## Mocha Tests

There are some helpers in this repo to help with running Mocha tests in
a browser and / or in a service worker.

View the following files for how to use this library:
- To start a test suite that returns a promise when it's completed the test
suite, view `/test/browser-tests/index.html`.
- To start a set of mocha tests in a service worker (initiated from an
  in page test), view `/test/browser-tests/window-utils/run-sw-mocha-tests.js`

## Publishing Docs and / or Project

There are two shell scripts that help with deploying docs to github pages
and / or help publish your project to NPM with tagging to git.

The two shell scripts to look at are:

- `/project/publish-docs.sh`
- `/project/publish-release.sh`

Instructions on how to use these shell scripts can be found in the comments
at the top of the docs. They rely on npm run scripts to perform specific
actions.

## Doc Template

For a few projects it made sense to have a template for doc pages, just to
manage the versions of docs as well as keep a version of the docs for the
master branch of a doc.

This is all kept in `/docs-template/`.

## sw-testing-helpers Docs

You can [find docs here](http://googlechrome.github.io/sw-testing-helpers/).

Any and all help welcome with this grab bag of stuff.
