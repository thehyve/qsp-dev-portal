/*
 * Copyright (c) 2018 The Hyve B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const tap = require('tap');
const mergeOptions = require('merge-options');

const lambdaFunction = require('../index');
const apiGatewayEvent = require('../scripts/api-gateway-event.json');

let server = null;

/**
 * Make a request to the API.
 *
 * @param apiGatewayUpdate updated properties of the event defined in api-gateway-event.
 * @returns {Promise<{statusCode, body, headers, isBase64Encoded}>} response
 */
function makeRequest(apiGatewayUpdate) {
  return new Promise(resolve => {
    if (apiGatewayUpdate.path && !apiGatewayUpdate.resource) {
      apiGatewayUpdate.resource = apiGatewayUpdate.path;
    }
    let event = mergeOptions(apiGatewayEvent, apiGatewayUpdate);
    server = lambdaFunction.handler(event, {
      succeed: (data) => {
        resolve(data);
      }
    });
  });
}

/**
 * Use tap to test the outcome of a promise.
 * @param name test name
 * @param callback test callback.
 */
function testPromise(name, callback) {
  tap.test(name, test => {
    callback(test)
        .then(() => test.end())
        .catch((v) => {
          test.fail(v);
          test.end();
        });
  });
}

testPromise('sign in', test => {
  let request = {
    httpMethod: 'POST',
    path: '/signin'
  };
  return makeRequest(request)
      .then(res => test.equal(res.statusCode, 200, "sign in failed", res));
});

testPromise('fail sign in without credentails', test => {
  let request = {
    httpMethod: 'POST',
    path: '/signin',
    requestContext: {
      identity: {
        cognitoIdentityId: null,
      }
    }
  };
  return makeRequest(request)
      .then(res => test.equal(res.statusCode, 500, "sign in without identity succeeded", res));
});

testPromise('catalog', test => {
  let request = {
    httpMethod: 'GET',
    path: '/catalog',
    "//body": null,
    requestContext: {
      identity: {
        cognitoIdentityId: null,
      }
    }
  };
  return makeRequest(request)
      .then(res => test.equal(res.statusCode, 200, "get catalog failed", res));
});


testPromise('subscriptions', test => {
  let request = {
    httpMethod: 'GET',
    path: '/subscriptions',
  };
  return makeRequest(request)
      .then(res => test.equal(res.statusCode, 200, "get subscriptions failed", res));
});

testPromise('subscriptions unsubscribe', test => {
  let request = {
    httpMethod: 'DELETE',
    path: '/subscriptions/b04or5',
  };
  // do not test outcome, we aren't interested in the result.
  return makeRequest(request)
      .then(res => {
        test.equal(res.statusCode, 204, "delete subscription failed", res);
        console.log(res.headers);
      });
});

testPromise('subscriptions subscribe', test => {
  let request = {
    httpMethod: 'PUT',
    path: '/subscriptions/b04or5',
  };
  return makeRequest(request)
      .then(res => test.equal(res.statusCode, 201, "create subscription failed", res));
});

testPromise('subscriptions usage', test => {
  let request = {
    httpMethod: 'GET',
    path: '/subscriptions/b04or5/usage',
    queryStringParameters: {
      start: '2018-05-01',
      end: '2018-05-31',
    }
  };
  return makeRequest(request)
      .then(res => test.equal(res.statusCode, 200, "get subscription usage failed", res));
});


testPromise('subscriptions unsubscribe', test => {
  let request = {
    httpMethod: 'DELETE',
    path: '/subscriptions/b04or5',
  };
  return makeRequest(request)
      .then(res => {
        test.equal(res.statusCode, 204, "delete subscription failed", res);
        console.log(res);
      });
});

testPromise('reset API key', test => {
  let request = {
    httpMethod: 'POST',
    path: '/apikey/reset-name',
  };
  return makeRequest(request)
      .then(res => {
        test.equal(res.statusCode, 200, 'reset API key name failed', res);
        test.match(JSON.parse(res.body).name, /^.+:.+@.+$/, 'API key name does not contain username', res);
      });
});

testPromise('close server', () => Promise.resolve(server.close()));
