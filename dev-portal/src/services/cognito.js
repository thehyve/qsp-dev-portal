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

import AWS from 'aws-sdk/global'
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
import {cognitoClientId, cognitoIdentityPoolId, cognitoRegion, cognitoUserPoolId} from './aws';

export function getCognitoUser() {
  return cognitoUser
}

const poolData = {
  UserPoolId: cognitoUserPoolId,
  ClientId: cognitoClientId
};

let cognitoUser;
let userPool;

function getCognitoLoginKey() {
  return `cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`
}



/**
 * This callback type is used by cognito to get responses.
 *
 * @callback cognitoCallback
 * @param {{message: string}} err
 * @param {*} result
 */

/**
 * Function that takes a cognitoCallback and internally calls a cognito function that uses that
 * callback.
 *
 * @callback cognitoPromiseCallback
 * @param {cognitoCallback} callback
 */

/** Maps a err, result callback to a promise.
 * @param {cognitoPromiseCallback} callback
 * @returns {Promise} promise that will resolve to what cognito returns in the callback. */
function callbackToPromise(callback) {
  return new Promise((resolve, reject) => {
    callback((err, result) => {
      if (err) {
        reject({message: err.message || JSON.stringify(err)});
      }
      resolve(result)
    });
  });
}

export function cognitoAuthenticate(email, password) {
  const authenticationData = {
    Username: email,
    Password: password
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  userPool = new CognitoUserPool(poolData);
  const userData = {
    Username: email,
    Pool: userPool
  };

  cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: resolve,
      onFailure: reject,
    })
  })
}

export function cognitoRefreshCredentials(session) {
  if (session) {
    return refreshSession(session)
        .then(() => AWS.config.credentials);
  } else {
    return Promise.resolve();
  }
}

function refreshSession(session) {
  return callbackToPromise(callback => {
    const cognitoLoginKey = getCognitoLoginKey();
    const Logins = {};
    Logins[cognitoLoginKey] = session.getIdToken().getJwtToken();
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: cognitoIdentityPoolId,
      Logins: Logins
    });

    AWS.config.credentials.refresh(callback);
  });
}

export function cognitoSignUp(email, password, attributeList) {
  return callbackToPromise(callback => userPool.signUp(email, password, attributeList, null, callback));
}

export function cognitoInitSession() {
  userPool = new CognitoUserPool(poolData);
  cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.resolve(null);
  } else {
    return callbackToPromise(callback => cognitoUser.getSession(callback));
  }
}

export function cognitoGetAccountDetails() {
  return callbackToPromise(callback => cognitoUser.getUserAttributes(callback));
}

export function cognitoUpdateAccountDetails(attributes) {
  return callbackToPromise(callback => {
    let userAttributes = Object.entries(attributes)
        .map(([key, value]) => ({Name: key , Value: value}));

    cognitoUser.updateAttributes(userAttributes, callback);
  });
}

export function cognitoChangePassword(oldPassword, newPassword) {
  return callbackToPromise(callback => cognitoUser.changePassword(oldPassword, newPassword, callback));
}

export function cognitoLogout() {
  cognitoUser.signOut();
  cognitoUser = null;
}
