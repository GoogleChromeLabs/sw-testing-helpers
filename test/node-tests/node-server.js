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

// These tests make use of selenium-webdriver. You can find the relevant
// documentation here: http://selenium.googlecode.com/git/docs/api/javascript/index.html

const fetch = require('node-fetch');
const expect = require('chai').expect;
require('chai').should();

const TestServer = require('../../build/index.js').TestServer;

describe('Perform Node TestServer', function() {
  let testServer;

  beforeEach(function() {
    if (testServer) {
      testServer.killServer();
      testServer = null;
    }
  });

  after(function() {
    if (testServer) {
      testServer.killServer();
      testServer = null;
    }
  });

  it('should throw an error on object input', function() {
    expect(function() {
      testServer = new TestServer({});
    }).to.throw(Error);
  });

  it('should throw an error on array input', function() {
    expect(function() {
      testServer = new TestServer([]);
    }).to.throw(Error);
  });

  it('should throw an error on string input', function() {
    expect(function() {
      testServer = new TestServer('');
    }).to.throw(Error);
  });

  it('should create a new test server object', function() {
    testServer = new TestServer();
  });

  it('should create a new test server without default routes', function() {
    testServer = new TestServer(false);
  });

  it('should start a new server on a random port', function() {
    testServer = new TestServer();
    return testServer.startServer('./')
    .then(portNumber => {
      portNumber.should.be.defined;
    });
  });

  it('should start a new server on a random port and serve a known file', function() {
    testServer = new TestServer();
    return testServer.startServer('./')
    .then(portNumber => {
      return fetch(`http://localhost:${portNumber}/README.md`)
      .then(response => {
        response.should.be.defined;
        response.ok.should.equal(true);
      });
    });
  });

  it('should start a new server on a random port and serve a custom route', function() {
    testServer = new TestServer();
    const expressApp = testServer.getExpressApp();
    expressApp.get('/custom-path', function(req, res) {
      res.send('hello-world');
    });
    return testServer.startServer('./')
    .then(portNumber => {
      return fetch(`http://localhost:${portNumber}/custom-path`)
      .then(response => {
        response.should.be.defined;
        response.ok.should.equal(true);
        return response.text();
      })
      .then(responseText => {
        responseText.should.equal('hello-world');
      });
    });
  });

  it('should start a new server on a specific port', function() {
    testServer = new TestServer();
    return testServer.startServer('./', 9158)
    .then(portNumber => {
      portNumber.should.equal(9158);
    });
  });

  it('should start a new server on a specific port and serve a known file', function() {
    testServer = new TestServer();
    return testServer.startServer('./', 9158)
    .then(portNumber => {
      return fetch(`http://localhost:${portNumber}/README.md`)
      .then(response => {
        response.should.be.defined;
        response.ok.should.equal(true);
      });
    });
  });

  it('should start a new server on a specific port and serve a custom route', function() {
    testServer = new TestServer();
    const expressApp = testServer.getExpressApp();
    expressApp.get('/custom-path', function(req, res) {
      res.send('hello-world');
    });
    return testServer.startServer('./', 9158)
    .then(portNumber => {
      return fetch(`http://localhost:${portNumber}/custom-path`)
      .then(response => {
        response.should.be.defined;
        response.ok.should.equal(true);
        return response.text();
      })
      .then(responseText => {
        responseText.should.equal('hello-world');
      });
    });
  });
});
