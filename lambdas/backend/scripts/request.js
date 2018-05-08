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

const lambdaFunction = require('../index');
const apiGatewayEvent = require('./api-gateway-event.json');

if (process.argv.length > 2) {
  let apiGatewayUpdate = JSON.parse(process.argv[2]);
  if (apiGatewayUpdate.path && !apiGatewayUpdate.resource) {
    apiGatewayUpdate.resource = apiGatewayUpdate.path;
  }
  Object.assign(apiGatewayEvent, apiGatewayUpdate);
}

const server = lambdaFunction.handler(apiGatewayEvent, {
  succeed: v => {
    console.error(JSON.stringify(v));
    process.exit(0)
  }
}, (e, v) => {
  console.error(v);
  process.exit(1)
});

process.stdin.resume();

function exitHandler(options, err) {
  if (options.cleanup && server && server.close ) {
    server.close()
  }

  if (err) console.error(err.stack);
  if (options.exit) process.exit()
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true })); // ctrl+c event
process.on('SIGTSTP', exitHandler.bind(null, { exit: true })); // ctrl+v event
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
