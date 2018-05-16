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

function callbackToPromise(resolve, reject) {
  return (err, result) => {
    if (err) {
      reject({message: err.message || JSON.stringify(err)});
    }
    resolve(result);
  };
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
  if (!session) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const cognitoLoginKey = getCognitoLoginKey();
    const Logins = {};
    Logins[cognitoLoginKey] = session.getIdToken().getJwtToken();
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: cognitoIdentityPoolId,
      Logins: Logins
    });

    AWS.config.credentials.refresh(callbackToPromise(resolve, reject));
  });
}

export function cognitoSignUp(email, password, attributeList) {
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, null, callbackToPromise(resolve, reject))
  });
}

export function cognitoInitSession() {
  userPool = new CognitoUserPool(poolData);
  cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.resolve(null);
  } else {
    return new Promise((resolve, reject) => {
      cognitoUser.getSession(callbackToPromise(resolve, reject));
    });
  }
}

export function cognitoGetAccountDetails() {
  return new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes(callbackToPromise(resolve, reject));
  });
}

export function cognitoUpdateAccountDetails(attributes) {
  return new Promise((resolve, reject) => {
    let userAttributes = Object.entries(attributes)
        .map(([key, value]) => ({Name: key , Value: value}));

    cognitoUser.updateAttributes(userAttributes, callbackToPromise(resolve, reject));
  });
}

export function cognitoLogout() {
  cognitoUser.signOut();
  cognitoUser = null;
}