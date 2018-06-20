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

import {initApiGatewayClient, lookupApiGatewayClient} from './api'
import { clearSubscriptions } from './api-catalog'
import {
  cognitoAuthenticate, cognitoGetAccountDetails,
  cognitoInitSession,
  cognitoLogout,
  cognitoRefreshCredentials,
  cognitoChangePassword,
  cognitoSignUp, cognitoUpdateAccountDetails, getCognitoUser
} from "./cognito";
import {arrayToObject} from "./util";

/** Whether the current user is logged in.
 * @returns {boolean} true if user is logged in, false otherwise. */
export function isAuthenticated() {
  return !!getCognitoUser();
}

/**
 * Initialize the session and AWS client.
 * @returns {Promise<apiGatewayClient>} gateway client.
 */
export function init() {
  return cognitoInitSession()
      .then(cognitoRefreshCredentials)
      .catch(e => {
        logout();
        throw e;
      })
      .then(initApiGatewayClient);
}

/**
 * Register a new user.
 * @param {string} email email address used as username
 * @param {string} password user password
 * @param {Object.<string, string>} attributes custom properties, e.g., email, name, custom:organisation, custom:apiClient
 * @returns {Promise} backend lambda sign in result.
 */
export function register(email, password, attributes) {
  localStorage.clear();
  const attributeList = Object.keys(attributes)
      .map(k => ({Name: k, Value: attributes[k].trim()}));
  return cognitoSignUp(email, password, attributeList)
      .then(() => login(email, password));
}

/**
 * Log in user.
 * @param {string} email username
 * @param {string} password password
 * @returns {Promise} backend lambda sign in result.
 */
export function login(email, password) {
  return cognitoAuthenticate(email, password)
      .then(cognitoRefreshCredentials)
      .then(initApiGatewayClient)
      .then(client => client.post('/signin', {}, {}, {}));
}

/**
 * Get the current user's account details.
 * @returns {Promise} attribute map.
 */
export function getAccountDetails() {
  return cognitoGetAccountDetails()
      .then(result => arrayToObject(result, d => d.getName(), d => d.getValue()));
}

/**
 * Update the current user's account details.
 * @param {Object} input attribute map.
 * @returns {Promise} attribute map after updating.
 */
export function updateUserDetails(input) {
  return cognitoUpdateAccountDetails(input)
      .then(resetApiKeyName)
      .then(getAccountDetails);
}

/**
 * Update the current user's account details.
 * @param {string} oldPassword old password
 * @param {string} newPassword new password
 * @returns {Promise<string>} promise containing 'SUCCESS'
 */
export function changePassword(oldPassword, newPassword) {
  return cognitoChangePassword(oldPassword, newPassword);
}

/**
 * Log out.
 */
export function logout() {
  cognitoLogout();
  clearSubscriptions();
  localStorage.clear()
}

/**
 * Get the API key of the current user
 * @returns {Promise} api key object with optional id, name and value properties.
 */
export function getApiKey() {
  return lookupApiGatewayClient()
      .then(client => client.get('/apikey', {}, {}, {}))
      .then(({data}) => data);
}

/**
 * Reset the name of an API key of the current user.
 * @returns {Promise} api key object with optional id, name and value properties.
 */
function resetApiKeyName() {
  return lookupApiGatewayClient()
      .then(client => client.post('/apikey/reset-name', {}, {}, {}));
}

