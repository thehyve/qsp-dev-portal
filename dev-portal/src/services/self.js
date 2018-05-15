import { initApiGatewayClient, apiGatewayClient } from './api'
import { clearSubscriptions } from './api-catalog'
import {
  cognitoAuthenticate, cognitoGetAccountDetails,
  cognitoInitSession,
  cognitoLogout,
  cognitoRefreshCredentials,
  cognitoSignUp, cognitoUpdateAccountDetails, getCognitoUser
} from "./cognito";

export function init() {
  cognitoInitSession()
      .then(cognitoRefreshCredentials)
      .then(initApiGatewayClient);
}

export function register(email, password, attributeList) {
  localStorage.clear();
  return cognitoSignUp(email, password, attributeList)
      .then(() => login(email, password));
}

export function login(email, password) {
  return cognitoAuthenticate(email, password)
      .then(cognitoRefreshCredentials)
      .then(initApiGatewayClient)
      .then(client => client.post('/signin', {}, {}, {}));
}

export function getAccountDetails() {
  return cognitoGetAccountDetails()
      .then(result => {
        let userCredentials = {};
        result.forEach(d => {
          userCredentials[d.getName()] = d.getValue();
        });
        return userCredentials;
      });
}

export function updateUserDetails(input) {
  return cognitoUpdateAccountDetails(input)
      .then(cognitoGetAccountDetails);
}

export function logout() {
  cognitoLogout();
  clearSubscriptions();
  localStorage.clear()
}

export function getApiKey() {
  return apiGatewayClient.get('/apikey', {}, {}, {})
      .then(({data}) => data);
}

export function resetApiKeyName() {
  return apiGatewayClient.post('/apikey/reset-name', {}, {}, {});
}

export function isAuthenticated() {
  return !!getCognitoUser();
}
