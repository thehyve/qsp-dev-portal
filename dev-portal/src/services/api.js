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

import { awsRegion } from './aws'
let apiGatewayClient;

/**
 * Initialize the client to the backend lambda.
 * @param accessKeyId AWS.config.credentials accessKeyId
 * @param secretAccessKey AWS.config.credentials secretAccessKey
 * @param sessionToken AWS.config.credentials sessionToken
 * @returns api gateway client.
 */
export function initApiGatewayClient({ accessKeyId, secretAccessKey, sessionToken } = {}) {
  apiGatewayClient = window.apigClientFactory.newClient({
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      sessionToken: sessionToken,
      region: awsRegion
    });
  return apiGatewayClient;
}

/**
 * Get the initialized client to the backend lambda. This will poll until the api gateway client is
 * initialized.
 * @returns {Promise} api gateway client.
 */
export function lookupApiGatewayClient() {
  if (apiGatewayClient) {
    return Promise.resolve(apiGatewayClient);
  }

  const pollMs = 100;
  let retries = 50; // 5 seconds

  return new Promise((resolve, reject) => {
    const poller = window.setInterval(() => {
      if (apiGatewayClient) {
        window.clearInterval(poller);
        resolve(apiGatewayClient)
      } else {
        retries--;
        if (retries === 0) {
          reject({message: 'Failed to update session'});
        }
      }
    }, pollMs);
  })
}
